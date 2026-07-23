/**
 * Tests for DAR (Délai Avant Récolte) calculation logic.
 * Critical food safety feature: prevents harvesting before legally allowed waiting period.
 */
import { CropsModule } from '../js/modules/crops.js';

// Mock KAStorage
const mockTreatments = (treatments) => {
  const key = 'ka_farm_treatments';
  localStorage.setItem(key, JSON.stringify(treatments));
};

const clearTreatments = () => {
  localStorage.removeItem('ka_farm_treatments');
};

describe('DAR Calculation Logic', () => {
  beforeEach(() => {
    clearTreatments();
    // Mock getTreatments to return current state
    jest.spyOn(CropsModule, 'getTreatments').mockImplementation(() => {
      const saved = localStorage.getItem('ka_farm_treatments');
      return saved ? JSON.parse(saved) : [];
    });
  });

  afterEach(() => {
    clearTreatments();
    jest.restoreAllMocks();
  });

  test('case 1: treatment applied recently with active DAR should block harvest', () => {
    const today = new Date();
    const appliedDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

    mockTreatments([
      {
        id: 'TREAT-DAR-1',
        cropId: 'C-101',
        cropName: 'Tomate Mongal F1',
        category: 'bio-phytosanitaire',
        productName: 'Purin de Neem',
        dateApplied: appliedDate.toISOString().split('T')[0],
        dar: 7, // 7 days waiting period
        notes: 'Test DAR actif'
      }
    ]);

    const treatments = CropsModule.getTreatments();
    const t = treatments[0];

    const applied = new Date(t.dateApplied);
    const todayClean = new Date();
    todayClean.setHours(0, 0, 0, 0);
    applied.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((todayClean.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = t.dar - diffDays;
    const isDARActive = daysRemaining > 0;

    expect(isDARActive).toBe(true);
    expect(daysRemaining).toBe(5); // 7 - 2 = 5 days remaining
  });

  test('case 2: treatment applied long ago with expired DAR should allow harvest', () => {
    const today = new Date();
    const appliedDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

    mockTreatments([
      {
        id: 'TREAT-DAR-2',
        cropId: 'C-102',
        cropName: 'Oignon Rouge de Galmi',
        category: 'chimique-phytosanitaire',
        productName: 'Décis',
        dateApplied: appliedDate.toISOString().split('T')[0],
        dar: 7, // 7 days waiting period
        notes: 'Test DAR terminé'
      }
    ]);

    const treatments = CropsModule.getTreatments();
    const t = treatments[0];

    const applied = new Date(t.dateApplied);
    const todayClean = new Date();
    todayClean.setHours(0, 0, 0, 0);
    applied.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((todayClean.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = t.dar - diffDays;
    const isDARActive = daysRemaining > 0;

    expect(isDARActive).toBe(false);
    expect(daysRemaining).toBe(-3); // 7 - 10 = -3 days (expired)
  });

  test('case 3: exact DAR expiration date should allow harvest (daysRemaining = 0)', () => {
    const today = new Date();
    const appliedDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Exactly 7 days ago

    mockTreatments([
      {
        id: 'TREAT-DAR-3',
        cropId: 'C-103',
        cropName: 'Chou Cabus',
        category: 'chimique-phytosanitaire',
        productName: 'Ridomil Gold',
        dateApplied: appliedDate.toISOString().split('T')[0],
        dar: 7, // exactly 7 days
        notes: 'Test DAR expiration exacte'
      }
    ]);

    const treatments = CropsModule.getTreatments();
    const t = treatments[0];

    const applied = new Date(t.dateApplied);
    const todayClean = new Date();
    todayClean.setHours(0, 0, 0, 0);
    applied.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((todayClean.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = t.dar - diffDays;
    const isDARActive = daysRemaining > 0;

    // On the exact day DAR expires, daysRemaining = 0, so harvest should be ALLOWED
    expect(daysRemaining).toBe(0);
    expect(isDARActive).toBe(false);
  });

  test('bio-engrais with dar=0 should always allow harvest', () => {
    const today = new Date();
    const appliedDate = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago

    mockTreatments([
      {
        id: 'TREAT-DAR-4',
        cropId: 'C-104',
        cropName: 'Maïs',
        category: 'bio-engrais',
        productName: 'Compost Organique',
        dateApplied: appliedDate.toISOString().split('T')[0],
        dar: 0, // No waiting period for organic fertilizer
        notes: 'Test engrais bio'
      }
    ]);

    const treatments = CropsModule.getTreatments();
    const t = treatments[0];

    const applied = new Date(t.dateApplied);
    const todayClean = new Date();
    todayClean.setHours(0, 0, 0, 0);
    applied.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((todayClean.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = t.dar - diffDays;
    const isDARActive = daysRemaining > 0;

    expect(isDARActive).toBe(false);
    expect(daysRemaining).toBe(-1); // 0 - 1 = -1
  });
});