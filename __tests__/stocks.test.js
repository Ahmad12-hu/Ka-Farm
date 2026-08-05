// KA Farm - Tests pour le module Stocks
import { StocksModule } from '../js/modules/stocks.js';

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
  getStocks: () => [],
  saveStocks: (stocks) => { localStorage.setItem('ka_farm_stocks', JSON.stringify(stocks)); },
  getScopedKey: (key) => key,
  init: () => {}
};

Object.defineProperty(window, 'KAStorage', { value: mockKAStorage });

// Mock window.confirm
window.confirm = () => true;

// Mock fetch
global.fetch = () => Promise.resolve({});

describe('StocksModule', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ka_farm_stocks', JSON.stringify([]));
  });

  test('devrait initialiser le module sans erreur', () => {
    document.body.innerHTML = `
      <div id="stocks-container"></div>
      <div id="low-stocks-container"></div>
    `;
    expect(() => StocksModule.init()).not.toThrow();
  });

  test('devrait ajouter un article en stock', () => {
    const stocks = [];
    mockKAStorage.saveStocks(stocks);

    document.body.innerHTML = `
      <form id="add-stock-form">
        <input id="form-stock-name" value="Engrais NPK">
        <select id="form-stock-category"><option value="Engrais" selected></option></select>
        <input id="form-stock-qty" value="50">
        <select id="form-stock-unit"><option value="kg" selected></option></select>
        <input id="form-stock-min" value="10">
        <input id="form-stock-expiry" value="2027-06-26">
        <div id="stocks-container"></div>
      </form>
    `;

    const form = document.getElementById('add-stock-form');
    form.dispatchEvent(new Event('submit'));

    const savedStocks = JSON.parse(localStorage.getItem('ka_farm_stocks'));
    expect(savedStocks.length).toBe(1);
    expect(savedStocks[0].name).toBe('Engrais NPK');
    expect(savedStocks[0].quantity).toBe(50);
  });

  test('devrait identifier les stocks bas', () => {
    const stocks = [
      { id: 'S-1', name: 'Engrais NPK', category: 'Engrais', quantity: 5, minQuantity: 10, unit: 'kg', expiryDate: '2027-06-26' },
      { id: 'S-2', name: 'Semences Tomate', category: 'Semences', quantity: 100, minQuantity: 20, unit: 'sachets', expiryDate: '2026-12-01' }
    ];
    mockKAStorage.saveStocks(stocks);

    document.body.innerHTML = `
      <div id="low-stocks-container"></div>
    `;

    StocksModule.renderLowStocks();

    const container = document.getElementById('low-stocks-container');
    expect(container.innerHTML).toContain('Engrais NPK');
    expect(container.innerHTML).not.toContain('Semences Tomate');
  });

  test('devrait mettre à jour la quantité d\'un stock', () => {
    const stocks = [
      { id: 'S-1', name: 'Engrais NPK', category: 'Engrais', quantity: 50, minQuantity: 10, unit: 'kg', expiryDate: '2027-06-26' }
    ];
    mockKAStorage.saveStocks(stocks);

    document.body.innerHTML = `
      <div id="stocks-container"></div>
    `;

    window.updateStockQuantity('S-1', 30);

    const savedStocks = JSON.parse(localStorage.getItem('ka_farm_stocks'));
    expect(savedStocks[0].quantity).toBe(30);
  });

  test('devrait supprimer un article du stock', () => {
    const stocks = [
      { id: 'S-1', name: 'Engrais NPK', category: 'Engrais', quantity: 50, minQuantity: 10, unit: 'kg', expiryDate: '2027-06-26' }
    ];
    mockKAStorage.saveStocks(stocks);

    document.body.innerHTML = `
      <div id="stocks-container"></div>
    `;

    window.deleteStock('S-1');

    const savedStocks = JSON.parse(localStorage.getItem('ka_farm_stocks'));
    expect(savedStocks.length).toBe(0);
  });

  test('devrait filtrer les stocks par catégorie', () => {
    const stocks = [
      { id: 'S-1', name: 'Engrais NPK', category: 'Engrais', quantity: 50, minQuantity: 10, unit: 'kg', expiryDate: '2027-06-26' },
      { id: 'S-2', name: 'Semences Tomate', category: 'Semences', quantity: 100, minQuantity: 20, unit: 'sachets', expiryDate: '2026-12-01' }
    ];
    mockKAStorage.saveStocks(stocks);

    document.body.innerHTML = `
      <select id="stock-category-filter"><option value="all" selected></option></select>
      <div id="stocks-container"></div>
    `;

    StocksModule.filterStocks('Engrais');

    const container = document.getElementById('stocks-container');
    expect(container.innerHTML).toContain('Engrais NPK');
    expect(container.innerHTML).not.toContain('Semences Tomate');
  });

  test('devrait calculer la valeur totale du stock', () => {
    const stocks = [
      { id: 'S-1', name: 'Engrais NPK', category: 'Engrais', quantity: 50, minQuantity: 10, unit: 'kg', expiryDate: '2027-06-26', unitCost: 500 },
      { id: 'S-2', name: 'Semences Tomate', category: 'Semences', quantity: 100, minQuantity: 20, unit: 'sachets', expiryDate: '2026-12-01', unitCost: 1000 }
    ];
    mockKAStorage.saveStocks(stocks);

    document.body.innerHTML = `
      <span id="total-stock-value"></span>
    `;

    StocksModule.renderStats();

    const totalValue = document.getElementById('total-stock-value').textContent;
    expect(totalValue).toBe('125 000'); // (50 * 500) + (100 * 1000)
  });
});