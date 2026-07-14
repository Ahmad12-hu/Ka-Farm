/**
 * Spinner Component
 * Indicateurs de chargement élégants pour les opérations asynchrones
 */

class SpinnerManager {
  constructor() {
    this.container = null;
    this.activeSpinners = new Map();
    this.init();
  }

  init() {
    // Créer le conteneur global de spinners s'il n'existe pas
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'spinner-container';
      this.container.className = 'fixed inset-0 z-[9998] pointer-events-none';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Affiche un spinner global (overlay plein écran)
   * @param {string} message - Message optionnel à afficher
   * @param {string} size - Taille: 'sm', 'md', 'lg'
   */
  show(message = '', size = 'md') {
    this.init();

    const spinnerId = `spinner-${Date.now()}`;
    const spinner = document.createElement('div');
    spinner.id = spinnerId;
    spinner.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto';
    spinner.innerHTML = this.getSpinnerHTML(message, size);

    this.container.appendChild(spinner);
    this.activeSpinners.set(spinnerId, spinner);

    return spinnerId;
  }

  /**
   * Affiche un spinner inline (dans un élément spécifique)
   * @param {HTMLElement} element - Élément parent
   * @param {string} size - Taille: 'sm', 'md', 'lg'
   */
  showInline(element, size = 'sm') {
    if (!element) return null;

    const spinnerId = `spinner-inline-${Date.now()}`;
    const spinner = document.createElement('div');
    spinner.id = spinnerId;
    spinner.className = 'flex items-center justify-center';
    spinner.innerHTML = this.getInlineSpinnerHTML(size);

    // Sauvegarder le contenu original
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.innerHTML = '';
    element.appendChild(spinner);
    element.classList.add('opacity-50', 'pointer-events-none');

    this.activeSpinners.set(spinnerId, { spinner, element, originalContent });

    return spinnerId;
  }

  /**
   * Cache un spinner par son ID
   */
  hide(spinnerId) {
    const spinnerData = this.activeSpinners.get(spinnerId);
    
    if (!spinnerData) return;

    if (spinnerData instanceof HTMLElement) {
      // Spinner global
      spinnerData.style.animation = 'fadeOut 0.2s ease-out';
      setTimeout(() => {
        if (spinnerData.parentNode) {
          spinnerData.parentNode.removeChild(spinnerData);
        }
      }, 200);
    } else if (spinnerData.element) {
      // Spinner inline
      const { element, originalContent } = spinnerData;
      element.innerHTML = originalContent;
      element.classList.remove('opacity-50', 'pointer-events-none');
    }

    this.activeSpinners.delete(spinnerId);
  }

  /**
   * Cache tous les spinners actifs
   */
  hideAll() {
    this.activeSpinners.forEach((_, spinnerId) => {
      this.hide(spinnerId);
    });
  }

  /**
   * Retourne le HTML d'un spinner global
   */
  getSpinnerHTML(message, size) {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    return `
      <div class="flex flex-col items-center gap-4">
        <div class="relative">
          <div class="${sizeClasses[size]} border-4 border-emerald-500/30 rounded-full"></div>
          <div class="${sizeClasses[size]} border-4 border-emerald-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
        </div>
        ${message ? `<p class="text-white font-semibold text-sm">${message}</p>` : ''}
      </div>
    `;
  }

  /**
   * Retourne le HTML d'un spinner inline
   */
  getInlineSpinnerHTML(size) {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-2',
      lg: 'w-8 h-8 border-3'
    };

    return `
      <div class="relative">
        <div class="${sizeClasses[size]} border-emerald-500/30 rounded-full"></div>
        <div class="${sizeClasses[size]} border-emerald-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
      </div>
    `;
  }
}

// Instance globale
const Spinner = new SpinnerManager();

// Ajouter les styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);

export { Spinner };
