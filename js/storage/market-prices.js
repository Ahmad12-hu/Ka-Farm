// KA Farm - Market Prices Storage Domain
// Manages market prices, season trends, and price alerts

import { KAStorage } from "./core.js";

const DEFAULT_MARKET_PRICES = [
  {
    id: "MP-001",
    market_name: "Marché Sandika",
    crop_name: "Tomate Mongal F1",
    price_fcfa: 650,
    price_date: "2026-07-10",
    region: "Dakar",
    unit: "kg",
    price_source: "SIM",
    is_estimated: false,
    season: "Hivernage",
    supply_level: "Normale",
    demand_level: "Élevée",
    notes: "Prix stable, bonne demande",
  },
  {
    id: "MP-002",
    market_name: "Marché Tilène",
    crop_name: "Oignon Rouge de Galmi",
    price_fcfa: 500,
    price_date: "2026-07-10",
    region: "Niayes",
    unit: "kg",
    price_source: "SIM",
    is_estimated: false,
    season: "Hivernage",
    supply_level: "Normale",
    demand_level: "Normale",
    notes: "Prix moyen de la saison",
  },
  {
    id: "MP-003",
    market_name: "Marché de Mbour",
    crop_name: "Chou Cabus",
    price_fcfa: 250,
    price_date: "2026-07-10",
    region: "Mbour",
    unit: "kg",
    price_source: "SIM",
    is_estimated: false,
    season: "Hivernage",
    supply_level: "Faible",
    demand_level: "Élevée",
    notes: "Prix en hausse, offre limitée",
  },
  {
    id: "MP-004",
    market_name: "Marché de Thiès",
    crop_name: "Menthe de Thiès",
    price_fcfa: 1200,
    price_date: "2026-07-10",
    region: "Thiès",
    unit: "kg",
    price_source: "SIM",
    is_estimated: false,
    season: "Hivernage",
    supply_level: "Normale",
    demand_level: "Élevée",
    notes: "Prix premium pour qualité locale",
  },
  {
    id: "MP-005",
    market_name: "Marché HLM",
    crop_name: "Piment Oiseau",
    price_fcfa: 1200,
    price_date: "2026-07-10",
    region: "Dakar",
    unit: "kg",
    price_source: "SIM",
    is_estimated: false,
    season: "Hivernage",
    supply_level: "Normale",
    demand_level: "Élevée",
    notes: "Piment très demandé",
  },
  {
    id: "MP-006",
    market_name: "Marché de Kaolack",
    crop_name: "Aubergine",
    price_fcfa: 400,
    price_date: "2026-07-10",
    region: "Kaolack",
    unit: "kg",
    price_source: "SIM",
    is_estimated: false,
    season: "Hivernage",
    supply_level: "Normale",
    demand_level: "Normale",
    notes: "Prix standard",
  },
];

const DEFAULT_SEASON_TRENDS = [
  {
    id: "ST-001",
    region: "Niayes",
    crop_name: "Tomate",
    season: "Hivernage",
    avg_price: 600,
    min_price: 450,
    max_price: 800,
    std_deviation: 75,
    trend_direction: "Hausse",
    trend_strength: 0.8,
    prediction_next_month: 675,
    confidence_percent: 85,
    data_points: 24,
    last_updated: "2026-07-10",
    notes: "Tendance haussière due à la demande croissante",
  },
  {
    id: "ST-002",
    region: "Dakar",
    crop_name: "Oignon",
    season: "Hivernage",
    avg_price: 525,
    min_price: 400,
    max_price: 650,
    std_deviation: 50,
    trend_direction: "Stable",
    trend_strength: 0.3,
    prediction_next_month: 530,
    confidence_percent: 90,
    data_points: 30,
    last_updated: "2026-07-10",
    notes: "Prix stable avec légère tendance à la hausse",
  },
  {
    id: "ST-003",
    region: "Thiès",
    crop_name: "Menthe",
    season: "Hivernage",
    avg_price: 1150,
    min_price: 1000,
    max_price: 1300,
    std_deviation: 80,
    trend_direction: "Hausse",
    trend_strength: 0.9,
    prediction_next_month: 1220,
    confidence_percent: 88,
    data_points: 18,
    last_updated: "2026-07-10",
    notes: "Fort potentiel de hausse pour les aromates",
  },
  {
    id: "ST-004",
    region: "Mbour",
    crop_name: "Chou",
    season: "Hivernage",
    avg_price: 275,
    min_price: 200,
    max_price: 350,
    std_deviation: 40,
    trend_direction: "Baisse",
    trend_strength: 0.5,
    prediction_next_month: 260,
    confidence_percent: 80,
    data_points: 20,
    last_updated: "2026-07-10",
    notes: "Légère baisse attendue après la saison des pluies",
  },
];

