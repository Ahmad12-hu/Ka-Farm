import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import path from 'path';
import fs from 'fs';
import { logger } from '../js/modules/logger.js';

// Initialize Firebase
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let firebaseApp, db;
try {
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');
  } else {
    console.warn("firebase-applet-config.json not found in Vercel runtime. Using in-memory fallback.");
  }
} catch (e) {
  logger.error("Failed to initialize Firebase in Vercel function", { error: e.message });
}

const app = express();
app.use(express.json());

// In-memory fallback stores
let serverMessages = [
  { id: 'msg-1', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'Salam Aly ! J\'ai fini de vérifier le système de goutte-à-goutte sur la parcelle A. Tout fonctionne bien pour les tomates 🍅.', timestamp: '2026-06-25T08:30:00.000Z', isPrivate: false },
  { id: 'msg-2', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'Wa alaykoum salam Moussa. Alhamdoulilah ! Et qu\'en est-il du stock de compost bio ? Est-ce qu\'on a assez pour la pépinière de poivrons ?', timestamp: '2026-06-25T09:15:00.000Z', isPrivate: false },
  { id: 'msg-3', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'On a encore environ 350 kg en réserve, mais ce serait bien d\'en commander 500 kg supplémentaires pour juillet 🌱.', timestamp: '2026-06-25T09:40:00.000Z', isPrivate: false },
  { id: 'msg-4', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'D\'accord, c\'est noté. Je passe la commande aujourd\'hui depuis le bureau de Dakar 💻.', timestamp: '2026-06-25T10:00:00.000Z', isPrivate: false }
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

// Helper to sync with Firestore or return in-memory data
async function syncWithFirestore(collection, fallbackData) {
  try {
    if (!db) throw new Error("Database not initialized");
    const docSnap = await getDoc(doc(db, "app_data", collection));
    if (docSnap.exists()) {
      return docSnap.data().data || fallbackData;
    }
    return fallbackData;
  } catch (err) {
    logger.error(`Firestore read error for ${collection}`, { error: err.message });
    return fallbackData;
  }
}

async function saveToFirestore(collection, data) {
  try {
    if (!db) throw new Error("Database not initialized");
    await setDoc(doc(db, "app_data", collection), { data, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (err) {
    logger.error(`Firestore write error for ${collection}`, { error: err.message });
    return { success: false, fallback: true };
  }
}

// ==================== CROPS ====================
app.get('/api/crops', async (req, res) => {
  const data = await syncWithFirestore('crops', serverCrops);
  res.json(data);
});

app.post('/api/crops', async (req, res) => {
  const crop = req.body;
  if (!crop || !crop.id || !crop.name) {
    return res.status(400).json({ error: 'ID et nom requis' });
  }
  const existing = serverCrops.find(c => c.id === crop.id);
  if (existing) {
    const idx = serverCrops.findIndex(c => c.id === crop.id);
    serverCrops[idx] = { ...existing, ...crop };
  } else {
    serverCrops.push(crop);
  }
  await saveToFirestore('crops', serverCrops);
  res.json({ success: true, crop });
});

app.put('/api/crops/:id', async (req, res) => {
  const { id } = req.params;
  const patch = req.body;
  const idx = serverCrops.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Culture non trouvée' });
  serverCrops[idx] = { ...serverCrops[idx], ...patch };
  await saveToFirestore('crops', serverCrops);
  res.json({ success: true, crop: serverCrops[idx] });
});

app.delete('/api/crops/:id', async (req, res) => {
  const { id } = req.params;
  serverCrops = serverCrops.filter(c => c.id !== id);
  await saveToFirestore('crops', serverCrops);
  res.json({ success: true });
});

// ==================== PARCELLES ====================
app.get('/api/parcelles', async (req, res) => {
  const data = await syncWithFirestore('parcelles', serverParcelles);
  res.json(data);
});

app.post('/api/parcelles', async (req, res) => {
  const parcelle = req.body;
  if (!parcelle || !parcelle.id || !parcelle.name) {
    return res.status(400).json({ error: 'ID et nom requis' });
  }
  const existing = serverParcelles.find(p => p.id === parcelle.id);
  if (existing) {
    const idx = serverParcelles.findIndex(p => p.id === parcelle.id);
    serverParcelles[idx] = { ...existing, ...parcelle };
  } else {
    serverParcelles.push(parcelle);
  }
  await saveToFirestore('parcelles', serverParcelles);
  res.json({ success: true, parcelle });
});

app.put('/api/parcelles/:id', async (req, res) => {
  const { id } = req.params;
  const patch = req.body;
  const idx = serverParcelles.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Parcelle non trouvée' });
  serverParcelles[idx] = { ...serverParcelles[idx], ...patch };
  await saveToFirestore('parcelles', serverParcelles);
  res.json({ success: true, parcelle: serverParcelles[idx] });
});

app.delete('/api/parcelles/:id', async (req, res) => {
  const { id } = req.params;
  serverParcelles = serverParcelles.filter(p => p.id !== id);
  await saveToFirestore('parcelles', serverParcelles);
  res.json({ success: true });
});

// ==================== TASKS ====================
app.get('/api/tasks', async (req, res) => {
  const data = await syncWithFirestore('tasks', serverTasks);
  res.json(data);
});

app.post('/api/tasks', async (req, res) => {
  const task = req.body;
  if (!task || !task.id || !task.title) {
    return res.status(400).json({ error: 'ID et titre requis' });
  }
  const existing = serverTasks.find(t => t.id === task.id);
  if (existing) {
    const idx = serverTasks.findIndex(t => t.id === task.id);
    serverTasks[idx] = { ...existing, ...task };
  } else {
    serverTasks.push(task);
  }
  await saveToFirestore('tasks', serverTasks);
  res.json({ success: true, task });
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const patch = req.body;
  const idx = serverTasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Tâche non trouvée' });
  serverTasks[idx] = { ...serverTasks[idx], ...patch };
  await saveToFirestore('tasks', serverTasks);
  res.json({ success: true, task: serverTasks[idx] });
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  serverTasks = serverTasks.filter(t => t.id !== id);
  await saveToFirestore('tasks', serverTasks);
  res.json({ success: true });
});

// ==================== FINANCES ====================
app.get('/api/finances', async (req, res) => {
  const data = await syncWithFirestore('finances', serverFinances);
  res.json(data);
});

app.post('/api/finances', async (req, res) => {
  const finance = req.body;
  if (!finance || !finance.id || !finance.description) {
    return res.status(400).json({ error: 'ID et description requis' });
  }
  const existing = serverFinances.find(f => f.id === finance.id);
  if (existing) {
    const idx = serverFinances.findIndex(f => f.id === finance.id);
    serverFinances[idx] = { ...existing, ...finance };
  } else {
    serverFinances.push(finance);
  }
  await saveToFirestore('finances', serverFinances);
  res.json({ success: true, finance });
});

app.delete('/api/finances/:id', async (req, res) => {
  const { id } = req.params;
  serverFinances = serverFinances.filter(f => f.id !== id);
  await saveToFirestore('finances', serverFinances);
  res.json({ success: true });
});

// ==================== EMPLOYEES ====================
app.get('/api/employees', async (req, res) => {
  const data = await syncWithFirestore('employees', serverEmployees);
  res.json(data);
});

app.post('/api/employees', async (req, res) => {
  const employee = req.body;
  if (!employee || !employee.id || !employee.name) {
    return res.status(400).json({ error: 'ID et nom requis' });
  }
  const existing = serverEmployees.find(e => e.id === employee.id);
  if (existing) {
    const idx = serverEmployees.findIndex(e => e.id === employee.id);
    serverEmployees[idx] = { ...existing, ...employee };
  } else {
    serverEmployees.push(employee);
  }
  await saveToFirestore('employees', serverEmployees);
  res.json({ success: true, employee });
});

app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const patch = req.body;
  const idx = serverEmployees.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Employé non trouvé' });
  serverEmployees[idx] = { ...serverEmployees[idx], ...patch };
  await saveToFirestore('employees', serverEmployees);
  res.json({ success: true, employee: serverEmployees[idx] });
});

app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  serverEmployees = serverEmployees.filter(e => e.id !== id);
  await saveToFirestore('employees', serverEmployees);
  res.json({ success: true });
});

