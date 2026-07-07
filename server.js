import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

let DB;
let usePostgres = false;
try {
  const { DB: dbModule } = await import('./js/db.js');
  DB = dbModule;
  await DB.init();
  usePostgres = true;
} catch (e) {
  console.warn('[Server] Module DB non disponible, mode mémoire/localStorage uniquement:', e.message);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  // In-memory fallback message store for brothers discussion
  let serverMessages = [
    { id: 'msg-1', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'Salam Aly ! J\'ai fini de vérifier le système de goutte-à-goutte sur la parcelle A. Tout fonctionne bien pour les tomates 🍅.', timestamp: '2026-06-25T08:30:00.000Z', isPrivate: false, image: null },
    { id: 'msg-2', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'Wa alaykoum salam Moussa. Alhamdoulilah ! Et qu\'en est-il du stock de compost bio ? Est-ce qu\'on a assez pour la pépinière de poivrons ?', timestamp: '2026-06-25T09:15:00.000Z', isPrivate: false, image: null },
    { id: 'msg-3', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'On a encore environ 350 kg en réserve, mais ce serait bien d\'en commander 500 kg supplémentaires pour juillet 🌱.', timestamp: '2026-06-25T09:40:00.000Z', isPrivate: false, image: null },
    { id: 'msg-4', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'D\'accord, c\'est noté. Je passe la commande aujourd\'hui depuis le bureau de Dakar 💻.', timestamp: '2026-06-25T10:00:00.000Z', isPrivate: false, image: null }
  ];

  app.get('/api/messages', async (req, res) => {
    try {
      if (usePostgres && DB) {
        const rows = await DB.list('messages', { orderBy: 'timestamp DESC' });
        return res.json(rows.reverse());
      }
      res.json(serverMessages);
    } catch (err) {
      console.error("DB read error for messages:", err);
      res.json(serverMessages);
    }
  });

  app.post('/api/messages', async (req, res) => {
    const { id, senderEmail, senderName, text, timestamp, isPrivate, image } = req.body;
    if (!senderEmail || (!text && !image)) {
      return res.status(400).json({ error: 'Champs requis manquants (texte ou image nécessaire)' });
    }
    const newMsg = {
      id: id || 'msg-' + Date.now(),
      senderEmail,
      senderName: senderName || senderEmail,
      text: text || '',
      timestamp: timestamp || new Date().toISOString(),
      isPrivate: !!isPrivate,
      image: image || null
    };

    try {
      if (usePostgres && DB) {
        await DB.insert('messages', newMsg);
        const rows = await DB.list('messages', { orderBy: 'timestamp ASC' });
        return res.json(rows);
      }
      serverMessages.push(newMsg);
      res.json(serverMessages);
    } catch (err) {
      console.error("DB write error for messages:", err);
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

  app.get('/api/stocks', async (req, res) => {
    try {
      if (usePostgres && DB) {
        const rows = await DB.list('stocks', { orderBy: 'name ASC' });
        return res.json(rows);
      }
      res.json(serverStocks);
    } catch (err) {
      console.error("DB read error for stocks:", err);
      res.json(serverStocks);
    }
  });

  app.post('/api/stocks', async (req, res) => {
    const { stocks } = req.body;
    if (stocks && Array.isArray(stocks)) {
      try {
        if (usePostgres && DB) {
          await DB.delete('stocks', 'all');
          await DB.insertMany('stocks', stocks.map(s => ({ ...s, enterprise_id: 'ka_farm' })));
          const rows = await DB.list('stocks', { orderBy: 'name ASC' });
          return res.json({ success: true, message: 'Stocks synchronisés avec succès', stocks: rows });
        }
        serverStocks = stocks;
        res.json({ success: true, message: 'Stocks synchronisés en mémoire', stocks: serverStocks });
      } catch (err) {
        console.error("DB write error for stocks:", err);
        serverStocks = stocks;
        res.json({ success: true, message: 'Stocks synchronisés en mémoire', stocks: serverStocks });
      }
    } else {
      res.status(400).json({ error: 'Données de stock invalides' });
    }
  });

  // API router for Gemini
  app.post('/api/gemini', async (req, res) => {
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

      const systemInstruction = "Tu es KA-Farm Agro-Advisor, un conseiller horticole et maraîcher expert d'Afrique de l'Ouest (Sénégal), chaleureux, pragmatique, direct et scientifique. Tu réponds en français. Tu es spécialisé exclusivement dans le maraîchage (cultures de légumes, fines herbes, fruits de jardin, pépinières, irrigation goutte-à-goutte ou aspersion, maladies horticoles comme la mineuse de la tomate Tuta absoluta, le mildiou, l'oïdium, les thrips, et l'usage de biopesticides locaux comme le neem ou le piment). IMPORTANT : Pour les questions concernant la santé humaine, la consommation alimentaire, ou les traitements phytosanitaires chimiques, ajoute toujours un avertissement prudent et recommande de consulter un expert local ou un agronome certifié. Tes conseils sont basés sur les meilleures pratiques agroécologiques ouest-africaines mais ne remplacent pas l'avis d'un professionnel. Donne des réponses concises, claires, structurées et adaptées aux conditions locales ouest-africaines.";

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
      console.error('Error fetching weather from Open-Meteo:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des données météo en temps réel' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  // Mount API only if PostgreSQL is enabled
  if (usePostgres && DB) {
    const createApiRouter = (await import('./api/index.js')).default;
    app.use('/api', createApiRouter());
  }

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
