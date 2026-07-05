// KA Farm - Storage Engine
// Manages LocalStorage and fallback defaults

import { KAFirebaseSync } from './firebase.js';

const DEFAULT_CROPS = [
  { id: 'C-101', name: 'Tomate Mongal F1', field: 'Parcelle Nord - Planche 2', sowingDate: '2026-05-10', harvestDate: '2026-08-15', status: 'Floraison', waterStatus: 'Optimale', fertilizerStatus: 'OK', photos: [] },
  { id: 'C-102', name: 'Oignon Rouge de Galmi', field: 'Parcelle Est - Grand Champ', sowingDate: '2026-04-15', harvestDate: '2026-09-01', status: 'Croissance', waterStatus: 'Besoin d\'eau', fertilizerStatus: 'OK', photos: [] },
  { id: 'C-103', name: 'Menthe de Thiès', field: 'Zone Ombragée - Bac A', sowingDate: '2026-06-01', harvestDate: '2026-07-15', status: 'Récoltable', waterStatus: 'Optimale', fertilizerStatus: 'OK', photos: [] },
  { id: 'C-104', name: 'Chou Cabus', field: 'Parcelle Sud - Planche 1', sowingDate: '2026-05-20', harvestDate: '2026-08-25', status: 'Croissance', waterStatus: 'Optimale', fertilizerStatus: 'Besoin d\'azote', photos: [] }
];

const DEFAULT_NURSERIES = [
  { id: 'PEP-201', name: 'Pépinière Tomates Mongal', cropType: 'Tomate', sowingDate: '2026-06-01', plannedTransplantDate: '2026-07-01', quantityEst: 1500, status: 'Levée', healthStatus: 'Excellent' },
  { id: 'PEP-202', name: 'Pépinière Poivron Yolo Wonder', cropType: 'Poivron', sowingDate: '2026-06-10', plannedTransplantDate: '2026-07-15', quantityEst: 800, status: 'Semis', healthStatus: 'Excellent' }
];

const DEFAULT_STOCKS = [
  { id: 'S-301', name: 'Compost Organique Bio', category: 'Amendements', quantity: 350, maxQuantity: 1000, unit: 'kg' },
  { id: 'S-302', name: 'Semences Tomate Mongal F1', category: 'Semences', quantity: 12, maxQuantity: 50, unit: 'sachets' },
  { id: 'S-303', name: 'Purin de Neem (Insecticide)', category: 'Traitements', quantity: 45, maxQuantity: 100, unit: 'L' },
  { id: 'S-304', name: 'Fumier de Mouton séché', category: 'Amendements', quantity: 150, maxQuantity: 800, unit: 'kg' },
  { id: 'S-305', name: 'Aliments Concentrés Bovins', category: 'Alimentation', quantity: 180, maxQuantity: 1000, unit: 'kg' }
];

const DEFAULT_TASKS = [
  { id: 'T-401', title: 'Irrigation matin de l\'oignon Galmi', category: 'Irrigation', dueDate: '2026-06-26', assignee: 'Moussa', priority: 'Haute', completed: false },
  { id: 'T-402', title: 'Sarclage & Désherbage planche choux', category: 'Entretien', dueDate: '2026-06-28', assignee: 'Fatou', priority: 'Moyenne', completed: false },
  { id: 'T-403', title: 'Vérifier la levée de la pépinière tomates', category: 'Pépinière', dueDate: '2026-06-25', assignee: 'Moussa', priority: 'Haute', completed: true },
  { id: 'T-404', title: 'Achat de 5 sacs de fumier de volaille', category: 'Entretien', dueDate: '2026-06-30', assignee: 'Aly', priority: 'Basse', completed: false }
];