const DEFAULT_PRICE_ALERTS = [
  {
    id: "PA-001",
    market_name: "Marché Sandika",
    crop_name: "Tomate Mongal F1",
    alert_type: "Haut",
    threshold_price: 700,
    current_price: 650,
    trigger_date: null,
    message: "Le prix de la tomate a dépassé 700 FCFA/kg sur le marché Sandika",
    is_active: true,
    acknowledged: false,
    acknowledged_by: "",
    acknowledged_at: null,
    notes: "Alerte pour vente opportunité",
  },
  {
    id: "PA-002",
    market_name: "Marché Tilène",
    crop_name: "Oignon Rouge de Galmi",
    alert_type: "Bas",
    threshold_price: 450,
    current_price: 500,
    trigger_date: null,
    message: "Le prix de l'oignon est tombé en dessous de 450 FCFA/kg sur le marché Tilène",
    is_active: true,
    acknowledged: false,
    acknowledged_by: "",
    acknowledged_at: null,
    notes: "Alerte pour achat opportunité",
  },
  {
    id: "PA-003",
    market_name: "Marché de Mbour",
    crop_name: "Chou Cabus",
    alert_type: "Haut",
    threshold_price: 300,
    current_price: 250,
    trigger_date: null,
    message: "Le prix du chou a dépassé 300 FCFA/kg sur le marché de Mbour",
    is_active: true,
    acknowledged: false,
    acknowledged_by: "",
    acknowledged_at: null,
    notes: "Alerte pour vente",
  },
];

