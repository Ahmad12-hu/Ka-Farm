// KA Farm - User Manager
// Handles roles, permissions and authorization rules

import { KAStorage } from "./storage.js";
import { USER_ROLES, ALL_USER_ROLES, ROLE_PERMISSIONS, isAdminRole } from "./constants/roles.js";

export const UserManager = {
  getRoles() {
    return {
      TERRAIN: USER_ROLES.TERRAIN,
      BUREAU: USER_ROLES.BUREAU,
    };
  },

  getCurrentUser() {
    return KAStorage.getCurrentUser();
  },

  isLoggedIn() {
    return KAStorage.getCurrentUser() !== null;
  },

  // Check if current user has role Terrain (ground operator)
  isTerrain() {
    const user = this.getCurrentUser();
    return user && user.role === "Terrain";
  },

  // Check if current user has role Bureau (office supervisor)
  isBureau() {
    const user = this.getCurrentUser();
    return user && user.role === "Bureau";
  },

  // Check if current user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && isAdminRole(user.role);
  },

  // Role permissions checking
  canEditCrops() {
    const user = this.getCurrentUser();
    return !!(user && ALL_USER_ROLES.includes(user.role));
  },

  canEditFinances() {
    const user = this.getCurrentUser();
    return !!(user && (user.role === USER_ROLES.BUREAU || isAdminRole(user.role)));
  },

  canEnterSales() {
    const user = this.getCurrentUser();
    return !!(user && ALL_USER_ROLES.includes(user.role));
  },

  canManageTasks() {
    const user = this.getCurrentUser();
    return !!(user && ALL_USER_ROLES.includes(user.role));
  },

  canManageEmployees() {
    const user = this.getCurrentUser();
    return !!(user && (user.role === USER_ROLES.BUREAU || isAdminRole(user.role)));
  },

  canManageStocks() {
    const user = this.getCurrentUser();
    return !!(user && (user.role === USER_ROLES.BUREAU || isAdminRole(user.role)));
  },

  // View-only permissions for shared pages
  canViewFinances() {
    const user = this.getCurrentUser();
    return !!(user && ALL_USER_ROLES.includes(user.role));
  },

  canViewEmployees() {
    const user = this.getCurrentUser();
    return !!(user && ALL_USER_ROLES.includes(user.role));
  },

  canManageHarvests() {
    const user = this.getCurrentUser();
    return !!(user && ALL_USER_ROLES.includes(user.role));
  },

  // Require login helper. Redirect to login if not authenticated
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.assign("/pages/auth/login.html");
      return false;
    }
    return true;
  },

  // Redirect if logged in (e.g., from login page to dashboard)
  redirectIfAuth() {
    if (this.isLoggedIn()) {
      window.location.assign("/pages/shared/dashboard.html");
    }
  },
};
