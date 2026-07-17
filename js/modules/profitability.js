// KA Farm - Calculateur de Rentabilité par Culture Module
import { KAStorage } from '../storage.js';
import { ErrorHandler } from './error-handler.js';

let cropProfits = [];
let parcelles = [];
let chartInstance = null;

// Crop categories with emojis and colors
const CROP_CATEGORIES = {
  'Tomate': { emoji: '🍅', color: 'emerald' },
  'Oignon': { emoji: '🧅', color: 'amber' },
  'Piment': { emoji: '🌶️', color: 'rose' },
  'Gombo': { emoji: '🥬', color: 'green' },
  'Aubergine': { emoji: '🍆', color: 'purple' },
  'Chou': { emoji: '🥬', color: 'teal' },
  'Poivron': { emoji: '🌶️', color: 'orange' },
  'Laitue': { emoji: '🥬', color: 'lime' },
  'Menthe': { emoji: '🌿', color: 'cyan' }
};

// Default color palette for chart
const CHART_COLORS = [
  '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
  '#fbbf24', '#f59e0b', '#d97706', '#92400e', '#78350f',
  '#ef4444', '#f87171', '#dc2626', '#b91c1c', '#991b1b',
  '#8b5cf6', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8'
];

export const ProfitabilityModule = {
  init() {
    try {
      cropProfits = KAStorage.getCropProfits();
      parcelles = KAStorage.getParcelles();

      this.render();
      this.setupListeners();
      this.loadParcels();
      this.initChart();
    } catch (err) {
      ErrorHandler.log(err, 'ProfitabilityModule.init');
    }
  },

  loadParcels() {
    const parcelSelect = document.getElementById('form-profit-parcel');
    if (parcelSelect) {
      parcelSelect.innerHTML = '<option value="">-- Sélectionner une parcelle --</option>';
      parcelles.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        parcelSelect.appendChild(option);
      });
    }
  },

  render() {
    this.renderStats();
    this.renderTable();
    this.renderTopCrops();
    this.updateChart();
  },

  renderStats() {
    const totalCrops = cropProfits.length;
    const totalMargin = cropProfits.reduce((sum, c) => sum + (c.netMargin || 0), 0);
    const totalYield = cropProfits.reduce((sum, c) => sum + (c.yieldKg || 0), 0);
    
    // Find best and worst crops
    const sortedByMargin = [...cropProfits].sort((a, b) => (b.netMargin || 0) - (a.netMargin || 0));
    const bestCrop = sortedByMargin[0];
    const worstCrop = sortedByMargin.length > 0 ? sortedByMargin[sortedByMargin.length - 1] : null;
    
    // Update DOM
    const elTotalCrops = document.getElementById('stat-total-crops');
    const elTotalMargin = document.getElementById('stat-total-margin');
    const elBestCrop = document.getElementById('stat-best-crop');
    const elWorstCrop = document.getElementById('stat-worst-crop');
    const elTotalYield = document.getElementById('stat-total-yield');
    
    if (elTotalCrops) elTotalCrops.textContent = totalCrops;
    if (elTotalMargin) elTotalMargin.textContent = `${totalMargin.toLocaleString('fr-FR')} F`;
    if (elTotalYield) elTotalYield.textContent = `${totalYield.toLocaleString('fr-FR')} kg`;
    if (elBestCrop) elBestCrop.textContent = bestCrop ? `${CROP_CATEGORIES[bestCrop.cropName]?.emoji || '🌱'} ${bestCrop.cropName}` : 'Aucune';
    if (elWorstCrop) {
      elWorstCrop.textContent = worstCrop ? `${CROP_CATEGORIES[worstCrop.cropName]?.emoji || '🌱'} ${worstCrop.cropName}` : 'Aucune';
      // Style worst crop in red if margin is negative
      if (worstCrop && (worstCrop.netMargin || 0) < 0) {
        elWorstCrop.className = 'text-lg font-black text-rose-500 font-mono';
      }
    }
  },

  renderTable() {
    const tableBody = document.getElementById('profitability-table-body');
    if (!tableBody) return;
    
    if (cropProfits.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-4 py-8 text-center text-slate-400">
            <p class="text-xs font-bold">Aucune analyse de rentabilité enregistrée.</p>
            <p class="text-[10px] mt-1">Commencez par ajouter une analyse via le bouton ci-dessus.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    // Sort by net margin (highest first)
    const sortedProfits = [...cropProfits].sort((a, b) => (b.netMargin || 0) - (a.netMargin || 0));
    
    tableBody.innerHTML = sortedProfits.map((profit, index) => {
      const cropInfo = CROP_CATEGORIES[profit.cropName] || { emoji: '🌱', color: 'slate' };
      const isPositive = (profit.netMargin || 0) >= 0;
      const isNegative = (profit.netMargin || 0) < 0;
      
      return `
        <tr 
          class="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0D2615]/25 transition-all border-b border-slate-100 dark:border-[#143E23]/20"
          onclick="window.showProfitDetail('${profit.id}')"
        >
          <td class="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
            ${cropInfo.emoji} ${profit.cropName}
            ${profit.parcelName ? `<span class="block text-[9px] text-[#819888] font-medium">${profit.parcelName}</span>` : ''}
          </td>
          <td class="px-4 py-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">${(profit.yieldKg || 0).toLocaleString('fr-FR')}</td>
          <td class="px-4 py-3.5 font-mono font-bold text-emerald-500">${(profit.revenue || 0).toLocaleString('fr-FR')}</td>
          <td class="px-4 py-3.5 font-mono font-bold text-rose-500">${(profit.totalCost || 0).toLocaleString('fr-FR')}</td>
          <td class="px-4 py-3.5 font-mono font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}">
            ${isPositive ? '+' : ''}${Math.round(profit.netMargin || 0).toLocaleString('fr-FR')}
          </td>
          <td class="px-4 py-3.5 font-mono font-bold ${isNegative ? 'text-rose-500' : 'text-emerald-500'}">
            ${(profit.profitabilityPercent || 0).toFixed(1)}%
          </td>
          <td class="px-4 py-3.5 text-center">
            <div class="inline-flex items-center gap-1" onclick="event.stopPropagation()">
              <button onclick="window.showProfitDetail('${profit.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                <i data-lucide="eye" class="h-3.5 w-3.5"></i>
              </button>
              <button onclick="window.editProfit('${profit.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all cursor-pointer">
                <i data-lucide="edit-2" class="h-3.5 w-3.5"></i>
              </button>
              <button onclick="window.deleteProfit('${profit.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
                <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderTopCrops() {
    const topCropsList = document.getElementById('top-crops-list');
    if (!topCropsList) return;
    
    // Sort by net margin descending
    const sorted = [...cropProfits].sort((a, b) => (b.netMargin || 0) - (a.netMargin || 0));
    const top5 = sorted.slice(0, 5);
    
    if (top5.length === 0) {
      topCropsList.innerHTML = '<p class="text-[11px] text-slate-400 text-center py-4">Aucune donnée disponible</p>';
      return;
    }
    
    topCropsList.innerHTML = top5.map((profit, index) => {
      const cropInfo = CROP_CATEGORIES[profit.cropName] || { emoji: '🌱' };
      const percentage = profit.netMargin > 0 ? ((profit.netMargin / (profit.totalCost || 1)) * 100).toFixed(1) : 0;
      
      return `
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
          <div class="flex justify-between items-start gap-3">
            <div class="flex items-center gap-3">
              <span class="text-xl">${cropInfo.emoji}</span>
              <div>
                <p class="text-sm font-black text-slate-800 dark:text-white">#${index + 1} ${profit.cropName}</p>
                <p class="text-[10px] text-[#819888] mt-0.5">Marge: ${(profit.netMargin || 0).toLocaleString('fr-FR')} F</p>
              </div>
            </div>
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              ${percentage}%
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  initChart() {
    const ctx = document.getElementById('profitability-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const labels = cropProfits.map(p => p.cropName);
    const data = cropProfits.map(p => p.netMargin || 0);
    const backgroundColors = cropProfits.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]);
    
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value.toLocaleString('fr-FR')} F (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  },

  updateChart() {
    if (!chartInstance) {
      this.initChart();
      return;
    }
    
    const labels = cropProfits.map(p => p.cropName);
    const data = cropProfits.map(p => p.netMargin || 0);
    const backgroundColors = cropProfits.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]);
    
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = backgroundColors;
    chartInstance.update();
  },

  setupListeners() {
    // Search
    const searchInput = document.getElementById('profitability-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterProfits(e.target.value);
      });
    }
    
    // Form input listeners for live calculation
    const formInputs = [
      'form-profit-yield', 'form-profit-price', 
      'form-profit-seeds', 'form-profit-fertilizer', 
      'form-profit-water', 'form-profit-labor'
    ];
    
    formInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => this.calculateFormValues());
      }
    });
  },

  filterProfits(query) {
    // For now, just re-render (filtering could be implemented if needed)
    this.render();
  },

  calculateFormValues() {
    const yieldInput = document.getElementById('form-profit-yield');
    const priceInput = document.getElementById('form-profit-price');
    const seedsInput = document.getElementById('form-profit-seeds');
    const fertilizerInput = document.getElementById('form-profit-fertilizer');
    const waterInput = document.getElementById('form-profit-water');
    const laborInput = document.getElementById('form-profit-labor');
    
    const yieldKg = parseFloat(yieldInput?.value || 0);
    const pricePerKg = parseFloat(priceInput?.value || 0);
    const seedsCost = parseFloat(seedsInput?.value || 0);
    const fertilizerCost = parseFloat(fertilizerInput?.value || 0);
    const waterCost = parseFloat(waterInput?.value || 0);
    const laborCost = parseFloat(laborInput?.value || 0);
    
    const revenue = yieldKg * pricePerKg;
    const totalCost = seedsCost + fertilizerCost + waterCost + laborCost;
    const netMargin = revenue - totalCost;
    const profitability = totalCost > 0 ? (netMargin / totalCost) * 100 : 0;
    
    // Update calculation display
    const calcRevenue = document.getElementById('calc-revenue');
    const calcCost = document.getElementById('calc-cost');
    const calcMargin = document.getElementById('calc-margin');
    const calcProfitability = document.getElementById('calc-profitability');
    
    if (calcRevenue) calcRevenue.textContent = `${Math.round(revenue).toLocaleString('fr-FR')} F`;
    if (calcCost) calcCost.textContent = `${Math.round(totalCost).toLocaleString('fr-FR')} F`;
    if (calcMargin) {
      calcMargin.textContent = `${Math.round(netMargin).toLocaleString('fr-FR')} F`;
      calcMargin.className = `text-lg font-black ${netMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'} font-mono`;
    }
    if (calcProfitability) {
      calcProfitability.textContent = `${profitability.toFixed(1)}%`;
      calcProfitability.className = `text-lg font-black ${profitability >= 0 ? 'text-emerald-500' : 'text-rose-500'} font-mono`;
    }
  },

  calculateProfitabilityData(cropName, yieldKg, pricePerKg, costs) {
    const revenue = yieldKg * pricePerKg;
    const totalCost = Object.values(costs).reduce((sum, cost) => sum + (parseFloat(cost) || 0), 0);
    const netMargin = revenue - totalCost;
    const profitabilityPercent = totalCost > 0 ? (netMargin / totalCost) * 100 : 0;
    
    return {
      revenue,
      totalCost,
      netMargin,
      profitabilityPercent
    };
  }
};

