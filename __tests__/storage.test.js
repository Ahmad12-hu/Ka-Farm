const { KAStorage } = require("../js/storage.js");

describe("KAStorage Module", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("getCrops returns default crops when initialized", () => {
    KAStorage.init();
    const crops = KAStorage.getCrops();
    expect(Array.isArray(crops)).toBe(true);
    expect(crops.length).toBeGreaterThan(0);
  });

  test("saveCrops and getCrops work correctly", () => {
    const testCrops = [{ id: "C-001", name: "Tomate", field: "Parcelle A" }];

    KAStorage.saveCrops(testCrops);
    const retrieved = KAStorage.getCrops();

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe("C-001");
    expect(retrieved[0].name).toBe("Tomate");
  });

  test("getParcelles returns default parcelles when initialized", () => {
    KAStorage.init();
    const parcelles = KAStorage.getParcelles();
    expect(Array.isArray(parcelles)).toBe(true);
    expect(parcelles.length).toBeGreaterThan(0);
  });

  test("saveParcelles and getParcelles work correctly", () => {
    const testParcelles = [{ id: "P-001", name: "Parcelle Nord", surface: 120 }];

    KAStorage.saveParcelles(testParcelles);
    const retrieved = KAStorage.getParcelles();

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe("P-001");
    expect(retrieved[0].surface).toBe(120);
  });

  test("getFinances returns default finances when initialized", () => {
    KAStorage.init();
    const finances = KAStorage.getFinances();
    expect(Array.isArray(finances)).toBe(true);
    expect(finances.length).toBeGreaterThan(0);
  });

  test("saveFinances and getFinances work correctly", () => {
    const testFinances = [
      { id: "F-001", description: "Vente tomates", type: "Revenu", amount: 50000 },
    ];

    KAStorage.saveFinances(testFinances);
    const retrieved = KAStorage.getFinances();

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].amount).toBe(50000);
  });

  test("getFinanceStats calculates totals correctly", () => {
    const testFinances = [
      { id: "F-001", description: "Vente", type: "Revenu", amount: 100000 },
      { id: "F-002", description: "Achat semences", type: "Dépense", amount: 50000 },
      { id: "F-003", description: "Vente 2", type: "Revenu", amount: 75000 },
    ];

    KAStorage.saveFinances(testFinances);
    const stats = KAStorage.getFinanceStats();

    expect(stats.totalRevenu).toBe(175000);
    expect(stats.totalDepense).toBe(50000);
    expect(stats.solde).toBe(125000);
  });

  test("getEmployees returns default employees when initialized", () => {
    KAStorage.init();
    const employees = KAStorage.getEmployees();
    expect(Array.isArray(employees)).toBe(true);
    expect(employees.length).toBeGreaterThan(0);
  });

  test("saveEmployees and getEmployees work correctly", () => {
    const testEmployees = [{ id: "E-001", name: "Samba", role: "Ouvrier", dailyRate: 4000 }];

    KAStorage.saveEmployees(testEmployees);
    const retrieved = KAStorage.getEmployees();

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].name).toBe("Samba");
  });

  test("getTasks returns default tasks when initialized", () => {
    KAStorage.init();
    const tasks = KAStorage.getTasks();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
  });

  test("saveTasks and getTasks work correctly", () => {
    const testTasks = [{ id: "T-001", title: "Irrigation", assignee: "Responsable terrain" }];

    KAStorage.saveTasks(testTasks);
    const retrieved = KAStorage.getTasks();

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].title).toBe("Irrigation");
  });
});
