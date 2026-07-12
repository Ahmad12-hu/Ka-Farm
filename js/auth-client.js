// KA Farm - Supabase Auth Client
// Gère l'authentification via Supabase

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin email autorisé (remplacer par votre email)
const ADMIN_EMAIL = 'admin@kafarm.sn';

/**
 * Connexion avec email/mot de passe
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data: any, error: any}>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

/**
 * Inscription - Désactivée pour l'admin
 */
export async function signUp(email, password) {
  return {
    data: null,
    error: 'La création de compte est désactivée pour cet espace.'
  };
}

/**
 * Déconnexion
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    window.location.href = '/pages/admin/login.html';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/pages/admin/login.html';
  }
}

/**
 * Vérifier si l'utilisateur est connecté
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

/**
 * Obtenir l'utilisateur connecté
 * @returns {Promise<User|null>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Vérifier que c'est bien l'admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.email === ADMIN_EMAIL;
}

/**
 * Middleware de protection des routes admin
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated();
  const admin = await isAdmin();

  if (!authenticated) {
    window.location.href = '/pages/admin/login.html';
    return false;
  }

  if (!admin) {
    alert('Accès refusé. Vous n\'êtes pas administrateur.');
    await signOut();
    return false;
  }

  return true;
}

// Exposer globalement et en tant qu'export nommé
window.supabase = supabase;
export const Auth = { signIn, signUp, signOut, isAuthenticated, getCurrentUser, requireAuth };
