// KA Farm - Module Prix du Marché et Tendances Saisonnières
// Fonctionnalité 2.5 : Suivi des prix du marché et analyse des tendances

import { KAStorage } from '../storage.js';

// ============================================================
// MAIN MODULE EXPORT
// ============================================================

export const MarketPricesModule = {
  // State management
  state: {
    selectedRegion: 'Niayes',
    selectedCrop: '',
    selectedSeason: 'Hivernage',
    priceAlertThreshold: 0,
    alertType: 'Haut',
    searchQuery: '',
    viewMode: 'prices' // 'prices', 'trends', 'alerts'
  },

  // Available regions in Senegal
  regions: ['Niayes', 'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Mbour', 'Fatick', 'Diourbel'],

  // Available seasons
  seasons: ['Hivernage', 'Sèche', 'Contre-saison', 'Toute l\'année'],

  // Available crops
  crops: ['Tomate Mongal F1', 'Oignon Rouge de Galmi', 'Chou Cabus', 'Menthe de Thiès', 'Piment Oiseau', 'Aubergine'],

  // ============================================================
  // INITIALIZATION
  // ============================================================

  async init() {
    this.storage = KAStorage;
    await this.waitForElements();
    this.cacheElements();
    this.setupListeners();
    this.loadInitialData();
    this.renderVerticalChart();
    
    // Mark as initialized
    window.MarketPricesInitialized = true;
    console.log('MarketPricesModule initialized');
  },
  
  waitForElements() {
    return new Promise((resolve) => {
      const check = () => {
        const container = document.getElementById('market-prices-module');
        const filters = document.getElementById('period-filter');
        if (container && filters) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },

  cacheElements() {
    this.elements = {
      // Statistics
      statTotalPrices: document.getElementById('stat-total-prices'),
      statAvgPrice: document.getElementById('stat-avg-price'),
      statActiveAlerts: document.getElementById('stat-active-alerts'),
      statTrendsCount: document.getElementById('stat-trends-count'),

      // View tabs
      viewPricesBtn: document.getElementById('view-prices'),
      viewTrendsBtn: document.getElementById('view-trends'),
      viewAlertsBtn: document.getElementById('view-alerts'),

      // Price form
      cropSelect: document.getElementById('price-crop'),
      marketSelect: document.getElementById('price-market'),
      regionSelect: document.getElementById('price-region'),
      priceInput: document.getElementById('price-value'),
      priceDateInput: document.getElementById('price-date'),
      unitSelect: document.getElementById('price-unit'),
      seasonSelect: document.getElementById('price-season'),
      supplySelect: document.getElementById('price-supply'),
      demandSelect: document.getElementById('price-demand'),
      priceNotesInput: document.getElementById('price-notes'),

      // Trend form
      trendCropSelect: document.getElementById('trend-crop'),
      trendRegionSelect: document.getElementById('trend-region'),
      trendSeasonSelect: document.getElementById('trend-season'),
      trendAvgPriceInput: document.getElementById('trend-avg-price'),
      trendMinPriceInput: document.getElementById('trend-min-price'),
      trendMaxPriceInput: document.getElementById('trend-max-price'),
      trendDirectionSelect: document.getElementById('trend-direction'),
      trendStrengthInput: document.getElementById('trend-strength'),
      trendPredictionInput: document.getElementById('trend-prediction'),
      trendConfidenceInput: document.getElementById('trend-confidence'),
      trendDataPointsInput: document.getElementById('trend-data-points'),
      trendNotesInput: document.getElementById('trend-notes'),

      // Alert form
      alertCropSelect: document.getElementById('alert-crop'),
      alertMarketSelect: document.getElementById('alert-market'),
      alertTypeSelect: document.getElementById('alert-type'),
      alertThresholdInput: document.getElementById('alert-threshold'),
      alertMessageInput: document.getElementById('alert-message'),
      alertNotesInput: document.getElementById('alert-notes'),

      // Tables
      pricesTableBody: document.getElementById('prices-table-body'),
      trendsTableBody: document.getElementById('trends-table-body'),
      alertsTableBody: document.getElementById('alerts-table-body'),

      // Modals
      priceModal: document.getElementById('price-modal'),
      trendModal: document.getElementById('trend-modal'),
      alertModal: document.getElementById('alert-modal'),

      // Charts
      priceTrendChart: document.getElementById('price-trend-chart'),
      seasonComparisonChart: document.getElementById('season-comparison-chart')
    };
  },

  setupListeners() {
    // View tabs
    if (this.elements.viewPricesBtn) {
      this.elements.viewPricesBtn.addEventListener('click', () => this.switchView('prices'));
    }
    if (this.elements.viewTrendsBtn) {
      this.elements.viewTrendsBtn.addEventListener('click', () => this.switchView('trends'));
    }
    if (this.elements.viewAlertsBtn) {
      this.elements.viewAlertsBtn.addEventListener('click', () => this.switchView('alerts'));
    }

    // Price form
    if (this.elements.priceModal) {
      const savePriceBtn = this.elements.priceModal.querySelector('[data-save-price]');
      if (savePriceBtn) {
        savePriceBtn.addEventListener('click', () => this.savePrice());
      }
      const closePriceBtn = this.elements.priceModal.querySelector('[data-close-price]');
      if (closePriceBtn) {
        closePriceBtn.addEventListener('click', () => this.closePriceModal());
      }
    }

    // Trend form
    if (this.elements.trendModal) {
      const saveTrendBtn = this.elements.trendModal.querySelector('[data-save-trend]');
      if (saveTrendBtn) {
        saveTrendBtn.addEventListener('click', () => this.saveTrend());
      }
      const closeTrendBtn = this.elements.trendModal.querySelector('[data-close-trend]');
      if (closeTrendBtn) {
        closeTrendBtn.addEventListener('click', () => this.closeTrendModal());
      }
    }

    // Alert form
    if (this.elements.alertModal) {
      const saveAlertBtn = this.elements.alertModal.querySelector('[data-save-alert]');
      if (saveAlertBtn) {
        saveAlertBtn.addEventListener('click', () => this.saveAlert());
      }
      const closeAlertBtn = this.elements.alertModal.querySelector('[data-close-alert]');
      if (closeAlertBtn) {
        closeAlertBtn.addEventListener('click', () => this.closeAlertModal());
      }
    }

    // Add new buttons
    const addPriceBtn = document.getElementById('add-price-btn');
    if (addPriceBtn) {
      addPriceBtn.addEventListener('click', () => this.openPriceModal());
    }

    const addTrendBtn = document.getElementById('add-trend-btn');
    if (addTrendBtn) {
      addTrendBtn.addEventListener('click', () => this.openTrendModal());
    }

    const addAlertBtn = document.getElementById('add-alert-btn');
    if (addAlertBtn) {
      addAlertBtn.addEventListener('click', () => this.openAlertModal());
    }

    // Filters
    const periodFilter = document.getElementById('period-filter');
    if (periodFilter) {
      periodFilter.addEventListener('change', () => {
        this.renderCharts();
      });
    }

    const cropFilter = document.getElementById('crop-filter');
    if (cropFilter) {
      cropFilter.addEventListener('change', () => {
        this.renderCharts();
      });
    }
  },

  // ============================================================
  // DATA LOADING
  // ============================================================

  loadInitialData() {
    this.marketPrices = this.storage.getMarketPrices();
    this.seasonTrends = this.storage.getSeasonTrends();
    this.priceAlerts = this.storage.getPriceAlerts();
    this.updateStats();
  },

  updateStats() {
    const prices = this.storage.getMarketPrices();
    const trends = this.storage.getSeasonTrends();
    const alerts = this.storage.getActivePriceAlerts();

    const totalPrices = prices.length;
    const avgPrice = totalPrices > 0 ? prices.reduce((sum, p) => sum + (p.price_fcfa || 0), 0) / totalPrices : 0;
    const totalTrends = trends.length;
    const activeAlertsCount = alerts.length;

    if (this.elements.statTotalPrices) {
      this.elements.statTotalPrices.textContent = totalPrices;
    }
    if (this.elements.statAvgPrice) {
      this.elements.statAvgPrice.textContent = Math.round(avgPrice).toLocaleString('fr-FR');
    }
    if (this.elements.statActiveAlerts) {
      this.elements.statActiveAlerts.textContent = activeAlertsCount;
    }
    if (this.elements.statTrendsCount) {
      this.elements.statTrendsCount.textContent = totalTrends;
    }
  },

  // ============================================================
  // VIEW MANAGEMENT
  // ============================================================

  switchView(mode) {
    this.state.viewMode = mode;
    
    // Update active tab
    if (this.elements.viewPricesBtn) {
      this.elements.viewPricesBtn.classList.toggle('bg-brand-green', mode === 'prices');
      this.elements.viewPricesBtn.classList.toggle('bg-brand-slate', mode !== 'prices');
    }
    if (this.elements.viewTrendsBtn) {
      this.elements.viewTrendsBtn.classList.toggle('bg-brand-green', mode === 'trends');
      this.elements.viewTrendsBtn.classList.toggle('bg-brand-slate', mode !== 'trends');
    }
    if (this.elements.viewAlertsBtn) {
      this.elements.viewAlertsBtn.classList.toggle('bg-brand-green', mode === 'alerts');
      this.elements.viewAlertsBtn.classList.toggle('bg-brand-slate', mode !== 'alerts');
    }

    // Show/hide sections
    const pricesSection = document.getElementById('prices-section');
    const trendsSection = document.getElementById('trends-section');
    const alertsSection = document.getElementById('alerts-section');

    if (pricesSection) pricesSection.classList.toggle('hidden', mode !== 'prices');
    if (trendsSection) trendsSection.classList.toggle('hidden', mode !== 'trends');
    if (alertsSection) alertsSection.classList.toggle('hidden', mode !== 'alerts');

    this.render();
  },

  // ============================================================
  // RENDERING
  // ============================================================

  render() {
    this.updateStats();
    
    switch (this.state.viewMode) {
      case 'prices':
        this.renderPrices();
        break;
      case 'trends':
        this.renderTrends();
        break;
      case 'alerts':
        this.renderAlerts();
        break;
    }

    this.renderCharts();
  },

  renderPrices() {
    if (!this.elements.pricesTableBody) return;

    let prices = this.storage.getMarketPrices();
    
    // Apply filters
    if (this.state.selectedRegion) {
      prices = prices.filter(p => p.region === this.state.selectedRegion);
    }
    if (this.state.selectedCrop) {
      prices = prices.filter(p => p.crop_name === this.state.selectedCrop);
    }
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      prices = prices.filter(p => 
        p.crop_name.toLowerCase().includes(query) ||
        p.market_name.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query)
      );
    }

    // Sort by date descending
    prices.sort((a, b) => new Date(b.price_date) - new Date(a.price_date));

    this.elements.pricesTableBody.innerHTML = prices.map(price => `
      <tr class="border-b border-gray-700 hover:bg-gray-800/50">
        <td class="px-4 py-3 whitespace-nowrap">${price.crop_name}</td>
        <td class="px-4 py-3">${price.market_name}</td>
        <td class="px-4 py-3">${price.region}</td>
        <td class="px-4 py-3 text-right">${price.price_fcfa.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3">${price.unit}</td>
        <td class="px-4 py-3">${new Date(price.price_date).toLocaleDateString('fr-FR')}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs ${this.getSupplyLevelColor(price.supply_level)}">
            ${price.supply_level}
          </span>
        </td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs ${this.getDemandLevelColor(price.demand_level)}">
            ${price.demand_level}
          </span>
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <button onclick="MarketPricesModule.editPrice('${price.id}')" 
                  class="text-yellow-400 hover:text-yellow-300 mr-2">
            <i data-lucide="pencil"></i>
          </button>
          <button onclick="MarketPricesModule.deletePrice('${price.id}')" 
                  class="text-red-400 hover:text-red-300">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    this.renderLucideIcons();
  },

  renderTrends() {
    if (!this.elements.trendsTableBody) return;

    let trends = this.storage.getSeasonTrends();
    
    // Apply filters
    if (this.state.selectedRegion) {
      trends = trends.filter(t => t.region === this.state.selectedRegion);
    }
    if (this.state.selectedCrop) {
      trends = trends.filter(t => t.crop_name === this.state.selectedCrop);
    }
    if (this.state.selectedSeason) {
      trends = trends.filter(t => t.season === this.state.selectedSeason);
    }
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      trends = trends.filter(t => 
        t.crop_name.toLowerCase().includes(query) ||
        t.region.toLowerCase().includes(query)
      );
    }

    trends.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));

    this.elements.trendsTableBody.innerHTML = trends.map(trend => `
      <tr class="border-b border-gray-700 hover:bg-gray-800/50">
        <td class="px-4 py-3 whitespace-nowrap">${trend.crop_name}</td>
        <td class="px-4 py-3">${trend.region}</td>
        <td class="px-4 py-3">${trend.season}</td>
        <td class="px-4 py-3 text-right">${trend.avg_price.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3 text-right">${trend.min_price.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3 text-right">${trend.max_price.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs ${this.getTrendDirectionColor(trend.trend_direction)}">
            ${trend.trend_direction}
          </span>
        </td>
        <td class="px-4 py-3 text-right">${(trend.trend_strength * 100).toFixed(0)}%</td>
        <td class="px-4 py-3 text-right">${trend.prediction_next_month.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3 whitespace-nowrap">
          <button onclick="MarketPricesModule.editTrend('${trend.id}')" 
                  class="text-yellow-400 hover:text-yellow-300 mr-2">
            <i data-lucide="pencil"></i>
          </button>
          <button onclick="MarketPricesModule.deleteTrend('${trend.id}')" 
                  class="text-red-400 hover:text-red-300">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    this.renderLucideIcons();
  },

  renderAlerts() {
    if (!this.elements.alertsTableBody) return;

    let alerts = this.storage.getPriceAlerts();
    
    // Apply filters
    if (this.state.selectedCrop) {
      alerts = alerts.filter(a => a.crop_name === this.state.selectedCrop);
    }
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      alerts = alerts.filter(a => 
        a.crop_name.toLowerCase().includes(query) ||
        a.market_name.toLowerCase().includes(query)
      );
    }

    alerts.sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      if (a.acknowledged !== b.acknowledged) return b.acknowledged ? -1 : 1;
      return new Date(b.trigger_date || b.created_at) - new Date(a.trigger_date || a.created_at);
    });

    this.elements.alertsTableBody.innerHTML = alerts.map(alert => `
      <tr class="border-b border-gray-700 hover:bg-gray-800/50 ${!alert.is_active ? 'opacity-50' : ''}">
        <td class="px-4 py-3">
          <input type="checkbox" ${alert.acknowledged ? 'checked' : ''} 
                 onclick="MarketPricesModule.toggleAcknowledgeAlert('${alert.id}')"
                 class="rounded border-gray-600 bg-gray-800">
        </td>
        <td class="px-4 py-3 whitespace-nowrap">${alert.crop_name}</td>
        <td class="px-4 py-3">${alert.market_name}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs ${alert.alert_type === 'Haut' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}">
            ${alert.alert_type}
          </span>
        </td>
        <td class="px-4 py-3 text-right">${alert.threshold_price.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3 text-right">${(alert.current_price || 0).toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3">${alert.trigger_date ? new Date(alert.trigger_date).toLocaleDateString('fr-FR') : '-'}</td>
        <td class="px-4 py-3 whitespace-nowrap">
          <button onclick="MarketPricesModule.editAlert('${alert.id}')" 
                  class="text-yellow-400 hover:text-yellow-300 mr-2">
            <i data-lucide="pencil"></i>
          </button>
          <button onclick="MarketPricesModule.deleteAlert('${alert.id}')" 
                  class="text-red-400 hover:text-red-300">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    this.renderLucideIcons();
  },

  renderCharts() {
    this.renderPriceTrendChart();
    this.renderSeasonComparisonChart();
    this.renderVerticalChart();
  },

  renderPriceTrendChart() {
    if (!this.elements.priceTrendChart) return;

    const prices = this.storage.getMarketPrices();
    const selectedCrop = this.state.selectedCrop || 'Tomate Mongal F1';
    const cropPrices = prices.filter(p => p.crop_name === selectedCrop);
    
    if (cropPrices.length === 0) return;

    cropPrices.sort((a, b) => new Date(a.price_date) - new Date(b.price_date));

    const dates = cropPrices.map(p => new Date(p.price_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }));
    const priceValues = cropPrices.map(p => p.price_fcfa);

    const ctx = this.elements.priceTrendChart.getContext('2d');
    
    // Destroy previous chart if exists
    if (this.priceTrendChartInstance) {
      this.priceTrendChartInstance.destroy();
    }

    this.priceTrendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: `Prix de ${selectedCrop}`,
          data: priceValues,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#E5E7EB' }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: { color: '#E5E7EB' },
            grid: { color: '#374151' }
          },
          x: {
            ticks: { color: '#E5E7EB' },
            grid: { color: '#374151' }
          }
        }
      }
    });
  },

  renderSeasonComparisonChart() {
    if (!this.elements.seasonComparisonChart) return;

    const trends = this.storage.getSeasonTrends();
    const regions = [...new Set(trends.map(t => t.region))];
    const selectedSeason = this.state.selectedSeason || 'Hivernage';
    
    const seasonTrends = trends.filter(t => t.season === selectedSeason);
    
    if (seasonTrends.length === 0) return;

    // Group by crop
    const crops = [...new Set(seasonTrends.map(t => t.crop_name))];
    const datasets = crops.map(crop => {
      const cropData = seasonTrends.filter(t => t.crop_name === crop);
      return {
        label: crop,
        data: regions.map(region => {
          const trend = cropData.find(t => t.region === region);
          return trend ? trend.avg_price : 0;
        }),
        backgroundColor: this.getRandomColor()
      };
    });

    const ctx = this.elements.seasonComparisonChart.getContext('2d');
    
    // Destroy previous chart if exists
    if (this.seasonComparisonChartInstance) {
      this.seasonComparisonChartInstance.destroy();
    }

    this.seasonComparisonChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: regions,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#E5E7EB' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#E5E7EB' },
            grid: { color: '#374151' }
          },
          x: {
            ticks: { color: '#E5E7EB' },
            grid: { color: '#374151' }
          }
        }
      }
    });
  },

  getRandomColor() {
    const colors = [
      '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EAB308'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  getSupplyLevelColor(level) {
    const colors = {
      'Faible': 'bg-red-800 text-red-200',
      'Normale': 'bg-blue-800 text-blue-200',
      'Élevée': 'bg-green-800 text-green-200'
    };
    return colors[level] || 'bg-gray-800 text-gray-200';
  },

  getDemandLevelColor(level) {
    const colors = {
      'Faible': 'bg-red-800 text-red-200',
      'Normale': 'bg-blue-800 text-blue-200',
      'Élevée': 'bg-green-800 text-green-200'
    };
    return colors[level] || 'bg-gray-800 text-gray-200';
  },

  getTrendDirectionColor(direction) {
    const colors = {
      'Hausse': 'bg-green-800 text-green-200',
      'Baisse': 'bg-red-800 text-red-200',
      'Stable': 'bg-blue-800 text-blue-200'
    };
    return colors[direction] || 'bg-gray-800 text-gray-200';
  },

  renderLucideIcons() {
    if (typeof lucide === 'undefined') return;
    document.querySelectorAll('[data-lucide]').forEach(el => {
      const iconName = el.getAttribute('data-lucide');
      el.innerHTML = lucide.create(iconName);
    });
  },

  // ============================================================
  // PRICE MANAGEMENT
  // ============================================================

  openPriceModal(priceId = null) {
    this.currentPriceId = priceId;
    
    if (priceId) {
      const price = this.storage.getMarketPriceById(priceId);
      if (price) {
        if (this.elements.cropSelect) this.elements.cropSelect.value = price.crop_name;
        if (this.elements.marketSelect) this.elements.marketSelect.value = price.market_name;
        if (this.elements.regionSelect) this.elements.regionSelect.value = price.region;
        if (this.elements.priceInput) this.elements.priceInput.value = price.price_fcfa;
        if (this.elements.priceDateInput) this.elements.priceDateInput.value = price.price_date;
        if (this.elements.unitSelect) this.elements.unitSelect.value = price.unit || 'kg';
        if (this.elements.seasonSelect) this.elements.seasonSelect.value = price.season || 'Hivernage';
        if (this.elements.supplySelect) this.elements.supplySelect.value = price.supply_level || 'Normale';
        if (this.elements.demandSelect) this.elements.demandSelect.value = price.demand_level || 'Normale';
        if (this.elements.priceNotesInput) this.elements.priceNotesInput.value = price.notes || '';
      }
    } else {
      // Reset form
      if (this.elements.cropSelect) this.elements.cropSelect.value = '';
      if (this.elements.marketSelect) this.elements.marketSelect.value = '';
      if (this.elements.regionSelect) this.elements.regionSelect.value = 'Niayes';
      if (this.elements.priceInput) this.elements.priceInput.value = '';
      if (this.elements.priceDateInput) this.elements.priceDateInput.value = new Date().toISOString().split('T')[0];
      if (this.elements.unitSelect) this.elements.unitSelect.value = 'kg';
      if (this.elements.seasonSelect) this.elements.seasonSelect.value = 'Hivernage';
      if (this.elements.supplySelect) this.elements.supplySelect.value = 'Normale';
      if (this.elements.demandSelect) this.elements.demandSelect.value = 'Normale';
      if (this.elements.priceNotesInput) this.elements.priceNotesInput.value = '';
    }

    if (this.elements.priceModal) {
      this.elements.priceModal.classList.remove('hidden');
    }
  },

  closePriceModal() {
    if (this.elements.priceModal) {
      this.elements.priceModal.classList.add('hidden');
    }
    this.currentPriceId = null;
  },

  savePrice() {
    const price = {
      id: this.currentPriceId || `MP-${Date.now()}`,
      crop_name: this.elements.cropSelect.value,
      market_name: this.elements.marketSelect.value,
      region: this.elements.regionSelect.value,
      price_fcfa: parseFloat(this.elements.priceInput.value) || 0,
      price_date: this.elements.priceDateInput.value,
      unit: this.elements.unitSelect.value,
      season: this.elements.seasonSelect.value,
      supply_level: this.elements.supplySelect.value,
      demand_level: this.elements.demandSelect.value,
      notes: this.elements.priceNotesInput.value,
      price_source: 'SIM',
      is_estimated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.currentPriceId) {
      this.storage.updateMarketPrice(this.currentPriceId, price);
    } else {
      this.storage.addMarketPrice(price);
    }

    this.closePriceModal();
    this.loadInitialData();
    this.render();
  },

  editPrice(priceId) {
    this.openPriceModal(priceId);
  },

  deletePrice(priceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      this.storage.deleteMarketPrice(priceId);
      this.loadInitialData();
      this.render();
    }
  },

  // ============================================================
  // TREND MANAGEMENT
  // ============================================================

  openTrendModal(trendId = null) {
    this.currentTrendId = trendId;
    
    if (trendId) {
      const trend = this.storage.getSeasonTrendById(trendId);
      if (trend) {
        if (this.elements.trendCropSelect) this.elements.trendCropSelect.value = trend.crop_name;
        if (this.elements.trendRegionSelect) this.elements.trendRegionSelect.value = trend.region;
        if (this.elements.trendSeasonSelect) this.elements.trendSeasonSelect.value = trend.season;
        if (this.elements.trendAvgPriceInput) this.elements.trendAvgPriceInput.value = trend.avg_price;
        if (this.elements.trendMinPriceInput) this.elements.trendMinPriceInput.value = trend.min_price;
        if (this.elements.trendMaxPriceInput) this.elements.trendMaxPriceInput.value = trend.max_price;
        if (this.elements.trendDirectionSelect) this.elements.trendDirectionSelect.value = trend.trend_direction;
        if (this.elements.trendStrengthInput) this.elements.trendStrengthInput.value = trend.trend_strength;
        if (this.elements.trendPredictionInput) this.elements.trendPredictionInput.value = trend.prediction_next_month;
        if (this.elements.trendConfidenceInput) this.elements.trendConfidenceInput.value = trend.confidence_percent;
        if (this.elements.trendDataPointsInput) this.elements.trendDataPointsInput.value = trend.data_points;
        if (this.elements.trendNotesInput) this.elements.trendNotesInput.value = trend.notes || '';
      }
    } else {
      // Reset form
      if (this.elements.trendCropSelect) this.elements.trendCropSelect.value = '';
      if (this.elements.trendRegionSelect) this.elements.trendRegionSelect.value = 'Niayes';
      if (this.elements.trendSeasonSelect) this.elements.trendSeasonSelect.value = 'Hivernage';
      if (this.elements.trendAvgPriceInput) this.elements.trendAvgPriceInput.value = '';
      if (this.elements.trendMinPriceInput) this.elements.trendMinPriceInput.value = '';
      if (this.elements.trendMaxPriceInput) this.elements.trendMaxPriceInput.value = '';
      if (this.elements.trendDirectionSelect) this.elements.trendDirectionSelect.value = 'Stable';
      if (this.elements.trendStrengthInput) this.elements.trendStrengthInput.value = 0.5;
      if (this.elements.trendPredictionInput) this.elements.trendPredictionInput.value = '';
      if (this.elements.trendConfidenceInput) this.elements.trendConfidenceInput.value = 80;
      if (this.elements.trendDataPointsInput) this.elements.trendDataPointsInput.value = 10;
      if (this.elements.trendNotesInput) this.elements.trendNotesInput.value = '';
    }

    if (this.elements.trendModal) {
      this.elements.trendModal.classList.remove('hidden');
    }
  },

  closeTrendModal() {
    if (this.elements.trendModal) {
      this.elements.trendModal.classList.add('hidden');
    }
    this.currentTrendId = null;
  },

  saveTrend() {
    const trend = {
      id: this.currentTrendId || `ST-${Date.now()}`,
      crop_name: this.elements.trendCropSelect.value,
      region: this.elements.trendRegionSelect.value,
      season: this.elements.trendSeasonSelect.value,
      avg_price: parseFloat(this.elements.trendAvgPriceInput.value) || 0,
      min_price: parseFloat(this.elements.trendMinPriceInput.value) || 0,
      max_price: parseFloat(this.elements.trendMaxPriceInput.value) || 0,
      std_deviation: 0,
      trend_direction: this.elements.trendDirectionSelect.value,
      trend_strength: parseFloat(this.elements.trendStrengthInput.value) || 0.5,
      prediction_next_month: parseFloat(this.elements.trendPredictionInput.value) || 0,
      confidence_percent: parseFloat(this.elements.trendConfidenceInput.value) || 80,
      data_points: parseInt(this.elements.trendDataPointsInput.value) || 10,
      last_updated: new Date().toISOString().split('T')[0],
      notes: this.elements.trendNotesInput.value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.currentTrendId) {
      this.storage.updateSeasonTrend(this.currentTrendId, trend);
    } else {
      this.storage.addSeasonTrend(trend);
    }

    this.closeTrendModal();
    this.loadInitialData();
    this.render();
  },

  editTrend(trendId) {
    this.openTrendModal(trendId);
  },

  deleteTrend(trendId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tendance ?')) {
      this.storage.deleteSeasonTrend(trendId);
      this.loadInitialData();
      this.render();
    }
  },

  // ============================================================
  // ALERT MANAGEMENT
  // ============================================================

  openAlertModal(alertId = null) {
    this.currentAlertId = alertId;
    
    if (alertId) {
      const alert = this.storage.getPriceAlertById(alertId);
      if (alert) {
        if (this.elements.alertCropSelect) this.elements.alertCropSelect.value = alert.crop_name;
        if (this.elements.alertMarketSelect) this.elements.alertMarketSelect.value = alert.market_name;
        if (this.elements.alertTypeSelect) this.elements.alertTypeSelect.value = alert.alert_type;
        if (this.elements.alertThresholdInput) this.elements.alertThresholdInput.value = alert.threshold_price;
        if (this.elements.alertMessageInput) this.elements.alertMessageInput.value = alert.message;
        if (this.elements.alertNotesInput) this.elements.alertNotesInput.value = alert.notes || '';
      }
    } else {
      // Reset form
      if (this.elements.alertCropSelect) this.elements.alertCropSelect.value = '';
      if (this.elements.alertMarketSelect) this.elements.alertMarketSelect.value = '';
      if (this.elements.alertTypeSelect) this.elements.alertTypeSelect.value = 'Haut';
      if (this.elements.alertThresholdInput) this.elements.alertThresholdInput.value = '';
      if (this.elements.alertMessageInput) this.elements.alertMessageInput.value = '';
      if (this.elements.alertNotesInput) this.elements.alertNotesInput.value = '';
    }

    if (this.elements.alertModal) {
      this.elements.alertModal.classList.remove('hidden');
    }
  },

  closeAlertModal() {
    if (this.elements.alertModal) {
      this.elements.alertModal.classList.add('hidden');
    }
    this.currentAlertId = null;
  },

  saveAlert() {
    const alert = {
      id: this.currentAlertId || `PA-${Date.now()}`,
      market_name: this.elements.alertMarketSelect.value,
      crop_name: this.elements.alertCropSelect.value,
      alert_type: this.elements.alertTypeSelect.value,
      threshold_price: parseFloat(this.elements.alertThresholdInput.value) || 0,
      current_price: 0,
      trigger_date: null,
      message: this.elements.alertMessageInput.value,
      is_active: true,
      acknowledged: false,
      acknowledged_by: '',
      acknowledged_at: null,
      notes: this.elements.alertNotesInput.value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.currentAlertId) {
      this.storage.updatePriceAlert(this.currentAlertId, alert);
    } else {
      this.storage.addPriceAlert(alert);
    }

    this.closeAlertModal();
    this.loadInitialData();
    this.render();
  },

  editAlert(alertId) {
    this.openAlertModal(alertId);
  },

  deleteAlert(alertId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      this.storage.deletePriceAlert(alertId);
      this.loadInitialData();
      this.render();
    }
  },

  toggleAcknowledgeAlert(alertId) {
    const userName = 'Utilisateur Actuel'; // TODO: Get from session
    this.storage.acknowledgePriceAlert(alertId, userName);
    this.loadInitialData();
    this.render();
  },

  // ============================================================
  // VERTICAL CHART RENDERING (Elegant Market Chart)
  // ============================================================

  renderVerticalChart() {
    const container = document.getElementById('market-prices-module');
    if (!container) return;

    // Filter controls
    const period = document.getElementById('period-filter')?.value || '30';
    const cropFilter = document.getElementById('crop-filter')?.value || 'all';

    let data = this.getDemoData(period);
    
    if (cropFilter && cropFilter !== 'all') {
      data = data.filter(d => d.crop.toLowerCase().includes(cropFilter));
    }

    if (data.length === 0) {
      container.innerHTML = '<p class="text-center text-slate-400 py-8">Aucune donnée disponible</p>';
      return;
    }

    const maxPrice = Math.max(...data.map(d => d.max));
    const minPrice = Math.min(...data.map(d => d.min));
    const avgTrend = this.calculateAvgTrend(data);
    const maxValue = maxPrice * 1.1;

    // Generate vertical chart HTML
    const chartHTML = `
      <div class="bg-gradient-to-br from-white to-orange-50/70 dark:from-[#0B2112]/95 dark:to-[#061109]/95 border border-orange-100 dark:border-[#143E23]/40 rounded-3xl p-6 shadow-[0_20px_60px_-30px_rgba(249,115,22,0.35)]">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-3">
              <span class="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              Analyse verticale des prix
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white">Diagramme vertical des marchés</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 font-semibold">Prix min, moyen et max par culture sur la période sélectionnée</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span class="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"></span>
              <span class="font-bold text-slate-700 dark:text-slate-300">Prix moyen</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <span class="h-3 w-3 rounded-full bg-orange-500"></span>
              <span class="font-bold text-slate-700 dark:text-slate-300">Plage min/max</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
              <span class="h-3 w-3 rounded-full bg-slate-500"></span>
              <span class="font-bold text-slate-700 dark:text-slate-300">Tendance</span>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto pb-2">
          <div class="min-w-[720px]">
            <div class="relative h-[420px] rounded-3xl bg-slate-950/5 dark:bg-black/20 border border-white/50 dark:border-white/5 p-5">
              <div class="absolute left-5 right-5 top-5 bottom-20 flex flex-col justify-between pointer-events-none">
                ${[0.25, 0.5, 0.75, 1].map(step => {
                  const val = Math.round(maxValue * step);
                  return `
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-16">${val} FCFA</span>
                      <div class="h-px flex-1 border-t border-dashed border-slate-200 dark:border-white/10"></div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="absolute left-5 right-5 bottom-16 top-10 flex items-end justify-between gap-3">
                ${data.map((item, index) => {
                  const minHeightPct = (item.min / maxValue) * 100;
                  const avgHeightPct = (item.avg / maxValue) * 100;
                  const maxHeightPct = (item.max / maxValue) * 100;
                  const trendUp = item.trend >= 0;
                  const accentColor = trendUp ? 'emerald' : 'rose';
                  const avgColor = trendUp ? 'from-emerald-500 to-emerald-600' : 'from-rose-500 to-rose-600';
                  const minColor = trendUp ? 'border-emerald-300' : 'border-rose-300';
                  const maxColor = trendUp ? 'border-emerald-600' : 'border-rose-600';
                  const dotColor = trendUp ? 'border-emerald-500' : 'border-rose-500';
                  const textColor = trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
                  return `
                    <div class="flex-1 min-w-[140px] h-full flex flex-col items-center justify-end group">
                      <div class="flex-1 w-full flex items-end justify-center relative">
                        <!-- Min bar -->
                        <div class="absolute bottom-0 w-1.5 rounded-full bg-gradient-to-t from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 shadow-sm" 
                             style="height: ${Math.max(6, minHeightPct)}%"></div>
                        
                        <!-- Average bar -->
                        <div class="absolute bottom-0 w-12 sm:w-14 rounded-xl bg-gradient-to-t ${avgColor} shadow-lg ring-1 ring-inset ${trendUp ? 'ring-emerald-500/30' : 'ring-rose-500/30'} hover:shadow-xl transition-all duration-300 cursor-pointer"
                             style="height: ${Math.max(10, avgHeightPct)}%">
                           <div class="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-[1px]"></div>
                        </div>
                        
                        <!-- Max bar -->
                        <div class="absolute bottom-0 w-1.5 rounded-full bg-gradient-to-t ${maxColor} dark:from-${accentColor}-600 dark:to-${accentColor}-500 shadow-sm" 
                             style="height: ${Math.max(8, maxHeightPct)}%"></div>
                        
                        <!-- Average value label -->
                        <div class="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                          <div class="h-3.5 w-3.5 rounded-full bg-white dark:bg-slate-900 border-2 ${dotColor} shadow-lg ring-2 ${trendUp ? 'ring-emerald-500/20' : 'ring-rose-500/20'}"></div>
                          <span class="text-[11px] font-black ${textColor} bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md shadow-sm whitespace-nowrap">
                            ${Math.round(item.avg).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        
                        <!-- Min/Max indicators -->
                        <div class="absolute bottom-[${Math.max(2, minHeightPct)}%] -left-1">
                          <div class="h-1 w-3 rounded-full bg-slate-400/70 dark:bg-slate-300/50"></div>
                        </div>
                        <div class="absolute bottom-[${Math.max(2, maxHeightPct)}%] -right-1">
                          <div class="h-1 w-3 rounded-full ${maxColor.replace('border-', 'bg-')}"></div>
                        </div>
                        
                        <!-- Tooltip au survol -->
                        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                          <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                            <div class="flex flex-col gap-0.5">
                              <div>Min: ${Math.round(item.min).toLocaleString('fr-FR')} FCFA</div>
                              <div>Moy: ${Math.round(item.avg).toLocaleString('fr-FR')} FCFA</div>
                              <div>Max: ${Math.round(item.max).toLocaleString('fr-FR')} FCFA</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="mt-3 text-center space-y-0.5 w-full px-1">
                        <div class="h-8 flex items-center justify-center">
                          <span class="text-[11px] font-black text-slate-800 dark:text-white leading-tight line-clamp-2">${item.crop}</span>
                        </div>
                        <div class="flex items-center justify-center gap-1 ${trendUp ? 'text-emerald-500' : 'text-rose-500'} text-[11px] font-extrabold">
                          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${trendUp ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6-6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'}"></path>
                          </svg>
                          <span>${Math.abs(item.trend)}%</span>
                        </div>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold">${item.min} → ${item.avg} → ${item.max} FCFA</p>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Prix Max</p>
                <p class="text-xl font-black text-slate-900 dark:text-white mt-0.5">${maxPrice.toLocaleString('fr-FR')}</p>
                <p class="text-[10px] text-slate-500 font-semibold">FCFA</p>
              </div>
              <div class="p-2 rounded-xl bg-emerald-500/20">
                <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="rounded-2xl p-4 bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Prix Min</p>
                <p class="text-xl font-black text-slate-900 dark:text-white mt-0.5">${minPrice.toLocaleString('fr-FR')}</p>
                <p class="text-[10px] text-slate-500 font-semibold">FCFA</p>
              </div>
              <div class="p-2 rounded-xl bg-rose-500/20">
                <svg class="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="rounded-2xl p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Tendance Moy.</p>
                <p class="text-xl font-black text-slate-900 dark:text-white mt-0.5">${avgTrend}%</p>
                <p class="text-[10px] text-slate-500 font-semibold">sur la période</p>
              </div>
              <div class="p-2 rounded-xl bg-orange-500/20">
                <svg class="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6-6"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Multi-Chart Grid (Style MQL5) -->
        <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Chart 1: Prix par jour de la semaine -->
          <div class="rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4">
            <h4 class="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-3">Prix moyen par jour</h4>
            <canvas id="chart-by-day" height="180"></canvas>
          </div>

          <!-- Chart 2: Prix par mois -->
          <div class="rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4">
            <h4 class="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-3">Prix moyen par mois</h4>
            <canvas id="chart-by-month" height="180"></canvas>
          </div>

          <!-- Chart 3: Volume par jour -->
          <div class="rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4">
            <h4 class="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-3">Volume des transactions par jour</h4>
            <canvas id="chart-volume-day" height="180"></canvas>
          </div>

          <!-- Chart 4: Volume par mois -->
          <div class="rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4">
            <h4 class="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-3">Volume des transactions par mois</h4>
            <canvas id="chart-volume-month" height="180"></canvas>
          </div>
        </div>

        <!-- Price Table -->
        <div class="mt-6 bg-white dark:bg-[#0B2112]/20 border border-slate-100 dark:border-[#143E23]/30 rounded-3xl overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-[#143E23]/30">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Prix par Culture</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Prix moyen au kg sur les marchés locaux</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-[#061109]/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Culture</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Prix Min</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Prix Moyen</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Prix Max</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tendance</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Dernière MAJ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-[#143E23]/30">
                ${data.map(item => {
                  const trendColor = item.trend >= 0 ? 'text-emerald-500' : 'text-rose-500';
                  return `
                    <tr class="hover:bg-orange-50/40 dark:hover:bg-white/5 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-bold text-slate-800 dark:text-white">${item.crop}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-600 dark:text-slate-400">${item.min} FCFA</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-bold text-emerald-500">${item.avg} FCFA</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-600 dark:text-slate-400">${item.max} FCFA</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-1 ${trendColor}">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.trend >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6-6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'}"></path>
                          </svg>
                          <span class="text-sm font-bold">${Math.abs(item.trend)}%</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-500 dark:text-slate-400">${new Date(item.date).toLocaleDateString('fr-FR')}</div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = chartHTML;

    // Lucide icons initialization
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Initialize the MQL5-style multi-chart grid
    this.renderMultiCharts();
  },

  renderMultiCharts() {
    // Initialize the 4 charts in the MQL5-style grid
    this.renderChartByDay();
    this.renderChartByMonth();
    this.renderChartVolumeDay();
    this.renderChartVolumeMonth();
  },

  renderChartByDay() {
    const canvas = document.getElementById('chart-by-day');
    if (!canvas) return;

    const data = this.getDemoData('30');
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const dayData = days.map((day, i) => ({
      label: day,
      value: data.reduce((sum, d) => sum + d.avg, 0) / data.length * (0.7 + Math.random() * 0.6)
    }));

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Prix (FCFA)',
          data: dayData.map(d => d.value),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10B981',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            beginAtZero: true, 
            ticks: { color: '#9CA3AF', font: { size: 9 } },
            grid: { color: '#E5E7EB' }
          },
          x: { 
            ticks: { color: '#9CA3AF', font: { size: 9 } },
            grid: { display: false }
          }
        }
      }
    });
  },

  renderChartByMonth() {
    const canvas = document.getElementById('chart-by-month');
    if (!canvas) return;

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const data = this.getDemoData('365');
    const monthData = months.map((month, i) => ({
      label: month,
      value: data.reduce((sum, d) => sum + d.avg, 0) / data.length * (0.6 + Math.random() * 0.8)
    }));

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Prix (FCFA)',
          data: monthData.map(d => d.value),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3B82F6',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            beginAtZero: true, 
            ticks: { color: '#9CA3AF', font: { size: 9 } },
            grid: { color: '#E5E7EB' }
          },
          x: { 
            ticks: { color: '#9CA3AF', font: { size: 9 } },
            grid: { display: false }
          }
        }
      }
    });
  },

  renderChartVolumeDay() {
    const canvas = document.getElementById('chart-volume-day');
    if (!canvas) return;

    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const volumeData = days.map(() => Math.floor(5 + Math.random() * 15));

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Volume',
          data: volumeData,
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          borderColor: '#F59E0B',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            beginAtZero: true, 
            ticks: { color: '#9CA3AF', font: { size: 9 } },
            grid: { color: '#E5E7EB' }
          },
          x: { 
            ticks: { color: '#9CA3AF', font: { size: 9 } },
            grid: { display: false }
          }
        }
      }
    });
  },

  renderChartVolumeMonth() {
    const canvas = document.getElementById('chart-volume-month');
    if (!canvas) return;

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const volumeData = months.map(() => Math.floor(20 + Math.random() * 80));

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Volume',
          data: volumeData,
          backgroundColor: 'rgba(139, 92, 246, 0.7)',
          borderColor: '#8B5CF6',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            beginAtZero: true, 
            ticks: { color: '#9CA3AF', font: { size: 9 } },
            grid: { color: '#E5E7EB' }
          },
          x: { 
            ticks: { color: '#9CA3AF', font: { size: 9 } },
            grid: { display: false }
          }
        }
      }
    });
  },

  renderPriceTable() {
    // Intentionally left blank: table rendering is handled in the main view flow.
  },

  renderSummaryCards() {
    // Intentionally left blank: summary cards are rendered elsewhere in the module.
  },

  calculateAvg(data) {
    if (!data || data.length === 0) return 0;
    return Math.round(data.reduce((sum, d) => sum + d.avg, 0) / data.length);
  },

  calculateAvgTrend(data) {
    if (!data || data.length === 0) return '0.0';
    return (data.reduce((sum, d) => sum + d.trend, 0) / data.length).toFixed(1);
  },

  getDemoData(period) {
    const demoData = {
      '7': [
        { crop: 'Tomate Mongal F1', min: 200, max: 300, avg: 250, trend: 5.2, date: '2026-07-07' },
        { crop: 'Oignon Rouge de Galmi', min: 150, max: 250, avg: 200, trend: -2.1, date: '2026-07-07' },
        { crop: 'Piment Fort', min: 300, max: 450, avg: 375, trend: 8.5, date: '2026-07-07' },
        { crop: 'Pastèque', min: 100, max: 180, avg: 140, trend: 3.2, date: '2026-07-07' },
        { crop: 'Melon', min: 250, max: 400, avg: 325, trend: -1.5, date: '2026-07-07' },
      ],
      '30': [
        { crop: 'Tomate Mongal F1', min: 180, max: 320, avg: 250, trend: 5.2, date: '2026-07-07' },
        { crop: 'Oignon Rouge de Galmi', min: 140, max: 260, avg: 200, trend: -2.1, date: '2026-07-07' },
        { crop: 'Piment Fort', min: 280, max: 480, avg: 375, trend: 8.5, date: '2026-07-07' },
        { crop: 'Pastèque', min: 90, max: 190, avg: 140, trend: 3.2, date: '2026-07-07' },
        { crop: 'Melon', min: 230, max: 420, avg: 325, trend: -1.5, date: '2026-07-07' },
      ],
      '90': [
        { crop: 'Tomate Mongal F1', min: 170, max: 330, avg: 250, trend: 5.2, date: '2026-07-07' },
        { crop: 'Oignon Rouge de Galmi', min: 130, max: 270, avg: 200, trend: -2.1, date: '2026-07-07' },
        { crop: 'Piment Fort', min: 260, max: 500, avg: 375, trend: 8.5, date: '2026-07-07' },
        { crop: 'Pastèque', min: 80, max: 200, avg: 140, trend: 3.2, date: '2026-07-07' },
        { crop: 'Melon', min: 220, max: 440, avg: 325, trend: -1.5, date: '2026-07-07' },
      ],
      '365': [
        { crop: 'Tomate Mongal F1', min: 150, max: 350, avg: 250, trend: 5.2, date: '2026-07-07' },
        { crop: 'Oignon Rouge de Galmi', min: 120, max: 280, avg: 200, trend: -2.1, date: '2026-07-07' },
        { crop: 'Piment Fort', min: 250, max: 550, avg: 375, trend: 8.5, date: '2026-07-07' },
        { crop: 'Pastèque', min: 70, max: 220, avg: 140, trend: 3.2, date: '2026-07-07' },
        { crop: 'Melon', min: 200, max: 500, avg: 325, trend: -1.5, date: '2026-07-07' },
      ]
    };
    return demoData[period] || demoData['30'];
  }
};

// Module initialized by app.js or fallback script in HTML