// Window functions for modal management
window.openAddProfitModal = () => {
  const modal = document.getElementById('add-profit-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Set default date to today
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('form-profit-period').value = todayStr;
    
    // Reset form
    document.getElementById('add-profit-form').reset();
    document.getElementById('form-profit-id').value = '';
    
    // Reset calculations
    const calcElements = ['calc-revenue', 'calc-cost', 'calc-margin', 'calc-profitability'];
    calcElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '0 F';
        el.className = el.className.replace(/text-(emerald|rose)-500/, 'text-slate-800 dark:text-white');
      }
    });
    
    // Load parcels
    ProfitabilityModule.loadParcels();
  }
};

window.closeAddProfitModal = () => {
  const modal = document.getElementById('add-profit-modal');
  if (modal) modal.classList.add('hidden');
};

window.submitAddProfit = (e) => {
  e.preventDefault();
  
  const cropSelect = document.getElementById('form-profit-crop');
  const parcelSelect = document.getElementById('form-profit-parcel');
  const yieldInput = document.getElementById('form-profit-yield');
  const priceInput = document.getElementById('form-profit-price');
  const seedsInput = document.getElementById('form-profit-seeds');
  const fertilizerInput = document.getElementById('form-profit-fertilizer');
  const waterInput = document.getElementById('form-profit-water');
  const laborInput = document.getElementById('form-profit-labor');
  const periodInput = document.getElementById('form-profit-period');
  const notesInput = document.getElementById('form-profit-notes');
  const idInput = document.getElementById('form-profit-id');
  
  if (!cropSelect || !yieldInput || !priceInput) {
    ErrorHandler.showToast('Veuillez remplir les champs obligatoires: Culture, Production et Prix de vente.', 'error');
    return;
  }
  
  const cropName = cropSelect.value;
  const parcelId = parcelSelect?.value || '';
  const parcel = parcelles.find(p => p.id === parcelId);
  const parcelName = parcel ? parcel.name : '';
  const yieldKg = parseFloat(yieldInput.value) || 0;
  const pricePerKg = parseFloat(priceInput.value) || 0;
  const costs = {
    seeds: parseFloat(seedsInput?.value || 0),
    fertilizer: parseFloat(fertilizerInput?.value || 0),
    water: parseFloat(waterInput?.value || 0),
    labor: parseFloat(laborInput?.value || 0)
  };
  const period = periodInput?.value || '';
  const notes = notesInput?.value || '';
  const existingId = idInput?.value || '';
  
  // Calculate profitability
  const { revenue, totalCost, netMargin, profitabilityPercent } = 
    ProfitabilityModule.calculateProfitabilityData(cropName, yieldKg, pricePerKg, costs);
  
  const newProfit = {
    id: existingId || `PROF-${Date.now()}`,
    cropName,
    parcelId,
    parcelName,
    yieldKg,
    pricePerKg,
    revenue,
    costs,
    totalCost,
    netMargin,
    profitabilityPercent,
    period,
    notes,
    createdAt: existingId ? new Date().toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enterprise_id: 'ka_farm'
  };
  
  if (existingId) {
    // Update existing
    const index = cropProfits.findIndex(c => c.id === existingId);
    if (index !== -1) {
      cropProfits[index] = newProfit;
    }
  } else {
    // Add new
    cropProfits.push(newProfit);
  }
  
  KAStorage.setCropProfits(cropProfits);
  
  ProfitabilityModule.render();
  window.closeAddProfitModal();
  
  // Show success message
  ErrorHandler.showToast(`Analyse de rentabilité pour ${cropName} enregistrée avec succès ! Marge nette: ${Math.round(netMargin).toLocaleString('fr-FR')} F`, 'success');
};

