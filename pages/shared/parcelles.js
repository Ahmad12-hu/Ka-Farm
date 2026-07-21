import { ParcellesModule } from '/js/modules/parcelles.js';
window.ParcellesModule = ParcellesModule;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof ParcellesModule.init === 'function') {
    ParcellesModule.init();
  }
});