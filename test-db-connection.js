// Script de test de connexion à la base de données
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

console.log('🔍 Test de connexion à la base de données...\n');
console.log('Configuration:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NON DEFINI');
console.log('');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

try {
  const client = await pool.connect();
  const result = await client.query('SELECT NOW()');
  client.release();
  console.log('✅ Connexion réussie !');
  console.log('📅 Heure du serveur:', result.rows[0].now);
  await pool.end();
} catch (error) {
  console.error('❌ Erreur de connexion:');
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  await pool.end();
  process.exit(1);
}
