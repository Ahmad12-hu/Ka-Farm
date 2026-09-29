// KA Farm - Authentication Controller (Firebase Auth)
// ------------------------------------------------------------------
// ✅ Commute l'authentification du système LOCAL (PBKDF2 + localStorage)
//    vers Firebase Auth (SDK client).
//
// Flux :
//   - login  : signInWithEmailAndPassword → stocke l'ID token dans
//              localStorage (clé `kafarm_token`, lue par api-client.js) →
//              hydrate le profil (rôles depuis Firestore via `/api/auth/me`) →
//              persiste le profil courant (localStorage) pour l'UI locale.
//   - signup : createUserWithEmailAndPassword → profil local (rôles choisis
//              conservés localement ; la source de vérité serveur reste le doc
//              Firestore `users/{uid}` provisionné côté admin/seed).
//   - logout : signOut → purge token + profil local.
//   - Session : onAuthStateChanged restaure token + profil si localStorage est
//              vide (couverture des cas cookie/localStorage vidé).
//
// Source de vérité du rôle :
//   1) Serveur `/api/auth/me` (Firestore users/{uid} via Admin SDK) — best effort.
//   2) Profil local mis en cache pour le MÊME uid (fallback hors-ligne).
//   3) Rôle par défaut « Terrain ».
// L'envoi de l'ID token dans chaque requête API (Bearer) débloque les routes
// protégées par requireAuth (voir api/index.js).
// ------------------------------------------------------------------

import { auth } from "./firebase/firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  getIdToken,
} from "firebase/auth";
import { KAStorage } from "./storage.js";
import { USER_ROLES, isValidUserRole } from "./constants/roles.js";
import { logger } from "./modules/logger.js";
import { ErrorHandler } from "./modules/error-handler.js";

export const TOKEN_KEY = "kafarm_token";
const LEGACY_TOKEN_KEY = "ka_farm_token";
const DEFAULT_ENTERPRISE_ID = "ka_farm";
const DEFAULT_ENTERPRISE_NAME = "KA Farm";
const DEFAULT_ENTERPRISE_CODE = "KA-FARM";

// ---- Gestion du token (Bearer pour les routes /api/*) ----------------------
function getToken() {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem(LEGACY_TOKEN_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    /* localStorage indisponible : silencieux */
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    /* silencieux */
  }
}

// Traduction des codes d'erreur Firebase Auth en messages français
const FIREBASE_AUTH_ERROR_MESSAGES = {
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/user-not-found": "Aucun compte associé à cette adresse email.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/invalid-email": "Adresse email invalide.",
  "auth/user-disabled": "Ce compte a été désactivé.",
  "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
  "auth/email-already-in-use": "Cette adresse email est déjà utilisée.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/operation-not-allowed": "Cette opération n'est pas autorisée.",
  "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion.",
  "auth/internal-error": "Erreur interne. Veuillez réessayer.",
};

// Codes serveur Identity Toolkit (exposés par le SDK via error.message) que le
// SDK ne traduit pas toujours en error.code. On les détecte pour afficher une
// cause claire au lieu du message générique.
const FIREBASE_SERVER_ERROR_MESSAGES = {
  CONFIGURATION_NOT_FOUND:
    "Configuration Firebase introuvable : le projet Firebase référencé n'existe pas ou l'API Identity Toolkit est désactivée. Vérifiez firebase-applet-config.json.",
  OPERATION_NOT_ALLOWED:
    "La connexion Email/Mot de passe est désactivée : activez-la dans la console Firebase (Authentication → Sign-in method → Email/Password).",
};

function getFriendlyAuthError(error) {
  const code = (error && error.code) || "";
  const message = (error && error.message) || "";
  const serverCode = Object.keys(FIREBASE_SERVER_ERROR_MESSAGES).find((k) =>
    message.includes(k)
  );
  return (
    (serverCode && FIREBASE_SERVER_ERROR_MESSAGES[serverCode]) ||
    FIREBASE_AUTH_ERROR_MESSAGES[code] ||
    "Erreur lors de l'opération. Veuillez réessayer."
  );
}

const AUTH_API = "/pages/shared/dashboard.html";
// Construit l'objet utilisateur applicatif (même shape que l'ancien profil).
function profileFromFirebaseUser(firebaseUser, extra = {}) {
  const email = (firebaseUser && firebaseUser.email) || "";
  const nameGuess = email.split("@")[0] || "Utilisateur";
  const role = isValidUserRole(extra.role) ? extra.role : USER_ROLES.TERRAIN;
  return {
    uid: (firebaseUser && firebaseUser.uid) || "",
    userId: (firebaseUser && firebaseUser.uid) || "",
    email,
    name: extra.name || (firebaseUser && firebaseUser.displayName) || nameGuess,
    role,
    enterpriseId: extra.enterpriseId || DEFAULT_ENTERPRISE_ID,
    enterpriseName: extra.enterpriseName || DEFAULT_ENTERPRISE_NAME,
    enterpriseCode: extra.enterpriseCode || DEFAULT_ENTERPRISE_CODE,
    firebase: true,
  };
}

