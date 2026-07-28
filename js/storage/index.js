// KA Farm - Storage Index
// Re-exports all storage domain modules for backward compatibility

import { KAStorage as CoreKAStorage, daysBetween } from './core.js';
export { CoreKAStorage as KAStorage, daysBetween };

import { CropsStorage } from './crops.js';
export { CropsStorage };

import { FinancesStorage } from './finances.js';
export { FinancesStorage };

import { EmployeesStorage } from './employees.js';
export { EmployeesStorage };

import { StocksStorage } from './stocks.js';
export { StocksStorage };

import { ParcellesStorage } from './parcelles.js';
export { ParcellesStorage };

import { ElevageStorage } from './elevage.js';
export { ElevageStorage };

import { ToolsSharingStorage } from './tools-sharing.js';
export { ToolsSharingStorage };

import { MarketPricesStorage } from './market-prices.js';
export { MarketPricesStorage };

import { GroupOrdersStorage } from './group-orders.js';
export { GroupOrdersStorage };

import { WeatherAlertsStorage } from './weather-alerts.js';
export { WeatherAlertsStorage };

import { CompostStorage } from './compost.js';
export { CompostStorage };

// Note: Individual domain modules no longer export DEFAULT_* constants.
// Use the KAStorage get*() methods instead for runtime defaults.
