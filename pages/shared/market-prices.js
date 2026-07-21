import { MarketPricesModule } from '/js/modules/market-prices.js';
window.MarketPricesModule = MarketPricesModule;

// Si le module n'est pas initialisé par app.js, on l'initialise ici
if (!window.MarketPricesInitialized) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const container = document.getElementById('market-prices-module');
      if (container && !container.dataset.moduleLoaded) {
        container.dataset.moduleLoaded = 'true';
        if (MarketPricesModule && typeof MarketPricesModule.init === 'function') {
          MarketPricesModule.init();
        }
      }
    }, 500);
  });
}