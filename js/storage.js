// KA Farm - Storage Engine
// Manages API-first persistence with localStorage fallback

const API_BASE = '';
const USE_API = typeof window !== 'undefined' && window.location.protocol !== 'file:';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}/api${path}`;
  const resp = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || `HTTP ${resp.status}`);
  }
  if (resp.status === 204) return null;
  return resp.json();
}

export const KAStorage = {
  _cache: new Map(),

  getScopedKey(key) {
    const isGlobal = key === 'ka_farm_users' || key.startsWith('ka_user_');
    if (isGlobal) return key;
    const user = this.getCurrentUser();
    const enterpriseId = user ? (user.enterpriseId || 'ka_farm') : 'ka_farm';
    return `${enterpriseId}_${key}`;
  },

  init() {
    if (USE_API) {
      this._cache.clear();
      return;
    }
    const scopedCheck = (key) => localStorage.getItem(this.getScopedKey(key));
    const defaults = {
      ka_farm_crops: [],
      ka_farm_nurseries: [],
      ka_farm_stocks: [],
      ka_farm_tasks: [],
      ka_farm_finances: [],
      ka_farm_parcelles: [],
      ka_farm_employees: [],
      ka_farm_attendance: [],
      ka_farm_employee_payments: [],
      ka_farm_cheptel: [],
      ka_farm_elevage_production: [],
      ka_farm_elevage_health: [],
      ka_farm_messages: []
    };
    Object.entries(defaults).forEach(([key, fallback]) => {
      if (!scopedCheck(key)) localStorage.setItem(this.getScopedKey(key), JSON.stringify(fallback));
    });
  },

  _localGet(key, fallback) {
    try {
      const scopedKey = this.getScopedKey(key);
      const val = localStorage.getItem(scopedKey);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  _localSet(key, val) {
    const scopedKey = this.getScopedKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(val));
  },

  async _apiList(table) {
    return apiFetch(`/${table}`);
  },

  async _apiGetById(table, id) {
    return apiFetch(`/${table}/id/${encodeURIComponent(id)}`);
  },

  async _apiCreate(table, item) {
    return apiFetch(`/${table}`, { method: 'POST', body: JSON.stringify(item) });
  },

  async _apiUpdate(table, id, patch) {
    return apiFetch(`/${table}/id/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) });
  },

  async _apiDelete(table, id) {
    return apiFetch(`/${table}/id/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async _loadAll(key, fallback, table) {
    if (this._cache.has(key)) return this._cache.get(key);
    let data = fallback;
    if (USE_API) {
      try {
        data = await this._apiList(table);
      } catch (e) {
        console.warn('[KAStorage] API indisponible, utilisation localStorage', e.message);
        data = this._localGet(key, fallback);
      }
    } else {
      data = this._localGet(key, fallback);
    }
    this._cache.set(key, data);
    return data;
  },

  getCrops() { return this._loadAll('ka_farm_crops', [], 'crops'); },
  saveCrops(crops) { this._cache.set('ka_farm_crops', crops); if (!USE_API) this._localSet('ka_farm_crops', crops); else this._apiUpdate('crops', crops); },
  getNurseries() { return this._loadAll('ka_farm_nurseries', [], 'nurseries'); },
  saveNurseries(nurseries) { this._cache.set('ka_farm_nurseries', nurseries); if (!USE_API) this._localSet('ka_farm_nurseries', nurseries); },
  getStocks() { return this._loadAll('ka_farm_stocks', [], 'stocks'); },
  saveStocks(stocks) { this._cache.set('ka_farm_stocks', stocks); if (!USE_API) this._localSet('ka_farm_stocks', stocks); else this._apiUpdate('stocks', stocks); },
  getTasks() { return this._loadAll('ka_farm_tasks', [], 'tasks'); },
  saveTasks(tasks) { this._cache.set('ka_farm_tasks', tasks); if (!USE_API) this._localSet('ka_farm_tasks', tasks); },
  getFinances() { return this._loadAll('ka_farm_finances', [], 'finances'); },
  saveFinances(finances) { this._cache.set('ka_farm_finances', finances); if (!USE_API) this._localSet('ka_farm_finances', finances); },
  getParcelles() { return this._loadAll('ka_farm_parcelles', [], 'parcelles'); },
  saveParcelles(parcelles) { this._cache.set('ka_farm_parcelles', parcelles); if (!USE_API) this._localSet('ka_farm_parcelles', parcelles); },
  getCropLibrary() {
    return [
      { name: 'Tomate Mongal F1', variety: 'Variété Résistante d\'Hivernage', type: 'Fruit', cycle: '75 - 90 jours', water: '600 - 800 mm', yield: '35 - 50 t/ha', tips: 'Très cultivée au Sénégal.', emoji: '🍅' },
      { name: 'Piment Oiseau de Cayenne', variety: 'Variété forte', type: 'Fruit', cycle: '120 - 150 jours', water: '400 - 600 mm', yield: '10 - 15 t/ha', tips: 'Semis en pépinière chaude.', emoji: '🌶️' },
      { name: 'Chou Cabus KK-Cross', variety: 'Hybride résistant chaleur', type: 'Feuille', cycle: '80 - 100 jours', water: '500 mm', yield: '40 - 60 t/ha', tips: 'Idéal contre-saison fraîche.', emoji: '🥬' },
      { name: 'Oignon Rouge de Gandiol', variety: 'Écotype côtier', type: 'Bulbe', cycle: '140 - 170 jours', water: '350 - 450 mm', yield: '25 - 40 t/ha', tips: 'Excellente conservation.', emoji: '🧅' }
    ];
  },
  getCheptel() { return this._loadAll('ka_farm_cheptel', [], 'cheptel'); },
  saveCheptel(cheptel) { this._cache.set('ka_farm_cheptel', cheptel); if (!USE_API) this._localSet('ka_farm_cheptel', cheptel); },
  getElevageProduction() { return this._loadAll('ka_farm_elevage_production', [], 'elevage_production'); },
  saveElevageProduction(production) { this._cache.set('ka_farm_elevage_production', production); if (!USE_API) this._localSet('ka_farm_elevage_production', production); },
  getElevageHealth() { return this._loadAll('ka_farm_elevage_health', [], 'elevage_health'); },
  saveElevageHealth(health) { this._cache.set('ka_farm_elevage_health', health); if (!USE_API) this._localSet('ka_farm_elevage_health', health); },
  getEmployees() { return this._loadAll('ka_farm_employees', [], 'employees'); },
  saveEmployees(employees) { this._cache.set('ka_farm_employees', employees); if (!USE_API) this._localSet('ka_farm_employees', employees); },
  getAttendance() { return this._loadAll('ka_farm_attendance', [], 'attendance'); },
  saveAttendance(attendance) { this._cache.set('ka_farm_attendance', attendance); if (!USE_API) this._localSet('ka_farm_attendance', attendance); },
  getEmployeePayments() { return this._loadAll('ka_farm_employee_payments', [], 'employee_payments'); },
  saveEmployeePayments(payments) { this._cache.set('ka_farm_employee_payments', payments); if (!USE_API) this._localSet('ka_farm_employee_payments', payments); },
  getMessages() { return this._loadAll('ka_farm_messages', [], 'messages'); },
  saveMessages(messages) { this._cache.set('ka_farm_messages', messages); if (!USE_API) this._localSet('ka_farm_messages', messages); },
  getUsers() { return this._loadAll('ka_farm_users', [], 'users'); },
  saveUsers(users) { this._cache.set('ka_farm_users', users); if (!USE_API) this._localSet('ka_farm_users', users); },

  getFinanceStats() {
    const finances = Array.isArray(this.getFinances()) ? this.getFinances() : [];
    const totalRevenu = finances.filter(f => f.type === 'Revenu').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalDepense = finances.filter(f => f.type === 'Dépense').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const solde = totalRevenu - totalDepense;
    return { totalRevenu, totalDepense, solde };
  },

  getCurrentUser() {
    const email = localStorage.getItem('ka_user_email');
    const name = localStorage.getItem('ka_user_name');
    const role = localStorage.getItem('ka_user_role');
    const enterpriseId = localStorage.getItem('ka_user_enterprise_id') || 'ka_farm';
    const enterpriseName = localStorage.getItem('ka_user_enterprise_name') || 'KA Farm';
    const enterpriseCode = localStorage.getItem('ka_user_enterprise_code') || 'KA-FARM';
    const twitter = localStorage.getItem('ka_user_twitter') || '';
    const linkedin = localStorage.getItem('ka_user_linkedin') || '';
    const facebook = localStorage.getItem('ka_user_facebook') || '';

    if (email) {
      return {
        email,
        name: name || 'Amadou KA',
        role: role || 'Bureau',
        enterpriseId,
        enterpriseName,
        enterpriseCode,
        twitter,
        linkedin,
        facebook
      };
    }
    return null;
  },

  setCurrentUser(user, remember = true) {
    if (user) {
      localStorage.setItem('ka_user_email', user.email);
      localStorage.setItem('ka_user_name', user.name);
      localStorage.setItem('ka_user_role', user.role);
      localStorage.setItem('ka_user_enterprise_id', user.enterpriseId || 'ka_farm');
      localStorage.setItem('ka_user_enterprise_name', user.enterpriseName || 'KA Farm');
      localStorage.setItem('ka_user_enterprise_code', user.enterpriseCode || 'KA-FARM');
      localStorage.setItem('ka_user_twitter', user.twitter || '');
      localStorage.setItem('ka_user_linkedin', user.linkedin || '');
      localStorage.setItem('ka_user_facebook', user.facebook || '');
      localStorage.setItem('ka_user_remember', JSON.stringify(remember));
    } else {
      localStorage.removeItem('ka_user_email');
      localStorage.removeItem('ka_user_name');
      localStorage.removeItem('ka_user_role');
      localStorage.removeItem('ka_user_enterprise_id');
      localStorage.removeItem('ka_user_enterprise_name');
      localStorage.removeItem('ka_user_enterprise_code');
      localStorage.removeItem('ka_user_twitter');
      localStorage.removeItem('ka_user_linkedin');
      localStorage.removeItem('ka_user_facebook');
      localStorage.removeItem('ka_user_remember');
    }
  },

  invalidate(key) {
    this._cache.delete(key);
  }
};