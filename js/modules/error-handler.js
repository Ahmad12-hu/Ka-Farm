// KA Farm - Error Handling & Logging Module
export const ErrorHandler = {
  log(error, context = '') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      context,
      message: error.message,
      stack: error.stack,
      url: window.location.href
    };
    
    // Console pour développement
    console.error(`[${timestamp}] ${context}:`, error);
    
    // Stocker localStorage pour debugging production
    try {
      const logs = JSON.parse(localStorage.getItem('ka_farm_error_logs') || '[]');
      logs.push(logEntry);
      // Garder seulement les 50 derniers logs
      if (logs.length > 50) logs.shift();
      localStorage.setItem('ka_farm_error_logs', JSON.stringify(logs));
    } catch (e) {
      console.warn('Cannot save error log to localStorage:', e);
    }
  },

  getUserMessage(error) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Erreur de connexion. Vérifiez votre internet.';
    }
    if (error.message.includes('permission') || error.message.includes('auth')) {
      return 'Vous n\'avez pas les permissions pour cette action.';
    }
    if (error.message.includes('timeout')) {
      return 'Le serveur met trop de temps à répondre. Réessayez.';
    }
    return 'Une erreur est survenue. Contactez l\'administrateur si cela persiste.';
  },

  showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in ${
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'success' ? 'bg-emerald-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  async safeAsync(fn, fallback = null, context = '') {
    try {
      return await fn();
    } catch (error) {
      this.log(error, context);
      return fallback;
    }
  }
};