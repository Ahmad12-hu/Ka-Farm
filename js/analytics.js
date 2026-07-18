// Vercel Web Analytics Integration
import { inject } from '@vercel/analytics';

/**
 * Initialize Vercel Web Analytics
 * This should be called once when the application loads
 */
export function initAnalytics() {
  // Only inject analytics in production or when explicitly enabled
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Inject analytics - it will automatically handle development vs production mode
  inject({
    mode: isDevelopment ? 'development' : 'production'
  });
}

// Auto-initialize analytics when this module is imported
initAnalytics();
