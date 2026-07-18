// KA Farm - Module Simulateur de Marge Brute avec Coût de Transport
// Fonctionnalité 2.4 : Simulateur de marge brute intégrant le coût du transport

import { KAStorage } from '../storage.js';

// ============================================================
// MAIN MODULE EXPORT
// ============================================================

export const MarginSimulatorModule = {
  // State management
  state: {
    selectedCrop: '',
    quantityKg: 1000,
    sellingPricePerKg: 500,
    fromRegion: 'Niayes',
    toRegion: 'Dakar',
    vehicleType: 'Camion',
    otherCosts: 0,
    selectedSimulationForEdit: null,
    searchQuery: ''
  },

  // Available regions in Senegal
  regions: ['Niayes', 'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Mbour', 'Fatick', 'Diourbel'],

  // ============================================================
  // INITIALIZATION
  // ============================================================

  init() {
    this.storage = KAStorage;
    this.cacheElements();
    this.setupListeners();
    this.render();
    this.loadInitialData();
  },

  cacheElements() {
    this.elements = {
      // Statistics
      statTotalSimulations: document.getElementById('stat-total-simulations'),
      statTotalRevenue: document.getElementById('stat-total-revenue'),
      statAvgMargin: document.getElementById('stat-avg-margin'),
      
      // Simulator form
      cropSelect: document.getElementById('simulator-crop'),
      quantityInput: document.getElementById('simulator-quantity'),
      priceInput: document.getElementById('simulator-price'),
      fromRegionSelect: document.getElementById('simulator-from-region'),
      toRegionSelect: document.getElementById('simulator-to-region'),
      vehicleSelect: document.getElementById('simulator-vehicle'),
      otherCostsInput: document.getElementById('simulator-other-costs'),
      
      // Results
      grossRevenueDisplay: document.getElementById('result-gross-revenue'),
      transportCostDisplay: document.getElementById('result-transport-cost'),
      otherCostsDisplay: document.getElementById('result-other-costs'),
      totalCostsDisplay: document.getElementById('result-total-costs'),
      netRevenueDisplay: document.getElementById('result-net-revenue'),
      marginPercentDisplay: document.getElementById('result-margin-percent'),
      
      // Comparison
      comparisonContainer: document.getElementById('comparison-results'),
      
      // History
      simulationsTableBody: document.getElementById('simulations-table-body'),
      simulationsSearch: document.getElementById('simulations-search'),
      
      // Modals
      marginSimulatorModal: document.getElementById('margin-simulator-modal'),
      transportRatesModal: document.getElementById('transport-rates-modal'),
      simulationDetailModal: document.getElementById('simulation-detail-modal'),
      deleteSimulationModal: document.getElementById('delete-simulation-modal'),
      
      // Transport rates management
      ratesTableBody: document.getElementById('rates-table-body'),
      addRateForm: document.getElementById('add-rate-form'),
      rateForm: document.getElementById('rate-form'),
      
      // Modal elements
      simulationDetailContent: document.getElementById('simulation-detail-content'),
      deleteSimulationMessage: document.getElementById('delete-simulation-message')
    };
  },

  loadInitialData() {
    // Load crops into select
    this.loadCropOptions();
    
    // Load regions into selects
    this.loadRegionOptions();
    
    // Set default values
    if (this.elements.quantityInput) this.elements.quantityInput.value = '1000';
    if (this.elements.priceInput) this.elements.priceInput.value = '500';
    if (this.elements.otherCostsInput) this.elements.otherCostsInput.value = '0';
  },

  // ============================================================
  // MAIN RENDER METHOD
  // ============================================================

  render() {
    this.renderStatistics();
    this.renderSimulationsHistory();
    this.renderTransportRatesTable();
  },

  // ============================================================
  // STATISTICS
  // ============================================================

  renderStatistics() {
    const stats = this.storage.getMarginStats();
    
    if (this.elements.statTotalSimulations) {
      this.elements.statTotalSimulations.textContent = stats.totalSimulations || 0;
    }
    if (this.elements.statTotalRevenue) {
      this.elements.statTotalRevenue.textContent = `${this.formatNumber(stats.totalRevenue || 0)} F`;
    }
    if (this.elements.statAvgMargin) {
      this.elements.statAvgMargin.textContent = `${stats.avgMarginPercent || 0}%`;
    }
  },

  // ============================================================
  // SIMULATOR
  // ============================================================

  loadCropOptions() {
    const crops = this.storage.getCrops();
    const select = this.elements.cropSelect;
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Sélectionner une culture --</option>';
    
    crops.forEach(crop => {
      const option = document.createElement('option');
      option.value = crop.name;
      option.textContent = crop.name;
      select.appendChild(option);
    });
  },

  loadRegionOptions() {
    const fromSelect = this.elements.fromRegionSelect;
    const toSelect = this.elements.toRegionSelect;
    
    if (!fromSelect || !toSelect) return;
    
    const regionOptions = this.regions.map(region => 
      `<option value="${region}">${region}</option>`
    ).join('');
    
    fromSelect.innerHTML = `<option value="">-- Région de départ --</option>${regionOptions}`;
    toSelect.innerHTML = `<option value="">-- Région de destination --</option>${regionOptions}`;
    
    // Set defaults
    fromSelect.value = 'Niayes';
    toSelect.value = 'Dakar';
  },

  calculateMargin() {
    const crop = this.elements.cropSelect?.value || '';
    const quantityKg = parseFloat(this.elements.quantityInput?.value) || 0;
    const pricePerKg = parseFloat(this.elements.priceInput?.value) || 0;
    const fromRegion = this.elements.fromRegionSelect?.value || '';
    const toRegion = this.elements.toRegionSelect?.value || '';
    const vehicleType = this.elements.vehicleSelect?.value || 'Camion';
    const otherCosts = parseFloat(this.elements.otherCostsInput?.value) || 0;
    
    if (!fromRegion || !toRegion || quantityKg <= 0 || pricePerKg <= 0) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    
    // Calculate transport cost
    const transportCost = this.storage.calculateTransportCost(quantityKg, fromRegion, toRegion, vehicleType);
    
    // Calculate net margin
    const margin = this.storage.calculateNetMargin(pricePerKg, quantityKg, transportCost, otherCosts);
    
    // Update state
    this.state = {
      ...this.state,
      selectedCrop: crop,
      quantityKg,
      sellingPricePerKg: pricePerKg,
      fromRegion,
      toRegion,
      vehicleType,
      otherCosts
    };
    
    // Update results
    this.updateResultsDisplay(margin, transportCost, otherCosts);
    
    // Update comparison
    this.updateComparisonResults();
  },

  updateResultsDisplay(margin, transportCost, otherCosts) {
    const gross = this.elements.grossRevenueDisplay;
    const transport = this.elements.transportCostDisplay;
    const other = this.elements.otherCostsDisplay;
    const totalCosts = this.elements.totalCostsDisplay;
    const net = this.elements.netRevenueDisplay;
    const percent = this.elements.marginPercentDisplay;
    
    if (gross) gross.textContent = `${this.formatNumber(margin.grossRevenue)} F`;
    if (transport) transport.textContent = `${this.formatNumber(transportCost)} F`;
    if (other) other.textContent = `${this.formatNumber(otherCosts)} F`;
    if (totalCosts) totalCosts.textContent = `${this.formatNumber(transportCost + otherCosts)} F`;
    if (net) net.textContent = `${this.formatNumber(margin.netRevenue)} F`;
    if (percent) {
      percent.textContent = `${margin.marginPercent}%`;
      percent.className = `text-2xl font-black ${margin.marginPercent >= 70 ? 'text-emerald-500' : margin.marginPercent >= 50 ? 'text-amber-500' : 'text-rose-500'}`;
    }
  },

  updateComparisonResults() {
    const container = this.elements.comparisonContainer;
    if (!container) return;
    
    const { quantityKg, sellingPricePerKg, otherCosts } = this.state;
    const currentToRegion = this.state.toRegion;
    
    // Get all possible destination regions except current
    const otherRegions = this.regions.filter(r => r !== currentToRegion && r !== this.state.fromRegion);
    
    container.innerHTML = '<h4 class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Comparaison avec d\'autres destinations</h4>';
    
    otherRegions.slice(0, 3).forEach(region => {
      const transportCost = this.storage.calculateTransportCost(quantityKg, this.state.fromRegion, region, this.state.vehicleType);
      const margin = this.storage.calculateNetMargin(sellingPricePerKg, quantityKg, transportCost, otherCosts);
      
      container.innerHTML += `
        <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-slate-800 dark:text-white">${region}</span>
            <span class="font-bold text-${margin.marginPercent >= 70 ? 'emerald' : margin.marginPercent >= 50 ? 'amber' : 'rose'}-500">${margin.marginPercent}%</span>
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#819888]">
            <span>Transport: ${this.formatNumber(transportCost)} F</span>
            <span>Marge nette: ${this.formatNumber(margin.netRevenue)} F</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-[#143E23]/40 rounded-full h-1.5 mt-2">
            <div class="bg-${margin.marginPercent >= 70 ? 'emerald' : margin.marginPercent >= 50 ? 'amber' : 'rose'}-500 h-1.5 rounded-full" style="width: ${margin.marginPercent}%"></div>
          </div>
        </div>
      `;
    });
  },

  saveSimulation() {
    const { selectedCrop, quantityKg, sellingPricePerKg, fromRegion, toRegion, vehicleType, otherCosts } = this.state;
    
    if (!selectedCrop || !fromRegion || !toRegion || quantityKg <= 0 || sellingPricePerKg <= 0) {
      this.showToast('Veuillez calculer une marge d\'abord', 'error');
      return;
    }
    
    const transportCost = this.storage.calculateTransportCost(quantityKg, fromRegion, toRegion, vehicleType);
    const margin = this.storage.calculateNetMargin(sellingPricePerKg, quantityKg, transportCost, otherCosts);
    
    const simulation = {
      id: `MS-${Date.now()}`,
      crop_name: selectedCrop,
      quantity_kg: quantityKg,
      selling_price_per_kg_fcfa: sellingPricePerKg,
      destination_region: toRegion,
      transport_cost_fcfa: transportCost,
      other_costs_fcfa: otherCosts,
      gross_revenue_fcfa: margin.grossRevenue,
      net_revenue_fcfa: margin.netRevenue,
      margin_percent: margin.marginPercent,
      simulation_date: new Date().toISOString(),
      from_region: fromRegion,
      vehicle_type: vehicleType,
      notes: `Simulation pour ${selectedCrop} vers ${toRegion}`
    };
    
    this.storage.addMarginSimulation(simulation);
    this.showToast(`Simulation enregistrée: ${selectedCrop} → ${toRegion}`, 'success');
    this.render();
    this.closeSimulatorModal();
  },

  clearForm() {
    if (this.elements.cropSelect) this.elements.cropSelect.value = '';
    if (this.elements.quantityInput) this.elements.quantityInput.value = '1000';
    if (this.elements.priceInput) this.elements.priceInput.value = '500';
    if (this.elements.fromRegionSelect) this.elements.fromRegionSelect.value = 'Niayes';
    if (this.elements.toRegionSelect) this.elements.toRegionSelect.value = 'Dakar';
    if (this.elements.vehicleSelect) this.elements.vehicleSelect.value = 'Camion';
    if (this.elements.otherCostsInput) this.elements.otherCostsInput.value = '0';
    
    this.updateResultsDisplay({
      grossRevenue: 0,
      netRevenue: 0,
      marginPercent: 0,
      totalCosts: 0
    }, 0, 0);
    
    if (this.elements.comparisonContainer) {
      this.elements.comparisonContainer.innerHTML = '';
    }
  },

  // ============================================================
  // SIMULATIONS HISTORY
  // ============================================================

  renderSimulationsHistory() {
    const container = this.elements.simulationsTableBody;
    if (!container) return;
    
    let simulations = this.storage.getMarginSimulations();
    
    // Apply search filter
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      simulations = simulations.filter(s => 
        s.crop_name.toLowerCase().includes(query) ||
        s.destination_region.toLowerCase().includes(query) ||
        s.from_region.toLowerCase().includes(query)
      );
    }
    
    if (simulations.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400 dark:text-[#819888]">
            <i data-lucide="calculator" class="h-8 w-8 mx-auto mb-2 opacity-50"></i>
            <p class="text-sm">Aucune simulation trouvée</p>
          </td>
        </tr>
      `;
      return;
    }
    
    container.innerHTML = simulations.map(simulation => `
      <tr class="border-b border-slate-200 dark:border-[#143E23]/40 hover:bg-slate-50 dark:hover:bg-[#0D2615]/30 transition-colors">
        <td class="py-4 px-4">
          <p class="font-bold text-slate-800 dark:text-white">${simulation.crop_name}</p>
        </td>
        <td class="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-200">${this.formatNumber(simulation.quantity_kg)} kg</td>
        <td class="py-4 px-4 text-sm font-mono text-purple-500">${this.formatNumber(simulation.selling_price_per_kg_fcfa)} F/kg</td>
        <td class="py-4 px-4 text-center">
          <span class="px-2 py-0.5 bg-slate-100 dark:bg-[#0D2615]/50 text-slate-600 dark:text-slate-300 font-bold text-[9px] rounded">
            ${simulation.from_region} → ${simulation.destination_region}
          </span>
        </td>
        <td class="py-4 px-4 text-center font-mono text-rose-500">${this.formatNumber(simulation.transport_cost_fcfa)} F</td>
        <td class="py-4 px-4 text-center font-bold text-${simulation.margin_percent >= 70 ? 'emerald' : simulation.margin_percent >= 50 ? 'amber' : 'rose'}-500">
          ${simulation.margin_percent}%
        </td>
        <td class="py-4 px-4">
          <div class="flex items-center justify-center gap-2">
            <button onclick="window.showSimulationDetail('${simulation.id}')" class="p-2 hover:bg-slate-200 dark:hover:bg-[#143E23] rounded-lg transition-colors cursor-pointer">
              <i data-lucide="eye" class="h-4 w-4 text-slate-500 dark:text-slate-400"></i>
            </button>
            <button onclick="window.deleteSimulation('${simulation.id}')" class="p-2 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4 text-rose-500"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  filterSimulations() {
    this.state.searchQuery = this.elements.simulationsSearch?.value || '';
    this.renderSimulationsHistory();
  },

  showSimulationDetail(simulationId) {
    const simulation = this.storage.getMarginSimulationById(simulationId);
    if (!simulation) return;
    
    const content = this.elements.simulationDetailContent;
    if (!content) return;
    
    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl">
          <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Informations de la Simulation</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Culture</p>
              <p class="font-bold text-slate-800 dark:text-white">${simulation.crop_name}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
              <p class="font-bold text-slate-800 dark:text-white">${this.formatDate(simulation.simulation_date)}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Quantité</p>
              <p class="font-bold text-emerald-500">${this.formatNumber(simulation.quantity_kg)} kg</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Prix/kg</p>
              <p class="font-bold text-purple-500">${this.formatNumber(simulation.selling_price_per_kg_fcfa)} F</p>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl">
          <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Trajet et Coûts</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">De / Vers</p>
              <p class="font-bold text-slate-800 dark:text-white">${simulation.from_region} → ${simulation.destination_region}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Véhicule</p>
              <p class="font-bold text-slate-800 dark:text-white">${simulation.vehicle_type}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Coût Transport</p>
              <p class="font-bold text-rose-500">${this.formatNumber(simulation.transport_cost_fcfa)} F</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Autres Coûts</p>
              <p class="font-bold text-rose-500">${this.formatNumber(simulation.other_costs_fcfa)} F</p>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl">
          <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Résultats</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-slate-600 dark:text-slate-300">Revenu brut</span>
              <span class="font-bold text-emerald-500 text-lg">${this.formatNumber(simulation.gross_revenue_fcfa)} F</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-slate-600 dark:text-slate-300">Revenu net</span>
              <span class="font-bold text-${simulation.margin_percent >= 70 ? 'emerald' : simulation.margin_percent >= 50 ? 'amber' : 'rose'}-500 text-lg">${this.formatNumber(simulation.net_revenue_fcfa)} F</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-slate-600 dark:text-slate-300">Marge</span>
              <span class="font-bold text-${simulation.margin_percent >= 70 ? 'emerald' : simulation.margin_percent >= 50 ? 'amber' : 'rose'}-500 text-lg">${simulation.margin_percent}%</span>
            </div>
          </div>
          <div class="w-full bg-slate-200 dark:bg-[#143E23]/40 rounded-full h-2 mt-3">
            <div class="bg-${simulation.margin_percent >= 70 ? 'emerald' : simulation.margin_percent >= 50 ? 'amber' : 'rose'}-500 h-2 rounded-full" style="width: ${simulation.margin_percent}%"></div>
          </div>
        </div>
        
        ${simulation.notes ? `
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl">
          <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Notes</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300">${simulation.notes}</p>
        </div>
        ` : ''}
      </div>
    `;
    
    this.openSimulationDetailModal();
  },

  deleteSimulation(simulationId) {
    this.state.selectedSimulationForEdit = simulationId;
    this.elements.deleteSimulationModal?.classList.remove('hidden');
    this.elements.deleteSimulationMessage.textContent = `Êtes-vous sûr de vouloir supprimer cette simulation? Cette action est irréversible.`;
  },

  confirmDeleteSimulation() {
    if (!this.state.selectedSimulationForEdit) return;
    
    this.storage.deleteMarginSimulation(this.state.selectedSimulationForEdit);
    this.closeDeleteSimulationModal();
    this.showToast('Simulation supprimée', 'success');
    this.render();
    this.state.selectedSimulationForEdit = null;
  },

  // ============================================================
  // TRANSPORT RATES MANAGEMENT
  // ============================================================

  renderTransportRatesTable() {
    const container = this.elements.ratesTableBody;
    if (!container) return;
    
    const rates = this.storage.getTransportRates();
    
    if (rates.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 text-center text-slate-400 dark:text-[#819888]">
            <i data-lucide="truck" class="h-8 w-8 mx-auto mb-2 opacity-50"></i>
            <p class="text-sm">Aucun tarif de transport enregistré</p>
          </td>
        </tr>
      `;
      return;
    }
    
    container.innerHTML = rates.map(rate => `
      <tr class="border-b border-slate-200 dark:border-[#143E23]/40 hover:bg-slate-50 dark:hover:bg-[#0D2615]/30 transition-colors">
        <td class="py-4 px-4 font-bold text-slate-800 dark:text-white">${rate.region_from} → ${rate.region_to}</td>
        <td class="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">${rate.vehicle_type}</td>
        <td class="py-4 px-4 text-sm font-mono text-purple-500">${this.formatNumber(rate.rate_per_ton_fcfa)} F/t</td>
        <td class="py-4 px-4 text-sm font-mono text-cyan-500">${this.formatNumber(rate.rate_per_km_fcfa)} F/km</td>
        <td class="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">${rate.distance_km} km</td>
        <td class="py-4 px-4">
          <div class="flex items-center justify-center gap-2">
            <button onclick="window.editTransportRate('${rate.id}')" class="p-2 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer">
              <i data-lucide="edit-2" class="h-4 w-4 text-amber-500"></i>
            </button>
            <button onclick="window.deleteTransportRate('${rate.id}')" class="p-2 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4 text-rose-500"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  showAddRateForm() {
    this.elements.addRateForm?.classList.remove('hidden');
    
    document.getElementById('rate-id').value = '';
    document.getElementById('rate-from').value = '';
    document.getElementById('rate-to').value = '';
    document.getElementById('rate-vehicle').value = 'Camion';
    document.getElementById('rate-per-ton').value = '25000';
    document.getElementById('rate-per-km').value = '150';
    document.getElementById('rate-distance').value = '50';
    document.getElementById('rate-min-load').value = '500';
    document.getElementById('rate-max-load').value = '10000';
    document.getElementById('rate-notes').value = '';
    
    this.state.selectedRateForEdit = null;
  },

  hideRateForm() {
    this.elements.addRateForm?.classList.add('hidden');
  },

  editTransportRate(rateId) {
    const rate = this.storage.getTransportRateById(rateId);
    if (!rate) return;
    
    this.showAddRateForm();
    
    document.getElementById('rate-id').value = rate.id;
    document.getElementById('rate-from').value = rate.region_from;
    document.getElementById('rate-to').value = rate.region_to;
    document.getElementById('rate-vehicle').value = rate.vehicle_type;
    document.getElementById('rate-per-ton').value = rate.rate_per_ton_fcfa;
    document.getElementById('rate-per-km').value = rate.rate_per_km_fcfa;
    document.getElementById('rate-distance').value = rate.distance_km;
    document.getElementById('rate-min-load').value = rate.min_load_kg;
    document.getElementById('rate-max-load').value = rate.max_load_kg;
    document.getElementById('rate-notes').value = rate.notes || '';
    
    this.state.selectedRateForEdit = rateId;
  },

  saveTransportRate(event) {
    event.preventDefault();
    
    const id = document.getElementById('rate-id').value;
    const from = document.getElementById('rate-from').value;
    const to = document.getElementById('rate-to').value;
    const vehicle = document.getElementById('rate-vehicle').value;
    const perTon = parseInt(document.getElementById('rate-per-ton').value) || 0;
    const perKm = parseInt(document.getElementById('rate-per-km').value) || 0;
    const distance = parseInt(document.getElementById('rate-distance').value) || 0;
    const minLoad = parseInt(document.getElementById('rate-min-load').value) || 0;
    const maxLoad = parseInt(document.getElementById('rate-max-load').value) || 0;
    const notes = document.getElementById('rate-notes').value;
    
    if (!from || !to) {
      this.showToast('Les régions de départ et de destination sont obligatoires', 'error');
      return;
    }
    
    const rate = {
      id: id || `TR-${Date.now()}`,
      region_from: from,
      region_to: to,
      vehicle_type: vehicle,
      rate_per_ton_fcfa: perTon,
      rate_per_km_fcfa: perKm,
      distance_km: distance,
      min_load_kg: minLoad,
      max_load_kg: maxLoad,
      notes
    };
    
    if (id) {
      this.storage.updateTransportRate(id, rate);
      this.showToast(`Tarif ${from} → ${to} mis à jour`, 'success');
    } else {
      this.storage.addTransportRate(rate);
      this.showToast(`Nouveau tarif: ${from} → ${to}`, 'success');
    }
    
    this.hideRateForm();
    this.renderTransportRatesTable();
  },

  deleteTransportRate(rateId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif?')) return;
    
    this.storage.deleteTransportRate(rateId);
    this.showToast('Tarif supprimé', 'success');
    this.renderTransportRatesTable();
  },

  cancelRateForm() {
    this.hideRateForm();
  },

  // ============================================================
  // MODAL MANAGEMENT
  // ============================================================

  openSimulatorModal() {
    this.elements.marginSimulatorModal?.classList.remove('hidden');
    this.loadCropOptions();
    this.loadRegionOptions();
    this.clearForm();
  },

  closeSimulatorModal() {
    this.elements.marginSimulatorModal?.classList.add('hidden');
    this.clearForm();
  },

  openTransportRatesModal() {
    this.elements.transportRatesModal?.classList.remove('hidden');
    this.renderTransportRatesTable();
    this.hideRateForm();
  },

  closeTransportRatesModal() {
    this.elements.transportRatesModal?.classList.add('hidden');
  },

  openSimulationDetailModal() {
    this.elements.simulationDetailModal?.classList.remove('hidden');
  },

  closeSimulationDetailModal() {
    this.elements.simulationDetailModal?.classList.add('hidden');
  },

  openDeleteSimulationModal() {
    this.elements.deleteSimulationModal?.classList.remove('hidden');
  },

  closeDeleteSimulationModal() {
    this.elements.deleteSimulationModal?.classList.add('hidden');
  },

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  },

  formatDate(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  },

  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg z-60 flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in-0 duration-300`;
    
    const colors = {
      success: 'bg-emerald-500 text-white',
      error: 'bg-rose-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-amber-500 text-white'
    };
    
    toast.classList.add(colors[type] || colors.info);
    
    const icons = {
      success: 'check-circle',
      error: 'alert-circle',
      info: 'info',
      warning: 'alert-triangle'
    };
    
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" class="h-5 w-5"></i>
      <span class="font-bold">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out-0', 'slide-out-to-bottom-4', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  refreshMarginData() {
    this.render();
    this.showToast('Données actualisées', 'success');
  },

  // ============================================================
  // SETUP LISTENERS
  // ============================================================

  setupListeners() {
    // Quantity and price inputs - calculate on change
    if (this.elements.quantityInput) {
      this.elements.quantityInput.addEventListener('input', () => this.calculateMargin());
    }
    if (this.elements.priceInput) {
      this.elements.priceInput.addEventListener('input', () => this.calculateMargin());
    }
    if (this.elements.fromRegionSelect) {
      this.elements.fromRegionSelect.addEventListener('change', () => this.calculateMargin());
    }
    if (this.elements.toRegionSelect) {
      this.elements.toRegionSelect.addEventListener('change', () => this.calculateMargin());
    }
    if (this.elements.vehicleSelect) {
      this.elements.vehicleSelect.addEventListener('change', () => this.calculateMargin());
    }
    if (this.elements.otherCostsInput) {
      this.elements.otherCostsInput.addEventListener('input', () => this.calculateMargin());
    }
    
    // Search input
    if (this.elements.simulationsSearch) {
      this.elements.simulationsSearch.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        this.renderSimulationsHistory();
      });
    }
    
    // Expose methods to window
    window.calculateMargin = () => this.calculateMargin();
    window.saveSimulation = () => this.saveSimulation();
    window.clearMarginForm = () => this.clearForm();
    window.filterSimulations = () => this.filterSimulations();
    window.showSimulationDetail = (id) => this.showSimulationDetail(id);
    window.deleteSimulation = (id) => this.deleteSimulation(id);
    window.confirmDeleteSimulation = () => this.confirmDeleteSimulation();
    
    window.openSimulatorModal = () => this.openSimulatorModal();
    window.closeSimulatorModal = () => this.closeSimulatorModal();
    
    window.openTransportRatesModal = () => this.openTransportRatesModal();
    window.closeTransportRatesModal = () => this.closeTransportRatesModal();
    window.showAddRateForm = () => this.showAddRateForm();
    window.editTransportRate = (id) => this.editTransportRate(id);
    window.saveTransportRate = (e) => this.saveTransportRate(e);
    window.deleteTransportRate = (id) => this.deleteTransportRate(id);
    window.cancelRateForm = () => this.cancelRateForm();
    
    window.closeSimulationDetailModal = () => this.closeSimulationDetailModal();
    window.closeDeleteSimulationModal = () => this.closeDeleteSimulationModal();
    window.refreshMarginData = () => this.refreshMarginData();
  }
};

// Export to window for global access
export default MarginSimulatorModule;
window.MarginSimulatorModule = MarginSimulatorModule;

// Auto-initialize if page is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => MarginSimulatorModule.init(), 100);
} else {
  document.addEventListener('DOMContentLoaded', () => MarginSimulatorModule.init());
}
