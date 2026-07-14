/**
 * Theme Toggle Component
 * Gestion du mode sombre/clair avec persistance localStorage
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.init();
  }

  init() {
    // Récupérer le thème depuis localStorage ou utiliser la préférence système
    const savedTheme = localStorage.getItem('ka-farm-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme(this.currentTheme);

    // Écouter les changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('ka-farm-theme')) {
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
      }
    });
  }

  /**
   * Applique le thème au document
   */
  applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }

    // Mettre à jour les variables CSS pour le mode clair
    if (theme === 'light') {
      this.setLightModeVariables();
    } else {
      this.setDarkModeVariables();
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('ka-farm-theme', theme);
    this.currentTheme = theme;
  }

  /**
   * Bascule entre les thèmes
   */
  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  }

  /**
   * Définit le thème sombre
   */
  setDark() {
    this.applyTheme('dark');
  }

  /**
   * Définit le thème clair
   */
  setLight() {
    this.applyTheme('light');
  }

  /**
   * Retourne le thème actuel
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Variables CSS pour le mode sombre
   */
  setDarkModeVariables() {
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', '#040D06');
    root.style.setProperty('--bg-secondary', '#0B2112');
    root.style.setProperty('--bg-tertiary', '#061208');
    root.style.setProperty('--text-primary', '#E2E8F0');
    root.style.setProperty('--text-secondary', '#94A3B8');
    root.style.setProperty('--border-color', 'rgba(16, 185, 129, 0.2)');
  }

  /**
   * Variables CSS pour le mode clair
   */
  setLightModeVariables() {
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', '#F8FAFC');
    root.style.setProperty('--bg-secondary', '#FFFFFF');
    root.style.setProperty('--bg-tertiary', '#F1F5F9');
    root.style.setProperty('--text-primary', '#1E293B');
    root.style.setProperty('--text-secondary', '#64748B');
    root.style.setProperty('--border-color', 'rgba(16, 185, 129, 0.3)');
  }

  /**
   * Crée et retourne le bouton de toggle
   */
  createToggleButton() {
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'p-2 rounded-lg transition-colors hover:bg-slate-700/50 dark:hover:bg-slate-200/20';
    button.setAttribute('aria-label', 'Toggle theme');
    button.innerHTML = this.getButtonIcon();
    
    button.addEventListener('click', () => {
      const newTheme = this.toggle();
      button.innerHTML = this.getButtonIcon();
      
      // Afficher un toast
      if (window.Toast) {
        const message = newTheme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé';
        Toast.info(message, 2000);
      }
    });

    return button;
  }

  /**
   * Retourne l'icône du bouton selon le thème actuel
   */
  getButtonIcon() {
    if (this.currentTheme === 'dark') {
      return `
        <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      `;
    } else {
      return `
        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      `;
    }
  }

  /**
   * Initialise le bouton de toggle dans un conteneur spécifique
   */
  initToggleInContainer(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const existingButton = document.getElementById('theme-toggle');
    if (existingButton) {
      existingButton.remove();
    }

    const button = this.createToggleButton();
    container.appendChild(button);
  }
}

// Instance globale
const Theme = new ThemeManager();

export { Theme };
