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
  { id: 'P-001', name: 'Parcelle Nord - Planche 2', surface: 120, lat: 14.7932, lng: -17.2654, status: 'Cultivée', type_sol: 'sableux', history: ['Tomate Mongal F1', 'Chou Cabus', 'Jachère'], currentCrop: 'Tomate Mongal F1', waterStatus: 'Irrigué' },
  { id: 'P-002', name: 'Parcelle Est - Grand Champ', surface: 500, lat: 14.7938, lng: -17.2642, status: 'Cultivée', type_sol: 'limoneux', history: ['Oignon Rouge de Galmi', 'Piment Oiseau', 'Arachide'], currentCrop: 'Oignon Rouge de Galmi', waterStatus: 'Besoin d\'eau' },
  { id: 'P-003', name: 'Parcelle Sud - Planche 1', surface: 150, lat: 14.7924, lng: -17.2659, status: 'Cultivée', type_sol: 'argileux', history: ['Chou Cabus', 'Aubergine', 'Jachère'], currentCrop: 'Chou Cabus', waterStatus: 'Irrigué' },
  { id: 'P-004', name: 'Zone Ombragée - Bac A', surface: 50, lat: 14.7935, lng: -17.2662, status: 'Cultivée', type_sol: 'sableux', history: ['Menthe de Thiès', 'Laitue de saison'], currentCrop: 'Menthe de Thiès', waterStatus: 'Irrigué' },
  { id: 'P-005', name: 'Parcelle Ouest - Verger', surface: 800, lat: 14.7928, lng: -17.2648, status: 'En préparation', type_sol: 'limoneux', history: ['Papayer Solo', 'Gombo d\'hivernage'], currentCrop: 'Papayer Solo (Jeunes plants)', waterStatus: 'Besoin d\'eau' }
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
  { email: 'contact@kafarm.sn', name: 'Amadou KA', role: 'Bureau', password: 'password' }
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

const DEFAULT_TREATMENTS = [
  { id: 'TR-001', parcelId: 'P-001', parcelName: 'Parcelle Nord - Planche 2', cropId: 'C-101', cropName: 'Tomate Mongal F1', category: 'bio-phytosanitaire', productName: 'Purin de Neem', dateApplied: '2026-06-20', dar: 3, target: 'Chenilles et pucerons', notes: 'Traitement préventif appliqué le matin. Respecter le DAR de 3 jours.', harvestReady: true, enterprise_id: 'ka_farm' },
  { id: 'TR-002', parcelId: 'P-002', parcelName: 'Parcelle Est - Grand Champ', cropId: 'C-102', cropName: 'Oignon Rouge de Galmi', category: 'chimique-phytosanitaire', productName: 'Décis (Insecticide chimique)', dateApplied: '2026-06-23', dar: 7, target: 'Tuta Absoluta', notes: 'Traitement curatif suite à l\'alerte sur les chenilles.', harvestReady: false, enterprise_id: 'ka_farm' },
  { id: 'TR-003', parcelId: 'P-001', parcelName: 'Parcelle Nord - Planche 2', cropId: 'C-101', cropName: 'Tomate Mongal F1', category: 'bio-engrais', productName: 'Compost Organique Bio', dateApplied: '2026-06-15', dar: 0, target: 'Amendement du sol', notes: 'Application en fond pour améliorer la fertilité.', harvestReady: true, enterprise_id: 'ka_farm' },
  { id: 'TR-004', parcelId: 'P-003', parcelName: 'Parcelle Sud - Planche 1', cropId: '', cropName: 'Chou Cabus', category: 'chimique-phytosanitaire', productName: 'Ridomil Gold', dateApplied: '2026-06-22', dar: 14, target: 'Mildiou', notes: 'Traitement fongicide préventif.', harvestReady: false, enterprise_id: 'ka_farm' }
];

