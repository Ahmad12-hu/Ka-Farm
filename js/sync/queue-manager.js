// KA Farm - Sync Queue Manager
// Manages persistent queue of offline actions with retry and conflict resolution
// NO external dependencies - pure vanilla JS

export class SyncQueueManager {
  constructor() {
    this.queueKey = 'ka_farm_sync_queue';
    this.maxRetries = 5;
    this.baseDelayMs = 1000; // 1 second
    this.maxDelayMs = 60000; // 1 minute
  }

  /**
   * Add action to queue (persisted in localStorage)
   * @param {Object} action - { action, data, timestamp, id }
   * @returns {Promise<string>} Action ID
   */
  async enqueue(action) {
    try {
      const queue = this.getQueue();
      const actionId = action.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const queuedAction = {
        id: actionId,
        action: action.action,
        data: action.data,
        enterpriseId: action.enterpriseId || 'ka_farm',
        timestamp: action.timestamp || Date.now(),
        retries: 0,
        lastError: null,
        status: 'pending' // pending, processing, failed, synced
      };

      queue.push(queuedAction);
      this.saveQueue(queue);
      
      console.log(`[SyncQueue] Enqueued action: ${actionId}`, queuedAction);
      return actionId;
    } catch (err) {
      console.error('[SyncQueue] Enqueue failed:', err);
      throw err;
    }
  }

  /**
   * Get next action to process
   * @returns {Object|null} Next pending action or null
   */
  getNextAction() {
    try {
      const queue = this.getQueue();
      return queue.find(a => a.status === 'pending') || null;
    } catch (err) {
      console.error('[SyncQueue] GetNextAction failed:', err);
      return null;
    }
  }

  /**
   * Mark action as processing
   * @param {string} actionId
   */
  markProcessing(actionId) {
    try {
      const queue = this.getQueue();
      const action = queue.find(a => a.id === actionId);
      if (action) {
        action.status = 'processing';
        action.lastAttempt = Date.now();
        this.saveQueue(queue);
      }
    } catch (err) {
      console.error('[SyncQueue] MarkProcessing failed:', err);
    }
  }

  /**
   * Mark action as synced (remove from queue)
   * @param {string} actionId
   */
  markSynced(actionId) {
    try {
      const queue = this.getQueue();
      const action = queue.find(a => a.id === actionId);
      if (action) {
        action.status = 'synced';
        action.syncedAt = Date.now();
        
        // Keep synced actions for 24h audit trail, then remove
        const keep = queue.filter(a => {
          if (a.status !== 'synced') return true;
          const age = Date.now() - a.syncedAt;
          return age < 24 * 60 * 60 * 1000; // 24 hours
        });
        
        this.saveQueue(keep);
        console.log(`[SyncQueue] Action synced: ${actionId}`);
      }
    } catch (err) {
      console.error('[SyncQueue] MarkSynced failed:', err);
    }
  }

  /**
   * Mark action as failed with retry logic
   * @param {string} actionId
   * @param {Error} error
   * @returns {boolean} true if retry scheduled, false if max retries exceeded
   */
  markFailed(actionId, error) {
    try {
      const queue = this.getQueue();
      const action = queue.find(a => a.id === actionId);
      
      if (!action) return false;

      action.retries++;
      action.lastError = error.message;
      action.lastAttempt = Date.now();

      if (action.retries >= this.maxRetries) {
        action.status = 'failed';
        console.error(`[SyncQueue] Action failed after ${this.maxRetries} retries:`, actionId, error);
        this.saveQueue(queue);
        return false;
      }

      // Schedule retry with exponential backoff
      action.status = 'pending';
      action.nextRetryAt = this.calculateNextRetry(action.retries);
      
      this.saveQueue(queue);
      console.warn(`[SyncQueue] Action retry scheduled (attempt ${action.retries}):`, actionId);
      return true;
    } catch (err) {
      console.error('[SyncQueue] MarkFailed failed:', err);
      return false;
    }
  }

  /**
   * Calculate next retry time with exponential backoff
   * @param {number} retryCount
   * @returns {number} Timestamp for next retry
   */
  calculateNextRetry(retryCount) {
    const delay = Math.min(
      this.baseDelayMs * Math.pow(2, retryCount - 1),
      this.maxDelayMs
    );
    return Date.now() + delay;
  }

  /**
   * Get actions ready for retry
   * @returns {Array<Object>} Actions with nextRetryAt <= now
   */
  getRetryableActions() {
    try {
      const queue = this.getQueue();
      const now = Date.now();
      return queue.filter(a => 
        a.status === 'pending' && 
        (!a.nextRetryAt || a.nextRetryAt <= now)
      );
    } catch (err) {
      console.error('[SyncQueue] GetRetryableActions failed:', err);
      return [];
    }
  }

  /**
   * Get queue stats
   * @returns {Object} Queue statistics
   */
  getStats() {
    try {
      const queue = this.getQueue();
      return {
        total: queue.length,
        pending: queue.filter(a => a.status === 'pending').length,
        processing: queue.filter(a => a.status === 'processing').length,
        failed: queue.filter(a => a.status === 'failed').length,
        synced: queue.filter(a => a.status === 'synced').length,
        queue: queue
      };
    } catch (err) {
      console.error('[SyncQueue] GetStats failed:', err);
      return { total: 0, pending: 0, processing: 0, failed: 0, synced: 0, queue: [] };
    }
  }

  /**
   * Clear entire queue (careful!)
   */
  clearQueue() {
    try {
      localStorage.removeItem(this.queueKey);
      console.warn('[SyncQueue] Queue cleared');
    } catch (err) {
      console.error('[SyncQueue] ClearQueue failed:', err);
    }
  }

  /**
   * Get queue from localStorage
   * @returns {Array<Object>}
   */
  getQueue() {
    try {
      const stored = localStorage.getItem(this.queueKey);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('[SyncQueue] GetQueue failed:', err);
      return [];
    }
  }

  /**
   * Save queue to localStorage
   * @param {Array<Object>} queue
   */
  saveQueue(queue) {
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    } catch (err) {
      console.error('[SyncQueue] SaveQueue failed (localStorage full?):', err);
      // If storage full, remove old synced actions
      const filtered = queue.filter(a => a.status !== 'synced');
      try {
        localStorage.setItem(this.queueKey, JSON.stringify(filtered));
      } catch (err2) {
        console.error('[SyncQueue] SaveQueue still failing after cleanup:', err2);
      }
    }
  }

  /**
   * Merge local data with remote data (local wins strategy)
   * @param {Object} local - Local version
   * @param {Object} remote - Remote version
   * @returns {Object} Merged data
   */
  resolveConflict(local, remote) {
    // Strategy: Local wins (most recent edit)
    const localTime = local?._syncedAt || local?.timestamp || 0;
    const remoteTime = remote?._syncedAt || remote?.timestamp || 0;

    if (localTime >= remoteTime) {
      console.log('[SyncQueue] Conflict resolved: local version wins');
      return { ...remote, ...local, _resolvedAt: Date.now() };
    } else {
      console.log('[SyncQueue] Conflict resolved: remote version wins');
      return { ...local, ...remote, _resolvedAt: Date.now() };
    }
  }
}

// Singleton instance
export const syncQueue = new SyncQueueManager();