window.editProfit = (id) => {
  const profit = cropProfits.find(p => p.id === id);
  if (!profit) return;
  
  // Set form values
  document.getElementById('form-profit-id').value = profit.id;
  document.getElementById('form-profit-crop').value = profit.cropName;
  document.getElementById('form-profit-parcel').value = profit.parcelId || '';
  document.getElementById('form-profit-yield').value = profit.yieldKg || 0;
  document.getElementById('form-profit-price').value = profit.pricePerKg || 0;
  document.getElementById('form-profit-seeds').value = profit.costs?.seeds || 0;
  document.getElementById('form-profit-fertilizer').value = profit.costs?.fertilizer || 0;
  document.getElementById('form-profit-water').value = profit.costs?.water || 0;
  document.getElementById('form-profit-labor').value = profit.costs?.labor || 0;
  document.getElementById('form-profit-period').value = profit.period || '';
  document.getElementById('form-profit-notes').value = profit.notes || '';
  
  // Update calculations
  ProfitabilityModule.calculateFormValues();
  
  // Open modal
  const modal = document.getElementById('add-profit-modal');
  if (modal) modal.classList.remove('hidden');
};

window.deleteProfit = (id) => {
  const profit = cropProfits.find(p => p.id === id);
  if (!profit) return;
  
  const cropName = profit.cropName;
  
  // Set up delete modal
  const deleteModal = document.getElementById('delete-confirm-modal');
  const confirmBtn = document.getElementById('confirm-delete-btn');
  
  if (deleteModal && confirmBtn) {
    // Store the ID to delete
    confirmBtn.onclick = () => {
      cropProfits = cropProfits.filter(p => p.id !== id);
      KAStorage.setCropProfits(cropProfits);
      ProfitabilityModule.render();
      window.closeDeleteModal();
      ErrorHandler.showToast(`Analyse de rentabilité pour ${cropName} supprimée avec succès.`, 'success');
    };
    
    deleteModal.classList.remove('hidden');
  }
};

