// KA Farm - Tests pour le module Parcelles
import { ParcellesModule } from '../js/modules/parcelles.js';

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
  getParcelles: () => [],
  saveParcelles: (parcelles) => { localStorage.setItem('ka_farm_parcelles', JSON.stringify(parcelles)); },
  getScopedKey: (key) => key,
  init: () => {}
};

Object.defineProperty(window, 'KAStorage', { value: mockKAStorage });

// Mock window.confirm
window.confirm = () => true;

// Mock fetch
global.fetch = () => Promise.resolve({});

describe('ParcellesModule', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ka_farm_parcelles', JSON.stringify([]));
  });

  test('devrait initialiser le module sans erreur', () => {
    document.body.innerHTML = `
      <div id="parcelles-container"></div>
      <div id="parcelle-details-container"></div>
    `;
    expect(() => ParcellesModule.init()).not.toThrow();
  });

  test('devrait ajouter une parcelle', () => {
    const parcelles = [];
    mockKAStorage.saveParcelles(parcelles);

    document.body.innerHTML = `
      <form id="add-parcelle-form">
        <input id="form-parcelle-name" value="Parcelle Nord">
        <input id="form-parcelle-area" value="1000">
        <select id="form-parcelle-soil"><option value="Argileux" selected></option></select>
        <input id="form-parcelle-crops" value="Tomate, Oignon">
        <div id="parcelles-container"></div>
      </form>
    `;

    const form = document.getElementById('add-parcelle-form');
    form.dispatchEvent(new Event('submit'));

    const savedParcelles = JSON.parse(localStorage.getItem('ka_farm_parcelles'));
    expect(savedParcelles.length).toBe(1);
    expect(savedParcelles[0].name).toBe('Parcelle Nord');
    expect(savedParcelles[0].area).toBe(1000);
  });

  test('devrait modifier une parcelle', () => {
    const parcelles = [
      { id: 'P-001', name: 'Parcelle Nord', area: 1000, soilType: 'Argileux', crops: ['Tomate'], irrigationSystem: 'Goutte-à-goutte' }
    ];
    mockKAStorage.saveParcelles(parcelles);

    document.body.innerHTML = `
      <form id="edit-parcelle-form">
        <input id="form-parcelle-id" value="P-001">
        <input id="form-parcelle-name" value="Parcelle Nord Modifiée">
        <input id="form-parcelle-area" value="1500">
        <select id="form-parcelle-soil"><option value="Sableux" selected></option></select>
        <input id="form-parcelle-crops" value="Tomate, Piment">
      </form>
      <div id="parcelles-container"></div>
    `;

    const form = document.getElementById('edit-parcelle-form');
    form.dispatchEvent(new Event('submit'));

    const savedParcelles = JSON.parse(localStorage.getItem('ka_farm_parcelles'));
    expect(savedParcelles[0].name).toBe('Parcelle Nord Modifiée');
    expect(savedParcelles[0].area).toBe(1500);
    expect(savedParcelles[0].soilType).toBe('Sableux');
  });

  test('devrait supprimer une parcelle', () => {
    const parcelles = [
      { id: 'P-001', name: 'Parcelle Nord', area: 1000, soilType: 'Argileux', crops: ['Tomate'], irrigationSystem: 'Goutte-à-goutte' }
    ];
    mockKAStorage.saveParcelles(parcelles);

    document.body.innerHTML = `
      <div id="parcelles-container"></div>
    `;

    window.deleteParcelle('P-001');

    const savedParcelles = JSON.parse(localStorage.getItem('ka_farm_parcelles'));
    expect(savedParcelles.length).toBe(0);
  });

  test('devrait sélectionner une parcelle et afficher les détails', () => {
    const parcelles = [
      { id: 'P-001', name: 'Parcelle Nord', area: 1000, soilType: 'Argileux', crops: ['Tomate'], irrigationSystem: 'Goutte-à-goutte' }
    ];
    mockKAStorage.saveParcelles(parcelles);

    document.body.innerHTML = `
      <div id="parcelles-container"></div>
      <div id="parcelle-details-container"></div>
    `;

    ParcellesModule.selectParcelle('P-001');

    const detailsContainer = document.getElementById('parcelle-details-container');
    expect(detailsContainer.innerHTML).toContain('Parcelle Nord');
    expect(detailsContainer.innerHTML).toContain('1 000');
  });

  test('devrait calculer la surface totale des parcelles', () => {
    const parcelles = [
      { id: 'P-001', name: 'Parcelle Nord', area: 1000, soilType: 'Argileux', crops: ['Tomate'], irrigationSystem: 'Goutte-à-goutte' },
      { id: 'P-002', name: 'Parcelle Sud', area: 1500, soilType: 'Sableux', crops: ['Oignon'], irrigationSystem: 'Aspersion' }
    ];
    mockKAStorage.saveParcelles(parcelles);

    document.body.innerHTML = `
      <span id="total-area"></span>
    `;

    ParcellesModule.renderStats();

    const totalArea = document.getElementById('total-area').textContent;
    expect(totalArea).toBe('2 500');
  });

  test('devrait filtrer les parcelles par culture', () => {
    const parcelles = [
      { id: 'P-001', name: 'Parcelle Nord', area: 1000, soilType: 'Argileux', crops: ['Tomate'], irrigationSystem: 'Goutte-à-goutte' },
      { id: 'P-002', name: 'Parcelle Sud', area: 1500, soilType: 'Sableux', crops: ['Oignon'], irrigationSystem: 'Aspersion' }
    ];
    mockKAStorage.saveParcelles(parcelles);

    document.body.innerHTML = `
      <select id="parcelle-crop-filter"><option value="all" selected></option></select>
      <div id="parcelles-container"></div>
    `;

    ParcellesModule.filterParcelles('Tomate');

    const container = document.getElementById('parcelles-container');
    expect(container.innerHTML).toContain('Parcelle Nord');
    expect(container.innerHTML).not.toContain('Parcelle Sud');
  });
});