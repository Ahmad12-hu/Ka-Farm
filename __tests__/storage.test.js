const { KAStorage } = require('../js/storage.js');

describe('KAStorage Module', function() {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('getCrops returns empty array when no crops stored', function() {
    const crops = KAStorage.getCrops();
    expect(crops).toEqual([]);
  });

  test('saveCrops and getCrops work correctly', function() {
    const testCrops = [
      { id: 'C-001', name: 'Tomate', field: 'Parcelle A' }
    ];
    
    KAStorage.saveCrops(testCrops);
    const retrieved = KAStorage.getCrops();
    
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe('C-001');
    expect(retrieved[0].name).toBe('Tomate');
  });

  test('getParcelles returns empty array when no parcelles stored', function() {
    const parcelles = KAStorage.getParcelles();
    expect(parcelles).toEqual([]);
  });

  test('saveParcelles and getParcelles work correctly', function() {
    const testParcelles = [
      { id: 'P-001', name: 'Parcelle Nord', surface: 120 }
    ];
    
    KAStorage.saveParcelles(testParcelles);
    const retrieved = KAStorage.getParcelles();
    
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe('P-001');
    expect(retrieved[0].surface).toBe(120);
  });

  test('getFinances returns empty array when no finances stored', function() {
    const finances = KAStorage.getFinances();
    expect(finances).toEqual([]);
  });

  test('saveFinances and getFinances work correctly', function() {
    const testFinances = [
      { id: 'F-001', description: 'Vente tomates', type: 'Revenu', amount: 50000 }
    ];
    
    KAStorage.saveFinances(testFinances);
    const retrieved = KAStorage.getFinances();
    
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].amount).toBe(50000);
  });

  test('getFinanceStats calculates totals correctly', function() {
    const testFinances = [
      { id: 'F-001', description: 'Vente', type: 'Revenu', amount: 100000 },
      { id: 'F-002', description: 'Achat semences', type: 'Dépense', amount: 50000 },
      { id: 'F-003', description: 'Vente 2', type: 'Revenu', amount: 75000 }
    ];
    
    KAStorage.saveFinances(testFinances);
    const stats = KAStorage.getFinanceStats();
    
    expect(stats.totalRevenu).toBe(175000);
    expect(stats.totalDepense).toBe(50000);
    expect(stats.solde).toBe(125000);
  });

  test('getEmployees returns empty array when no employees stored', function() {
    const employees = KAStorage.getEmployees();
    expect(employees).toEqual([]);
  });

  test('saveEmployees and getEmployees work correctly', function() {
    const testEmployees = [
      { id: 'E-001', name: 'Samba', role: 'Ouvrier', dailyRate: 4000 }
    ];
    
    KAStorage.saveEmployees(testEmployees);
    const retrieved = KAStorage.getEmployees();
    
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].name).toBe('Samba');
  });

  test('getTasks returns empty array when no tasks stored', function() {
    const tasks = KAStorage.getTasks();
    expect(tasks).toEqual([]);
  });

  test('saveTasks and getTasks work correctly', function() {
    const testTasks = [
      { id: 'T-001', title: 'Irrigation', assignee: 'Moussa' }
    ];
    
    KAStorage.saveTasks(testTasks);
    const retrieved = KAStorage.getTasks();
    
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].title).toBe('Irrigation');
  });
});