// ==================== ELEVAGE / CHEPTEL ====================
app.get('/api/cheptel', async (req, res) => {
  const data = await syncWithFirestore('cheptel', serverCheptel);
  res.json(data);
});

app.post('/api/cheptel', async (req, res) => {
  const group = req.body;
  if (!group || !group.id || !group.name) {
    return res.status(400).json({ error: 'ID et nom requis' });
  }
  const existing = serverCheptel.find(c => c.id === group.id);
  if (existing) {
    const idx = serverCheptel.findIndex(c => c.id === group.id);
    serverCheptel[idx] = { ...existing, ...group };
  } else {
    serverCheptel.push(group);
  }
  await saveToFirestore('cheptel', serverCheptel);
  res.json({ success: true, group });
});

app.put('/api/cheptel/:id', async (req, res) => {
  const { id } = req.params;
  const patch = req.body;
  const idx = serverCheptel.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Groupe d\'élevage non trouvé' });
  serverCheptel[idx] = { ...serverCheptel[idx], ...patch };
  await saveToFirestore('cheptel', serverCheptel);
  res.json({ success: true, group: serverCheptel[idx] });
});

app.delete('/api/cheptel/:id', async (req, res) => {
  const { id } = req.params;
  serverCheptel = serverCheptel.filter(c => c.id !== id);
  await saveToFirestore('cheptel', serverCheptel);
  res.json({ success: true });
});

