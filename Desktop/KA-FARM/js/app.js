// KA Farm - Shared Core Application Layout Controller
import { KAStorage } from './storage.js';
import { UserManager } from './user-manager.js';

// Global variables for other scripts to use
window.KAStorage = KAStorage;
window.UserManager = UserManager;

// State
let currentUser = null;
let isDarkMode = true;

// Predefined Weather recommendations and presets for Senegal
window.SENEGAL_WEATHER_PRESETS = {
  dakar: {
    name: 'Dakar (Zone des Niayes)',
    temp: 26,
    wind: 15,
    humidity: 82,
    sun: 8,
    condition: 'Nuageux et brumeux',
    desc: '🌊 Climat maritime humide. Idéal pour cultures maraîchères côtières.',
    advice: 'Humidité élevée sur les Niayes. Limitez l\'arrosage de fin de journée pour éviter le mildiou.',
    lat: 14.7167,
    lon: -17.4677,
    precipitation: 0.0
  },
  diourbel: {
    name: 'Diourbel (Bassin du Baol)',
    temp: 33,
    wind: 12,
    humidity: 58,
    sun: 10,
    condition: 'Chaud et sec',
    desc: '🌾 Climat chaud et sec du Baol. Sols sableux exigeant un bon paillage.',
    advice: 'Sols sableux. Appliquez un paillage organique épais pour retenir l\'humidité.',
    lat: 14.6500,
    lon: -16.2333,
    precipitation: 0.0
  },
  fatick: {
    name: 'Fatick (Sine-Saloum)',
    temp: 31,
    wind: 14,
    humidity: 72,
    sun: 9,
    condition: 'Ensoleillé avec brise marine',
    desc: '🌊 Estuaires du Sine-Saloum. Vigilance sur la salinité des sols maraîchers.',
    advice: 'Vigilance sur la salinité de l\'eau (tannes). Idéal pour cultures tolérantes.',
    lat: 14.3333,
    lon: -16.4000,
    precipitation: 0.0
  },
  kaffrine: {
    name: 'Kaffrine (Bassin Arachidier Est)',
    temp: 33,
    wind: 13,
    humidity: 60,
    sun: 10,
    condition: 'Ensoleillé',
    desc: '☀️ Zone agricole ensoleillée. Vents desséchants d\'Est (Harmattan léger).',
    advice: 'Vents d\'Est desséchants. Aménagez des brise-vents autour de vos planches.',
    lat: 14.1059,
    lon: -15.5508,
    precipitation: 0.0
  },
  kaolack: {
    name: 'Kaolack (Bassin Arachidier)',
    temp: 34,
    wind: 14,
    humidity: 55,
    sun: 10,
    condition: 'Très chaud et ensoleillé',
    desc: '☀ Climat soudano-sahélien chaud. Sols secs nécessitant une gestion fine de l\'arrosage.',
    advice: 'Températures intenses. Priorisez l\'arrosage avant 8h du matin et paillez les sols.',
    lat: 14.1500,
    lon: -16.0833,
    precipitation: 0.0
  },
  kedougou: {
    name: 'Kédougou (Sud-Est)',
    temp: 32,
    wind: 9,
    humidity: 80,
    sun: 7,
    condition: 'Orages isolés',
    desc: '⛰️ Climat soudanien humide. Forte pluviométrie, attention à l\'engorgement des sols.',
    advice: 'Précipitations d\'hivernage importantes. Assurez des planches bien surélevées.',
    lat: 12.5578,
    lon: -12.1744,
    precipitation: 1.5
  },
  kolda: {
    name: 'Kolda (Haute Casamance)',
    temp: 32,
    wind: 10,
    humidity: 76,
    sun: 8,
    condition: 'Chaud et humide',
    desc: '🌳 Zone forestière chaude et humide. Excellentes conditions de sol horticole.',
    advice: 'Humidité propice au maraîchage. Surveillez les attaques fongiques sur le gombo.',
    lat: 12.8833,
    lon: -14.9500,
    precipitation: 0.5
  },
  louga: {
    name: 'Louga (Zone Sylvo-Pastorale)',
    temp: 33,
    wind: 17,
    humidity: 50,
    sun: 10,
    condition: 'Sec et poussiéreux',
    desc: '🏜️ Climat sahélien sec. Évaporations élevées, irrigation goutte-à-goutte prioritaire.',
    advice: 'Climat sahélien strict. Favorisez l\'irrigation au goutte-à-goutte sous ombrage.',
    lat: 15.6167,
    lon: -16.2167,
    precipitation: 0.0
  },
  matam: {
    name: 'Matam (Moyenne Vallée)',
    temp: 36,
    wind: 18,
    humidity: 45,
    sun: 11,
    condition: 'Chaleur extrême',
    desc: '🔥 Chaleur extrême du Ferlo. Évapotranspiration critique de fin de journée.',
    advice: 'Températures extrêmes. Arrosage biquotidien et paillage épais indispensables.',
    lat: 15.6553,
    lon: -13.2554,
    precipitation: 0.0
  },
  'saint-louis': {
    name: 'Saint-Louis (Delta du Fleuve)',
    temp: 29,
    wind: 22,
    humidity: 70,
    sun: 10,
    condition: 'Ensoleillé et venteux',
    desc: '🌾 Alizés côtiers réguliers. Conditions optimales pour la culture maraîchère de contre-saison.',
    advice: 'Vent sec présent (Harmattan léger). Surveillez l\'évaporation des pépinières.',
    lat: 16.0167,
    lon: -16.5000,
    precipitation: 0.0
  },
  sedhiou: {
    name: 'Sédhiou (Moyenne Casamance)',
    temp: 31,
    wind: 8,
    humidity: 82,
    sun: 8,
    condition: 'Humide et orageux',
    desc: '🌱 Climat guinéen très favorable aux cultures diversifiées et vergers.',
    advice: 'Climat très favorable. Traitez préventivement contre les champignons foliaires.',
    lat: 12.7081,
    lon: -15.5569,
    precipitation: 1.2
  },
  tambacounda: {
    name: 'Tambacounda (Sénégal Oriental)',
    temp: 35,
    wind: 11,
    humidity: 50,
    sun: 10,
    condition: 'Ensoleillé et torride',
    desc: '☀️ Zone semi-aride continentale. Températures diurnes élevées exigeant un ombrage.',
    advice: 'Chaleur intense. Utilisez de l\'ombrage artificiel pour protéger les jeunes semis.',
    lat: 13.7700,
    lon: -13.6700,
    precipitation: 0.0
  },
  thies: {
    name: 'Thiès (Plateau / Mbour)',
    temp: 28,
    wind: 16,
    humidity: 75,
    sun: 9,
    condition: 'Partiellement nuageux',
    desc: '🌅 Zone horticole majeure (Niayes & Petite Côte). Excellente rentabilité.',
    advice: 'Climat idéal maraîcher. Excellente période pour repiquer les plants de piments.',
    lat: 14.7833,
    lon: -16.9167,
    precipitation: 0.0
  },
  ziguinchor: {
    name: 'Ziguinchor (Casamance horticole)',
    temp: 31,
    wind: 10,
    humidity: 78,
    sun: 8,
    condition: 'Averses légères d\'hivernage',
    desc: '🌴 Zone guinéenne humide. Évaporation modérée. Idéal pour l\'arboriculture.',
    advice: 'Hivernage précoce. Assurez un bon drainage des planches de piments.',
    lat: 12.5833,
    lon: -16.2667,
    precipitation: 2.0
  }
};

