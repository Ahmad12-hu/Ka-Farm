// KA Farm - User Manager (MongoDB version)
// Handles roles, permissions and authorization rules using MongoDB

import { connectDB } from '../database/mongodb-config.js';
import { User } from '../database/models/index.js';
import bcrypt from 'bcrypt';

export const UserManagerMongoDB = {
  // Initialiser la connexion MongoDB
  async init() {
    try {
      await connectDB();
      console.log('✅ User Manager MongoDB initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation User Manager:', error);
    }
  },

  getRoles() {
    return {
      TERRAIN: 'terrain',
      BUREAU: 'gestionnaire',
      ADMIN: 'admin',
      INVITE: 'invite'
    };
  },

  getCurrentUser() {
    // Récupérer depuis localStorage (session)
    const userJSON = localStorage.getItem('kafarm_current_user');
    return userJSON ? JSON.parse(userJSON) : null;
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  // Login avec MongoDB
  async login(email, password) {
    try {
      await connectDB();
      
      // Chercher l'utilisateur dans MongoDB
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }
      
      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }
      
      // Vérifier si l'utilisateur est actif
      if (!user.actif) {
        return { success: false, error: 'Compte désactivé' };
      }
      
      // Mettre à jour la dernière connexion
      await User.findByIdAndUpdate(user._id, { derniereConnexion: new Date() });
      
      // Créer la session utilisateur
      const sessionUser = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        fermeId: user.fermeId ? user.fermeId.toString() : null,
        telephone: user.telephone,
        isMongoDB: true
      };
      
      localStorage.setItem('kafarm_current_user', JSON.stringify(sessionUser));
      
      return { success: true, user: sessionUser };
    } catch (error) {
      console.error('Erreur login MongoDB:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  },

  // Créer un nouvel utilisateur
  async register(userData) {
    try {
      await connectDB();
      
      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        return { success: false, error: 'Cet email est déjà utilisé' };
      }
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Créer l'utilisateur
      const newUser = await User.create({
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        name: userData.name,
        role: userData.role || 'invite',
        fermeId: userData.fermeId || null,
        telephone: userData.telephone || null,
        actif: true
      });
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Erreur register MongoDB:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('kafarm_current_user');
    window.location.href = '/index.html';
  },

  // Check if current user has role Terrain (Moussa - ground operator)
  isTerrain() {
    const user = this.getCurrentUser();
    return user && (user.role === 'terrain' || user.role === 'Terrain');
  },

  // Check if current user has role Bureau (Aly - office supervisor)
  isBureau() {
    const user = this.getCurrentUser();
    return user && (user.role === 'gestionnaire' || user.role === 'Bureau');
  },

  // Check if admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Role permissions checking
  canEditCrops() {
    // Both roles can view crops, but terrain performs ground updates and bureau plans them.
    return true;
  },

  canEditFinances() {
    // Terrain can enter sales ("Noter les ventes au marché")
    // Bureau can manage all aspects of finances ("Analyser les revenus/dépenses")
    return true;
  },

  canManageTasks() {
    // Both can manage, but Terrain mainly executes.
    return true;
  },

  // Require login helper. If not logged in, redirect to login.
  // Modified for public access: visitors can browse without account
  requireAuth() {
    // Public access allowed - no redirect required
    // Users can view the site as guests
    if (!this.isLoggedIn()) {
      // Optionally set a guest user context for UI consistency
      const guestUser = {
        email: 'guest@kafarm.sn',
        name: 'Visiteur',
        role: 'invite',
        isGuest: true
      };
      localStorage.setItem('kafarm_current_user', JSON.stringify(guestUser));
    }
  },

  // Redirect if logged in (e.g., from login page to dashboard)
  redirectIfAuth() {
    if (this.isLoggedIn()) {
      window.location.href = '/pages/shared/dashboard.html';
    }
  }
};