const DEFAULT_CROP_PROFITS = [
  {
    id: 'PROF-001',
    cropName: 'Tomate Mongal F1',
    parcelId: 'P-001',
    parcelName: 'Parcelle Nord - Planche 2',
    yieldKg: 5000,
    pricePerKg: 650,
    revenue: 3250000,
    costs: { seeds: 150000, fertilizer: 200000, water: 100000, labor: 300000 },
    totalCost: 750000,
    netMargin: 2500000,
    profitabilityPercent: 333.33,
    period: '2026-06-25',
    notes: 'Excellent rendement grâce au goutte-à-goutte. Marge exceptionnelle cette saison.',
    enterprise_id: 'ka_farm'
  },
  {
    id: 'PROF-002',
    cropName: 'Oignon Rouge de Galmi',
    parcelId: 'P-002',
    parcelName: 'Parcelle Est - Grand Champ',
    yieldKg: 8000,
    pricePerKg: 500,
    revenue: 4000000,
    costs: { seeds: 200000, fertilizer: 150000, water: 80000, labor: 400000 },
    totalCost: 830000,
    netMargin: 3170000,
    profitabilityPercent: 382.05,
    period: '2026-06-20',
    notes: 'Culture très rentable. Prix stable sur le marché de Sandiara.',
    enterprise_id: 'ka_farm'
  },
  {
    id: 'PROF-003',
    cropName: 'Piment Oiseau',
    parcelId: 'P-003',
    parcelName: 'Parcelle Sud - Planche 1',
    yieldKg: 1500,
    pricePerKg: 1200,
    revenue: 1800000,
    costs: { seeds: 80000, fertilizer: 50000, water: 30000, labor: 150000 },
    totalCost: 310000,
    netMargin: 1490000,
    profitabilityPercent: 480.65,
    period: '2026-06-28',
    notes: 'Petite surface mais très haut prix au kg. Culture stratégique.',
    enterprise_id: 'ka_farm'
  },
  {
    id: 'PROF-004',
    cropName: 'Chou Cabus',
    parcelId: 'P-004',
    parcelName: 'Zone Ombragée - Bac A',
    yieldKg: 3000,
    pricePerKg: 400,
    revenue: 1200000,
    costs: { seeds: 60000, fertilizer: 40000, water: 25000, labor: 200000 },
    totalCost: 325000,
    netMargin: 875000,
    profitabilityPercent: 269.23,
    period: '2026-06-15',
    notes: 'Culture d\'hivernage. Bon rendement sous ombrage.',
    enterprise_id: 'ka_farm'
  }
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
    if (!scopedCheck('ka_farm_treatments')) this.saveTreatments(DEFAULT_TREATMENTS);
    if (!scopedCheck('ka_farm_crop_profits')) this.saveCropProfits(DEFAULT_CROP_PROFITS);
    // Rotation des cultures
    if (!scopedCheck('ka_farm_plant_families')) this.savePlantFamilies(DEFAULT_PLANT_FAMILIES);
    if (!scopedCheck('ka_farm_crop_families')) this.saveCropFamilies(DEFAULT_CROP_FAMILIES);
    if (!scopedCheck('ka_farm_rotation_history')) this.saveRotationHistory(DEFAULT_ROTATION_HISTORY);
    if (!scopedCheck('ka_farm_rotation_rules')) this.saveRotationRules(DEFAULT_ROTATION_RULES);

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

  getTreatments() {
    return this.get('ka_farm_treatments', DEFAULT_TREATMENTS);
  },
  saveTreatments(treatments) {
    this.set('ka_farm_treatments', treatments);
  },

  getCropProfits() {
    return this.get('ka_farm_crop_profits', DEFAULT_CROP_PROFITS);
  },
  saveCropProfits(profits) {
    this.set('ka_farm_crop_profits', profits);
  },

  getHarvests() {
    return this.get('ka_farm_harvests', DEFAULT_HARVESTS);
  },
  saveHarvests(harvests) {
    this.set('ka_farm_harvests', harvests);
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
  },

  // Weather Alerts
  getWeatherAlerts() {
    return this.get('ka_farm_weather_alerts', []);
  },
  saveWeatherAlerts(alerts) {
    this.set('ka_farm_weather_alerts', alerts);
  },

  getWeatherAlertHistory() {
    return this.get('ka_farm_weather_alert_history', []);
  },
  saveWeatherAlertHistory(history) {
    this.set('ka_farm_weather_alert_history', history);
  },

  // Weather Configuration
  getWeatherConfig() {
    return this.get('ka_farm_weather_config', {
      temperature: { high: 40, low: 15 },
      rainfall: { threshold: 50 },
      wind: { threshold: 60 },
      humidity: { low: 30, high: 80 }
    });
  },
  saveWeatherConfig(config) {
    this.set('ka_farm_weather_config', config);
  },

  // Current Weather
  getCurrentWeather() {
    return this.get('ka_farm_current_weather', {
      temperature: 25,
      humidity: 65,
      wind: 10,
      rainfall: 0
    });
  },
  saveCurrentWeather(weather) {
    this.set('ka_farm_current_weather', weather);
  },

  // Default Harvests
  getHarvests() {
    return this.get('ka_farm_harvests', []);
  },
  saveHarvests(harvests) {
    this.set('ka_farm_harvests', harvests);
  },

  // Plant Families (Rotation des cultures)
  getPlantFamilies() {
    return this.get('ka_farm_plant_families', DEFAULT_PLANT_FAMILIES);
  },
  savePlantFamilies(families) {
    this.set('ka_farm_plant_families', families);
  },
  addPlantFamily(family) {
    const families = this.getPlantFamilies();
    families.push(family);
    this.savePlantFamilies(families);
    return family;
  },
  updatePlantFamily(id, updates) {
    const families = this.getPlantFamilies();
    const index = families.findIndex(f => f.id === id);
    if (index !== -1) {
      families[index] = { ...families[index], ...updates };
      this.savePlantFamilies(families);
      return families[index];
    }
    return null;
  },
  deletePlantFamily(id) {
    const families = this.getPlantFamilies();
    const filtered = families.filter(f => f.id !== id);
    this.savePlantFamilies(filtered);
    return filtered;
  },

  // Crop Families Mapping
  getCropFamilies() {
    return this.get('ka_farm_crop_families', DEFAULT_CROP_FAMILIES);
  },
  saveCropFamilies(cropFamilies) {
    this.set('ka_farm_crop_families', cropFamilies);
  },
  addCropFamily(cropFamily) {
    const cropFamilies = this.getCropFamilies();
    cropFamilies.push(cropFamily);
    this.saveCropFamilies(cropFamilies);
    return cropFamily;
  },
  getCropFamily(cropName) {
    const cropFamilies = this.getCropFamilies();
    return cropFamilies.find(cf => cf.crop_name === cropName);
  },
  getCropsByFamily(familyId) {
    const cropFamilies = this.getCropFamilies();
    return cropFamilies.filter(cf => cf.family_id === familyId).map(cf => cf.crop_name);
  },

  // Rotation History
  getRotationHistory() {
    return this.get('ka_farm_rotation_history', DEFAULT_ROTATION_HISTORY);
  },
  saveRotationHistory(history) {
    this.set('ka_farm_rotation_history', history);
  },
  addRotationHistory(record) {
    const history = this.getRotationHistory();
    history.push(record);
    this.saveRotationHistory(history);
    return record;
  },
  getRotationHistoryByParcel(parcelId) {
    const history = this.getRotationHistory();
    return history.filter(r => r.parcel_id === parcelId)
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  },
  getLastRotationForParcel(parcelId) {
    const history = this.getRotationHistoryByParcel(parcelId);
    return history.length > 0 ? history[0] : null;
  },

  // Rotation Rules
  getRotationRules() {
    return this.get('ka_farm_rotation_rules', DEFAULT_ROTATION_RULES);
  },
  saveRotationRules(rules) {
    this.set('ka_farm_rotation_rules', rules);
  },
  addRotationRule(rule) {
    const rules = this.getRotationRules();
    rules.push(rule);
    this.saveRotationRules(rules);
    return rule;
  },
  deleteRotationRule(id) {
    const rules = this.getRotationRules();
    const filtered = rules.filter(r => r.id !== id);
    this.saveRotationRules(filtered);
    return filtered;
  },

  // Helper methods for rotation planning
  getFamilyById(familyId) {
    const families = this.getPlantFamilies();
    return families.find(f => f.id === familyId);
  },
  
  getFamilyIdByCrop(cropName) {
    const cropFamily = this.getCropFamily(cropName);
    return cropFamily ? cropFamily.family_id : null;
  },
  
  // Check if a crop can follow another crop on a parcel
  canCropFollow(cropName, parcelId) {
    const familyId = this.getFamilyIdByCrop(cropName);
    if (!familyId) return { canFollow: true, reason: 'Pas de famille définie pour cette culture' };
    
    const lastRotation = this.getLastRotationForParcel(parcelId);
    if (!lastRotation) return { canFollow: true, reason: 'Première culture sur cette parcelle' };
    
    const lastFamilyId = lastRotation.family_id;
    
    // Check direct incompatibility
    if (familyId === lastFamilyId) {
      const family = this.getFamilyById(familyId);
      if (family) {
        return {
          canFollow: false,
          reason: `Impossible : ${family.name} nécessite ${family.min_rotation_years} an(s) entre deux cultures successives`
        };
      }
    }
    
    // Check rotation rules
    const rules = this.getRotationRules();
    const conflictingRule = rules.find(r => 
      r.family_id === familyId && r.cannot_follow_family_id === lastFamilyId
    );
    
    if (conflictingRule) {
      return {
        canFollow: false,
        reason: `Impossible selon la règle : ${conflictingRule.reason}`
      };
    }
    
    // Check if enough time has passed for the same family
    if (familyId === lastFamilyId) {
      const family = this.getFamilyById(familyId);
      if (family) {
        const lastEndDate = new Date(lastRotation.end_date);
        const currentDate = new Date();
        const yearsPassed = (currentDate - lastEndDate) / (1000 * 60 * 60 * 24 * 365);
        
        if (yearsPassed < family.min_rotation_years) {
          return {
            canFollow: false,
            reason: `Attendre encore ${Math.ceil(family.min_rotation_years - yearsPassed)} an(s) pour ${family.name}`
          };
        }
      }
    }
    
    return { canFollow: true, reason: 'Rotation autorisée' };
  },

  // Get recommended crops for a parcel
  getRecommendedCrops(parcelId) {
    const allCrops = this.getCrops();
    const cropFamilies = this.getCropFamilies();
    const lastRotation = this.getLastRotationForParcel(parcelId);
    
    if (!lastRotation) {
      // First crop on parcel - all crops are recommended
      return allCrops.map(c => ({
        crop: c,
        reason: 'Première culture sur cette parcelle',
        priority: 1
      }));
    }
    
    const lastFamilyId = lastRotation.family_id;
    const lastFamily = this.getFamilyById(lastFamilyId);
    
    const recommendations = [];
    
    // Get compatible families from last family
    const compatibleFamilies = lastFamily ? lastFamily.compatible_families : [];
    
    for (const crop of allCrops) {
      const cropFamily = cropFamilies.find(cf => cf.crop_name === crop.name);
      if (!cropFamily) continue;
      
      const canFollow = this.canCropFollow(crop.name, parcelId);
      
      if (canFollow.canFollow) {
        // Check if it's in compatible families
        if (compatibleFamilies.includes(cropFamily.family_id)) {
          recommendations.push({
            crop: crop,
            reason: `Famille compatible : ${cropFamily.family_name}`,
            priority: 3
          });
        } else {
          recommendations.push({
            crop: crop,
            reason: canFollow.reason,
            priority: 2
          });
        }
      } else {
        recommendations.push({
          crop: crop,
          reason: canFollow.reason,
          priority: 0,
          warning: true
        });
      }
    }
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  },

  // Get rotation warnings for all parcels
  getRotationWarnings() {
    const parcels = this.getParcelles();
    const warnings = [];
    
    for (const parcel of parcels) {
      const lastRotation = this.getLastRotationForParcel(parcel.id);
      if (!lastRotation) continue;
      
      const currentCrop = this.getCrops().find(c => c.id === parcel.current_crop);
      if (!currentCrop) continue;
      
      const currentFamilyId = this.getFamilyIdByCrop(currentCrop.name);
      const lastFamilyId = lastRotation.family_id;
      
      if (currentFamilyId && currentFamilyId === lastFamilyId) {
        const family = this.getFamilyById(currentFamilyId);
        if (family) {
          warnings.push({
            parcelId: parcel.id,
            parcelName: parcel.name,
            cropName: currentCrop.name,
            familyName: family.name,
            message: `Violation de rotation : ${family.name} planté deux fois de suite`,
            severity: 'Critique',
            minYears: family.min_rotation_years
          });
        }
      }
    }
    
    return warnings;
  }
};

