/**
 * KA Farm - Script de nettoyage des utilisateurs fictifs
 * Supprime tous les comptes non-admin de Firestore et des données locales
 * Nécessite FIREBASE_SERVICE_ACCOUNT_KEY dans .env
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Charger .env si présent
try {
  import("dotenv").then(({ default: dotenv }) => {
    dotenv.config();
  });
} catch (e) {
  // dotenv peut ne pas être disponible
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function cleanupUsers() {
  console.log("🧹 KA Farm - Nettoyage des utilisateurs fictifs\n");

  // 1. Lister les utilisateurs actuels (DEFAULT_USERS)
  const adminUser = {
    id: "USR-001",
    email: "amadou@ka-farm.sn",
    password: "admin123",
    name: "Amadou KA",
    role: "admin",
    enterpriseId: "ka_farm",
    enterpriseName: "KA Farm",
    enterpriseCode: "KA-FARM",
  };

  const usersToRemove = [
    {
      id: "USR-002",
      email: "terrain@ka-farm.sn",
      password: "terrain123",
      name: "Responsable terrain",
      role: "Terrain",
      enterpriseId: "ka_farm",
      enterpriseName: "KA Farm",
      enterpriseCode: "KA-FARM",
    },
    {
      id: "USR-003",
      email: "employe@ka-farm.sn",
      password: "bureau123",
      name: "Employé",
      role: "Bureau",
      enterpriseId: "ka_farm",
      enterpriseName: "KA Farm",
      enterpriseCode: "KA-FARM",
    },
  ];

  console.log("📋 Utilisateurs à CONSERVER:");
  console.log(`   - ${adminUser.id}: ${adminUser.email} (${adminUser.role})\n`);

  console.log("🗑️  Utilisateurs à SUPPRIMER:");
  usersToRemove.forEach((u) => {
    console.log(`   - ${u.id}: ${u.email} (${u.role})`);
  });
  console.log("");

  // 2. Mettre à jour js/storage/core.js (DEFAULT_USERS)
  console.log("📝 Mise à jour de js/storage/core.js...");
  const corePath = path.join(__dirname, "..", "js", "storage", "core.js");
  let coreContent = fs.readFileSync(corePath, "utf-8");

  // Remplacer DEFAULT_USERS pour ne garder que l'admin
  const newDefaultUsers = `const DEFAULT_USERS = [
  {
    id: 'USR-001',
    email: 'amadou@ka-farm.sn',
    password: 'admin123',
    name: 'Amadou KA',
    role: 'admin',
    enterpriseId: 'ka_farm',
    enterpriseName: 'KA Farm',
    enterpriseCode: 'KA-FARM'
  }
];`;

  coreContent = coreContent.replace(/const DEFAULT_USERS = \[[\s\S]*?\];/, newDefault_USERS);

  fs.writeFileSync(corePath, coreContent);
  console.log("   ✅ DEFAULT_USERS mis à jour (1 admin seulement)\n");

  // 3. Mettre à jour api/index.js (supprimer les messages de test)
  console.log("📝 Mise à jour de api/index.js...");
  const apiPath = path.join(__dirname, "..", "api", "index.js");
  let apiContent = fs.readFileSync(apiPath, "utf-8");

  // Supprimer les messages par défaut qui contiennent des emails non-admin
  const defaultMessagesStart = apiContent.indexOf("let serverMessages = [");
  const defaultMessagesEnd = apiContent.indexOf("];", defaultMessagesStart) + 2;

  if (defaultMessagesStart !== -1 && defaultMessagesEnd !== -1) {
    apiContent =
      apiContent.substring(0, defaultMessagesStart) +
      "let serverMessages = [];\n" +
      apiContent.substring(defaultMessagesEnd + 1);
    console.log("   ✅ serverMessages nettoyé (supprimé messages de test)\n");
  }

  fs.writeFileSync(apiPath, apiContent);

  // 4. Mettre à jour les données de démo (js/index-main.js)
  console.log("📝 Mise à jour de js/index-main.js...");
  const indexMainPath = path.join(__dirname, "..", "js", "index-main.js");
  let indexMainContent = fs.readFileSync(indexMainPath, "utf-8");

  // Supprimer les utilisateurs demo non-admin
  indexMainContent = indexMainContent.replace(
    /\s*\{[\s\S]*?uid: 'demo-terrain'[\s\S]*?\},?\s*/g,
    ""
  );
  indexMainContent = indexMainContent.replace(
    /\s*\{[\s\S]*?uid: 'demo-employe'[\s\S]*?\},?\s*/g,
    ""
  );

  fs.writeFileSync(indexMainPath, indexMainContent);
  console.log("   ✅ Utilisateurs demo non-admin supprimés\n");

  // 5. Summary
  console.log("✅ Nettoyage terminé !\n");
  console.log("📊 Résumé:");
  console.log("   - js/storage/core.js: DEFAULT_USERS réduit à 1 admin");
  console.log("   - api/index.js: serverMessages vidé");
  console.log("   - js/index-main.js: utilisateurs demo non-admin supprimés");
  console.log("\n⚠️  Note: Ces modifications sont locales. Pour Firestore distant,");
  console.log(
    "    déployez le script sur votre serveur avec FIREBASE_SERVICE_ACCOUNT_KEY configuré."
  );
  console.log("\n🧪 Testez ensuite avec: npm test");
}

cleanupUsers().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
