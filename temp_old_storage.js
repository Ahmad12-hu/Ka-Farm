// KA Farm - Storage Engine
// Manages LocalStorage and fallback defaults

import { ErrorHandler } from './modules/error-handler.js';

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

const DEFAULT_USERS = [];

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
    if (!scopedCheck('ka_farm_treatments')) this.saveTreatments(DEFAULT_TREATMENTS);
    if (!scopedCheck('ka_farm_crop_profits')) this.saveCropProfits(DEFAULT_CROP_PROFITS);
    // Rotation des cultures
    if (!scopedCheck('ka_farm_plant_families')) this.savePlantFamilies(DEFAULT_PLANT_FAMILIES);
    if (!scopedCheck('ka_farm_crop_families')) this.saveCropFamilies(DEFAULT_CROP_FAMILIES);
    if (!scopedCheck('ka_farm_rotation_history')) this.saveRotationHistory(DEFAULT_ROTATION_HISTORY);
    if (!scopedCheck('ka_farm_rotation_rules')) this.saveRotationRules(DEFAULT_ROTATION_RULES);
    // Compostage organique
    if (!scopedCheck('ka_farm_compost_materials')) this.saveCompostMaterials(DEFAULT_COMPOST_MATERIALS);
    if (!scopedCheck('ka_farm_compost_recipes')) this.saveCompostRecipes(DEFAULT_COMPOST_RECIPES);
    if (!scopedCheck('ka_farm_recipe_ingredients')) this.saveRecipeIngredients(DEFAULT_RECIPE_INGREDIENTS);
    if (!scopedCheck('ka_farm_compost_history')) this.saveCompostHistory(DEFAULT_COMPOST_HISTORY);

    // Simulateur de marge brute (2.4)
    if (!scopedCheck('ka_farm_transport_rates')) this.saveTransportRates(DEFAULT_TRANSPORT_RATES);
    if (!scopedCheck('ka_farm_margin_simulations')) this.saveMarginSimulations(DEFAULT_MARGIN_SIMULATIONS);

    // Prix du marché et tendances saisonnières (2.5)
    if (!scopedCheck('ka_farm_market_prices')) this.saveMarketPrices(DEFAULT_MARKET_PRICES);
    if (!scopedCheck('ka_farm_season_trends')) this.saveSeasonTrends(DEFAULT_SEASON_TRENDS);
    if (!scopedCheck('ka_farm_price_alerts')) this.savePriceAlerts(DEFAULT_PRICE_ALERTS);

    // Bourse d'outils agricoles (2.6)
    if (!scopedCheck('ka_farm_tools_sharing')) this.saveToolsSharing(DEFAULT_TOOLS_SHARING);
    if (!scopedCheck('ka_farm_tool_rentals')) this.saveToolRentals(DEFAULT_TOOL_RENTALS);
    if (!scopedCheck('ka_farm_tool_favorites')) this.saveToolFavorites(DEFAULT_TOOL_FAVORITES);
    if (!scopedCheck('ka_farm_tool_reviews')) this.saveToolReviews(DEFAULT_TOOL_REVIEWS);

    // Commandes groupées d'intrants (2.7)
    if (!scopedCheck('ka_farm_farms_community')) this.saveFarmsCommunity(DEFAULT_FARMS_COMMUNITY);
    if (!scopedCheck('ka_farm_group_orders')) this.saveGroupOrders(DEFAULT_GROUP_ORDERS);
    if (!scopedCheck('ka_farm_group_order_items')) this.saveGroupOrderItems(DEFAULT_GROUP_ORDER_ITEMS);

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
    } catch (e) {
      ErrorHandler.log(e, `Storage.write: ${key}`);
    }
  },

  remove(key) {
    try {
      const scopedKey = this.getScopedKey(key);
      localStorage.removeItem(scopedKey);
    } catch (e) {
      ErrorHandler.log(e, `Storage.remove: ${key}`);
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
  },

  // Compost Materials
  getCompostMaterials() {
    return this.get('ka_farm_compost_materials', DEFAULT_COMPOST_MATERIALS);
  },
  saveCompostMaterials(materials) {
    this.set('ka_farm_compost_materials', materials);
  },
  addCompostMaterial(material) {
    const materials = this.getCompostMaterials();
    materials.push(material);
    this.saveCompostMaterials(materials);
    return material;
  },
  updateCompostMaterial(id, updates) {
    const materials = this.getCompostMaterials();
    const index = materials.findIndex(m => m.id === id);
    if (index !== -1) {
      materials[index] = { ...materials[index], ...updates };
      this.saveCompostMaterials(materials);
      return materials[index];
    }
    return null;
  },
  deleteCompostMaterial(id) {
    const materials = this.getCompostMaterials();
    const filtered = materials.filter(m => m.id !== id);
    this.saveCompostMaterials(filtered);
    return filtered;
  },
  getCompostMaterialById(id) {
    const materials = this.getCompostMaterials();
    return materials.find(m => m.id === id);
  },

  // Compost Recipes
  getCompostRecipes() {
    return this.get('ka_farm_compost_recipes', DEFAULT_COMPOST_RECIPES);
  },
  saveCompostRecipes(recipes) {
    this.set('ka_farm_compost_recipes', recipes);
  },
  addCompostRecipe(recipe) {
    const recipes = this.getCompostRecipes();
    recipes.push(recipe);
    this.saveCompostRecipes(recipes);
    return recipe;
  },
  updateCompostRecipe(id, updates) {
    const recipes = this.getCompostRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1) {
      recipes[index] = { ...recipes[index], ...updates };
      this.saveCompostRecipes(recipes);
      return recipes[index];
    }
    return null;
  },
  deleteCompostRecipe(id) {
    const recipes = this.getCompostRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    this.saveCompostRecipes(filtered);
    return filtered;
  },
  getCompostRecipeById(id) {
    const recipes = this.getCompostRecipes();
    return recipes.find(r => r.id === id);
  },

  // Recipe Ingredients
  getRecipeIngredients() {
    return this.get('ka_farm_recipe_ingredients', DEFAULT_RECIPE_INGREDIENTS);
  },
  saveRecipeIngredients(ingredients) {
    this.set('ka_farm_recipe_ingredients', ingredients);
  },
  addRecipeIngredient(ingredient) {
    const ingredients = this.getRecipeIngredients();
    ingredients.push(ingredient);
    this.saveRecipeIngredients(ingredients);
    return ingredient;
  },
  deleteRecipeIngredient(id) {
    const ingredients = this.getRecipeIngredients();
    const filtered = ingredients.filter(i => i.id !== id);
    this.saveRecipeIngredients(filtered);
    return filtered;
  },
  getIngredientsByRecipe(recipeId) {
    const ingredients = this.getRecipeIngredients();
    return ingredients.filter(i => i.recipe_id === recipeId);
  },
  getIngredientsByMaterial(materialId) {
    const ingredients = this.getRecipeIngredients();
    return ingredients.filter(i => i.material_id === materialId);
  },

  // Compost History
  getCompostHistory() {
    return this.get('ka_farm_compost_history', DEFAULT_COMPOST_HISTORY);
  },
  saveCompostHistory(history) {
    this.set('ka_farm_compost_history', history);
  },
  addCompostHistory(record) {
    const history = this.getCompostHistory();
    history.push(record);
    this.saveCompostHistory(history);
    return record;
  },
  updateCompostHistory(id, updates) {
    const history = this.getCompostHistory();
    const index = history.findIndex(h => h.id === id);
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      this.saveCompostHistory(history);
      return history[index];
    }
    return null;
  },
  deleteCompostHistory(id) {
    const history = this.getCompostHistory();
    const filtered = history.filter(h => h.id !== id);
    this.saveCompostHistory(filtered);
    return filtered;
  },
  getCompostHistoryByRecipe(recipeId) {
    const history = this.getCompostHistory();
    return history.filter(h => h.recipe_id === recipeId);
  },
  getCurrentComposting() {
    const history = this.getCompostHistory();
    return history.filter(h => h.status === 'En cours' && !h.end_date);
  },
  getCompletedComposting() {
    const history = this.getCompostHistory();
    return history.filter(h => h.status === 'Terminé' && h.end_date);
  },

  // Compost calculation helper methods
  calculateCNRatio(materialsUsed) {
    const materials = this.getCompostMaterials();
    let totalCarbon = 0;
    let totalNitrogen = 0;
    
    for (const [materialId, quantity] of Object.entries(materialsUsed)) {
      const material = materials.find(m => m.id === materialId);
      if (material) {
        totalCarbon += material.carbon_ratio * quantity;
        totalNitrogen += material.nitrogen_ratio * quantity;
      }
    }
    
    return totalNitrogen > 0 ? totalCarbon / totalNitrogen : 0;
  },

  // Get recommendations for improving C:N ratio
  getCNRatioRecommendations(currentRatio, targetRatio = 30) {
    const recommendations = [];
    
    if (currentRatio < targetRatio * 0.8) {
      // Need more carbon
      recommendations.push({
        type: 'add_carbon',
        message: 'Ajouter des matériaux riches en carbone (paille, feuilles sèches, coquilles)',
        priority: 'haute'
      });
    } else if (currentRatio > targetRatio * 1.2) {
      // Need more nitrogen
      recommendations.push({
        type: 'add_nitrogen',
        message: 'Ajouter des matériaux riches en azote (fumier, fientes, tonte de gazon)',
        priority: 'haute'
      });
    }
    
    if (currentRatio < 20) {
      recommendations.push({
        type: 'warning',
        message: 'Ratio trop bas - Risque de pourriture et d\'odeurs',
        priority: 'critique'
      });
    } else if (currentRatio > 50) {
      recommendations.push({
        type: 'warning',
        message: 'Ratio trop élevé - Décomposition très lente',
        priority: 'critique'
      });
    }
    
    return recommendations;
  },

  // Calculate ideal mix for target C:N ratio
  calculateIdealMix(targetRatio = 30) {
    const materials = this.getCompostMaterials();
    const greens = materials.filter(m => m.material_type === 'Fumier' || m.material_type === 'Résidus verts' || m.material_type === 'Déchets de cuisine');
    const browns = materials.filter(m => m.material_type === 'Résidus végétaux' || m.material_type === 'Sous-produit agricole');
    
    // Calculate average C:N ratios
    const avgGreenRatio = greens.length > 0 ? greens.reduce((sum, m) => sum + m.c_n_ratio, 0) / greens.length : 15;
    const avgBrownRatio = browns.length > 0 ? browns.reduce((sum, m) => sum + m.c_n_ratio, 0) / browns.length : 40;
    
    // Calculate mix ratio
    // Formula: (green_ratio * green_qty + brown_ratio * brown_qty) / (green_n * green_qty + brown_n * brown_qty) = target
    // For simplicity, use ratio based on typical values
    const greenN = 2; // average nitrogen for greens
    const brownC = 40; // average carbon for browns
    
    const greenProp = (targetRatio * greenN) / (targetRatio * greenN + brownC);
    const brownProp = 1 - greenProp;
    
    return {
      greenProportion: Math.round(greenProp * 100),
      brownProportion: Math.round(brownProp * 100),
      greenRatio: avgGreenRatio,
      brownRatio: avgBrownRatio,
      explanation: `Pour obtenir un ratio C:N de ${targetRatio}:1, mélanger environ ${Math.round(greenProp * 100)}% de matériaux verts (ratio ~${Math.round(avgGreenRatio)}:1) avec ${Math.round(brownProp * 100)}% de matériaux bruns (ratio ~${Math.round(avgBrownRatio)}:1)`
    };
  },

  // Get compost statistics
  getCompostStats() {
    const history = this.getCompostHistory();
    const totalQuantity = history.reduce((sum, h) => sum + (h.quantity_produced_kg || 0), 0);
    const completed = history.filter(h => h.status === 'Terminé');
    const inProgress = history.filter(h => h.status === 'En cours');
    const avgCNRatio = completed.length > 0 ? completed.reduce((sum, h) => sum + (h.c_n_ratio_achieved || 0), 0) / completed.length : 0;
    
    return {
      totalBatches: history.length,
      totalQuantity: Math.round(totalQuantity),
      completedBatches: completed.length,
      inProgressBatches: inProgress.length,
      avgCNRatio: Math.round(avgCNRatio * 10) / 10,
      avgMaturationDays: completed.length > 0 ? Math.round(completed.reduce((sum, h) => {
        if (h.start_date && h.end_date) {
          return sum + daysBetween(h.start_date, h.end_date);
        }
        return sum;
      }, 0) / completed.length) : 0
    };
  },

  // Transport Rates (2.4 - Simulateur de marge brute)
  getTransportRates() {
    return this.get('ka_farm_transport_rates', DEFAULT_TRANSPORT_RATES);
  },
  saveTransportRates(rates) {
    this.set('ka_farm_transport_rates', rates);
  },
  addTransportRate(rate) {
    const rates = this.getTransportRates();
    rates.push(rate);
    this.saveTransportRates(rates);
    return rate;
  },
  updateTransportRate(id, updates) {
    const rates = this.getTransportRates();
    const index = rates.findIndex(r => r.id === id);
    if (index !== -1) {
      rates[index] = { ...rates[index], ...updates };
      this.saveTransportRates(rates);
      return rates[index];
    }
    return null;
  },
  deleteTransportRate(id) {
    const rates = this.getTransportRates();
    const filtered = rates.filter(r => r.id !== id);
    this.saveTransportRates(filtered);
    return filtered;
  },
  getTransportRateById(id) {
    const rates = this.getTransportRates();
    return rates.find(r => r.id === id);
  },
  getTransportRatesByRoute(fromRegion, toRegion) {
    const rates = this.getTransportRates();
    return rates.filter(r => r.region_from === fromRegion && r.region_to === toRegion);
  },
  calculateTransportCost(quantityKg, fromRegion, toRegion, vehicleType = 'Camion') {
    const rates = this.getTransportRatesByRoute(fromRegion, toRegion);
    if (rates.length === 0) return 0;
    
    const rate = rates.find(r => r.vehicle_type === vehicleType) || rates[0];
    const tons = quantityKg / 1000;
    return Math.round(tons * rate.rate_per_ton_fcfa + rate.distance_km * rate.rate_per_km_fcfa);
  },

  // Margin Simulations (2.4 - Simulateur de marge brute)
  getMarginSimulations() {
    return this.get('ka_farm_margin_simulations', DEFAULT_MARGIN_SIMULATIONS);
  },
  saveMarginSimulations(simulations) {
    this.set('ka_farm_margin_simulations', simulations);
  },
  addMarginSimulation(simulation) {
    const simulations = this.getMarginSimulations();
    simulations.push(simulation);
    this.saveMarginSimulations(simulations);
    return simulation;
  },
  updateMarginSimulation(id, updates) {
    const simulations = this.getMarginSimulations();
    const index = simulations.findIndex(s => s.id === id);
    if (index !== -1) {
      simulations[index] = { ...simulations[index], ...updates };
      this.saveMarginSimulations(simulations);
      return simulations[index];
    }
    return null;
  },
  deleteMarginSimulation(id) {
    const simulations = this.getMarginSimulations();
    const filtered = simulations.filter(s => s.id !== id);
    this.saveMarginSimulations(filtered);
    return filtered;
  },
  getMarginSimulationById(id) {
    const simulations = this.getMarginSimulations();
    return simulations.find(s => s.id === id);
  },
  calculateNetMargin(sellingPricePerKg, quantityKg, transportCost, otherCosts = 0) {
    const grossRevenue = sellingPricePerKg * quantityKg;
    const totalCosts = transportCost + otherCosts;
    const netRevenue = grossRevenue - totalCosts;
    const marginPercent = grossRevenue > 0 ? (netRevenue / grossRevenue) * 100 : 0;
    
    return {
      grossRevenue,
      netRevenue,
      marginPercent: Math.round(marginPercent * 100) / 100,
      totalCosts
    };
  },
  getMarginStats() {
    const simulations = this.getMarginSimulations();
    const totalSimulations = simulations.length;
    const totalRevenue = simulations.reduce((sum, s) => sum + (s.gross_revenue_fcfa || 0), 0);
    const totalNetRevenue = simulations.reduce((sum, s) => sum + (s.net_revenue_fcfa || 0), 0);
    const avgMarginPercent = totalSimulations > 0 ? simulations.reduce((sum, s) => sum + (s.margin_percent || 0), 0) / totalSimulations : 0;
    
    return {
      totalSimulations,
      totalRevenue,
      totalNetRevenue,
      avgMarginPercent: Math.round(avgMarginPercent * 100) / 100
    };
  },

  // Market Prices (2.5 - Prix du marché et tendances saisonnières)
  getMarketPrices() {
    return this.get('ka_farm_market_prices', DEFAULT_MARKET_PRICES);
  },
  saveMarketPrices(prices) {
    this.set('ka_farm_market_prices', prices);
  },
  addMarketPrice(price) {
    const prices = this.getMarketPrices();
    prices.push(price);
    this.saveMarketPrices(prices);
    return price;
  },
  updateMarketPrice(id, updates) {
    const prices = this.getMarketPrices();
    const index = prices.findIndex(p => p.id === id);
    if (index !== -1) {
      prices[index] = { ...prices[index], ...updates };
      this.saveMarketPrices(prices);
      return prices[index];
    }
    return null;
  },
  deleteMarketPrice(id) {
    const prices = this.getMarketPrices();
    const filtered = prices.filter(p => p.id !== id);
    this.saveMarketPrices(filtered);
    return filtered;
  },
  getMarketPriceById(id) {
    const prices = this.getMarketPrices();
    return prices.find(p => p.id === id);
  },
  getMarketPricesByCrop(cropName) {
    const prices = this.getMarketPrices();
    return prices.filter(p => p.crop_name === cropName);
  },
  getMarketPricesByRegion(region) {
    const prices = this.getMarketPrices();
    return prices.filter(p => p.region === region);
  },
  getLatestPrice(cropName, marketName) {
    const prices = this.getMarketPrices();
    const filtered = prices.filter(p => p.crop_name === cropName && p.market_name === marketName);
    if (filtered.length === 0) return null;
    return filtered.reduce((latest, p) => new Date(p.price_date) > new Date(latest.price_date) ? p : latest, filtered[0]);
  },
  getPriceTrend(cropName, days = 30) {
    const prices = this.getMarketPrices();
    const cropPrices = prices.filter(p => p.crop_name === cropName);
    const recentPrices = cropPrices.filter(p => {
      const priceDate = new Date(p.price_date);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return priceDate >= cutoffDate;
    });
    if (recentPrices.length < 2) return { direction: 'Stable', change: 0 };
    
    const sorted = [...recentPrices].sort((a, b) => new Date(a.price_date) - new Date(b.price_date));
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const change = newest.price_fcfa - oldest.price_fcfa;
    const direction = change > 0 ? 'Hausse' : change < 0 ? 'Baisse' : 'Stable';
    
    return { direction, change, changePercent: Math.round((change / oldest.price_fcfa) * 10000) / 100 };
  },

  // Season Trends (2.5 - Prix du marché et tendances saisonnières)
  getSeasonTrends() {
    return this.get('ka_farm_season_trends', DEFAULT_SEASON_TRENDS);
  },
  saveSeasonTrends(trends) {
    this.set('ka_farm_season_trends', trends);
  },
  addSeasonTrend(trend) {
    const trends = this.getSeasonTrends();
    trends.push(trend);
    this.saveSeasonTrends(trends);
    return trend;
  },
  updateSeasonTrend(id, updates) {
    const trends = this.getSeasonTrends();
    const index = trends.findIndex(t => t.id === id);
    if (index !== -1) {
      trends[index] = { ...trends[index], ...updates };
      this.saveSeasonTrends(trends);
      return trends[index];
    }
    return null;
  },
  deleteSeasonTrend(id) {
    const trends = this.getSeasonTrends();
    const filtered = trends.filter(t => t.id !== id);
    this.saveSeasonTrends(filtered);
    return filtered;
  },
  getSeasonTrendById(id) {
    const trends = this.getSeasonTrends();
    return trends.find(t => t.id === id);
  },
  getSeasonTrendsByCrop(cropName) {
    const trends = this.getSeasonTrends();
    return trends.filter(t => t.crop_name === cropName);
  },
  getSeasonTrendsByRegion(region) {
    const trends = this.getSeasonTrends();
    return trends.filter(t => t.region === region);
  },
  getSeasonTrendsBySeason(season) {
    const trends = this.getSeasonTrends();
    return trends.filter(t => t.season === season);
  },

  // Price Alerts (2.5 - Prix du marché et tendances saisonnières)
  getPriceAlerts() {
    return this.get('ka_farm_price_alerts', DEFAULT_PRICE_ALERTS);
  },
  savePriceAlerts(alerts) {
    this.set('ka_farm_price_alerts', alerts);
  },
  addPriceAlert(alert) {
    const alerts = this.getPriceAlerts();
    alerts.push(alert);
    this.savePriceAlerts(alerts);
    return alert;
  },
  updatePriceAlert(id, updates) {
    const alerts = this.getPriceAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...updates };
      this.savePriceAlerts(alerts);
      return alerts[index];
    }
    return null;
  },
  deletePriceAlert(id) {
    const alerts = this.getPriceAlerts();
    const filtered = alerts.filter(a => a.id !== id);
    this.savePriceAlerts(filtered);
    return filtered;
  },
  getPriceAlertById(id) {
    const alerts = this.getPriceAlerts();
    return alerts.find(a => a.id === id);
  },
  getActivePriceAlerts() {
    const alerts = this.getPriceAlerts();
    return alerts.filter(a => a.is_active && !a.acknowledged);
  },
  getPriceAlertsByCrop(cropName) {
    const alerts = this.getPriceAlerts();
    return alerts.filter(a => a.crop_name === cropName);
  },
  acknowledgePriceAlert(id, userName) {
    const alerts = this.getPriceAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index] = {
        ...alerts[index],
        acknowledged: true,
        acknowledged_by: userName,
        acknowledged_at: new Date().toISOString()
      };
      this.savePriceAlerts(alerts);
      return alerts[index];
    }
    return null;
  },
  checkPriceAlerts(currentPrices) {
    const alerts = this.getPriceAlerts();
    const triggeredAlerts = [];
    
    alerts.forEach(alert => {
      if (!alert.is_active || alert.acknowledged) return;
      
      const matchingPrice = currentPrices.find(p => 
        p.crop_name === alert.crop_name && p.market_name === alert.market_name
      );
      
      if (matchingPrice) {
        let triggered = false;
        if (alert.alert_type === 'Haut' && matchingPrice.price_fcfa >= alert.threshold_price) {
          triggered = true;
        } else if (alert.alert_type === 'Bas' && matchingPrice.price_fcfa <= alert.threshold_price) {
          triggered = true;
        }
        
        if (triggered) {
          const updatedAlert = this.updatePriceAlert(alert.id, {
            trigger_date: new Date().toISOString(),
            current_price: matchingPrice.price_fcfa
          });
          triggeredAlerts.push(updatedAlert);
        }
      }
    });
    
    return triggeredAlerts;
  },

  // Tools Sharing (2.6 - Bourse d'outils agricoles)
  getToolsSharing() {
    return this.get('ka_farm_tools_sharing', DEFAULT_TOOLS_SHARING);
  },
  saveToolsSharing(tools) {
    this.set('ka_farm_tools_sharing', tools);
  },
  addToolSharing(tool) {
    const tools = this.getToolsSharing();
    tools.push(tool);
    this.saveToolsSharing(tools);
    return tool;
  },
  updateToolSharing(id, updates) {
    const tools = this.getToolsSharing();
    const index = tools.findIndex(t => t.id === id);
    if (index !== -1) {
      tools[index] = { ...tools[index], ...updates };
      this.saveToolsSharing(tools);
      return tools[index];
    }
    return null;
  },
  deleteToolSharing(id) {
    const tools = this.getToolsSharing();
    const filtered = tools.filter(t => t.id !== id);
    this.saveToolsSharing(filtered);
    return filtered;
  },
  getToolSharingById(id) {
    const tools = this.getToolsSharing();
    return tools.find(t => t.id === id);
  },
  getToolsByRegion(region) {
    const tools = this.getToolsSharing();
    return tools.filter(t => t.region === region);
  },
  getToolsByType(toolType) {
    const tools = this.getToolsSharing();
    return tools.filter(t => t.tool_type === toolType);
  },
  getAvailableTools() {
    const tools = this.getToolsSharing();
    return tools.filter(t => t.is_available);
  },
  getVerifiedTools() {
    const tools = this.getToolsSharing();
    return tools.filter(t => t.is_verified);
  },
  searchTools(query) {
    const tools = this.getToolsSharing();
    const q = query.toLowerCase();
    return tools.filter(t => 
      t.tool_name.toLowerCase().includes(q) ||
      t.tool_type.toLowerCase().includes(q) ||
      t.owner_farm_name.toLowerCase().includes(q) ||
      t.region.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  },
  toggleToolAvailability(id) {
    const tools = this.getToolsSharing();
    const index = tools.findIndex(t => t.id === id);
    if (index !== -1) {
      tools[index] = { ...tools[index], is_available: !tools[index].is_available };
      this.saveToolsSharing(tools);
      return tools[index];
    }
    return null;
  },

  // Tool Rentals (2.6 - Bourse d'outils agricoles)
  getToolRentals() {
    return this.get('ka_farm_tool_rentals', DEFAULT_TOOL_RENTALS);
  },
  saveToolRentals(rentals) {
    this.set('ka_farm_tool_rentals', rentals);
  },
  addToolRental(rental) {
    const rentals = this.getToolRentals();
    rentals.push(rental);
    this.saveToolRentals(rentals);
    return rental;
  },
  updateToolRental(id, updates) {
    const rentals = this.getToolRentals();
    const index = rentals.findIndex(r => r.id === id);
    if (index !== -1) {
      rentals[index] = { ...rentals[index], ...updates };
      this.saveToolRentals(rentals);
      return rentals[index];
    }
    return null;
  },
  deleteToolRental(id) {
    const rentals = this.getToolRentals();
    const filtered = rentals.filter(r => r.id !== id);
    this.saveToolRentals(filtered);
    return filtered;
  },
  getToolRentalById(id) {
    const rentals = this.getToolRentals();
    return rentals.find(r => r.id === id);
  },
  getRentalsByTool(toolId) {
    const rentals = this.getToolRentals();
    return rentals.filter(r => r.tool_id === toolId);
  },
  getRentalsByRenter(renterFarmId) {
    const rentals = this.getToolRentals();
    return rentals.filter(r => r.renter_farm_id === renterFarmId);
  },
  getActiveRentals() {
    const rentals = this.getToolRentals();
    const now = new Date();
    return rentals.filter(r => {
      const endDate = new Date(r.rental_end);
      return endDate >= now && r.status !== 'Annulée' && r.status !== 'Terminée';
    });
  },
  getRentalHistory(toolId) {
    const rentals = this.getToolRentals();
    return rentals.filter(r => r.tool_id === toolId).sort((a, b) => new Date(b.rental_start) - new Date(a.rental_start));
  },

  // Tool Favorites (2.6 - Bourse d'outils agricoles)
  getToolFavorites() {
    return this.get('ka_farm_tool_favorites', DEFAULT_TOOL_FAVORITES);
  },
  saveToolFavorites(favorites) {
    this.set('ka_farm_tool_favorites', favorites);
  },
  addToolFavorite(favorite) {
    const favorites = this.getToolFavorites();
    // Check if already favorited
    const existing = favorites.find(f => f.farm_id === favorite.farm_id && f.tool_id === favorite.tool_id);
    if (!existing) {
      favorites.push(favorite);
      this.saveToolFavorites(favorites);
    }
    return favorite;
  },
  removeToolFavorite(farmId, toolId) {
    const favorites = this.getToolFavorites();
    const filtered = favorites.filter(f => !(f.farm_id === farmId && f.tool_id === toolId));
    this.saveToolFavorites(filtered);
    return filtered;
  },
  getFavoritesByFarm(farmId) {
    const favorites = this.getToolFavorites();
    return favorites.filter(f => f.farm_id === farmId);
  },
  isToolFavorited(farmId, toolId) {
    const favorites = this.getToolFavorites();
    return favorites.some(f => f.farm_id === farmId && f.tool_id === toolId);
  },

  // Tool Reviews (2.6 - Bourse d'outils agricoles)
  getToolReviews() {
    return this.get('ka_farm_tool_reviews', DEFAULT_TOOL_REVIEWS);
  },
  saveToolReviews(reviews) {
    this.set('ka_farm_tool_reviews', reviews);
  },
  addToolReview(review) {
    const reviews = this.getToolReviews();
    reviews.push(review);
    this.saveToolReviews(reviews);
    return review;
  },
  updateToolReview(id, updates) {
    const reviews = this.getToolReviews();
    const index = reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      reviews[index] = { ...reviews[index], ...updates };
      this.saveToolReviews(reviews);
      return reviews[index];
    }
    return null;
  },
  deleteToolReview(id) {
    const reviews = this.getToolReviews();
    const filtered = reviews.filter(r => r.id !== id);
    this.saveToolReviews(filtered);
    return filtered;
  },
  getToolReviewsByTool(toolId) {
    const reviews = this.getToolReviews();
    return reviews.filter(r => r.tool_id === toolId);
  },
  getAverageToolRating(toolId) {
    const reviews = this.getToolReviewsByTool(toolId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  },
  getToolReviewCount(toolId) {
    const reviews = this.getToolReviewsByTool(toolId);
    return reviews.length;
  },

  // Group Orders (2.7 - Commandes groupées d'intrants)
  getGroupOrders() {
    return this.get('ka_farm_group_orders', DEFAULT_GROUP_ORDERS);
  },
  saveGroupOrders(orders) {
    this.set('ka_farm_group_orders', orders);
  },
  addGroupOrder(order) {
    const orders = this.getGroupOrders();
    orders.push(order);
    this.saveGroupOrders(orders);
    return order;
  },
  updateGroupOrder(id, updates) {
    const orders = this.getGroupOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      this.saveGroupOrders(orders);
      return orders[index];
    }
    return null;
  },
  deleteGroupOrder(id) {
    const orders = this.getGroupOrders();
    const filtered = orders.filter(o => o.id !== id);
    this.saveGroupOrders(filtered);
    return filtered;
  },
  getGroupOrderById(id) {
    const orders = this.getGroupOrders();
    return orders.find(o => o.id === id);
  },
  getGroupOrdersByRegion(region) {
    const orders = this.getGroupOrders();
    return orders.filter(o => o.region === region);
  },
  getGroupOrdersByStatus(status) {
    const orders = this.getGroupOrders();
    return orders.filter(o => o.status === status);
  },
  getActiveGroupOrders() {
    const orders = this.getGroupOrders();
    return orders.filter(o => o.status === 'En cours' || o.status === 'Confirmée');
  },
  getGroupOrderStats() {
    const orders = this.getGroupOrders();
    const total = orders.length;
    const active = this.getActiveGroupOrders().length;
    const delivered = orders.filter(o => o.status === 'Livré').length;
    const totalAmount = orders.reduce((sum, o) => sum + (o.total_amount_fcfa || 0), 0);
    return { total, active, delivered, totalAmount };
  },

  // Group Order Items (2.7 - Commandes groupées d'intrants)
  getGroupOrderItems() {
    return this.get('ka_farm_group_order_items', DEFAULT_GROUP_ORDER_ITEMS);
  },
  saveGroupOrderItems(items) {
    this.set('ka_farm_group_order_items', items);
  },
  addGroupOrderItem(item) {
    const items = this.getGroupOrderItems();
    items.push(item);
    this.saveGroupOrderItems(items);
    return item;
  },
  updateGroupOrderItem(id, updates) {
    const items = this.getGroupOrderItems();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.saveGroupOrderItems(items);
      return items[index];
    }
    return null;
  },
  deleteGroupOrderItem(id) {
    const items = this.getGroupOrderItems();
    const filtered = items.filter(i => i.id !== id);
    this.saveGroupOrderItems(filtered);
    return filtered;
  },
  getGroupOrderItemsByOrder(orderId) {
    const items = this.getGroupOrderItems();
    return items.filter(i => i.group_order_id === orderId);
  },
  getGroupOrderItemsByFarm(farmId) {
    const items = this.getGroupOrderItems();
    return items.filter(i => i.farm_id === farmId);
  },
  getGroupOrderItemsByStatus(orderId, delivered) {
    const items = this.getGroupOrderItems();
    return items.filter(i => i.group_order_id === orderId && i.delivery_received === delivered);
  },
  markItemAsReceived(itemId, quantity) {
    const items = this.getGroupOrderItems();
    const index = items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        delivery_received: true,
        received_quantity: quantity || items[index].quantity,
        updated_at: new Date().toISOString()
      };
      this.saveGroupOrderItems(items);
      return items[index];
    }
    return null;
  },

  // Farms Community (2.7 - Commandes groupées d'intrants)
  getFarmsCommunity() {
    return this.get('ka_farm_farms_community', DEFAULT_FARMS_COMMUNITY);
  },
  saveFarmsCommunity(farms) {
    this.set('ka_farm_farms_community', farms);
  },
  addFarmToCommunity(farm) {
    const farms = this.getFarmsCommunity();
    farms.push(farm);
    this.saveFarmsCommunity(farms);
    return farm;
  },
  updateFarmInCommunity(id, updates) {
    const farms = this.getFarmsCommunity();
    const index = farms.findIndex(f => f.id === id);
    if (index !== -1) {
      farms[index] = { ...farms[index], ...updates };
      this.saveFarmsCommunity(farms);
      return farms[index];
    }
    return null;
  },
  deleteFarmFromCommunity(id) {
    const farms = this.getFarmsCommunity();
    const filtered = farms.filter(f => f.id !== id);
    this.saveFarmsCommunity(filtered);
    return filtered;
  },
  getFarmById(id) {
    const farms = this.getFarmsCommunity();
    return farms.find(f => f.id === id);
  },
  getFarmsByRegion(region) {
    const farms = this.getFarmsCommunity();
    return farms.filter(f => f.region === region);
  },
  getActiveFarms() {
    const farms = this.getFarmsCommunity();
    return farms.filter(f => f.is_active);
  },
  getFarmsWithOrders() {
    const farms = this.getFarmsCommunity();
    return farms.filter(f => f.last_order_date);
  },
  getCommunityStats() {
    const farms = this.getFarmsCommunity();
    const total = farms.length;
    const active = farms.filter(f => f.is_active).length;
    const withOrders = farms.filter(f => f.last_order_date).length;
    return { total, active, withOrders };
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

// Compostage Organique - Données par défaut
const DEFAULT_COMPOST_MATERIALS = [
  {
    id: 'CM-001',
    name: 'Fumier de Vache',
    material_type: 'Fumier',
    carbon_ratio: 25,
    nitrogen_ratio: 1.5,
    c_n_ratio: 16.7,
    moisture_content: 60,
    unit: 'kg',
    description: 'Fumier de vache fraîchement produit. Riche en azote et matière organique. Nécessite un compostage prolongé.',
    is_common_in_senegal: true,
    notes: 'Disponible localement dans les fermes d\'élevage. Peut contenir des graines de mauvaises herbes.'
  },
  {
    id: 'CM-002',
    name: 'Fumier de Cheval',
    material_type: 'Fumier',
    carbon_ratio: 28,
    nitrogen_ratio: 1.2,
    c_n_ratio: 23.3,
    moisture_content: 55,
    unit: 'kg',
    description: 'Fumier de cheval avec paille. Bonne structure pour l\'aération du tas de compost.',
    is_common_in_senegal: true,
    notes: 'Séchage recommandé avant compostage pour réduire le volume.'
  },
  {
    id: 'CM-003',
    name: 'Fumier de Mouton',
    material_type: 'Fumier',
    carbon_ratio: 30,
    nitrogen_ratio: 1.8,
    c_n_ratio: 16.7,
    moisture_content: 50,
    unit: 'kg',
    description: 'Fumier de mouton compact et riche en nutriments. Excellente source d\'azote.',
    is_common_in_senegal: true,
    notes: 'Très utilisé au Sénégal pour les cultures maraîchères.'
  },
  {
    id: 'CM-004',
    name: 'Fumier de Poulet (Fientes)',
    material_type: 'Fumier',
    carbon_ratio: 15,
    nitrogen_ratio: 3.5,
    c_n_ratio: 4.3,
    moisture_content: 70,
    unit: 'kg',
    description: 'Fientes de volaille très riches en azote et phosphore. À utiliser avec précaution (risque de brûlures).',
    is_common_in_senegal: true,
    notes: 'Doit être bien composté avant utilisation. Ne jamais utiliser frais.'
  },
  {
    id: 'CM-005',
    name: 'Résidus de Récolte (Tiges de Maïs)',
    material_type: 'Résidus végétaux',
    carbon_ratio: 40,
    nitrogen_ratio: 0.8,
    c_n_ratio: 50,
    moisture_content: 15,
    unit: 'kg',
    description: 'Tiges et feuilles de maïs après récolte. Riche en carbone, pauvre en azote.',
    is_common_in_senegal: true,
    notes: 'Idéal pour équilibrer les matériaux riches en azote.'
  },
  {
    id: 'CM-006',
    name: 'Paille de Riz',
    material_type: 'Résidus végétaux',
    carbon_ratio: 45,
    nitrogen_ratio: 0.5,
    c_n_ratio: 90,
    moisture_content: 10,
    unit: 'kg',
    description: 'Paille de riz légère et riche en silice. Excellente pour l\'aération.',
    is_common_in_senegal: true,
    notes: 'Disponible en grande quantité dans la région de Saint-Louis.'
  },
  {
    id: 'CM-007',
    name: 'Feuilles Sèches',
    material_type: 'Résidus végétaux',
    carbon_ratio: 35,
    nitrogen_ratio: 1.0,
    c_n_ratio: 35,
    moisture_content: 10,
    unit: 'kg',
    description: 'Feuilles d\'arbres et arbustes. Décomposition rapide si broyées.',
    is_common_in_senegal: true,
    notes: 'Collecte facile en saison sèche dans les zones boisées.'
  },
  {
    id: 'CM-008',
    name: 'Tontes de Gazons',
    material_type: 'Résidus verts',
    carbon_ratio: 20,
    nitrogen_ratio: 2.5,
    c_n_ratio: 8,
    moisture_content: 80,
    unit: 'kg',
    description: 'Herbe fraîchement coupée. Riche en azote mais peut former des boules.',
    is_common_in_senegal: true,
    notes: 'À mélanger avec des matériaux secs pour éviter le tassement.'
  },
  {
    id: 'CM-009',
    name: 'Mauvaises Herbes (sans graines)',
    material_type: 'Résidus verts',
    carbon_ratio: 22,
    nitrogen_ratio: 2.0,
    c_n_ratio: 11,
    moisture_content: 75,
    unit: 'kg',
    description: 'Mauvaises herbes coupées avant montaison en graines. Riche en nutriments.',
    is_common_in_senegal: true,
    notes: 'Attention à ne pas utiliser si les plantes ont des graines.'
  },
  {
    id: 'CM-010',
    name: 'Épluchures de Légumes',
    material_type: 'Déchets de cuisine',
    carbon_ratio: 15,
    nitrogen_ratio: 2.0,
    c_n_ratio: 7.5,
    moisture_content: 90,
    unit: 'kg',
    description: 'Épluchures de carottes, oignons, choux, etc. Décomposition très rapide.',
    is_common_in_senegal: true,
    notes: 'À ajouter en petites quantités pour éviter les odeurs.'
  },
  {
    id: 'CM-011',
    name: 'Coquilles d\'Arachide',
    material_type: 'Résidus de récolte',
    carbon_ratio: 45,
    nitrogen_ratio: 0.5,
    c_n_ratio: 90,
    moisture_content: 10,
    unit: 'kg',
    description: 'Coquilles d\'arachide après extraction des graines. Très riches en carbone.',
    is_common_in_senegal: true,
    notes: 'Utilisées comme paillage ou dans le compost pour améliorer la structure.'
  },
  {
    id: 'CM-012',
    name: 'Cendres de Bois',
    material_type: 'Minéral',
    carbon_ratio: 0,
    nitrogen_ratio: 0,
    c_n_ratio: 0,
    moisture_content: 5,
    unit: 'kg',
    description: 'Cendres de bois non traité. Riche en potassium et calcium.',
    is_common_in_senegal: true,
    notes: 'À utiliser avec modération (max 5% du volume). Alkalinise le compost.'
  },
  {
    id: 'CM-013',
    name: 'Tourteau d\'Arachide',
    material_type: 'Sous-produit agricole',
    carbon_ratio: 20,
    nitrogen_ratio: 4.0,
    c_n_ratio: 5,
    moisture_content: 10,
    unit: 'kg',
    description: 'Résidu de l\'extraction de l\'huile d\'arachide. Très riche en azote.',
    is_common_in_senegal: true,
    notes: 'À utiliser en petites quantités. Peut contenir des aflatoxines.'
  },
  {
    id: 'CM-014',
    name: 'Son de Mil',
    material_type: 'Sous-produit agricole',
    carbon_ratio: 25,
    nitrogen_ratio: 1.5,
    c_n_ratio: 16.7,
    moisture_content: 12,
    unit: 'kg',
    description: 'Enveloppe du mil après décorticage. Bonne source de carbone et fibres.',
    is_common_in_senegal: true,
    notes: 'Disponible en grande quantité après la récolte du mil.'
  },
  {
    id: 'CM-015',
    name: 'Bouse de Vache Séchée',
    material_type: 'Fumier',
    carbon_ratio: 30,
    nitrogen_ratio: 1.2,
    c_n_ratio: 25,
    moisture_content: 20,
    unit: 'kg',
    description: 'Fumier de vache séché au soleil. Plus concentré que le fumier frais.',
    is_common_in_senegal: true,
    notes: 'Utilisé comme amendement organique ou dans les recettes de compost.'
  }
];

const DEFAULT_COMPOST_RECIPES = [
  {
    id: 'CR-001',
    name: 'Recette Classique 3 Couches',
    description: 'Recette traditionnelle en couches alternées de matériaux verts et bruns. Idéale pour les débutants.',
    target_c_n_ratio: 30,
    ideal_moisture: 60,
    ideal_temperature_min: 40,
    ideal_temperature_max: 60,
    maturation_days: 90,
    notes: 'Ratio recommandé : 2 parties de matériaux bruns pour 1 partie de matériaux verts.'
  },
  {
    id: 'CR-002',
    name: 'Recette Rapide pour Maraîchage',
    description: 'Recette optimisée pour une décomposition rapide. Parfaite pour les cultures intensives.',
    target_c_n_ratio: 25,
    ideal_moisture: 65,
    ideal_temperature_min: 45,
    ideal_temperature_max: 65,
    maturation_days: 60,
    notes: 'Nécessite un retournement fréquent du tas pour maintenir la température.'
  },
  {
    id: 'CR-003',
    name: 'Recette pour Sol Appauvri',
    description: 'Recette enrichie en nutriments pour revitaliser les sols épuisés.',
    target_c_n_ratio: 20,
    ideal_moisture: 55,
    ideal_temperature_min: 40,
    ideal_temperature_max: 55,
    maturation_days: 120,
    notes: 'Contient une forte proportion de fumier animal et de cendres.'
  },
  {
    id: 'CR-004',
    name: 'Recette Économique Local',
    description: 'Recette utilisant des matériaux facilement disponibles au Sénégal.',
    target_c_n_ratio: 35,
    ideal_moisture: 50,
    ideal_temperature_min: 35,
    ideal_temperature_max: 50,
    maturation_days: 180,
    notes: 'Utilise principalement fumier de mouton, paille de riz et résidus de récolte.'
  },
  {
    id: 'CR-005',
    name: 'Recette Bio-Intensive',
    description: 'Recette optimisée pour une production maximale de compost de haute qualité.',
    target_c_n_ratio: 28,
    ideal_moisture: 62,
    ideal_temperature_min: 50,
    ideal_temperature_max: 70,
    maturation_days: 45,
    notes: 'Nécessite une gestion précise de l\'humidité et de l\'aération.'
  }
];

const DEFAULT_RECIPE_INGREDIENTS = [
  // Recette Classique 3 Couches
  { id: 'RI-001', recipe_id: 'CR-001', material_id: 'CM-005', quantity: 100, unit: 'kg', proportion_percent: 30, notes: 'Base carbone' },
  { id: 'RI-002', recipe_id: 'CR-001', material_id: 'CM-006', quantity: 50, unit: 'kg', proportion_percent: 15, notes: 'Aération' },
  { id: 'RI-003', recipe_id: 'CR-001', material_id: 'CM-001', quantity: 50, unit: 'kg', proportion_percent: 15, notes: 'Source azote' },
  { id: 'RI-004', recipe_id: 'CR-001', material_id: 'CM-008', quantity: 40, unit: 'kg', proportion_percent: 12, notes: 'Matériau vert' },
  { id: 'RI-005', recipe_id: 'CR-001', material_id: 'CM-012', quantity: 5, unit: 'kg', proportion_percent: 1.5, notes: 'Minéraux' },
  
  // Recette Rapide pour Maraîchage
  { id: 'RI-006', recipe_id: 'CR-002', material_id: 'CM-003', quantity: 60, unit: 'kg', proportion_percent: 30, notes: 'Fumier de mouton - riche en azote' },
  { id: 'RI-007', recipe_id: 'CR-002', material_id: 'CM-007', quantity: 40, unit: 'kg', proportion_percent: 20, notes: 'Feuilles sèches - carbone' },
  { id: 'RI-008', recipe_id: 'CR-002', material_id: 'CM-009', quantity: 50, unit: 'kg', proportion_percent: 25, notes: 'Mauvaises herbes - azote' },
  { id: 'RI-009', recipe_id: 'CR-002', material_id: 'CM-010', quantity: 30, unit: 'kg', proportion_percent: 15, notes: 'Épluchures - activation' },
  { id: 'RI-010', recipe_id: 'CR-002', material_id: 'CM-012', quantity: 3, unit: 'kg', proportion_percent: 1.5, notes: 'Cendres - minéraux' },
  
  // Recette pour Sol Appauvri
  { id: 'RI-011', recipe_id: 'CR-003', material_id: 'CM-001', quantity: 80, unit: 'kg', proportion_percent: 40, notes: 'Fumier de vache' },
  { id: 'RI-012', recipe_id: 'CR-003', material_id: 'CM-002', quantity: 50, unit: 'kg', proportion_percent: 25, notes: 'Fumier de cheval' },
  { id: 'RI-013', recipe_id: 'CR-003', material_id: 'CM-013', quantity: 20, unit: 'kg', proportion_percent: 10, notes: 'Tourteau d\'arachide - azote' },
  { id: 'RI-014', recipe_id: 'CR-003', material_id: 'CM-012', quantity: 10, unit: 'kg', proportion_percent: 5, notes: 'Cendres - potassium' },
  { id: 'RI-015', recipe_id: 'CR-003', material_id: 'CM-005', quantity: 40, unit: 'kg', proportion_percent: 20, notes: 'Tiges de maïs - carbone' },
  
  // Recette Économique Local
  { id: 'RI-016', recipe_id: 'CR-004', material_id: 'CM-003', quantity: 100, unit: 'kg', proportion_percent: 50, notes: 'Fumier de mouton - base' },
  { id: 'RI-017', recipe_id: 'CR-004', material_id: 'CM-006', quantity: 60, unit: 'kg', proportion_percent: 30, notes: 'Paille de riz - carbone' },
  { id: 'RI-018', recipe_id: 'CR-004', material_id: 'CM-014', quantity: 40, unit: 'kg', proportion_percent: 20, notes: 'Son de mil - fibres' },
  
  // Recette Bio-Intensive
  { id: 'RI-019', recipe_id: 'CR-005', material_id: 'CM-004', quantity: 30, unit: 'kg', proportion_percent: 15, notes: 'Fientes de poulet - azote concentré' },
  { id: 'RI-020', recipe_id: 'CR-005', material_id: 'CM-009', quantity: 60, unit: 'kg', proportion_percent: 30, notes: 'Mauvaises herbes - matière verte' },
  { id: 'RI-021', recipe_id: 'CR-005', material_id: 'CM-007', quantity: 50, unit: 'kg', proportion_percent: 25, notes: 'Feuilles sèches - carbone' },
  { id: 'RI-022', recipe_id: 'CR-005', material_id: 'CM-010', quantity: 40, unit: 'kg', proportion_percent: 20, notes: 'Épluchures - activation microbienne' },
  { id: 'RI-023', recipe_id: 'CR-005', material_id: 'CM-015', quantity: 20, unit: 'kg', proportion_percent: 10, notes: 'Bouse séchée - équilibre' }
];

const DEFAULT_COMPOST_HISTORY = [
  {
    id: 'CH-001',
    recipe_id: 'CR-001',
    start_date: '2026-05-01',
    end_date: '2026-07-30',
    quantity_produced_kg: 500,
    materials_used: {
      'CM-005': 100,
      'CM-006': 50,
      'CM-001': 50,
      'CM-008': 40,
      'CM-012': 5
    },
    c_n_ratio_achieved: 28.5,
    status: 'Terminé',
    notes: 'Premier tas de compost de la saison. Bonne décomposition. Utilisé sur la parcelle des tomates.'
  },
  {
    id: 'CH-002',
    recipe_id: 'CR-002',
    start_date: '2026-06-15',
    end_date: '2026-08-15',
    quantity_produced_kg: 300,
    materials_used: {
      'CM-003': 60,
      'CM-007': 40,
      'CM-009': 50,
      'CM-010': 30,
      'CM-012': 3
    },
    c_n_ratio_achieved: 24.8,
    status: 'Terminé',
    notes: 'Compost rapide pour la pépinière de poivrons. Très bonne qualité.'
  },
  {
    id: 'CH-003',
    recipe_id: 'CR-004',
    start_date: '2026-07-01',
    end_date: null,
    quantity_produced_kg: 0,
    materials_used: {
      'CM-003': 100,
      'CM-006': 60,
      'CM-014': 40
    },
    c_n_ratio_achieved: 32,
    status: 'En cours',
    notes: 'Tas en cours de maturation. Retourne tous les 15 jours.'
  }
];

// Tarifs de Transport - Données par défaut
const DEFAULT_TRANSPORT_RATES = [
  {
    id: 'TR-001',
    region_from: 'Niayes',
    region_to: 'Dakar',
    vehicle_type: 'Camion',
    rate_per_ton_fcfa: 25000,
    rate_per_km_fcfa: 150,
    distance_km: 50,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: 'Tarif standard pour livraison à Dakar depuis les Niayes'
  },
  {
    id: 'TR-002',
    region_from: 'Niayes',
    region_to: 'Thiès',
    vehicle_type: 'Camion',
    rate_per_ton_fcfa: 18000,
    rate_per_km_fcfa: 120,
    distance_km: 30,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: 'Tarif pour livraison à Thiès'
  },
  {
    id: 'TR-003',
    region_from: 'Niayes',
    region_to: 'Saint-Louis',
    vehicle_type: 'Camion',
    rate_per_ton_fcfa: 35000,
    rate_per_km_fcfa: 200,
    distance_km: 120,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: 'Tarif pour livraison à Saint-Louis'
  },
  {
    id: 'TR-004',
    region_from: 'Niayes',
    region_to: 'Kaolack',
    vehicle_type: 'Camion',
    rate_per_ton_fcfa: 30000,
    rate_per_km_fcfa: 180,
    distance_km: 80,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: 'Tarif pour livraison à Kaolack'
  },
  {
    id: 'TR-005',
    region_from: 'Niayes',
    region_to: 'Mbour',
    vehicle_type: 'Camion',
    rate_per_ton_fcfa: 20000,
    rate_per_km_fcfa: 140,
    distance_km: 40,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: 'Tarif pour livraison à Mbour (Petite Côte)'
  },
  {
    id: 'TR-006',
    region_from: 'Dakar',
    region_to: 'Thiès',
    vehicle_type: 'Camion',
    rate_per_ton_fcfa: 15000,
    rate_per_km_fcfa: 100,
    distance_km: 70,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: 'Tarif pour transport entre Dakar et Thiès'
  }
];

// Simulations de Marge - Données par défaut
const DEFAULT_MARGIN_SIMULATIONS = [
  {
    id: 'MS-001',
    harvest_id: 'H-001',
    crop_name: 'Tomate Mongal F1',
    quantity_kg: 5000,
    selling_price_per_kg_fcfa: 650,
    destination_region: 'Dakar',
    transport_cost_fcfa: 125000,
    other_costs_fcfa: 50000,
    gross_revenue_fcfa: 3250000,
    net_revenue_fcfa: 3075000,
    margin_percent: 94.62,
    simulation_date: '2026-06-25T10:00:00.000Z',
    notes: 'Vente sur marché de Sandika - bon prix cette saison'
  },
  {
    id: 'MS-002',
    harvest_id: 'H-002',
    crop_name: 'Oignon Rouge de Galmi',
    quantity_kg: 8000,
    selling_price_per_kg_fcfa: 500,
    destination_region: 'Mbour',
    transport_cost_fcfa: 80000,
    other_costs_fcfa: 30000,
    gross_revenue_fcfa: 4000000,
    net_revenue_fcfa: 3900000,
    margin_percent: 97.5,
    simulation_date: '2026-06-20T14:30:00.000Z',
    notes: 'Vente directe à un grossiste local - transport moins cher'
  },
  {
    id: 'MS-003',
    harvest_id: 'H-003',
    crop_name: 'Piment Oiseau',
    quantity_kg: 1500,
    selling_price_per_kg_fcfa: 1200,
    destination_region: 'Dakar',
    transport_cost_fcfa: 50000,
    other_costs_fcfa: 20000,
    gross_revenue_fcfa: 1800000,
    net_revenue_fcfa: 1730000,
    margin_percent: 96.11,
    simulation_date: '2026-06-28T09:00:00.000Z',
    notes: 'Piment de haute qualité - prix élevé sur le marché'
  }
];

// Prix du Marché - Données par défaut (2.5)
const DEFAULT_MARKET_PRICES = [
  {
    id: 'MP-001',
    market_name: 'Marché Sandika',
    crop_name: 'Tomate Mongal F1',
    price_fcfa: 650,
    price_date: '2026-07-10',
    region: 'Dakar',
    unit: 'kg',
    price_source: 'SIM',
    is_estimated: false,
    season: 'Hivernage',
    supply_level: 'Normale',
    demand_level: 'Élevée',
    notes: 'Prix stable, bonne demande'
  },
  {
    id: 'MP-002',
    market_name: 'Marché Tilène',
    crop_name: 'Oignon Rouge de Galmi',
    price_fcfa: 500,
    price_date: '2026-07-10',
    region: 'Niayes',
    unit: 'kg',
    price_source: 'SIM',
    is_estimated: false,
    season: 'Hivernage',
    supply_level: 'Normale',
    demand_level: 'Normale',
    notes: 'Prix moyen de la saison'
  },
  {
    id: 'MP-003',
    market_name: 'Marché de Mbour',
    crop_name: 'Chou Cabus',
    price_fcfa: 250,
    price_date: '2026-07-10',
    region: 'Mbour',
    unit: 'kg',
    price_source: 'SIM',
    is_estimated: false,
    season: 'Hivernage',
    supply_level: 'Faible',
    demand_level: 'Élevée',
    notes: 'Prix en hausse, offre limitée'
  },
  {
    id: 'MP-004',
    market_name: 'Marché de Thiès',
    crop_name: 'Menthe de Thiès',
    price_fcfa: 1200,
    price_date: '2026-07-10',
    region: 'Thiès',
    unit: 'kg',
    price_source: 'SIM',
    is_estimated: false,
    season: 'Hivernage',
    supply_level: 'Normale',
    demand_level: 'Élevée',
    notes: 'Prix premium pour qualité locale'
  },
  {
    id: 'MP-005',
    market_name: 'Marché HLM',
    crop_name: 'Piment Oiseau',
    price_fcfa: 1200,
    price_date: '2026-07-10',
    region: 'Dakar',
    unit: 'kg',
    price_source: 'SIM',
    is_estimated: false,
    season: 'Hivernage',
    supply_level: 'Normale',
    demand_level: 'Élevée',
    notes: 'Piment très demandé'
  },
  {
    id: 'MP-006',
    market_name: 'Marché de Kaolack',
    crop_name: 'Aubergine',
    price_fcfa: 400,
    price_date: '2026-07-10',
    region: 'Kaolack',
    unit: 'kg',
    price_source: 'SIM',
    is_estimated: false,
    season: 'Hivernage',
    supply_level: 'Normale',
    demand_level: 'Normale',
    notes: 'Prix standard'
  }
];

// Tendances Saisonnières - Données par défaut (2.5)
const DEFAULT_SEASON_TRENDS = [
  {
    id: 'ST-001',
    region: 'Niayes',
    crop_name: 'Tomate',
    season: 'Hivernage',
    avg_price: 600,
    min_price: 450,
    max_price: 800,
    std_deviation: 75,
    trend_direction: 'Hausse',
    trend_strength: 0.8,
    prediction_next_month: 675,
    confidence_percent: 85,
    data_points: 24,
    last_updated: '2026-07-10',
    notes: 'Tendance haussière due à la demande croissante'
  },
  {
    id: 'ST-002',
    region: 'Dakar',
    crop_name: 'Oignon',
    season: 'Hivernage',
    avg_price: 525,
    min_price: 400,
    max_price: 650,
    std_deviation: 50,
    trend_direction: 'Stable',
    trend_strength: 0.3,
    prediction_next_month: 530,
    confidence_percent: 90,
    data_points: 30,
    last_updated: '2026-07-10',
    notes: 'Prix stable avec légère tendance à la hausse'
  },
  {
    id: 'ST-003',
    region: 'Thiès',
    crop_name: 'Menthe',
    season: 'Hivernage',
    avg_price: 1150,
    min_price: 1000,
    max_price: 1300,
    std_deviation: 80,
    trend_direction: 'Hausse',
    trend_strength: 0.9,
    prediction_next_month: 1220,
    confidence_percent: 88,
    data_points: 18,
    last_updated: '2026-07-10',
    notes: 'Fort potentiel de hausse pour les aromates'
  },
  {
    id: 'ST-004',
    region: 'Mbour',
    crop_name: 'Chou',
    season: 'Hivernage',
    avg_price: 275,
    min_price: 200,
    max_price: 350,
    std_deviation: 40,
    trend_direction: 'Baisse',
    trend_strength: 0.5,
    prediction_next_month: 260,
    confidence_percent: 80,
    data_points: 20,
    last_updated: '2026-07-10',
    notes: 'Légère baisse attendue après la saison des pluies'
  }
];

// Alertes de Prix - Données par défaut (2.5)
const DEFAULT_PRICE_ALERTS = [
  {
    id: 'PA-001',
    market_name: 'Marché Sandika',
    crop_name: 'Tomate Mongal F1',
    alert_type: 'Haut',
    threshold_price: 700,
    current_price: 650,
    trigger_date: null,
    message: 'Le prix de la tomate a dépassé 700 FCFA/kg sur le marché Sandika',
    is_active: true,
    acknowledged: false,
    acknowledged_by: '',
    acknowledged_at: null,
    notes: 'Alerte pour vente opportunité'
  },
  {
    id: 'PA-002',
    market_name: 'Marché Tilène',
    crop_name: 'Oignon Rouge de Galmi',
    alert_type: 'Bas',
    threshold_price: 450,
    current_price: 500,
    trigger_date: null,
    message: 'Le prix de l\'oignon est tombé en dessous de 450 FCFA/kg sur le marché Tilène',
    is_active: true,
    acknowledged: false,
    acknowledged_by: '',
    acknowledged_at: null,
    notes: 'Alerte pour achat opportunité'
  },
  {
    id: 'PA-003',
    market_name: 'Marché de Mbour',
    crop_name: 'Chou Cabus',
    alert_type: 'Haut',
    threshold_price: 300,
    current_price: 250,
    trigger_date: null,
    message: 'Le prix du chou a dépassé 300 FCFA/kg sur le marché de Mbour',
    is_active: true,
    acknowledged: false,
    acknowledged_by: '',
    acknowledged_at: null,
    notes: 'Alerte pour vente'
  }
];

// Bourse d'Outils Agricoles - Données par défaut (2.6)
const DEFAULT_TOOLS_SHARING = [
  {
    id: 'TS-001',
    tool_name: 'Motopompe Honda 5.5 CV',
    tool_type: 'Irrigation',
    brand: 'Honda',
    model: 'EU20i',
    purchase_year: 2023,
    condition: 'Bon état',
    description: 'Motopompe portable pour arrosage des parcelles. Débit: 60m3/h, Hauteur manométrique: 45m',
    daily_rental_price_fcfa: 15000,
    hourly_rental_price_fcfa: 2000,
    minimum_rental_hours: 4,
    is_available: true,
    owner_farm_id: 'FARM-001',
    owner_farm_name: 'Fermes KA - Niayes',
    owner_contact_name: 'Moussa KA',
    owner_phone: '77 123 45 67',
    owner_location: 'Zone Maraîchère de Pout, Niayes',
    owner_lat: 14.7932,
    owner_lng: -17.2654,
    region: 'Niayes',
    usage_instructions: 'Vérifier le niveau d\'huile avant utilisation. Ne pas faire fonctionner à vide.',
    maintenance_requirements: 'Vidange toutes les 100 heures. Nettoyage du filtre à air régulièrement.',
    insurance_required: false,
    deposit_required: 50000,
    total_rentals: 12,
    rating: 4.8,
    is_verified: true,
    photos: ['/assets/tools/motopompe-1.jpg', '/assets/tools/motopompe-2.jpg'],
    notes: 'Disponible toute la saison. Livraison possible sur demande.'
  },
  {
    id: 'TS-002',
    tool_name: 'Charrette à Bœufs - Grande',
    tool_type: 'Transport',
    brand: 'Artisanal',
    model: 'Traditionnelle renforcée',
    purchase_year: 2022,
    condition: 'Excellent',
    description: 'Charrette solide pour transport de récoltes ou fumier. Capacité: 2 tonnes',
    daily_rental_price_fcfa: 8000,
    hourly_rental_price_fcfa: 0,
    minimum_rental_hours: 1,
    is_available: true,
    owner_farm_id: 'FARM-002',
    owner_farm_name: 'Ferme Diop - Thiès',
    owner_contact_name: 'Aly Diop',
    owner_phone: '76 456 78 90',
    owner_location: 'Keur Massar, Thiès',
    owner_lat: 14.7856,
    owner_lng: -17.2543,
    region: 'Thiès',
    usage_instructions: 'Ne pas surcharger. Lubrifier les roues avant utilisation.',
    maintenance_requirements: 'Vérifier les roues et l\'attelage régulièrement.',
    insurance_required: false,
    deposit_required: 20000,
    total_rentals: 8,
    rating: 4.5,
    is_verified: true,
    photos: ['/assets/tools/charrette-1.jpg'],
    notes: 'Idéal pour le transport sur terrain irrégulier.'
  },
  {
    id: 'TS-003',
    tool_name: 'Pulvérisateur à Dos 16L',
    tool_type: 'Traitement',
    brand: 'Solo',
    model: '425',
    purchase_year: 2024,
    condition: 'Neuf',
    description: 'Pulvérisateur manuel pour traitements phytosanitaires. Capacité: 16 litres',
    daily_rental_price_fcfa: 5000,
    hourly_rental_price_fcfa: 1000,
    minimum_rental_hours: 2,
    is_available: true,
    owner_farm_id: 'FARM-003',
    owner_farm_name: 'Ferme Sow - Mbour',
    owner_contact_name: 'Fatou Sow',
    owner_phone: '77 789 01 23',
    owner_location: 'Somet, Mbour',
    owner_lat: 14.4567,
    owner_lng: -17.0123,
    region: 'Mbour',
    usage_instructions: 'Porter des équipements de protection. Bien rincer après utilisation.',
    maintenance_requirements: 'Nettoyage complet après chaque utilisation.',
    insurance_required: false,
    deposit_required: 15000,
    total_rentals: 15,
    rating: 4.9,
    is_verified: true,
    photos: ['/assets/tools/pulverisateur-1.jpg', '/assets/tools/pulverisateur-2.jpg'],
    notes: 'Parfait pour les petits traitements ciblés.'
  },
  {
    id: 'TS-004',
    tool_name: 'Moto Broyeur de Branches',
    tool_type: 'Entretien',
    brand: 'Stihl',
    model: 'GHE 150',
    purchase_year: 2023,
    condition: 'Bon état',
    description: 'Broyeur thermique pour branches jusqu\'à 5cm de diamètre',
    daily_rental_price_fcfa: 25000,
    hourly_rental_price_fcfa: 4000,
    minimum_rental_hours: 4,
    is_available: true,
    owner_farm_id: 'FARM-004',
    owner_farm_name: 'Ferme Ndiaye - Kaolack',
    owner_contact_name: 'Ibrahima Ndiaye',
    owner_phone: '70 123 45 67',
    owner_location: 'Ndande, Kaolack',
    owner_lat: 14.1500,
    owner_lng: -16.0833,
    region: 'Kaolack',
    usage_instructions: 'Porter casque et protection auditive. Ne pas broyer de matériaux métalliques.',
    maintenance_requirements: 'Affûtage des lames après 20 heures d\'utilisation.',
    insurance_required: true,
    deposit_required: 100000,
    total_rentals: 5,
    rating: 4.7,
    is_verified: true,
    photos: ['/assets/tools/broyeur-1.jpg', '/assets/tools/broyeur-2.jpg'],
    notes: 'Matériel professionnel. Formation obligatoire avant première utilisation.'
  },
  {
    id: 'TS-005',
    tool_name: 'Bêche Large',
    tool_type: 'Labour',
    brand: 'Artisanal',
    model: 'Standard',
    purchase_year: 2022,
    condition: 'Bon état',
    description: 'Bêche en acier pour travail du sol manuel',
    daily_rental_price_fcfa: 2000,
    hourly_rental_price_fcfa: 500,
    minimum_rental_hours: 1,
    is_available: true,
    owner_farm_id: 'FARM-005',
    owner_farm_name: 'Ferme Fall - Fatick',
    owner_contact_name: 'Modou Fall',
    owner_phone: '77 234 56 78',
    owner_location: 'Fimela, Fatick',
    owner_lat: 14.3333,
    owner_lng: -16.4000,
    region: 'Fatick',
    usage_instructions: 'Affûter régulièrement pour un travail efficace.',
    maintenance_requirements: 'Nettoyer et sécher après utilisation pour éviter la rouille.',
    insurance_required: false,
    deposit_required: 5000,
    total_rentals: 25,
    rating: 4.6,
    is_verified: true,
    photos: ['/assets/tools/beche-1.jpg'],
    notes: 'Outils de base disponible en quantité.'
  },
  {
    id: 'TS-006',
    tool_name: 'Sarcloir à Roue',
    tool_type: 'Désherbage',
    brand: 'Gardena',
    model: 'CombiSystem',
    purchase_year: 2023,
    condition: 'Très bon état',
    description: 'Sarcloir manuel à roue pour désherbage entre les rangs',
    daily_rental_price_fcfa: 3000,
    hourly_rental_price_fcfa: 0,
    minimum_rental_hours: 1,
    is_available: true,
    owner_farm_id: 'FARM-001',
    owner_farm_name: 'Fermes KA - Niayes',
    owner_contact_name: 'Moussa KA',
    owner_phone: '77 123 45 67',
    owner_location: 'Zone Maraîchère de Pout, Niayes',
    owner_lat: 14.7932,
    owner_lng: -17.2654,
    region: 'Niayes',
    usage_instructions: 'Régler la hauteur de travail selon la culture.',
    maintenance_requirements: 'Lubrifier les parties mobiles régulièrement.',
    insurance_required: false,
    deposit_required: 10000,
    total_rentals: 18,
    rating: 4.8,
    is_verified: true,
    photos: ['/assets/tools/sarcloir-1.jpg'],
    notes: 'Idéal pour l\'entretien des cultures en ligne.'
  }
];

// Locations d'Outils - Données par défaut (2.6)
const DEFAULT_TOOL_RENTALS = [
  {
    id: 'TR-001',
    tool_id: 'TS-001',
    renter_farm_id: 'FARM-006',
    renter_farm_name: 'Ferme Ba - Dakar',
    renter_contact_name: 'Ousmane Ba',
    renter_phone: '76 543 21 09',
    rental_start: '2026-07-15T08:00:00.000Z',
    rental_end: '2026-07-15T18:00:00.000Z',
    total_hours: 10,
    daily_rate: 15000,
    total_amount_fcfa: 25000,
    deposit_paid_fcfa: 50000,
    balance_due_fcfa: 0,
    payment_status: 'Payé',
    pickup_location: 'Zone Maraîchère de Pout, Niayes',
    return_location: 'Zone Maraîchère de Pout, Niayes',
    actual_return: '2026-07-15T17:30:00.000Z',
    condition_on_return: 'Bon état',
    damage_noted: '',
    damage_cost: 0,
    status: 'Terminée',
    cancellation_reason: '',
    notes: 'Location pour arrosage d\'urgence. Retour anticipé.'
  },
  {
    id: 'TR-002',
    tool_id: 'TS-003',
    renter_farm_id: 'FARM-007',
    renter_farm_name: 'Ferme Diallo - Saint-Louis',
    renter_contact_name: 'Amadou Diallo',
    renter_phone: '70 654 32 10',
    rental_start: '2026-07-12T09:00:00.000Z',
    rental_end: '2026-07-13T17:00:00.000Z',
    total_hours: 30,
    daily_rate: 5000,
    total_amount_fcfa: 30000,
    deposit_paid_fcfa: 15000,
    balance_due_fcfa: 0,
    payment_status: 'Payé',
    pickup_location: 'Somet, Mbour',
    return_location: 'Somet, Mbour',
    actual_return: '2026-07-13T16:00:00.000Z',
    condition_on_return: 'Bon état',
    damage_noted: '',
    damage_cost: 0,
    status: 'Terminée',
    cancellation_reason: '',
    notes: 'Traitement phytosanitaire sur culture de tomates.'
  },
  {
    id: 'TR-003',
    tool_id: 'TS-002',
    renter_farm_id: 'FARM-008',
    renter_farm_name: 'Ferme Wane - Thiès',
    renter_contact_name: 'Pape Wane',
    renter_phone: '77 345 67 89',
    rental_start: '2026-07-10T07:00:00.000Z',
    rental_end: '2026-07-10T19:00:00.000Z',
    total_hours: 12,
    daily_rate: 8000,
    total_amount_fcfa: 8000,
    deposit_paid_fcfa: 20000,
    balance_due_fcfa: 0,
    payment_status: 'Payé',
    pickup_location: 'Keur Massar, Thiès',
    return_location: 'Keur Massar, Thiès',
    actual_return: '2026-07-10T18:30:00.000Z',
    condition_on_return: 'Bon état',
    damage_noted: '',
    damage_cost: 0,
    status: 'Terminée',
    cancellation_reason: '',
    notes: 'Transport de fumier pour fertilisation.'
  }
];

// Favoris Outils - Données par défaut (2.6)
const DEFAULT_TOOL_FAVORITES = [
  {
    id: 'TF-001',
    farm_id: 'FARM-006',
    tool_id: 'TS-001'
  },
  {
    id: 'TF-002',
    farm_id: 'FARM-007',
    tool_id: 'TS-003'
  },
  {
    id: 'TF-003',
    farm_id: 'FARM-006',
    tool_id: 'TS-006'
  }
];

// Avis Outils - Données par défaut (2.6)
const DEFAULT_TOOL_REVIEWS = [
  {
    id: 'TRV-001',
    rental_id: 'TR-001',
    tool_id: 'TS-001',
    renter_farm_id: 'FARM-006',
    rating: 5,
    review_text: 'Excellent équipement, très fiable pour l\'arrosage. Le propriétaire est très professionnel.',
    would_rent_again: true,
    created_at: '2026-07-16T10:00:00.000Z'
  },
  {
    id: 'TRV-002',
    rental_id: 'TR-002',
    tool_id: 'TS-003',
    renter_farm_id: 'FARM-007',
    rating: 4,
    review_text: 'Bon pulvérisateur, mais aurait besoin d\'un entretien (buse légèrement obstruée).',
    would_rent_again: true,
    created_at: '2026-07-14T09:00:00.000Z'
  },
  {
    id: 'TRV-003',
    rental_id: 'TR-003',
    tool_id: 'TS-002',
    renter_farm_id: 'FARM-008',
    rating: 5,
    review_text: 'Charrette solide et bien entretenue. Parfaite pour le transport sur nos chemins de terre.',
    would_rent_again: true,
    created_at: '2026-07-11T08:00:00.000Z'
  }
];

// Fermes Communauté - Données par défaut (2.7)
const DEFAULT_FARMS_COMMUNITY = [
  {
    id: 'FC-001',
    farm_name: 'Fermes KA - Niayes',
    region: 'Niayes',
    contact_name: 'Moussa KA',
    contact_phone: '77 123 45 67',
    contact_email: 'moussa@kafarm.sn',
    location: 'Zone Maraîchère de Pout',
    is_active: true,
    last_order_date: '2026-07-10',
    notes: 'Ferme principale, leader du groupe'
  },
  {
    id: 'FC-002',
    farm_name: 'Ferme Diop - Thiès',
    region: 'Thiès',
    contact_name: 'Aly Diop',
    contact_phone: '76 456 78 90',
    contact_email: 'aly.diop@agri.sn',
    location: 'Keur Massar',
    is_active: true,
    last_order_date: '2026-07-10',
    notes: 'Spécialisée en cultures maraîchères'
  },
  {
    id: 'FC-003',
    farm_name: 'Ferme Sow - Mbour',
    region: 'Mbour',
    contact_name: 'Fatou Sow',
    contact_phone: '77 789 01 23',
    contact_email: 'fatou.sow@maraichage.sn',
    location: 'Somet',
    is_active: true,
    last_order_date: '2026-07-10',
    notes: 'Production intensive de tomates'
  },
  {
    id: 'FC-004',
    farm_name: 'Ferme Ndiaye - Kaolack',
    region: 'Kaolack',
    contact_name: 'Ibrahima Ndiaye',
    contact_phone: '70 123 45 67',
    contact_email: 'ibrahim.ndiaye@ferme.sn',
    location: 'Ndande',
    is_active: true,
    last_order_date: '2026-06-25',
    notes: 'Élevage et cultures associées'
  },
  {
    id: 'FC-005',
    farm_name: 'Ferme Ba - Dakar',
    region: 'Dakar',
    contact_name: 'Ousmane Ba',
    contact_phone: '76 543 21 09',
    contact_email: 'ousmane.ba@agri.sn',
    location: 'Sandika',
    is_active: true,
    last_order_date: '2026-07-05',
    notes: 'Commercialisation et logistique'
  },
  {
    id: 'FC-006',
    farm_name: 'Ferme Fall - Fatick',
    region: 'Fatick',
    contact_name: 'Modou Fall',
    contact_phone: '77 234 56 78',
    contact_email: 'modou.fall@maraichage.sn',
    location: 'Fimela',
    is_active: true,
    last_order_date: '2026-06-15',
    notes: 'Production diversifiée'
  }
];

// Commandes Groupées - Données par défaut (2.7)
const DEFAULT_GROUP_ORDERS = [
  {
    id: 'GO-001',
    group_name: 'Commande Groupée Niayes - Juillet',
    initiated_by: 'Moussa KA',
    supplier_id: 'SUP-001',
    supplier_name: 'Agro-Sénégal Fournisseur',
    status: 'En cours',
    total_amount_fcfa: 1500000,
    order_date: '2026-07-10',
    expected_delivery_date: '2026-07-20',
    delivery_address: 'Zone Maraîchère de Pout, Niayes',
    region: 'Niayes',
    notes: 'Commande d\'engrais et semences pour la saison d\'hivernage'
  },
  {
    id: 'GO-002',
    group_name: 'Commande Groupée Pesticides - Juin',
    initiated_by: 'Aly Diop',
    supplier_id: 'SUP-002',
    supplier_name: 'Phyto-Pro Sénégal',
    status: 'Livré',
    total_amount_fcfa: 850000,
    order_date: '2026-06-15',
    expected_delivery_date: '2026-06-25',
    delivery_address: 'Keur Massar, Thiès',
    region: 'Thiès',
    notes: 'Traitements phytosanitaires pour protection des cultures'
  },
  {
    id: 'GO-003',
    group_name: 'Commande Groupée Engrais Organique',
    initiated_by: 'Fatou Sow',
    supplier_id: 'SUP-003',
    supplier_name: 'Bio-Fertil Sénégal',
    status: 'Livré',
    total_amount_fcfa: 2200000,
    order_date: '2026-06-01',
    expected_delivery_date: '2026-06-10',
    delivery_address: 'Somet, Mbour',
    region: 'Mbour',
    notes: 'Compost et amendements organiques'
  }
];

// Détails des Commandes Groupées - Données par défaut (2.7)
const DEFAULT_GROUP_ORDER_ITEMS = [
  {
    id: 'GOI-001',
    group_order_id: 'GO-001',
    farm_id: 'FC-001',
    farm_name: 'Fermes KA - Niayes',
    intrant_id: 'IN-001',
    intrant_name: 'Engrais NPK 15-15-15',
    quantity: 50,
    unit: 'sacs',
    unit_price: 12000,
    total_price: 600000,
    delivery_received: true,
    received_quantity: 50,
    notes: 'Pour culture de tomates'
  },
  {
    id: 'GOI-002',
    group_order_id: 'GO-001',
    farm_id: 'FC-002',
    farm_name: 'Ferme Diop - Thiès',
    intrant_id: 'IN-001',
    intrant_name: 'Engrais NPK 15-15-15',
    quantity: 30,
    unit: 'sacs',
    unit_price: 12000,
    total_price: 360000,
    delivery_received: true,
    received_quantity: 30,
    notes: 'Pour culture d\'oignons'
  },
  {
    id: 'GOI-003',
    group_order_id: 'GO-001',
    farm_id: 'FC-003',
    farm_name: 'Ferme Sow - Mbour',
    intrant_id: 'IN-002',
    intrant_name: 'Semences Tomate Mongal F1',
    quantity: 10,
    unit: 'sachets',
    unit_price: 35000,
    total_price: 350000,
    delivery_received: true,
    received_quantity: 10,
    notes: 'Semences hybrides'
  },
  {
    id: 'GOI-004',
    group_order_id: 'GO-002',
    farm_id: 'FC-001',
    farm_name: 'Fermes KA - Niayes',
    intrant_id: 'IN-003',
    intrant_name: 'Purin de Neem',
    quantity: 20,
    unit: 'litres',
    unit_price: 2500,
    total_price: 50000,
    delivery_received: true,
    received_quantity: 20,
    notes: 'Traitement bio contre les insectes'
  },
  {
    id: 'GOI-005',
    group_order_id: 'GO-002',
    farm_id: 'FC-002',
    farm_name: 'Ferme Diop - Thiès',
    intrant_id: 'IN-004',
    intrant_name: 'Fongicide Systémique',
    quantity: 15,
    unit: 'litres',
    unit_price: 4000,
    total_price: 60000,
    delivery_received: true,
    received_quantity: 15,
    notes: 'Protection contre le mildiou'
  },
  {
    id: 'GOI-006',
    group_order_id: 'GO-003',
    farm_id: 'FC-003',
    farm_name: 'Ferme Sow - Mbour',
    intrant_id: 'IN-005',
    intrant_name: 'Compost Organique',
    quantity: 5,
    unit: 'tonnes',
    unit_price: 80000,
    total_price: 400000,
    delivery_received: true,
    received_quantity: 5,
    notes: 'Amendement du sol'
  },
  {
    id: 'GOI-007',
    group_order_id: 'GO-003',
    farm_id: 'FC-004',
    farm_name: 'Ferme Ndiaye - Kaolack',
    intrant_id: 'IN-005',
    intrant_name: 'Compost Organique',
    quantity: 3,
    unit: 'tonnes',
    unit_price: 80000,
    total_price: 240000,
    delivery_received: true,
    received_quantity: 3,
    notes: 'Fertilisation des parcelles'
  },
  {
    id: 'GOI-008',
    group_order_id: 'GO-003',
    farm_id: 'FC-005',
    farm_name: 'Ferme Ba - Dakar',
    intrant_id: 'IN-005',
    intrant_name: 'Compost Organique',
    quantity: 2,
    unit: 'tonnes',
    unit_price: 80000,
    total_price: 160000,
    delivery_received: false,
    received_quantity: 0,
    notes: 'En attente de livraison'
  }
];