// Default Harvests Data
const DEFAULT_HARVESTS = [];

// Rotation des cultures - Données par défaut
const DEFAULT_PLANT_FAMILIES = [
  {
    id: 'FAM-001',
    name: 'Solanacées',
    description: 'Famille des tomates, pommes de terre, aubergines, poivrons et piments. Vulnérables aux nématodes, mildiou et verticilliose.',
    min_rotation_years: 3,
    compatible_families: ['Fabacées', 'Graminées', 'Liliacées', 'Chénopodiacées'],
    incompatible_families: ['Solanacées'],
    notes: 'Éviter de replanter des solanacées au même endroit avant 3 ans minimum pour prévenir les maladies du sol.'
  },
  {
    id: 'FAM-002',
    name: 'Fabacées (Légumineuses)',
    description: 'Famille des haricots, pois, lentilles, arachides. Fixateurs d\'azote qui améliorent la fertilité du sol.',
    min_rotation_years: 2,
    compatible_families: ['Solanacées', 'Graminées', 'Brassicacées', 'Apiacées'],
    incompatible_families: ['Fabacées'],
    notes: 'Excellentes pour enrichir le sol en azote. Peut être semées avant ou après la plupart des cultures.'
  },
  {
    id: 'FAM-003',
    name: 'Brassicacées (Crucifères)',
    description: 'Famille des choux, radis, navets, roquette, moutarde. Sensibles à la hernie et aux altises.',
    min_rotation_years: 3,
    compatible_families: ['Fabacées', 'Solanacées', 'Apiacées', 'Amaryllidacées'],
    incompatible_families: ['Brassicacées'],
    notes: 'Ne pas planter deux années de suite au même endroit. Bénéficient des engrais riches en azote.'
  },
  {
    id: 'FAM-004',
    name: 'Amaryllidacées (Liliacées)',
    description: 'Famille des oignons, ail, échalotes, poireaux. Cultures racines sensibles aux nématodes.',
    min_rotation_years: 2,
    compatible_families: ['Fabacées', 'Solanacées', 'Brassicacées'],
    incompatible_families: ['Amaryllidacées'],
    notes: 'Rotation avec des légumineuses recommandée pour réduire les nématodes dans le sol.'
  },
  {
    id: 'FAM-005',
    name: 'Cucurbitacées',
    description: 'Famille des courges, concombres, melons, pastèques. Gourmandes en eau et en nutriments.',
    min_rotation_years: 2,
    compatible_families: ['Fabacées', 'Graminées', 'Solanacées'],
    incompatible_families: ['Cucurbitacées'],
    notes: 'Besoins élevés en matière organique. Éviter la succession avec d\'autres cucurbitacées.'
  },
  {
    id: 'FAM-006',
    name: 'Apiacées (Ombellifères)',
    description: 'Famille des carottes, céleri, persil, fenouil. Cultures racines à cycle long.',
    min_rotation_years: 2,
    compatible_families: ['Fabacées', 'Brassicacées', 'Solanacées'],
    incompatible_families: ['Apiacées'],
    notes: 'Sensibles aux mouches de la carotte. Rotation avec légumineuses bénéfique.'
  },
  {
    id: 'FAM-007',
    name: 'Asteracées',
    description: 'Famille des laitues, artichauts, topinambours, tournesols. Certains sont comestibles, d\'autres ornementaux.',
    min_rotation_years: 2,
    compatible_families: ['Fabacées', 'Solanacées', 'Apiacées'],
    incompatible_families: ['Asteracées'],
    notes: 'Les laitues ont des besoins en eau élevés et bénéficiant de la rotation avec des légumineuses.'
  },
  {
    id: 'FAM-008',
    name: 'Graminées (Poacées)',
    description: 'Famille du maïs, sorgho, mil, riz, blé. Céréales et fourrages.',
    min_rotation_years: 1,
    compatible_families: ['Fabacées', 'Solanacées', 'Brassicacées'],
    incompatible_families: ['Graminées'],
    notes: 'Épuisent rapidement les réserves du sol. Rotation avec légumineuses essentielle.'
  },
  {
    id: 'FAM-009',
    name: 'Lamiacées (Labiées)',
    description: 'Famille des menthes, basilic, thym, romarin, lavande. Plantes aromatiques et médicinales.',
    min_rotation_years: 1,
    compatible_families: ['Fabacées', 'Solanacées', 'Brassicacées', 'Amaryllidacées'],
    incompatible_families: ['Lamiacées'],
    notes: 'Peuvent être cultivées plusieurs années au même endroit si le sol est bien amendé.'
  },
  {
    id: 'FAM-010',
    name: 'Chénopodiacées',
    description: 'Famille des épinards, betteraves, blettes. Riches en nutriments et peu exigeantes.',
    min_rotation_years: 2,
    compatible_families: ['Fabacées', 'Solanacées', 'Brassicacées'],
    incompatible_families: ['Chénopodiacées'],
    notes: 'Sensibles à la montaison en graine par temps chaud. Rotation régulière recommandée.'
  }
];

