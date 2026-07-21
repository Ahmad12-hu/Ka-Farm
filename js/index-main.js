import { UserManager } from '/js/user-manager.js';
import { KAStorage } from '/js/storage.js';
import { Theme } from '/js/components/theme-toggle.js';

// Active navigation state management
function updateActiveNavLink() {
  const currentPath = window.location.pathname;
  const hash = window.location.hash;

  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#' && href !== '/pages/shared/elevage.html' && href !== '/pages/shared/training.html') {
      if (hash === href) {
        link.classList.add('text-emerald-400');
        link.classList.add('after:absolute', 'after:bottom-0', 'after:left-0', 'after:right-0', 'after:h-0.5', 'after:bg-emerald-500', 'after:rounded-full');
      }
    }
  });

  // Special handling for actual dashboard pages when on index
  if (currentPath === '/' || currentPath === '/index.html') {
    document.querySelectorAll('nav a[href^="/pages/"]').forEach(link => {
      link.classList.remove('text-emerald-400');
      link.classList.remove('after:absolute', 'after:bottom-0', 'after:left-0', 'after:right-0', 'after:h-0.5', 'after:bg-emerald-500', 'after:rounded-full');
    });
  }
}

// Global action helpers
window.accessDashboard = (roleType) => {
  KAStorage.init();

  let email = 'contact@kafarm.sn';
  let name = 'Amadou KA';
  let role = 'Bureau';

  if (roleType === 'terrain') {
    email = 'moussa@kafarm.sn';
    name = 'Moussa KA';
    role = 'Terrain';
  } else if (roleType === 'aly') {
    email = 'aly@kafarm.sn';
    name = 'Aly KA';
    role = 'Bureau';
  }

  KAStorage.setCurrentUser({ email, name, role }, true);
  window.location.href = '/pages/shared/dashboard.html';
};

window.tryAccessDefault = () => {
  const user = UserManager.getCurrentUser();
  if (user) {
    window.location.href = '/pages/shared/dashboard.html';
  } else {
    window.accessDashboard('amadou');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  KAStorage.init();
  lucide.createIcons();

  // Initialize theme toggle
  Theme.initToggleInContainer('#theme-toggle-container');

  // Update active nav link on scroll and load
  updateActiveNavLink();

  // Update on hash change
  window.addEventListener('hashchange', updateActiveNavLink);

  // Check user session for custom button label
  const user = UserManager.getCurrentUser();
  const loginBtnText = document.getElementById('login-btn-text');
  const mobileLoginBtnText = document.getElementById('mobile-login-btn-text');
  if (user) {
    if (loginBtnText) loginBtnText.innerText = 'Tableau de bord (Connecté)';
    if (mobileLoginBtnText) mobileLoginBtnText.innerText = 'Tableau de bord (Connecté)';
  }

  // Initialize live elements
  fetchLiveWeather();
});

// Fetch Weather Proxy
async function fetchLiveWeather() {
  const tempEl = document.getElementById('live-temp');
  const humEl = document.getElementById('live-humidity');
  const rainEl = document.getElementById('live-precipitation');
  const condEl = document.getElementById('live-condition');
  const adviceEl = document.getElementById('live-advice');

  try {
    // Dakar region coordinates
    const response = await fetch('/api/weather?lat=14.6937&lon=-17.4441');
    if (!response.ok) throw new Error('API meteorology error');
    const data = await response.json();

    if (tempEl) tempEl.innerText = `${data.temp}°C`;
    if (humEl) humEl.innerText = `${data.humidity}%`;
    if (rainEl) rainEl.innerText = `${data.precipitation || 0.0} mm`;

    let conditionText = 'Climat stable';
    let adviceText = 'Conditions optimales pour les activités maraîchères.';

    if (data.humidity > 80) {
      conditionText = 'Haut taux d\'humidité';
      adviceText = 'Humidité élevée. Limitez l\'irrigation de fin de journée pour éviter les attaques fongiques (mildiou de la tomate).';
    } else if (data.temp > 35) {
      conditionText = 'Chaleur intense';
      adviceText = 'Température élevée détectée. Augmentez la fréquence du goutte-à-goutte sur les parcelles fragiles (pépinières).';
    } else if (data.precipitation > 2) {
      conditionText = 'Précipitations actives';
      adviceText = 'Pluie en cours. Coupez le système d\'irrigation automatique pour préserver la ressource et éviter l\'asphyxie des racines.';
    }

    if (condEl) condEl.innerText = conditionText;
    if (adviceEl) adviceEl.innerText = adviceText;

  } catch (err) {
    console.error('Weather loading failed:', err);
    // Fallback default values
    if (tempEl) tempEl.innerText = '27.5°C';
    if (humEl) humEl.innerText = '74%';
    if (rainEl) rainEl.innerText = '0.0 mm';
    if (condEl) condEl.innerText = 'Climat Sénégalais';
    if (adviceEl) adviceEl.innerText = 'Vent marin modéré. Excellente journée pour repiquer les pépinières maraîchères de poivrons.';
  }
}