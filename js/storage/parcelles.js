// KA Farm - Parcelles Storage Domain
// Manages land parcels and field data

import { KAStorage } from './core.js';

const DEFAULT_PARCELLES = [
  { id: 'P-001', name: 'Parcelle Nord - Planche 2', surface: 120, lat: 14.7932, lng: -17.2654, status: 'Cultivée', type_sol: 'sableux', history: ['Tomate Mongal F1', 'Chou Cabus', 'Jachère'], currentCrop: 'Tomate Mongal F1', waterStatus: 'Irrigué' },
  { id: 'P-002', name: 'Parcelle Est - Grand Champ', surface: 500, lat: 14.7938, lng: -17.2642, status: 'Cultivée', type_sol: 'limoneux', history: ['Oignon Rouge de Galmi', 'Piment Oiseau', 'Arachide'], currentCrop: 'Oignon Rouge de Galmi', waterStatus: 'Besoin d\'eau' },
  { id: 'P-003', name: 'Parcelle Sud - Planche 1', surface: 150, lat: 14.7924, lng: -17.2659, status: 'Cultivée', type_sol: 'argileux', history: ['Chou Cabus', 'Aubergine', 'Jachère'], currentCrop: 'Chou Cabus', waterStatus: 'Irrigué' },
  { id: 'P-004', name: 'Zone Ombragée - Bac A', surface: 50, lat: 14.7935, lng: -17.2662, status: 'Cultivée', type_sol: 'sableux', history: ['Menthe de Thiès', 'Laitue de saison'], currentCrop: 'Menthe de Thiès', waterStatus: 'Irrigué' },
  { id: 'P-005', name: 'Parcelle Ouest - Verger', surface: 800, lat: 14.7928, lng: -17.2648, status: 'En préparation', type_sol: 'limoneux', history: ['Papayer Solo', 'Gombo d\'hivernage'], currentCrop: 'Papayer Solo (Jeunes plants)', waterStatus: 'Besoin d\'eau' }
];

export const ParcellesStorage = {
  getParcelles() {
    return KAStorage.get('ka_farm_parcelles', DEFAULT_PARCELLES);
  },
  saveParcelles(parcelles) {
    KAStorage.set('ka_farm_parcelles', parcelles);
  }
};