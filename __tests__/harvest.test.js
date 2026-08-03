// KA Farm - Tests pour le module Harvest
import { HarvestsModule } from '../js/modules/harvests.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock KAStorage
const mockKAStorage = {
  getHarvests: () => [],
  saveHarvests: (harvests) => { localStorage.setItem('ka_farm_harvests', JSON.stringify(harvests)); },
  getCrops: () => [],
  getScopedKey: (key) => key,
  init: () => {}
};

Object.defineProperty(window, 'KAStorage', { value: mockKAStorage });

// Mock window.confirm
window.confirm = () => true;

describe('HarvestsModule', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ka_farm_harvests', JSON.stringify([]));
  });

  test('devrait initialiser le module sans erreur', () => {
    document.body.innerHTML = `
      <div id="harvests-container"></div>
      <div id="harvest-stats-container"></div>
    `;
    expect(() => HarvestsModule.init()).not.toThrow();
  });

  test('devrait enregistrer une récolte', () => {
    const harvests = [];
    mockKAStorage.saveHarvests(harvests);

    document.body.innerHTML = `
      <form id="add-harvest-form">
        <select id="form-harvest-crop"><option value="Tomate" selected></option></select>
        <input id="form-harvest-qty" value="500">
        <select id="form-harvest-unit"><option value="kg" selected></option></select>
        <input id="form-harvest-date" value="2026-06-26">
        <select id="form-harvest-quality"><option value="Premium" selected></option></select>
        <div id="harvests-container"></div>
      </form>
    `;

    const form = document.getElementById('add-harvest-form');
    form.dispatchEvent(new Event('submit'));

    const savedHarvests = JSON.parse(localStorage.getItem('ka_farm_harvests'));
    expect(savedHarvests.length).toBe(1);
    expect(savedHarvests[0].crop).toBe('Tomate');
    expect(savedHarvests[0].quantity).toBe(500);
  });

  test('devrait supprimer une récolte', () => {
    const harvests = [
      { id: 'H-001', crop: 'Tomate', quantity: 500, unit: 'kg', date: '2026-06-26', quality: 'Premium' }
    ];
    mockKAStorage.saveHarvests(harvests);

    document.body.innerHTML = `
      <div id="harvests-container"></div>
    `;

    window.deleteHarvest('H-001');

    const savedHarvests = JSON.parse(localStorage.getItem('ka_farm_harvests'));
    expect(savedHarvests.length).toBe(0);
  });

  test('devrait calculer le rendement total par culture', () => {
    const harvests = [
      { id: 'H-001', crop: 'Tomate', quantity: 500, unit: 'kg', date: '2026-06-26', quality: 'Premium' },
      { id: 'H-002', crop: 'Tomate', quantity: 300, unit: 'kg', date: '2026-06-27', quality: 'Standard' },
      { id: 'H-003', crop: 'Oignon', quantity: 200, unit: 'kg', date: '2026-06-26', quality: 'Premium' }
    ];
    mockKAStorage.saveHarvests(harvests);

    document.body.innerHTML = `
      <span id="total-harvest-tomate"></span>
      <span id="total-harvest-oignon"></span>
    `;

    HarvestsModule.renderStats();

    const tomatoTotal = document.getElementById('total-harvest-tomate').textContent;
    const oignonTotal = document.getElementById('total-harvest-oignon').textContent;

    expect(tomatoTotal).toBe('800'); // 500 + 300
    expect(oignonTotal).toBe('200');
  });

  test('devrait filtrer les récoltes par période', () => {
    const harvests = [
      { id: 'H-001', crop: 'Tomate', quantity: 500, unit: 'kg', date: '2026-06-26', quality: 'Premium' },
      { id: 'H-002', crop: 'Tomate', quantity: 300, unit: 'kg', date: '2026-07-15', quality: 'Standard' },
      { id: 'H-003', crop: 'Oignon', quantity: 200, unit: 'kg', date: '2026-06-10', quality: 'Premium' }
    ];
    mockKAStorage.saveHarvests(harvests);

    document.body.innerHTML = `
      <input id="harvest-date-start" value="2026-06-01">
      <input id="harvest-date-end" value="2026-06-30">
      <div id="harvests-container"></div>
    `;

    HarvestsModule.filterHarvests();

    const container = document.getElementById('harvests-container');
    expect(container.innerHTML).toContain('Tomate');
    expect(container.innerHTML).toContain('500');
    expect(container.innerHTML).toContain('Oignon');
    expect(container.innerHTML).not.toContain('300'); // Juillet, hors période
  });

  test('devrait calculer la qualité moyenne des récoltes', () => {
    const harvests = [
      { id: 'H-001', crop: 'Tomate', quantity: 500, unit: 'kg', date: '2026-06-26', quality: 'Premium' },
      { id: 'H-002', crop: 'Tomate', quantity: 300, unit: 'kg', date: '2026-06-27', quality: 'Standard' },
      { id: 'H-003', crop: 'Tomate', quantity: 200, unit: 'kg', date: '2026-06-28', quality: 'Premium' }
    ];
    mockKAStorage.saveHarvests(harvests);

    document.body.innerHTML = `
      <span id="premium-percentage"></span>
    `;

    HarvestsModule.renderQualityStats();

    const premiumPct = document.getElementById('premium-percentage').textContent;
    expect(premiumPct).toBe('67'); // 2 sur 3 sont Premium
  });

  test('devrait afficher les détails d\'une récolte', () => {
    const harvests = [
      { id: 'H-001', crop: 'Tomate', quantity: 500, unit: 'kg', date: '2026-06-26', quality: 'Premium', notes: 'Excellente récolte' }
    ];
    mockKAStorage.saveHarvests(harvests);

    document.body.innerHTML = `
      <div id="harvest-details-container"></div>
    `;

    HarvestsModule.showHarvestDetails('H-001');

    const detailsContainer = document.getElementById('harvest-details-container');
    expect(detailsContainer.innerHTML).toContain('Tomate');
    expect(detailsContainer.innerHTML).toContain('500');
    expect(detailsContainer.innerHTML).toContain('Premium');
    expect(detailsContainer.innerHTML).toContain('Excellente récolte');
  });
});