export const MarketPricesStorage = {
  getMarketPrices() {
    return KAStorage.get("ka_farm_market_prices", DEFAULT_MARKET_PRICES);
  },
  saveMarketPrices(prices) {
    KAStorage.set("ka_farm_market_prices", prices);
  },
  addMarketPrice(price) {
    const prices = this.getMarketPrices();
    prices.push(price);
    this.saveMarketPrices(prices);
    return price;
  },
  updateMarketPrice(id, updates) {
    const prices = this.getMarketPrices();
    const index = prices.findIndex((p) => p.id === id);
    if (index !== -1) {
      prices[index] = { ...prices[index], ...updates };
      this.saveMarketPrices(prices);
      return prices[index];
    }
    return null;
  },
  deleteMarketPrice(id) {
    const prices = this.getMarketPrices();
    const filtered = prices.filter((p) => p.id !== id);
    this.saveMarketPrices(filtered);
    return filtered;
  },
  getMarketPriceById(id) {
    const prices = this.getMarketPrices();
    return prices.find((p) => p.id === id);
  },
  getMarketPricesByCrop(cropName) {
    const prices = this.getMarketPrices();
    return prices.filter((p) => p.crop_name === cropName);
  },
  getMarketPricesByRegion(region) {
    const prices = this.getMarketPrices();
    return prices.filter((p) => p.region === region);
  },
  getLatestPrice(cropName, marketName) {
    const prices = this.getMarketPrices();
    const filtered = prices.filter((p) => p.crop_name === cropName && p.market_name === marketName);
    if (filtered.length === 0) return null;
    return filtered.reduce(
      (latest, p) => (new Date(p.price_date) > new Date(latest.price_date) ? p : latest),
      filtered[0]
    );
  },
  getPriceTrend(cropName, days = 30) {
    const prices = this.getMarketPrices();
    const cropPrices = prices.filter((p) => p.crop_name === cropName);
    const recentPrices = cropPrices.filter((p) => {
      const priceDate = new Date(p.price_date);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return priceDate >= cutoffDate;
    });
    if (recentPrices.length < 2) return { direction: "Stable", change: 0 };

    const sorted = [...recentPrices].sort(
      (a, b) => new Date(a.price_date) - new Date(b.price_date)
    );
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const change = newest.price_fcfa - oldest.price_fcfa;
    const direction = change > 0 ? "Hausse" : change < 0 ? "Baisse" : "Stable";

    return {
      direction,
      change,
      changePercent: Math.round((change / oldest.price_fcfa) * 10000) / 100,
    };
  },

  getSeasonTrends() {
    return KAStorage.get("ka_farm_season_trends", DEFAULT_SEASON_TRENDS);
  },
  saveSeasonTrends(trends) {
    KAStorage.set("ka_farm_season_trends", trends);
  },
  addSeasonTrend(trend) {
    const trends = this.getSeasonTrends();
    trends.push(trend);
    this.saveSeasonTrends(trends);
    return trend;
  },
  updateSeasonTrend(id, updates) {
    const trends = this.getSeasonTrends();
    const index = trends.findIndex((t) => t.id === id);
    if (index !== -1) {
      trends[index] = { ...trends[index], ...updates };
      this.saveSeasonTrends(trends);
      return trends[index];
    }
    return null;
  },
  deleteSeasonTrend(id) {
    const trends = this.getSeasonTrends();
    const filtered = trends.filter((t) => t.id !== id);
    this.saveSeasonTrends(filtered);
    return filtered;
  },
  getSeasonTrendById(id) {
    const trends = this.getSeasonTrends();
    return trends.find((t) => t.id === id);
  },
  getSeasonTrendsByCrop(cropName) {
    const trends = this.getSeasonTrends();
    return trends.filter((t) => t.crop_name === cropName);
  },
  getSeasonTrendsByRegion(region) {
    const trends = this.getSeasonTrends();
    return trends.filter((t) => t.region === region);
  },
  getSeasonTrendsBySeason(season) {
    const trends = this.getSeasonTrends();
    return trends.filter((t) => t.season === season);
  },

  getPriceAlerts() {
    return KAStorage.get("ka_farm_price_alerts", DEFAULT_PRICE_ALERTS);
  },
  savePriceAlerts(alerts) {
    KAStorage.set("ka_farm_price_alerts", alerts);
  },
  addPriceAlert(alert) {
    const alerts = this.getPriceAlerts();
    alerts.push(alert);
    this.savePriceAlerts(alerts);
    return alert;
  },
  updatePriceAlert(id, updates) {
    const alerts = this.getPriceAlerts();
    const index = alerts.findIndex((a) => a.id === id);
    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...updates };
      this.savePriceAlerts(alerts);
      return alerts[index];
    }
    return null;
  },
  deletePriceAlert(id) {
    const alerts = this.getPriceAlerts();
    const filtered = alerts.filter((a) => a.id !== id);
    this.savePriceAlerts(filtered);
    return filtered;
  },
  getPriceAlertById(id) {
    const alerts = this.getPriceAlerts();
    return alerts.find((a) => a.id === id);
  },
  getActivePriceAlerts() {
    const alerts = this.getPriceAlerts();
    return alerts.filter((a) => a.is_active && !a.acknowledged);
  },
  getPriceAlertsByCrop(cropName) {
    const alerts = this.getPriceAlerts();
    return alerts.filter((a) => a.crop_name === cropName);
  },
  acknowledgePriceAlert(id, userName) {
    const alerts = this.getPriceAlerts();
    const index = alerts.findIndex((a) => a.id === id);
    if (index !== -1) {
      alerts[index] = {
        ...alerts[index],
        acknowledged: true,
        acknowledged_by: userName,
        acknowledged_at: new Date().toISOString(),
      };
      this.savePriceAlerts(alerts);
      return alerts[index];
    }
    return null;
  },
  checkPriceAlerts(currentPrices) {
    const alerts = this.getPriceAlerts();
    const triggeredAlerts = [];

    alerts.forEach((alert) => {
      if (!alert.is_active || alert.acknowledged) return;

      const matchingPrice = currentPrices.find(
        (p) => p.crop_name === alert.crop_name && p.market_name === alert.market_name
      );

      if (matchingPrice) {
        let triggered = false;
        if (alert.alert_type === "Haut" && matchingPrice.price_fcfa >= alert.threshold_price) {
          triggered = true;
        } else if (
          alert.alert_type === "Bas" &&
          matchingPrice.price_fcfa <= alert.threshold_price
        ) {
          triggered = true;
        }

        if (triggered) {
          const updatedAlert = this.updatePriceAlert(alert.id, {
            trigger_date: new Date().toISOString(),
            current_price: matchingPrice.price_fcfa,
          });
          triggeredAlerts.push(updatedAlert);
        }
      }
    });

    return triggeredAlerts;
  },
};