const DEFAULT_FINANCES = [
  { id: 'F-501', description: 'Vente de 8 caisses de Tomates Mongal', category: 'Vente Légumes', type: 'Revenu', amount: 120000, date: '2026-06-20' },
  { id: 'F-502', description: 'Achat de semences oignon Galmi', category: 'Semences', type: 'Dépense', amount: 35000, date: '2026-06-18' },
  { id: 'F-503', description: 'Achat compost de Thiès', category: 'Compost', type: 'Dépense', amount: 50000, date: '2026-06-15' },
  { id: 'F-504', description: 'Vente de 4 sacs de menthe fraîche', category: 'Aromates', type: 'Revenu', amount: 60000, date: '2026-06-22' },
  { id: 'F-505', description: 'Vente d\'oignons rouges de Galmi', category: 'Vente Légumes', type: 'Revenu', amount: 140000, date: '2026-05-10' },
  { id: 'F-506', description: 'Achat purin de Neem biologique', category: 'Irrigation', type: 'Dépense', amount: 20000, date: '2026-05-15' },
  { id: 'F-507', description: 'Vente d\'aubergines de saison', category: 'Vente Légumes', type: 'Revenu', amount: 95000, date: '2026-05-22' },
  { id: 'F-508', description: 'Vente de choux cabus maraîchers', category: 'Vente Légumes', type: 'Revenu', amount: 110000, date: '2026-04-05' },
  { id: 'F-509', description: 'Frais de carburant pour motopompe', category: 'Irrigation', type: 'Dépense', amount: 25000, date: '2026-04-12' },
  { id: 'F-510', description: 'Achat gaines goutte-à-goutte', category: 'Irrigation', type: 'Dépense', amount: 40000, date: '2026-04-20' },
  { id: 'F-511', description: 'Vente de piments oiseau', category: 'Vente Légumes', type: 'Revenu', amount: 85000, date: '2026-03-08' },
  { id: 'F-512', description: 'Achat d\'engrais organique de fond', category: 'Compost', type: 'Dépense', amount: 30000, date: '2026-03-15' }
];

const DEFAULT_PARCELLES = [
  { id: 'P-001', name: 'Parcelle Nord - Planche 2', surface: 120, lat: 14.7932, lng: -17.2654, status: 'Cultivée', history: ['Tomate Mongal F1', 'Chou Cabus', 'Jachère'], currentCrop: 'Tomate Mongal F1', waterStatus: 'Irrigué' },
  { id: 'P-002', name: 'Parcelle Est - Grand Champ', surface: 500, lat: 14.7938, lng: -17.2642, status: 'Cultivée', history: ['Oignon Rouge de Galmi', 'Piment Oiseau', 'Arachide'], currentCrop: 'Oignon Rouge de Galmi', waterStatus: 'Besoin d\'eau' },
  { id: 'P-003', name: 'Parcelle Sud - Planche 1', surface: 150, lat: 14.7924, lng: -17.2659, status: 'Cultivée', history: ['Chou Cabus', 'Aubergine', 'Jachère'], currentCrop: 'Chou Cabus', waterStatus: 'Irrigué' },
  { id: 'P-004', name: 'Zone Ombragée - Bac A', surface: 50, lat: 14.7935, lng: -17.2662, status: 'Cultivée', history: ['Menthe de Thiès', 'Laitue de saison'], currentCrop: 'Menthe de Thiès', waterStatus: 'Irrigué' },
  { id: 'P-005', name: 'Parcelle Ouest - Verger', surface: 800, lat: 14.7928, lng: -17.2648, status: 'En préparation', history: ['Papayer Solo', 'Gombo d\'hivernage'], currentCrop: 'Papayer Solo (Jeunes plants)', waterStatus: 'Besoin d\'eau' }
];

const DEFAULT_EMPLOYEES = [
  { id: 'E-001', name: 'Samba Diouf', phone: '77 521 44 22', role: 'Ouvrier agricole', dailyRate: 4000, status: 'Actif' },
  { id: 'E-002', name: 'Awa Sow', phone: '76 432 11 00', role: 'Chef d\'équipe pépinière', dailyRate: 5000, status: 'Actif' },
  { id: 'E-003', name: 'Ibrahima Ndiaye', phone: '77 612 89 54', role: 'Arroseur principal', dailyRate: 4500, status: 'Actif' },
  { id: 'E-004', name: 'Modou Fall', phone: '70 855 33 21', role: 'Maraîcher', dailyRate: 4000, status: 'Actif' },
  { id: 'E-005', name: 'Fatou Binetou Diop', phone: '77 345 67 89', role: 'Maraîchère', dailyRate: 4000, status: 'Actif' }
];

const DEFAULT_ATTENDANCE = [
  { employeeId: 'E-001', date: '2026-06-25', status: 'Présent', notes: '' },
  { employeeId: 'E-002', date: '2026-06-25', status: 'Présent', notes: '' },
  { employeeId: 'E-003', date: '2026-06-25', status: 'Présent', notes: '' },
  { employeeId: 'E-004', date: '2026-06-25', status: 'Présent', notes: '' },
  { employeeId: 'E-005', date: '2026-06-25', status: 'Absent', notes: 'Permission famille' },
  { employeeId: 'E-001', date: '2026-06-26', status: 'Présent', notes: '' },
  { employeeId: 'E-002', date: '2026-06-26', status: 'Présent', notes: '' },
  { employeeId: 'E-003', date: '2026-06-26', status: 'Demi-journée', notes: 'Parti à midi' },
  { employeeId: 'E-004', date: '2026-06-26', status: 'Présent', notes: '' },
  { employeeId: 'E-005', date: '2026-06-26', status: 'Présent', notes: 'De retour' }
];

