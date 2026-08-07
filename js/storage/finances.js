// KA Farm - Finances Storage Domain
// Manages financial transactions, market prices, and profit data

import { KAStorage } from "./core.js";

const DEFAULT_FINANCES = [
  {
    id: "F-501",
    description: "Vente de 8 caisses de Tomates Mongal",
    category: "Vente Légumes",
    type: "Revenu",
    amount: 120000,
    date: "2026-06-20",
  },
  {
    id: "F-502",
    description: "Achat de semences oignon Galmi",
    category: "Semences",
    type: "Dépense",
    amount: 35000,
    date: "2026-06-18",
  },
  {
    id: "F-503",
    description: "Achat compost de Thiès",
    category: "Compost",
    type: "Dépense",
    amount: 50000,
    date: "2026-06-15",
  },
  {
    id: "F-504",
    description: "Vente de 4 sacs de menthe fraîche",
    category: "Aromates",
    type: "Revenu",
    amount: 60000,
    date: "2026-06-22",
  },
  {
    id: "F-505",
    description: "Vente d'oignons rouges de Galmi",
    category: "Vente Légumes",
    type: "Revenu",
    amount: 140000,
    date: "2026-05-10",
  },
  {
    id: "F-506",
    description: "Achat purin de Neem biologique",
    category: "Irrigation",
    type: "Dépense",
    amount: 20000,
    date: "2026-05-15",
  },
  {
    id: "F-507",
    description: "Vente d'aubergines de saison",
    category: "Vente Légumes",
    type: "Revenu",
    amount: 95000,
    date: "2026-05-22",
  },
  {
    id: "F-508",
    description: "Vente de choux cabus maraîchers",
    category: "Vente Légumes",
    type: "Revenu",
    amount: 110000,
    date: "2026-04-05",
  },
  {
    id: "F-509",
    description: "Frais de carburant pour motopompe",
    category: "Irrigation",
    type: "Dépense",
    amount: 25000,
    date: "2026-04-12",
  },
  {
    id: "F-510",
    description: "Achat gaines goutte-à-goutte",
    category: "Irrigation",
    type: "Dépense",
    amount: 40000,
    date: "2026-04-20",
  },
  {
    id: "F-511",
    description: "Vente de piments oiseau",
    category: "Vente Légumes",
    type: "Revenu",
    amount: 85000,
    date: "2026-03-08",
  },
  {
    id: "F-512",
    description: "Achat d'engrais organique de fond",
    category: "Compost",
    type: "Dépense",
    amount: 30000,
    date: "2026-03-15",
  },
];

const DEFAULT_TRANSPORT_RATES = [
  {
    id: "TR-001",
    region_from: "Niayes",
    region_to: "Dakar",
    vehicle_type: "Camion",
    rate_per_ton_fcfa: 25000,
    rate_per_km_fcfa: 150,
    distance_km: 50,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: "Tarif standard pour livraison à Dakar depuis les Niayes",
  },
  {
    id: "TR-002",
    region_from: "Niayes",
    region_to: "Thiès",
    vehicle_type: "Camion",
    rate_per_ton_fcfa: 18000,
    rate_per_km_fcfa: 120,
    distance_km: 30,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: "Tarif pour livraison à Thiès",
  },
  {
    id: "TR-003",
    region_from: "Niayes",
    region_to: "Saint-Louis",
    vehicle_type: "Camion",
    rate_per_ton_fcfa: 35000,
    rate_per_km_fcfa: 200,
    distance_km: 120,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: "Tarif pour livraison à Saint-Louis",
  },
  {
    id: "TR-004",
    region_from: "Niayes",
    region_to: "Kaolack",
    vehicle_type: "Camion",
    rate_per_ton_fcfa: 30000,
    rate_per_km_fcfa: 180,
    distance_km: 80,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: "Tarif pour livraison à Kaolack",
  },
  {
    id: "TR-005",
    region_from: "Niayes",
    region_to: "Mbour",
    vehicle_type: "Camion",
    rate_per_ton_fcfa: 20000,
    rate_per_km_fcfa: 140,
    distance_km: 40,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: "Tarif pour livraison à Mbour (Petite Côte)",
  },
  {
    id: "TR-006",
    region_from: "Dakar",
    region_to: "Thiès",
    vehicle_type: "Camion",
    rate_per_ton_fcfa: 15000,
    rate_per_km_fcfa: 100,
    distance_km: 70,
    min_load_kg: 500,
    max_load_kg: 10000,
    notes: "Tarif pour transport entre Dakar et Thiès",
  },
];

const DEFAULT_MARGIN_SIMULATIONS = [
  {
    id: "MS-001",
    harvest_id: "H-001",
    crop_name: "Tomate Mongal F1",
    quantity_kg: 5000,
    selling_price_per_kg_fcfa: 650,
    destination_region: "Dakar",
    transport_cost_fcfa: 125000,
    other_costs_fcfa: 50000,
    gross_revenue_fcfa: 3250000,
    net_revenue_fcfa: 3075000,
    margin_percent: 94.62,
    simulation_date: "2026-06-25T10:00:00.000Z",
    notes: "Vente sur marché de Sandika - bon prix cette saison",
  },
  {
    id: "MS-002",
    harvest_id: "H-002",
    crop_name: "Oignon Rouge de Galmi",
    quantity_kg: 8000,
    selling_price_per_kg_fcfa: 500,
    destination_region: "Mbour",
    transport_cost_fcfa: 80000,
    other_costs_fcfa: 30000,
    gross_revenue_fcfa: 4000000,
    net_revenue_fcfa: 3900000,
    margin_percent: 97.5,
    simulation_date: "2026-06-20T14:30:00.000Z",
    notes: "Vente directe à un grossiste local - transport moins cher",
  },
  {
    id: "MS-003",
    harvest_id: "H-003",
    crop_name: "Piment Oiseau",
    quantity_kg: 1500,
    selling_price_per_kg_fcfa: 1200,
    destination_region: "Dakar",
    transport_cost_fcfa: 50000,
    other_costs_fcfa: 20000,
    gross_revenue_fcfa: 1800000,
    net_revenue_fcfa: 1730000,
    margin_percent: 96.11,
    simulation_date: "2026-06-28T09:00:00.000Z",
    notes: "Piment de haute qualité - prix élevé sur le marché",
  },
];

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

