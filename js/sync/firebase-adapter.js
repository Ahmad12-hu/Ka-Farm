// KA Farm - Firebase Adapter
// Abstraction layer for Firestore operations with offline support
// Automatically queues changes when offline

import { syncManager } from './sync-manager.js';

export class FirebaseAdapter {
  constructor() {
    this.subscriptions = new Map();
    this.localCache = new Map();
  }

  /**
   * Initialize adapter
   */
  init() {
    console.log('[FirebaseAdapter] Initialized');
  }

  /**
   * Save data to localStorage + Firestore queue
   * @param {string} key - Data key (e.g., 'ka_farm_crops')
   * @param {Object} value - Data to save
   * @param {string} enterpriseId - Enterprise scope
   * @returns {Promise<boolean>}
   */
  async saveData(key, value, enterpriseId = 'ka_farm') {
    try {
      // 1. Save to localStorage immediately (optimistic update)
      const scopedKey = this.getScopedKey(key, enterpriseId);
      localStorage.setItem(scopedKey, JSON.stringify(value));
      this.localCache.set(scopedKey, value);

      // 2. Queue for Firestore sync
      const actionId = await syncManager.enqueue({
        action: `SAVE_${key.toUpperCase()}`,
        data: {
          key: scopedKey,
          value: value,
          timestamp: Date.now()
        },
        enterpriseId: enterpriseId
      });

      // 3. Emit local change immediately
      this.emitLocalChange(scopedKey, value);

      console.log(`[FirebaseAdapter] Saved ${key} (${actionId})`);
      return true;
    } catch (err) {
      console.error('[FirebaseAdapter] saveData failed:', err);
      return false;
    }
  }

  /**
   * Load data from localStorage with Firestore fallback
   * @param {string} key - Data key
   * @param {Object} fallback - Default value if not found
   * @param {string} enterpriseId - Enterprise scope
   * @returns {Object} Data from cache or fallback
   */
  loadData(key, fallback = null, enterpriseId = 'ka_farm') {
    try {
      const scopedKey = this.getScopedKey(key, enterpriseId);

      // 1. Check memory cache first (fastest)
      if (this.localCache.has(scopedKey)) {
        return this.localCache.get(scopedKey);
      }

      // 2. Check localStorage (good for page reload)
      const stored = localStorage.getItem(scopedKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.localCache.set(scopedKey, parsed);
        return parsed;
      }

      // 3. Return fallback
      return fallback;
    } catch (err) {
      console.error('[FirebaseAdapter] loadData failed:', err);
      return fallback;
    }
  }

  /**
   * Subscribe to data changes (local + eventual Firestore)
   * @param {string} key - Data key
   * @param {Function} callback - (data) => void
   * @param {string} enterpriseId - Enterprise scope
   * @returns {Function} Unsubscribe function
   */
  subscribeData(key, callback, enterpriseId = 'ka_farm') {
    try {
      const scopedKey = this.getScopedKey(key, enterpriseId);
      
      // Store subscription
      if (!this.subscriptions.has(scopedKey)) {
        this.subscriptions.set(scopedKey, []);
      }
      this.subscriptions.get(scopedKey).push(callback);

      // Immediately call with current data
      const currentData = this.loadData(key, null, enterpriseId);
      if (currentData) {
        callback(currentData);
      }

      // Return unsubscribe function
      return () => {
        const subs = this.subscriptions.get(scopedKey);
        if (subs) {
          const idx = subs.indexOf(callback);
          if (idx > -1) subs.splice(idx, 1);
        }
      };
    } catch (err) {
      console.error('[FirebaseAdapter] subscribeData failed:', err);
      return () => {}; // No-op unsubscribe
    }
  }

  /**
   * Delete data from localStorage + queue deletion
   * @param {string} key - Data key
   * @param {string} enterpriseId - Enterprise scope
   * @returns {Promise<boolean>}
   */
  async deleteData(key, enterpriseId = 'ka_farm') {
    try {
      const scopedKey = this.getScopedKey(key, enterpriseId);

      // 1. Remove from localStorage
      localStorage.removeItem(scopedKey);
      this.localCache.delete(scopedKey);

      // 2. Queue deletion for Firestore
      await syncManager.enqueue({
        action: `DELETE_${key.toUpperCase()}`,
        data: {
          key: scopedKey,
          timestamp: Date.now()
        },
        enterpriseId: enterpriseId
      });

      console.log(`[FirebaseAdapter] Deleted ${key}`);
      return true;
    } catch (err) {
      console.error('[FirebaseAdapter] deleteData failed:', err);
      return false;
    }
  }

  /**
   * Batch update multiple items
   * @param {Array<{key, value}>} updates
   * @param {string} enterpriseId
   * @returns {Promise<boolean>}
   */
  async batchUpdate(updates, enterpriseId = 'ka_farm') {
    try {
      const results = await Promise.all(
        updates.map(({ key, value }) => 
          this.saveData(key, value, enterpriseId)
        )
      );
      
      return results.every(r => r);
    } catch (err) {
      console.error('[FirebaseAdapter] batchUpdate failed:', err);
      return false;
    }
  }

  /**
   * Get scoped key with enterprise isolation
   * @param {string} key
   * @param {string} enterpriseId
   * @returns {string}
   */
  getScopedKey(key, enterpriseId) {
    if (key.startsWith(enterpriseId)) return key;
    return `${enterpriseId}_${key}`;
  }

  /**
   * Emit local change to all subscribers
   * @param {string} scopedKey
   * @param {Object} value
   */
  emitLocalChange(scopedKey, value) {
    const callbacks = this.subscriptions.get(scopedKey) || [];
    callbacks.forEach(callback => {
      try {
        callback(value);
      } catch (err) {
        console.error('[FirebaseAdapter] Callback error:', err);
      }
    });
  }

  /**
   * Clear all subscriptions (on logout)
   */
  clearSubscriptions() {
    this.subscriptions.clear();
    this.localCache.clear();
    console.log('[FirebaseAdapter] Subscriptions cleared');
  }

  /**
   * Get adapter status
   */
  getStatus() {
    return {
      subscriptions: this.subscriptions.size,
      cacheSize: this.localCache.size,
      syncStatus: syncManager.getStatus()
    };
  }
}

// Singleton instance
export const firebaseAdapter = new FirebaseAdapter();

// Expose globally for debugging
window.firebaseAdapter = firebaseAdapter;
