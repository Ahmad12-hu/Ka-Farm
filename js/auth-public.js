// KA Farm - Authentication Public (Supabase Auth)
// Ce fichier gère l'inscription et la connexion des utilisateurs publics via Supabase Auth
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const AuthPublic = {
  /**
   * Inscrire un nouvel utilisateur public
   * @param {string} name - Nom complet
   * @param {string} email - Email
   * @param {string} role - Rôle (Terrain, Bureau, etc.)
   * @param {string} password - Mot de passe
   * @returns {Promise<boolean>} - Succès ou échec
   */
  async signup(name, email, role, password) {
    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: role,
          }
        }
      });

      if (authError) {
        console.error('Erreur Supabase Auth:', authError);
        alert(`Erreur d'inscription: ${authError.message}`);
        return false;
      }

      // 2. Créer l'entrée dans la table users (si l'utilisateur est confirmé)
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id, // Lier à l'UUID de Supabase Auth
            email: email,
            name: name,
            role: role,
            user_id: authData.user.id, // Référence pour RLS
            enterprise_id: `user_${authData.user.id}`, // Chaque utilisateur a son propre enterprise_id
            enterprise_name: `${name}'s Farm`,
            enterprise_code: `KAF-${Math.floor(1000 + Math.random() * 9000)}`,
          });

        if (dbError) {
          console.error('Erreur insertion users:', dbError);
          // Continuer quand même, l'utilisateur est créé dans Auth
        }
      }

      alert('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      
      // Rediriger vers la page de login
      window.location.href = '/pages/auth/login.html';
      return true;
    } catch (error) {
      console.error('Erreur signup:', error);
      alert("Erreur lors de la création du compte. Veuillez réessayer.");
      return false;
    }
  },

  /**
   * Connecter un utilisateur public
   * @param {string} email - Email
   * @param {string} password - Mot de passe
   * @returns {Promise<boolean>} - Succès ou échec
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Erreur login:', error);
        alert(`Erreur de connexion: ${error.message}`);
        return false;
      }

      if (data.user) {
        // Récupérer les infos utilisateur depuis la table users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (userError) {
          console.error('Erreur récupération user:', userError);
        }

        // Stocker dans localStorage
        localStorage.setItem('ka_farm_user', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: userData?.name || data.user.user_metadata?.name || 'Utilisateur',
          role: userData?.role || data.user.user_metadata?.role || 'Bureau',
          enterpriseId: userData?.enterprise_id || `user_${data.user.id}`,
          enterpriseName: userData?.enterprise_name || "Ma Ferme",
          enterpriseCode: userData?.enterprise_code || '',
        }));

        alert(`Bienvenue, ${data.user.user_metadata?.name || 'Utilisateur'} !`);
        window.location.href = '/pages/shared/dashboard.html';
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur login:', error);
      alert("Erreur lors de la connexion. Veuillez réessayer.");
      return false;
    }
  },

  /**
   * Déconnecter l'utilisateur
   */
  async logout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('ka_farm_user');
      alert("Vous avez été déconnecté.");
      window.location.href = '/index.html';
    } catch (error) {
      console.error('Erreur logout:', error);
      localStorage.removeItem('ka_farm_user');
      window.location.href = '/index.html';
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {boolean}
   */
  isAuthenticated() {
    const user = localStorage.getItem('ka_farm_user');
    return user !== null;
  },

  /**
   * Obtenir l'utilisateur connecté
   * @returns {object|null}
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('ka_farm_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Obtenir le client Supabase (pour les requêtes directes)
   * @returns {object}
   */
  getSupabase() {
    return supabase;
  }
};

// Exposer globalement
window.AuthPublic = AuthPublic;
