/**
 * Toast Notification Component
 * Remplace les alert() par des notifications élégantes et non-intrusives
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Créer le conteneur de toasts s'il n'existe pas
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Affiche une notification toast
   * @param {string} message - Le message à afficher
   * @param {string} type - Type de notification: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Durée d'affichage en ms (défaut: 4000)
   */
  show(message, type = 'info', duration = 4000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = this.getToastClasses(type);
    toast.innerHTML = this.getToastHTML(message, type);
    
    // Rendre le toast interactif
    toast.style.pointerEvents = 'auto';
    
    // Animation d'entrée
    toast.style.animation = 'slideInRight 0.3s ease-out';
    
    this.container.appendChild(toast);

    // Auto-dismiss après la durée
    const timeout = setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    // Dismiss au clic
    toast.addEventListener('click', () => {
      clearTimeout(timeout);
      this.dismiss(toast);
    });

    return toast;
  }

  /**
   * Méthodes raccourcis pour chaque type
   */
  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }

  /**
   * Supprime un toast avec animation
   */
  dismiss(toast) {
    if (!toast) return;
    
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Supprime tous les toasts
   */
  clear() {
    if (!this.container) return;
    
    const toasts = Array.from(this.container.children);
    toasts.forEach((toast, index) => {
      setTimeout(() => this.dismiss(toast), index * 50);
    });
  }

  /**
   * Retourne les classes CSS selon le type
   */
  getToastClasses(type) {
    const baseClasses = 'min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto backdrop-blur-md border';
    
    const typeClasses = {
      success: 'bg-emerald-500/90 text-white border-emerald-400/30',
      error: 'bg-red-500/90 text-white border-red-400/30',
      warning: 'bg-amber-500/90 text-white border-amber-400/30',
      info: 'bg-blue-500/90 text-white border-blue-400/30'
    };

    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
  }

  /**
   * Retourne le HTML du toast
   */
  getToastHTML(message, type) {
    const icons = {
      success: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      error: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
      warning: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
      info: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };

    return `
      ${icons[type] || icons.info}
      <div class="flex-1">
        <p class="text-sm font-semibold leading-tight">${message}</p>
      </div>
      <button class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;
  }
}

// Instance globale
const Toast = new ToastManager();

// Ajouter les styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export { Toast };
