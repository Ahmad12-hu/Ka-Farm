import express from "express";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "../js/modules/logger.js";
import {
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
  LoginSchema,
  ProvisionSchema,
  SyncActionSchema,
  validationDetails,
} from "../js/modules/api-validation.js";
import { z } from "zod";
import { Cache } from "../js/modules/cache.js";
import { Crypto } from "../js/modules/crypto.js";
import {
  createGeminiClientFactory,
  geminiKeyFor,
  GEMINI_KEYS_MISSING_ERROR,
} from "../js/modules/gemini-keys.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { randomBytes } from "node:crypto";

// Schémas de validation partagés avec le serveur de développement : voir
// js/modules/api-validation.js (source unique du contrat d'entrée).

function validationFailed(res, error) {
  return res.status(400).json({ error: "Données invalides", details: validationDetails(error) });
}

// Aide pour vérifier si nous sommes en mode production
function isProduction() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

// Secret JWT local. En développement sans JWT_SECRET, on génère un secret
// ALÉATOIRE par processus : plus de constante publique connue (l'ancien secret
// de repli codé en dur permettait de forger un token super_admin). Les jetons
// émis ne survivent pas à un redémarrage du serveur, ce qui est sans
// conséquence en local.
let devJwtSecret = null;

function getJwtSecret() {
  const configuredSecret = (process.env.JWT_SECRET || "").trim();
  if (configuredSecret) return configuredSecret;

  if (!isProduction()) {
    if (!devJwtSecret) {
      devJwtSecret = randomBytes(48).toString("hex");
      console.warn(
        "[SECURITY WARNING] JWT_SECRET non défini : secret aléatoire généré pour cette instance (développement uniquement)."
      );
    }
    return devJwtSecret;
  }

  // Production : échec immédiat avec message clair
  const errorMsg = "JWT_SECRET environment variable is required in production";
  console.error(`[FATAL] ${errorMsg}`);
  throw new Error(errorMsg);
}

// En production, JWT_SECRET n'est plus bloquant au démarrage : sans lui, seul
// le chemin JWT local est indisponible (requireAuth l'ignore puis valide l'ID
// token Firebase). Lever ici coupait TOUTE l'API — y compris l'IA — sur une
// variable dont le frontend n'a plus besoin.
if (isProduction() && !(process.env.JWT_SECRET || "").trim()) {
  console.warn(
    "[SECURITY WARNING] JWT_SECRET absent : authentification limitée aux ID tokens Firebase (JWT local désactivé)."
  );
}

// Initialiser le SDK Firebase Admin (pour les opérations backend sécurisées)
let adminDb = null;
let firebaseInitializationError = null;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    firebaseInitializationError = new Error(
      isProduction()
        ? "Configuration Firebase Admin manquante ou invalide en production"
        : "Firebase Admin non configure. Definissez FIREBASE_SERVICE_ACCOUNT_KEY pour activer Firestore."
    );
  } else {
    const parsedServiceAccount = JSON.parse(serviceAccountKey);
    const serviceAccount = {
      projectId: parsedServiceAccount.projectId || parsedServiceAccount.project_id,
      clientEmail: parsedServiceAccount.clientEmail || parsedServiceAccount.client_email,
      privateKey: (
        parsedServiceAccount.privateKey ||
        parsedServiceAccount.private_key ||
        ""
      ).replace(/\\n/g, "\n"),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY doit contenir project_id, client_email et private_key"
      );
    }

    const adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });

    adminDb = getFirestore(adminApp);
    logger.info("SDK Firebase Admin initialisé avec succès");
  }
} catch (e) {
  adminDb = null;
  firebaseInitializationError = new Error(
    isProduction()
      ? "Configuration Firebase Admin manquante ou invalide en production"
      : `Firebase Admin non configure ou invalide: ${e.message}`
  );
    logger.error("Échec de l'initialisation du SDK Firebase Admin", { error: e.message, stack: e.stack });
}

function getFirestoreUnavailableMessage() {
  if (firebaseInitializationError) {
    return firebaseInitializationError.message;
  }

  if (!adminDb) {
    return isProduction()
      ? "Service Firestore indisponible en production"
      : "Firebase Admin non configure. Definissez FIREBASE_SERVICE_ACCOUNT_KEY pour activer Firestore.";
  }

  return null;
}

function requireFirestoreReady(req, res, next) {
  const errorMessage = getFirestoreUnavailableMessage();
  if (errorMessage) {
    logger.error("Firestore indisponible pour la route API", {
      route: `${req.method} ${req.originalUrl}`,
      error: errorMessage,
    });
    return res.status(503).json({ error: errorMessage });
  }

  next();
}

const app = express();

// En-têtes de sécurité
app.use(helmet());

// Configuration CORS
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Trop de requêtes. Veuillez réessayer dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for sensitive write routes (finances, employees)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 write requests per windowMs
  message: { error: "Trop de requêtes d'écriture. Veuillez réessayer dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

// ============================================================================
// AUTH MIDDLEWARE — accepte deux types de Bearer token :
//   1) JWT HMAC local (signé avec JWT_SECRET via POST /api/auth/login) — backward compat
//   2) ID token Firebase (signé RS256 par Google, validé par Firebase Admin SDK)
// L'ordre JWT → Firebase garantit la compatibilité ascendante pendant la migration
// Firebase Auth, sans casser les clients/existants qui utilisent encore le JWT local.
// ============================================================================

// Valeurs par défaut (fallback sécurisé si le rôle n'a pas encore de doc Firestore)
const DEFAULT_USER_ROLE = "Terrain";
const DEFAULT_ENTERPRISE_ID = "ka_farm";
const DEFAULT_ENTERPRISE_NAME = "KA Farm";
const DEFAULT_ENTERPRISE_CODE = "KA-FARM";

// Résolution centralisée du tenant courant. Le repli « ka_farm » ne couvre que
// les comptes historiques / jetons sans enterpriseId ; les nouveaux comptes
// sont provisionnés (cf. POST /api/auth/provision) et possèdent leur propre
// tenant, ils ne dépendent donc plus de ce repli.
function resolveEnterpriseId(req) {
  return (req.user && req.user.enterpriseId) || DEFAULT_ENTERPRISE_ID;
}

// Cache en mémoire (TTL court) des profils rôles depuis Firestore users/{uid}
// pour éviter 1 lecture Firestore par requête. 60s est amplement suffisant :
// un changement de rôle n'a pas besoin d'être immédiat.
const ROLE_CACHE_TTL_MS = 60 * 1000;
const roleCache = new Map(); // uid -> { profile, expiresAt }

async function readUserRoleFromFirestore(uid) {
  if (!adminDb) {
    return {
      role: DEFAULT_USER_ROLE,
      enterpriseId: DEFAULT_ENTERPRISE_ID,
      enterpriseName: DEFAULT_ENTERPRISE_NAME,
      enterpriseCode: DEFAULT_ENTERPRISE_CODE,
      name: "",
    };
  }

  const now = Date.now();
  const cached = roleCache.get(uid);
  if (cached && cached.expiresAt > now) return cached.profile;

  try {
    const snap = await adminDb.collection("users").doc(uid).get();
    const data = snap.exists ? snap.data() : null;
    const profile = {
      role: data?.role || DEFAULT_USER_ROLE,
      enterpriseId: data?.enterpriseId || DEFAULT_ENTERPRISE_ID,
      enterpriseName: data?.enterpriseName || DEFAULT_ENTERPRISE_NAME,
      enterpriseCode: data?.enterpriseCode || DEFAULT_ENTERPRISE_CODE,
      name: data?.name || "",
    };
    roleCache.set(uid, { profile, expiresAt: now + ROLE_CACHE_TTL_MS });
    return profile;
  } catch (err) {
    logger.error("Error reading Firestore user role", { uid, error: err.message });
    // L'authentification reste valide ; on retombe sur les valeurs par défaut.
    return {
      role: DEFAULT_USER_ROLE,
      enterpriseId: DEFAULT_ENTERPRISE_ID,
      enterpriseName: DEFAULT_ENTERPRISE_NAME,
      enterpriseCode: DEFAULT_ENTERPRISE_CODE,
      name: "",
    };
  }
}

// Valide un ID token Firebase via Admin SDK et reconstruit req.user
// avec le même shape que l'ancien JWT local ({userId, email, role, enterpriseId...}).
async function verifyFirebaseIdToken(token) {
  if (!adminDb) {
    const err = new Error("Firebase Admin non configuré");
    err.code = "FIREBASE_UNAVAILABLE";
    throw err;
  }

  const { getAuth } = await import("firebase-admin/auth");
  const decoded = await getAuth().verifyIdToken(token);
  const { uid, email } = decoded;
  const profile = await readUserRoleFromFirestore(uid);

  return {
    uid,
    userId: uid,
    email: email || "",
    name: profile.name,
    role: profile.role,
    enterpriseId: profile.enterpriseId,
    enterpriseName: profile.enterpriseName,
    enterpriseCode: profile.enterpriseCode,
    firebase: true,
  };
}

// Auth middleware: require valid token (JWT local OU ID token Firebase)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Missing auth token", { url: req.originalUrl });
    return res.status(401).json({ error: "Token d'authentification requis" });
  }

  const token = authHeader.split(" ")[1];

  // Chemin 1 : JWT local (comportement historiquement attendu, préservé à l'identique)
  let jwtSecret = null;
  try {
    jwtSecret = getJwtSecret();
  } catch (error) {
    jwtSecret = null;
  }
  if (jwtSecret) {
    try {
      const decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
      req.user = decoded;
      logger.info("Authenticated via JWT local", {
        email: decoded.email,
        url: req.originalUrl,
      });
      return next();
    } catch (jwtErr) {
      // JWT local invalide → on tente l'ID token Firebase ci-dessous
    }
  }

  // Chemin 2 : ID token Firebase
  verifyFirebaseIdToken(token)
    .then((user) => {
      req.user = user;
      logger.info("Authenticated via Firebase ID token", {
        uid: user.uid,
        email: user.email,
        role: user.role,
        url: req.originalUrl,
      });
      next();
    })
    .catch((err) => {
      logger.warn("Invalid auth token", { error: err.message, url: req.originalUrl });
      return res.status(401).json({ error: "Token invalide ou expiré" });
    });
}

