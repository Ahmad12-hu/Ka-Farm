import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

dotenv.config();

// Load Firebase configuration
const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve('firebase-applet-config.json'), 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

function apiAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    return next();
  }
  res.status(401).json({ error: 'Accès refusé' });
}

function sanitizeText(text) {
  return String(text || '').replace(/<[^>]*>/g, '').trim();
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  // In-memory fallback message store for brothers discussion
  let serverMessages = [
    { id: 'msg-1', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'Salam Aly ! J\'ai fini de vérifier le système de goutte-à-goutte sur la parcelle A. Tout fonctionne bien pour les tomates 🍅.', timestamp: '2026-06-25T08:30:00.000Z', isPrivate: false },
    { id: 'msg-2', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'Wa alaykoum salam Moussa. Alhamdoulilah ! Et qu\'en est-il du stock de compost bio ? Est-ce qu\'on a assez pour la pépinière de poivrons ?', timestamp: '2026-06-25T09:15:00.000Z', isPrivate: false },
    { id: 'msg-3', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'On a encore environ 350 kg en réserve, mais ce serait bien d\'en commander 500 kg supplémentaires pour juillet 🌱.', timestamp: '2026-06-25T09:40:00.000Z', isPrivate: false },
    { id: 'msg-4', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'D\'accord, c\'est noté. Je passe la commande aujourd\'hui depuis le bureau de Dakar 💻.', timestamp: '2026-06-25T10:00:00.000Z', isPrivate: false }
  ];

  app.get('/api/messages', apiAuth, async (req, res) => {
    try {
      const docSnap = await getDoc(doc(db, "app_data", "messages"));
      if (docSnap.exists()) {
        res.json(docSnap.data().data || []);
      } else {
        res.json(serverMessages);
      }
    } catch (err) {
      console.error("Firestore read error for messages:", err);
      res.json(serverMessages);
    }
  });

  app.post('/api/messages', apiAuth, async (req, res) => {
    const { id, senderEmail, senderName, text, timestamp, isPrivate } = req.body;
    const cleanText = sanitizeText(text);
    if (!senderEmail || !text) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    const newMsg = {
      id: id || 'msg-' + Date.now(),
      senderEmail: sanitizeText(senderEmail),
      senderName: sanitizeText(senderName),
      text: cleanText,
      timestamp: timestamp || new Date().toISOString(),
      isPrivate: !!isPrivate
    };
    
    try {
      const docRef = doc(db, "app_data", "messages");
      const docSnap = await getDoc(docRef);
      const currentMessages = docSnap.exists() ? (docSnap.data().data || []) : [...serverMessages];
      currentMessages.push(newMsg);
      
      await setDoc(docRef, { data: currentMessages, updatedAt: new Date().toISOString() });
      res.json(currentMessages);
    } catch (err) {
      console.error("Firestore write error for messages:", err);
      serverMessages.push(newMsg);
      res.json(serverMessages);
    }
  });

  // In-memory fallback stocks store
  let serverStocks = [
    { id: 'S-301', name: 'Compost Organique Bio', category: 'Amendements', quantity: 350, maxQuantity: 1000, unit: 'kg' },
    { id: 'S-302', name: 'Semences Tomate Mongal F1', category: 'Semences', quantity: 12, maxQuantity: 50, unit: 'sachets' },
    { id: 'S-303', name: 'Purin de Neem (Insecticide)', category: 'Traitements', quantity: 45, maxQuantity: 100, unit: 'L' },
    { id: 'S-304', name: 'Fumier de Mouton séché', category: 'Amendements', quantity: 150, maxQuantity: 800, unit: 'kg' },
    { id: 'S-305', name: 'Aliments Concentrés Bovins', category: 'Alimentation', quantity: 180, maxQuantity: 1000, unit: 'kg' }
  ];

  app.get('/api/stocks', apiAuth, async (req, res) => {
    try {
      const docSnap = await getDoc(doc(db, "app_data", "stocks"));
      if (docSnap.exists()) {
        res.json(docSnap.data().data || []);
      } else {
        res.json(serverStocks);
      }
    } catch (err) {
      console.error("Firestore read error for stocks:", err);
      res.json(serverStocks);
    }
  });

  app.post('/api/stocks', apiAuth, async (req, res) => {
    const { stocks } = req.body;
    if (stocks && Array.isArray(stocks)) {
      try {
        await setDoc(doc(db, "app_data", "stocks"), { data: stocks, updatedAt: new Date().toISOString() });
        res.json({ success: true, message: 'Stocks synchronisés avec succès', stocks });
      } catch (err) {
        console.error("Firestore write error for stocks:", err);
        serverStocks = stocks;
        res.json({ success: true, message: 'Stocks synchronisés en mémoire', stocks: serverStocks });
      }
    } else {
      res.status(400).json({ error: 'Données de stock invalides' });
    }
  });

  // API router for Gemini
  app.post('/api/gemini', apiAuth, async (req, res) => {
    try {
      const { prompt, history } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt requis' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY non configurée dans les Secrets d\'AI Studio.' });
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
        // Build contents showing recent history
        const formattedHistory = history.map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Conseiller'}: ${m.text}`).join('\n');
        contents = `${formattedHistory}\nUtilisateur: ${prompt}\nConseiller:`;
      }

      const modelsToTry = ['gemini-3.5-flash', 'gemini-flash-latest'];
      let response = null;
      let lastError = null;

      for (let attempt = 1; attempt <= 2; attempt++) {
        for (const model of modelsToTry) {
          try {
            console.log(`Trying Gemini with model: ${model} (attempt ${attempt}/2)`);
            response = await ai.models.generateContent({
              model: model,
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              }
            });
            if (response && response.text) {
              break; // Success!
            }
          } catch (err) {
            console.error(`Error with model ${model} on attempt ${attempt}:`, err);
            lastError = err;
            // Short backoff before next try
            await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
          }
        }
        if (response && response.text) {
          break;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('Impossible de générer une réponse après plusieurs tentatives');
      }

      return res.json({ text: response.text });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return res.status(500).json({ error: error.message || 'Erreur interne du serveur' });
    }
  });

  // API router for real weather proxy
  app.get('/api/weather', apiAuth, async (req, res) => {
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
      console.error('Error fetching weather from Open-Meteo:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des données météo en temps réel' });
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
    // Serve static files from dist with html extensions support
    app.use(express.static(path.resolve('dist'), { extensions: ['html'] }));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
