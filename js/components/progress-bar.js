/**
 * ProgressBar Component
 * Barre de progression pour les formulaires multi-étapes
 */

class ProgressBarManager {
  constructor() {
    this.activeBars = new Map();
  }

  /**
   * Crée une barre de progression dans un conteneur
   * @param {HTMLElement} container - Élément parent
   * @param {Object} options - Options de configuration
   * @param {number} options.total - Nombre total d'étapes
   * @param {number} options.current - Étape actuelle
   * @param {string} options.size - Taille: 'sm', 'md', 'lg'
   * @param {boolean} options.showLabels - Afficher les labels d'étapes
   * @param {Array} options.labels - Labels personnalisés pour chaque étape
   */
  create(container, options = {}) {
    if (!container) return null;

    const {
      total = 3,
      current = 1,
      size = 'md',
      showLabels = true,
      labels = []
    } = options;

    const barId = `progress-bar-${Date.now()}`;
    const progressBar = document.createElement('div');
    progressBar.id = barId;
    progressBar.className = this.getContainerClasses(size);

    const stepsHTML = this.generateSteps(total, current, showLabels, labels);
    progressBar.innerHTML = stepsHTML;

    container.appendChild(progressBar);
    this.activeBars.set(barId, { element: progressBar, total, current, labels, showLabels });

    return barId;
  }

  /**
   * Met à jour la progression
   * @param {string} barId - ID de la barre de progression
   * @param {number} current - Nouvelle étape actuelle
   */
  update(barId, current) {
    const barData = this.activeBars.get(barId);
    
    if (!barData) return;

    const { element, total, labels, showLabels } = barData;
    
    // Mettre à jour les étapes
    const steps = element.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      
      // Supprimer les classes existantes
      step.classList.remove('active', 'completed');
      
      // Ajouter les nouvelles classes
      if (stepNumber < current) {
        step.classList.add('completed');
      } else if (stepNumber === current) {
        step.classList.add('active');
      }
    });

    // Mettre à jour les données
    this.activeBars.set(barId, { ...barData, current });
  }

  /**
   * Incrémente l'étape actuelle
   */
  next(barId) {
    const barData = this.activeBars.get(barId);
    if (!barData) return;
    
    const { current, total } = barData;
    if (current < total) {
      this.update(barId, current + 1);
    }
  }

  /**
   * Décrémente l'étape actuelle
   */
  previous(barId) {
    const barData = this.activeBars.get(barId);
    if (!barData) return;
    
    const { current } = barData;
    if (current > 1) {
      this.update(barId, current - 1);
    }
  }

  /**
   * Supprime une barre de progression
   */
  destroy(barId) {
    const barData = this.activeBars.get(barId);
    
    if (!barData) return;

    if (barData.element && barData.element.parentNode) {
      barData.element.parentNode.removeChild(barData.element);
    }

    this.activeBars.delete(barId);
  }

  /**
   * Retourne les classes CSS du conteneur
   */
  getContainerClasses(size) {
    const sizeClasses = {
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6'
    };

    return `w-full ${sizeClasses[size]}`;
  }

  /**
   * Génère le HTML des étapes
   */
  generateSteps(total, current, showLabels, labels) {
    let html = '<div class="flex items-center justify-between">';
    
    for (let i = 1; i <= total; i++) {
      const isCompleted = i < current;
      const isActive = i === current;
      const label = labels[i - 1] || `Étape ${i}`;
      
      html += `
        <div class="progress-step flex flex-col items-center flex-1 ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
          <div class="relative flex items-center justify-center">
            <div class="progress-circle w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
              ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}">
              ${isCompleted ? `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ` : i}
            </div>
            ${i < total ? `
              <div class="progress-line absolute left-10 top-1/2 w-full h-0.5 -translate-y-1/2 -z-10 transition-all duration-300
                ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}"></div>
            ` : ''}
          </div>
          ${showLabels ? `
            <p class="mt-2 text-xs font-semibold transition-colors duration-300
              ${isActive ? 'text-emerald-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}">
              ${label}
            </p>
          ` : ''}
        </div>
      `;
    }
    
    html += '</div>';
    
    // Ajouter la barre de progression linéaire
    html += `
      <div class="mt-4 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div class="progress-fill h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" 
             style="width: ${((current - 1) / (total - 1)) * 100}%"></div>
      </div>
    `;
    
    return html;
  }

  /**
   * Retourne l'étape actuelle
   */
  getCurrentStep(barId) {
    const barData = this.activeBars.get(barId);
    return barData ? barData.current : 1;
  }

  /**
   * Retourne le nombre total d'étapes
   */
  getTotalSteps(barId) {
    const barData = this.activeBars.get(barId);
    return barData ? barData.total : 1;
  }
}

// Instance globale
const ProgressBar = new ProgressBarManager();

export { ProgressBar };
