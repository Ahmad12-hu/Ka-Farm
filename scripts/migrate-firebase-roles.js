#!/usr/bin/env node

/**
 * Script de migration des rôles KA Farm - Firestore users/{uid}
 *
 * Crée (ou met à jour) les documents Firestore `users/{uid}` pour chacun des
 * comptes Firebase Auth migrés, afin que `requireAuth` (serveur) puisse lire
 * le rôle et le contexte exploitation d'un utilisateur après validation de son
 * ID token Firebase.
 *
 * Collection cible : `users/{uid}` (doc keyed par l'UID Firebase Auth)
 * Champs : { role, name, email, enterpriseId, enterpriseName, enterpriseCode }
 *
 * Les UIDs sont résolus automatiquement par email depuis Firebase Auth : aucun
 * besoin de connaître les UIDs à l'avance.
 *
 * Usage:
 *   node scripts/migrate-firebase-roles.js                    # Mode dry-run (défaut)
 *   node scripts/migrate-firebase-roles.js --execute           # Écrit dans Firestore
 *   node scripts/migrate-firebase-roles.js --dry-run           # Mode dry-run explicite
 *   node scripts/migrate-firebase-roles.js --service-account ./mon-compte.json
 *   node scripts/migrate-firebase-roles.js --users ./mes-utilisateurs.json
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

// ============================================================================
// Configuration
// ============================================================================
const CONFIG = {
  serviceAccountPath:
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json",
  usersPath: process.env.KA_FARM_USERS_JSON || "",
  dryRun: true,
  projectId: null,
};

// Mapping par défaut des 5 comptes migrés (email -> profil).
// Surchargez avec --users ./fichier.json (format : array d'objets email+role).
const DEFAULT_USERS = [
  { email: "admin@kafarm.sn", role: "Admin", name: "Administrateur KA Farm" },
  { email: "gestionnaire@kafarm.sn", role: "Gestionnaire", name: "Gestionnaire KA Farm" },
  { email: "ouvrier@kafarm.sn", role: "Ouvrier", name: "Ouvrier KA Farm" },
  { email: "bureau@kafarm.sn", role: "Bureau", name: "Bureau KA Farm" },
  { email: "conseiller@kafarm.sn", role: "Conseiller", name: "Conseiller KA Farm" },
];

// Contexte exploitation par défaut (surchargeable par profil)
const DEFAULT_ENTERPRISE = {
  enterpriseId: "ka_farm",
  enterpriseName: "KA Farm",
  enterpriseCode: "KA-FARM",
};

// ============================================================================
// Parse des arguments de ligne de commande
// ============================================================================
function parseArgs() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--execute":
        CONFIG.dryRun = false;
        break;
      case "--dry-run":
        CONFIG.dryRun = true;
        break;
      case "--service-account":
        CONFIG.serviceAccountPath = args[++i];
        break;
      case "--users":
        CONFIG.usersPath = args[++i];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }
}

function printHelp() {
  console.log(`
Script de migration des rôles KA Farm - Firestore users/{uid}

Usage:
  node scripts/migrate-firebase-roles.js [options]

Options:
  --execute              Écrit dans Firestore (défaut: dry-run)
  --dry-run              Mode test (aucune écriture)
  --service-account PATH Chemin vers le service account (défaut: ./firebase-service-account.json)
  --users PATH           Fichier JSON de profils (array d'objets avec email + role)

Exemples:
  node scripts/migrate-firebase-roles.js
  node scripts/migrate-firebase-roles.js --execute
  node scripts/migrate-firebase-roles.js --execute --users ./equipe.json
`);
}

// ============================================================================
// État Firebase Admin
// ============================================================================
let db = null;
let adminAuth = null;

function loadServiceAccount() {
  // 1. Variable d'env (recommandée pour CI/Vercel)
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) return JSON.parse(envKey);

  // 2. Fichier local
  if (fs.existsSync(CONFIG.serviceAccountPath)) {
    return JSON.parse(fs.readFileSync(CONFIG.serviceAccountPath, "utf8"));
  }

  return null;
}

function loadUsers() {
  if (CONFIG.usersPath && fs.existsSync(CONFIG.usersPath)) {
    const list = JSON.parse(fs.readFileSync(CONFIG.usersPath, "utf8"));
    if (Array.isArray(list) && list.length) {
      logger.info(`Utilisateurs chargés depuis ${CONFIG.usersPath}: ${list.length}`);
      return list;
    }
  }

  logger.info(`Utilisation du mapping par défaut (${DEFAULT_USERS.length} utilisateurs)`);
  return DEFAULT_USERS;
}

function initializeFirebase() {
  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      logger.error(
        "Service account introuvable.\n" +
          "  Option 1: définissez FIREBASE_SERVICE_ACCOUNT_KEY (variable d'env)\n" +
          `  Option 2: créez ${CONFIG.serviceAccountPath}\n` +
          "  À télécharger depuis Firebase Console > Paramètres > Comptes de service."
      );
      return false;
    }

    const app = initializeApp({ credential: cert(serviceAccount) });
    db = getFirestore(app);
    adminAuth = getAuth(app);
    CONFIG.projectId = serviceAccount.project_id || serviceAccount.projectId;
    logger.success(`Firebase Admin SDK initialisé (${CONFIG.projectId})`);
    return true;
  } catch (error) {
    logger.error(`Échec de l'initialisation Firebase: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Résolution email -> uid + écriture des docs users/{uid}
// ============================================================================
async function resolveUidByEmail(email) {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return userRecord.uid;
  } catch {
    return null;
  }
}

async function upsertUserRole(profile) {
  const uid = await resolveUidByEmail(profile.email);
  if (!uid) {
    logger.warning(`Aucun compte Firebase Auth pour ${profile.email} — doc ignoré`);
    return { status: "missing", email: profile.email };
  }

  const data = {
    role: profile.role,
    name: profile.name || profile.email,
    email: profile.email,
    enterpriseId: profile.enterpriseId || DEFAULT_ENTERPRISE.enterpriseId,
    enterpriseName: profile.enterpriseName || DEFAULT_ENTERPRISE.enterpriseName,
    enterpriseCode: profile.enterpriseCode || DEFAULT_ENTERPRISE.enterpriseCode,
    updatedAt: new Date().toISOString(),
  };

  if (CONFIG.dryRun) {
    logger.info(`[DRY-RUN] users/${uid} -> ${data.role} (${profile.email})`);
    return { status: "dry-run", uid, email: profile.email };
  }

  const ref = db.collection("users").doc(uid);
  await ref.set(data, { merge: true });
  logger.success(`users/${uid} mis à jour (${profile.email} -> ${data.role})`);
  return { status: "written", uid, email: profile.email };
}

// ============================================================================
// Exécution principale
// ============================================================================
async function main() {
  console.log("\n" + "=".repeat(64));
  console.log("  Script de Migration des Rôles KA Farm (users/{uid})");
  console.log("=".repeat(64));

  parseArgs();

  console.log("\nConfiguration:");
  console.log(
    JSON.stringify(
      {
        mode: CONFIG.dryRun ? "DRY-RUN (test)" : "EXÉCUTION (réel)",
        serviceAccountPath: CONFIG.serviceAccountPath,
        usersPath: CONFIG.usersPath || "(défaut)",
      },
      null,
      2
    )
  );

  if (!initializeFirebase()) {
    logger.error("Impossible de continuer sans Firebase");
    process.exit(1);
  }

  const users = loadUsers();

  if (CONFIG.dryRun) {
    logger.warning("MODE DRY-RUN ACTIF — aucune écriture effective");
  } else {
    logger.warning("MODE EXÉCUTION ACTIF — les docs Firestore seront modifiés");
    console.log("Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const startTime = Date.now();
  const results = [];
  for (const profile of users) {
    results.push(await upsertUserRole(profile));
  }

  const written = results.filter((r) => r.status === "written").length;
  const missing = results.filter((r) => r.status === "missing").length;
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n" + "=".repeat(64));
  console.log("  RÉSUMÉ");
  console.log("=".repeat(64));
  console.log(`
Mode:        ${CONFIG.dryRun ? "DRY-RUN (test)" : "EXÉCUTION (réel)"}
Utilisateurs:${results.length}
Écrits:      ${written}
Manquants:   ${missing}
Durée:       ${duration}s
`);

  if (missing > 0) {
    logger.warning(
      `${missing} utilisateur(s) sans compte Firebase Auth. Vérifiez les emails ou créez les comptes.`
    );
  }

  if (CONFIG.dryRun) {
    logger.warning("MODE DRY-RUN: aucune modification effectuée");
    console.log("Pour exécuter la migration réelle: node scripts/migrate-firebase-roles.js --execute");
  } else {
    logger.success("Migration terminée !");
  }

  process.exit(missing > 0 ? 1 : 0);
}

process.on("unhandledRejection", (error) => {
  logger.error(`Erreur non gérée: ${error.message}`);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("\n\nMigration interrompue par l'utilisateur");
  process.exit(0);
});

main().catch((error) => {
  logger.error(`Erreur fatale: ${error.message}`);
  process.exit(1);
});

