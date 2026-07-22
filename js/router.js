// KA Farm - Router & Page Protection Logic
import { UserManager } from './user-manager.js';

export const Router = {
  // Routes config for active states in the sidebar
  routes: {
    '/': 'accueil',
    '/index.html': 'accueil',
    '/pages/auth/login.html': 'login',
    '/pages/auth/signup.html': 'signup',
    '/pages/admin/login.html': 'admin-login',
    '/pages/admin/dashboard.html': 'admin',
    '/pages/shared/dashboard.html': 'dashboard',
    '/pages/shared/crops.html': 'crops',
    '/pages/shared/alerts.html': 'alerts',
    '/pages/shared/irrigation.html': 'irrigation',
    '/pages/shared/harvest.html': 'harvest',
    '/pages/shared/parcelles.html': 'parcelles',
    '/pages/shared/employees.html': 'employees',
    '/pages/shared/treatments.html': 'treatments',
    '/pages/shared/finances.html': 'finances',
    '/pages/shared/stocks.html': 'stocks',
    '/pages/shared/elevage.html': 'elevage',
    '/pages/shared/training.html': 'training',
    '/pages/shared/calendar.html': 'calendar',
    '/pages/shared/profitability.html': 'profitability',
    '/pages/shared/market-prices.html': 'market-prices',
    '/pages/shared/tools-sharing.html': 'tools-sharing',
    '/pages/personal/profile.html': 'profile',
    '/pages/personal/my-tasks.html': 'tasks',
    '/pages/personal/my-sales.html': 'sales',
    '/pages/personal/settings.html': 'settings',
  },

  publicRoutes: new Set([
    '/',
    '/index.html',
    '/pages/auth/login.html',
    '/pages/auth/signup.html',
  ]),

  protectedRoutes: new Set([
    '/pages/shared/dashboard.html',
    '/pages/shared/crops.html',
    '/pages/shared/alerts.html',
    '/pages/shared/irrigation.html',
    '/pages/shared/harvest.html',
    '/pages/shared/parcelles.html',
    '/pages/shared/employees.html',
    '/pages/shared/treatments.html',
    '/pages/shared/finances.html',
    '/pages/shared/stocks.html',
    '/pages/shared/elevage.html',
    '/pages/shared/training.html',
    '/pages/shared/calendar.html',
    '/pages/shared/profitability.html',
    '/pages/shared/market-prices.html',
    '/pages/shared/tools-sharing.html',
    '/pages/personal/profile.html',
    '/pages/personal/my-tasks.html',
    '/pages/personal/my-sales.html',
    '/pages/personal/settings.html',
  ]),

  adminPublicRoutes: new Set([
    '/pages/admin/login.html',
  ]),

  adminRoutes: new Set([
    '/pages/admin/dashboard.html',
  ]),

  init() {
    this.protectRoutes();
    this.highlightActiveSidebarLink();
  },

  protectRoutes() {
    const path = window.location.pathname;

    if (this.adminRoutes.has(path)) {
      if (!UserManager.isLoggedIn() || !UserManager.isAdmin()) {
        window.location.href = '/pages/shared/dashboard.html';
      }
      return;
    }

    if (this.adminPublicRoutes.has(path)) {
      if (UserManager.isLoggedIn()) {
        window.location.href = '/pages/shared/dashboard.html';
      }
      return;
    }

    if (this.publicRoutes.has(path)) {
      if (UserManager.isLoggedIn()) {
        window.location.href = '/pages/shared/dashboard.html';
      }
      return;
    }

    if (this.protectedRoutes.has(path)) {
      if (!UserManager.requireAuth()) {
        return;
      }

      // Role-based access control for sensitive routes
      if (path === '/pages/shared/finances.html' && !UserManager.canEditFinances()) {
        window.location.href = '/pages/shared/dashboard.html';
        return;
      }

      if (path === '/pages/shared/employees.html' && !UserManager.canManageEmployees()) {
        window.location.href = '/pages/shared/dashboard.html';
        return;
      }

      if (path === '/pages/shared/stocks.html' && !UserManager.canManageStocks()) {
        window.location.href = '/pages/shared/dashboard.html';
        return;
      }

      return;
    }

    UserManager.requireAuth();
  },

  highlightActiveSidebarLink() {
    const path = window.location.pathname;
    const currentRouteKey = Object.keys(this.routes).find(route => path.endsWith(route));
    const activeRouteName = currentRouteKey ? this.routes[currentRouteKey] : '';
    
    if (!activeRouteName) return;
    
    // Wait for the sidebar to be injected if it is dynamic
    document.addEventListener('sidebarInjected', () => {
      const buttons = document.querySelectorAll('.nav-btn');
      buttons.forEach(btn => {
        const tabName = btn.getAttribute('data-tab');
        if (tabName === activeRouteName) {
          btn.classList.add('bg-emerald-600', 'text-white');
          btn.classList.remove('text-slate-300', 'hover:bg-[#0E2F19]', 'hover:text-white');
        } else {
          btn.classList.remove('bg-emerald-600', 'text-white');
          btn.classList.add('text-slate-300', 'hover:bg-[#0E2F19]', 'hover:text-white');
        }
      });

      const mobileButtons = document.querySelectorAll('.mobile-nav-btn');
      mobileButtons.forEach(btn => {
        const tabName = btn.getAttribute('data-tab');
        const dot = btn.querySelector('.mobile-nav-dot');
        if (tabName === activeRouteName) {
          btn.classList.add('text-emerald-500', 'dark:text-emerald-400', 'font-black');
          btn.classList.remove('text-slate-400', 'dark:text-[#819888]');
          if (dot) {
            dot.classList.remove('scale-0');
            dot.classList.add('scale-100');
          }
        } else {
          btn.classList.remove('text-emerald-500', 'dark:text-emerald-400', 'font-black');
          btn.classList.add('text-slate-400', 'dark:text-[#819888]');
          if (dot) {
            dot.classList.remove('scale-100');
            dot.classList.add('scale-0');
          }
        }
      });
    });
  },

  navigateTo(path) {
    window.location.href = path;
  }
};

// Auto run on load
document.addEventListener('DOMContentLoaded', () => {
  Router.init();
});
