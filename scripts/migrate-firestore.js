#!/usr/bin/env node

/**
 * Script de migration Firestore - KA Farm
 * Migre les données de app_data/{collection} vers app_data/{enterpriseId}/{collection}/data
 *
 * Usage:
 *   node scripts/migrate-firestore.js                    # Mode dry-run (par défaut)
 *   node scripts/migrate-firestore.js --execute           # Exécute la migration
 *   node scripts/migrate-firestore.js --dry-run           # Mode dry-run explicite
 *   node scripts/migrate-firestore.js --enterprise-id mon_entreprise  # ID d'entreprise personnalisé
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const CONFIG = {
  // Chemin vers le fichier de service account (peut être surchargé par --service-account)
  // Supporte aussi FIREBASE_SERVICE_ACCOUNT_PATH (fichier) ou FIREBASE_SERVICE_ACCOUNT_KEY (variable env)
  serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json',

  // ID d'entreprise par défaut (peut être surcharge par --enterprise-id)
  enterpriseId: process.env.ENTERPRISE_ID || 'ka_farm',

  // Collections à migrer
  collections: [
    'crops',
    'parcelles',
    'tasks',
    'finances',
    'employees',
    'cheptel',
    'elevage_production',
    'elevage_health',
    'treatments',
    'crop_profits',
    'messages',
    'stocks',
    'attendance',
    'employee_payments'
  ],

  // Mode dry-run par défaut (sécurisé)
  dryRun: true,

  // Taille du batch pour les écritures
  batchSize: 100,

  // Délai entre les batches (ms) pour éviter le rate limiting
  batchDelay: 500
};

// Parse des arguments de ligne de commande
function parseArgs() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--execute':
        CONFIG.dryRun = false;
        break;
      case '--dry-run':
        CONFIG.dryRun = true;
        break;
      case '--enterprise-id':
        CONFIG.enterpriseId = args[++i];
        break;
      case '--service-account':
        CONFIG.serviceAccountPath = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }
}

function printHelp() {
  console.log(`
Script de migration Firestore - KA Farm

Usage:
  node scripts/migrate-firestore.js [options]

Options:
  --execute              Exécute la migration (par défaut: dry-run)
  --dry-run              Mode dry-run (test sans écriture)
  --enterprise-id ID     ID d'entreprise personnalisé (défaut: ka_farm)
  --service-account PATH Chemin vers le fichier service account (défaut: ./firebase-service-account.json)
  --help, -h             Affiche cette aide

Exemples:
  # Test en dry-run (sécurisé)
  node scripts/migrate-firestore.js

  # Migration avec ID personnalisé
  node scripts/migrate-firestore.js --execute --enterprise-id ma_ferme

  # Migration avec service account personnalisé
  node scripts/migrate-firestore.js --execute --service-account ./mon-compte.json
`);
}

// Logger avec timestamp
const logger = {
  info: (message, data = {}) => {
    console.log(`\n[INFO] ${new Date().toISOString()} - ${message}`);
    if (Object.keys(data).length > 0) {
      console.log(JSON.stringify(data, null, 2));
    }
  },

  success: (message, data = {}) => {
    console.log(`\n[SUCCESS] ${new Date().toISOString()} - ${message}`);
    if (Object.keys(data).length > 0) {
      console.log(JSON.stringify(data, null, 2));
    }
  },

  warning: (message) => {
    console.warn(`\n[WARNING] ${new Date().toISOString()} - ${message}`);
  },

  error: (message, error = null) => {
    console.error(`\n[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error('Details:', error.message || error);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
    }
  },

  doc: (collection, docId, action, details = {}) => {
    console.log(`  [${collection}] ${action} ${docId}`);
    if (Object.keys(details).length > 0) {
      console.log(`    Details: ${JSON.stringify(details)}`);
    }
  }
};

// Statistiques
const stats = {
  totalCollections: 0,
  totalDocuments: 0,
  migratedDocuments: 0,
  skippedDocuments: 0,
  failedDocuments: 0,
  errors: []
};

// Initialisation Firebase Admin
let db;
function initializeFirebase() {
  try {
    let serviceAccount;

    // Méthode 1: Variable d'environnement FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (e) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY contient du JSON invalide');
      }
    }
    // Méthode 2: Fichier service account
    else if (fs.existsSync(CONFIG.serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(CONFIG.serviceAccountPath, 'utf8'));
    }
    else {
      throw new Error(
        `Service account introuvable.\n` +
        `Option 1: Définissez FIREBASE_SERVICE_ACCOUNT_KEY dans .env (recommandé pour Vercel)\n` +
        `Option 2: Créez un fichier ${CONFIG.serviceAccountPath}\n` +
        `Téléchargez-le depuis Firebase Console > Paramètres > Comptes de service`
      );
    }

    // Initialiser Firebase Admin
    const app = initializeApp({
      credential: cert(serviceAccount)
    });

    db = getFirestore(app);

    logger.success('Firebase Admin SDK initialisé', {
      projectId: serviceAccount.project_id || serviceAccount.projectId,
      enterpriseId: CONFIG.enterpriseId,
      mode: CONFIG.dryRun ? 'DRY-RUN' : 'EXECUTE'
    });

    return true;
  } catch (error) {
    logger.error('Échec de l\'initialisation Firebase', error);
    return false;
  }
}

// Lit tous les documents d'une collection
async function readCollection(collectionName) {
  const documents = [];
  let snapshot;

  try {
    // Lecture depuis l'ancien chemin: app_data/{collection}
    const oldRef = db.collection('app_data').doc(collectionName);
    const docSnap = await oldRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (data && Array.isArray(data.data)) {
        documents.push(...data.data);
      }
    }

    // Vérifier aussi le nouveau chemin pour éviter les doublons
    const newRef = db.collection('app_data')
      .doc(CONFIG.enterpriseId)
      .collection(collectionName)
      .doc('data');
    const newDocSnap = await newRef.get();

    if (newDocSnap.exists) {
      const newData = newDocSnap.data();
      if (newData && Array.isArray(newData.data)) {
        const existingIds = new Set(documents.map(d => d.id));
        newData.data.forEach(doc => {
          if (!existingIds.has(doc.id)) {
            documents.push(doc);
          }
        });
      }
    }

    return documents;
  } catch (error) {
    logger.error(`Erreur lecture collection ${collectionName}`, error);
    return [];
  }
}

// Écrit un document dans le nouveau chemin
async function writeDocument(collectionName, document) {
  try {
    const newRef = db.collection('app_data')
      .doc(CONFIG.enterpriseId)
      .collection(collectionName)
      .doc('data');

    await newRef.set({
      data: [document],
      updatedAt: new Date().toISOString()
    });

    logger.doc(collectionName, document.id, 'ÉCRIT', {
      enterpriseId: CONFIG.enterpriseId
    });

    return true;
  } catch (error) {
    logger.error(`Erreur écriture document ${document.id} dans ${collectionName}`, error);
    return false;
  }
}

// Migre une collection entière
async function migrateCollection(collectionName) {
  logger.info(`\n${'='.repeat(60)}`);
  logger.info(`Migration de la collection: ${collectionName}`);
  logger.info(`${'='.repeat(60)}`);

  try {
    // 1. Lecture des documents
    const documents = await readCollection(collectionName);

    if (documents.length === 0) {
      logger.warning(`Collection ${collectionName}: aucun document trouvé`);
      return { total: 0, migrated: 0, skipped: 0, failed: 0 };
    }

    logger.info(`Collection ${collectionName}: ${documents.length} document(s) trouvé(s)`);

    // 2. Migration en batch
    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      if (!doc.id) {
        logger.warning(`Document sans ID ignoré dans ${collectionName}`);
        skipped++;
        continue;
      }

      if (CONFIG.dryRun) {
        logger.doc(collectionName, doc.id, '[DRY-RUN] Migrer', {
          description: doc.description || doc.name || doc.title || 'N/A'
        });
        migrated++;
      } else {
        const success = await writeDocument(collectionName, doc);
        if (success) {
          migrated++;
        } else {
          failed++;
          stats.errors.push({
            collection: collectionName,
            documentId: doc.id,
            error: 'Échec de l\'écriture'
          });
        }
      }

      // Progression tous les 10 documents
      if ((i + 1) % 10 === 0) {
        console.log(`\n  Progression: ${i + 1}/${documents.length} documents traités...`);
      }
    }

    // 3. Résumé de la collection
    logger.info(`\nRésumé ${collectionName}:`, {
      total: documents.length,
      migrated,
      skipped,
      failed
    });

    return { total: documents.length, migrated, skipped, failed };

  } catch (error) {
    logger.error(`Erreur lors de la migration de ${collectionName}`, error);
    return { total: 0, migrated: 0, skipped: 0, failed: 0 };
  }
}

// Fonction principale
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  Script de Migration Firestore - KA Farm');
  console.log('='.repeat(60));

  // Parse des arguments
  parseArgs();

  // Afficher la configuration
  console.log('\nConfiguration:');
  console.log(JSON.stringify(CONFIG, null, 2));

  // Vérification du mode
  if (CONFIG.dryRun) {
    logger.warning('MODE DRY-RUN ACTIF - Aucune modification ne sera effectuée');
    console.log('Pour exécuter la migration réelle, utilisez: node scripts/migrate-firestore.js --execute\n');
  } else {
    logger.warning('MODE EXÉCUTION ACTIF - Les données seront modifiées');
    console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Initialisation Firebase
  if (!initializeFirebase()) {
    logger.error('Impossible de continuer sans Firebase');
    process.exit(1);
  }

  // Migration des collections
  const startTime = Date.now();
  logger.info('Début de la migration...');

  for (const collectionName of CONFIG.collections) {
    stats.totalCollections++;
    const result = await migrateCollection(collectionName);

    stats.totalDocuments += result.total;
    stats.migratedDocuments += result.migrated;
    stats.skippedDocuments += result.skipped;
    stats.failedDocuments += result.failed;

    // Délai entre les collections pour éviter le rate limiting
    if (CONFIG.dryRun === false && collectionName !== CONFIG.collections[CONFIG.collections.length - 1]) {
      console.log(`\nAttente de ${CONFIG.batchDelay}ms avant la prochaine collection...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.batchDelay));
    }
  }

  // Résumé final
  const duration = Date.now() - startTime;
  logger.info('\n' + '='.repeat(60));
  logger.info('RÉSUMÉ DE LA MIGRATION');
  logger.info('='.repeat(60));
  console.log(`
Mode:           ${CONFIG.dryRun ? 'DRY-RUN (test)' : 'EXÉCUTION (réel)'}
Enterprise ID:  ${CONFIG.enterpriseId}
Collections:    ${stats.totalCollections}
Total docs:     ${stats.totalDocuments}
Migrés:         ${stats.migratedDocuments}
Ignorés:        ${stats.skippedDocuments}
Échoués:        ${stats.failedDocuments}
Erreurs:        ${stats.errors.length}
Durée:          ${(duration / 1000).toFixed(2)}s
`);

  if (stats.errors.length > 0) {
    logger.error('Des erreurs sont survenues:', stats.errors);
  }

  if (CONFIG.dryRun) {
    logger.warning('MODE DRY-RUN: Aucune modification effectuée');
    console.log('Pour exécuter la migration réelle:');
    console.log('  node scripts/migrate-firestore.js --execute\n');
  } else {
    logger.success('Migration terminée !');
  }

  // Fermer Firebase
  if (db && db.app) {
    await db.app.delete();
  }

  process.exit(stats.failedDocuments > 0 ? 1 : 0);
}

// Gestion des erreurs non gérées
process.on('unhandledRejection', (error) => {
  logger.error('Erreur non gérée', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\nMigration interrompue par l\'utilisateur');
  process.exit(0);
});

// Exécution
main().catch(error => {
  logger.error('Erreur fatale', error);
  process.exit(1);
});