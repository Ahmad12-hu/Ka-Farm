// KA Farm - Carnet Phytosanitaire & DAR Module
import { KAStorage } from '../storage.js';

let treatments = [];
let parcelles = [];
let crops = [];

// Default DAR values by treatment category (in days)
const DAR_STANDARDS = {
  'bio-phytosanitaire': 3,    // Bio pesticides: 3 days
  'chimique-phytosanitaire': 7, // Chemical pesticides: 7-14 days
  'bio-engrais': 0,          // Organic fertilizer: no DAR
  'chimique-engrais': 0       // Mineral fertilizer: no DAR
};

// Default treatment data
const DEFAULT_TREATMENTS = [
  {
    id: 'TR-001',
    parcelId: 'P-001',
    parcelName: 'Parcelle Nord - Planche 2',
    cropId: 'C-101',
    cropName: 'Tomate Mongal F1',
    category: 'bio-phytosanitaire',
    productName: 'Purin de Neem',
    dateApplied: '2026-06-20',
    dar: 3,
    target: 'Chenilles et pucerons',
    notes: 'Traitement préventif appliqué le matin. Respecter le DAR de 3 jours.',
    harvestReady: true,
    enterprise_id: 'ka_farm'
  },
  {
    id: 'TR-002',
    parcelId: 'P-002',
    parcelName: 'Parcelle Est - Grand Champ',
    cropId: 'C-102',
    cropName: 'Oignon Rouge de Galmi',
    category: 'chimique-phytosanitaire',
    productName: 'Décis (Insecticide chimique)',
    dateApplied: '2026-06-23',
    dar: 7,
    target: 'Tuta Absoluta',
    notes: 'Traitement curatif suite à l\'alerte sur les chenilles.',
    harvestReady: false,
    enterprise_id: 'ka_farm'
  },
  {
    id: 'TR-003',
    parcelId: 'P-001',
    parcelName: 'Parcelle Nord - Planche 2',
    cropId: 'C-101',
    cropName: 'Tomate Mongal F1',
    category: 'bio-engrais',
    productName: 'Compost Organique Bio',
    dateApplied: '2026-06-15',
    dar: 0,
    target: 'Amendement du sol',
    notes: 'Application en fond pour améliorer la fertilité.',
    harvestReady: true,
    enterprise_id: 'ka_farm'
  },
  {
    id: 'TR-004',
    parcelId: 'P-003',
    parcelName: 'Parcelle Sud - Planche 1',
    cropId: '',
    cropName: 'Chou Cabus',
    category: 'chimique-phytosanitaire',
    productName: 'Ridomil Gold',
    dateApplied: '2026-06-22',
    dar: 14,
    target: 'Mildiou',
    notes: 'Traitement fongicide préventif.',
    harvestReady: false,
    enterprise_id: 'ka_farm'
  }
];

// Treatment category labels for display
const CATEGORY_LABELS = {
  'bio-phytosanitaire': { name: '🌿 Phytosanitaire Bio', color: 'emerald' },
  'chimique-phytosanitaire': { name: '⚠️ Chimique (Pesticide)', color: 'rose' },
  'bio-engrais': { name: '🟤 Amendement Organique', color: 'amber' },
  'chimique-engrais': { name: '🧪 Engrais Minéral', color: 'blue' }
};