// ─────────────────────────────────────────────────────────────
// Contrôle des rôles (RBAC) — à utiliser APRÈS requireAuth.
// Rôles exacts définis dans js/constants/roles.js :
//   "Terrain", "Bureau", "admin", "super_admin"
// (casse respectée telle que trouvée dans le code).
// ─────────────────────────────────────────────────────────────

// Rôles autorisés pour les écritures sensibles (finances, employés, stocks, crop-profits).
const ROLE_BUREAU_ADMIN = ["Bureau", "admin", "super_admin"];
// Rôles autorisés pour la suppression d'un employé (admin uniquement).
const ROLE_ADMIN_ONLY = ["admin", "super_admin"];

// Middleware de contrôle de rôle : renvoie 403 si le rôle du token
// (req.user.role) n'est pas dans la liste autorisée.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Accès refusé : rôle insuffisant" });
    }
    next();
  };
}

// Règle de rôle à appliquer aux écritures via /api/sync* selon la collection cible.
// Retourne la liste des rôles autorisés, ou null si la collection n'est pas restreinte
// (dans ce cas, aucune restriction supplémentaire : seuls les autres middlewares
// existants s'appliquent).
function syncWriteAllowedRoles(collection, type) {
  if (collection === "employees") {
    // Suppression d'employé : admin uniquement (comme le CRUD direct).
    return type === "DELETE" ? ROLE_ADMIN_ONLY : ROLE_BUREAU_ADMIN;
  }
  if (collection === "finances") {
    // Écriture financière : Bureau / admin (PAS Terrain), comme le CRUD direct.
    return ROLE_BUREAU_ADMIN;
  }
  return null; // autres collections (crops, parcelles, tasks, cheptel…) : inchangé
}

// Public routes (no auth required)
// /api/weather ne dépend pas de Firestore (API Open-Meteo externe)
app.use(["/api/auth/login"], requireFirestoreReady);

// ⚠️ NOTE DE MIGRATION IA / AUTH (2026-08-09, mis à jour après implémentation)
// ------------------------------------------------------------------
// Les routes IA ci-dessous sont protégées par requireAuth. requireAuth accepte
// désormais DEUX types de Bearer token :
//   1) JWT HMAC local (signé avec JWT_SECRET via POST /api/auth/login) — compat
//   2) ID token Firebase (validé par Firebase Admin SDK, rôle lu depuis
//      Firestore users/{uid}) — nouveau flux cible
// Le frontend actuel utilise encore une authentification LOCALE
// (js/auth.js -> localStorage) et n'envoie AUCUN token dans ses appels fetch
// (js/index-main.js, js/modules/ai-service.js, js/modules/crops.js,
// js/modules/diagnostics.js, js/modules/notifications.js, pages/shared/training.html).
//
// CONSÉQUENCE à ce stade : tant que le frontend n'est pas migré vers le SDK
// Firebase Auth, l'IA (et les autres routes requireAuth appelées par le frontend)
// ne reçoivent aucun token en production sur Vercel (réponse 401 « Token requis »).
// En développement (server.js), les routes IA ne sont PAS protégées, donc l'IA
// fonctionne en local.
//
// La migration RESTANTE (côté client) débloquera les routes requireAuth :
// - réécrire js/auth.js pour utiliser Firebase Auth (signInWithEmailAndPassword,
//   onAuthStateChanged)
// - injecter l'ID token Firebase dans chaque requête via api-client.js
// Le serveur (requireAuth) est déjà prêt à les accepter.
//
// → Ne pas construire de route de session JWT temporaire pour l'IA : le flux
//   cible est Firebase Auth uniquement (le JWT local sera retiré après migration).
// ------------------------------------------------------------------

// Protected AI routes (auth required, no Firestore dependency)
// /api/gemini et /api/ai/* ne dépendent pas de Firestore : on les isole du middleware
// requireFirestoreReady pour éviter un blocage silencieux (503) lorsque
// FIREBASE_SERVICE_ACCOUNT_KEY est absent, mais on exige une authentification
// pour empêcher tout appel non authentifié (protection du quota API).
app.use(
  [
    "/api/gemini",
    "/api/ai/openai",
    "/api/ai/claude",
    "/api/ai/stream",
    "/api/ai/agents",
    "/api/ai/translate",
  ],
  requireAuth
);

// Protected routes (auth + Firestore required)
app.use(
  [
    "/api/crops",
    "/api/parcelles",
    "/api/tasks",
    "/api/finances",
    "/api/employees",
    "/api/cheptel",
    "/api/elevage/production",
    "/api/elevage/health",
    "/api/treatments",
    "/api/crop-profits",
    "/api/messages",
    "/api/stocks",
  ],
  requireAuth,
  requireFirestoreReady
);

// Protected sync routes (auth required, no Firestore dependency:
// best-effort behavior so req.user.role est disponible pour le contrôle
// de rôle sur les écritures sensibles des collections finances/employés).
app.use(["/api/sync", "/api/sync/item"], requireAuth);

