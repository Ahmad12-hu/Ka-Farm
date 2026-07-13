// Browser-compatible Logger pour KA Farm
// Utilise console avec style + localStorage pour persistance

const isBrowser = typeof window !== 'undefined';

// Storage key for error logs
const STORAGE_KEY = 'kafarm_error_logs';
const MAX_LOGS = 50;

// Log functions avec styled console output
const logFunctions = {
  info: (message, meta = {}) => {
    if (!isBrowser) {
      console.log(`[INFO] ${message}`, meta);
    } else {
      console.log(`%c[INFO] ${message}`, 'color: #10B981; font-weight: bold;', meta);
    }
  },
  
  error: (message, meta = {}) => {
    const errorStr = typeof meta?.error === 'string' ? meta.error : (meta?.error?.message || JSON.stringify(meta));
    if (!isBrowser) {
      console.error(`[ERROR] ${message}:`, meta);
    } else {
      console.error(`%c[ERROR] ${message}: ${errorStr}`, 'color: #EF4444; font-weight: bold;', meta);
    }
    
    // Store in localStorage for persistence
    if (isBrowser) {
      try {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        logs.unshift({ 
          timestamp: new Date().toISOString(), 
          level: 'error',
          message, 
          error: errorStr 
        });
        // Keep only last 50 logs
        if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      } catch (e) {
        console.warn('Unable to save error log to localStorage:', e);
      }
    }
  },
  
  warn: (message, meta = {}) => {
    if (!isBrowser) {
      console.warn(`[WARN] ${message}`, meta);
    } else {
      console.warn(`%c[WARN] ${message}`, 'color: #F59E0B; font-weight: bold;', meta);
    }
  },
  
  debug: (message, meta = {}) => {
    if (!isBrowser) {
      console.debug(`[DEBUG] ${message}`, meta);
    } else {
      console.debug(`%c[DEBUG] ${message}`, 'color: #3B82F6; font-weight: bold;', meta);
    }
  },
  
  http: (message, meta = {}) => {
    if (!isBrowser) {
      console.log(`[HTTP] ${message}`, meta);
    } else {
      console.log(`%c[HTTP] ${message}`, 'color: #8B5CF6; font-weight: bold;', meta);
    }
  },
};

// Logger export
export const logger = {
  info: logFunctions.info,
  error: logFunctions.error,
  warn: logFunctions.warn,
  debug: logFunctions.debug,
  http: logFunctions.http,
};

// Default export
export default {
  info: logFunctions.info,
  error: logFunctions.error,
  warn: logFunctions.warn,
  debug: logFunctions.debug,
  http: logFunctions.http,
};

// Helper to retrieve stored logs (for diagnostics)
export const getStoredLogs = () => {
  if (!isBrowser) return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

// Helper to clear logs
export const clearLogs = () => {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEY);
};