// KA Farm - Stocks Storage Domain
// Manages inventory, supplies, and stock movements

import { KAStorage } from './core.js';

const DEFAULT_STOCKS = [
  { id: 'S-301', name: 'Compost Organique Bio', category: 'Amendements', quantity: 350, maxQuantity: 1000, unit: 'kg' },
  { id: 'S-302', name: 'Semences Tomate Mongal F1', category: 'Semences', quantity: 12, maxQuantity: 50, unit: 'sachets' },
  { id: 'S-303', name: 'Purin de Neem (Insecticide)', category: 'Traitements', quantity: 45, maxQuantity: 100, unit: 'L' },
  { id: 'S-304', name: 'Fumier de Mouton séché', category: 'Amendements', quantity: 150, maxQuantity: 800, unit: 'kg' },
  { id: 'S-305', name: 'Aliments Concentrés Bovins', category: 'Alimentation', quantity: 180, maxQuantity: 1000, unit: 'kg' }
];

export const StocksStorage = {
  getStocks() {
    return KAStorage.get('ka_farm_stocks', DEFAULT_STOCKS);
  },
  saveStocks(stocks) {
    KAStorage.set('ka_farm_stocks', stocks);
  }
};