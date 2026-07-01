// KA-FARM - Configuration Base de Données PostgreSQL
// Utilisation de Supabase PostgreSQL

import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kafarm_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum de connexions dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Connexion PostgreSQL réussie:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error.message);
    return false;
  }
}

// Wrapper pour les requêtes avec gestion d'erreurs
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Exécution requête:', { text: text.substring(0, 50), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Erreur requête SQL:', error.message);
    throw error;
  }
}

// Transaction helper
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Fermeture propre des connexions
export async function closePool() {
  await pool.end();
  console.log('Pool de connexions fermé');
}

export default pool;
