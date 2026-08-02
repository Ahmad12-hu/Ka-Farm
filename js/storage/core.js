// KA Farm - Storage Core Engine
// Base utilities and initialization logic

import { ErrorHandler } from '../modules/error-handler.js';

// Default Users Data
const DEFAULT_USERS = [
  {
    id: 'USR-001',
    email: 'amadou@ka-farm.sn',
    password: 'admin123',
    name: 'Amadou KA',
    role: 'admin',
    enterpriseId: 'ka_farm',
    enterpriseName: 'KA Farm',
    enterpriseCode: 'KA-FARM'
  }
];

let isInitialized = false;

function shouldSeedLocalDefaults() {
  if (typeof window === 'undefined' || !window.location) return false;

  const hostname = (window.location.hostname || '').toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '';
}

// Default Tasks Data
const DEFAULT_TASKS = [
  { id: 'T-401', title: 'Irrigation matin de l\'oignon Galmi', category: 'Irrigation', dueDate: '2026-06-26', assignee: 'Responsable terrain', priority: 'Haute', completed: false },
  { id: 'T-402', title: 'Sarclage & Désherbage planche choux', category: 'Entretien', dueDate: '2026-06-28', assignee: 'Fatou', priority: 'Moyenne', completed: false },
  { id: 'T-403', title: 'Vérifier la levée de la pépinière tomates', category: 'Pépinière', dueDate: '2026-06-25', assignee: 'Responsable terrain', priority: 'Haute', completed: true },
  { id: 'T-404', title: 'Achat de 5 sacs de fumier de volaille', category: 'Entretien', dueDate: '2026-06-30', assignee: 'Employé', priority: 'Basse', completed: false }
];

// Default Crops Data
const DEFAULT_CROPS = [
  { id: 'C-001', name: 'Tomate Mongal F1', field: 'Planche A1', plantingDate: '2026-06-01', expectedHarvest: '2026-08-15', status: 'En croissance', variety: 'Mongal F1', cycleDays: 80 },
  { id: 'C-002', name: 'Oignon de Galmi', field: 'Planche B2', plantingDate: '2026-06-10', expectedHarvest: '2026-09-20', status: 'En croissance', variety: 'Galmi', cycleDays: 90 },
  { id: 'C-003', name: 'Piment Kounouchi', field: 'Planche C1', plantingDate: '2026-06-15', expectedHarvest: '2026-09-10', status: 'En croissance', variety: 'Kounouchi', cycleDays: 75 }
];

// Default Parcelles Data
const DEFAULT_PARCELLES = [
  { id: 'P-001', name: 'Planche A1 - Tomates', area: 0.5, crop: 'Tomate', status: 'Actif', soilType: 'Sableux', irrigationType: 'Goutte-à-goutte' },
  { id: 'P-002', name: 'Planche B2 - Oignons', area: 0.3, crop: 'Oignon', status: 'Actif', soilType: 'Sableux', irrigationType: 'Goutte-à-goutte' },
  { id: 'P-003', name: 'Planche C1 - Piments', area: 0.2, crop: 'Piment', status: 'Actif', soilType: 'Sableux', irrigationType: 'Goutte-à-goutte' }
];

// Default Finances Data
const DEFAULT_FINANCES = [
  { id: 'F-001', type: 'Dépense', category: 'Intrants', amount: 50000, description: 'Achat semences tomates', date: '2026-06-01' },
  { id: 'F-002', type: 'Dépense', category: 'Main-d\'œuvre', amount: 30000, description: 'Salaires juin', date: '2026-06-30' },
  { id: 'F-003', type: 'Revenu', category: 'Ventes', amount: 120000, description: 'Vente récolte juin', date: '2026-06-28' }
];

// Default Employees Data
const DEFAULT_EMPLOYEES = [
  { id: 'E-001', name: 'Responsable terrain', role: 'Chef d\'Exploitation', phone: '+221 77 123 45 67', status: 'Actif', hireDate: '2025-01-15' },
  { id: 'E-002', name: 'Fatou DIALLO', role: 'Ouvrière', phone: '+221 76 987 65 43', status: 'Actif', hireDate: '2025-03-01' },
  { id: 'E-003', name: 'Employé', role: 'Responsable Stocks', phone: '+221 78 456 78 90', status: 'Actif', hireDate: '2025-02-01' }
];