window.closeDeleteModal = () => {
  const modal = document.getElementById('delete-confirm-modal');
  if (modal) modal.classList.add('hidden');
  const confirmBtn = document.getElementById('confirm-delete-btn');
  if (confirmBtn) confirmBtn.onclick = null;
};

window.showProfitDetail = (id) => {
  const profit = cropProfits.find(p => p.id === id);
  if (!profit) return;
  
  const cropInfo = CROP_CATEGORIES[profit.cropName] || { emoji: '🌱' };
  const isPositive = profit.netMargin >= 0;
  const isNegative = profit.netMargin < 0;
  
  const content = document.getElementById('profit-detail-content');
  if (content) {
    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 bg-emerald-500/5 dark:bg-emerald-950/5 rounded-2xl border border-emerald-500/20">
          <p class="text-xs font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="bar-chart-3" class="h-3 w-3"></i> Analyse de Rentabilité #${profit.id}
          </p>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mt-2">
            ${cropInfo.emoji} ${profit.cropName}
          </h3>
          ${profit.parcelName ? `<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">📍 ${profit.parcelName}</p>` : ''}
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Production:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${profit.yieldKg.toLocaleString('fr-FR')} kg</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Prix de vente:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${profit.pricePerKg.toLocaleString('fr-FR')} F/kg</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Revenu total:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${Math.round(profit.revenue).toLocaleString('fr-FR')} F</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Période:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${profit.period || 'Non spécifiée'}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Coût total:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${Math.round(profit.totalCost).toLocaleString('fr-FR')} F</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Marge nette:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${Math.round(profit.netMargin).toLocaleString('fr-FR')} F</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Rentabilité:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${profit.profitabilityPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        ${profit.costs ? `
          <div class="p-3 bg-slate-50 dark:bg-[#061109]/30 rounded-xl">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Détail des coûts:</p>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
              <div class="flex justify-between"><span class="text-slate-500">Semences:</span> <span class="font-mono">${(profit.costs.seeds || 0).toLocaleString('fr-FR')} F</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Engrais:</span> <span class="font-mono">${(profit.costs.fertilizer || 0).toLocaleString('fr-FR')} F</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Eau:</span> <span class="font-mono">${(profit.costs.water || 0).toLocaleString('fr-FR')} F</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Main d'œuvre:</span> <span class="font-mono">${(profit.costs.labor || 0).toLocaleString('fr-FR')} F</span></div>
            </div>
          </div>
        ` : ''}
        
        <div class="p-3 ${isPositive ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-rose-500/5 border border-rose-500/20'} rounded-xl">
          <p class="text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'} uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="${isPositive ? 'check-circle' : 'alert-triangle'}" class="h-3 w-3"></i> Statut
          </p>
          <p class="text-lg font-black text-slate-800 dark:text-white mt-1">
            ${isPositive ? '✅ EXCELLENTE RENTABILITÉ' : isNegative ? '⚠️ DÉFICITAIRE - À REVOIR' : '➖ ÉQUILIBRÉ'}
          </p>
        </div>
        
        ${profit.notes ? `
          <div class="space-y-1">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes:</p>
            <p class="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl">${profit.notes}</p>
          </div>
        ` : ''}
        
        <div class="flex justify-end gap-2 pt-2">
          <button onclick="window.closeProfitDetailModal(); window.editProfit('${profit.id}')" class="px-4 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#143E23] border border-slate-200 dark:border-[#143E23] text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="edit-2" class="h-3.5 w-3.5"></i> Modifier
          </button>
          <button onclick="window.closeProfitDetailModal(); window.deleteProfit('${profit.id}')" class="px-4 py-2 bg-rose-100 dark:bg-rose-950/20 hover:bg-rose-200 dark:hover:bg-rose-950/30 border border-rose-500/20 text-rose-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Supprimer
          </button>
        </div>
      </div>
    `;
  }
  
  const modal = document.getElementById('profit-detail-modal');
  if (modal) modal.classList.remove('hidden');
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

window.closeProfitDetailModal = () => {
  const modal = document.getElementById('profit-detail-modal');
  if (modal) modal.classList.add('hidden');
};

window.exportProfitability = () => {
  const dataStr = JSON.stringify(cropProfits, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `kafarm-rentabilite-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Start module when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ProfitabilityModule.init();
  });
} else {
  ProfitabilityModule.init();
}

// Live update listener
document.addEventListener('ka_data_updated', () => {
  cropProfits = KAStorage.getCropProfits();
  parcelles = KAStorage.getParcelles();
  ProfitabilityModule.render();
});
