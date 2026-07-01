// KA-FARM - Script de Migration
// Exécute le schéma SQL sur la base de données PostgreSQL

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './config.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Démarrage de la migration KA-FARM...\n');

  // Tester la connexion
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Impossible de se connecter à la base de données. Vérifiez vos variables d\'environnement.');
    process.exit(1);
  }

  // Lire le fichier schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('📝 Exécution du schéma SQL...');
    await query(schemaSQL);
    console.log('✅ Migration terminée avec succès!\n');
    console.log('📊 Tables créées:');
    console.log('  - fermes');
    console.log('  - utilisateurs');
    console.log('  - parcelles');
    console.log('  - cultures');
    console.log('  - pepinieres');
    console.log('  - recoltes');
    console.log('  - traitements_phytosanitaires');
    console.log('  - stocks_intrants');
    console.log('  - mouvements_stock');
    console.log('  - employes');
    console.log('  - presences');
    console.log('  - paiements_employes');
    console.log('  - transactions_financieres');
    console.log('  - ventes');
    console.log('  - cheptel');
    console.log('  - production_animale');
    console.log('  - sante_animale');
    console.log('  - taches');
    console.log('  - messages');
    console.log('  - alertes');
    console.log('  - credits');
    console.log('  - equipements');
    console.log('\n📈 Vues créées:');
    console.log('  - vue_synthese_finances');
    console.log('  - vue_synthese_cultures');
    console.log('  - vue_alertes_stock');
    console.log('\n⚠️  IMPORTANT: Les mots de passe par défaut sont des placeholders. Remplacez-les avec des hashes bcrypt réels.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
