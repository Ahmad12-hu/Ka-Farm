import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

dotenv.config();

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
  app.use(express.json({ limit: '12mb' }));

  // In-memory fallback stores (used when PostgreSQL is not available)
  let serverMessages = [
    { id: 'msg-1', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'Salam Aly ! J\'ai fini de vérifier le système de goutte-à-goutte sur la parcelle A. Tout fonctionne bien pour les tomates 🍅.', timestamp: '2026-06-25T08:30:00.000Z', isPrivate: false, image: null },
    { id: 'msg-2', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'Wa alaykoum salam Moussa. Alhamdoulilah ! Et qu\'en est-il du stock de compost bio ? Est-ce qu\'on a assez pour la pépinière de poivrons ?', timestamp: '2026-06-25T09:15:00.000Z', isPrivate: false, image: null },
    { id: 'msg-3', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'On a encore environ 350 kg en réserve, mais ce serait bien d\'en commander 500 kg supplémentaires pour juillet 🌱.', timestamp: '2026-06-25T09:40:00.000Z', isPrivate: false, image: null },
    { id: 'msg-4', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'D\'accord, c\'est noté. Je passe la commande aujourd\'hui depuis le bureau de Dakar 💻.', timestamp: '2026-06-25T10:00:00.000Z', isPrivate: false, image: null }
  ];

  let serverStocks = [
    { id: 'S-301', name: 'Compost Organique Bio', category: 'Amendements', quantity: 350, maxQuantity: 1000, unit: 'kg' },
    { id: 'S-302', name: 'Semences Tomate Mongal F1', category: 'Semences', quantity: 12, maxQuantity: 50, unit: 'sachets' },
    { id: 'S-303', name: 'Purin de Neem (Insecticide)', category: 'Traitements', quantity: 45, maxQuantity: 100, unit: 'L' },
    { id: 'S-304', name: 'Fumier de Mouton séché', category: 'Amendements', quantity: 150, maxQuantity: 800, unit: 'kg' },
    { id: 'S-305', name: 'Aliments Concentrés Bovins', category: 'Alimentation', quantity: 180, maxQuantity: 1000, unit: 'kg' }
  ];

  let serverCrops = [
    { id: 'C-101', name: 'Tomate Mongal F1', field: 'Parcelle Nord - Planche 2', sowingDate: '2026-05-10', harvestDate: '2026-08-15', status: 'Floraison', waterStatus: 'Optimale', fertilizerStatus: 'OK', photos: [] },
    { id: 'C-102', name: 'Oignon Rouge de Galmi', field: 'Parcelle Est - Grand Champ', sowingDate: '2026-04-15', harvestDate: '2026-09-01', status: 'Croissance', waterStatus: 'Besoin d\'eau', fertilizerStatus: 'OK', photos: [] }
  ];

  let serverParcelles = [
    { id: 'P-001', name: 'Parcelle Nord - Planche 2', surface: 120, lat: 14.7932, lng: -17.2654, status: 'Cultivée', type_sol: 'sableux', history: ['Tomate Mongal F1'], currentCrop: 'Tomate Mongal F1', waterStatus: 'Irrigué' },
    { id: 'P-002', name: 'Parcelle Est - Grand Champ', surface: 500, lat: 14.7938, lng: -17.2642, status: 'Cultivée', type_sol: 'limoneux', history: ['Oignon Rouge de Galmi'], currentCrop: 'Oignon Rouge de Galmi', waterStatus: 'Besoin d\'eau' }
  ];

  let serverTasks = [
    { id: 'T-401', title: 'Irrigation matin de l\'oignon Galmi', category: 'Irrigation', dueDate: '2026-06-26', assignee: 'Moussa', priority: 'Haute', completed: false },
    { id: 'T-402', title: 'Sarclage & Désherbage planche choux', category: 'Entretien', dueDate: '2026-06-28', assignee: 'Fatou', priority: 'Moyenne', completed: false }
  ];

  let serverFinances = [
    { id: 'F-501', description: 'Vente de 8 caisses de Tomates Mongal', category: 'Vente Légumes', type: 'Revenu', amount: 120000, date: '2026-06-20' },
    { id: 'F-502', description: 'Achat de semences oignon Galmi', category: 'Semences', type: 'Dépense', amount: 35000, date: '2026-06-18' }
  ];

  let serverEmployees = [
    { id: 'E-001', name: 'Samba Diouf', phone: '77 521 44 22', role: 'Ouvrier agricole', dailyRate: 4000, status: 'Actif' },
    { id: 'E-002', name: 'Awa Sow', phone: '76 432 11 00', role: 'Chef d\'équipe pépinière', dailyRate: 5000, status: 'Actif' }
  ];

  let serverCheptel = [
    { id: 'CH-001', name: 'Génisses Laitières Holstein', type: 'Bovins', breed: 'Holstein/Guzera', quantity: 12, unit: 'têtes', status: 'Sain', purpose: 'Lait' },
    { id: 'CH-002', name: 'Moutons Ladoum d\'Élevage', type: 'Ovins', breed: 'Ladoum Pur', quantity: 8, unit: 'têtes', status: 'Sain', purpose: 'Reproduction' }
  ];

  let serverElevageProduction = [
    { id: 'PROD-001', date: '2026-06-25', type: 'Lait', quantity: 145, unit: 'L', notes: 'Excellente traite matinale.' },
    { id: 'PROD-002', date: '2026-06-25', type: 'Œufs', quantity: 310, unit: 'unités', notes: '10 plateaux collectés.' }
  ];

  let serverElevageHealth = [
    { id: 'HEA-001', date: '2026-06-10', target: 'Moutons Ladoum', intervention: 'Vaccination Pastorose', practitioner: 'Dr. Diop', cost: 15000, notes: 'Rappel annuel effectué.' }
  ];

  let serverNurseries = [
    { id: 'PEP-201', name: 'Pépinière Tomates Mongal', cropType: 'Tomate', sowingDate: '2026-06-01', plannedTransplantDate: '2026-07-01', quantityEst: 1500, status: 'Levée', healthStatus: 'Excellent' },
    { id: 'PEP-202', name: 'Pépinière Poivron Yolo Wonder', cropType: 'Poivron', sowingDate: '2026-06-10', plannedTransplantDate: '2026-07-15', quantityEst: 800, status: 'Semis', healthStatus: 'Excellent' }
  ];

  let serverTreatments = [
    { id: 'TR-001', enterprise_id: 'ka_farm', parcel_id: 'P-001', crop_id: 'C-101', crop_name: 'Tomate Mongal F1', parcel_name: 'Parcelle Nord - Planche 2', product_name: 'Purin de Neem', category: 'bio-phytosanitaire', date_applied: '2026-06-20', dar_days: 3, target: 'Chenilles et pucerons', notes: 'Traitement préventif appliqué le matin. Respecter le DAR de 3 jours.', harvest_ready: true },
    { id: 'TR-002', enterprise_id: 'ka_farm', parcel_id: 'P-002', crop_id: 'C-102', crop_name: 'Oignon Rouge de Galmi', parcel_name: 'Parcelle Est - Grand Champ', product_name: 'Décis (Insecticide chimique)', category: 'chimique-phytosanitaire', date_applied: '2026-06-23', dar_days: 7, target: 'Tuta Absoluta', notes: 'Traitement curatif suite à l\'alerte sur les chenilles.', harvest_ready: false },
    { id: 'TR-003', enterprise_id: 'ka_farm', parcel_id: 'P-001', crop_id: 'C-101', crop_name: 'Tomate Mongal F1', parcel_name: 'Parcelle Nord - Planche 2', product_name: 'Compost Organique Bio', category: 'bio-engrais', date_applied: '2026-06-15', dar_days: 0, target: 'Amendement du sol', notes: 'Application en fond pour améliorer la fertilité.', harvest_ready: true },
    { id: 'TR-004', enterprise_id: 'ka_farm', parcel_id: 'P-003', crop_id: null, crop_name: 'Chou Cabus', parcel_name: 'Parcelle Sud - Planche 1', product_name: 'Ridomil Gold', category: 'chimique-phytosanitaire', date_applied: '2026-06-22', dar_days: 14, target: 'Mildiou', notes: 'Traitement fongicide préventif.', harvest_ready: false }
  ];

  let serverCropProfits = [
    { id: 'PROF-001', enterprise_id: 'ka_farm', crop_name: 'Tomate Mongal F1', parcel_id: 'P-001', parcel_name: 'Parcelle Nord - Planche 2', yield_kg: 5000, price_per_kg: 650, revenue: 3250000, costs: { seeds: 150000, fertilizer: 200000, water: 100000, labor: 300000 }, total_cost: 750000, net_margin: 2500000, profitability_percent: 333.33, period: '2026-06-25', notes: 'Excellent rendement grâce au goutte-à-goutte. Marge exceptionnelle cette saison.' },
    { id: 'PROF-002', enterprise_id: 'ka_farm', crop_name: 'Oignon Rouge de Galmi', parcel_id: 'P-002', parcel_name: 'Parcelle Est - Grand Champ', yield_kg: 8000, price_per_kg: 500, revenue: 4000000, costs: { seeds: 200000, fertilizer: 150000, water: 80000, labor: 400000 }, total_cost: 830000, net_margin: 3170000, profitability_percent: 382.05, period: '2026-06-20', notes: 'Culture très rentable. Prix stable sur le marché de Sandiara.' },
    { id: 'PROF-003', enterprise_id: 'ka_farm', crop_name: 'Piment Oiseau', parcel_id: 'P-003', parcel_name: 'Parcelle Sud - Planche 1', yield_kg: 1500, price_per_kg: 1200, revenue: 1800000, costs: { seeds: 80000, fertilizer: 50000, water: 30000, labor: 150000 }, total_cost: 310000, net_margin: 1490000, profitability_percent: 480.65, period: '2026-06-28', notes: 'Petite surface mais très haut prix au kg. Culture stratégique.' },
    { id: 'PROF-004', enterprise_id: 'ka_farm', crop_name: 'Chou Cabus', parcel_id: 'P-004', parcel_name: 'Zone Ombragée - Bac A', yield_kg: 3000, price_per_kg: 400, revenue: 1200000, costs: { seeds: 60000, fertilizer: 40000, water: 25000, labor: 200000 }, total_cost: 325000, net_margin: 875000, profitability_percent: 269.23, period: '2026-06-15', notes: 'Culture d\'hivernage. Bon rendement sous ombrage.' }
  ];

  let serverAttendance = [
    { employeeId: 'E-001', date: '2026-06-25', status: 'Présent', notes: '' },
    { employeeId: 'E-002', date: '2026-06-25', status: 'Présent', notes: '' },
    { employeeId: 'E-001', date: '2026-06-26', status: 'Présent', notes: '' },
    { employeeId: 'E-002', date: '2026-06-26', status: 'Présent', notes: '' }
  ];

  let serverPayments = [
    { id: 'PAY-001', employeeId: 'E-001', amount: 80000, date: '2026-06-15', periodStart: '2026-06-01', periodEnd: '2026-06-15', paymentMethod: 'Orange Money', status: 'Payé' },
    { id: 'PAY-002', employeeId: 'E-002', amount: 100000, date: '2026-06-15', periodStart: '2026-06-01', periodEnd: '2026-06-15', paymentMethod: 'Wave', status: 'Payé' }
  ];

  // ==================== MESSAGES ====================
  app.get('/api/messages', async (req, res) => {
    if (usePostgres && pool) {
      try {
        const result = await pool.query('SELECT * FROM messages ORDER BY timestamp DESC');
        res.json(result.rows);
        return;
      } catch (err) {
        console.error('Error fetching messages from PostgreSQL:', err);
      }
    }
    res.json(serverMessages);
  });

  app.post('/api/messages', async (req, res) => {
    const { id, senderEmail, senderName, text, timestamp, isPrivate, image } = req.body;
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
        res.json({ success: true, message: newMsg });
        return;
      } catch (err) {
        console.error('Error saving message to PostgreSQL:', err);
      }
    }
    
    serverMessages.push(newMsg);
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
        console.error('Error fetching treatments from PostgreSQL:', err);
      }
    }
    res.json(serverTreatments);
  });

  app.post('/api/treatments', async (req, res) => {
    const treatment = req.body;
    if (!treatment || !treatment.id || !treatment.product_name) {
      return res.status(400).json({ error: 'ID et nom du produit requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO traitements_phytosanitaires (id, enterprise_id, parcel_id, crop_id, crop_name, parcel_name, product_name, category, date_applied, dar_days, target, notes, harvest_ready) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [treatment.id, treatment.enterprise_id || 'ka_farm', treatment.parcel_id, treatment.crop_id, treatment.crop_name, treatment.parcel_name, treatment.product_name, treatment.category, treatment.date_applied, treatment.dar_days, treatment.target, treatment.notes, treatment.harvest_ready]
        );
        res.json({ success: true, treatment });
        return;
      } catch (err) {
        console.error('Error saving treatment to PostgreSQL:', err);
      }
    }
    
    const existing = serverTreatments.find(t => t.id === treatment.id);
    if (existing) {
      const idx = serverTreatments.findIndex(t => t.id === treatment.id);
      serverTreatments[idx] = { ...existing, ...treatment };
    } else {
      serverTreatments.push(treatment);
    }
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
          console.error('Error syncing treatments to PostgreSQL:', err);
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
        console.error('Error fetching crop profits from PostgreSQL:', err);
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
        console.error('Error saving crop profit to PostgreSQL:', err);
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
          console.error('Error syncing crop profits to PostgreSQL:', err);
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
        console.error('Error fetching stocks from PostgreSQL:', err);
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
          console.error('Error syncing stocks to PostgreSQL:', err);
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
        console.error('Error fetching crops from PostgreSQL:', err);
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
        console.error('Error saving crop to PostgreSQL:', err);
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
        console.error('Error fetching parcelles from PostgreSQL:', err);
      }
    }
    res.json(serverParcelles);
  });

  app.post('/api/parcelles', async (req, res) => {
    const parcelle = req.body;
    if (!parcelle || !parcelle.id || !parcelle.name) {
      return res.status(400).json({ error: 'ID et nom requis' });
    }
    
    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO parcelles (id, enterprise_id, name, surface, lat, lng, status, type_sol, history, current_crop, water_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [parcelle.id, 'ka_farm', parcelle.name, parcelle.surface, parcelle.lat, parcelle.lng, parcelle.status, parcelle.type_sol || 'sableux', parcelle.history, parcelle.currentCrop, parcelle.waterStatus]
        );
        res.json({ success: true, parcelle });
        return;
      } catch (err) {
        console.error('Error saving parcelle to PostgreSQL:', err);
      }
    }
    
    const existing = serverParcelles.find(p => p.id === parcelle.id);
    if (existing) {
      const idx = serverParcelles.findIndex(p => p.id === parcelle.id);
      serverParcelles[idx] = { ...existing, ...parcelle };
    } else {
      serverParcelles.push(parcelle);
    }
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
        console.error('Error fetching tasks from PostgreSQL:', err);
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
        console.error('Error saving task to PostgreSQL:', err);
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
        console.error('Error fetching finances from PostgreSQL:', err);
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
        console.error('Error saving finance to PostgreSQL:', err);
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
        console.error('Error fetching employees from PostgreSQL:', err);
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
        console.error('Error saving employee to PostgreSQL:', err);
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
        console.error('Error fetching cheptel from PostgreSQL:', err);
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
        console.error('Error saving cheptel to PostgreSQL:', err);
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
        console.error('Error fetching elevage production from PostgreSQL:', err);
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
        console.error('Error saving elevage production to PostgreSQL:', err);
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
        console.error('Error fetching elevage health from PostgreSQL:', err);
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
        console.error('Error saving elevage health to PostgreSQL:', err);
      }
    }
    
    serverElevageHealth.push(log);
    res.json({ success: true, log });
  });

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
      console.error('Error calling Gemini API:', error);
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
      console.error('Error fetching weather:', error);
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
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
      let response = null;
      let lastError = null;

      for (let attempt = 1; attempt <= 2; attempt++) {
        for (const model of modelsToTry) {
          try {
            response = await ai.models.generateContent({
              model: model,
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              }
            });
            if (response && response.text) {
              break;
            }
          } catch (err) {
            lastError = err;
            await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
          }
        }
        if (response && response.text) {
          break;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('Impossible de générer une réponse de l\'IA après plusieurs tentatives');
      }

      return res.json({ text: response.text });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
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
      console.error('Error fetching weather:', error);
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
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});