const DEFAULT_CROP_FAMILIES = [
  { id: 'CF-001', crop_name: 'Tomate Mongal F1', family_id: 'FAM-001', family_name: 'Solanacées' },
  { id: 'CF-002', crop_name: 'Tomate', family_id: 'FAM-001', family_name: 'Solanacées' },
  { id: 'CF-003', crop_name: 'Pomme de terre', family_id: 'FAM-001', family_name: 'Solanacées' },
  { id: 'CF-004', crop_name: 'Aubergine', family_id: 'FAM-001', family_name: 'Solanacées' },
  { id: 'CF-005', crop_name: 'Poivron', family_id: 'FAM-001', family_name: 'Solanacées' },
  { id: 'CF-006', crop_name: 'Piment', family_id: 'FAM-001', family_name: 'Solanacées' },
  { id: 'CF-007', crop_name: 'Piment Oiseau', family_id: 'FAM-001', family_name: 'Solanacées' },
  { id: 'CF-008', crop_name: 'Haricot vert', family_id: 'FAM-002', family_name: 'Fabacées' },
  { id: 'CF-009', crop_name: 'Haricot', family_id: 'FAM-002', family_name: 'Fabacées' },
  { id: 'CF-010', crop_name: 'Arachide', family_id: 'FAM-002', family_name: 'Fabacées' },
  { id: 'CF-011', crop_name: 'Pois', family_id: 'FAM-002', family_name: 'Fabacées' },
  { id: 'CF-012', crop_name: 'Lentille', family_id: 'FAM-002', family_name: 'Fabacées' },
  { id: 'CF-013', crop_name: 'Chou', family_id: 'FAM-003', family_name: 'Brassicacées' },
  { id: 'CF-014', crop_name: 'Chou Cabus', family_id: 'FAM-003', family_name: 'Brassicacées' },
  { id: 'CF-015', crop_name: 'Chou-fleur', family_id: 'FAM-003', family_name: 'Brassicacées' },
  { id: 'CF-016', crop_name: 'Brocoli', family_id: 'FAM-003', family_name: 'Brassicacées' },
  { id: 'CF-017', crop_name: 'Radis', family_id: 'FAM-003', family_name: 'Brassicacées' },
  { id: 'CF-018', crop_name: 'Navet', family_id: 'FAM-003', family_name: 'Brassicacées' },
  { id: 'CF-019', crop_name: 'Oignon', family_id: 'FAM-004', family_name: 'Amaryllidacées' },
  { id: 'CF-020', crop_name: 'Oignon Rouge de Galmi', family_id: 'FAM-004', family_name: 'Amaryllidacées' },
  { id: 'CF-021', crop_name: 'Oignon Rouge de Gandiol', family_id: 'FAM-004', family_name: 'Amaryllidacées' },
  { id: 'CF-022', crop_name: 'Ail', family_id: 'FAM-004', family_name: 'Amaryllidacées' },
  { id: 'CF-023', crop_name: 'Échalote', family_id: 'FAM-004', family_name: 'Amaryllidacées' },
  { id: 'CF-024', crop_name: 'Poireau', family_id: 'FAM-004', family_name: 'Amaryllidacées' },
  { id: 'CF-025', crop_name: 'Concombre', family_id: 'FAM-005', family_name: 'Cucurbitacées' },
  { id: 'CF-026', crop_name: 'Courgette', family_id: 'FAM-005', family_name: 'Cucurbitacées' },
  { id: 'CF-027', crop_name: 'Melon', family_id: 'FAM-005', family_name: 'Cucurbitacées' },
  { id: 'CF-028', crop_name: 'Pastèque', family_id: 'FAM-005', family_name: 'Cucurbitacées' },
  { id: 'CF-029', crop_name: 'Citrouille', family_id: 'FAM-005', family_name: 'Cucurbitacées' },
  { id: 'CF-030', crop_name: 'Carotte', family_id: 'FAM-006', family_name: 'Apiacées' },
  { id: 'CF-031', crop_name: 'Céleri', family_id: 'FAM-006', family_name: 'Apiacées' },
  { id: 'CF-032', crop_name: 'Persil', family_id: 'FAM-006', family_name: 'Apiacées' },
  { id: 'CF-033', crop_name: 'Fenouil', family_id: 'FAM-006', family_name: 'Apiacées' },
  { id: 'CF-034', crop_name: 'Laitue', family_id: 'FAM-007', family_name: 'Asteracées' },
  { id: 'CF-035', crop_name: 'Laitue de saison', family_id: 'FAM-007', family_name: 'Asteracées' },
  { id: 'CF-036', crop_name: 'Artichaut', family_id: 'FAM-007', family_name: 'Asteracées' },
  { id: 'CF-037', crop_name: 'Topinambour', family_id: 'FAM-007', family_name: 'Asteracées' },
  { id: 'CF-038', crop_name: 'Maïs', family_id: 'FAM-008', family_name: 'Graminées' },
  { id: 'CF-039', crop_name: 'Sorgho', family_id: 'FAM-008', family_name: 'Graminées' },
  { id: 'CF-040', crop_name: 'Mil', family_id: 'FAM-008', family_name: 'Graminées' },
  { id: 'CF-041', crop_name: 'Riz', family_id: 'FAM-008', family_name: 'Graminées' },
  { id: 'CF-042', crop_name: 'Blé', family_id: 'FAM-008', family_name: 'Graminées' },
  { id: 'CF-043', crop_name: 'Menthe', family_id: 'FAM-009', family_name: 'Lamiacées' },
  { id: 'CF-044', crop_name: 'Menthe de Thiès', family_id: 'FAM-009', family_name: 'Lamiacées' },
  { id: 'CF-045', crop_name: 'Basilic', family_id: 'FAM-009', family_name: 'Lamiacées' },
  { id: 'CF-046', crop_name: 'Thym', family_id: 'FAM-009', family_name: 'Lamiacées' },
  { id: 'CF-047', crop_name: 'Romarin', family_id: 'FAM-009', family_name: 'Lamiacées' },
  { id: 'CF-048', crop_name: 'Épinard', family_id: 'FAM-010', family_name: 'Chénopodiacées' },
  { id: 'CF-049', crop_name: 'Betterave', family_id: 'FAM-010', family_name: 'Chénopodiacées' },
  { id: 'CF-050', crop_name: 'Blette', family_id: 'FAM-010', family_name: 'Chénopodiacées' },
  { id: 'CF-051', crop_name: 'Gombo', family_id: 'FAM-011', family_name: 'Malvacées' }
];

