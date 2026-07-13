// KA Farm - Router & Page Protection Logic
import { UserManager } from './user-manager.js';
import { KAStorage } from './storage.js';

// Fonction locale pour vérifier si l'utilisateur est admin
function isAdmin() {
  const user = KAStorage.getCurrentUser();
  return user && (user.role === 'admin' || user.role === 'super_admin');
}

export const Router = {
  // Routes config for active states in the sidebar
  routes: {
    '/': 'accueil',
    '/index.html': 'accueil',
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
    '/pages/shared/discussion.html': 'discussion',
    '/pages/shared/calendar.html': 'calendar',
    '/pages/shared/profitability.html': 'profitability',
    '/pages/shared/market-prices.html': 'market-prices',
    '/pages/shared/tools-sharing.html': 'tools-sharing',
    '/pages/personal/profile.html': 'profile',
    '/pages/personal/my-tasks.html': 'tasks',
    '/pages/personal/my-sales.html': 'sales',
    '/pages/personal/settings.html': 'settings',
    '/pages/admin/dashboard.html': 'admin',
  },

  init() {
    this.protectRoutes();
    this.highlightActiveSidebarLink();
  },

  protectRoutes() {
    const path = window.location.pathname;
    
    // Auth pages
    const isAuthPage = path.includes('/pages/auth/login.html') || path.includes('/pages/auth/signup.html');
    const isHomePage = path === '/' || path.endsWith('/index.html');
    
    if (isAuthPage) {
      UserManager.redirectIfAuth();
    } else if (!isHomePage) {
      // Any other subpage under pages/ requires auth
      UserManager.requireAuth();
    }
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
