// KA Farm - User Manager
// Handles roles, permissions and authorization rules

import { KAStorage } from './storage.js';

export const UserManager = {
  getRoles() {
    return {
      TERRAIN: 'Terrain',
      BUREAU: 'Bureau'
    };
  },

  getCurrentUser() {
    return KAStorage.getCurrentUser();
  },

  isLoggedIn() {
    return KAStorage.getCurrentUser() !== null;
  },

  // Check if current user has role Terrain (Moussa - ground operator)
  isTerrain() {
    const user = this.getCurrentUser();
    return user && user.role === 'Terrain';
  },

  // Check if current user has role Bureau (Aly - office supervisor)
  isBureau() {
    const user = this.getCurrentUser();
    return user && user.role === 'Bureau';
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

  // Require login helper. Redirect to login if not authenticated
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/pages/auth/login.html';
      return false;
    }
    return true;
  },

  // Redirect if logged in (e.g., from login page to dashboard)
  redirectIfAuth() {
    if (this.isLoggedIn()) {
      window.location.href = '/pages/shared/dashboard.html';
    }
  }
};