const DEFAULT_ROTATION_HISTORY = [
  {
    id: 'RH-001',
    parcel_id: 'P-001',
    crop_id: 'C-101',
    crop_name: 'Tomate Mongal F1',
    family_id: 'FAM-001',
    family_name: 'Solanacées',
    start_date: '2025-06-01',
    end_date: '2025-09-15',
    cycle_number: 1,
    warning_issued: false,
    notes: 'Première rotation sur cette parcelle. Tomates cultivées avec succès.'
  },
  {
    id: 'RH-002',
    parcel_id: 'P-001',
    crop_id: 'C-104',
    crop_name: 'Chou Cabus',
    family_id: 'FAM-003',
    family_name: 'Brassicacées',
    start_date: '2025-09-20',
    end_date: '2025-12-25',
    cycle_number: 2,
    warning_issued: false,
    notes: 'Rotation réussie après tomates. Brassicacées compatibles avec Solanacées.'
  },
  {
    id: 'RH-003',
    parcel_id: 'P-002',
    crop_id: 'C-102',
    crop_name: 'Oignon Rouge de Galmi',
    family_id: 'FAM-004',
    family_name: 'Amaryllidacées',
    start_date: '2025-04-15',
    end_date: '2025-08-30',
    cycle_number: 1,
    warning_issued: false,
    notes: 'Oignons cultivés avec succès. Sol riche en matière organique.'
  },
  {
    id: 'RH-004',
    parcel_id: 'P-003',
    crop_id: 'C-103',
    crop_name: 'Menthe de Thiès',
    family_id: 'FAM-009',
    family_name: 'Lamiacées',
    start_date: '2025-01-01',
    end_date: '2025-06-30',
    cycle_number: 1,
    warning_issued: false,
    notes: 'Culture aromatique en rotation avec légumes.'
  }
];

