// KA Farm - Journal des Récoltes Module
import { KAStorage } from '../storage.js';

let harvests = [];
let parcelles = [];
let crops = [];
let chartInstance = null;

// Quality color mapping
const QUALITY_COLORS = {
  'Choix A': { color: '#059669', label: 'Excellente', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  'Choix B': { color: '#f59e0b', label: 'Bonne', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  'Choix C': { color: '#ef4444', label: 'Standard', badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20' }
};

// Crop emoji mapping
const CROP_EMOJIS = {
  'Tomate': '🍅', 'Oignon': '🧅', 'Piment': '🌶️', 'Gombo': '🥬',
  'Aubergine': '🍆', 'Chou': '🥬', 'Poivron': '🌶️', 'Laitue': '🥬', 'Menthe': '🌿'
};

// Chart colors
const CHART_COLORS = ['#059669', '#f59e0b', '#ef4444'];

export const HarvestsModule = {
  init() {
    harvests = KAStorage.getHarvests();
    parcelles = KAStorage.getParcelles();
    crops = KAStorage.getCrops();
    
    this.render();
    this.setupListeners();
    this.loadParcelsAndCrops();
    this.initChart();
  },

  loadParcelsAndCrops() {
    const parcelSelect = document.getElementById('form-harvest-parcel');
    
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
    this.renderRecentHarvests();
    this.updateChart();
  },

  renderStats() {
    const totalHarvests = harvests.length;
    const totalYield = harvests.reduce((sum, h) => sum + (h.weightKg || 0), 0);
    
    // Calculate quality distribution
    const qualityCounts = { 'Choix A': 0, 'Choix B': 0, 'Choix C': 0 };
    harvests.forEach(h => {
      const quality = h.quality || 'Choix C';
      if (qualityCounts[quality] !== undefined) {
        qualityCounts[quality]++;
      }
    });
    
    const total = totalHarvests > 0 ? totalHarvests : 1;
    const qualityAPercent = ((qualityCounts['Choix A'] / total) * 100).toFixed(1);
    const qualityBPercent = ((qualityCounts['Choix B'] / total) * 100).toFixed(1);
    const qualityCPercent = ((qualityCounts['Choix C'] / total) * 100).toFixed(1);
    
    // Update DOM
    const elTotalHarvests = document.getElementById('stat-total-harvests');
    const elTotalYield = document.getElementById('stat-total-yield');
    const elQualityA = document.getElementById('stat-quality-a');
    const elQualityB = document.getElementById('stat-quality-b');
    const elQualityC = document.getElementById('stat-quality-c');
    
    if (elTotalHarvests) elTotalHarvests.textContent = totalHarvests;
    if (elTotalYield) elTotalYield.textContent = `${totalYield.toLocaleString('fr-FR')} kg`;
    if (elQualityA) elQualityA.textContent = `${qualityAPercent}%`;
    if (elQualityB) elQualityB.textContent = `${qualityBPercent}%`;
    if (elQualityC) elQualityC.textContent = `${qualityCPercent}%`;
  },

  renderTable() {
    const tableBody = document.getElementById('harvests-table-body');
    if (!tableBody) return;
    
    // Filter by quality if selected
    const qualityFilter = document.getElementById('harvests-filter-quality')?.value || '';
    const filteredHarvests = qualityFilter 
      ? harvests.filter(h => h.quality === qualityFilter)
      : harvests;
    
    // Sort by date (most recent first)
    const sortedHarvests = [...filteredHarvests].sort((a, b) => {
      const dateA = new Date(a.harvestDate || a.date);
      const dateB = new Date(b.harvestDate || b.date);
      return dateB - dateA;
    });
    
    if (sortedHarvests.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-4 py-8 text-center text-slate-400">
            <p class="text-xs font-bold">Aucune récolte enregistrée.</p>
            <p class="text-[10px] mt-1">Commencez par ajouter une récolte via le bouton ci-dessus.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tableBody.innerHTML = sortedHarvests.map((harvest, index) => {
      const cropEmoji = CROP_EMOJIS[harvest.cropType || harvest.cropName] || '🌱';
      const qualityInfo = QUALITY_COLORS[harvest.quality || 'Choix C'] || QUALITY_COLORS['Choix C'];
      
      return `
        <tr 
          class="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0D2615]/25 transition-all border-b border-slate-100 dark:border-[#143E23]/20"
          onclick="window.showHarvestDetail('${harvest.id}')"
        >
          <td class="px-4 py-3.5 font-mono text-slate-400 dark:text-[#819888] font-bold">${harvest.id}</td>
          <td class="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
            ${cropEmoji} ${harvest.cropType || harvest.cropName || 'N/A'}
          </td>
          <td class="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">${harvest.parcelName || 'N/A'}</td>
          <td class="px-4 py-3.5 font-mono font-bold text-center text-slate-800 dark:text-slate-200">
            ${(harvest.weightKg || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
          <td class="px-4 py-3.5 text-center">
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${qualityInfo.badge}">
              ${harvest.quality || 'Choix C'}
            </span>
          </td>
          <td class="px-4 py-3.5 font-mono text-center text-slate-600 dark:text-slate-400">
            ${harvest.harvestDate || harvest.date || 'N/A'}
          </td>
          <td class="px-4 py-3.5 text-center">
            <div class="inline-flex items-center gap-1" onclick="event.stopPropagation()">
              <button onclick="window.showHarvestDetail('${harvest.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                <i data-lucide="eye" class="h-3.5 w-3.5"></i>
              </button>
              <button onclick="window.editHarvest('${harvest.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all cursor-pointer">
                <i data-lucide="edit-2" class="h-3.5 w-3.5"></i>
              </button>
              <button onclick="window.deleteHarvest('${harvest.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
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

  renderRecentHarvests() {
    const recentList = document.getElementById('recent-harvests-list');
    if (!recentList) return;
    
    // Sort by date and get last 5
    const sorted = [...harvests].sort((a, b) => {
      const dateA = new Date(a.harvestDate || a.date);
      const dateB = new Date(b.harvestDate || b.date);
      return dateB - dateA;
    });
    const recent5 = sorted.slice(0, 5);
    
    if (recent5.length === 0) {
      recentList.innerHTML = '<p class="text-[11px] text-slate-400 text-center py-4">Aucune récolte récente</p>';
      return;
    }
    
    recentList.innerHTML = recent5.map(harvest => {
      const cropEmoji = CROP_EMOJIS[harvest.cropType || harvest.cropName] || '🌱';
      const qualityInfo = QUALITY_COLORS[harvest.quality || 'Choix C'] || QUALITY_COLORS['Choix C'];
      
      return `
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-2">
              <span class="text-lg">${cropEmoji}</span>
              <div>
                <p class="text-sm font-black text-slate-800 dark:text-white">${(harvest.weightKg || 0).toLocaleString('fr-FR')} kg</p>
                <p class="text-[10px] text-[#819888]">${harvest.cropType || harvest.cropName || 'N/A'} | ${harvest.parcelName || 'N/A'}</p>
              </div>
            </div>
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${qualityInfo.badge}">
              ${harvest.quality || 'Choix C'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  initChart() {
    const ctx = document.getElementById('harvests-chart');
    if (!ctx) return;
    
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    // Calculate quality distribution
    const qualityCounts = { 'Choix A': 0, 'Choix B': 0, 'Choix C': 0 };
    harvests.forEach(h => {
      const quality = h.quality || 'Choix C';
      if (qualityCounts[quality] !== undefined) {
        qualityCounts[quality]++;
      }
    });
    
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Choix A', 'Choix B', 'Choix C'],
        datasets: [{
          data: [qualityCounts['Choix A'], qualityCounts['Choix B'], qualityCounts['Choix C']],
          backgroundColor: CHART_COLORS,
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
                return `${label}: ${value} récoltes (${percentage}%)`;
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
    
    // Calculate quality distribution
    const qualityCounts = { 'Choix A': 0, 'Choix B': 0, 'Choix C': 0 };
    harvests.forEach(h => {
      const quality = h.quality || 'Choix C';
      if (qualityCounts[quality] !== undefined) {
        qualityCounts[quality]++;
      }
    });
    
    chartInstance.data.datasets[0].data = [qualityCounts['Choix A'], qualityCounts['Choix B'], qualityCounts['Choix C']];
    chartInstance.update();
  },

  setupListeners() {
    // Search
    const searchInput = document.getElementById('harvests-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterHarvests(e.target.value);
      });
    }
    
    // Quality filter
    const qualityFilter = document.getElementById('harvests-filter-quality');
    if (qualityFilter) {
      qualityFilter.addEventListener('change', () => {
        this.renderTable();
      });
    }
  },

  filterHarvests(query) {
    // For now, just re-render (filtering could be implemented if needed)
    this.render();
  }
};

// Window functions for modal management
window.openAddHarvestModal = () => {
  const modal = document.getElementById('add-harvest-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Set default date to today
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('form-harvest-date').value = todayStr;
    
    // Reset form
    document.getElementById('add-harvest-form').reset();
    document.getElementById('form-harvest-id').value = '';
    
    // Load parcels
    HarvestsModule.loadParcelsAndCrops();
  }
};

window.closeAddHarvestModal = () => {
  const modal = document.getElementById('add-harvest-modal');
  if (modal) modal.classList.add('hidden');
};

window.submitAddHarvest = (e) => {
  e.preventDefault();
  
  const cropSelect = document.getElementById('form-harvest-crop');
  const parcelSelect = document.getElementById('form-harvest-parcel');
  const weightInput = document.getElementById('form-harvest-weight');
  const qualitySelect = document.getElementById('form-harvest-quality');
  const dateInput = document.getElementById('form-harvest-date');
  const batchInput = document.getElementById('form-harvest-batch');
  const notesInput = document.getElementById('form-harvest-notes');
  const idInput = document.getElementById('form-harvest-id');
  
  if (!cropSelect || !parcelSelect || !weightInput || !qualitySelect || !dateInput) {
    alert('Veuillez remplir les champs obligatoires: Culture, Parcelle, Poids, Qualité et Date.');
    return;
  }
  
  const cropType = cropSelect.value;
  const parcelId = parcelSelect.value;
  const parcel = parcelles.find(p => p.id === parcelId);
  const parcelName = parcel ? parcel.name : '';
  const weightKg = parseFloat(weightInput.value) || 0;
  const quality = qualitySelect.value;
  const harvestDate = dateInput.value;
  const batchNumber = batchInput?.value || '';
  const notes = notesInput?.value || '';
  const existingId = idInput?.value || '';
  
  const newHarvest = {
    id: existingId || `HARV-${Date.now()}`,
    cropType,
    cropName: cropType,
    parcelId,
    parcelName,
    weightKg,
    quality,
    harvestDate,
    date: harvestDate, // Alias for compatibility
    batchNumber,
    notes,
    createdAt: existingId ? new Date().toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enterprise_id: 'ka_farm'
  };
  
  if (existingId) {
    // Update existing
    const index = harvests.findIndex(h => h.id === existingId);
    if (index !== -1) {
      harvests[index] = newHarvest;
    }
  } else {
    // Add new
    harvests.push(newHarvest);
  }
  
  KAStorage.setHarvests(harvests);
  
  HarvestsModule.render();
  window.closeAddHarvestModal();
  
  // Show success message
  alert(`Récolte de ${cropType} (${weightKg} kg, ${quality}) enregistrée avec succès !`);
};

window.editHarvest = (id) => {
  const harvest = harvests.find(h => h.id === id);
  if (!harvest) return;
  
  // Set form values
  document.getElementById('form-harvest-id').value = harvest.id;
  document.getElementById('form-harvest-crop').value = harvest.cropType || harvest.cropName || '';
  document.getElementById('form-harvest-parcel').value = harvest.parcelId || '';
  document.getElementById('form-harvest-weight').value = harvest.weightKg || 0;
  document.getElementById('form-harvest-quality').value = harvest.quality || 'Choix A';
  document.getElementById('form-harvest-date').value = harvest.harvestDate || harvest.date || '';
  document.getElementById('form-harvest-batch').value = harvest.batchNumber || '';
  document.getElementById('form-harvest-notes').value = harvest.notes || '';
  
  // Open modal
  const modal = document.getElementById('add-harvest-modal');
  if (modal) modal.classList.remove('hidden');
};

window.deleteHarvest = (id) => {
  const harvest = harvests.find(h => h.id === id);
  if (!harvest) return;
  
  const cropType = harvest.cropType || harvest.cropName || 'cette récolte';
  
  // Set up delete modal
  const deleteModal = document.getElementById('delete-harvest-confirm-modal');
  const confirmBtn = document.getElementById('confirm-harvest-delete-btn');
  
  if (deleteModal && confirmBtn) {
    confirmBtn.onclick = () => {
      harvests = harvests.filter(h => h.id !== id);
      KAStorage.setHarvests(harvests);
      HarvestsModule.render();
      window.closeHarvestDeleteModal();
      alert(`Récolte de ${cropType} supprimée avec succès.`);
    };
    
    deleteModal.classList.remove('hidden');
  }
};

window.closeHarvestDeleteModal = () => {
  const modal = document.getElementById('delete-harvest-confirm-modal');
  if (modal) modal.classList.add('hidden');
  const confirmBtn = document.getElementById('confirm-harvest-delete-btn');
  if (confirmBtn) confirmBtn.onclick = null;
};

window.showHarvestDetail = (id) => {
  const harvest = harvests.find(h => h.id === id);
  if (!harvest) return;
  
  const cropEmoji = CROP_EMOJIS[harvest.cropType || harvest.cropName] || '🌱';
  const qualityInfo = QUALITY_COLORS[harvest.quality || 'Choix C'] || QUALITY_COLORS['Choix C'];
  
  const content = document.getElementById('harvest-detail-content');
  if (content) {
    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 bg-emerald-500/5 dark:bg-emerald-950/5 rounded-2xl border border-emerald-500/20">
          <p class="text-xs font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="package" class="h-3 w-3"></i> Récolte #${harvest.id}
          </p>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mt-2">
            ${cropEmoji} ${harvest.cropType || harvest.cropName || 'N/A'}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">📍 ${harvest.parcelName || 'Parcelle non spécifiée'}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Poids:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${(harvest.weightKg || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} kg</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Qualité:</span>
              <span class="text-slate-700 dark:text-slate-300">${harvest.quality || 'Non spécifiée'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Date:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${harvest.harvestDate || harvest.date || 'Non spécifiée'}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">N° de Lot:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${harvest.batchNumber || 'Non spécifié'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Culture:</span>
              <span class="text-slate-700 dark:text-slate-300">${harvest.cropType || harvest.cropName || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Parcelle:</span>
              <span class="text-slate-700 dark:text-slate-300">${harvest.parcelName || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="p-3 ${qualityInfo.badge} rounded-xl">
          <p class="text-[10px] font-bold ${qualityInfo.color === '#059669' ? 'text-emerald-500' : qualityInfo.color === '#f59e0b' ? 'text-amber-500' : 'text-rose-500'} uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="${qualityInfo.color === '#059669' ? 'check-circle' : qualityInfo.color === '#f59e0b' ? 'alert-circle' : 'x-circle'}" class="h-3 w-3"></i> Qualité
          </p>
          <p class="text-sm font-black text-slate-800 dark:text-white mt-1">
            ${harvest.quality || 'Choix C'} - ${qualityInfo.label}
          </p>
        </div>
        
        ${harvest.notes ? `
          <div class="space-y-1">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarques:</p>
            <p class="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl">${harvest.notes}</p>
          </div>
        ` : ''}
        
        <div class="flex justify-end gap-2 pt-2">
          <button onclick="window.closeHarvestDetailModal(); window.editHarvest('${harvest.id}')" class="px-4 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#143E23] border border-slate-200 dark:border-[#143E23] text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="edit-2" class="h-3.5 w-3.5"></i> Modifier
          </button>
          <button onclick="window.closeHarvestDetailModal(); window.deleteHarvest('${harvest.id}')" class="px-4 py-2 bg-rose-100 dark:bg-rose-950/20 hover:bg-rose-200 dark:hover:bg-rose-950/30 border border-rose-500/20 text-rose-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Supprimer
          </button>
        </div>
      </div>
    `;
  }
  
  const modal = document.getElementById('harvest-detail-modal');
  if (modal) modal.classList.remove('hidden');
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

window.closeHarvestDetailModal = () => {
  const modal = document.getElementById('harvest-detail-modal');
  if (modal) modal.classList.add('hidden');
};

window.exportHarvests = () => {
  const dataStr = JSON.stringify(harvests, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `kafarm-recoltes-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Start module when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    HarvestsModule.init();
  });
} else {
  HarvestsModule.init();
}

// Live update listener
document.addEventListener('ka_data_updated', () => {
  harvests = KAStorage.getHarvests();
  parcelles = KAStorage.getParcelles();
  crops = KAStorage.getCrops();
  HarvestsModule.render();
});