window.WEATHER_RECOMMENDATIONS = {};
Object.entries(window.SENEGAL_WEATHER_PRESETS).forEach(([key, preset]) => {
  const displayKey = key === 'saint-louis' ? 'Saint-Louis' : (key.charAt(0).toUpperCase() + key.slice(1));
  window.WEATHER_RECOMMENDATIONS[displayKey] = {
    city: preset.name,
    temp: `${preset.temp}°C`,
    humidity: `${preset.humidity}%`,
    precipitation: `${preset.precipitation.toFixed(1)} mm`,
    condition: preset.condition,
    advice: preset.advice,
    lat: preset.lat,
    lon: preset.lon
  };
});

// High-performance smooth cubic ease-out number animation utility
window.animateValue = function(element, start, end, duration = 800) {
  if (!element) return;
  const startNum = Number(start) || 0;
  const endNum = Number(end) || 0;
  if (startNum === endNum) {
    if (element.id.includes('revenu') || element.id.includes('depense') || element.id.includes('solde') || element.id.includes('cost') || element.id.includes('profit')) {
      element.textContent = endNum.toLocaleString('fr-FR') + ' F';
    } else if (element.id.includes('percent')) {
      element.textContent = endNum + '%';
    } else {
      element.textContent = endNum.toLocaleString('fr-FR');
    }
    return;
  }
  
  let startTimestamp = null;
  const isCurrency = element.id.includes('revenu') || element.id.includes('depense') || element.id.includes('solde') || element.id.includes('cost') || element.id.includes('profit');
  const isPercent = element.id.includes('percent');

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    const value = Math.floor(easeProgress * (endNum - startNum) + startNum);

    if (isCurrency) {
      element.textContent = value.toLocaleString('fr-FR') + ' F';
    } else if (isPercent) {
      element.textContent = value + '%';
    } else {
      element.textContent = value.toLocaleString('fr-FR');
    }

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      if (isCurrency) {
        element.textContent = endNum.toLocaleString('fr-FR') + ' F';
      } else if (isPercent) {
        element.textContent = endNum + '%';
      } else {
        element.textContent = endNum.toLocaleString('fr-FR');
      }
    }
  };
  window.requestAnimationFrame(step);
};