const DEFAULT_EMPLOYEE_PAYMENTS = [
  { id: 'PAY-001', employeeId: 'E-001', amount: 80000, date: '2026-06-15', periodStart: '2026-06-01', periodEnd: '2026-06-15', paymentMethod: 'Orange Money', status: 'Payé' },
  { id: 'PAY-002', employeeId: 'E-002', amount: 100000, date: '2026-06-15', periodStart: '2026-06-01', periodEnd: '2026-06-15', paymentMethod: 'Wave', status: 'Payé' },
  { id: 'PAY-003', employeeId: 'E-003', amount: 90000, date: '2026-06-15', periodStart: '2026-06-01', periodEnd: '2026-06-15', paymentMethod: 'Espèces', status: 'Payé' },
  { id: 'PAY-004', employeeId: 'E-004', amount: 80000, date: '2026-06-15', periodStart: '2026-06-01', periodEnd: '2026-06-15', paymentMethod: 'Wave', status: 'Payé' }
];

const DEFAULT_USERS = [
  { email: 'moussa@kafarm.sn', name: 'Moussa KA', role: 'Terrain', password: 'moussa-village' },
  { email: 'aly@kafarm.sn', name: 'Aly KA', role: 'Bureau', password: 'aly-dakar' },
  { email: 'amadoucoumbaka@gmail.com', name: 'Amadou KA', role: 'Bureau', password: 'password' }
];

const DEFAULT_CHEPTEL = [
  { id: 'CH-001', name: 'Génisses Laitières Holstein', type: 'Bovins', breed: 'Holstein/Guzera', quantity: 12, unit: 'têtes', status: 'Sain', purpose: 'Lait' },
  { id: 'CH-002', name: 'Moutons Ladoum d\'Élevage', type: 'Ovins', breed: 'Ladoum Pur', quantity: 8, unit: 'têtes', status: 'Sain', purpose: 'Reproduction' },
  { id: 'CH-003', name: 'Poules Pondeuses Cobb 500', type: 'Volailles', breed: 'Cobb 500', quantity: 350, unit: 'sujets', status: 'Surveiller', purpose: 'Œufs' }
];

const DEFAULT_ELEVAGE_PRODUCTION = [
  { id: 'PROD-001', date: '2026-06-25', type: 'Lait', quantity: 145, unit: 'L', notes: 'Excellente traite matinale, lait collecté par le GIE laiterie.' },
  { id: 'PROD-002', date: '2026-06-25', type: 'Œufs', quantity: 310, unit: 'unités', notes: '10 plateaux collectés.' },
  { id: 'PROD-003', date: '2026-06-26', type: 'Lait', quantity: 150, unit: 'L', notes: 'Traite normale.' },
  { id: 'PROD-004', date: '2026-06-26', type: 'Œufs', quantity: 315, unit: 'unités', notes: 'Collecte stable.' }
];

const DEFAULT_ELEVAGE_HEALTH = [
  { id: 'HEA-001', date: '2026-06-10', target: 'Moutons Ladoum', intervention: 'Vaccination Pastorose', practitioner: 'Dr. Diop (Vétérinaire)', cost: 15000, notes: 'Rappel annuel effectué pour tout le troupeau.' },
  { id: 'HEA-002', date: '2026-06-18', target: 'Génisses Laitières', intervention: 'Déparasitage systématique', practitioner: 'Samba Sow (Interne)', cost: 8000, notes: 'Administration orale de vermifuge.' }
];

const DEFAULT_MESSAGES = [
  { id: 'msg-1', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'Salam Aly ! J\'ai fini de vérifier le système de goutte-à-goutte sur la parcelle A. Tout fonctionne bien pour les tomates 🍅.', timestamp: '2026-06-25T08:30:00.000Z' },
  { id: 'msg-2', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'Wa alaykoum salam Moussa. Alhamdoulilah ! Et qu\'en est-il du stock de compost bio ? Est-ce qu\'on a assez pour la pépinière de poivrons ?', timestamp: '2026-06-25T09:15:00.000Z' },
  { id: 'msg-3', senderEmail: 'moussa@kafarm.sn', senderName: 'Moussa KA', text: 'On a encore environ 350 kg en réserve, mais ce serait bien d\'en commander 500 kg supplémentaires pour juillet 🌱.', timestamp: '2026-06-25T09:40:00.000Z' },
  { id: 'msg-4', senderEmail: 'aly@kafarm.sn', senderName: 'Aly KA', text: 'D\'accord, c\'est noté. Je passe la commande aujourd\'hui depuis le bureau de Dakar 💻.', timestamp: '2026-06-25T10:00:00.000Z' }
];