// Lecture du profil autoritatif depuis le serveur (rôles en provenance de
// Firestore users/{uid}). Retourne null en cas d'échec (réseau, 401, off).
async function fetchServerProfile(firebaseUser, token) {
  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const u = payload && payload.user;
  if (!u) return null;
  return profileFromFirebaseUser(firebaseUser, {
    name: u.name,
    role: u.role,
    enterpriseId: u.enterpriseId,
    enterpriseName: u.enterpriseName,
    enterpriseCode: u.enterpriseCode,
  });
}

// Hydrate le profil dans l'ordre : serveur → cache local (même uid) → défaut.
async function hydrateProfile(firebaseUser, token) {
  try {
    const server = await fetchServerProfile(firebaseUser, token);
    if (server) return server;
  } catch (err) {
    logger.warn("hydrateProfile: fallback local", {
      error: (err && err.message) || "",
    });
  }

  const cached = KAStorage.getCurrentUser();
  if (cached && cached.uid && cached.uid === firebaseUser.uid) {
    return profileFromFirebaseUser(firebaseUser, {
      name: cached.name,
      role: cached.role,
      enterpriseId: cached.enterpriseId,
      enterpriseName: cached.enterpriseName,
      enterpriseCode: cached.enterpriseCode,
    });
  }

  return profileFromFirebaseUser(firebaseUser);
}
export const Auth = {
  async login(email, password) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      const token = await getIdToken(firebaseUser, true);
      setToken(token);

      const profile = await hydrateProfile(firebaseUser, token);
      KAStorage.setCurrentUser(profile, true);

      logger.info("User logged in via Firebase", {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      });
      ErrorHandler.showToast(`Bienvenue, ${profile.name} !`, "success");
      window.location.assign(AUTH_API);
      return true;
    } catch (error) {
      logger.warn("Login failed", {
        error: (error && (error.code || error.message)) || "",
      });
      ErrorHandler.showToast(getFriendlyAuthError(error), "error");
      return false;
    }
  },

  async signup(
    name,
    email,
    role,
    password,
    _mode = "create",
    enterpriseName = ""
  ) {
    try {
      const selectedRole = isValidUserRole(role) ? role : USER_ROLES.TERRAIN;
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      if (name) {
        try {
          await updateProfile(firebaseUser, { displayName: name });
        } catch {
          /* non bloquant */
        }
      }

      const token = await getIdToken(firebaseUser, true);
      setToken(token);

      const enterpriseId = `ent_${Date.now()}`;
      const entName = (enterpriseName || "Mon Exploitation").trim() || "Mon Exploitation";
      const entCode = `KAF-${Math.floor(1000 + Math.random() * 9000)}`;

      const profile = profileFromFirebaseUser(firebaseUser, {
        name,
        role: selectedRole,
        enterpriseId,
        enterpriseName: entName,
        enterpriseCode: entCode,
      });
      KAStorage.setCurrentUser(profile, true);

      logger.info("User signed up via Firebase", {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: selectedRole,
      });
      ErrorHandler.showToast(
        `Compte créé avec succès !\nExploitation : ${entName}\nCode Équipe : ${entCode}`,
        "success"
      );
      window.location.assign(AUTH_API);
      return true;
    } catch (error) {
      logger.warn("Signup failed", {
        error: (error && (error.code || error.message)) || "",
      });
      ErrorHandler.showToast(getFriendlyAuthError(error), "error");
      return false;
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      logger.warn("Logout error", { error: (error && error.message) || "" });
    }
    clearToken();
    KAStorage.setCurrentUser(null);
    ErrorHandler.showToast("Vous avez été déconnecté.", "success");
    window.location.assign(LOGOUT_URL);
  },

  // Token courant (ID token Firebase frais ou token mis en cache).
  async getFirebaseToken(refresh = false) {
    if (auth.currentUser) {
      return getIdToken(auth.currentUser, refresh);
    }
    return getToken();
  },

  getToken,
};
// Restauration de session : si Firebase confirme un utilisateur connecté alors
// que le profil local est absent (ou appartient à un autre uid), on le
// ré-hydrate et on resynchronise le token.
let authStateBound = false;
if (typeof window !== "undefined" && !authStateBound) {
  authStateBound = true;
  onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser, false);
        setToken(token);
        const local = KAStorage.getCurrentUser();
        if (!local || (local.uid && local.uid !== firebaseUser.uid)) {
          const profile = await hydrateProfile(firebaseUser, token);
          KAStorage.setCurrentUser(profile, true);
        }
      } else {
        clearToken();
        KAStorage.setCurrentUser(null);
      }
    } catch (err) {
      logger.warn("onAuthStateChanged handler error", {
        error: (err && err.message) || "",
      });
    }
  });
}

// Expose globalement pour compat avec les appels inline.
if (typeof window !== "undefined") {
  window.Auth = Auth;
}
const LOGOUT_URL = "/index.html";