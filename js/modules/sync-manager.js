/**
 * Module de synchronisation automatique
 * Gère la synchronisation entre IndexedDB et Firebase
 */

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.lastSync = localStorage.getItem('ka_farm_last_sync') || null;
    this.syncInterval = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  init() {
    // Écouter les changements de connexion
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Vérifier la connexion initiale
    this.updateOnlineStatus();

    // Démarrer la synchronisation périodique
    this.startPeriodicSync();

    // Synchroniser au démarrage si en ligne
    if (this.isOnline) {
      this.sync();
    }

  }

  updateOnlineStatus() {
    this.isOnline = navigator.onLine;
    this.updateUI();
  }

  handleOnline() {
    this.isOnline = true;
    this.updateUI();
    
    // Afficher notification
    if (window.ErrorHandler) {
      window.ErrorHandler.showToast('Connexion rétablie. Synchronisation en cours...', 'info');
    }

    // Synchroniser immédiatement
    this.sync();
  }

  handleOffline() {
    this.isOnline = false;
    this.updateUI();

    // Afficher notification
    if (window.ErrorHandler) {
      window.ErrorHandler.showToast('Mode hors ligne activé. Vos données sont sauvegardées localement.', 'warning');
    }
  }

  updateUI() {
    // Mettre à jour l'indicateur de connexion
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
      indicator.className = this.isOnline 
        ? 'connection-indicator online' 
        : 'connection-indicator offline';
      indicator.title = this.isOnline 
        ? 'En ligne' 
        : 'Hors ligne';
    }

    // Mettre à jour le statut de synchronisation
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
      if (this.isSyncing) {
        syncStatus.textContent = 'Synchronisation...';
        syncStatus.className = 'sync-status syncing';
      } else if (!this.isOnline) {
        syncStatus.textContent = 'Hors ligne';
        syncStatus.className = 'sync-status offline';
      } else {
        syncStatus.textContent = this.lastSync 
          ? `Synchronisé ${this.formatLastSync(this.lastSync)}`
          : 'En ligne';
        syncStatus.className = 'sync-status online';
      }
    }
  }

  formatLastSync(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'à l\'instant';
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${days}j`;
  }

  startPeriodicSync() {
    // Synchroniser toutes les 30 secondes
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, 30000);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync() {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    this.updateUI();

    try {
      // Récupérer la file d'attente
      const queue = await window.offlineStorage.getSyncQueue();
      
      if (queue.length === 0) {
        this.isSyncing = false;
        this.updateUI();
        return;
      }


      // Traiter chaque élément de la file
      for (const item of queue) {
        try {
          await this.processSyncItem(item);
          // Supprimer de la file après succès
          await window.offlineStorage.delete('syncQueue', item.id);
          this.retryCount = 0;
        } catch (error) {
          console.error('[SyncManager] Erreur sync item:', error);
          this.retryCount++;

          if (this.retryCount >= this.maxRetries) {
            console.error('[SyncManager] Nombre maximum de tentatives atteint');
            if (window.ErrorHandler) {
              window.ErrorHandler.showToast(
                `Erreur de synchronisation: ${error.message}`,
                'error'
              );
            }
            break;
          }
        }
      }

      // Mettre à jour le timestamp de dernière synchronisation
      this.lastSync = Date.now();
      localStorage.setItem('ka_farm_last_sync', this.lastSync.toString());

      // Rafraîchir les données depuis Firebase
      await this.refreshFromFirebase();

      if (window.ErrorHandler) {
        window.ErrorHandler.showToast('Synchronisation terminée', 'success');
      }

    } catch (error) {
      console.error('[SyncManager] Erreur synchronisation:', error);
      if (window.ErrorHandler) {
        window.ErrorHandler.showToast('Erreur lors de la synchronisation', 'error');
      }
    } finally {
      this.isSyncing = false;
      this.updateUI();
    }
  }

  async processSyncItem(item) {
    const { type, collection, data } = item;

    switch (type) {
      case 'CREATE':
        await this.createInFirebase(collection, data);
        break;
      case 'UPDATE':
        await this.updateInFirebase(collection, data);
        break;
      case 'DELETE':
        await this.deleteInFirebase(collection, data.id);
        break;
      default:
    }
  }

  async createInFirebase(collection, data) {
    // Implémenter la création dans Firebase
    // Ces méthodes seront connectées aux modules respectifs
    if (collection === 'crops' && window.CropsModule) {
      await window.CropsModule.createCrop(data);
    } else if (collection === 'stocks' && window.StocksModule) {
      await window.StocksModule.createStock(data);
    } else if (collection === 'finances' && window.FinancesModule) {
      await window.FinancesModule.createFinance(data);
    }
  }

  async updateInFirebase(collection, data) {
    // Implémenter la mise à jour dans Firebase
    if (collection === 'crops' && window.CropsModule) {
      await window.CropsModule.updateCrop(data.id, data);
    } else if (collection === 'stocks' && window.StocksModule) {
      await window.StocksModule.updateStock(data.id, data);
    } else if (collection === 'finances' && window.FinancesModule) {
      await window.FinancesModule.updateFinance(data.id, data);
    }
  }

  async deleteInFirebase(collection, id) {
    // Implémenter la suppression dans Firebase
    if (collection === 'crops' && window.CropsModule) {
      await window.CropsModule.deleteCrop(id);
    } else if (collection === 'stocks' && window.StocksModule) {
      await window.StocksModule.deleteStock(id);
    } else if (collection === 'finances' && window.FinancesModule) {
      await window.FinancesModule.deleteFinance(id);
    }
  }

  async refreshFromFirebase() {
    // Rafraîchir les données depuis Firebase
    // Cette méthode sera appelée après une synchronisation réussie

    // Déclencher un événement pour que les modules se rafraîchissent
    window.dispatchEvent(new CustomEvent('ka_data_refresh'));
  }

  // Méthodes publiques pour les modules

  async queueOperation(operation) {
    // Ajouter une opération à la file de synchronisation
    await window.offlineStorage.addToSyncQueue(operation);
    
    // Si en ligne, synchroniser immédiatement
    if (this.isOnline) {
      setTimeout(() => this.sync(), 1000);
    }
  }

  async getLocalData(collection) {
    // Récupérer les données locales (hors ligne)
    return await window.offlineStorage.getAll(collection);
  }
}

// Instance singleton
window.syncManager = new SyncManager();

// Initialiser au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.syncManager.init());
} else {
  window.syncManager.init();
}

export { SyncManager };