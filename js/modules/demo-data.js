// KA Farm - Module de données de démo
// Données réalistes pour une exploitation maraîchère/élevage sénégalaise

const seeds = [
  { id: 'S-001', name: 'Tomate Mongal F1', quantity: 200, unit: 'g', supplier: 'SENASP', date: '2026-06-01' },
  { id: 'S-002', name: 'Oignon de Galmi', quantity: 500, unit: 'g', supplier: 'SENASP', date: '2026-06-01' },
  { id: 'S-003', name: 'Piment Kounouchi', quantity: 150, unit: 'g', supplier: 'SENASP', date: '2026-06-01' },
  { id: 'S-004', name: 'Gombo NGAIMBA', quantity: 300, unit: 'g', supplier: 'ISRA', date: '2026-06-10' }
];

const products = [
  { id: 'PR-001', name: 'Tomate', category: 'Légume', unit: 'kg', minQuantity: 50, currentQuantity: 120 },
  { id: 'PR-002', name: 'Oignon', category: 'Légume', unit: 'kg', minQuantity: 30, currentQuantity: 85 },
  { id: 'PR-003', name: 'Piment', category: 'Légume', unit: 'kg', minQuantity: 20, currentQuantity: 45 },
  { id: 'PR-004', name: 'Gombo', category: 'Légume', unit: 'kg', minQuantity: 20, currentQuantity: 30 },
  { id: 'PR-005', name: 'Manioc', category: 'Racine', unit: 'kg', minQuantity: 100, currentQuantity: 200 }
];

const crops = [
  {
    id: 'C-001',
    name: 'Tomate Mongal F1',
    field: 'Planche A1',
    plantingDate: '2026-06-01',
    expectedHarvest: '2026-08-15',
    status: 'En croissance',
    variety: 'Mongal F1',
    cycleDays: 80
  },
  {
    id: 'C-002',
    name: 'Oignon de Galmi',
    field: 'Planche B2',
    plantingDate: '2026-06-10',
    expectedHarvest: '2026-09-20',
    status: 'En croissance',
    variety: 'Galmi',
    cycleDays: 90
  },
  {
    id: 'C-003',
    name: 'Piment Kounouchi',
    field: 'Planche C1',
    plantingDate: '2026-06-15',
    expectedHarvest: '2026-09-10',
    status: 'En croissance',
    variety: 'Kounouchi',
    cycleDays: 75
  },
  {
    id: 'C-004',
    name: 'Gombo Ngaïmba',
    field: 'Planche D1',
    plantingDate: '2026-06-20',
    expectedHarvest: '2026-08-30',
    status: 'En croissance',
    variety: 'Ngaïmba',
    cycleDays: 70
  },
  {
    id: 'C-005',
    name: 'Manioc local',
    field: 'Planche E1',
    plantingDate: '2026-05-15',
    expectedHarvest: '2026-12-15',
    status: 'En croissance',
    variety: 'Local',
    cycleDays: 210
  }
];

const parcelles = [
  {
    id: 'P-001',
    name: 'Planche A1 - Tomates',
    area: 0.5,
    crop: 'Tomate',
    status: 'Actif',
    soilType: 'Sableux',
    irrigationType: 'Goutte-à-goutte'
  },
  {
    id: 'P-002',
    name: 'Planche B2 - Oignons',
    area: 0.3,
    crop: 'Oignon',
    status: 'Actif',
    soilType: 'Sableux-limoneux',
    irrigationType: 'Goutte-à-goutte'
  },
  {
    id: 'P-003',
    name: 'Planche C1 - Piments',
    area: 0.2,
    crop: 'Piment',
    status: 'Actif',
    soilType: 'Sableux',
    irrigationType: 'Goutte-à-goutte'
  }
];

const tasks = [
  {
    id: 'T-101',
    title: 'Irrigation matin planche tomates',
    category: 'Irrigation',
    dueDate: '2026-07-05',
    assignee: 'Responsable terrain',
    priority: 'Haute',
    completed: false
  },
  {
    id: 'T-102',
    title: 'Sarclage planche oignons',
    category: 'Entretien',
    dueDate: '2026-07-06',
    assignee: 'Fatou',
    priority: 'Moyenne',
    completed: false
  },
  {
    id: 'T-103',
    title: 'Vérifier système goutte-à-goutte',
    category: 'Maintenance',
    dueDate: '2026-07-07',
    assignee: 'Responsable terrain',
    priority: 'Moyenne',
    completed: false
  },
  {
    id: 'T-104',
    title: 'Surveiller parasites piments',
    category: 'Phytosanitaire',
    dueDate: '2026-07-08',
    assignee: 'Mamadou',
    priority: 'Haute',
    completed: false
  },
  {
    id: 'T-105',
    title: 'Préparer pépinière gombo',
    category: 'Pépinière',
    dueDate: '2026-07-10',
    assignee: 'Fatou',
    priority: 'Basse',
    completed: true
  }
];

