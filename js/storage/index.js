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

// Default data constants (re-exported for backward compatibility)
export {
  DEFAULT_CROPS,
  DEFAULT_NURSERIES,
  DEFAULT_STOCKS,
  DEFAULT_TASKS,
  DEFAULT_FINANCES,
  DEFAULT_PARCELLES,
  DEFAULT_EMPLOYEES,
  DEFAULT_ATTENDANCE,
  DEFAULT_EMPLOYEE_PAYMENTS,
  DEFAULT_USERS,
  DEFAULT_CHEPTEL,
  DEFAULT_ELEVAGE_PRODUCTION,
  DEFAULT_ELEVAGE_HEALTH,
  DEFAULT_TREATMENTS,
  DEFAULT_CROP_PROFITS,
  CROP_LIBRARY_DATA,
  DEFAULT_HARVESTS,
  DEFAULT_PLANT_FAMILIES,
  DEFAULT_CROP_FAMILIES,
  DEFAULT_ROTATION_HISTORY,
  DEFAULT_ROTATION_RULES,
  DEFAULT_COMPOST_MATERIALS,
  DEFAULT_COMPOST_RECIPES,
  DEFAULT_RECIPE_INGREDIENTS,
  DEFAULT_COMPOST_HISTORY,
  DEFAULT_TRANSPORT_RATES,
  DEFAULT_MARGIN_SIMULATIONS,
  DEFAULT_MARKET_PRICES,
  DEFAULT_SEASON_TRENDS,
  DEFAULT_PRICE_ALERTS,
  DEFAULT_TOOLS_SHARING,
  DEFAULT_TOOL_RENTALS,
  DEFAULT_TOOL_FAVORITES,
  DEFAULT_TOOL_REVIEWS,
  DEFAULT_FARMS_COMMUNITY,
  DEFAULT_GROUP_ORDERS,
  DEFAULT_GROUP_ORDER_ITEMS
} from './crops.js';
export {
  DEFAULT_FINANCES as FINANCES_DEFAULTS,
  DEFAULT_TRANSPORT_RATES as TRANSPORT_RATES,
  DEFAULT_MARGIN_SIMULATIONS as MARGIN_SIMULATIONS,
  DEFAULT_MARKET_PRICES as MARKET_PRICES,
  DEFAULT_SEASON_TRENDS as SEASON_TRENDS,
  DEFAULT_PRICE_ALERTS as PRICE_ALERTS
} from './finances.js';
export {
  DEFAULT_EMPLOYEES as EMPLOYEES_DEFAULTS,
  DEFAULT_ATTENDANCE as ATTENDANCE_DEFAULTS,
  DEFAULT_EMPLOYEE_PAYMENTS as EMPLOYEE_PAYMENTS
} from './employees.js';
export {
  DEFAULT_STOCKS as STOCKS_DEFAULTS
} from './stocks.js';
export {
  DEFAULT_PARCELLES as PARCELLES_DEFAULTS
} from './parcelles.js';
export {
  DEFAULT_CHEPTEL as CHEPTEL_DEFAULTS,
  DEFAULT_ELEVAGE_PRODUCTION as ELEVAGE_PRODUCTION_DEFAULTS,
  DEFAULT_ELEVAGE_HEALTH as ELEVAGE_HEALTH_DEFAULTS
} from './elevage.js';
export {
  DEFAULT_TOOLS_SHARING as TOOLS_SHARING_DEFAULTS,
  DEFAULT_TOOL_RENTALS as TOOL_RENTALS_DEFAULTS,
  DEFAULT_TOOL_FAVORITES as TOOL_FAVORITES_DEFAULTS,
  DEFAULT_TOOL_REVIEWS as TOOL_REVIEWS_DEFAULTS
} from './tools-sharing.js';
export {
  DEFAULT_MARKET_PRICES as MARKET_PRICES_DEFAULTS,
  DEFAULT_SEASON_TRENDS as SEASON_TRENDS_DEFAULTS,
  DEFAULT_PRICE_ALERTS as PRICE_ALERTS_DEFAULTS
} from './market-prices.js';
export {
  DEFAULT_FARMS_COMMUNITY as FARMS_COMMUNITY_DEFAULTS,
  DEFAULT_GROUP_ORDERS as GROUP_ORDERS_DEFAULTS,
  DEFAULT_GROUP_ORDER_ITEMS as GROUP_ORDER_ITEMS_DEFAULTS
} from './group-orders.js';
export {
  DEFAULT_COMPOST_MATERIALS as COMPOST_MATERIALS_DEFAULTS,
  DEFAULT_COMPOST_RECIPES as COMPOST_RECIPES_DEFAULTS,
  DEFAULT_RECIPE_INGREDIENTS as RECIPE_INGREDIENTS_DEFAULTS,
  DEFAULT_COMPOST_HISTORY as COMPOST_HISTORY_DEFAULTS
} from './compost.js';

// Re-export crop library data (already exported above)