export const CROP_LIBRARY_DATA = [
  {
    name: "Tomate Mongal F1",
    variety: "Variété Résistante d'Hivernage",
    type: "Fruit",
    cycle: "75 - 90 jours (après repiquage)",
    water: "600 - 800 mm (Goutte-à-goutte conseillé)",
    yield: "35 - 50 tonnes / hectare",
    tips: "Variété d'hivernage hautement tolérante à la flétrissure bactérienne et au flétrissement fusarien. Très cultivée au Sénégal.",
    emoji: "🍅"
  },
  {
    name: "Piment Oiseau de Cayenne",
    variety: "Variété de piment fort",
    type: "Fruit",
    cycle: "120 - 150 jours",
    water: "400 - 600 mm (Besoins réguliers)",
    yield: "10 - 15 tonnes / hectare",
    tips: "Semis en pépinière chaude. Exigeant en engrais de fond et de couverture. Sensible à la mouche des fruits.",
    emoji: "🌶️"
  },
  {
    name: "Chou Cabus KK-Cross",
    variety: "Hybride résistant à la chaleur",
    type: "Feuille",
    cycle: "80 - 100 jours",
    water: "500 mm (Irrigation très fréquente)",
    yield: "40 - 60 tonnes / hectare",
    tips: "Idéal pour la contre-saison fraîche au Sénégal (octobre à mars). Arroser régulièrement pour garder le sol frais.",
    emoji: "🥬"
  },
  {
    name: "Oignon Rouge de Gandiol",
    variety: "Écotype côtier de conservation",
    type: "Bulbe",
    cycle: "140 - 170 jours",
    water: "350 - 450 mm (Réduire avant récolte)",
    yield: "25 - 40 tonnes / hectare",
    tips: "Typique du terroir sablonneux sénégalais. Excellente aptitude au stockage longue durée.",
    emoji: "🧅"
  }
];

let isInitialized = false;