// ==================== AUTH ====================
app.post("/api/auth/login", async (req, res) => {
  try {
    const parsed = LoginSchema.safeParse(req.body || {});
    if (!parsed.success) return validationFailed(res, parsed.error);
    const { email, password } = parsed.data;

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(503).json({ error: "Configuration JWT manquante" });
    }

    // Read users from Firestore
    const users = await syncWithFirestore("ka_farm_users", []);
    const user = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Verify password
    const isValid = await Crypto.verifyPassword(password, user.password, user.password_salt);
    if (!isValid) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, enterpriseId: user.enterpriseId },
      jwtSecret,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseId: user.enterpriseId,
      },
    });
  } catch (error) {
    logger.error("Auth error", { error: error.message });
    return res.status(500).json({ error: "Erreur lors de l'authentification" });
  }
});

// Route profil courant (protégée par requireAuth)
// Renvoie l'utilisateur authentifié avec son rôle et son contexte exploitation.
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Provisionnement idempotent du doc Firestore users/{uid} à l'auto-inscription.
// Réservé aux comptes Firebase (ID token). Le premier appel crée le tenant
// (enterpriseId/enterpriseCode générés côté serveur) ; les appels suivants
// renvoient le profil existant SANS l'écraser (pas de changement de rôle/tenant).
app.post("/api/auth/provision", requireAuth, requireFirestoreReady, async (req, res) => {
  try {
    if (!req.user || !req.user.firebase || !req.user.uid) {
      return res.status(403).json({ error: "Provisionnement réservé aux comptes Firebase" });
    }

    const parsed = ProvisionSchema.safeParse(req.body || {});
    if (!parsed.success) return validationFailed(res, parsed.error);

    const uid = req.user.uid;
    const ref = adminDb.collection("users").doc(uid);
    const snap = await ref.get();
    if (snap.exists) {
      // Invalide le cache de rôle pour que requireAuth relise le doc frais.
      roleCache.delete(uid);
      const existing = snap.data() || {};
      return res.json({ user: { ...req.user, ...existing, provisioned: true, existing: true } });
    }

    const profile = {
      role: parsed.data.role || DEFAULT_USER_ROLE,
      name: parsed.data.name || req.user.name || "",
      email: req.user.email || "",
      enterpriseId: `ent_${randomBytes(8).toString("hex")}`,
      enterpriseName: parsed.data.enterpriseName || "Mon Exploitation",
      enterpriseCode: `KAF-${randomBytes(3).toString("hex").toUpperCase()}`,
      updatedAt: new Date().toISOString(),
    };
    await ref.set(profile, { merge: true });
    roleCache.delete(uid);

    return res.json({ user: { ...req.user, ...profile, provisioned: true } });
  } catch (error) {
    logger.error("Provision error", { error: error.message });
    return res.status(500).json({ error: "Erreur lors du provisionnement" });
  }
});

// In-memory fallback stores
// ⚠️ SÉCURITÉ : en production, les données de démo sont désactivées pour éviter
// d'afficher des données fictives aux utilisateurs si Firestore est vide.
// En développement/test, les données de démo restent actives pour faciliter le développement.
const isProd = isProduction();

let serverMessages = [];

let serverStocks = isProd ? [] : [
  {
    id: "S-301",
    name: "Compost Organique Bio",
    category: "Amendements",
    quantity: 350,
    maxQuantity: 1000,
    unit: "kg",
  },
  {
    id: "S-302",
    name: "Semences Tomate Mongal F1",
    category: "Semences",
    quantity: 12,
    maxQuantity: 50,
    unit: "sachets",
  },
  {
    id: "S-303",
    name: "Purin de Neem (Insecticide)",
    category: "Traitements",
    quantity: 45,
    maxQuantity: 100,
    unit: "L",
  },
  {
    id: "S-304",
    name: "Fumier de Mouton séché",
    category: "Amendements",
    quantity: 150,
    maxQuantity: 800,
    unit: "kg",
  },
  {
    id: "S-305",
    name: "Aliments Concentrés Bovins",
    category: "Alimentation",
    quantity: 180,
    maxQuantity: 1000,
    unit: "kg",
  },
];

let serverCrops = isProd ? [] : [
  {
    id: "C-101",
    name: "Tomate Mongal F1",
    field: "Parcelle Nord - Planche 2",
    sowingDate: "2026-05-10",
    harvestDate: "2026-08-15",
    status: "Floraison",
    waterStatus: "Optimale",
    fertilizerStatus: "OK",
    photos: [],
  },
  {
    id: "C-102",
    name: "Oignon Rouge de Galmi",
    field: "Parcelle Est - Grand Champ",
    sowingDate: "2026-04-15",
    harvestDate: "2026-09-01",
    status: "Croissance",
    waterStatus: "Besoin d'eau",
    fertilizerStatus: "OK",
    photos: [],
  },
];

let serverParcelles = isProd ? [] : [
  {
    id: "P-001",
    name: "Parcelle Nord - Planche 2",
    surface: 120,
    lat: 14.7932,
    lng: -17.2654,
    status: "Cultivée",
    type_sol: "sableux",
    history: ["Tomate Mongal F1"],
    currentCrop: "Tomate Mongal F1",
    waterStatus: "Irrigué",
  },
  {
    id: "P-002",
    name: "Parcelle Est - Grand Champ",
    surface: 500,
    lat: 14.7938,
    lng: -17.2642,
    status: "Cultivée",
    type_sol: "limoneux",
    history: ["Oignon Rouge de Galmi"],
    currentCrop: "Oignon Rouge de Galmi",
    waterStatus: "Besoin d'eau",
  },
];

let serverTasks = isProd ? [] : [
  {
    id: "T-401",
    title: "Irrigation matin de l'oignon Galmi",
    category: "Irrigation",
    dueDate: "2026-06-26",
    assignee: "Responsable terrain",
    priority: "Haute",
    completed: false,
  },
  {
    id: "T-402",
    title: "Sarclage & Désherbage planche choux",
    category: "Entretien",
    dueDate: "2026-06-28",
    assignee: "Fatou",
    priority: "Moyenne",
    completed: false,
  },
];

let serverFinances = isProd ? [] : [
  {
    id: "F-501",
    description: "Vente de 8 caisses de Tomates Mongal",
    category: "Vente Légumes",
    type: "Revenu",
    amount: 120000,
    date: "2026-06-20",
  },
  {
    id: "F-502",
    description: "Achat de semences oignon Galmi",
    category: "Semences",
    type: "Dépense",
    amount: 35000,
    date: "2026-06-18",
  },
];

let serverEmployees = isProd ? [] : [
  {
    id: "E-001",
    name: "Samba Diouf",
    phone: "77 521 44 22",
    role: "Ouvrier agricole",
    dailyRate: 4000,
    status: "Actif",
  },
  {
    id: "E-002",
    name: "Awa Sow",
    phone: "76 432 11 00",
    role: "Chef d'équipe pépinière",
    dailyRate: 5000,
    status: "Actif",
  },
];

let serverCheptel = isProd ? [] : [
  {
    id: "CH-001",
    name: "Génisses Laitières Holstein",
    type: "Bovins",
    breed: "Holstein/Guzera",
    quantity: 12,
    unit: "têtes",
    status: "Sain",
    purpose: "Lait",
  },
  {
    id: "CH-002",
    name: "Moutons Ladoum d'Élevage",
    type: "Ovins",
    breed: "Ladoum Pur",
    quantity: 8,
    unit: "têtes",
    status: "Sain",
    purpose: "Reproduction",
  },
];

let serverElevageProduction = isProd ? [] : [
  {
    id: "PROD-001",
    date: "2026-06-25",
    type: "Lait",
    quantity: 145,
    unit: "L",
    notes: "Excellente traite matinale.",
  },
  {
    id: "PROD-002",
    date: "2026-06-25",
    type: "Œufs",
    quantity: 310,
    unit: "unités",
    notes: "10 plateaux collectés.",
  },
];

