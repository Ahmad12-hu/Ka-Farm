import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './js/modules/logger.js';
import { validateData, UserSchema, ParcelleSchema, CropSchema, TreatmentSchema, FinanceSchema, EmployeeSchema, StockSchema, HarvestSchema, SaleSchema, TaskSchema } from './js/modules/validators.js';
import { z } from 'zod';

dotenv.config();

// Security middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, veuillez réessayer dans 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes for API writes
  max: 30, // stricter limit for mutations
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de modifications, veuillez réessayer dans 5 minutes.' }
});

// PostgreSQL connection pool
let pool;
let usePostgres = false;

try {
  pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE || 'kafarm',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });
  
  // Test connection
  await pool.query('SELECT 1');
  usePostgres = true;
  console.log('[DB] Connexion PostgreSQL établie avec succès');
} catch (error) {
  console.warn('[DB] PostgreSQL non disponible, utilisation du mode fallback mémoire:', error.message);
  pool = null;
}

async function startServer() {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.open-meteo.com", "https://generativelanguage.googleapis.com"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 204
  }));

  // Rate limiting
  app.use('/api/', limiter);
  app.use('/api/', apiLimiter);

  app.use(express.json({ limit: '12mb' }));

  // In-memory fallback stores (used when PostgreSQL is not available)
  let serverMessages = [];
  let serverStocks = [];
  let serverCrops = [];
  let serverParcelles = [];
  let serverTasks = [];
  let serverFinances = [];
  let serverEmployees = [];
  let serverCheptel = [];
  let serverElevageProduction = [];
  let serverElevageHealth = [];
  let serverNurseries = [];
  let serverTreatments = [];
  let serverCropProfits = [];
  let serverAttendance = [];
  let serverPayments = [];

  // Request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    logger.http(`${req.method} ${req.path}`);
    next();
  });

  // ==================== MESSAGES ====================
  app.get('/api/messages', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM messages ORDER BY timestamp DESC');
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching messages from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverMessages);
  });

  app.post('/api/messages', async (req, res) => {
    const { id, senderEmail, senderName, text, timestamp, isPrivate, image } = req.body;

    // Validation with Zod
    const messageData = {
      id,
      senderEmail,
      senderName: senderName || senderEmail,
      text,
      timestamp: timestamp || new Date().toISOString(),
      isPrivate: !!isPrivate
    };

    const validation = validateData(
      z.object({
        senderEmail: z.string().email('Email invalide'),
        text: z.string().min(1, 'Message vide'),
      }),
      { senderEmail: messageData.senderEmail, text: messageData.text }
    );

    if (!validation.success) {
      logger.warn('Message validation failed', { errors: validation.errors });
      return res.status(400).json({ error: 'Données invalides', details: validation.errors });
    }

    if (!senderEmail || !text) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    const newMsg = {
      id: id || 'msg-' + Date.now(),
      senderEmail,
      senderName: senderName || senderEmail,
      text,
      timestamp: timestamp || new Date().toISOString(),
      isPrivate: !!isPrivate
    };

    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO messages (id, enterprise_id, sender_email, sender_name, text, timestamp, is_private) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [newMsg.id, 'ka_farm', newMsg.senderEmail, newMsg.senderName, newMsg.text, newMsg.timestamp, newMsg.isPrivate]
        );
        logger.info('Message saved to PostgreSQL', { messageId: newMsg.id });
        res.json({ success: true, message: newMsg });
        return;
      } catch (err) {
        logger.error('Error saving message to PostgreSQL', { error: err.message });
      }
    }

    serverMessages.push(newMsg);
    logger.info('Message saved to memory', { messageId: newMsg.id });
    res.json({ success: true, message: newMsg });
  });

  // ==================== TRAITEMENTS PHYTOSANITAIRES ====================
  app.get('/api/treatments', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM traitements_phytosanitaires WHERE enterprise_id = $1 ORDER BY date_applied DESC', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching treatments from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverTreatments);
  });

  app.post('/api/treatments', async (req, res) => {
    const treatment = req.body;

    // Validation with Zod
    const validation = validateData(TreatmentSchema, treatment);
    if (!validation.success) {
      logger.warn('Treatment validation failed', { errors: validation.errors });
      return res.status(400).json({ error: 'Données invalides', details: validation.errors });
    }

    if (!treatment || !treatment.id || !treatment.product_name) {
      return res.status(400).json({ error: 'ID et nom du produit requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO traitements_phytosanitaires (id, enterprise_id, parcel_id, crop_id, crop_name, parcel_name, product_name, category, date_applied, dar_days, target, notes, harvest_ready) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [treatment.id, treatment.enterprise_id || 'ka_farm', treatment.parcel_id, treatment.crop_id, treatment.crop_name, treatment.parcel_name, treatment.product_name, treatment.category, treatment.date_applied, treatment.dar_days, treatment.target, treatment.notes, treatment.harvest_ready]
        );
        logger.info('Treatment saved to PostgreSQL', { treatmentId: treatment.id, product: treatment.product_name });
        res.json({ success: true, treatment });
        return;
      } catch (err) {
        logger.error('Error saving treatment to PostgreSQL', { error: err.message });
      }
    }

    const existing = serverTreatments.find(t => t.id === treatment.id);
    if (existing) {
      const idx = serverTreatments.findIndex(t => t.id === treatment.id);
      serverTreatments[idx] = { ...existing, ...treatment };
    } else {
      serverTreatments.push(treatment);
    }
    logger.info('Treatment saved to memory', { treatmentId: treatment.id });
    res.json({ success: true, treatment });
  });

  app.post('/api/treatments/sync', async (req, res) => {
    const { treatments } = req.body;
    if (treatments && Array.isArray(treatments)) {
      if (usePostgres && pool) {
        try {
          await pool.query('DELETE FROM traitements_phytosanitaires WHERE enterprise_id = $1', ['ka_farm']);
          for (const treatment of treatments) {
            await pool.query(
              'INSERT INTO traitements_phytosanitaires (id, enterprise_id, parcel_id, crop_id, crop_name, parcel_name, product_name, category, date_applied, dar_days, target, notes, harvest_ready) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
              [treatment.id, treatment.enterprise_id || 'ka_farm', treatment.parcel_id, treatment.crop_id, treatment.crop_name, treatment.parcel_name, treatment.product_name, treatment.category, treatment.date_applied, treatment.dar_days, treatment.target, treatment.notes, treatment.harvest_ready]
            );
          }
          res.json({ success: true, message: 'Traitements synchronisés avec PostgreSQL', treatments });
          return;
        } catch (err) {
          logger.error('Error syncing treatments to PostgreSQL', { error: err.message });
        }
      }
      serverTreatments = treatments;
      res.json({ success: true, message: 'Traitements synchronisés en mémoire', treatments });
    } else {
      res.status(400).json({ error: 'Données de traitements invalides' });
    }
  });

  // ==================== CROP PROFITABILITY ====================
  app.get('/api/crop-profits', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM crop_profitability WHERE enterprise_id = $1 ORDER BY net_margin DESC', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching crop profits from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverCropProfits);
  });

  app.post('/api/crop-profits', async (req, res) => {
    const profit = req.body;
    if (!profit || !profit.id || !profit.crop_name) {
      return res.status(400).json({ error: 'ID et nom de la culture requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO crop_profitability (id, enterprise_id, crop_name, parcel_id, parcel_name, yield_kg, price_per_kg, revenue, costs, total_cost, net_margin, profitability_percent, period, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
          [
            profit.id,
            profit.enterprise_id || 'ka_farm',
            profit.crop_name,
            profit.parcel_id,
            profit.parcel_name,
            profit.yield_kg,
            profit.price_per_kg,
            profit.revenue,
            profit.costs,
            profit.total_cost,
            profit.net_margin,
            profit.profitability_percent,
            profit.period,
            profit.notes
          ]
        );
        res.json({ success: true, profit });
        return;
      } catch (err) {
        logger.error('Error saving crop profit to PostgreSQL', { error: err.message });
      }
    }
    
    const existing = serverCropProfits.find(p => p.id === profit.id);
    if (existing) {
      const idx = serverCropProfits.findIndex(p => p.id === profit.id);
      serverCropProfits[idx] = { ...existing, ...profit };
    } else {
      serverCropProfits.push(profit);
    }
    res.json({ success: true, profit });
  });

  app.post('/api/crop-profits/sync', async (req, res) => {
    const { cropProfits } = req.body;
    if (cropProfits && Array.isArray(cropProfits)) {
      if (usePostgres && pool) {
        try {
          await pool.query('DELETE FROM crop_profitability WHERE enterprise_id = $1', ['ka_farm']);
          for (const profit of cropProfits) {
            await pool.query(
              'INSERT INTO crop_profitability (id, enterprise_id, crop_name, parcel_id, parcel_name, yield_kg, price_per_kg, revenue, costs, total_cost, net_margin, profitability_percent, period, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
              [
                profit.id,
                profit.enterprise_id || 'ka_farm',
                profit.crop_name,
                profit.parcel_id,
                profit.parcel_name,
                profit.yield_kg,
                profit.price_per_kg,
                profit.revenue,
                profit.costs,
                profit.total_cost,
                profit.net_margin,
                profit.profitability_percent,
                profit.period,
                profit.notes
              ]
            );
          }
          res.json({ success: true, message: 'Analyses de rentabilité synchronisées avec PostgreSQL', cropProfits });
          return;
        } catch (err) {
          logger.error('Error syncing crop profits to PostgreSQL', { error: err.message });
        }
      }
      serverCropProfits = cropProfits;
      res.json({ success: true, message: 'Analyses de rentabilité synchronisées en mémoire', cropProfits });
    } else {
      res.status(400).json({ error: 'Données de rentabilité invalides' });
    }
  });

  // ==================== STOCKS ====================
  app.get('/api/stocks', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM stocks WHERE enterprise_id = $1 ORDER BY name', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching stocks from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverStocks);
  });

  app.post('/api/stocks', async (req, res) => {
    const { stocks } = req.body;
    if (stocks && Array.isArray(stocks)) {
      if (usePostgres && pool) {
        try {
          await pool.query('DELETE FROM stocks WHERE enterprise_id = $1', ['ka_farm']);
          for (const stock of stocks) {
            await pool.query(
              'INSERT INTO stocks (id, enterprise_id, name, category, quantity, max_quantity, unit) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [stock.id, 'ka_farm', stock.name, stock.category, stock.quantity, stock.maxQuantity, stock.unit]
            );
          }
          res.json({ success: true, message: 'Stocks synchronisés avec PostgreSQL', stocks });
          return;
        } catch (err) {
          logger.error('Error syncing stocks to PostgreSQL', { error: err.message });
        }
      }
      serverStocks = stocks;
      res.json({ success: true, message: 'Stocks synchronisés en mémoire', stocks });
    } else {
      res.status(400).json({ error: 'Données de stock invalides' });
    }
  });

  // ==================== CROPS ====================
  app.get('/api/crops', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM crops WHERE enterprise_id = $1 ORDER BY sowing_date DESC', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching crops from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverCrops);
  });

  app.post('/api/crops', async (req, res) => {
    const crop = req.body;
    if (!crop || !crop.id || !crop.name) {
      return res.status(400).json({ error: 'ID et nom requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO crops (id, enterprise_id, name, field, sowing_date, harvest_date, status, water_status, fertilizer_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [crop.id, 'ka_farm', crop.name, crop.field, crop.sowingDate, crop.harvestDate, crop.status, crop.waterStatus, crop.fertilizerStatus]
        );
        res.json({ success: true, crop });
        return;
      } catch (err) {
        logger.error('Error saving crop to PostgreSQL', { error: err.message });
      }
    }
    
    const existing = serverCrops.find(c => c.id === crop.id);
    if (existing) {
      const idx = serverCrops.findIndex(c => c.id === crop.id);
      serverCrops[idx] = { ...existing, ...crop };
    } else {
      serverCrops.push(crop);
    }
    res.json({ success: true, crop });
  });

  // ==================== PARCELLES ====================
  app.get('/api/parcelles', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM parcelles WHERE enterprise_id = $1 ORDER BY name', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching parcelles from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverParcelles);
  });

  app.post('/api/parcelles', async (req, res) => {
    const parcelle = req.body;

    // Validation with Zod
    const validation = validateData(ParcelleSchema, parcelle);
    if (!validation.success) {
      logger.warn('Parcelle validation failed', { errors: validation.errors });
      return res.status(400).json({ error: 'Données invalides', details: validation.errors });
    }

    if (!parcelle || !parcelle.id || !parcelle.name) {
      return res.status(400).json({ error: 'ID et nom requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO parcelles (id, enterprise_id, name, surface, lat, lng, status, type_sol, history, current_crop, water_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [parcelle.id, 'ka_farm', parcelle.name, parcelle.surface, parcelle.lat, parcelle.lng, parcelle.status, parcelle.type_sol || 'sableux', parcelle.history, parcelle.currentCrop, parcelle.waterStatus]
        );
        logger.info('Parcelle saved to PostgreSQL', { parcelleId: parcelle.id, name: parcelle.name });
        res.json({ success: true, parcelle });
        return;
      } catch (err) {
        logger.error('Error saving parcelle to PostgreSQL', { error: err.message });
      }
    }

    const existing = serverParcelles.find(p => p.id === parcelle.id);
    if (existing) {
      const idx = serverParcelles.findIndex(p => p.id === parcelle.id);
      serverParcelles[idx] = { ...existing, ...parcelle };
    } else {
      serverParcelles.push(parcelle);
    }
    logger.info('Parcelle saved to memory', { parcelleId: parcelle.id });
    res.json({ success: true, parcelle });
  });

  // ==================== TASKS ====================
  app.get('/api/tasks', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM tasks WHERE enterprise_id = $1 ORDER BY due_date ASC', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching tasks from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverTasks);
  });

  app.post('/api/tasks', async (req, res) => {
    const task = req.body;
    if (!task || !task.id || !task.title) {
      return res.status(400).json({ error: 'ID et titre requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO tasks (id, enterprise_id, title, category, due_date, assignee, priority, completed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [task.id, 'ka_farm', task.title, task.category, task.dueDate, task.assignee, task.priority, task.completed]
        );
        res.json({ success: true, task });
        return;
      } catch (err) {
        logger.error('Error saving task to PostgreSQL', { error: err.message });
      }
    }
    
    const existing = serverTasks.find(t => t.id === task.id);
    if (existing) {
      const idx = serverTasks.findIndex(t => t.id === task.id);
      serverTasks[idx] = { ...existing, ...task };
    } else {
      serverTasks.push(task);
    }
    res.json({ success: true, task });
  });

  // ==================== FINANCES ====================
  app.get('/api/finances', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM finances WHERE enterprise_id = $1 ORDER BY date DESC', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching finances from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverFinances);
  });

  app.post('/api/finances', async (req, res) => {
    const finance = req.body;
    if (!finance || !finance.id || !finance.description) {
      return res.status(400).json({ error: 'ID et description requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO finances (id, enterprise_id, description, category, type, amount, date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [finance.id, 'ka_farm', finance.description, finance.category, finance.type, finance.amount, finance.date]
        );
        res.json({ success: true, finance });
        return;
      } catch (err) {
        logger.error('Error saving finance to PostgreSQL', { error: err.message });
      }
    }
    
    const existing = serverFinances.find(f => f.id === finance.id);
    if (existing) {
      const idx = serverFinances.findIndex(f => f.id === finance.id);
      serverFinances[idx] = { ...existing, ...finance };
    } else {
      serverFinances.push(finance);
    }
    res.json({ success: true, finance });
  });

  // ==================== EMPLOYEES ====================
  app.get('/api/employees', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM employees WHERE enterprise_id = $1 ORDER BY name', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching employees from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverEmployees);
  });

  app.post('/api/employees', async (req, res) => {
    const employee = req.body;
    if (!employee || !employee.id || !employee.name) {
      return res.status(400).json({ error: 'ID et nom requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO employees (id, enterprise_id, name, phone, role, daily_rate, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [employee.id, 'ka_farm', employee.name, employee.phone, employee.role, employee.dailyRate, employee.status]
        );
        res.json({ success: true, employee });
        return;
      } catch (err) {
        logger.error('Error saving employee to PostgreSQL', { error: err.message });
      }
    }
    
    const existing = serverEmployees.find(e => e.id === employee.id);
    if (existing) {
      const idx = serverEmployees.findIndex(e => e.id === employee.id);
      serverEmployees[idx] = { ...existing, ...employee };
    } else {
      serverEmployees.push(employee);
    }
    res.json({ success: true, employee });
  });

  // ==================== ELEVAGE / CHEPTEL ====================
  app.get('/api/cheptel', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM cheptel WHERE enterprise_id = $1 ORDER BY name', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching cheptel from PostgreSQL', { error: err.message });
      }
    }
    res.json(serverCheptel);
  });

  app.post('/api/cheptel', async (req, res) => {
    const group = req.body;
    if (!group || !group.id || !group.name) {
      return res.status(400).json({ error: 'ID et nom requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO cheptel (id, enterprise_id, name, type, breed, quantity, unit, status, purpose) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [group.id, 'ka_farm', group.name, group.type, group.breed, group.quantity, group.unit, group.status, group.purpose]
        );
        res.json({ success: true, group });
        return;
      } catch (err) {
        logger.error('Error saving cheptel to PostgreSQL', { error: err.message });
      }
    }
    
    const existing = serverCheptel.find(c => c.id === group.id);
    if (existing) {
      const idx = serverCheptel.findIndex(c => c.id === group.id);
      serverCheptel[idx] = { ...existing, ...group };
    } else {
      serverCheptel.push(group);
    }
    res.json({ success: true, group });
  });

  // ==================== ELEVAGE PRODUCTION ====================
  app.get('/api/elevage/production', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM elevage_production WHERE enterprise_id = $1 ORDER BY date DESC', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching elevage production from PostgreSQL', { error: err.message });
      }
    }
    const sorted = serverElevageProduction.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  });

  app.post('/api/elevage/production', async (req, res) => {
    const log = req.body;
    if (!log || !log.id || !log.type) {
      return res.status(400).json({ error: 'ID et type requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO elevage_production (id, enterprise_id, date, type, quantity, unit, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [log.id, 'ka_farm', log.date, log.type, log.quantity, log.unit, log.notes]
        );
        res.json({ success: true, log });
        return;
      } catch (err) {
        logger.error('Error saving elevage production to PostgreSQL', { error: err.message });
      }
    }
    
    serverElevageProduction.push(log);
    res.json({ success: true, log });
  });

  // ==================== ELEVAGE HEALTH ====================
  app.get('/api/elevage/health', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM elevage_health WHERE enterprise_id = $1 ORDER BY date DESC', ['ka_farm']);
        res.json(result.rows);
        return;
      } catch (err) {
        logger.error('Error fetching elevage health from PostgreSQL', { error: err.message });
      }
    }
    const sorted = serverElevageHealth.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  });

  app.post('/api/elevage/health', async (req, res) => {
    const log = req.body;
    if (!log || !log.id || !log.intervention) {
      return res.status(400).json({ error: 'ID et intervention requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO elevage_health (id, enterprise_id, date, target, intervention, practitioner, cost, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [log.id, 'ka_farm', log.date, log.target, log.intervention, log.practitioner, log.cost, log.notes]
        );
        res.json({ success: true, log });
        return;
      } catch (err) {
        logger.error('Error saving elevage health to PostgreSQL', { error: err.message });
      }
    }
    
    serverElevageHealth.push(log);
    res.json({ success: true, log });
  });

  // ==================== AUTHENTIFICATION ====================
  
  // Inscription
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, name, farm_name } = req.body;

      // Validation basique
      if (!email || !password || !name) {
        return res.status(400).json({ 
          error: 'Email, mot de passe et nom requis' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Le mot de passe doit contenir au moins 6 caractères' 
        });
      }

      // TODO: Intégrer Supabase Auth ici
      // Pour l'instant, créer un utilisateur local simple
      const userId = 'user_' + Date.now();
      const enterpriseId = `farm_${email.split('@')[0].toLowerCase()}_${Date.now()}`;

      // Créer l'utilisateur
      if (usePostgres && pool) {
        try {
          await pool.query(
            'INSERT INTO users (id, email, name, role, enterprise_id, enterprise_name) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, email, name, 'user', enterpriseId, farm_name || `Ferme de ${name}`]
          );
        } catch (err) {
          logger.error('Error creating user in PostgreSQL', { error: err.message });
          // Fallback: continuer quand même
        }
      }

      // Créer les données par défaut
      createDefaultFarmData(userId);

      logger.info('User signed up', { userId, email });

      res.json({ 
        success: true, 
        user: { id: userId, email, name, role: 'user' },
        message: 'Compte créé avec succès !'
      });

    } catch (error) {
      logger.error('Signup error', { error: error.message });
      res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
  });

  // Connexion
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email et mot de passe requis' 
        });
      }

      // TODO: Intégrer Supabase Auth ici
      // Rechercher l'utilisateur dans la base
      let user = null;
      
      if (usePostgres && pool) {
        try {
          const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
          );
          user = result.rows[0];
        } catch (err) {
          logger.error('Error fetching user from PostgreSQL', { error: err.message });
        }
      }

      // Fallback: vérifier dans le stockage local
      if (!user) {
        const users = KAStorage.getUsers ? KAStorage.getUsers() : [];
        user = users.find(u => u.email === email);
      }

      if (!user) {
        return res.status(401).json({ 
          error: 'Email ou mot de passe incorrect' 
        });
      }

      // Générer un token simple (à remplacer par JWT)
      const token = 'token_' + user.id + '_' + Date.now();

      logger.info('User logged in', { userId: user.id, email });

      res.json({ 
        success: true, 
        user: user,
        token: token,
        message: 'Connexion réussie'
      });

    } catch (error) {
      logger.error('Login error', { error: error.message });
      res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
  });

  // Déconnexion
  app.post('/api/auth/logout', async (req, res) => {
    try {
      // TODO: Invalider le token
      logger.info('User logged out');
      res.json({ success: true, message: 'Déconnexion réussie' });
    } catch (error) {
      logger.error('Logout error', { error: error.message });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Récupérer l'utilisateur courant
  app.get('/api/auth/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Non autorisé' });
      }

      // Extraire l'userId du token
      const userId = token.split('_')[1];
      
      // Récupérer l'utilisateur
      if (usePostgres && pool) {
        try {
          const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
          );
          const user = result.rows[0];
          if (user) {
            return res.json({ success: true, user });
          }
        } catch (err) {
          logger.error('Error fetching user', { error: err.message });
        }
      }

      res.status(404).json({ error: 'Utilisateur introuvable' });
    } catch (error) {
      logger.error('Get user error', { error: error.message });
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Fonction pour créer les données par défaut d'une ferme
  function createDefaultFarmData(userId) {
    // Cette fonction sera implémentée avec Supabase Admin
    console.log(`Creating default farm data for user ${userId}`);
  }

  // ==================== GEMINI AI ====================
  app.post('/api/gemini', async (req, res) => {
    try {
      const { prompt, history, image } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt requis' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Clé GEMINI_API_KEY non configurée' });
      }

      const ai = new GoogleGenAI(apiKey);

      const systemInstruction = "Tu es KA-Farm Agro-Advisor, un conseiller horticole et maraîcher expert d'Afrique de l'Ouest (Sénégal), chaleureux, pragmatique, direct et scientifique. Tu réponds en français. Tu es spécialisé exclusivement dans le maraîchage (cultures de légumes, fines herbes, fruits de jardin, pépinières, irrigation goutte-à-goutte ou aspersion, maladies horticoles comme la mineuse de la tomate Tuta absoluta, le mildiou, l'oïdium, les thrips, et l'usage de biopesticides locaux comme le neem ou le piment). Tu aides à diagnostiquer les ravageurs et maladies des légumes, planifier les pépinières maraîchères et le repiquage, optimiser l'arrosage et les amendements (compost organique, fumier) de manière écologique et agroécologique. Donne des réponses concises, claires, structurées et adaptées aux conditions locales ouest-africaines.";

      // Formatage correct de l'historique pour l'API Gemini
      const chatHistory = [];
      if (history && Array.isArray(history) && history.length > 0) {
        history.forEach(m => {
          chatHistory.push({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          });
        });
      }

      // Choisir le modèle en fonction de la présence d'une image
      const modelName = image ? 'gemini-1.5-flash' : 'gemini-1.5-flash'; // gemini-pro-vision is also an option
      if (image && !modelName.includes('vision') && !modelName.includes('flash')) {
        console.warn("Attention: Le modèle utilisé ne supporte peut-être pas les images. Utilisation de gemini-1.5-flash.");
      }

      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstruction }],
        },
      });

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.7,
        }
      });

      let result;
      if (image) {
        // Handle image input
        const imagePart = {
          inlineData: {
            mimeType: image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1],
            data: image.split(',')[1]
          }
        };
        result = await model.generateContent([prompt, imagePart]);
      } else {
        // Handle text-only input
        result = await chat.sendMessage(prompt);
      }
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Impossible de générer une réponse de l\'IA.');
      }

      return res.json({ text });
    } catch (error) {
      logger.error('Error calling Gemini API', { error: error.message });
      return res.status(500).json({ error: error.message || 'Erreur interne de l\'API' });
    }
  });

  // ==================== WEATHER ====================
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordonnées lat et lon requises' });
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo API returned status ${response.status}`);
      }
      const data = await response.json();
      return res.json({
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        weather_code: data.current.weather_code,
        wind_speed: data.current.wind_speed_10m
      });
    } catch (error) {
      logger.error('Error fetching weather', { error: error.message });
      return res.status(500).json({ error: 'Erreur lors de la récupération des données météo' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'mpa'
    });
    app.use(vite.middlewares);
  } else {
    // Servir les fichiers statiques depuis le dossier pages/ (pour les pages HTML partagées)
    app.use('/pages', express.static(path.resolve('pages'), { extensions: ['html'] }));
    
    // Servir les fichiers statiques du build Vite (dist/)
    app.use(express.static(path.resolve('dist'), { extensions: ['html'] }));
    
    // Servir les assets (images, CSS, JS) depuis la racine
    app.use('/assets', express.static(path.resolve('assets')));
    app.use('/css', express.static(path.resolve('css')));
    app.use('/js', express.static(path.resolve('js')));
    
    // Route par défaut pour les requêtes non correspondantes
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    console.log(`Mode: ${usePostgres ? 'PostgreSQL' : 'Fallback mémoire (localStorage)'}`);
    console.log(`Security: Rate limiting + Helmet + CORS enabled`);
  });
}

startServer().catch(err => {
  logger.error('Failed to start server', { error: err.message });
});
