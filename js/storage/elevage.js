// KA Farm - Elevage Storage Domain
// Manages livestock and animal production data

import { KAStorage } from './core.js';

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

export const ElevageStorage = {
  getCheptel() {
    return KAStorage.get('ka_farm_cheptel', DEFAULT_CHEPTEL);
  },
  saveCheptel(cheptel) {
    KAStorage.set('ka_farm_cheptel', cheptel);
  },

  getElevageProduction() {
    return KAStorage.get('ka_farm_elevage_production', DEFAULT_ELEVAGE_PRODUCTION);
  },
  saveElevageProduction(production) {
    KAStorage.set('ka_farm_elevage_production', production);
  },

  getElevageHealth() {
    return KAStorage.get('ka_farm_elevage_health', DEFAULT_ELEVAGE_HEALTH);
  },
  saveElevageHealth(health) {
    KAStorage.set('ka_farm_elevage_health', health);
  }
};