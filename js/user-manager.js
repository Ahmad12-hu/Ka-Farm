// KA Farm - User Manager
// Handles roles, permissions and authorization rules
// localStorage only (browser-compatible)

import { KAStorage } from './storage.js';

export const UserManager = {
  getRoles() {
    return {
      TERRAIN: 'terrain',
      BUREAU: 'gestionnaire',
      ADMIN: 'admin',
      INVITE: 'invite'
    };
  },

  getCurrentUser() {
    return KAStorage.getCurrentUser();
  },

  isLoggedIn() {
    return KAStorage.getCurrentUser() !== null;
  },

  // Login avec localStorage
  async login(email, password) {
    try {
      const users = KAStorage.getUsers();
      const localUser = users.find(u => u.email === email && u.password === KAStorage.hashPassword(password));

      if (localUser) {
        const sessionUser = {
          email: localUser.email,
          name: localUser.name,
          role: localUser.role,
          fermeId: null,
          userId: null,
          isLocal: true
        };

        KAStorage.setCurrentUser(sessionUser, true);
        return { success: true, user: sessionUser };
      }
    } catch (error) {
      console.error('Erreur login localStorage:', error);
    }

    return { success: false, error: 'Email ou mot de passe incorrect' };
  },

  // Logout
  logout() {
    KAStorage.setCurrentUser(null, false);
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
      KAStorage.setCurrentUser(guestUser, false);
    }
  },

  // Redirect if logged in (e.g., from login page to dashboard)
  redirectIfAuth() {
    if (this.isLoggedIn()) {
      window.location.href = '/pages/shared/dashboard.html';
    }
  }
};
