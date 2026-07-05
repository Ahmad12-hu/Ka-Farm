import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import path from 'path';
import fs from 'fs';

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
  console.error("Failed to initialize Firebase in Vercel function:", e);
}

const app = express();
app.use(express.json());

// In-memory fallback message store for brothers discussion
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

app.get('/api/messages', async (req, res) => {
  try {
    if (!db) throw new Error("Database not initialized");
    const docSnap = await getDoc(doc(db, "app_data", "messages"));
    if (docSnap.exists()) {
      return res.json(docSnap.data().data || []);
    } else {
      return res.json(serverMessages);
    }
  } catch (err) {
    console.error("Firestore read error for messages:", err);
    return res.json(serverMessages);
  }
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
  
  try {
    if (!db) throw new Error("Database not initialized");
    const docRef = doc(db, "app_data", "messages");
    const docSnap = await getDoc(docRef);
    const currentMessages = docSnap.exists() ? (docSnap.data().data || []) : [...serverMessages];
    currentMessages.push(newMsg);
    
    await setDoc(docRef, { data: currentMessages, updatedAt: new Date().toISOString() });
    return res.json(currentMessages);
  } catch (err) {
    console.error("Firestore write error for messages:", err);
    serverMessages.push(newMsg);
    return res.json(serverMessages);
  }
});

app.get('/api/stocks', async (req, res) => {
  try {
    if (!db) throw new Error("Database not initialized");
    const docSnap = await getDoc(doc(db, "app_data", "stocks"));
    if (docSnap.exists()) {
      return res.json(docSnap.data().data || []);
    } else {
      return res.json(serverStocks);
    }
  } catch (err) {
    console.error("Firestore read error for stocks:", err);
    return res.json(serverStocks);
  }
});

app.post('/api/stocks', async (req, res) => {
  const { stocks } = req.body;
  if (stocks && Array.isArray(stocks)) {
    try {
      if (!db) throw new Error("Database not initialized");
      await setDoc(doc(db, "app_data", "stocks"), { data: stocks, updatedAt: new Date().toISOString() });
      return res.json({ success: true, message: 'Stocks synchronisés avec succès', stocks });
    } catch (err) {
      console.error("Firestore write error for stocks:", err);
      return res.json({ success: true, message: 'Stocks synchronisés en mémoire', stocks });
    }
  } else {
    return res.status(400).json({ error: 'Données de stock invalides' });
  }
});

app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt requis' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Clé GEMINI_API_KEY non configurée. Veuillez l\'ajouter dans l\'onglet Environment Variables de Vercel.' });
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

    let contents = prompt;
    if (history && Array.isArray(history) && history.length > 0) {
      const formattedHistory = history.map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Conseiller'}: ${m.text}`).join('\n');
      contents = `${formattedHistory}\nUtilisateur: ${prompt}\nConseiller:`;
    }

    const modelsToTry = ['gemini-3.5-flash', 'gemini-flash-latest'];
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

app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Coordonnées lat et lon requises' });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }
    const data = await response.json();
    return res.json({
      temp: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      weather_code: data.current.weather_code
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des données météo' });
  }
});

export default app;