export const App = {
  init() {
    currentUser = UserManager.getCurrentUser();
    isDarkMode = KAStorage.get('ka_farm_dark_mode', true);
    
    this.applyTheme(isDarkMode);
    this.injectSidebar();
    this.injectMobileHeader();
    this.injectFooter();
    this.setupGlobalListeners();
    this.updateBadges();
  },

  applyTheme(dark) {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    const circle = document.getElementById('dark-toggle-circle');
    const toggle = document.getElementById('dark-toggle-btn');
    if (circle && toggle) {
      if (dark) {
        toggle.classList.add('bg-emerald-600');
        toggle.classList.remove('bg-slate-300');
        circle.classList.add('translate-x-4.5');
      } else {
        toggle.classList.add('bg-slate-300');
        toggle.classList.remove('bg-emerald-600');
        circle.classList.remove('translate-x-4.5');
      }
    }

    const btnDesktop = document.getElementById('btn-theme-desktop');
    const btnMobile = document.getElementById('btn-theme-mobile');
    if (btnDesktop) {
      btnDesktop.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}" class="h-4 w-4"></i>`;
    }
    if (btnMobile) {
      btnMobile.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}" class="h-4.5 w-4.5"></i>`;
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    if (typeof window.onThemeChanged === 'function') {
      window.onThemeChanged(dark);
    }
  },

  toggleTheme() {
    isDarkMode = !isDarkMode;
    KAStorage.set('ka_farm_dark_mode', isDarkMode);
    
    // Activer la transition fluide temporaire pour le changement de thème
    document.documentElement.classList.add('theme-transition');
    this.applyTheme(isDarkMode);
    
    // Nettoyer après l'animation pour ne pas perturber les hover normaux
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 450);
  },

  injectSidebar() {
    const placeholder = document.getElementById('sidebar-placeholder');
    if (!placeholder) return;

    placeholder.className = "lg:w-64 lg:flex-shrink-0";

    const userInitials = currentUser ? currentUser.name.split(' ').map(n => n[0]).join('') : 'KA';
    const userName = currentUser ? currentUser.name : 'Utilisateur';
    const userRole = currentUser ? currentUser.role : 'Visiteur';

    const sidebarHTML = `
      <aside id="sidebar" class="w-64 flex-shrink-0 bg-white dark:bg-[#06130B] text-slate-700 dark:text-slate-300 flex flex-col border-r border-slate-200 dark:border-[#143E23] z-40 lg:sticky lg:top-0 lg:h-screen transition-all duration-300 fixed inset-y-0 left-0 transform -translate-x-full lg:translate-x-0 lg:transform-none">
        
        <!-- Sidebar Header -->
        <div class="p-5 border-b border-slate-200 dark:border-[#143E23] flex items-center justify-between">
          <a href="/index.html" class="flex items-center gap-3 text-left hover:opacity-90 transition-opacity">
            <div class="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950/40">
              <i data-lucide="sprout" class="h-5 w-5"></i>
            </div>
            <div>
              <h1 class="text-sm font-black tracking-widest text-slate-800 dark:text-white leading-tight">KA FARM</h1>
              <p class="text-[10px] text-slate-500 dark:text-[#819888] font-bold">Maraîchage & Horticulture 🇸🇳</p>
            </div>
          </a>
          <div class="flex items-center gap-1.5">
            <!-- Theme Toggle Button -->
            <button onclick="window.toggleAppTheme()" id="btn-theme-desktop" class="p-1.5 text-slate-400 hover:text-white hover:bg-[#0E2F19] rounded-lg transition-all cursor-pointer" title="Basculer le thème">
              <i data-lucide="${isDarkMode ? 'sun' : 'moon'}" class="h-4 w-4"></i>
            </button>
            <button onclick="window.toggleMobileSidebar()" class="lg:hidden p-1 text-slate-400 hover:text-white">
              <i data-lucide="x" class="h-5 w-5"></i>
            </button>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-left">
          <div class="space-y-1">
            <a href="/index.html" data-tab="accueil" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="home" class="h-4 w-4"></i>
              Accueil
            </a>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-black text-slate-400 dark:text-[#4F6D58] uppercase tracking-widest mb-1.5">Mon Espace Personnel</p>
            <a href="/pages/shared/dashboard.html" data-tab="dashboard" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="layout-dashboard" class="h-4 w-4"></i>
              Tableau de Bord
            </a>
            <a href="/pages/personal/my-tasks.html" data-tab="tasks" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="check-square" class="h-4 w-4"></i>
                Tâches d'Entretien
              </div>
              <span id="tasks-badge" class="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-bold hidden">0</span>
            </a>
            <a href="/pages/personal/my-sales.html" data-tab="sales" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="coins" class="h-4 w-4"></i>
              Mes Ventes (Terrain)
            </a>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-black text-slate-400 dark:text-[#4F6D58] uppercase tracking-widest mb-1.5">Données d'Exploitation</p>
            <a href="/pages/shared/crops.html" data-tab="crops" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="folder-dot" class="h-4 w-4"></i>
                Suivi des Cultures
              </div>
              <span id="crops-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/parcelles.html" data-tab="parcelles" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="map" class="h-4 w-4"></i>
                Gestion des Parcelles
              </div>
              <span id="parcelles-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/employees.html" data-tab="employees" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="users" class="h-4 w-4"></i>
                Gestion des Employés
              </div>
              <span id="employees-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/irrigation.html" data-tab="irrigation" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="droplet" class="h-4 w-4"></i>
              Planning d'Arrosage
            </a>
            <a href="/pages/shared/calendar.html" data-tab="calendar" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-emerald-300">
              <i data-lucide="calendar-days" class="h-4 w-4 text-emerald-400"></i>
              Calendrier Agricole
            </a>
            <a href="/pages/shared/harvest.html" data-tab="harvest" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="sprout" class="h-4 w-4"></i>
              Journal des Récoltes
            </a>
            <a href="/pages/shared/finances.html" data-tab="finances" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="landmark" class="h-4 w-4"></i>
              Gestion des Finances
            </a>
            <a href="/pages/shared/stocks.html" data-tab="stocks" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="package" class="h-4 w-4"></i>
                Inventaire & Stocks
              </div>
              <span id="stocks-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/elevage.html" data-tab="elevage" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-[#ffedd5]">
              <div class="flex items-center gap-3">
                <i data-lucide="paw-print" class="h-4 w-4 text-amber-400"></i>
                Suivi de l'Élevage
              </div>
              <span id="elevage-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/alerts.html" data-tab="alerts" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-rose-300">
              <i data-lucide="alert-triangle" class="h-4 w-4 text-rose-400"></i>
              Alertes Sanitaires
            </a>
            <a href="/pages/shared/training.html" data-tab="training" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-[#a5f3fc]">
              <i data-lucide="graduation-cap" class="h-4 w-4 text-cyan-400"></i>
              Guides de Formation
            </a>
            <a href="/pages/shared/discussion.html" data-tab="discussion" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-emerald-300">
              <div class="flex items-center gap-3">
                <i data-lucide="message-square" class="h-4 w-4 text-emerald-400"></i>
                Discussion Frères
              </div>
              <span id="messages-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold hidden">0</span>
            </a>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-black text-slate-400 dark:text-[#4F6D58] uppercase tracking-widest mb-1.5">Configuration</p>
            <a href="/pages/personal/profile.html" data-tab="profile" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="user" class="h-4 w-4"></i>
              Mon Profil & Réseaux
            </a>
            <a href="/pages/personal/settings.html" data-tab="settings" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="settings" class="h-4 w-4"></i>
              Paramètres
            </a>
            <button onclick="window.handleLogout()" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-[#0E2F19] hover:text-white cursor-pointer transition-all">
              <i data-lucide="log-out" class="h-4 w-4"></i>
              Déconnexion
            </button>
          </div>
        </div>

        <!-- Sidebar Footer User Panel -->
        <div class="p-4 border-t border-slate-200 dark:border-[#143E23] space-y-3 bg-white dark:bg-[#051009]">
          <div class="flex items-center justify-between gap-1.5 px-1 text-left">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div id="user-avatar" class="h-8 w-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs border border-emerald-500/30 flex-shrink-0">${userInitials}</div>
              <div class="min-w-0 flex-1">
                <p id="user-name-display" class="text-xs font-black text-white truncate leading-none">${userName}</p>
                <p id="user-role-display" class="text-[9px] text-[#819888] font-bold mt-0.5 uppercase tracking-wider">${userRole}</p>
              </div>
            </div>
            
            <!-- Quick Account Switcher Button -->
            <button onclick="window.toggleUserSwitcher()" class="p-1.5 hover:bg-[#0E2F19] text-emerald-500 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer flex-shrink-0" title="Changer d'associé / de compte">
              <i data-lucide="users-round" class="h-4 w-4"></i>
            </button>
          </div>

          <!-- User Social shortcuts -->
          <div class="flex items-center gap-3 px-1.5 pt-2 border-t border-[#143E23]/20">
            <a href="mailto:${currentUser ? currentUser.email : ''}" class="text-slate-400 hover:text-emerald-400 transition-colors" title="Email: ${currentUser ? currentUser.email : ''}">
              <i data-lucide="mail" class="h-3.5 w-3.5"></i>
            </a>
            ${currentUser && currentUser.twitter ? `
              <a href="${currentUser.twitter}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-sky-400 transition-colors" title="Twitter / X">
                <i data-lucide="twitter" class="h-3.5 w-3.5"></i>
              </a>
            ` : ''}
            ${currentUser && currentUser.linkedin ? `
              <a href="${currentUser.linkedin}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-blue-400 transition-colors" title="LinkedIn">
                <i data-lucide="linkedin" class="h-3.5 w-3.5"></i>
              </a>
            ` : ''}
            ${currentUser && currentUser.facebook ? `
              <a href="${currentUser.facebook}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-blue-500 transition-colors" title="Facebook">
                <i data-lucide="facebook" class="h-3.5 w-3.5"></i>
              </a>
            ` : ''}
          </div>
          
          <!-- User Switcher Dropdown (Hidden by default) -->
          <div id="user-switcher-dropdown" class="hidden p-2 bg-white dark:bg-[#06130B]/90 border border-slate-200 dark:border-[#143E23]/60 rounded-xl space-y-1 animate-fadeIn">
            <p class="text-[8px] font-black text-slate-600 dark:text-[#4F6D58] uppercase tracking-wider px-1 pb-1 border-b border-slate-200 dark:border-[#143E23]/30 mb-1">Accéder au compte d'un associé :</p>
            <button onclick="window.switchUser('moussa@kafarm.sn')" class="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-[#0E2F19] flex items-center justify-between transition-colors cursor-pointer">
              <div class="flex items-center gap-2">
                <div class="h-5 w-5 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center font-black">M</div>
                <div>
                  <p class="text-slate-800 dark:text-white">Moussa KA</p>
                  <p class="text-[8px] text-slate-500 dark:text-[#819888]">Terrain</p>
                </div>
              </div>
              <i data-lucide="arrow-right" class="h-3 w-3 text-emerald-500"></i>
            </button>
            <button onclick="window.switchUser('aly@kafarm.sn')" class="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-[#0E2F19] flex items-center justify-between transition-colors cursor-pointer">
              <div class="flex items-center gap-2">
                <div class="h-5 w-5 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center font-black">A</div>
                <div>
                  <p class="text-slate-800 dark:text-white">Aly KA</p>
                  <p class="text-[8px] text-slate-500 dark:text-[#819888]">Bureau</p>
                </div>
              </div>
              <i data-lucide="arrow-right" class="h-3 w-3 text-emerald-500"></i>
            </button>
          </div>
          
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-[#819888] px-1 pt-1 border-t border-slate-200 dark:border-[#143E23]/40">
            <span class="flex items-center gap-1"><i data-lucide="moon" class="h-3.5 w-3.5 text-emerald-500"></i> Sombre</span>
            <button onclick="window.toggleAppTheme()" id="dark-toggle-btn" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isDarkMode ? 'bg-emerald-600' : 'bg-slate-300'}">
              <span id="dark-toggle-circle" class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4.5' : ''}"></span>
            </button>
          </div>
        </div>
      </aside>
    `;

    placeholder.innerHTML = sidebarHTML;
    
    // Dispatch an event to notify that the sidebar has been loaded
    document.dispatchEvent(new Event('sidebarInjected'));
  },

  injectMobileHeader() {
    const placeholder = document.getElementById('mobile-header-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
      <div class="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#06130B] border-b border-slate-200 dark:border-[#143E23] text-slate-800 dark:text-white">
        <a href="/index.html" class="flex items-center gap-2">
          <div class="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <i data-lucide="sprout" class="h-5 w-5"></i>
          </div>
          <div>
            <span class="font-extrabold text-sm tracking-tight">KA FARM</span>
            <p class="text-[9px] text-emerald-600 dark:text-emerald-400 leading-none font-bold">Sénégal • Maraîchage</p>
          </div>
        </a>
        <div class="flex items-center gap-2">
          <!-- Theme Toggle Button -->
          <button onclick="window.toggleAppTheme()" id="btn-theme-mobile" class="p-1.5 text-slate-500 dark:text-slate-300 hover:text-white hover:bg-[#0E2F19] rounded-lg transition-all cursor-pointer" title="Basculer le thème">
            <i data-lucide="${isDarkMode ? 'sun' : 'moon'}" class="h-4.5 w-4.5"></i>
          </button>
          <button onclick="window.toggleMobileSidebar()" class="p-1.5 text-slate-500 dark:text-slate-300 hover:text-white rounded-lg hover:bg-[#0E2F19]">
            <i data-lucide="menu" class="h-5 w-5"></i>
          </button>
        </div>
      </div>
    `;
  },

  injectFooter() {
    const mainEl = document.querySelector('main');
    if (mainEl && !document.getElementById('app-global-footer')) {
      const footer = document.createElement('footer');
      footer.id = 'app-global-footer';
      footer.className = 'mt-12 py-6 border-t border-slate-100 dark:border-[#143E23]/20 text-center text-[11px] text-slate-500 dark:text-[#5F8369] font-medium w-full';
      footer.innerHTML = `
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto px-4">
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">KA FARM</span>
            <span class="text-slate-300 dark:text-[#143E23]">•</span>
            <span>Tous droits réservés &copy; 2026</span>
          </div>
          <div class="flex items-center gap-2 bg-slate-50 dark:bg-[#051108] border border-slate-200 dark:border-[#143E23]/20 px-3 py-1.5 rounded-full">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Créé par <span class="font-bold text-slate-700 dark:text-emerald-300">Amadou KA</span></span>
          </div>
        </div>
      `;
      mainEl.appendChild(footer);
    }
  },

  setupGlobalListeners() {
    window.toggleMobileSidebar = () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('active');
      }
    };

    window.toggleAppTheme = () => {
      this.toggleTheme();
    };

    window.handleLogout = () => {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        KAStorage.setCurrentUser(null);
        window.location.href = '/pages/auth/login.html';
      }
    };

    window.toggleUserSwitcher = () => {
      const dropdown = document.getElementById('user-switcher-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('hidden');
      }
    };

    window.switchUser = (email) => {
      const users = KAStorage.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        KAStorage.setCurrentUser({
          email: user.email,
          name: user.name,
          role: user.role
        }, true);
        alert(`Vous avez basculé avec succès sur le compte associé de ${user.name} (${user.role}).`);
        window.location.reload();
      } else {
        alert("Utilisateur associé introuvable.");
      }
    };

    // Auto load lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    document.addEventListener('sidebarInjected', () => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });

    // Global micro-interaction: springy scale-up pop when an icon or icon button is clicked
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;

      let icon = null;
      // 1. If we clicked the icon itself (or SVG)
      if (target.hasAttribute('data-lucide') || target.tagName === 'SVG' || target.closest('[data-lucide]')) {
        icon = target.hasAttribute('data-lucide') || target.tagName === 'SVG' ? target : target.closest('[data-lucide]');
      } else {
        // 2. If we clicked a button, anchor, or custom active tab containing an icon
        const parentBtn = target.closest('button, a, .nav-btn, [role="button"], .tab-btn');
        if (parentBtn) {
          icon = parentBtn.querySelector('[data-lucide], svg');
        }
      }

      if (icon) {
        // Trigger the pop animation smoothly
        icon.classList.remove('animate-icon-pop');
        // Force reflow/repaint to restart CSS animation
        void icon.offsetWidth;
        icon.classList.add('animate-icon-pop');
        
        // Remove class after animation finishes (320ms matches CSS keyframes)
        setTimeout(() => {
          icon.classList.remove('animate-icon-pop');
        }, 350);
      }
    });
  },

  updateBadges() {
    // Update crops badge count
    const crops = KAStorage.getCrops();
    const cropsBadge = document.getElementById('crops-badge');
    if (cropsBadge) {
      cropsBadge.textContent = crops.length;
    }

    // Update parcelles badge count
    const parcelles = KAStorage.getParcelles();
    const parcellesBadge = document.getElementById('parcelles-badge');
    if (parcellesBadge) {
      parcellesBadge.textContent = parcelles.length;
    }

    // Update employees badge count
    const employees = KAStorage.getEmployees ? KAStorage.getEmployees() : [];
    const employeesBadge = document.getElementById('employees-badge');
    if (employeesBadge) {
      employeesBadge.textContent = employees.length;
    }

    // Update incomplete tasks badge count
    const tasks = KAStorage.getTasks();
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const tasksBadge = document.getElementById('tasks-badge');
    if (tasksBadge) {
      if (pendingTasks > 0) {
        tasksBadge.textContent = pendingTasks;
        tasksBadge.classList.remove('hidden');
      } else {
        tasksBadge.classList.add('hidden');
      }
    }

    // Update stocks badge count showing count of low items
    const stocks = KAStorage.getStocks();
    const lowStocksCount = stocks.filter(s => s.quantity <= (s.maxQuantity * 0.2)).length;
    const stocksBadge = document.getElementById('stocks-badge');
    if (stocksBadge) {
      if (lowStocksCount > 0) {
        stocksBadge.textContent = `${lowStocksCount} Bas`;
        stocksBadge.className = 'text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full font-bold';
      } else {
        stocksBadge.textContent = stocks.length;
        stocksBadge.className = 'text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold';
      }
    }

    // Update elevage badge count showing active livestock alerts or total count
    const cheptel = KAStorage.getCheptel ? KAStorage.getCheptel() : [];
    const alertAnimalsCount = cheptel.filter(c => c.status === 'Surveiller' || c.status === 'Malade' || c.status === 'Alerte').length;
    const elevageBadge = document.getElementById('elevage-badge');
    if (elevageBadge) {
      if (alertAnimalsCount > 0) {
        elevageBadge.textContent = `${alertAnimalsCount} Alerte`;
        elevageBadge.className = 'text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-bold';
      } else {
        elevageBadge.textContent = cheptel.length;
        elevageBadge.className = 'text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold';
      }
    }
  }
};

// Start application framework
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}