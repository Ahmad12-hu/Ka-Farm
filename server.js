/**
 * Serveur local de développement uniquement - ne pas déployer en production
 * La production sur Vercel utilise api/index.js à la place
 */
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { logger } from "./js/modules/logger.js";
import {
  validateBody,
  CropSchema,
  ParcelleSchema,
  EmployeeSchema,
  FinanceSchema,
  TaskSchema,
  CheptelSchema,
  ElevageProductionSchema,
  ElevageHealthSchema,
  MessageSchema,
  TreatmentSchema,
  CropProfitSchema,
  StocksPayloadSchema,
  TreatmentsSyncSchema,
  CropProfitsSyncSchema,
  AiRequestSchema,
  TranslateSchema,
} from "./js/modules/api-validation.js";
import {
  createGeminiClientFactory,
  geminiKeyFor,
  GEMINI_KEYS_MISSING_ERROR,
} from "./js/modules/gemini-keys.js";
import {
  AI_SYSTEM_PROMPTS,
  buildFarmContext,
  callGeminiWithRetry,
  getAgentDisplayName,
  getAgentDescription,
} from "./js/modules/ai-shared.js";

dotenv.config();

// Middleware de sécurité
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, veuillez réessayer dans 15 minutes." },
});

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes for API writes
  max: 30, // stricter limit for mutations
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de modifications, veuillez réessayer dans 5 minutes." },
});

// Remarque : le code PostgreSQL/Supabase a été retiré du serveur de développement selon le cahier des charges.