// ==================== ELEVAGE PRODUCTION ====================
app.get('/api/elevage/production', async (req, res) => {
  const data = await syncWithFirestore('elevage_production', serverElevageProduction);
  const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sorted);
});

app.post('/api/elevage/production', async (req, res) => {
  const log = req.body;
  if (!log || !log.id || !log.type) {
    return res.status(400).json({ error: 'ID et type requis' });
  }
  serverElevageProduction.push(log);
  await saveToFirestore('elevage_production', serverElevageProduction);
  res.json({ success: true, log });
});

app.delete('/api/elevage/production/:id', async (req, res) => {
  const { id } = req.params;
  serverElevageProduction = serverElevageProduction.filter(l => l.id !== id);
  await saveToFirestore('elevage_production', serverElevageProduction);
  res.json({ success: true });
});

// ==================== ELEVAGE HEALTH ====================
app.get('/api/elevage/health', async (req, res) => {
  const data = await syncWithFirestore('elevage_health', serverElevageHealth);
  const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sorted);
});

app.post('/api/elevage/health', async (req, res) => {
  const log = req.body;
  if (!log || !log.id || !log.intervention) {
    return res.status(400).json({ error: 'ID et intervention requis' });
  }
  serverElevageHealth.push(log);
  await saveToFirestore('elevage_health', serverElevageHealth);
  res.json({ success: true, log });
});

app.delete('/api/elevage/health/:id', async (req, res) => {
  const { id } = req.params;
  serverElevageHealth = serverElevageHealth.filter(l => l.id !== id);
  await saveToFirestore('elevage_health', serverElevageHealth);
  res.json({ success: true });
});

// ==================== MESSAGES ====================
app.get('/api/messages', async (req, res) => {
  const data = await syncWithFirestore('messages', serverMessages);
  res.json(data);
});

app.post('/api/messages', async (req, res) => {
  const { id, senderEmail, senderName, text, timestamp, isPrivate } = req.body;
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
  serverMessages.push(newMsg);
  await saveToFirestore('messages', serverMessages);
  res.json({ success: true, message: newMsg });
});

// ==================== STOCKS ====================
app.get('/api/stocks', async (req, res) => {
  const data = await syncWithFirestore('stocks', serverStocks);
  res.json(data);
});

app.post('/api/stocks', async (req, res) => {
  const { stocks } = req.body;
  if (stocks && Array.isArray(stocks)) {
    serverStocks = stocks;
    await saveToFirestore('stocks', serverStocks);
    res.json({ success: true, message: 'Stocks synchronisés', stocks });
  } else {
    res.status(400).json({ error: 'Données de stock invalides' });
  }
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

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = "Tu es KA-Farm Agro-Advisor, un conseiller horticole et maraîcher expert d'Afrique de l'Ouest (Sénégal), chaleureux, pragmatique, direct et scientifique. Tu réponds en français. Tu es spécialisé exclusivement dans le maraîchage (cultures de légumes, fines herbes, fruits de jardin, pépinières, irrigation goutte-à-goutte ou aspersion, maladies horticoles comme la mineuse de la tomate Tuta absoluta, le mildiou, l'oïdium, les thrips, et l'usage de biopesticides locaux comme le neem ou le piment). Tu aides à diagnostiquer les ravageurs et maladies des légumes, planifier les pépinières maraîchères et le repiquage, optimiser l'arrosage et les amendements (compost organique, fumier) de manière écologique et agroécologique. Donne des réponses concises, claires, structurées et adaptées aux conditions locales ouest-africaines.";

    const contents = [];
    if (history && Array.isArray(history) && history.length > 0) {
      history.forEach((m) => {
        if (!m?.text) return;
        contents.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        });
      });
    }

    const requestParts = [{ text: prompt }];
    if (image) {
      const mimeMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      if (!mimeMatch) {
        return res.status(400).json({ error: 'Format d\'image invalide' });
      }
      requestParts.push({
        inlineData: {
          mimeType: mimeMatch[1],
          data: image.split(',')[1]
        }
      });
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
    let response = null;
    let lastError = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      for (const model of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: model,
            contents: contents.length > 0 ? [...contents, { role: 'user', parts: requestParts }] : requestParts,
            config: {
              systemInstruction,
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

export default app;