export const KAStorage = {
  getScopedKey(key) {
    const isGlobal = key === 'ka_farm_users' || key.startsWith('ka_user_');
    if (isGlobal) return key;
    const user = this.getCurrentUser();
    const enterpriseId = user ? (user.enterpriseId || 'ka_farm') : 'ka_farm';
    return `${enterpriseId}_${key}`;
  },

  init() {
    if (isInitialized) return;
    isInitialized = true;

    // Seed default users once globally
    if (!localStorage.getItem('ka_farm_users')) {
      const seededUsers = DEFAULT_USERS.map(user => ({
        ...user,
        enterpriseId: 'ka_farm',
        enterpriseName: 'KA Farm',
        enterpriseCode: 'KA-FARM'
      }));
      this.saveUsers(seededUsers);
    }

    const scopedCheck = (key) => {
      const sKey = this.getScopedKey(key);
      return localStorage.getItem(sKey);
    };

    if (!scopedCheck('ka_farm_crops')) this.saveCrops(DEFAULT_CROPS);
    if (!scopedCheck('ka_farm_nurseries')) this.saveNurseries(DEFAULT_NURSERIES);
    if (!scopedCheck('ka_farm_stocks')) this.saveStocks(DEFAULT_STOCKS);
    if (!scopedCheck('ka_farm_tasks')) this.saveTasks(DEFAULT_TASKS);
    if (!scopedCheck('ka_farm_finances')) this.saveFinances(DEFAULT_FINANCES);
    if (!scopedCheck('ka_farm_parcelles')) this.saveParcelles(DEFAULT_PARCELLES);
    if (!scopedCheck('ka_farm_employees')) this.saveEmployees(DEFAULT_EMPLOYEES);
    if (!scopedCheck('ka_farm_attendance')) this.saveAttendance(DEFAULT_ATTENDANCE);
    if (!scopedCheck('ka_farm_employee_payments')) this.saveEmployeePayments(DEFAULT_EMPLOYEE_PAYMENTS);
    if (!scopedCheck('ka_farm_cheptel')) this.saveCheptel(DEFAULT_CHEPTEL);
    if (!scopedCheck('ka_farm_elevage_production')) this.saveElevageProduction(DEFAULT_ELEVAGE_PRODUCTION);
    if (!scopedCheck('ka_farm_elevage_health')) this.saveElevageHealth(DEFAULT_ELEVAGE_HEALTH);
    if (!scopedCheck('ka_farm_messages')) this.saveMessages(DEFAULT_MESSAGES);

    // Kicks off the Firebase live cloud synchronization
    KAFirebaseSync.initSync((key, data) => {
      // Notify current page that database data changed
      document.dispatchEvent(new CustomEvent('ka_data_updated', { detail: { key, data } }));
    });
  },

  get(key, fallback) {
    try {
      const scopedKey = this.getScopedKey(key);
      const val = localStorage.getItem(scopedKey);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      console.error('Error reading localStorage key', key, e);
      return fallback;
    }
  },

  set(key, val) {
    try {
      const scopedKey = this.getScopedKey(key);
      localStorage.setItem(scopedKey, JSON.stringify(val));
      // Save changes to cloud Firestore asynchronously
      KAFirebaseSync.saveToCloud(key, val);
    } catch (e) {
      console.error('Error setting localStorage key', key, e);
    }
  },

  // Core collections
  getCrops() {
    return this.get('ka_farm_crops', DEFAULT_CROPS);
  },
  saveCrops(crops) {
    this.set('ka_farm_crops', crops);
  },

  getNurseries() {
    return this.get('ka_farm_nurseries', DEFAULT_NURSERIES);
  },
  saveNurseries(nurseries) {
    this.set('ka_farm_nurseries', nurseries);
  },

  getStocks() {
    return this.get('ka_farm_stocks', DEFAULT_STOCKS);
  },
  saveStocks(stocks) {
    this.set('ka_farm_stocks', stocks);
  },

  getTasks() {
    return this.get('ka_farm_tasks', DEFAULT_TASKS);
  },
  saveTasks(tasks) {
    this.set('ka_farm_tasks', tasks);
  },

  getFinances() {
    return this.get('ka_farm_finances', DEFAULT_FINANCES);
  },
  saveFinances(finances) {
    this.set('ka_farm_finances', finances);
  },

  getParcelles() {
    return this.get('ka_farm_parcelles', DEFAULT_PARCELLES);
  },
  saveParcelles(parcelles) {
    this.set('ka_farm_parcelles', parcelles);
  },

  getCropLibrary() {
    return CROP_LIBRARY_DATA;
  },

  getCheptel() {
    return this.get('ka_farm_cheptel', DEFAULT_CHEPTEL);
  },
  saveCheptel(cheptel) {
    this.set('ka_farm_cheptel', cheptel);
  },

  getElevageProduction() {
    return this.get('ka_farm_elevage_production', DEFAULT_ELEVAGE_PRODUCTION);
  },
  saveElevageProduction(production) {
    this.set('ka_farm_elevage_production', production);
  },

  getElevageHealth() {
    return this.get('ka_farm_elevage_health', DEFAULT_ELEVAGE_HEALTH);
  },
  saveElevageHealth(health) {
    this.set('ka_farm_elevage_health', health);
  },

  getEmployees() {
    return this.get('ka_farm_employees', DEFAULT_EMPLOYEES);
  },
  saveEmployees(employees) {
    this.set('ka_farm_employees', employees);
  },

  getAttendance() {
    return this.get('ka_farm_attendance', DEFAULT_ATTENDANCE);
  },
  saveAttendance(attendance) {
    this.set('ka_farm_attendance', attendance);
  },

  getEmployeePayments() {
    return this.get('ka_farm_employee_payments', DEFAULT_EMPLOYEE_PAYMENTS);
  },
  saveEmployeePayments(payments) {
    this.set('ka_farm_employee_payments', payments);
  },

  getMessages() {
    return this.get('ka_farm_messages', DEFAULT_MESSAGES);
  },
  saveMessages(messages) {
    this.set('ka_farm_messages', messages);
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
    // If already hashed (length 64 hex)
    if (password.length === 64 && /^[0-9a-f]{64}$/i.test(password)) {
      return password;
    }
    
    // Light, standard SHA-256 synchronous function
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

  getFinanceStats() {
    const finances = this.getFinances();
    const totalRevenu = finances.filter(f => f.type === 'Revenu').reduce((sum, f) => sum + f.amount, 0);
    const totalDepense = finances.filter(f => f.type === 'Dépense').reduce((sum, f) => sum + f.amount, 0);
    const solde = totalRevenu - totalDepense;
    return { totalRevenu, totalDepense, solde };
  }
};
