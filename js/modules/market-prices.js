// KA Farm - Module Prix du Marché
// Graphique simple d'évolution des prix

import { KAStorage } from '../storage.js';

export const MarketPricesModule = {
  state: {
    selectedRegion: 'Niayes',
    selectedCrop: '',
    selectedSeason: 'Hivernage',
    priceAlertThreshold: 0,
    alertType: 'Haut',
    searchQuery: '',
    viewMode: 'prices'
  },

  regions: ['Niayes', 'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Mbour', 'Fatick', 'Diourbel'],
  seasons: ['Hivernage', 'Sèche', 'Contre-saison', 'Toute l\'année'],
  crops: ['Tomate Mongal F1', 'Oignon Rouge de Galmi', 'Chou Cabus', 'Menthe de Thiès', 'Piment Oiseau', 'Aubergine'],

  async init() {
    this.storage = KAStorage;
    await this.waitForElements();
    this.cacheElements();
    this.setupListeners();
    this.loadInitialData();
    this.renderSinglePriceChart();
    window.MarketPricesInitialized = true;
  },

  waitForElements() {
    return new Promise((resolve) => {
      const check = () => {
        const container = document.getElementById('market-prices-module');
        const filters = document.getElementById('period-filter');
        if (container && filters) resolve();
        else setTimeout(check, 100);
      };
      check();
    });
  },

  cacheElements() {
    this.elements = {
      statTotalPrices: document.getElementById('stat-total-prices'),
      statAvgPrice: document.getElementById('stat-avg-price'),
      statActiveAlerts: document.getElementById('stat-active-alerts'),
      statTrendsCount: document.getElementById('stat-trends-count'),
      viewPricesBtn: document.getElementById('view-prices'),
      viewTrendsBtn: document.getElementById('view-trends'),
      viewAlertsBtn: document.getElementById('view-alerts'),
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
      alertCropSelect: document.getElementById('alert-crop'),
      alertMarketSelect: document.getElementById('alert-market'),
      alertTypeSelect: document.getElementById('alert-type'),
      alertThresholdInput: document.getElementById('alert-threshold'),
      alertMessageInput: document.getElementById('alert-message'),
      alertNotesInput: document.getElementById('alert-notes'),
      pricesTableBody: document.getElementById('prices-table-body'),
      trendsTableBody: document.getElementById('trends-table-body'),
      alertsTableBody: document.getElementById('alerts-table-body'),
      priceModal: document.getElementById('price-modal'),
      trendModal: document.getElementById('trend-modal'),
      alertModal: document.getElementById('alert-modal'),
      priceTrendChart: document.getElementById('price-trend-chart'),
      seasonComparisonChart: document.getElementById('season-comparison-chart')
    };
  },

  setupListeners() {
    if (this.elements.viewPricesBtn) this.elements.viewPricesBtn.addEventListener('click', () => this.switchView('prices'));
    if (this.elements.viewTrendsBtn) this.elements.viewTrendsBtn.addEventListener('click', () => this.switchView('trends'));
    if (this.elements.viewAlertsBtn) this.elements.viewAlertsBtn.addEventListener('click', () => this.switchView('alerts'));

    if (this.elements.priceModal) {
      const savePriceBtn = this.elements.priceModal.querySelector('[data-save-price]');
      if (savePriceBtn) savePriceBtn.addEventListener('click', () => this.savePrice());
      const closePriceBtn = this.elements.priceModal.querySelector('[data-close-price]');
      if (closePriceBtn) closePriceBtn.addEventListener('click', () => this.closePriceModal());
    }

    if (this.elements.trendModal) {
      const saveTrendBtn = this.elements.trendModal.querySelector('[data-save-trend]');
      if (saveTrendBtn) saveTrendBtn.addEventListener('click', () => this.saveTrend());
      const closeTrendBtn = this.elements.trendModal.querySelector('[data-close-trend]');
      if (closeTrendBtn) closeTrendBtn.addEventListener('click', () => this.closeTrendModal());
    }

    if (this.elements.alertModal) {
      const saveAlertBtn = this.elements.alertModal.querySelector('[data-save-alert]');
      if (saveAlertBtn) saveAlertBtn.addEventListener('click', () => this.saveAlert());
      const closeAlertBtn = this.elements.alertModal.querySelector('[data-close-alert]');
      if (closeAlertBtn) closeAlertBtn.addEventListener('click', () => this.closeAlertModal());
    }

    const addPriceBtn = document.getElementById('add-price-btn');
    if (addPriceBtn) addPriceBtn.addEventListener('click', () => this.openPriceModal());

    const addTrendBtn = document.getElementById('add-trend-btn');
    if (addTrendBtn) addTrendBtn.addEventListener('click', () => this.openTrendModal());

    const addAlertBtn = document.getElementById('add-alert-btn');
    if (addAlertBtn) addAlertBtn.addEventListener('click', () => this.openAlertModal());

    const periodFilter = document.getElementById('period-filter');
    if (periodFilter) periodFilter.addEventListener('change', () => this.renderSinglePriceChart());

    const cropFilter = document.getElementById('crop-filter');
    if (cropFilter) cropFilter.addEventListener('change', () => this.renderSinglePriceChart());
  },

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

    if (this.elements.statTotalPrices) this.elements.statTotalPrices.textContent = totalPrices;
    if (this.elements.statAvgPrice) this.elements.statAvgPrice.textContent = Math.round(avgPrice).toLocaleString('fr-FR');
    if (this.elements.statActiveAlerts) this.elements.statActiveAlerts.textContent = activeAlertsCount;
    if (this.elements.statTrendsCount) this.elements.statTrendsCount.textContent = totalTrends;
  },

  switchView(mode) {
    this.state.viewMode = mode;
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

    const pricesSection = document.getElementById('prices-section');
    const trendsSection = document.getElementById('trends-section');
    const alertsSection = document.getElementById('alerts-section');

    if (pricesSection) pricesSection.classList.toggle('hidden', mode !== 'prices');
    if (trendsSection) trendsSection.classList.toggle('hidden', mode !== 'trends');
    if (alertsSection) alertsSection.classList.toggle('hidden', mode !== 'alerts');

    this.render();
  },

  render() {
    this.updateStats();
    switch (this.state.viewMode) {
      case 'prices': this.renderPrices(); break;
      case 'trends': this.renderTrends(); break;
      case 'alerts': this.renderAlerts(); break;
    }
  },

  renderPrices() {
    if (!this.elements.pricesTableBody) return;
    let prices = this.storage.getMarketPrices();
    if (this.state.selectedRegion) prices = prices.filter(p => p.region === this.state.selectedRegion);
    if (this.state.selectedCrop) prices = prices.filter(p => p.crop_name === this.state.selectedCrop);
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      prices = prices.filter(p => p.crop_name.toLowerCase().includes(query) || p.market_name.toLowerCase().includes(query) || p.region.toLowerCase().includes(query));
    }
    prices.sort((a, b) => new Date(b.price_date) - new Date(a.price_date));

    this.elements.pricesTableBody.innerHTML = prices.map(price => `
      <tr class="border-b border-gray-700 hover:bg-gray-800/50">
        <td class="px-4 py-3 whitespace-nowrap">${price.crop_name}</td>
        <td class="px-4 py-3">${price.market_name}</td>
        <td class="px-4 py-3">${price.region}</td>
        <td class="px-4 py-3 text-right">${price.price_fcfa.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3">${price.unit}</td>
        <td class="px-4 py-3">${new Date(price.price_date).toLocaleDateString('fr-FR')}</td>
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs ${this.getSupplyLevelColor(price.supply_level)}">${price.supply_level}</span></td>
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs ${this.getDemandLevelColor(price.demand_level)}">${price.demand_level}</span></td>
        <td class="px-4 py-3 whitespace-nowrap">
          <button onclick="MarketPricesModule.editPrice('${price.id}')" class="text-yellow-400 hover:text-yellow-300 mr-2"><i data-lucide="pencil"></i></button>
          <button onclick="MarketPricesModule.deletePrice('${price.id}')" class="text-red-400 hover:text-red-300"><i data-lucide="trash-2"></i></button>
        </td>
      </tr>
    `).join('');
    this.renderLucideIcons();
  },

  renderTrends() {
    if (!this.elements.trendsTableBody) return;
    let trends = this.storage.getSeasonTrends();
    if (this.state.selectedRegion) trends = trends.filter(t => t.region === this.state.selectedRegion);
    if (this.state.selectedCrop) trends = trends.filter(t => t.crop_name === this.state.selectedCrop);
    if (this.state.selectedSeason) trends = trends.filter(t => t.season === this.state.selectedSeason);
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      trends = trends.filter(t => t.crop_name.toLowerCase().includes(query) || t.region.toLowerCase().includes(query));
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
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs ${this.getTrendDirectionColor(trend.trend_direction)}">${trend.trend_direction}</span></td>
        <td class="px-4 py-3 text-right">${(trend.trend_strength * 100).toFixed(0)}%</td>
        <td class="px-4 py-3 text-right">${trend.prediction_next_month.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3 whitespace-nowrap">
          <button onclick="MarketPricesModule.editTrend('${trend.id}')" class="text-yellow-400 hover:text-yellow-300 mr-2"><i data-lucide="pencil"></i></button>
          <button onclick="MarketPricesModule.deleteTrend('${trend.id}')" class="text-red-400 hover:text-red-300"><i data-lucide="trash-2"></i></button>
        </td>
      </tr>
    `).join('');
    this.renderLucideIcons();
  },

  renderAlerts() {
    if (!this.elements.alertsTableBody) return;
    let alerts = this.storage.getPriceAlerts();
    if (this.state.selectedCrop) alerts = alerts.filter(a => a.crop_name === this.state.selectedCrop);
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      alerts = alerts.filter(a => a.crop_name.toLowerCase().includes(query) || a.market_name.toLowerCase().includes(query));
    }
    alerts.sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      if (a.acknowledged !== b.acknowledged) return b.acknowledged ? -1 : 1;
      return new Date(b.trigger_date || b.created_at) - new Date(a.trigger_date || a.created_at);
    });

    this.elements.alertsTableBody.innerHTML = alerts.map(alert => `
      <tr class="border-b border-gray-700 hover:bg-gray-800/50 ${!alert.is_active ? 'opacity-50' : ''}">
        <td class="px-4 py-3"><input type="checkbox" ${alert.acknowledged ? 'checked' : ''} onclick="MarketPricesModule.toggleAcknowledgeAlert('${alert.id}')" class="rounded border-gray-600 bg-gray-800"></td>
        <td class="px-4 py-3 whitespace-nowrap">${alert.crop_name}</td>
        <td class="px-4 py-3">${alert.market_name}</td>
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs ${alert.alert_type === 'Haut' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}">${alert.alert_type}</span></td>
        <td class="px-4 py-3 text-right">${alert.threshold_price.toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3 text-right">${(alert.current_price || 0).toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3">${alert.trigger_date ? new Date(alert.trigger_date).toLocaleDateString('fr-FR') : '-'}</td>
        <td class="px-4 py-3 whitespace-nowrap">
          <button onclick="MarketPricesModule.editAlert('${alert.id}')" class="text-yellow-400 hover:text-yellow-300 mr-2"><i data-lucide="pencil"></i></button>
          <button onclick="MarketPricesModule.deleteAlert('${alert.id}')" class="text-red-400 hover:text-red-300"><i data-lucide="trash-2"></i></button>
        </td>
      </tr>
    `).join('');
    this.renderLucideIcons();
  },

  renderSinglePriceChart() {
    const container = document.getElementById('market-prices-module');
    if (!container) return;

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
    const avgPrice = Math.round(data.reduce((s, d) => s + d.avg, 0) / data.length);
    const avgTrend = this.calculateAvgTrend(data);

    const labels = data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    });

    const minValues = data.map(d => d.min);
    const avgValues = data.map(d => d.avg);
    const maxValues = data.map(d => d.max);

    const chartHTML = `
      <div class="bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-6 shadow-lg">
        <div class="mb-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Évolution des prix
          </div>
          <h3 class="text-lg font-black text-slate-900 dark:text-white">Prix du marché - ${period} derniers jours</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Suivi quotidien des prix par culture (FCFA)</p>
        </div>

        <div class="relative" style="height: 320px;">
          <canvas id="single-price-chart"></canvas>
        </div>

        <div class="flex flex-wrap items-center gap-4 mt-4 text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="h-3 w-3 rounded bg-rose-500/60"></span>
            <span>Prix min</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="h-3 w-3 rounded bg-emerald-500"></span>
            <span>Prix moyen</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="h-3 w-3 rounded bg-emerald-700/60"></span>
            <span>Prix max</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 mt-4">
          <div class="rounded-xl p-3 bg-rose-500/10 border border-rose-500/20 text-center">
            <p class="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Min</p>
            <p class="text-sm font-black text-slate-900 dark:text-white mt-0.5">${minPrice.toLocaleString('fr-FR')}</p>
            <p class="text-[10px] text-slate-500 font-semibold">FCFA</p>
          </div>
          <div class="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Moy</p>
            <p class="text-sm font-black text-slate-900 dark:text-white mt-0.5">${avgPrice.toLocaleString('fr-FR')}</p>
            <p class="text-[10px] text-slate-500 font-semibold">FCFA</p>
          </div>
          <div class="rounded-xl p-3 bg-emerald-700/10 border border-emerald-700/20 text-center">
            <p class="text-[10px] text-emerald-700 dark:text-emerald-500 font-bold uppercase">Max</p>
            <p class="text-sm font-black text-slate-900 dark:text-white mt-0.5">${maxPrice.toLocaleString('fr-FR')}</p>
            <p class="text-[10px] text-slate-500 font-semibold">FCFA</p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = chartHTML;

    if (window.lucide) window.lucide.createIcons();

    const canvas = document.getElementById('single-price-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (this.singlePriceChartInstance) this.singlePriceChartInstance.destroy();

    this.singlePriceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Prix min',
            data: minValues,
            borderColor: 'rgba(244, 63, 94, 0.6)',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5
          },
          {
            label: 'Prix moyen',
            data: avgValues,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#10B981',
            pointBorderWidth: 2
          },
          {
            label: 'Prix max',
            data: maxValues,
            borderColor: 'rgba(6, 78, 59, 0.6)',
            backgroundColor: 'rgba(6, 78, 59, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 26, 11, 0.95)',
            titleColor: '#7ec850',
            bodyColor: '#E5E7EB',
            borderColor: '#7ec850',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toLocaleString('fr-FR') + ' FCFA';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              color: '#9CA3AF',
              font: { size: 10 },
              callback: function(value) { return value.toLocaleString('fr-FR'); }
            },
            grid: { color: '#E5E7EB' }
          },
          x: {
            ticks: { color: '#9CA3AF', font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
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
    if (this.priceTrendChartInstance) this.priceTrendChartInstance.destroy();
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
        plugins: { legend: { labels: { color: '#E5E7EB' } } },
        scales: {
          y: { beginAtZero: false, ticks: { color: '#E5E7EB' }, grid: { color: '#374151' } },
          x: { ticks: { color: '#E5E7EB' }, grid: { color: '#374151' } }
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
    const crops = [...new Set(seasonTrends.map(t => t.crop_name))];
    const datasets = crops.map(crop => {
      const cropData = seasonTrends.filter(t => t.crop_name === crop);
      return {
        label: crop,
        data: regions.map(region => { const trend = cropData.find(t => t.region === region); return trend ? trend.avg_price : 0; }),
        backgroundColor: this.getRandomColor()
      };
    });
    const ctx = this.elements.seasonComparisonChart.getContext('2d');
    if (this.seasonComparisonChartInstance) this.seasonComparisonChartInstance.destroy();
    this.seasonComparisonChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels: regions, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#E5E7EB' } } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#E5E7EB' }, grid: { color: '#374151' } },
          x: { ticks: { color: '#E5E7EB' }, grid: { color: '#374151' } }
        }
      }
    });
  },

  getRandomColor() {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EAB308'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  getSupplyLevelColor(level) {
    const colors = { 'Faible': 'bg-red-800 text-red-200', 'Normale': 'bg-blue-800 text-blue-200', 'Élevée': 'bg-green-800 text-green-200' };
    return colors[level] || 'bg-gray-800 text-gray-200';
  },

  getDemandLevelColor(level) {
    const colors = { 'Faible': 'bg-red-800 text-red-200', 'Normale': 'bg-blue-800 text-blue-200', 'Élevée': 'bg-green-800 text-green-200' };
    return colors[level] || 'bg-gray-800 text-gray-200';
  },

  getTrendDirectionColor(direction) {
    const colors = { 'Hausse': 'bg-green-800 text-green-200', 'Baisse': 'bg-red-800 text-red-200', 'Stable': 'bg-blue-800 text-blue-200' };
    return colors[direction] || 'bg-gray-800 text-gray-200';
  },

  renderLucideIcons() {
    if (typeof lucide === 'undefined') return;
    document.querySelectorAll('[data-lucide]').forEach(el => {
      const iconName = el.getAttribute('data-lucide');
      el.innerHTML = lucide.create(iconName);
    });
  },

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
    if (this.elements.priceModal) this.elements.priceModal.classList.remove('hidden');
  },

  closePriceModal() {
    if (this.elements.priceModal) this.elements.priceModal.classList.add('hidden');
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
    if (this.currentPriceId) this.storage.updateMarketPrice(this.currentPriceId, price);
    else this.storage.addMarketPrice(price);
    this.closePriceModal();
    this.loadInitialData();
    this.render();
  },

  editPrice(priceId) { this.openPriceModal(priceId); },
  deletePrice(priceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      this.storage.deleteMarketPrice(priceId);
      this.loadInitialData();
      this.render();
    }
  },

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
    if (this.elements.trendModal) this.elements.trendModal.classList.remove('hidden');
  },

  closeTrendModal() {
    if (this.elements.trendModal) this.elements.trendModal.classList.add('hidden');
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
    if (this.currentTrendId) this.storage.updateSeasonTrend(this.currentTrendId, trend);
    else this.storage.addSeasonTrend(trend);
    this.closeTrendModal();
    this.loadInitialData();
    this.render();
  },

  editTrend(trendId) { this.openTrendModal(trendId); },
  deleteTrend(trendId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tendance ?')) {
      this.storage.deleteSeasonTrend(trendId);
      this.loadInitialData();
      this.render();
    }
  },

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
      if (this.elements.alertCropSelect) this.elements.alertCropSelect.value = '';
      if (this.elements.alertMarketSelect) this.elements.alertMarketSelect.value = '';
      if (this.elements.alertTypeSelect) this.elements.alertTypeSelect.value = 'Haut';
      if (this.elements.alertThresholdInput) this.elements.alertThresholdInput.value = '';
      if (this.elements.alertMessageInput) this.elements.alertMessageInput.value = '';
      if (this.elements.alertNotesInput) this.elements.alertNotesInput.value = '';
    }
    if (this.elements.alertModal) this.elements.alertModal.classList.remove('hidden');
  },

  closeAlertModal() {
    if (this.elements.alertModal) this.elements.alertModal.classList.add('hidden');
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
    if (this.currentAlertId) this.storage.updatePriceAlert(this.currentAlertId, alert);
    else this.storage.addPriceAlert(alert);
    this.closeAlertModal();
    this.loadInitialData();
    this.render();
  },

  editAlert(alertId) { this.openAlertModal(alertId); },
  deleteAlert(alertId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      this.storage.deletePriceAlert(alertId);
      this.loadInitialData();
      this.render();
    }
  },

  toggleAcknowledgeAlert(alertId) {
    const userName = 'Utilisateur Actuel';
    this.storage.acknowledgePriceAlert(alertId, userName);
    this.loadInitialData();
    this.render();
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
        { crop: 'Melon', min: 250, max: 400, avg: 325, trend: -1.5, date: '2026-07-07' }
      ],
      '30': [
        { crop: 'Tomate Mongal F1', min: 180, max: 320, avg: 250, trend: 5.2, date: '2026-07-07' },
        { crop: 'Oignon Rouge de Galmi', min: 140, max: 260, avg: 200, trend: -2.1, date: '2026-07-07' },
        { crop: 'Piment Fort', min: 280, max: 480, avg: 375, trend: 8.5, date: '2026-07-07' },
        { crop: 'Pastèque', min: 90, max: 190, avg: 140, trend: 3.2, date: '2026-07-07' },
        { crop: 'Melon', min: 230, max: 420, avg: 325, trend: -1.5, date: '2026-07-07' }
      ],
      '90': [
        { crop: 'Tomate Mongal F1', min: 170, max: 330, avg: 250, trend: 5.2, date: '2026-07-07' },
        { crop: 'Oignon Rouge de Galmi', min: 130, max: 270, avg: 200, trend: -2.1, date: '2026-07-07' },
        { crop: 'Piment Fort', min: 260, max: 500, avg: 375, trend: 8.5, date: '2026-07-07' },
        { crop: 'Pastèque', min: 80, max: 200, avg: 140, trend: 3.2, date: '2026-07-07' },
        { crop: 'Melon', min: 220, max: 440, avg: 325, trend: -1.5, date: '2026-07-07' }
      ],
      '365': [
        { crop: 'Tomate Mongal F1', min: 150, max: 350, avg: 250, trend: 5.2, date: '2026-07-07' },
        { crop: 'Oignon Rouge de Galmi', min: 120, max: 280, avg: 200, trend: -2.1, date: '2026-07-07' },
        { crop: 'Piment Fort', min: 250, max: 550, avg: 375, trend: 8.5, date: '2026-07-07' },
        { crop: 'Pastèque', min: 70, max: 220, avg: 140, trend: 3.2, date: '2026-07-07' },
        { crop: 'Melon', min: 200, max: 500, avg: 325, trend: -1.5, date: '2026-07-07' }
      ]
    };
    return demoData[period] || demoData['30'];
  }
};

// Module initialized by app.js or fallback script in HTML