export const FinancesStorage = {
  getFinances() {
    return KAStorage.get("ka_farm_finances", DEFAULT_FINANCES);
  },
  saveFinances(finances) {
    KAStorage.set("ka_farm_finances", finances);
  },

  getTransportRates() {
    return KAStorage.get("ka_farm_transport_rates", DEFAULT_TRANSPORT_RATES);
  },
  saveTransportRates(rates) {
    KAStorage.set("ka_farm_transport_rates", rates);
  },
  addTransportRate(rate) {
    const rates = this.getTransportRates();
    rates.push(rate);
    this.saveTransportRates(rates);
    return rate;
  },
  updateTransportRate(id, updates) {
    const rates = this.getTransportRates();
    const index = rates.findIndex((r) => r.id === id);
    if (index !== -1) {
      rates[index] = { ...rates[index], ...updates };
      this.saveTransportRates(rates);
      return rates[index];
    }
    return null;
  },
  deleteTransportRate(id) {
    const rates = this.getTransportRates();
    const filtered = rates.filter((r) => r.id !== id);
    this.saveTransportRates(filtered);
    return filtered;
  },
  getTransportRateById(id) {
    const rates = this.getTransportRates();
    return rates.find((r) => r.id === id);
  },
  getTransportRatesByRoute(fromRegion, toRegion) {
    const rates = this.getTransportRates();
    return rates.filter((r) => r.region_from === fromRegion && r.region_to === toRegion);
  },
  calculateTransportCost(quantityKg, fromRegion, toRegion, vehicleType = "Camion") {
    const rates = this.getTransportRatesByRoute(fromRegion, toRegion);
    if (rates.length === 0) return 0;

    const rate = rates.find((r) => r.vehicle_type === vehicleType) || rates[0];
    const tons = quantityKg / 1000;
    return Math.round(tons * rate.rate_per_ton_fcfa + rate.distance_km * rate.rate_per_km_fcfa);
  },

  getMarginSimulations() {
    return KAStorage.get("ka_farm_margin_simulations", DEFAULT_MARGIN_SIMULATIONS);
  },
  saveMarginSimulations(simulations) {
    KAStorage.set("ka_farm_margin_simulations", simulations);
  },
  addMarginSimulation(simulation) {
    const simulations = this.getMarginSimulations();
    simulations.push(simulation);
    this.saveMarginSimulations(simulations);
    return simulation;
  },
  updateMarginSimulation(id, updates) {
    const simulations = this.getMarginSimulations();
    const index = simulations.findIndex((s) => s.id === id);
    if (index !== -1) {
      simulations[index] = { ...simulations[index], ...updates };
      this.saveMarginSimulations(simulations);
      return simulations[index];
    }
    return null;
  },
  deleteMarginSimulation(id) {
    const simulations = this.getMarginSimulations();
    const filtered = simulations.filter((s) => s.id !== id);
    this.saveMarginSimulations(filtered);
    return filtered;
  },
  getMarginSimulationById(id) {
    const simulations = this.getMarginSimulations();
    return simulations.find((s) => s.id === id);
  },
  calculateNetMargin(sellingPricePerKg, quantityKg, transportCost, otherCosts = 0) {
    const grossRevenue = sellingPricePerKg * quantityKg;
    const totalCosts = transportCost + otherCosts;
    const netRevenue = grossRevenue - totalCosts;
    const marginPercent = grossRevenue > 0 ? (netRevenue / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      netRevenue,
      marginPercent: Math.round(marginPercent * 100) / 100,
      totalCosts,
    };
  },
  getMarginStats() {
    const simulations = this.getMarginSimulations();
    const totalSimulations = simulations.length;
    const totalRevenue = simulations.reduce((sum, s) => sum + (s.gross_revenue_fcfa || 0), 0);
    const totalNetRevenue = simulations.reduce((sum, s) => sum + (s.net_revenue_fcfa || 0), 0);
    const avgMarginPercent =
      totalSimulations > 0
        ? simulations.reduce((sum, s) => sum + (s.margin_percent || 0), 0) / totalSimulations
        : 0;

    return {
      totalSimulations,
      totalRevenue,
      totalNetRevenue,
      avgMarginPercent: Math.round(avgMarginPercent * 100) / 100,
    };
  },

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

  getFinanceStats() {
    const finances = this.getFinances();
    const totalRevenu = finances
      .filter((f) => f.type === "Revenu")
      .reduce((sum, f) => sum + f.amount, 0);
    const totalDepense = finances
      .filter((f) => f.type === "Dépense")
      .reduce((sum, f) => sum + f.amount, 0);
    const solde = totalRevenu - totalDepense;
    return { totalRevenu, totalDepense, solde };
  },
};