async function startServer() {
  const app = express();

  // En-têtes de sécurité
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: [
            "'self'",
            "https://api.open-meteo.com",
            "https://generativelanguage.googleapis.com",
          ],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Configuration CORS
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000",
        "http://localhost:5173",
      ],
      credentials: true,
      optionsSuccessStatus: 204,
    })
  );

  // Limitation de débit
  app.use("/api/", limiter);
  app.use("/api/", apiLimiter);

  app.use(express.json({ limit: "12mb" }));

  // Stockages de repli en mémoire (utilisés lorsque PostgreSQL n'est pas disponible)
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
  let serverTreatments = [];
  let serverCropProfits = [];

  // ==================== MESSAGES ====================
  app.get("/api/messages", async (req, res) => {
    res.json(serverMessages);
  });

  app.post("/api/messages", validateBody(MessageSchema), async (req, res) => {
    try {
      const { id, senderEmail, senderName, text, timestamp, isPrivate } = req.body;

      const newMsg = {
        id: id || "msg-" + Date.now(),
        senderEmail,
        senderName: senderName || senderEmail,
        text,
        timestamp: timestamp || new Date().toISOString(),
        isPrivate: !!isPrivate,
      };

      serverMessages.push(newMsg);
      res.json({ success: true, message: newMsg });
    } catch (err) {
      logger.error("Error saving message", { error: err.message });
      res.status(400).json({ error: err.message || "Erreur de validation" });
    }
  });

  // ==================== TRAITEMENTS PHYTOSANITAIRES ====================
  app.get("/api/treatments", async (req, res) => {
    res.json(serverTreatments);
  });

  app.post("/api/treatments", validateBody(TreatmentSchema), async (req, res) => {
    const treatment = req.body;

    const existing = serverTreatments.find((t) => t.id === treatment.id);
    if (existing) {
      const idx = serverTreatments.findIndex((t) => t.id === treatment.id);
      serverTreatments[idx] = { ...existing, ...treatment };
    } else {
      serverTreatments.push(treatment);
    }
    logger.info("Treatment saved to memory", { treatmentId: treatment.id });
    res.json({ success: true, treatment });
  });

  app.post("/api/treatments/sync", validateBody(TreatmentsSyncSchema), async (req, res) => {
    const { treatments } = req.body;
    serverTreatments = treatments;
    res.json({ success: true, message: "Traitements synchronisés en mémoire", treatments });
  });

  // ==================== CROP PROFITABILITY ====================
  app.get("/api/crop-profits", async (req, res) => {
    res.json(serverCropProfits);
  });

  app.post("/api/crop-profits", validateBody(CropProfitSchema), async (req, res) => {
    const profit = req.body;

    const existing = serverCropProfits.find((p) => p.id === profit.id);
    if (existing) {
      const idx = serverCropProfits.findIndex((p) => p.id === profit.id);
      serverCropProfits[idx] = { ...existing, ...profit };
    } else {
      serverCropProfits.push(profit);
    }
    res.json({ success: true, profit });
  });

  app.post("/api/crop-profits/sync", validateBody(CropProfitsSyncSchema), async (req, res) => {
    const { cropProfits } = req.body;
    serverCropProfits = cropProfits;
    res.json({
      success: true,
      message: "Analyses de rentabilité synchronisées en mémoire",
      cropProfits,
    });
  });

  // ==================== STOCKS ====================
  app.get("/api/stocks", async (req, res) => {
    res.json(serverStocks);
  });

  app.post("/api/stocks", validateBody(StocksPayloadSchema), async (req, res) => {
    const { stocks } = req.body;
    serverStocks = stocks;
    res.json({ success: true, message: "Stocks synchronisés en mémoire", stocks });
  });

  // ==================== CROPS ====================
  app.get("/api/crops", async (req, res) => {
    res.json(serverCrops);
  });

  app.post("/api/crops", validateBody(CropSchema), async (req, res) => {
    const crop = req.body;

    const existing = serverCrops.find((c) => c.id === crop.id);
    if (existing) {
      const idx = serverCrops.findIndex((c) => c.id === crop.id);
      serverCrops[idx] = { ...existing, ...crop };
    } else {
      serverCrops.push(crop);
    }
    res.json({ success: true, crop });
  });

  // ==================== PARCELLES ====================
  app.get("/api/parcelles", async (req, res) => {
    res.json(serverParcelles);
  });

  app.post("/api/parcelles", validateBody(ParcelleSchema), async (req, res) => {
    const parcelle = req.body;

    const existing = serverParcelles.find((p) => p.id === parcelle.id);
    if (existing) {
      const idx = serverParcelles.findIndex((p) => p.id === parcelle.id);
      serverParcelles[idx] = { ...existing, ...parcelle };
    } else {
      serverParcelles.push(parcelle);
    }
    logger.info("Parcelle saved to memory", { parcelleId: parcelle.id });
    res.json({ success: true, parcelle });
  });

  // ==================== TASKS ====================
  app.get("/api/tasks", async (req, res) => {
    res.json(serverTasks);
  });

  app.post("/api/tasks", validateBody(TaskSchema), async (req, res) => {
    const task = req.body;

    const existing = serverTasks.find((t) => t.id === task.id);
    if (existing) {
      const idx = serverTasks.findIndex((t) => t.id === task.id);
      serverTasks[idx] = { ...existing, ...task };
    } else {
      serverTasks.push(task);
    }
    res.json({ success: true, task });
  });

  // ==================== FINANCES ====================
  app.get("/api/finances", async (req, res) => {
    res.json(serverFinances);
  });

  app.post("/api/finances", validateBody(FinanceSchema), async (req, res) => {
    const finance = req.body;

    const existing = serverFinances.find((f) => f.id === finance.id);
    if (existing) {
      const idx = serverFinances.findIndex((f) => f.id === finance.id);
      serverFinances[idx] = { ...existing, ...finance };
    } else {
      serverFinances.push(finance);
    }
    res.json({ success: true, finance });
  });

  // ==================== EMPLOYEES ====================
  app.get("/api/employees", async (req, res) => {
    res.json(serverEmployees);
  });

  app.post("/api/employees", validateBody(EmployeeSchema), async (req, res) => {
    const employee = req.body;

    const existing = serverEmployees.find((e) => e.id === employee.id);
    if (existing) {
      const idx = serverEmployees.findIndex((e) => e.id === employee.id);
      serverEmployees[idx] = { ...existing, ...employee };
    } else {
      serverEmployees.push(employee);
    }
    res.json({ success: true, employee });
  });

  // ==================== ELEVAGE / CHEPTEL ====================
  app.get("/api/cheptel", async (req, res) => {
    res.json(serverCheptel);
  });

  app.post("/api/cheptel", validateBody(CheptelSchema), async (req, res) => {
    const group = req.body;

    const existing = serverCheptel.find((c) => c.id === group.id);
    if (existing) {
      const idx = serverCheptel.findIndex((c) => c.id === group.id);
      serverCheptel[idx] = { ...existing, ...group };
    } else {
      serverCheptel.push(group);
    }
    res.json({ success: true, group });
  });

  // ==================== ELEVAGE PRODUCTION ====================
  app.get("/api/elevage/production", async (req, res) => {
    const sorted = serverElevageProduction.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  });

  app.post("/api/elevage/production", validateBody(ElevageProductionSchema), async (req, res) => {
    const log = req.body;

    serverElevageProduction.push(log);
    res.json({ success: true, log });
  });

  // ==================== ELEVAGE HEALTH ====================
  app.get("/api/elevage/health", async (req, res) => {
    const sorted = serverElevageHealth.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  });

  app.post("/api/elevage/health", validateBody(ElevageHealthSchema), async (req, res) => {
    const log = req.body;

    serverElevageHealth.push(log);
    res.json({ success: true, log });
  });

  // ==================== GEMINI AI ====================
  // Prompts d'agents, contexte RAG, appel Gemini avec repli et libellés :
  // voir js/modules/ai-shared.js (source unique partagée avec api/index.js).

  const getGeminiClient = createGeminiClientFactory(GoogleGenAI);

  // Route principale Gemini améliorée avec agents spécialisés + RAG
  app.post("/api/gemini", validateBody(AiRequestSchema), async (req, res) => {
    try {
      const { prompt, history, image, systemPrompt, model, agentType = "advisor" } = req.body;

      const requestedModel = model || "gemini-3.6-flash";
      if (!geminiKeyFor(requestedModel)) {
        return res.status(500).json({ error: GEMINI_KEYS_MISSING_ERROR });
      }

      let systemInstruction = systemPrompt || AI_SYSTEM_PROMPTS[agentType] || AI_SYSTEM_PROMPTS.advisor;

      if (image && !systemPrompt && agentType === "advisor") {
        systemInstruction = AI_SYSTEM_PROMPTS.plantDoctor;
      }

      const ragContext = buildFarmContext(agentType, {
        crops: serverCrops,
        cheptel: serverCheptel,
        finances: serverFinances,
        parcelles: serverParcelles,
      });
      const enhancedPrompt = ragContext ? `${prompt}${ragContext}` : prompt;

      const contents = [];
      if (history && Array.isArray(history) && history.length > 0) {
        history.forEach((m) => {
          if (!m?.text) return;
          contents.push({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          });
        });
      }

      const requestParts = [{ text: enhancedPrompt }];
      if (image) {
        const mimeMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        if (!mimeMatch) {
          return res.status(400).json({ error: "Format d'image invalide" });
        }
        requestParts.push({
          inlineData: {
            mimeType: mimeMatch[1],
            data: image.split(",")[1],
          },
        });
      }

      const finalContents = contents.length > 0
        ? [...contents, { role: "user", parts: requestParts }]
        : requestParts;

      const response = await callGeminiWithRetry(
        getGeminiClient,
        requestedModel,
        finalContents,
        systemInstruction
      );

      return res.json({ text: response.text });
    } catch (error) {
      // Logger l'erreur exacte renvoyée par l'API Gemini (clé invalide, quota dépassé, mauvais nom de modèle, etc.)
      logger.error("Error calling Gemini API", {
        message: error.message,
        status: error.status,
        code: error.code,
        errorDetails: error.errorDetails,
        stack: error.stack,
      });
      return res.status(500).json({ error: error.message || "Erreur interne de l'API" });
    }
  });

  // ==================== OPENAI FALLBACK ====================
  app.post("/api/ai/openai", validateBody(AiRequestSchema), async (req, res) => {
    try {
      const { prompt, systemPrompt, history, image, model = "gpt-4o-mini" } = req.body;

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Clé OPENAI_API_KEY non configurée" });
      }

      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      if (history && Array.isArray(history)) {
        history.forEach((m) => {
          if (!m?.text) return;
          messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.text });
        });
      }

      const content = [];
      content.push({ type: "text", text: prompt });
      if (image) {
        const mimeMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        if (!mimeMatch) {
          return res.status(400).json({ error: "Format d'image invalide" });
        }
        content.push({
          type: "image_url",
          image_url: { url: image },
        });
      }
      messages.push({ role: "user", content });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("Aucune réponse générée par OpenAI");
      }

      return res.json({ text, provider: "openai" });
    } catch (error) {
      logger.error("Error calling OpenAI API", { error: error.message });
      return res.status(500).json({ error: error.message || "Erreur interne de l'API" });
    }
  });

  // ==================== CLAUDE FALLBACK ====================
  app.post("/api/ai/claude", validateBody(AiRequestSchema), async (req, res) => {
    try {
      const { prompt, systemPrompt, history, image, model = "claude-3-5-haiku-latest" } = req.body;

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Clé ANTHROPIC_API_KEY non configurée" });
      }

      const messages = [];
      if (history && Array.isArray(history)) {
        history.forEach((m) => {
          if (!m?.text) return;
          messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.text });
        });
      }

      let content = prompt;
      if (image) {
        const mimeMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        if (!mimeMatch) {
          return res.status(400).json({ error: "Format d'image invalide" });
        }
        content = [
          { type: "text", text: prompt },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeMatch[1],
              data: image.split(",")[1],
            },
          },
        ];
      }
      messages.push({ role: "user", content });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system: systemPrompt || "Tu es KA-Farm Agro-Advisor, un conseiller agricole expert du Sénégal.",
          messages,
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text;
      if (!text) {
        throw new Error("Aucune réponse générée par Claude");
      }

      return res.json({ text, provider: "claude" });
    } catch (error) {
      logger.error("Error calling Claude API", { error: error.message });
      return res.status(500).json({ error: error.message || "Erreur interne de l'API" });
    }
  });

  // ==================== STREAMING SSE ====================
  app.post("/api/ai/stream", validateBody(AiRequestSchema), async (req, res) => {
    try {
      const { prompt, systemPrompt, history, image, language = "fr", agentType = "advisor" } = req.body;

      const streamModel = "gemini-3.6-flash";
      const ai = getGeminiClient(streamModel);
      if (!ai) {
        return res.status(500).json({ error: GEMINI_KEYS_MISSING_ERROR });
      }

      let systemInstruction = systemPrompt || AI_SYSTEM_PROMPTS[agentType] || AI_SYSTEM_PROMPTS.advisor;
      if (language === "wo") {
        systemInstruction = AI_SYSTEM_PROMPTS.wolofAdvisor;
      }

      const contents = [];
      if (history && Array.isArray(history) && history.length > 0) {
        history.forEach((m) => {
          if (!m?.text) return;
          contents.push({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          });
        });
      }

      const requestParts = [{ text: prompt }];
      if (image) {
        const mimeMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        if (!mimeMatch) {
          return res.status(400).json({ error: "Format d'image invalide" });
        }
        requestParts.push({
          inlineData: {
            mimeType: mimeMatch[1],
            data: image.split(",")[1],
          },
        });
      }

      const finalContents = contents.length > 0
        ? [...contents, { role: "user", parts: requestParts }]
        : requestParts;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      try {
        const stream = await ai.models.generateContentStream({
          model: streamModel,
          contents: finalContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (streamError) {
        res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
        res.end();
      }
    } catch (error) {
      logger.error("Error in AI streaming", { error: error.message });
      res.status(500).json({ error: error.message || "Erreur interne de l'API" });
    }
  });

  // ==================== AGENTS IA ====================
  app.get("/api/ai/agents", (req, res) => {
    const agents = Object.keys(AI_SYSTEM_PROMPTS).map((key) => ({
      id: key,
      name: getAgentDisplayName(key),
      description: getAgentDescription(key),
    }));
    res.json(agents);
  });

  // ==================== TRADUCTION ====================
  app.post("/api/ai/translate", validateBody(TranslateSchema), async (req, res) => {
    try {
      const { text, fromLang = "fr", toLang = "wo" } = req.body;

      const translateModel = "gemini-3.6-flash";
      const ai = getGeminiClient(translateModel);
      if (!ai) {
        return res.status(500).json({ error: GEMINI_KEYS_MISSING_ERROR });
      }

      const response = await ai.models.generateContent({
        model: translateModel,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Traduis ce texte du ${fromLang} au ${toLang} : "${text}". Réponds UNIQUEMENT avec la traduction, sans explications.`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: "Tu es un traducteur expert. Traduis fidèlement le texte fourni.",
          temperature: 0.3,
        },
      });

      return res.json({ text: response.text });
    } catch (error) {
      logger.error("Error translating", { error: error.message });
      return res.status(500).json({ error: error.message || "Erreur de traduction" });
    }
  });

  // ==================== WEATHER ====================
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: "Coordonnées lat et lon requises" });
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
        wind_speed: data.current.wind_speed_10m,
      });
    } catch (error) {
      logger.error("Error fetching weather", { error: error.message });
      return res.status(500).json({ error: "Erreur lors de la récupération des données météo" });
    }
  });

  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "mpa",
    });
    app.use(vite.middlewares);
  } else {
    // Servir les fichiers statiques depuis le dossier pages/ (pour les pages HTML partagées)
    app.use("/pages", express.static(path.resolve("pages"), { extensions: ["html"] }));

    // Servir les fichiers statiques du build Vite (dist/)
    app.use(express.static(path.resolve("dist"), { extensions: ["html"] }));

    // Servir les assets (images, CSS, JS) depuis la racine
    app.use("/assets", express.static(path.resolve("assets")));
    app.use("/css", express.static(path.resolve("css")));
    app.use("/js", express.static(path.resolve("js")));

    // Route par défaut pour les requêtes non correspondantes
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    console.log(`Mode: localStorage + Firebase sync`);
    console.log(`Security: Rate limiting + Helmet + CORS enabled`);
  });
}

startServer().catch((err) => {
  logger.error("Failed to start server", { error: err.message });
});
