// Système de migrations de base de données pour KA Farm
// Usage: node db/migrate.js up|down|status

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'kafarm',
});

// Table de suivi des migrations
const MIGRATIONS_TABLE = 'schema_migrations';

// Initialiser la table des migrations
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW(),
      execution_time_ms INTEGER
    )
  `);
}

// Obtenir les migrations déjà appliquées
async function getAppliedMigrations() {
  const result = await pool.query(`
    SELECT version FROM ${MIGRATIONS_TABLE} ORDER BY version ASC
  `);
  return result.rows.map(row => row.version);
}

// Charger tous les fichiers de migration
function getMigrationFiles() {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => {
      const versionA = parseInt(a.split('_')[0]);
      const versionB = parseInt(b.split('_')[0]);
      return versionA - versionB;
    });
  return files;
}

// Appliquer une migration
async function applyMigration(filePath, version, name) {
  const startTime = Date.now();
  const sql = fs.readFileSync(filePath, 'utf8');
  
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    const executionTime = Date.now() - startTime;
    
    await pool.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (version, name, execution_time_ms) VALUES ($1, $2, $3)`,
      [version, name, executionTime]
    );
    
    await pool.query('COMMIT');
    console.log(`✓ Migration ${version} appliquée avec succès (${executionTime}ms)`);
    return true;
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`✗ Erreur lors de l'application de la migration ${version}:`, error.message);
    return false;
  }
}

// Revenir en arrière (rollback) - supprimer l'enregistrement
async function rollbackMigration(version) {
  await pool.query('BEGIN');
  try {
    await pool.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE version = $1`, [version]);
    await pool.query('COMMIT');
    console.log(`✓ Migration ${version} annulée`);
    return true;
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`✗ Erreur lors du rollback de ${version}:`, error.message);
    return false;
  }
}

// Exécuter les migrations vers le haut (up)
async function migrateUp() {
  console.log('🚀 Démarrage des migrations...\n');
  
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();
  const migrationFiles = getMigrationFiles();
  
  let appliedCount = 0;
  let skippedCount = 0;
  
  for (const file of migrationFiles) {
    const version = file.split('_')[0];
    const name = file.replace('.sql', '');
    
    if (appliedMigrations.includes(version)) {
      console.log(`⊘ Migration ${version} déjà appliquée`);
      skippedCount++;
      continue;
    }
    
    const filePath = path.join(__dirname, file);
    const success = await applyMigration(filePath, version, name);
    
    if (success) {
      appliedCount++;
    } else {
      console.error('\n❌ Migration échouée. Arrêt du processus.');
      process.exit(1);
    }
  }
  
  console.log(`\n✅ Migrations terminées: ${appliedCount} appliquée(s), ${skippedCount} ignorée(s)`);
  await pool.end();
}

// Exécuter les migrations vers le bas (down/rollback)
async function migrateDown() {
  console.log('🔄 Rollback de la dernière migration...\n');
  
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();
  
  if (appliedMigrations.length === 0) {
    console.log('Aucune migration à annuler');
    await pool.end();
    return;
  }
  
  const lastVersion = appliedMigrations[appliedMigrations.length - 1];
  const success = await rollbackMigration(lastVersion);
  
  if (success) {
    console.log(`\n✅ Rollback de la migration ${lastVersion} terminé`);
  } else {
    console.error('\n❌ Rollback échoué');
    process.exit(1);
  }
  
  await pool.end();
}

// Afficher le statut des migrations
async function migrateStatus() {
  console.log('📊 Statut des migrations\n');
  
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();
  const migrationFiles = getMigrationFiles();
  
  console.log('─'.repeat(80));
  console.log(`${'Version':<10} ${'Nom':<40} ${'Statut':<15}`);
  console.log('─'.repeat(80));
  
  for (const file of migrationFiles) {
    const version = file.split('_')[0];
    const name = file.replace('.sql', '').substring(10); // Enlever le numéro et underscore
    const status = appliedMigrations.includes(version) ? '✓ Appliquée' : '○ En attente';
    
    console.log(`${version:<10} ${name:<40} ${status:<15}`);
  }
  
  console.log('─'.repeat(80));
  console.log(`\nTotal: ${appliedMigrations.length}/${migrationFiles.length} migrations appliquées`);
  
  await pool.end();
}

// Point d'entrée principal
const command = process.argv[2] || 'status';

switch (command) {
  case 'up':
    migrateUp().catch(err => {
      console.error('Erreur fatale:', err);
      process.exit(1);
    });
    break;
  case 'down':
    migrateDown().catch(err => {
      console.error('Erreur fatale:', err);
      process.exit(1);
    });
    break;
  case 'status':
    migrateStatus().catch(err => {
      console.error('Erreur fatale:', err);
      process.exit(1);
    });
    break;
  default:
    console.log(`
Usage: node db/migrate.js <command>

Commands:
  up       - Appliquer toutes les migrations en attente
  down     - Revenir en arriere (annuler la derniere migration)
  status   - Afficher le statut des migrations

Exemples:
  node db/migrate.js up
  node db/migrate.js status
`);
}