let serverElevageHealth = isProd ? [] : [
  {
    id: "HEA-001",
    date: "2026-06-10",
    target: "Moutons Ladoum",
    intervention: "Vaccination Pastorose",
    practitioner: "Dr. Diop",
    cost: 15000,
    notes: "Rappel annuel effectué.",
  },
];

let serverTreatments = [];
let serverCropProfits = [];

// ============================================================================
// COUCHE DE PERSISTANCE FIRESTORE — un document par entité
// ----------------------------------------------------------------------------
// Modèle cible : app_data/{enterpriseId}/{collection}/{id} (un document par
// enregistrement) → plus de limite de 1 Mo par document, plus d'écrasement
// « last-write-wins » sur toute la collection.
//
// Compatibilité : les données historiques étaient stockées en tableau JSON dans
// app_data/{enterpriseId}/{collection}/data. À la première écriture d'une
// collection, ce tableau est « matérialisé » en documents par entité puis un
// marqueur __meta est posé ; la lecture privilégie alors le nouveau modèle.
// ============================================================================

const ENTITY_META_DOC_ID = "__meta";
const LEGACY_DATA_DOC_ID = "data";

// Documents internes d'une collection (jamais traités comme des entités).
function isReservedDocId(id) {
  return id === ENTITY_META_DOC_ID || id === LEGACY_DATA_DOC_ID;
}

function collectionRef(collection, enterpriseId) {
  return adminDb.collection("app_data").doc(enterpriseId).collection(collection);
}

function assertFirestoreReady(collection) {
  const errorMsg = getFirestoreUnavailableMessage();
  if (errorMsg) {
    logger.error(`Firestore indisponible pour ${collection}`, { error: errorMsg });
    throw new Error(errorMsg);
  }
}

// Convertit une seule fois le tableau hérité en documents par entité, puis
// supprime le document tableau (jusqu'à 1 Mo) pour ne plus le traîner.
async function ensureCollectionMigrated(collection, enterpriseId) {
  const colRef = collectionRef(collection, enterpriseId);
  const meta = await colRef.doc(ENTITY_META_DOC_ID).get();
  if (meta.exists) return;

  const legacy = await colRef.doc(LEGACY_DATA_DOC_ID).get();
  const items = legacy.exists ? legacy.data().data || [] : [];
  for (const entity of items) {
    if (entity && entity.id !== undefined && entity.id !== null) {
      await colRef.doc(String(entity.id)).set(entity);
    }
  }
  await colRef.doc(ENTITY_META_DOC_ID).set({
    model: "entity",
    migratedAt: new Date().toISOString(),
  });
  if (legacy.exists) {
    await colRef.doc(LEGACY_DATA_DOC_ID).delete();
  }
}

async function readCollection(collection, fallbackData, enterpriseId = DEFAULT_ENTERPRISE_ID) {
  assertFirestoreReady(collection);
  const colRef = collectionRef(collection, enterpriseId);
  const meta = await colRef.doc(ENTITY_META_DOC_ID).get();
  if (meta.exists) {
    const snap = await colRef.get();
    return snap.docs.filter((d) => !isReservedDocId(d.id)).map((d) => d.data());
  }
  const legacy = await colRef.doc(LEGACY_DATA_DOC_ID).get();
  return legacy.exists ? legacy.data().data || fallbackData : fallbackData;
}

// Alias historique conservé pour les routes de lecture (GET /api/...).
const syncWithFirestore = readCollection;

async function getEntity(collection, id, enterpriseId = DEFAULT_ENTERPRISE_ID) {
  assertFirestoreReady(collection);
  const snap = await collectionRef(collection, enterpriseId).doc(String(id)).get();
  return snap.exists ? snap.data() : null;
}

async function upsertEntity(collection, entity, enterpriseId = DEFAULT_ENTERPRISE_ID) {
  assertFirestoreReady(collection);
  await ensureCollectionMigrated(collection, enterpriseId);
  await collectionRef(collection, enterpriseId).doc(String(entity.id)).set(entity);
  return entity;
}

async function deleteEntity(collection, id, enterpriseId = DEFAULT_ENTERPRISE_ID) {
  assertFirestoreReady(collection);
  await ensureCollectionMigrated(collection, enterpriseId);
  await collectionRef(collection, enterpriseId).doc(String(id)).delete();
}

// Remplace intégralement une collection (upsert de tout + suppression des
// enregistrements absents). À n'utiliser que si l'appelant fournit bien
// l'intégralité de la collection.
async function replaceCollection(collection, entities, enterpriseId = DEFAULT_ENTERPRISE_ID) {
  assertFirestoreReady(collection);
  await ensureCollectionMigrated(collection, enterpriseId);
  const colRef = collectionRef(collection, enterpriseId);
  const list = (Array.isArray(entities) ? entities : []).filter(
    (e) => e && e.id !== undefined && e.id !== null
  );
  const keep = new Set(list.map((e) => String(e.id)));
  try {
    const existing = await colRef.get();
    for (const docSnap of existing.docs) {
      if (!isReservedDocId(docSnap.id) && !keep.has(docSnap.id)) {
        await docSnap.ref.delete();
      }
    }
  } catch (err) {
    // Scan best-effort : si la lecture échoue, on applique au moins les upserts.
    logger.warn(`replaceCollection scan failed for ${collection}: ${err.message}`);
  }
  for (const entity of list) {
    await colRef.doc(String(entity.id)).set(entity);
  }
}

