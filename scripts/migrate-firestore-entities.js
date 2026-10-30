#!/usr/bin/env node

/**
 * KA Farm — Migration Firestore : tableau hérité -> un document par entité
 * ----------------------------------------------------------------------------
 * L'application migre automatiquement une collection à sa première écriture
 * (voir `ensureCollectionMigrated` dans api/index.js). Ce script permet de le
 * faire explicitement, pour toutes les exploitations, sans attendre une écriture.
 *
 * Pour chaque collection et chaque exploitation (`app_data/{enterpriseId}`) :
 *   1. lit le document tableau `data` (modèle hérité) ;
 *   2. écrit un document par enregistrement `app_data/{ent}/{collection}/{id}` ;
 *   3. pose le marqueur `__meta` ;
 *   4. supprime le document tableau.
 *
 * Idempotent : les collections déjà migrées (`__meta` présent) sont ignorées.
 *
 * Usage :
 *   node scripts/migrate-firestore-entities.js                # dry-run (défaut)
 *   node scripts/migrate-firestore-entities.js --execute      # écrit réellement
 *   node scripts/migrate-firestore-entities.js --enterprise ka_farm --execute
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const COLLECTIONS = [
  "crops",
  "parcelles",
  "tasks",
  "finances",
  "employees",
  "cheptel",
  "elevage_production",
  "elevage_health",
  "treatments",
  "crop_profits",
  "messages",
  "stocks",
];

const META_DOC_ID = "__meta";
const LEGACY_DATA_DOC_ID = "data";

const CONFIG = {
  execute: false,
  enterprise: null,
  serviceAccountPath:
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json",
};

function parseArgs() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--execute") CONFIG.execute = true;
    else if (args[i] === "--enterprise") CONFIG.enterprise = args[++i];
    else if (args[i] === "--service-account") CONFIG.serviceAccountPath = args[++i];
  }
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  }
  if (fs.existsSync(CONFIG.serviceAccountPath)) {
    return JSON.parse(fs.readFileSync(CONFIG.serviceAccountPath, "utf8"));
  }
  return null;
}

async function listEnterpriseIds(db) {
  if (CONFIG.enterprise) return [CONFIG.enterprise];
  const refs = await db.collection("app_data").listDocuments();
  return refs.map((ref) => ref.id);
}

async function migrateCollection(db, enterpriseId, collection) {
  const colRef = db.collection("app_data").doc(enterpriseId).collection(collection);
  const meta = await colRef.doc(META_DOC_ID).get();
  if (meta.exists) return { collection, status: "déjà migrée" };

  const legacy = await colRef.doc(LEGACY_DATA_DOC_ID).get();
  if (!legacy.exists) return { collection, status: "rien à migrer" };

  const items = legacy.data().data || [];
  const count = items.filter((e) => e && e.id !== undefined && e.id !== null).length;

  if (!CONFIG.execute) {
    return { collection, status: `à migrer (${count} entités) [dry-run]` };
  }

  for (const entity of items) {
    if (entity && entity.id !== undefined && entity.id !== null) {
      await colRef.doc(String(entity.id)).set(entity);
    }
  }
  await colRef
    .doc(META_DOC_ID)
    .set({ model: "entity", migratedAt: new Date().toISOString() });
  await colRef.doc(LEGACY_DATA_DOC_ID).delete();

  return { collection, status: `migrée (${count} entités)` };
}

async function main() {
  parseArgs();
  console.log(`\nMigration Firestore — mode ${CONFIG.execute ? "EXÉCUTION" : "DRY-RUN"}\n`);

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.error(
      "Service account introuvable. Définissez FIREBASE_SERVICE_ACCOUNT_KEY ou créez " +
        CONFIG.serviceAccountPath
    );
    process.exit(1);
  }

  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);

  const enterpriseIds = await listEnterpriseIds(db);
  if (enterpriseIds.length === 0) {
    console.log("Aucune exploitation trouvée sous app_data/.");
    process.exit(0);
  }

  for (const enterpriseId of enterpriseIds) {
    console.log(`\nExploitation : ${enterpriseId}`);
    for (const collection of COLLECTIONS) {
      const result = await migrateCollection(db, enterpriseId, collection);
      console.log(`  - ${result.collection.padEnd(20)} ${result.status}`);
    }
  }

  console.log(
    CONFIG.execute
      ? "\nMigration terminée.\n"
      : "\nDRY-RUN : relancez avec --execute pour écrire.\n"
  );
}

main().catch((error) => {
  console.error(`Erreur fatale : ${error.message}`);
  process.exit(1);
});
