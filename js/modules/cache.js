// KA Farm - Cache Module avec TTL
// Alternative légère à Redis pour environnement serverless

const cache = new Map();
const TTL_DEFAULT = 60000; // 60 secondes
const CACHE_MAX_SIZE = 500;

export const Cache = {
  /**
   * Récupère une valeur du cache
   * @param {string} key - Clé de cache
   * @returns {Promise<any|null>} Valeur en cache ou null
   */
  async get(key) {
    const item = cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now > item.expiry) {
      cache.delete(key);
      return null;
    }

    return item.value;
  },

  /**
   * Stocke une valeur dans le cache
   * @param {string} key - Clé de cache
   * @param {any} value - Valeur à stocker
   * @param {number} ttl - Durée de vie en ms
   */
  async set(key, value, ttl = TTL_DEFAULT) {
    // Nettoyage si cache plein
    if (cache.size >= CACHE_MAX_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  },

  /**
   * Supprime une clé du cache
   * @param {string} key - Clé à supprimer
   */
  async delete(key) {
    cache.delete(key);
  },

  /**
   * Invalide plusieurs clés par pattern
   * @param {string} pattern - Pattern à matcher
   */
  async invalidate(pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  },

  /**
   * Nettoie entièrement le cache
   */
  async clear() {
    cache.clear();
  },

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    return {
      size: cache.size,
      keys: Array.from(cache.keys())
    };
  },

  /**
   * Wrapper pour mettre en cache une fonction
   * @param {string} key - Clé de cache
   * @param {Function} fn - Fonction à exécuter si cache miss
   * @param {number} ttl - Durée de vie en ms
   */
  async memo(key, fn, ttl = TTL_DEFAULT) {
    const cached = await this.get(key);
    if (cached !== null) return cached;

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }
};

export default Cache;