// KA Farm - Client Authentification (Backend API)
// Utilise les endpoints /api/auth/* du serveur

const API_BASE = '/api/auth';
import { logger } from './modules/logger.js';

// Export supabase pour compatibilité avec l'admin dashboard
// (utilise le backend API au lieu de Supabase direct)
export const supabase = {
  auth: {
    signInWithPassword: signIn,
    signUp: signUp,
    signOut: signOut,
    getSession: async () => {
      const result = await verifyToken();
      if (result.valid) {
        return { data: { session: { user: result.user } } };
      }
      return { data: { session: null } };
    },
    getUser: async () => {
      const result = await verifyToken();
      if (result.valid) {
        return { data: { user: result.user } };
      }
      return { data: { user: null } };
    }
  },
  from: (table) => ({
    select: (cols) => ({
      eq: (field, value) => ({
        single: async () => {
          // Utiliser l'API backend
          const response = await fetch(`/api/${table}?${field}=${value}`);
          const data = await response.json();
          return { data: Array.isArray(data) ? data[0] : data, error: null };
        },
        then: (fn) => fn
      })
    })
  })
};

// ==================== INSCRIPTION ====================

async function signUp(email, password, name, farmName = '') {
  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        farm_name: farmName
      })
    });

    const result = await response.json();

    if (result.success) {
      return { data: result.user, error: null };
    } else {
      return { data: null, error: result.error };
    }
  } catch (error) {
    logger.error('Signup error', { error: error.message });
    return { data: null, error: 'Erreur de connexion au serveur' };
  }
}

// ==================== CONNEXION ====================

async function signIn(email, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const result = await response.json();

    if (result.success) {
      return { data: result, error: null };
    } else {
      return { data: null, error: result.error };
    }
  } catch (error) {
    logger.error('Login error', { error: error.message });
    return { data: null, error: 'Erreur de connexion au serveur' };
  }
}

// ==================== DÉCONNEXION ====================

async function signOut() {
  try {
    const token = localStorage.getItem('kafarm_token');
    
    if (token) {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    // Nettoyer le localStorage
    localStorage.removeItem('kafarm_token');
    localStorage.removeItem('kafarm_user');

    // Redirection vers login
    window.location.href = '/pages/auth/login.html';
  } catch (error) {
    logger.error('Logout error', { error: error.message });
  }
}

// ==================== VÉRIFICATION TOKEN ====================

async function verifyToken() {
  try {
    const token = localStorage.getItem('kafarm_token');

    if (!token) {
      return { valid: false, user: null };
    }

    const response = await fetch(`${API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (result.success) {
      return { valid: true, user: result.user };
    } else {
      // Token invalide - nettoyer
      localStorage.removeItem('kafarm_token');
      localStorage.removeItem('kafarm_user');
      return { valid: false, user: null };
    }
  } catch (error) {
    logger.error('Token verification error', { error: error.message });
    return { valid: false, user: null };
  }
}

// ==================== UTILITAIRES ====================

function getStoredUser() {
  try {
    const userStr = localStorage.getItem('kafarm_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    logger.error('Get stored user error', { error: error.message });
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem('kafarm_token');
}

function isAuthenticated() {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
}

// ==================== ÉVÉNEMENTS GLOBAUX ====================

// Ajouter les événements pour les formulaires
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('kafarm_token');
  const userStr = localStorage.getItem('kafarm_user');

  // Vérifier le token seulement sur les pages protégées
  if (token && userStr) {
    const protectedPages = [
      '/pages/shared/dashboard.html',
      '/pages/shared/harvest.html',
      '/pages/shared/parcelles.html',
      '/pages/shared/crops.html',
      '/pages/shared/finances.html',
      '/pages/shared/stocks.html',
      '/pages/shared/employees.html',
      '/pages/shared/tasks.html',
      '/pages/shared/treatments.html'
    ];

    const isProtectedPage = protectedPages.some(page => 
      window.location.pathname.includes(page)
    );

    if (isProtectedPage) {
      const { valid } = await verifyToken();
      if (!valid) {
        window.location.href = '/pages/auth/login.html';
      }
    }
  }
});

// Fonction utilitaire pour vérifier si l'utilisateur est admin
function isAdmin() {
  const user = getStoredUser();
  return user && (user.role === 'admin' || user.role === 'super_admin');
}

// Créer l'objet Auth
const Auth = {
  signUp,
  signIn,
  signOut,
  verifyToken,
  getStoredUser,
  getStoredToken,
  isAuthenticated,
  isAdmin
};

// Exposer les fonctions globalement
window.Auth = Auth;

// Export pour compatibilité avec l'admin dashboard
export { signUp, signIn, signOut, verifyToken, getStoredUser, getStoredToken, isAuthenticated, Auth, isAdmin };