export const TreatmentsModule = {
  init() {
    treatments = KAStorage.getTreatments();
    parcelles = KAStorage.getParcelles();
    crops = KAStorage.getCrops();
    
    this.render();
    this.setupListeners();
    this.loadParcelsAndCrops();
  },

  loadParcelsAndCrops() {
    // Update select dropdowns with current parcels and crops
    const parcelSelect = document.getElementById('form-treat-parcel');
    const cropSelect = document.getElementById('form-treat-crop');
    
    if (parcelSelect) {
      parcelSelect.innerHTML = '<option value="">-- Sélectionner une parcelle --</option>';
      parcelles.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        parcelSelect.appendChild(option);
      });
    }
    
    if (cropSelect) {
      cropSelect.innerHTML = '<option value="">-- Sélectionner une culture --</option>';
      crops.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        cropSelect.appendChild(option);
      });
    }
  },

  render() {
    this.renderStats();
    this.renderAlertPanels();
    this.renderTable();
  },

  renderStats() {
    const totalCount = treatments.length;
    const bioCount = treatments.filter(t => t.category === 'bio-phytosanitaire' || t.category === 'bio-engrais').length;
    const darActiveCount = treatments.filter(t => !t.harvestReady).length;
    const darClearedCount = treatments.filter(t => t.harvestReady).length;
    
    // Count products usage
    const productCounts = {};
    treatments.forEach(t => {
      productCounts[t.productName] = (productCounts[t.productName] || 0) + 1;
    });
    const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
    
    // Update DOM
    const elDarActive = document.getElementById('stat-dar-active');
    const elDarCleared = document.getElementById('stat-dar-cleared');
    const elBioCount = document.getElementById('stat-bio-count');
    const elTotalCount = document.getElementById('stat-total-count');
    const elTopProduct = document.getElementById('stat-top-product');
    const elTopProductCount = document.getElementById('stat-top-product-count');
    
    if (elDarActive) elDarActive.textContent = darActiveCount;
    if (elDarCleared) elDarCleared.textContent = darClearedCount;
    if (elBioCount) elBioCount.textContent = bioCount;
    if (elTotalCount) elTotalCount.textContent = totalCount;
    if (elTopProduct) elTopProduct.textContent = topProduct ? topProduct[0] : 'Aucun';
    if (elTopProductCount) elTopProductCount.textContent = topProduct ? `${topProduct[1]} application${topProduct[1] > 1 ? 's' : ''}` : '0 applications';
  },

  renderAlertPanels() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // DAR Active List (Harvest NOT Ready)
    const darAlertList = document.getElementById('dar-alert-list');
    if (darAlertList) {
      const activeTreatments = treatments.filter(t => !t.harvestReady);
      
      if (activeTreatments.length === 0) {
        darAlertList.innerHTML = '<p class="text-[11px] text-rose-400/70 italic text-center py-2">✅ Aucune alerte DAR active actuellement.</p>';
      } else {
        darAlertList.innerHTML = activeTreatments.map(t => {
          const applied = new Date(t.dateApplied);
          applied.setHours(0, 0, 0, 0);
          const diffTime = today.getTime() - applied.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const daysRemaining = Math.max(0, t.dar - diffDays);
          
          return `
            <div class="p-3 bg-white dark:bg-[#061109]/30 rounded-xl border border-rose-500/20">
              <div class="flex justify-between items-start gap-2">
                <div>
                  <p class="text-xs font-black text-slate-800 dark:text-white truncate">${t.productName}</p>
                  <p class="text-[10px] text-[#819888] mt-0.5">🌱 ${t.cropName || 'Culture non spécifiée'} | ${t.parcelName || 'Parcelle non spécifiée'}</p>
                </div>
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">${daysRemaining}j restant</span>
              </div>
              <p class="text-[10px] text-rose-500 font-bold mt-1">🚫 RÉCOLTE INTERDITE</p>
            </div>
          `;
        }).join('');
      }
    }
    
    // DAR Cleared List (Harvest Ready)
    const darClearedList = document.getElementById('dar-cleared-list');
    if (darClearedList) {
      const clearedTreatments = treatments.filter(t => t.harvestReady);
      
      if (clearedTreatments.length === 0) {
        darClearedList.innerHTML = '<p class="text-[11px] text-emerald-400/70 italic text-center py-2">Aucune culture prête pour l\'instant.</p>';
      } else {
        darClearedList.innerHTML = clearedTreatments.slice(0, 5).map(t => {
          const applied = new Date(t.dateApplied);
          applied.setHours(0, 0, 0, 0);
          const diffTime = today.getTime() - applied.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          return `
            <div class="p-3 bg-white dark:bg-[#061109]/30 rounded-xl border border-emerald-500/20">
              <div class="flex justify-between items-start gap-2">
                <div>
                  <p class="text-xs font-black text-slate-800 dark:text-white truncate">${t.productName}</p>
                  <p class="text-[10px] text-[#819888] mt-0.5">🌱 ${t.cropName || 'Culture non spécifiée'} | ${t.parcelName || 'Parcelle non spécifiée'}</p>
                </div>
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">DAR terminé</span>
              </div>
              <p class="text-[10px] text-emerald-500 font-bold mt-1">✅ PRÊT POUR LE MARCHÉ 🇸🇳</p>
            </div>
          `;
        }).join('');
      }
    }
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderTable() {
    const tableBody = document.getElementById('treatments-table-body');
    if (!tableBody) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (treatments.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="px-4 py-8 text-center text-slate-400">
            <p class="text-xs font-bold">Aucun traitement phytosanitaire enregistré.</p>
            <p class="text-[10px] mt-1">Commencez par ajouter un traitement via le bouton ci-dessus.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    // Sort by date (most recent first)
    const sortedTreatments = [...treatments].sort((a, b) => {
      const dateA = new Date(a.dateApplied);
      const dateB = new Date(b.dateApplied);
      return dateB - dateA;
    });
    
    tableBody.innerHTML = sortedTreatments.map(t => {
      const applied = new Date(t.dateApplied);
      applied.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - applied.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, t.dar - diffDays);
      
      const categoryInfo = CATEGORY_LABELS[t.category] || { name: t.category, color: 'slate' };
      const isHarvestReady = daysRemaining <= 0 || t.harvestReady;
      
      // Status badge color
      const statusColor = isHarvestReady ? 'emerald' : 'rose';
      const statusText = isHarvestReady ? '✅ Autorisée' : '🚫 Interdite';
      const statusClass = isHarvestReady 
        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      
      // Days remaining display
      const daysDisplay = isHarvestReady ? '0' : `${daysRemaining}`;
      const daysText = daysRemaining <= 0 ? 'Terminé' : `${daysRemaining}j restant`;
      
      return `
        <tr class="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0D2615]/25 transition-all" onclick="window.showTreatmentDetail('${t.id}')">
          <td class="px-4 py-3.5 font-mono text-slate-400 dark:text-[#819888] font-bold">${t.id}</td>
          <td class="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
            <span class="block">${t.cropName || 'N/A'}</span>
            <span class="text-[9px] text-[#819888] font-medium">${t.parcelName || 'N/A'}</span>
          </td>
          <td class="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">${t.productName}</td>
          <td class="px-4 py-3.5">
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${categoryInfo.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : categoryInfo.color === 'rose' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : categoryInfo.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}">
              ${categoryInfo.name}
            </span>
          </td>
          <td class="px-4 py-3.5 text-center font-mono text-slate-700 dark:text-slate-300">${t.dateApplied}</td>
          <td class="px-4 py-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">${t.dar}</td>
          <td class="px-4 py-3.5 text-center">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${statusClass}">${statusText}</span>
          </td>
          <td class="px-4 py-3.5 font-mono ${daysRemaining <= 3 ? 'text-rose-500 font-bold' : 'text-slate-600'}">
            ${daysText}
          </td>
          <td class="px-4 py-3.5 text-center">
            <div class="inline-flex items-center gap-1">
              <button onclick="event.stopPropagation(); window.showTreatmentDetail('${t.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                <i data-lucide="eye" class="h-3 w-3"></i>
              </button>
              <button onclick="event.stopPropagation(); window.editTreatment('${t.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all cursor-pointer">
                <i data-lucide="edit-2" class="h-3 w-3"></i>
              </button>
              <button onclick="event.stopPropagation(); window.deleteTreatment('${t.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
                <i data-lucide="trash-2" class="h-3 w-3"></i>
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

  setupListeners() {
    // Search
    const searchInput = document.getElementById('treatments-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterTreatments(e.target.value);
      });
    }
  },

  filterTreatments(query) {
    // This will be implemented if needed
  }
};

// Window functions for modal management
window.openAddTreatmentModal = () => {
  const modal = document.getElementById('add-treatment-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Set default date to today
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('form-treat-date').value = todayStr;
    
    // Reset form
    document.getElementById('add-treatment-form').reset();
    document.getElementById('dar-suggest-label').textContent = 'Sélectionnez un type';
    
    // Load parcels and crops
    TreatmentsModule.loadParcelsAndCrops();
  }
};

window.closeAddTreatmentModal = () => {
  const modal = document.getElementById('add-treatment-modal');
  if (modal) modal.classList.add('hidden');
};

window.onTreatmentCategoryChange = (category) => {
  const darInput = document.getElementById('form-treat-dar');
  const suggestLabel = document.getElementById('dar-suggest-label');
  
  if (darInput && suggestLabel) {
    const suggestedDar = DAR_STANDARDS[category];
    if (suggestedDar !== undefined) {
      darInput.value = suggestedDar;
      suggestLabel.textContent = `DAR suggéré: ${suggestedDar}j`;
    } else {
      suggestLabel.textContent = 'Sélectionnez un type';
    }
  }
};

window.submitAddTreatment = (e) => {
  e.preventDefault();
  
  const parcelSelect = document.getElementById('form-treat-parcel');
  const cropSelect = document.getElementById('form-treat-crop');
  const categorySelect = document.getElementById('form-treat-category');
  const productInput = document.getElementById('form-treat-product');
  const dateInput = document.getElementById('form-treat-date');
  const darInput = document.getElementById('form-treat-dar');
  const targetInput = document.getElementById('form-treat-target');
  const notesInput = document.getElementById('form-treat-notes');
  
  if (!parcelSelect || !productInput || !dateInput || !darInput) return;
  
  const parcelId = parcelSelect.value;
  const cropId = cropSelect ? cropSelect.value : '';
  const category = categorySelect ? categorySelect.value : '';
  const productName = productInput.value;
  const dateApplied = dateInput.value;
  const dar = parseInt(darInput.value) || 0;
  const target = targetInput ? targetInput.value : '';
  const notes = notesInput ? notesInput.value : '';
  
  if (!parcelId || !productName || !dateApplied) {
    alert('Veuillez remplir les champs obligatoires: Parcelle, Produit et Date.');
    return;
  }
  
  // Get parcel and crop names
  const parcel = parcelles.find(p => p.id === parcelId);
  const crop = crops.find(c => c.id === cropId);
  
  // Generate ID
  const nextNum = treatments.reduce((max, t) => {
    const num = parseInt(t.id.split('-')[1]);
    return num > max ? num : max;
  }, 0) + 1;
  const id = `TR-${String(nextNum).padStart(3, '0')}`;
  
  const newTreatment = {
    id,
    parcelId,
    parcelName: parcel ? parcel.name : 'Parcelle inconnue',
    cropId: cropId || '',
    cropName: crop ? crop.name : '',
    category,
    productName,
    dateApplied,
    dar,
    target,
    notes,
    harvestReady: false, // Will be calculated based on DAR
    enterprise_id: 'ka_farm'
  };
  
  // Check if DAR has already passed
  const appliedDate = new Date(dateApplied);
  appliedDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - appliedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  newTreatment.harvestReady = diffDays >= dar;
  
  treatments.push(newTreatment);
  KAStorage.set('ka_farm_treatments', treatments);
  
  TreatmentsModule.render();
  window.closeAddTreatmentModal();
  
  // Show success message
  alert('Traitement phytosanitaire enregistré avec succès ! Le DAR est maintenant suivi.');
};

window.editTreatment = (id) => {
  const treatment = treatments.find(t => t.id === id);
  if (!treatment) return;
  
  // Store treatment ID for edit
  document.getElementById('form-treat-id').value = id;
  
  // Pre-fill form
  const parcelSelect = document.getElementById('form-treat-parcel');
  const cropSelect = document.getElementById('form-treat-crop');
  
  if (parcelSelect) {
    parcelSelect.value = treatment.parcelId;
  }
  if (cropSelect) {
    cropSelect.value = treatment.cropId || '';
  }
  document.getElementById('form-treat-category').value = treatment.category || '';
  document.getElementById('form-treat-product').value = treatment.productName;
  document.getElementById('form-treat-date').value = treatment.dateApplied;
  document.getElementById('form-treat-dar').value = treatment.dar;
  document.getElementById('form-treat-target').value = treatment.target || '';
  document.getElementById('form-treat-notes').value = treatment.notes || '';
  
  // Update DAR suggestion label
  window.onTreatmentCategoryChange(treatment.category);
  
  // Show modal
  const modal = document.getElementById('add-treatment-modal');
  if (modal) modal.classList.remove('hidden');
};

window.deleteTreatment = (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce traitement ? Cette action ne peut pas être annulée.')) return;
  
  treatments = treatments.filter(t => t.id !== id);
  KAStorage.set('ka_farm_treatments', treatments);
  
  TreatmentsModule.render();
};

window.showTreatmentDetail = (id) => {
  const treatment = treatments.find(t => t.id === id);
  if (!treatment) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const applied = new Date(treatment.dateApplied);
  applied.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - applied.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, treatment.dar - diffDays);
  const isHarvestReady = daysRemaining <= 0 || treatment.harvestReady;
  
  const categoryInfo = CATEGORY_LABELS[treatment.category] || { name: treatment.category, color: 'slate' };
  
  const content = document.getElementById('treatment-detail-content');
  if (content) {
    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 bg-rose-500/5 dark:bg-rose-950/5 rounded-2xl border border-rose-500/20">
          <p class="text-xs font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="shield-alert" class="h-3 w-3"></i> Traitement #${treatment.id}
          </p>
          <h3 class="text-lg font-black text-slate-800 dark:text-white mt-2">${treatment.productName}</h3>
          <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${categoryInfo.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : categoryInfo.color === 'rose' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : categoryInfo.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}">
            ${categoryInfo.name}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Parcelle:</span>
              <span class="text-slate-700 dark:text-slate-300">${treatment.parcelName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Culture:</span>
              <span class="text-slate-700 dark:text-slate-300">${treatment.cropName || 'Non spécifiée'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Cible:</span>
              <span class="text-slate-700 dark:text-slate-300">${treatment.target || 'Non spécifiée'}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Date:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${treatment.dateApplied}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">DAR:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${treatment.dar} jours</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Jours écoulés:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${diffDays} jours</span>
            </div>
          </div>
        </div>
        
        <div class="p-3 ${isHarvestReady ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-rose-500/5 border border-rose-500/20'} rounded-xl">
          <p class="text-[10px] font-bold ${isHarvestReady ? 'text-emerald-500' : 'text-rose-500'} uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="${isHarvestReady ? 'check-circle' : 'alert-triangle'}" class="h-3 w-3"></i> Statut Récolte
          </p>
          <p class="text-sm font-black text-slate-800 dark:text-white mt-1">
            ${isHarvestReady ? '✅ RÉCOLTE AUTORISÉE - PRÊT POUR LE MARCHÉ' : `🚫 RÉCOLTE INTERDITE - ${daysRemaining}j de DAR restant`}
          </p>
        </div>
        
        ${treatment.notes ? `
          <div class="space-y-1">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes:</p>
            <p class="text-xs text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl">${treatment.notes}</p>
          </div>
        ` : ''}
        
        <div class="flex justify-end gap-2 pt-2">
          <button onclick="window.closeTreatmentDetailModal(); window.editTreatment('${treatment.id}')" class="px-4 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#143E23] border border-slate-200 dark:border-[#143E23] text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="edit-2" class="h-3 w-3"></i> Modifier
          </button>
          <button onclick="window.closeTreatmentDetailModal(); window.deleteTreatment('${treatment.id}')" class="px-4 py-2 bg-rose-100 dark:bg-rose-950/20 hover:bg-rose-200 dark:hover:bg-rose-950/30 border border-rose-500/20 text-rose-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="trash-2" class="h-3 w-3"></i> Supprimer
          </button>
        </div>
      </div>
    `;
  }
  
  const modal = document.getElementById('treatment-detail-modal');
  if (modal) modal.classList.remove('hidden');
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

window.closeTreatmentDetailModal = () => {
  const modal = document.getElementById('treatment-detail-modal');
  if (modal) modal.classList.add('hidden');
};

window.exportTreatments = () => {
  const dataStr = JSON.stringify(treatments, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `kafarm-traitements-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Start module when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    TreatmentsModule.init();
  });
} else {
  TreatmentsModule.init();
}

// Live update listener
document.addEventListener('ka_data_updated', () => {
  TreatmentsModule.init();
});
