// KA Farm API v2
// Express Router for PostgreSQL-backed collections
// Mounted at /api

import express from 'express';
import pg from 'pg';
const { Pool } = pg;

function createApiRouter() {
  const router = express.Router();
  router.use(express.json());

  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE || 'kafarm'
  });

  const TABLES = [
    'users','parcelles','crops','nurseries','stocks','tasks',
    'finances','employees','attendance','employee_payments',
    'cheptel','elevage_production','elevage_health','messages'
  ];

  router.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', db: 'postgres' });
    } catch (e) {
      res.status(500).json({ status: 'error', db: 'postgres', error: e.message });
    }
  });

  router.get('/:table', async (req, res) => {
    const table = req.params.table;
    if (!TABLES.includes(table)) return res.status(400).json({ error: 'Table inconnue' });
    try {
      const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/:table/count', async (req, res) => {
    const table = req.params.table;
    if (!TABLES.includes(table)) return res.status(400).json({ error: 'Table inconnue' });
    try {
      const { rows } = await pool.query(`SELECT COUNT(*)::bigint AS count FROM ${table}`);
      res.json({ count: parseInt(rows[0].count, 10) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/:table/id/:id', async (req, res) => {
    const table = req.params.table;
    const id = req.params.id;
    if (!TABLES.includes(table)) return res.status(400).json({ error: 'Table inconnue' });
    try {
      const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      if (!rows.length) return res.status(404).json({ error: 'Non trouvé' });
      res.json(rows[0]);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/:table', async (req, res) => {
    const table = req.params.table;
    const item = req.body;
    if (!TABLES.includes(table)) return res.status(400).json({ error: 'Table inconnue' });
    if (!item || typeof item !== 'object') return res.status(400).json({ error: 'Corps invalide' });
    try {
      const keys = Object.keys(item);
      const values = Object.values(item);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`;
      const { rows } = await pool.query(sql, values);
      res.status(201).json(rows[0]);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.put('/:table/id/:id', async (req, res) => {
    const table = req.params.table;
    const id = req.params.id;
    const patch = req.body;
    if (!TABLES.includes(table)) return res.status(400).json({ error: 'Table inconnue' });
    if (!patch || typeof patch !== 'object') return res.status(400).json({ error: 'Corps invalide' });
    try {
      const keys = Object.keys(patch);
      const set = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const sql = `UPDATE ${table} SET ${set} WHERE id = $1 RETURNING *`;
      const { rows } = await pool.query(sql, [id, ...Object.values(patch)]);
      if (!rows.length) return res.status(404).json({ error: 'Non trouvé' });
      res.json(rows[0]);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete('/:table/id/:id', async (req, res) => {
    const table = req.params.table;
    const id = req.params.id;
    if (!TABLES.includes(table)) return res.status(400).json({ error: 'Table inconnue' });
    try {
      const { rows } = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);
      if (!rows.length) return res.status(404).json({ error: 'Non trouvé' });
      res.json({ deleted: true, id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}

export default createApiRouter;