const DEFAULT_ROTATION_RULES = [
  {
    id: 'RR-001',
    family_id: 'FAM-001',
    cannot_follow_family_id: 'FAM-001',
    min_years_between: 3,
    reason: 'Prévention des maladies du sol spécifiques aux Solanacées (nématodes, mildiou, verticilliose)'
  },
  {
    id: 'RR-002',
    family_id: 'FAM-003',
    cannot_follow_family_id: 'FAM-003',
    min_years_between: 3,
    reason: 'Prévention de la hernie des crucifères et accumulation de pathogènes spécifiques'
  },
  {
    id: 'RR-003',
    family_id: 'FAM-004',
    cannot_follow_family_id: 'FAM-004',
    min_years_between: 2,
    reason: 'Réduction des populations de nématodes dans le sol'
  },
  {
    id: 'RR-004',
    family_id: 'FAM-005',
    cannot_follow_family_id: 'FAM-005',
    min_years_between: 2,
    reason: 'Éviter l\'épuisement des nutriments et les maladies spécifiques'
  },
  {
    id: 'RR-005',
    family_id: 'FAM-006',
    cannot_follow_family_id: 'FAM-006',
    min_years_between: 2,
    reason: 'Prévention des maladies et ravageurs spécifiques aux Apiacées'
  },
  {
    id: 'RR-006',
    family_id: 'FAM-008',
    cannot_follow_family_id: 'FAM-008',
    min_years_between: 1,
    reason: 'Éviter l\'épuisement rapide des réserves du sol'
  },
  {
    id: 'RR-007',
    family_id: 'FAM-002',
    cannot_follow_family_id: 'FAM-002',
    min_years_between: 2,
    reason: 'Permettre la reconstitution naturelle de l\'azote et éviter les maladies'
  }
];
