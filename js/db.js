// KA Farm - Couche d'accès PostgreSQL
// CRUD générique pour toutes les tables

import { Pool } from 'pg';

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT || '5432'),
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || '',
      database: process.env.PG_DATABASE || 'kafarm',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });
  }
  return pool;
}

export const DB = {
  async query(text, params) {
    const p = getPool();
    const start = Date.now();
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (process.env.PG_LOG_QUERIES === 'true') {
      console.log('[DB]', duration + 'ms', text.replace(/\s+/g, ' ').slice(0, 120));
    }
    return res;
  },

  async all(text, params) {
    const res = await this.query(text, params);
    return res.rows;
  },

  async get(text, params) {
    const res = await this.query(text, params);
    return res.rows[0] || null;
  },

  async run(text, params) {
    const res = await this.query(text, params);
    if (res.rows && res.rows[0] && res.rows[0].id !== undefined) {
      return res.rows[0].id;
    }
    return res.rowCount || 0;
  },

  async init() {
    const p = getPool();
    try {
      await p.query('SELECT 1');
      console.log('[DB] Connexion PostgreSQL établie');
    } catch (e) {
      console.warn('[DB] PostgreSQL indisponible, mode fallback localStorage actif');
    }
  },

  async close() {
    if (pool) {
      await pool.end();
      pool = null;
    }
  }
};

// Helpers mapping collections

const COLLECTIONS = {
  ka_farm_users: 'users',
  ka_farm_crops: 'crops',
  ka_farm_nurseries: 'nurseries',
  ka_farm_stocks: 'stocks',
  ka_farm_tasks: 'tasks',
  ka_farm_finances: 'finances',
  ka_farm_parcelles: 'parcelles',
  ka_farm_employees: 'employees',
  ka_farm_attendance: 'attendance',
  ka_farm_employee_payments: 'employee_payments',
  ka_farm_cheptel: 'cheptel',
  ka_farm_elevage_production: 'elevage_production',
  ka_farm_elevage_health: 'elevage_health'
};

function getEnterpriseId() {
  return 'ka_farm';
}

function escapeLike(value) {
  return String(value).replace(/[%_]/g, '\\$&');
}

export const DBStorage = {
  async list(table, opts = {}) {
    const enterpriseId = getEnterpriseId();
    const sql = [`SELECT * FROM ${table} WHERE enterprise_id = $1`];
    const params = [enterpriseId];

    if (opts.where) {
      const keys = Object.keys(opts.where);
      keys.forEach((k, i) => {
        sql.push(`AND ${k} = $${params.length + 1}`);
        params.push(opts.where[k]);
      });
    }
    if (opts.orderBy) {
      sql.push(`ORDER BY ${opts.orderBy}`);
    }
    if (opts.limit) {
      sql.push(`LIMIT $${params.length + 1}`);
      params.push(opts.limit);
    }
    return this.all(sql.join(' '), params);
  },

  async getById(table, id) {
    const enterpriseId = getEnterpriseId();
    const rows = await this.all(`SELECT * FROM ${table} WHERE id = $1 AND enterprise_id = $2`, [id, enterpriseId]);
    return rows[0] || null;
  },

  async search(table, queryText, fields) {
    const enterpriseId = getEnterpriseId();
    const like = `%${escapeLike(queryText)}%`;
    const clauses = [`enterprise_id = $1`];
    const params = [enterpriseId];
    fields.forEach((f, i) => {
      const idx = params.length + 1;
      clauses.push(`${f} ILIKE $${idx}`);
      params.push(like);
    });
    const sql = `SELECT * FROM ${table} WHERE ${clauses.join(' OR ')}`;
    return this.all(sql, params);
  },

  async insert(table, item) {
    const enterpriseId = getEnterpriseId();
    const itemWithEnterprise = { ...item, enterprise_id: item.enterprise_id || enterpriseId };
    const keys = Object.keys(itemWithEnterprise);
    const values = Object.values(itemWithEnterprise);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.all(sql, values);
    return rows[0];
  },

  async insertMany(table, items) {
    const results = [];
    for (const item of items) {
      const r = await this.insert(table, item);
      results.push(r);
    }
    return results;
  },

  async update(table, id, patch) {
    const enterpriseId = getEnterpriseId();
    const keys = Object.keys(patch);
    const set = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const sql = `UPDATE ${table} SET ${set} WHERE id = $1 AND enterprise_id = $2 RETURNING *`;
    const params = [id, ...Object.values(patch)];
    const rows = await this.all(sql, params);
    return rows[0] || null;
  },

  async delete(table, id) {
    const enterpriseId = getEnterpriseId();
    const res = await this.query(`DELETE FROM ${table} WHERE id = $1 AND enterprise_id = $2`, [id, enterpriseId]);
    return (res.rowCount || 0) > 0;
  },

  async count(table, where = {}) {
    const enterpriseId = getEnterpriseId();
    const sql = [`SELECT COUNT(*) as count FROM ${table} WHERE enterprise_id = $1`];
    const params = [enterpriseId];
    Object.entries(where).forEach(([k, v], i) => {
      sql.push(`AND ${k} = $${params.length + 1}`);
      params.push(v);
    });
    const row = await this.get(sql.join(' '), params);
    return parseInt(String(row.count || 0), 10);
  }
};