const finances = [
  {
    id: 'F-101',
    type: 'Dépense',
    category: 'Intrants',
    amount: 45000,
    description: 'Achat semences et engrais',
    date: '2026-06-01'
  },
  {
    id: 'F-102',
    type: 'Dépense',
    category: 'Main-d\'œuvre',
    amount: 35000,
    description: 'Salaires semaine 24',
    date: '2026-06-15'
  },
  {
    id: 'F-103',
    type: 'Revenu',
    category: 'Ventes',
    amount: 85000,
    description: 'Vente récolte tomates',
    date: '2026-06-20'
  },
  {
    id: 'F-104',
    type: 'Revenu',
    category: 'Ventes',
    amount: 120000,
    description: 'Vente oignons mars',
    date: '2026-06-28'
  },
  {
    id: 'F-105',
    type: 'Dépense',
    category: 'Eau',
    amount: 15000,
    description: 'Facture eau forage',
    date: '2026-06-30'
  }
];

const employees = [
  {
    id: 'E-101',
    name: 'Employé terrain',
    role: 'Chef d\'Exploitation',
    phone: '+221 77 123 45 67',
    status: 'Actif',
    hireDate: '2024-01-15'
  },
  {
    id: 'E-102',
    name: 'Fatou NDIAYE',
    role: 'Ouvrière Maraîchère',
    phone: '+221 76 987 65 43',
    status: 'Actif',
    hireDate: '2024-03-01'
  },
  {
    id: 'E-103',
    name: 'Mamadou BA',
    role: 'Technicien Irrigation',
    phone: '+221 78 456 78 90',
    status: 'Actif',
    hireDate: '2024-02-15'
  }
];

const elevage = [
  {
    id: 'LV-001',
    name: 'Poule 1',
    type: 'Poule',
    breed: 'Local',
    status: 'Active',
    lastCheckup: '2026-06-01',
    notes: ' Ponte normale'
  },
  {
    id: 'LV-002',
    name: 'Poule 2',
    type: 'Poule',
    breed: 'Local',
    status: 'Active',
    lastCheckup: '2026-06-01',
    notes: ' Ponte normale'
  },
  {
    id: 'LV-003',
    name: 'Poule 3',
    type: 'Poule',
    breed: 'Local',
    status: 'Active',
    lastCheckup: '2026-06-01',
    notes: ' Ponte normale'
  },
  {
    id: 'LV-004',
    name: 'Poule 4',
    type: 'Poule',
    breed: 'Local',
    status: 'Active',
    lastCheckup: '2026-06-01',
    notes: ' Ponte normale'
  },
  {
    id: 'LV-005',
    name: 'Poule 5',
    type: 'Poule',
    breed: 'Local',
    status: 'Surveiller',
    lastCheckup: '2026-06-10',
    notes: 'Léger rhume, surveillance'
  }
];

export const DEMO_DATA = {
  seeds,
  products,
  crops,
  parcelles,
  tasks,
  finances,
  employees,
  elevage
};

export const loadDemoData = (storage) => {
  storage.saveCrops(crops);
  storage.saveParcelles(parcelles);
  storage.saveTasks(tasks);
  storage.saveFinances(finances);
  storage.saveEmployees(employees);
  localStorage.setItem(storage.getScopedKey('ka_farm_cheptel'), JSON.stringify(elevage));
  localStorage.setItem(storage.getScopedKey('ka_farm_seeds'), JSON.stringify(seeds));
  localStorage.setItem(storage.getScopedKey('ka_farm_products'), JSON.stringify(products));
};

export const clearDemoData = (storage) => {
  storage.saveCrops([]);
  storage.saveParcelles([]);
  storage.saveTasks([]);
  storage.saveFinances([]);
  storage.saveEmployees([]);
  localStorage.setItem(storage.getScopedKey('ka_farm_cheptel'), JSON.stringify([]));
  localStorage.setItem(storage.getScopedKey('ka_farm_seeds'), JSON.stringify([]));
  localStorage.setItem(storage.getScopedKey('ka_farm_products'), JSON.stringify([]));
};
