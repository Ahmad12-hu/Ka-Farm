/**
 * Module de stockage hors ligne avec IndexedDB
 * Permet de fonctionner sans connexion Internet
 */

class OfflineStorage {
  constructor() {
    this.dbName = 'ka-farm-offline';
    this.version = 1;
    this.db = null;
    this.dbName = 'ka-farm-offline';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Collection des cultures
        if (!db.objectStoreNames.contains('crops')) {
          const cropsStore = db.createObjectStore('crops', { keyPath: 'id' });
          cropsStore.createIndex('enterpriseId', 'enterpriseId', { unique: false });
          cropsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Collection des parcelles
        if (!db.objectStoreNames.contains('parcelles')) {
          const parcellesStore = db.createObjectStore('parcelles', { keyPath: 'id' });
          parcellesStore.createIndex('enterpriseId', 'enterpriseId', { unique: false });
          parcellesStore.createIndex('synced', 'synced', { unique: false });
        }

        // Collection des stocks
        if (!db.objectStoreNames.contains('stocks')) {
          const stocksStore = db.createObjectStore('stocks', { keyPath: 'id' });
          stocksStore.createIndex('synced', 'synced', { unique: false });
        }

        // Collection des finances
        if (!db.objectStoreNames.contains('finances')) {
          const financesStore = db.createObjectStore('finances', { keyPath: 'id' });
          financesStore.createIndex('synced', 'synced', { unique: false });
        }

        // Collection des tâches
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('synced', 'synced', { unique: false });
        }

        // Collection des notifications
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationsStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationsStore.createIndex('synced', 'synced', { unique: false });
        }

        // File d'attente de synchronisation
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncQueueStore.createIndex('type', 'type', { unique: false });
          syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async addToSyncQueue(operation) {
    const queueItem = {
      type: operation.type, // 'CREATE', 'UPDATE', 'DELETE'
      collection: operation.collection,
      data: operation.data,
      timestamp: Date.now()
    };

    return this.add('syncQueue', queueItem);
  }

  async getSyncQueue() {
    return this.getAll('syncQueue');
  }

  async clearSyncQueue() {
    return this.clear('syncQueue');
  }

  async add(collection, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(collection, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(collection, id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readonly');
      const store = transaction.objectStore(collection);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(collection) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readonly');
      const store = transaction.objectStore(collection);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(collection, id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(collection) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll() {
    if (!this.db) await this.init();

    const collections = ['crops', 'parcelles', 'stocks', 'finances', 'tasks', 'notifications', 'syncQueue'];
    
    return Promise.all(
      collections.map(collection => this.clear(collection))
    );
  }
}

// Instance singleton
window.offlineStorage = new OfflineStorage();

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.offlineStorage.init());
} else {
  window.offlineStorage.init();
}

export { OfflineStorage };