// ==================== CROPS ====================
app.get("/api/crops", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await Cache.memo(
      `crops_list_${enterpriseId}`,
      async () => await syncWithFirestore("crops", serverCrops, enterpriseId),
      30000
    );
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/crops", async (req, res) => {
  try {
    const crop = CropSchema.parse(req.body);
    const idx = serverCrops.findIndex((c) => c.id === crop.id);
    if (idx === -1) serverCrops.push(crop);
    else serverCrops[idx] = { ...serverCrops[idx], ...crop };
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("crops", crop, enterpriseId);
    await Cache.invalidate(`crops_list_${enterpriseId}`);
    res.json({ success: true, crop });
  } catch (error) {
    logger.error("Error saving crop", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.put("/api/crops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patch = CropSchema.partial().parse(req.body);
    const enterpriseId = resolveEnterpriseId(req);
    const existing =
      (await getEntity("crops", id, enterpriseId)) || serverCrops.find((c) => c.id === id);
    if (!existing) return res.status(404).json({ error: "Culture non trouvée" });
    const merged = { ...existing, ...patch };
    const idx = serverCrops.findIndex((c) => c.id === id);
    if (idx === -1) serverCrops.push(merged);
    else serverCrops[idx] = merged;
    await upsertEntity("crops", merged, enterpriseId);
    await Cache.invalidate(`crops_list_${enterpriseId}`);
    res.json({ success: true, crop: merged });
  } catch (error) {
    logger.error("Error updating crop", { error: error.message });
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.delete("/api/crops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = resolveEnterpriseId(req);
    await deleteEntity("crops", id, enterpriseId);
    serverCrops = serverCrops.filter((c) => c.id !== id);
    await Cache.invalidate(`crops_list_${enterpriseId}`);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting crop", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ==================== PARCELLES ====================
app.get("/api/parcelles", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await Cache.memo(
      `parcelles_list_${enterpriseId}`,
      async () => await syncWithFirestore("parcelles", serverParcelles, enterpriseId),
      30000
    );
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/parcelles", async (req, res) => {
  try {
    const parcelle = ParcelleSchema.parse(req.body);
    const idx = serverParcelles.findIndex((p) => p.id === parcelle.id);
    if (idx === -1) serverParcelles.push(parcelle);
    else serverParcelles[idx] = { ...serverParcelles[idx], ...parcelle };
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("parcelles", parcelle, enterpriseId);
    await Cache.invalidate(`parcelles_list_${enterpriseId}`);
    res.json({ success: true, parcelle });
  } catch (error) {
    logger.error("Error saving parcelle", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.put("/api/parcelles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patch = ParcelleSchema.partial().parse(req.body);
    const enterpriseId = resolveEnterpriseId(req);
    const existing =
      (await getEntity("parcelles", id, enterpriseId)) || serverParcelles.find((p) => p.id === id);
    if (!existing) return res.status(404).json({ error: "Parcelle non trouvée" });
    const merged = { ...existing, ...patch };
    const idx = serverParcelles.findIndex((p) => p.id === id);
    if (idx === -1) serverParcelles.push(merged);
    else serverParcelles[idx] = merged;
    await upsertEntity("parcelles", merged, enterpriseId);
    await Cache.invalidate(`parcelles_list_${enterpriseId}`);
    res.json({ success: true, parcelle: merged });
  } catch (error) {
    logger.error("Error updating parcelle", { error: error.message });
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.delete("/api/parcelles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = resolveEnterpriseId(req);
    await deleteEntity("parcelles", id, enterpriseId);
    serverParcelles = serverParcelles.filter((p) => p.id !== id);
    await Cache.invalidate(`parcelles_list_${enterpriseId}`);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting parcelle", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ==================== TASKS ====================
app.get("/api/tasks", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await Cache.memo(
      `tasks_list_${enterpriseId}`,
      async () => await syncWithFirestore("tasks", serverTasks, enterpriseId),
      15000
    );
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const task = TaskSchema.parse(req.body);
    const idx = serverTasks.findIndex((t) => t.id === task.id);
    if (idx === -1) serverTasks.push(task);
    else serverTasks[idx] = { ...serverTasks[idx], ...task };
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("tasks", task, enterpriseId);
    res.json({ success: true, task });
  } catch (error) {
    logger.error("Error saving task", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patch = TaskSchema.partial().parse(req.body);
    const enterpriseId = resolveEnterpriseId(req);
    const existing =
      (await getEntity("tasks", id, enterpriseId)) || serverTasks.find((t) => t.id === id);
    if (!existing) return res.status(404).json({ error: "Tâche non trouvée" });
    const merged = { ...existing, ...patch };
    const idx = serverTasks.findIndex((t) => t.id === id);
    if (idx === -1) serverTasks.push(merged);
    else serverTasks[idx] = merged;
    await upsertEntity("tasks", merged, enterpriseId);
    res.json({ success: true, task: merged });
  } catch (error) {
    logger.error("Error updating task", { error: error.message });
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = resolveEnterpriseId(req);
    await deleteEntity("tasks", id, enterpriseId);
    serverTasks = serverTasks.filter((t) => t.id !== id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting task", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ==================== FINANCES ====================
app.get("/api/finances", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await Cache.memo(
      `finances_list_${enterpriseId}`,
      async () => await syncWithFirestore("finances", serverFinances, enterpriseId),
      30000
    );
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

// Apply write rate limiting to finances routes
app.use("/api/finances", writeLimiter);

app.post("/api/finances", requireRole(...ROLE_BUREAU_ADMIN), async (req, res) => {
  try {
    const finance = FinanceSchema.parse(req.body);
    const idx = serverFinances.findIndex((f) => f.id === finance.id);
    if (idx === -1) serverFinances.push(finance);
    else serverFinances[idx] = { ...serverFinances[idx], ...finance };
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("finances", finance, enterpriseId);
    res.json({ success: true, finance });
  } catch (error) {
    logger.error("Error saving finance", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.delete("/api/finances/:id", requireRole(...ROLE_BUREAU_ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = resolveEnterpriseId(req);
    await deleteEntity("finances", id, enterpriseId);
    serverFinances = serverFinances.filter((f) => f.id !== id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting finance", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ==================== EMPLOYEES ====================
app.get("/api/employees", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await Cache.memo(
      `employees_list_${enterpriseId}`,
      async () => await syncWithFirestore("employees", serverEmployees, enterpriseId),
      30000
    );
    // Règle métier : un utilisateur « Terrain » ne doit pas recevoir le salaire (dailyRate).
    // On ne bloque pas la route, on filtre juste ce champ sensible.
    if (req.user && req.user.role === "Terrain") {
      const sanitized = data.map((e) => {
        const { dailyRate, ...rest } = e;
        return rest;
      });
      return res.json(sanitized);
    }
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

// Apply write rate limiting to employees routes
app.use("/api/employees", writeLimiter);

app.post("/api/employees", requireRole(...ROLE_BUREAU_ADMIN), async (req, res) => {
  try {
    const employee = EmployeeSchema.parse(req.body);
    const idx = serverEmployees.findIndex((e) => e.id === employee.id);
    if (idx === -1) serverEmployees.push(employee);
    else serverEmployees[idx] = { ...serverEmployees[idx], ...employee };
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("employees", employee, enterpriseId);
    res.json({ success: true, employee });
  } catch (error) {
    logger.error("Error saving employee", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.put("/api/employees/:id", requireRole(...ROLE_BUREAU_ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const patch = EmployeeSchema.partial().parse(req.body);
    const enterpriseId = resolveEnterpriseId(req);
    const existing =
      (await getEntity("employees", id, enterpriseId)) || serverEmployees.find((e) => e.id === id);
    if (!existing) return res.status(404).json({ error: "Employé non trouvé" });
    const merged = { ...existing, ...patch };
    const idx = serverEmployees.findIndex((e) => e.id === id);
    if (idx === -1) serverEmployees.push(merged);
    else serverEmployees[idx] = merged;
    await upsertEntity("employees", merged, enterpriseId);
    res.json({ success: true, employee: merged });
  } catch (error) {
    logger.error("Error updating employee", { error: error.message });
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.delete("/api/employees/:id", requireRole(...ROLE_ADMIN_ONLY), async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = resolveEnterpriseId(req);
    await deleteEntity("employees", id, enterpriseId);
    serverEmployees = serverEmployees.filter((e) => e.id !== id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting employee", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ==================== ELEVAGE / CHEPTEL ====================
app.get("/api/cheptel", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await Cache.memo(
      `cheptel_list_${enterpriseId}`,
      async () => await syncWithFirestore("cheptel", serverCheptel, enterpriseId),
      30000
    );
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/cheptel", async (req, res) => {
  try {
    const group = CheptelSchema.parse(req.body);
    const idx = serverCheptel.findIndex((c) => c.id === group.id);
    if (idx === -1) serverCheptel.push(group);
    else serverCheptel[idx] = { ...serverCheptel[idx], ...group };
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("cheptel", group, enterpriseId);
    res.json({ success: true, group });
  } catch (error) {
    logger.error("Error saving cheptel", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.put("/api/cheptel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patch = CheptelSchema.partial().parse(req.body);
    const enterpriseId = resolveEnterpriseId(req);
    const existing =
      (await getEntity("cheptel", id, enterpriseId)) || serverCheptel.find((c) => c.id === id);
    if (!existing) return res.status(404).json({ error: "Groupe d'élevage non trouvé" });
    const merged = { ...existing, ...patch };
    const idx = serverCheptel.findIndex((c) => c.id === id);
    if (idx === -1) serverCheptel.push(merged);
    else serverCheptel[idx] = merged;
    await upsertEntity("cheptel", merged, enterpriseId);
    res.json({ success: true, group: merged });
  } catch (error) {
    logger.error("Error updating cheptel", { error: error.message });
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.delete("/api/cheptel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = resolveEnterpriseId(req);
    await deleteEntity("cheptel", id, enterpriseId);
    serverCheptel = serverCheptel.filter((c) => c.id !== id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting cheptel", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ==================== ELEVAGE PRODUCTION ====================
app.get("/api/elevage/production", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await syncWithFirestore(
      "elevage_production",
      serverElevageProduction,
      enterpriseId
    );
    const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/elevage/production", async (req, res) => {
  try {
    const log = ElevageProductionSchema.parse(req.body);
    serverElevageProduction.push(log);
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("elevage_production", log, enterpriseId);
    res.json({ success: true, log });
  } catch (error) {
    logger.error("Error saving elevage production", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.delete("/api/elevage/production/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = resolveEnterpriseId(req);
    await deleteEntity("elevage_production", id, enterpriseId);
    serverElevageProduction = serverElevageProduction.filter((l) => l.id !== id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting elevage production", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ==================== ELEVAGE HEALTH ====================
app.get("/api/elevage/health", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await syncWithFirestore("elevage_health", serverElevageHealth, enterpriseId);
    const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/elevage/health", async (req, res) => {
  try {
    const log = ElevageHealthSchema.parse(req.body);
    serverElevageHealth.push(log);
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("elevage_health", log, enterpriseId);
    res.json({ success: true, log });
  } catch (error) {
    logger.error("Error saving elevage health", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.delete("/api/elevage/health/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = resolveEnterpriseId(req);
    await deleteEntity("elevage_health", id, enterpriseId);
    serverElevageHealth = serverElevageHealth.filter((l) => l.id !== id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting elevage health", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ==================== TREATMENTS ====================
app.get("/api/treatments", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await syncWithFirestore("treatments", serverTreatments, enterpriseId);
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/treatments", async (req, res) => {
  try {
    const treatment = TreatmentSchema.parse(req.body || {});

    const idx = serverTreatments.findIndex((t) => t.id === treatment.id);
    if (idx === -1) serverTreatments.push(treatment);
    else serverTreatments[idx] = { ...serverTreatments[idx], ...treatment };

    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("treatments", treatment, enterpriseId);
    res.json({ success: true, treatment });
  } catch (error) {
    if (error instanceof z.ZodError) return validationFailed(res, error);
    logger.error("Error saving treatment", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.post("/api/treatments/sync", async (req, res) => {
  try {
    const { treatments } = TreatmentsSyncSchema.parse(req.body || {});
    serverTreatments = treatments;
    const enterpriseId = resolveEnterpriseId(req);
    await replaceCollection("treatments", treatments, enterpriseId);
    res.json({ success: true, message: "Traitements synchronisés en mémoire", treatments });
  } catch (error) {
    if (error instanceof z.ZodError) return validationFailed(res, error);
    logger.error("Error syncing treatments", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la synchronisation" });
  }
});

// ==================== CROP PROFITS ====================
app.get("/api/crop-profits", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await syncWithFirestore("crop_profits", serverCropProfits, enterpriseId);
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/crop-profits", requireRole(...ROLE_BUREAU_ADMIN), async (req, res) => {
  try {
    const profit = CropProfitSchema.parse(req.body || {});

    const idx = serverCropProfits.findIndex((p) => p.id === profit.id);
    if (idx === -1) serverCropProfits.push(profit);
    else serverCropProfits[idx] = { ...serverCropProfits[idx], ...profit };

    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("crop_profits", profit, enterpriseId);
    res.json({ success: true, profit });
  } catch (error) {
    if (error instanceof z.ZodError) return validationFailed(res, error);
    logger.error("Error saving crop profit", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

app.post("/api/crop-profits/sync", requireRole(...ROLE_BUREAU_ADMIN), async (req, res) => {
  try {
    const { cropProfits } = CropProfitsSyncSchema.parse(req.body || {});
    serverCropProfits = cropProfits;
    const enterpriseId = resolveEnterpriseId(req);
    await replaceCollection("crop_profits", cropProfits, enterpriseId);
    res.json({
      success: true,
      message: "Analyses de rentabilité synchronisées en mémoire",
      cropProfits,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return validationFailed(res, error);
    logger.error("Error syncing crop profits", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la synchronisation" });
  }
});

// ==================== MESSAGES ====================
app.get("/api/messages", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await syncWithFirestore("messages", serverMessages, enterpriseId);
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { id, senderEmail, senderName, text, timestamp, isPrivate } = MessageSchema.parse(
      req.body
    );
    const newMsg = {
      id: id || "msg-" + Date.now(),
      senderEmail,
      senderName: senderName || senderEmail,
      text,
      timestamp: timestamp || new Date().toISOString(),
      isPrivate: !!isPrivate,
    };
    serverMessages.push(newMsg);
    const enterpriseId = resolveEnterpriseId(req);
    await upsertEntity("messages", newMsg, enterpriseId);
    res.json({ success: true, message: newMsg });
  } catch (error) {
    logger.error("Error saving message", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(400).json({ error: error.message || "Erreur de validation" });
  }
});

// ==================== STOCKS ====================
app.get("/api/stocks", async (req, res) => {
  try {
    const enterpriseId = resolveEnterpriseId(req);
    const data = await syncWithFirestore("stocks", serverStocks, enterpriseId);
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: "Service Firestore indisponible" });
  }
});

app.post("/api/stocks", requireRole(...ROLE_BUREAU_ADMIN), async (req, res) => {
  try {
    const { stocks } = StocksPayloadSchema.parse(req.body || {});
    serverStocks = stocks;
    const enterpriseId = resolveEnterpriseId(req);
    await replaceCollection("stocks", stocks, enterpriseId);
    res.json({ success: true, message: "Stocks synchronisés", stocks });
  } catch (error) {
    if (error instanceof z.ZodError) return validationFailed(res, error);
    logger.error("Error saving stocks", { error: error.message });
    if (error.message.includes("Firestore") || error.message.includes("Firebase Admin")) {
      return res.status(503).json({ error: "Service Firestore indisponible" });
    }
    res.status(500).json({ error: "Erreur lors de la sauvegarde" });
  }
});

// ==================== GEMINI AI ====================
// Prompts système spécialisés par agent
const AI_SYSTEM_PROMPTS = {
  advisor: `Tu es KA-Farm Agro-Advisor, un conseiller horticole et maraîcher expert d'Afrique de l'Ouest (Sénégal), chaleureux, pragmatique, direct et scientifique. Tu réponds en français. Tu es spécialisé exclusivement dans le maraîchage (cultures de légumes, fines herbes, fruits de jardin, pépinières, irrigation goutte-à-goutte ou aspersion, maladies horticoles comme la mineuse de la tomate Tuta absoluta, le mildiou, l'oïdium, les thrips, et l'usage de biopesticides locaux comme le neem ou le piment). Tu aides à diagnostiquer les ravageurs et maladies des légumes, planifier les pépinières maraîchères et le repiquage, optimiser l'arrosage et les amendements (compost organique, fumier) de manière écologique et agroécologique. Donne des réponses concises, claires, structurées et adaptées aux conditions locales ouest-africaines.`,

  plantDoctor: `Tu es KA-Farm Doctor Plante, un expert phytosanitaire horticole spécialisé dans le diagnostic visuel des maladies et carences des légumes en Afrique de l'Ouest (Sénégal). Analyse cette photo de culture et fournis un diagnostic structuré en français avec : 1) Nom probable de la maladie/carence (si identifiable), 2) Niveau de gravité (Faible/Moyen/Élevé/Critique), 3) Action de traitement recommandée (produit bio ou chimique, dosage, fréquence), 4) Prévention. Sois direct, scientifique et adapté aux conditions locales. Si l'image n'est pas claire ou ne montre pas de problème visible, indique-le honnêtement.`,

  livestock: `Tu es KA-Farm Conseiller Élevage, expert en production animale en Afrique de l'Ouest. Spécialisé dans : bovins, ovins, caprins, volailles au Sénégal. Conseils sur : alimentation, santé animale, reproduction, logement, prophylaxie. Réponds en français avec des solutions locales et abordables.`,

  finance: `Tu es KA-Farm Analyste Financier Agricole, expert en gestion financière des exploitations agricoles. Aide à : analyser la rentabilité des cultures, optimiser les dépenses, prévoir les revenus, conseiller sur les prix du marché (marchés sénégalais), suggestions de diversification. Réponds en français avec des chiffres concrets adaptés au contexte sénégalais.`,

  irrigation: `Tu es KA-Farm Expert Irrigation & Météo, spécialisé en gestion de l'eau pour l'agriculture sahélienne. Conseils sur : irrigation goutte-à-goutte, aspersion, calendrier d'arrosage selon les saisons, gestion de la sécheresse, optimisation de l'eau, drainage. Réponds en français avec des solutions adaptées au climat sénégalais.`,

  soil: `Tu es KA-Farm Expert Sol & Compost, spécialisé en agroécologie et fertilité des sols au Sénégal. Conseils sur : fabrication de compost, fumier, amendements organiques, rotation des cultures, analyse du sol (sableux, limoneux, argileux), couverture végétale. Réponds en français avec des techniques locales et écologiques.`,

  personal: `Tu es KA-Farm Assistant Personnel Agricole. Tu aides l'agriculteur à organiser son travail quotidien : planification des tâches, rappels, suivi des cultures, gestion du temps. Sois amical, motivateur et pratique. Réponds en français.`,

  wolofAdvisor: `Ña ng ci KA-Farm Agro-Advisor, jàngoro bu am solo ci mbey mi ci Sénégal. Maa ngiy faj ay jàngoro yu mel ni: mbey, garab, àndi ndox, ay jàkka, ay garab yu bon. Maa ngiy wax ci Wolof ak Français. Na nga may ay mbir yu am solo ci sa mbey mi.`,
};

// Helper pour construire le contexte RAG de l'exploitation
function buildFarmContext(agentType) {
  try {
    const context = [];
    if (["advisor", "plantDoctor", "finance"].includes(agentType) && serverCrops.length) {
      context.push(`Cultures actuelles: ${serverCrops.slice(0, 5).map(c => `${c.name} (${c.field || '?'}) - ${c.status || '?'}`).join(', ')}`);
    }
    if (["livestock"].includes(agentType) && serverCheptel.length) {
      context.push(`Cheptel: ${serverCheptel.map(c => `${c.name}: ${c.quantity} ${c.unit || 'têtes'} (${c.status || '?'})`).join(', ')}`);
    }
    if (["finance"].includes(agentType) && serverFinances.length) {
      const revenus = serverFinances.filter(f => f.type === 'Revenu').reduce((a, b) => a + (b.amount || 0), 0);
      const depenses = serverFinances.filter(f => f.type === 'Dépense').reduce((a, b) => a + (b.amount || 0), 0);
      context.push(`Finances: Revenus ${revenus}F, Dépenses ${depenses}F`);
    }
    if (["irrigation"].includes(agentType) && serverParcelles.length) {
      context.push(`Parcelles: ${serverParcelles.map(p => `${p.name} (${p.surface}m², ${p.type_sol || '?'})`).join(', ')}`);
    }
    return context.length ? `\n\n--- CONTEXTE DE VOTRE EXPLOITATION ---\n${context.join('\n')}` : "";
  } catch (e) {
    return "";
  }
}

const getGeminiClient = createGeminiClientFactory(GoogleGenAI);

// Helper pour appeler Gemini avec retry. Chaque modèle de la liste de repli
// reprend la clé de sa famille (flash / pro).
async function callGeminiWithRetry(getClient, model, contents, systemInstruction) {
  const modelsToTry = [...new Set([model, "gemini-3.6-flash", "gemini-3.5-flash-lite"])].filter(
    Boolean
  );
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    for (const m of modelsToTry) {
      const ai = getClient(m);
      if (!ai) continue;
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          return response;
        }
      } catch (err) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }
  throw lastError || new Error("Impossible de générer une réponse de l'IA après plusieurs tentatives");
}

// Route principale Gemini améliorée avec agents spécialisés + RAG
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt, history, image, systemPrompt, model, agentType = "advisor" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt requis" });
    }

    const requestedModel = model || "gemini-3.6-flash";
    if (!geminiKeyFor(requestedModel)) {
      return res.status(500).json({ error: GEMINI_KEYS_MISSING_ERROR });
    }

    // Utiliser le prompt système fourni ou celui de l'agent
    let systemInstruction = systemPrompt || AI_SYSTEM_PROMPTS[agentType] || AI_SYSTEM_PROMPTS.advisor;

    // Si image et pas de prompt système spécifique, utiliser Doctor Plante
    if (image && !systemPrompt && agentType === "advisor") {
      systemInstruction = AI_SYSTEM_PROMPTS.plantDoctor;
    }

    // Ajouter le contexte RAG de l'exploitation
    const ragContext = buildFarmContext(agentType);
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
      return res.status(500).json({ error: "Erreur interne de l'API" });
    }
});

// ==================== OPENAI FALLBACK ====================
app.post("/api/ai/openai", async (req, res) => {
  try {
    const { prompt, systemPrompt, history, image, model = "gpt-4o-mini" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt requis" });
    }

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
    return res.status(500).json({ error: "Erreur interne de l'API" });
  }
});

// ==================== CLAUDE FALLBACK ====================
app.post("/api/ai/claude", async (req, res) => {
  try {
    const { prompt, systemPrompt, history, image, model = "claude-3-5-haiku-latest" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt requis" });
    }

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
    return res.status(500).json({ error: "Erreur interne de l'API" });
  }
});

// ==================== STREAMING SSE ====================
app.post("/api/ai/stream", async (req, res) => {
  try {
    const { prompt, systemPrompt, history, image, language = "fr", agentType = "advisor" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt requis" });
    }

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

    // Configurer SSE
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
    res.status(500).json({ error: "Erreur interne de l'API" });
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
app.post("/api/ai/translate", async (req, res) => {
  try {
    const { text, fromLang = "fr", toLang = "wo" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Texte requis" });
    }

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
    return res.status(500).json({ error: "Erreur de traduction" });
  }
});

// Helpers pour les noms d'agents
function getAgentDisplayName(id) {
  const names = {
    advisor: "Conseiller Horticole IA",
    plantDoctor: "Docteur Plante IA",
    livestock: "Conseiller Élevage IA",
    finance: "Analyste Financier IA",
    irrigation: "Expert Irrigation IA",
    soil: "Expert Sol & Compost IA",
    personal: "Assistant Personnel IA",
    wolofAdvisor: "Conseiller en Wolof",
  };
  return names[id] || `Agent ${id}`;
}

function getAgentDescription(id) {
  const descs = {
    advisor: "Conseils maraîchage, maladies, traitements bio",
    plantDoctor: "Diagnostic visuel des maladies des plantes",
    livestock: "Soins, alimentation et reproduction animale",
    finance: "Rentabilité, budget et analyse financière",
    irrigation: "Gestion de l'eau et calendrier d'arrosage",
    soil: "Compost, amendements et fertilité des sols",
    personal: "Organisation des tâches et suivi quotidien",
    wolofAdvisor: "Nga wax ci Wolof, mbey mi ci Sénégal",
  };
  return descs[id] || "";
}

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
// ==================== SYNC (Phase 1 Fullstack, additif) ====================
// BEST-EFFORT : cette route ne bloque jamais. Si Firestore est indisponible,
// elle met à jour la mémoire serveur et répond { ok: true } pour ne pas casser
// le frontend actuel (qui continue de fonctionner en local via localStorage).
// ⚠ Sécurité : à protéger par requireAuth lors de la migration Firebase Auth
//   (Phase 2). Ne pas exposer cette route publiquement en production sans auth.
const SYNCABLE_MEMORY = {
  crops: { get: () => serverCrops, set: (v) => { serverCrops = v; } },
  parcelles: { get: () => serverParcelles, set: (v) => { serverParcelles = v; } },
  tasks: { get: () => serverTasks, set: (v) => { serverTasks = v; } },
  finances: { get: () => serverFinances, set: (v) => { serverFinances = v; } },
  employees: { get: () => serverEmployees, set: (v) => { serverEmployees = v; } },
  cheptel: { get: () => serverCheptel, set: (v) => { serverCheptel = v; } },
};

// Sérialiser proprement le JSON reçu (protection anti-casse syntaxe).
function safeJson(body) {
  if (!body || typeof body !== "string") return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

// Applique une action SAVE sur une collection (collection entière ou éléments).
function applySave(collection, items) {
  const entry = SYNCABLE_MEMORY[collection];
  if (!entry || !Array.isArray(items)) return false;
  entry.set(items);
  return true;
}

// Route de synchronisation (réception d'une action unique).
app.post("/api/sync/item", async (req, res) => {
  try {
    const action = SyncActionSchema.parse(req.body || {});
    const { collection, type } = action;
    if (!SYNCABLE_MEMORY[collection]) {
      return res.status(400).json({ ok: false, error: "Collection inconnue" });
    }

    // Contrôle de rôle sur les écritures sensibles (finances / employés).
    // Les autres collections ne sont pas restreintes (comportement inchangé).
    const allowedRoles = syncWriteAllowedRoles(collection, type);
    if (allowedRoles) {
      const role = req.user && req.user.role;
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ ok: false, error: "Accès refusé : rôle insuffisant" });
      }
    }

    let persistMode = null;
    let persistPayload = null;

    if (type === "SAVE" || type === "SAVE_ALL") {
      const items = typeof action.data === "string" ? safeJson(action.data) : (action.data || action.items);
      if (!applySave(collection, items)) {
        return res.status(400).json({ ok: false, error: "données invalides" });
      }
      persistMode = "replace";
      persistPayload = items;
    } else if (type === "UPDATE" || type === "CREATE") {
      const item = action.data;
      if (!item || !item.id) {
        return res.status(400).json({ ok: false, error: "Donnée (id) requise" });
      }
      const entry = SYNCABLE_MEMORY[collection];
      const current = Array.isArray(entry.get()) ? entry.get() : [];
      const idx = current.findIndex((x) => x && x.id === item.id);
      if (idx === -1) current.push(item);
      else current[idx] = { ...current[idx], ...item };
      entry.set(current);
      persistMode = "upsert";
      persistPayload = item;
    } else if (type === "DELETE") {
      const id = action.data?.id || action.id;
      const entry = SYNCABLE_MEMORY[collection];
      const current = Array.isArray(entry.get()) ? entry.get() : [];
      entry.set(current.filter((x) => x && x.id !== id));
      persistMode = "delete";
      persistPayload = id;
    } else {
      return res.status(400).json({ ok: false, error: `Type inconnu: ${type}` });
    }

    const enterpriseId = req.user?.enterpriseId || action.enterpriseId || DEFAULT_ENTERPRISE_ID;

    // Best-effort : persister en Firestore (un document par entité).
    if (!getFirestoreUnavailableMessage()) {
      try {
        if (persistMode === "replace") await replaceCollection(collection, persistPayload, enterpriseId);
        else if (persistMode === "upsert") await upsertEntity(collection, persistPayload, enterpriseId);
        else if (persistMode === "delete") await deleteEntity(collection, persistPayload, enterpriseId);
        return res.json({ ok: true, persisted: true });
      } catch (err) {
        logger.warn(`Sync save best-effort failed for ${collection}: ${err.message}`);
      }
    }

    return res.json({ ok: true, persisted: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ ok: false, error: "Données invalides", details: validationDetails(error) });
    }
    logger.error("Sync route error", { error: error.message });
    // Dégradation : ne jamais casser le frontend, répondre ok au mieux.
    return res.status(400).json({ ok: false, error: error.message || "Erreur" });
  }
});
// Route de synchronisation batch (plusieurs actions en un appel).
app.post("/api/sync", async (req, res) => {
  try {
    const body = req.body || {};
    const actions = Array.isArray(body) ? body : body.actions;

    if (!Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({ ok: false, error: "actions requis" });
    }

    const results = [];
    for (const action of actions) {
      const collection = action && action.collection;
      if (!collection || !SYNCABLE_MEMORY[collection]) {
        results.push({ ok: false, collection, error: "Collection inconnue" });
        continue;
      }

      const type = action.type || "SAVE_ALL";

      // Contrôle de rôle sur les écritures sensibles (finances / employés) dans le batch.
      const allowedRoles = syncWriteAllowedRoles(collection, type);
      if (allowedRoles) {
        const role = req.user && req.user.role;
        if (!allowedRoles.includes(role)) {
          results.push({ ok: false, collection, error: "Accès refusé : rôle insuffisant" });
          continue;
        }
      }

      try {
        let persistMode = null;
        let persistPayload = null;
        if (type === "SAVE" || type === "SAVE_ALL") {
          const raw = action.data || action.items;
          const items = typeof raw === "string" ? safeJson(raw) : raw;
          if (!Array.isArray(items)) {
            results.push({ ok: false, collection, error: "données invalides" });
            continue;
          }
          applySave(collection, items);
          persistMode = "replace";
          persistPayload = items;
        } else if ((type === "UPDATE" || type === "CREATE") && action.data) {
          const item = action.data;
          const entry = SYNCABLE_MEMORY[collection];
          const current = Array.isArray(entry.get()) ? entry.get() : [];
          const idx = current.findIndex((x) => x && x.id === item.id);
          if (idx === -1) current.push(item);
          else current[idx] = { ...current[idx], ...item };
          entry.set(current);
          persistMode = "upsert";
          persistPayload = item;
        } else if (type === "DELETE" && (action.data?.id || action.id)) {
          const id = action.data?.id || action.id;
          const entry = SYNCABLE_MEMORY[collection];
          const current = Array.isArray(entry.get()) ? entry.get() : [];
          entry.set(current.filter((x) => x && x.id !== id));
          persistMode = "delete";
          persistPayload = id;
        }

        const enterpriseId =
          req.user?.enterpriseId || action.enterpriseId || DEFAULT_ENTERPRISE_ID;
        let persisted = false;
        if (!getFirestoreUnavailableMessage() && persistMode) {
          try {
            if (persistMode === "replace") await replaceCollection(collection, persistPayload, enterpriseId);
            else if (persistMode === "upsert") await upsertEntity(collection, persistPayload, enterpriseId);
            else if (persistMode === "delete") await deleteEntity(collection, persistPayload, enterpriseId);
            persisted = true;
          } catch (err) {
            logger.warn(`Sync batch save failed ${collection}: ${err.message}`);
          }
        }
        results.push({ ok: true, collection, persisted });
      } catch (err) {
        logger.error(`Sync batch item error ${collection}`, { error: err.message });
        results.push({ ok: false, collection, error: err.message });
      }
    }

    return res.json({ ok: true, results });
  } catch (error) {
    logger.error("Sync batch route error", { error: error.message });
    return res.status(400).json({ ok: false, error: error.message || "Erreur" });
  }
});

// Route santé (annexe, non bloquante).
app.get("/api/health", async (req, res) => {
  res.json({ ok: true, status: "up", timestamp: new Date().toISOString() });
});

export default app;
