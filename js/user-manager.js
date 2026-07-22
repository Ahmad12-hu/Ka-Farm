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

  // Check if current user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && (user.role === 'admin' || user.role === 'super_admin');
  },

  // Role permissions checking
  canEditCrops() {
    // Both roles can view and edit crops
    // Terrain performs ground updates (status, irrigation)
    // Bureau plans them (scheduling, planning)
    const user = this.getCurrentUser();
    return user && (user.role === 'Terrain' || user.role === 'Bureau' || user.role === 'admin' || user.role === 'super_admin');
  },

  canEditFinances() {
    // Bureau can manage all aspects of finances (revenues, expenses, analysis)
    // Terrain can only enter sales at market (limited access)
    // Admin and super_admin have full access
    const user = this.getCurrentUser();
    return user && (user.role === 'Bureau' || user.role === 'admin' || user.role === 'super_admin');
  },

  canEnterSales() {
    // Terrain can enter sales at market
    // Bureau can also enter sales as part of full finance management
    // Admin and super_admin have full access
    const user = this.getCurrentUser();
    return user && (user.role === 'Terrain' || user.role === 'Bureau' || user.role === 'admin' || user.role === 'super_admin');
  },

  canManageTasks() {
    // Both can manage tasks
    // Terrain mainly executes and updates status
    // Bureau can create, assign and prioritize
    // Admin and super_admin have full access
    const user = this.getCurrentUser();
    return user && (user.role === 'Terrain' || user.role === 'Bureau' || user.role === 'admin' || user.role === 'super_admin');
  },

  canManageEmployees() {
    // Only Bureau and admin can manage employees (hiring, payments)
    // Terrain can only view their own assignments
    const user = this.getCurrentUser();
    return user && (user.role === 'Bureau' || user.role === 'admin' || user.role === 'super_admin');
  },

  canManageStocks() {
    // Only Bureau and admin can manage stocks (inventory, purchases)
    // Terrain can only view and report usage
    const user = this.getCurrentUser();
    return user && (user.role === 'Bureau' || user.role === 'admin' || user.role === 'super_admin');
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