// Calculate days between two dates
export const daysBetween = (startDate, endDate) => {
  if (!endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

export const KAStorage = {
  getScopedKey(key) {
    const isGlobal = key === 'ka_farm_users' || key.startsWith('ka_user_');
    if (isGlobal) return key;
    const user = this.getCurrentUser();
    const enterpriseId = user ? (user.enterpriseId || 'ka_farm') : 'ka_farm';
    const prefix = `${enterpriseId}_`;
    if (key.startsWith(prefix)) return key;
    return `${prefix}${key}`;
  },

  init() {
    if (isInitialized) return;
    isInitialized = true;

    // Seed default users only in local development/testing contexts.
    // This avoids shipping a default account on production domains.
    if (shouldSeedLocalDefaults() && !localStorage.getItem('ka_farm_users')) {
      const seededUsers = DEFAULT_USERS.map(user => ({
        ...user,
        enterpriseId: 'ka_farm',
        enterpriseName: 'KA Farm',
        enterpriseCode: 'KA-FARM'
      }));
      this.saveUsers(seededUsers);
    }

    // Migrate accidentally double-prefixed keys to simple prefixed keys once
    const migrationKeys = [
      'ka_farm_crops',
      'ka_farm_parcelles',
      'ka_farm_tasks',
      'ka_farm_finances',
      'ka_farm_employees',
      'ka_farm_cheptel',
      'ka_farm_nurseries',
      'ka_farm_seeds',
      'ka_farm_products',
      'ka_farm_employee_payments',
      'ka_farm_elevage_health'
    ];
    let migrated = false;
    migrationKeys.forEach(key => {
      const scopedKey = this.getScopedKey(key);
      const rawDouble = `ka_farm_${key}`;
      const candidateDouble = this.getScopedKey(rawDouble);
      const exists = localStorage.getItem(candidateDouble);
      if (candidateDouble !== scopedKey && exists !== null) {
        const value = localStorage.getItem(candidateDouble);
        localStorage.setItem(scopedKey, value);
        localStorage.removeItem(candidateDouble);
        migrated = true;
      }
    });
    if (migrated) {
      try { console.info('[KAStorage] Migration: double-prefixed storage keys normalized.'); } catch {}
    }
  },

  get(key, fallback) {
    try {
      const scopedKey = this.getScopedKey(key);
      const val = localStorage.getItem(scopedKey);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      ErrorHandler.log(e, `Storage.read: ${key}`);
      return fallback;
    }
  },

  set(key, val) {
    try {
      const scopedKey = this.getScopedKey(key);
      localStorage.setItem(scopedKey, JSON.stringify(val));

      // Sync hook: enqueue action for Firebase sync (non-blocking)
      this._enqueueSyncAction('SET', key, val);
    } catch (e) {
      ErrorHandler.log(e, `Storage.write: ${key}`);
    }
  },

  remove(key) {
    try {
      const scopedKey = this.getScopedKey(key);
      localStorage.removeItem(scopedKey);

      // Sync hook: enqueue deletion for Firebase sync (non-blocking)
      this._enqueueSyncAction('DELETE', key, null);
    } catch (e) {
      ErrorHandler.log(e, `Storage.remove: ${key}`);
    }
  },

  _enqueueSyncAction(action, key, value) {
    // Only enqueue if SyncManager is available and user is online
    if (!window.SyncManager || !navigator.onLine) return;

    try {
      const actionMap = {
        'SET': 'SAVE',
        'DELETE': 'DELETE'
      };

      window.SyncManager.enqueue({
        action: actionMap[action] || 'SAVE',
        key: key,
        data: value,
        timestamp: Date.now()
      }).catch(err => {
        // Silently fail - localStorage already saved, sync is best-effort
        console.warn('[KAStorage] Sync enqueue failed:', err);
      });
    } catch (e) {
      // Fail silently - don't break existing functionality
    }
  },

  // Users with automatic secure hash migration
  getUsers() {
    const users = this.get('ka_farm_users', DEFAULT_USERS);
    let hasPlain = false;
    const migratedUsers = users.map(user => {
      if (user.password && (user.password.length !== 64 || !/^[0-9a-f]{64}$/i.test(user.password))) {
        hasPlain = true;
        return { ...user, password: this.hashPassword(user.password) };
      }
      return user;
    });
    if (hasPlain) {
      this.set('ka_farm_users', migratedUsers);
    }
    return migratedUsers;
  },
  saveUsers(users) {
    const hashedUsers = users.map(user => ({
      ...user,
      password: this.hashPassword(user.password)
    }));
    this.set('ka_farm_users', hashedUsers);
  },

  hashPassword(password) {
    if (!password) return '';
    // If already hashed in new format (salt + hash stored separately), don't hash again
    if (password.length > 64 || !/^[0-9a-f]{64}$/i.test(password)) {
      return password;
    }
    
    // Legacy SHA-256 synchronous function (kept for backward compatibility)
    const rotr = (n, x) => (x >>> n) | (x << (32 - n));
    let h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    let msg = password + "\x80";
    const l = msg.length;
    const padding = (56 - (l % 64) + 64) % 64;
    for (let i = 0; i < padding; i++) msg += "\x00";

    const bitLen = password.length * 8;
    msg += String.fromCharCode((bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff, (bitLen >>> 8) & 0xff, bitLen & 0xff);

    const w = new Array(64);
    for (let chunk = 0; chunk < msg.length; chunk += 64) {
      for (let t = 0; t < 16; t++) {
        const idx = chunk + t * 4;
        w[t] = (msg.charCodeAt(idx) << 24) | (msg.charCodeAt(idx + 1) << 16) | (msg.charCodeAt(idx + 2) << 8) | msg.charCodeAt(idx + 3);
      }
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(7, w[t - 15]) ^ rotr(18, w[t - 15]) ^ (w[t - 15] >>> 3);
        const s1 = rotr(17, w[t - 2]) ^ rotr(19, w[t - 2]) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }

      let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], n = h[7];
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (n + S1 + ch + k[t] + w[t]) | 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;

        n = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }

      h[0] = (h[0] + a) | 0;
      h[1] = (h[1] + b) | 0;
      h[2] = (h[2] + c) | 0;
      h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0;
      h[5] = (h[5] + f) | 0;
      h[6] = (h[6] + g) | 0;
      h[7] = (h[7] + n) | 0;
    }

    let hex = "";
    for (let i = 0; i < 8; i++) {
      const val = h[i] >>> 0;
      hex += val.toString(16).padStart(8, '0');
    }
    return hex;
  },

  // Active Session
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

  // Backward-compatible domain methods (delegate to domain modules)
  getCrops() {
    return this.get('ka_farm_crops', DEFAULT_CROPS);
  },
  saveCrops(crops) {
    this.set('ka_farm_crops', crops);
  },
  getParcelles() {
    return this.get('ka_farm_parcelles', DEFAULT_PARCELLES);
  },
  saveParcelles(parcelles) {
    this.set('ka_farm_parcelles', parcelles);
  },
  getFinances() {
    return this.get('ka_farm_finances', DEFAULT_FINANCES);
  },
  saveFinances(finances) {
    this.set('ka_farm_finances', finances);
  },
  getFinanceStats() {
    const finances = this.getFinances();
    const totalRevenu = finances.filter(f => f.type === 'Revenu').reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalDepense = finances.filter(f => f.type === 'Dépense').reduce((sum, f) => sum + (f.amount || 0), 0);
    return { totalRevenu, totalDepense, solde: totalRevenu - totalDepense };
  },
  getEmployees() {
    return this.get('ka_farm_employees', DEFAULT_EMPLOYEES);
  },
  saveEmployees(employees) {
    this.set('ka_farm_employees', employees);
  },
  getTasks() {
    return this.get('ka_farm_tasks', DEFAULT_TASKS);
  },
  saveTasks(tasks) {
    this.set('ka_farm_tasks', tasks);
  },
  getUsers() {
    return this.get('ka_farm_users', DEFAULT_USERS);
  }
};
