// KA Farm - Rotation des Cultures Module
import { KAStorage } from '../storage.js';

let plantFamilies = [];
let cropFamilies = [];
let rotationHistory = [];
let rotationRules = [];
let parcels = [];
let crops = [];

// Family colors for visual representation
const FAMILY_COLORS = {
  'FAM-001': { color: '#ef4444', bgColor: '#fef2f2', borderColor: '#fecaca', name: 'Solanacées' },
  'FAM-002': { color: '#10b981', bgColor: '#f0fdf4', borderColor: '#86efac', name: 'Fabacées' },
  'FAM-003': { color: '#06b6d4', bgColor: '#f0f9ff', borderColor: '#bae6fd', name: 'Brassicacées' },
  'FAM-004': { color: '#8b5cf6', bgColor: '#f5f3ff', borderColor: '#c4b5fd', name: 'Amaryllidacées' },
  'FAM-005': { color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#fde68a', name: 'Cucurbitacées' },
  'FAM-006': { color: '#10b981', bgColor: '#f0fdf4', borderColor: '#86efac', name: 'Apiacées' },
  'FAM-007': { color: '#f97316', bgColor: '#fff7ed', borderColor: '#fed7aa', name: 'Asteracées' },
  'FAM-008': { color: '#eab308', bgColor: '#fffbeb', borderColor: '#fde68a', name: 'Graminées' },
  'FAM-009': { color: '#a855f7', bgColor: '#f5f3ff', borderColor: '#c4b5fd', name: 'Lamiacées' },
  'FAM-010': { color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#bfdbfe', name: 'Chénopodiacées' },
  'FAM-011': { color: '#ec4899', bgColor: '#fcf2f8', borderColor: '#fce7f3', name: 'Malvacées' }
};

// Family icons
const FAMILY_ICONS = {
  'FAM-001': 'tomato',
  'FAM-002': 'bean',
  'FAM-003': 'leaf',
  'FAM-004': 'onion',
  'FAM-005': 'cucumber',
  'FAM-006': 'carrot',
  'FAM-007': 'lettuce',
  'FAM-008': 'corn',
  'FAM-009': 'flower',
  'FAM-010': 'spinach',
  'FAM-011': 'okra'
};

// Severity levels for warnings
const SEVERITY_LEVELS = {
  'Critique': { icon: 'x-circle', color: '#ef4444', bgColor: '#fef2f2' },
  'Élevée': { icon: 'alert-triangle', color: '#f59e0b', bgColor: '#fffbeb' },
  'Moyenne': { icon: 'alert-circle', color: '#f59e0b', bgColor: '#fef3c7' },
  'Faible': { icon: 'check-circle', color: '#10b981', bgColor: '#dcfce7' }
};

// Variables for modals
let rotationToDelete = null;
let selectedRotationForDetail = null;

// Generate unique ID
const generateId = (prefix = 'ROT') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Calculate days between two dates
const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
};

export const RotationModule = {
  init() {
    this.loadData();
    this.render();
    this.setupListeners();
    this.startAutoRefresh();
  },

  loadData() {
    plantFamilies = KAStorage.getPlantFamilies() || [];
    cropFamilies = KAStorage.getCropFamilies() || [];
    rotationHistory = KAStorage.getRotationHistory() || [];
    rotationRules = KAStorage.getRotationRules() || [];
    parcels = KAStorage.getParcelles() || [];
    crops = KAStorage.getCrops() || [];
  },

  startAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(() => {
      this.loadData();
      this.render();
    }, 5 * 60 * 1000);
    
    // Listen for data updates
    document.addEventListener('ka_data_updated', (e) => {
      if (e.detail.key.includes('rotation') || e.detail.key.includes('plant') || e.detail.key.includes('crop')) {
        this.loadData();
        this.render();
      }
    });
  },

  setupListeners() {
    // Quick check form
    const quickCheckParcel = document.getElementById('quick-check-parcel');
    const quickCheckCrop = document.getElementById('quick-check-crop');
    
    if (quickCheckParcel) {
      this.populateParcelSelect(quickCheckParcel);
      quickCheckParcel.addEventListener('change', () => {
        this.populateCropSelect(quickCheckCrop, quickCheckParcel.value);
      });
    }
    
    if (quickCheckCrop) {
      this.populateCropSelect(quickCheckCrop);
    }
  },

  render() {
    this.updateStats();
    this.renderRotationWarnings();
    this.renderCompatibilityMatrix();
    this.renderParcelsRotationStatus();
    this.renderRotationHistory();
    this.renderFamilyLibrary();
    this.renderRotationPlannerModal();
    this.renderFamilyManagerModal();
  },

  updateStats() {
    const stats = {
      'stat-parcels-in-rotation': parcels.filter(p => p.status === 'Cultivée').length,
      'stat-rotation-warnings': KAStorage.getRotationWarnings().length,
      'stat-plant-families': plantFamilies.length,
      'stat-rotation-rules': rotationRules.length,
      'stat-current-crops': crops.filter(c => c.status !== 'Récolté' && c.status !== 'Terminé').length,
      'stat-rotation-history': rotationHistory.length
    };
    
    for (const [id, value] of Object.entries(stats)) {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
      }
    }
  },

  renderRotationWarnings() {
    const container = document.getElementById('rotation-warnings-list');
    if (!container) return;
    
    const warnings = KAStorage.getRotationWarnings();
    
    if (warnings.length === 0) {
      container.innerHTML = `
        <div class="text-center p-4 text-slate-400 dark:text-[#819888] text-sm">
          <i data-lucide="check-circle" class="h-6 w-6 text-emerald-500 mx-auto mb-2"></i>
          <p>Aucune alerte de rotation active</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = warnings.map(warning => {
      const severity = SEVERITY_LEVELS[warning.severity] || SEVERITY_LEVELS['Critique'];
      return `
        <div class="p-3 bg-rose-500/5 dark:bg-rose-950/10 rounded-xl border border-rose-500/20">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-${severity.color}/10 rounded-lg">
              <i data-lucide="${severity.icon}" class="h-4 w-4 text-${severity.color}"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-800 dark:text-white text-sm">${warning.parcelName}</p>
              <p class="text-xs text-slate-500 dark:text-[#819888] truncate">${warning.message}</p>
              <p class="text-xs text-slate-400 mt-1">
                Culture: <span class="font-bold">${warning.cropName}</span> | 
                Famille: <span class="font-bold text-${severity.color}">${warning.familyName}</span>
              </p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCompatibilityMatrix() {
    const container = document.getElementById('compatibility-matrix');
    if (!container) return;
    
    // Get first few families for the matrix
    const displayFamilies = plantFamilies.slice(0, 5);
    
    const familyNames = {
      'FAM-001': 'Sol',
      'FAM-002': 'Leg',
      'FAM-003': 'Cruc',
      'FAM-004': 'Lili',
      'FAM-005': 'Cucur'
    };
    
    let html = '';
    
    displayFamilies.forEach((family, rowIndex) => {
      const familyId = family.id;
      const shortName = familyNames[familyId] || family.name.substring(0, 4);
      
      html += `
        <tr class="border-b border-slate-100 dark:border-[#143E23]/20">
          <td class="pb-2 px-2 text-[9px] font-bold text-slate-600 dark:text-slate-300 text-right">${shortName}</td>
      `;
      
      displayFamilies.forEach((colFamily, colIndex) => {
        const colFamilyId = colFamily.id;
        const isCompatible = family.compatible_families.includes(colFamilyId);
        const isSame = familyId === colFamilyId;
        
        let cellClass = 'text-center p-1 rounded';
        let cellContent = '';
        
        if (isSame) {
          cellClass += ' bg-rose-500/10';
          cellContent = '<i data-lucide="x" class="h-3 w-3 text-rose-500"></i>';
        } else if (isCompatible) {
          cellClass += ' bg-emerald-500/10';
          cellContent = '<i data-lucide="check" class="h-3 w-3 text-emerald-500"></i>';
        } else {
          cellClass += ' bg-amber-500/10';
          cellContent = '<i data-lucide="minus" class="h-3 w-3 text-amber-500"></i>';
        }
        
        html += `<td class="${cellClass}">${cellContent}</td>`;
      });
      
      html += '</tr>';
    });
    
    container.innerHTML = html;
  },

  renderParcelsRotationStatus() {
    const container = document.getElementById('parcels-rotation-grid');
    if (!container) return;
    
    const warnings = KAStorage.getRotationWarnings();
    const warningMap = new Map(warnings.map(w => [w.parcelId, w]));
    
    container.innerHTML = parcels.map(parcel => {
      const lastRotation = KAStorage.getLastRotationForParcel(parcel.id);
      const currentCrop = crops.find(c => c.id === parcel.current_crop);
      const warning = warningMap.get(parcel.id);
      
      let statusBadge = '';
      let statusColor = 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      let statusText = 'Inconnu';
      
      if (lastRotation) {
        const family = KAStorage.getFamilyById(lastRotation.family_id);
        if (family) {
          statusText = `${family.name}`;
          const familyColor = FAMILY_COLORS[lastRotation.family_id] || { color: '#6b7280' };
          statusColor = `bg-${familyColor.color}/10 text-${familyColor.color} border-${familyColor.color}/20`;
        }
      }
      
      if (warning) {
        statusBadge = `<span class="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-full">ALERTE</span>`;
      }
      
      const progressPercent = lastRotation ? 
        Math.min(100, ((new Date() - new Date(lastRotation.start_date)) / 
          ((new Date(lastRotation.end_date || lastRotation.start_date) - new Date(lastRotation.start_date)) * 100)) : 0;
      
      return `
        <div class="bg-white dark:bg-[#061109]/40 rounded-2xl border border-slate-200 dark:border-[#143E23]/40 p-4 cursor-pointer hover:shadow-lg transition-all" 
             onclick="window.openParcelRotationDetail('${parcel.id}')">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <i data-lucide="layout" class="h-4 w-4 text-slate-400"></i>
              <span class="font-bold text-slate-800 dark:text-white text-sm">${parcel.name}</span>
            </div>
            ${statusBadge}
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>Dernière culture:</span>
              <span class="font-bold text-slate-600 dark:text-slate-300">${lastRotation ? lastRotation.crop_name : 'Aucune'}</span>
            </div>
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>Famille:</span>
              <span class="font-bold ${statusColor}">${statusText}</span>
            </div>
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>Cycle:</span>
              <span class="font-bold text-slate-600 dark:text-slate-300">${lastRotation ? `#${lastRotation.cycle_number}` : '-'}</span>
            </div>
          </div>
          ${lastRotation ? `
            <div class="mt-3">
              <div class="w-full bg-slate-100 dark:bg-[#0D2615]/50 rounded-full h-1.5">
                <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${progressPercent}%"></div>
              </div>
              <div class="flex justify-between text-[9px] text-slate-400 mt-1">
                <span>${formatDate(lastRotation.start_date)}</span>
                <span>${formatDate(lastRotation.end_date)}</span>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  renderRotationHistory() {
    const container = document.getElementById('rotation-history-table-body');
    if (!container) return;
    
    // Sort by date descending
    const sortedHistory = [...rotationHistory].sort((a, b) => 
      new Date(b.start_date) - new Date(a.start_date)
    );
    
    container.innerHTML = sortedHistory.map(record => {
      const family = KAStorage.getFamilyById(record.family_id);
      const familyColor = FAMILY_COLORS[record.family_id] || { color: '#6b7280' };
      const endDate = record.end_date || 'En cours';
      const isCurrent = !record.end_date || new Date(record.end_date) >= new Date();
      
      return `
        <tr class="border-b border-slate-200 dark:border-[#143E23]/40 hover:bg-slate-50 dark:hover:bg-[#0D2615]/30 transition-colors">
          <td class="py-4 px-4">
            <div class="font-bold text-slate-800 dark:text-white">${record.parcel_name || record.parcel_id}</div>
          </td>
          <td class="py-4 px-4">
            <span class="font-bold text-slate-700 dark:text-slate-300">${record.crop_name}</span>
          </td>
          <td class="py-4 px-4">
            <span class="px-2 py-1 bg-${familyColor.bgColor} text-${familyColor.color} text-[10px] font-bold rounded-lg">
              ${family ? family.name : record.family_name}
            </span>
          </td>
          <td class="py-4 px-4 text-center">
            <span class="font-mono text-slate-600 dark:text-slate-400">#${record.cycle_number}</span>
          </td>
          <td class="py-4 px-4 text-center">
            <span class="font-mono text-slate-600 dark:text-slate-400">${formatDate(record.start_date)}</span>
          </td>
          <td class="py-4 px-4 text-center">
            <span class="font-mono text-slate-600 dark:text-slate-400">${formatDate(endDate)}</span>
          </td>
          <td class="py-4 px-4 text-center">
            ${isCurrent ? 
              `<span class="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full">EN COURS</span>` :
              `<span class="px-2 py-1 bg-slate-500/10 text-slate-500 text-[10px] font-bold rounded-full">TERMINÉ</span>`
            }
          </td>
          <td class="py-4 px-4">
            <div class="flex items-center justify-center gap-1">
              <button onclick="window.openRotationDetailModal('${record.id}')" 
                      class="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer text-emerald-500">
                <i data-lucide="eye" class="h-4 w-4"></i>
              </button>
              <button onclick="window.openDeleteRotationModal('${record.id}')" 
                      class="p-2 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-rose-500">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderFamilyLibrary() {
    const container = document.getElementById('family-library-grid');
    if (!container) return;
    
    container.innerHTML = plantFamilies.map(family => {
      const familyColor = FAMILY_COLORS[family.id] || { color: '#6b7280', bgColor: '#f3f4f6' };
      const icon = FAMILY_ICONS[family.id] || 'leaf';
      const cropsInFamily = KAStorage.getCropsByFamily(family.id);
      
      return `
        <div class="bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40 p-4 cursor-pointer hover:shadow-md transition-all"
             onclick="window.showFamilyDetails('${family.id}')">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-${familyColor.bgColor} rounded-lg">
              <i data-lucide="${icon}" class="h-5 w-5 text-${familyColor.color}"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-black text-slate-800 dark:text-white text-sm">${family.name}</h4>
              <p class="text-[10px] text-slate-500 dark:text-[#819888] truncate">${family.description.substring(0, 50)}${family.description.length > 50 ? '...' : ''}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="px-2 py-0.5 bg-${familyColor.color}/10 text-${familyColor.color} text-[9px] font-bold rounded-full">
                  ${cropsInFamily.length} cultures
                </span>
                <span class="px-2 py-0.5 bg-slate-500/10 text-slate-500 text-[9px] font-bold rounded-full">
                  ${family.min_rotation_years} ans min
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderRotationPlannerModal() {
    // Populate parcel select
    const parcelSelect = document.getElementById('planner-parcel');
    if (parcelSelect) {
      this.populateParcelSelect(parcelSelect);
    }
    
    // Set default date
    const startDateInput = document.getElementById('planner-start-date');
    if (startDateInput && !startDateInput.value) {
      startDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Initialize sequence with one item
    this.addRotationSequenceItem();
  },

  renderFamilyManagerModal() {
    // Populate crop select
    const cropSelect = document.getElementById('crop-family-crop');
    if (cropSelect) {
      this.populateCropSelect(cropSelect);
    }
    
    // Populate family select
    const familySelect = document.getElementById('crop-family-family');
    if (familySelect) {
      familySelect.innerHTML = '<option value="">-- Sélectionner une famille --</option>';
      plantFamilies.forEach(family => {
        familySelect.innerHTML += `<option value="${family.id}">${family.name}</option>`;
      });
    }
    
    // Render families list
    this.renderFamiliesList();
    this.renderCropFamiliesList();
  },

  renderFamiliesList() {
    const container = document.getElementById('families-list');
    if (!container) return;
    
    container.innerHTML = plantFamilies.map(family => {
      const familyColor = FAMILY_COLORS[family.id] || { color: '#6b7280' };
      return `
        <div class="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0D2615]/30 rounded-lg">
          <div class="flex items-center gap-2">
            <span class="p-1.5 bg-${familyColor.color}/10 rounded-lg">
              <i data-lucide="layers" class="h-3 w-3 text-${familyColor.color}"></i>
            </span>
            <span class="font-bold text-slate-700 dark:text-slate-300 text-sm">${family.name}</span>
          </div>
          <div class="flex items-center gap-1">
            <button onclick="window.editFamily('${family.id}')" 
                    class="p-1.5 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer text-amber-500">
              <i data-lucide="pencil" class="h-3 w-3"></i>
            </button>
            <button onclick="window.deleteFamily('${family.id}')" 
                    class="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-rose-500">
              <i data-lucide="trash-2" class="h-3 w-3"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCropFamiliesList() {
    const container = document.getElementById('crop-families-list');
    if (!container) return;
    
    container.innerHTML = cropFamilies.map(cf => {
      const family = KAStorage.getFamilyById(cf.family_id);
      const familyColor = FAMILY_COLORS[cf.family_id] || { color: '#6b7280' };
      return `
        <div class="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0D2615]/30 rounded-lg">
          <div class="flex items-center gap-2">
            <span class="p-1.5 bg-${familyColor.color}/10 rounded-lg">
              <i data-lucide="link" class="h-3 w-3 text-${familyColor.color}"></i>
            </span>
            <span class="font-bold text-slate-700 dark:text-slate-300 text-sm">${cf.crop_name}</span>
            <span class="text-slate-400 dark:text-[#819888] text-[10px]">→ ${family ? family.name : cf.family_name}</span>
          </div>
          <button onclick="window.deleteCropFamily('${cf.id}')" 
                  class="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-rose-500">
            <i data-lucide="trash-2" class="h-3 w-3"></i>
          </button>
        </div>
      `;
    }).join('');
  },

  // Modal functions
  openRotationPlannerModal() {
    const modal = document.getElementById('rotation-planner-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderRotationPlannerModal();
    }
  },

  closeRotationPlannerModal() {
    const modal = document.getElementById('rotation-planner-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },

  openFamilyManagerModal() {
    const modal = document.getElementById('family-manager-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderFamilyManagerModal();
    }
  },

  closeFamilyManagerModal() {
    const modal = document.getElementById('family-manager-modal');
    if (modal) {
      modal.classList.add('hidden');
      // Hide forms
      document.getElementById('add-family-form')?.classList.add('hidden');
      document.getElementById('add-crop-family-form')?.classList.add('hidden');
    }
  },

  openRotationDetailModal(recordId) {
    const record = rotationHistory.find(r => r.id === recordId);
    if (!record) return;
    
    selectedRotationForDetail = record;
    const modal = document.getElementById('rotation-detail-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderRotationDetail();
    }
  },

  closeRotationDetailModal() {
    const modal = document.getElementById('rotation-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      selectedRotationForDetail = null;
    }
  },

  openDeleteRotationModal(recordId) {
    rotationToDelete = recordId;
    const modal = document.getElementById('delete-rotation-confirm-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const message = document.getElementById('delete-confirm-message');
      if (message) {
        message.textContent = 'Vous êtes sur le point de supprimer cet enregistrement de rotation. Cette action est irréversible.';
      }
    }
  },

  closeDeleteModal() {
    const modal = document.getElementById('delete-rotation-confirm-modal');
    if (modal) {
      modal.classList.add('hidden');
      rotationToDelete = null;
    }
  },

  renderRotationDetail() {
    if (!selectedRotationForDetail) return;
    
    const container = document.getElementById('rotation-detail-content');
    if (!container) return;
    
    const family = KAStorage.getFamilyById(selectedRotationForDetail.family_id);
    const parcel = parcels.find(p => p.id === selectedRotationForDetail.parcel_id);
    const crop = crops.find(c => c.id === selectedRotationForDetail.crop_id);
    const familyColor = FAMILY_COLORS[selectedRotationForDetail.family_id] || { color: '#6b7280' };
    
    const duration = selectedRotationForDetail.end_date ? 
      daysBetween(selectedRotationForDetail.start_date, selectedRotationForDetail.end_date) : 
      'En cours';
    
    container.innerHTML = `
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Informations Générales</h4>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-[#819888]">ID:</span>
              <span class="font-bold text-slate-800 dark:text-white">${selectedRotationForDetail.id}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-[#819888]">Parcelle:</span>
              <span class="font-bold text-slate-800 dark:text-white">${selectedRotationForDetail.parcel_name || selectedRotationForDetail.parcel_id}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-[#819888]">Culture:</span>
              <span class="font-bold text-slate-800 dark:text-white">${selectedRotationForDetail.crop_name}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-[#819888]">Famille:</span>
              <span class="font-bold text-${familyColor.color}">${selectedRotationForDetail.family_name}</span>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Détails de la Rotation</h4>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-[#819888]">Cycle:</span>
              <span class="font-bold text-slate-800 dark:text-white">#${selectedRotationForDetail.cycle_number}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-[#819888]">Date de Début:</span>
              <span class="font-bold text-slate-800 dark:text-white">${formatDate(selectedRotationForDetail.start_date)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-[#819888]">Date de Fin:</span>
              <span class="font-bold text-slate-800 dark:text-white">${formatDate(selectedRotationForDetail.end_date || 'En cours')}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 dark:text-[#819888]">Durée:</span>
              <span class="font-bold text-slate-800 dark:text-white">${duration} jours</span>
            </div>
          </div>
        </div>
      </div>
      
      ${selectedRotationForDetail.notes ? `
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h4>
          <p class="text-sm text-slate-700 dark:text-slate-300">${selectedRotationForDetail.notes}</p>
        </div>
      ` : ''}
      
      ${family ? `
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40">
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Informations sur la Famille</h4>
          <p class="text-sm text-slate-700 dark:text-slate-300 mb-2">${family.description}</p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-[#819888]">Années Min.:</span>
              <span class="font-bold text-slate-800 dark:text-white">${family.min_rotation_years}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-[#819888]">Compatibles:</span>
              <span class="font-bold text-slate-800 dark:text-white">${family.compatible_families.length}</span>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  },

  // Form functions
  showAddFamilyForm() {
    document.getElementById('add-family-form')?.classList.remove('hidden');
    document.getElementById('add-crop-family-form')?.classList.add('hidden');
    
    // Reset form
    document.getElementById('family-id').value = '';
    document.getElementById('family-name').value = '';
    document.getElementById('family-min-years').value = '2';
    document.getElementById('family-description').value = '';
    document.getElementById('family-compatible').value = '';
    document.getElementById('family-incompatible').value = '';
  },

  showAddCropFamilyForm() {
    document.getElementById('add-family-form')?.classList.add('hidden');
    document.getElementById('add-crop-family-form')?.classList.remove('hidden');
  },

  cancelFamilyForm() {
    document.getElementById('add-family-form')?.classList.add('hidden');
  },

  cancelCropFamilyForm() {
    document.getElementById('add-crop-family-form')?.classList.add('hidden');
  },

  editFamily(familyId) {
    const family = plantFamilies.find(f => f.id === familyId);
    if (!family) return;
    
    this.showAddFamilyForm();
    
    document.getElementById('family-id').value = family.id;
    document.getElementById('family-name').value = family.name;
    document.getElementById('family-min-years').value = family.min_rotation_years;
    document.getElementById('family-description').value = family.description || '';
    document.getElementById('family-compatible').value = family.compatible_families?.join(', ') || '';
    document.getElementById('family-incompatible').value = family.incompatible_families?.join(', ') || '';
  },

  // Data management functions
  populateParcelSelect(selectElement, excludeId = null) {
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">-- Sélectionner une parcelle --</option>';
    parcels.forEach(parcel => {
      if (parcel.id !== excludeId) {
        selectElement.innerHTML += `<option value="${parcel.id}">${parcel.name}</option>`;
      }
    });
  },

  populateCropSelect(selectElement, parcelId = null) {
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">-- Sélectionner une culture --</option>';
    crops.forEach(crop => {
      selectElement.innerHTML += `<option value="${crop.name}">${crop.name}</option>`;
    });
  },

  addRotationSequenceItem() {
    const container = document.getElementById('rotation-sequence');
    if (!container) return;
    
    const sequenceNumber = container.children.length + 1;
    const itemId = `sequence-item-${sequenceNumber}`;
    
    const html = `
      <div id="${itemId}" class="p-3 bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40 flex items-center gap-3">
        <span class="font-bold text-slate-500 dark:text-[#819888] text-sm w-6">${sequenceNumber}.</span>
        <select class="flex-1 px-3 py-2 bg-white dark:bg-[#061109]/40 border border-slate-200 dark:border-[#143E23]/40 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
          <option value="">-- Sélectionner une culture --</option>
          ${crops.map(crop => `<option value="${crop.name}">${crop.name}</option>`).join('')}
        </select>
        <input type="date" class="px-3 py-2 bg-white dark:bg-[#061109]/40 border border-slate-200 dark:border-[#143E23]/40 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-40">
        <button onclick="window.removeSequenceItem('${itemId}')" class="p-2 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-rose-500">
          <i data-lucide="trash-2" class="h-4 w-4"></i>
        </button>
      </div>
    `;
    
    container.innerHTML += html;
  },

  removeSequenceItem(itemId) {
    const item = document.getElementById(itemId);
    if (item) {
      item.remove();
      // Renumber items
      const container = document.getElementById('rotation-sequence');
      const items = container?.querySelectorAll('div[id^="sequence-item-"]');
      items?.forEach((item, index) => {
        const span = item.querySelector('span');
        if (span) span.textContent = `${index + 1}.`;
      });
    }
  },

  // Save functions
  saveRotationPlan() {
    const parcelId = document.getElementById('planner-parcel')?.value;
    const startDate = document.getElementById('planner-start-date')?.value;
    const duration = parseInt(document.getElementById('planner-duration')?.value) || 90;
    const notes = document.getElementById('planner-notes')?.value || '';
    
    if (!parcelId || !startDate) {
      alert('Veuillez sélectionner une parcelle et une date de début');
      return;
    }
    
    const sequenceContainer = document.getElementById('rotation-sequence');
    const sequenceItems = sequenceContainer?.querySelectorAll('div[id^="sequence-item-"]');
    
    if (!sequenceItems || sequenceItems.length === 0) {
      alert('Veuillez ajouter au moins une culture à la séquence');
      return;
    }
    
    // Process each sequence item
    for (let i = 0; i < sequenceItems.length; i++) {
      const item = sequenceItems[i];
      const cropSelect = item.querySelector('select');
      const dateInput = item.querySelector('input[type="date"]');
      
      const cropName = cropSelect?.value;
      const itemDate = dateInput?.value || startDate;
      
      if (cropName) {
        // Calculate end date
        const startDateObj = new Date(itemDate);
        const endDateObj = new Date(startDateObj.getTime() + (duration * 24 * 60 * 60 * 1000));
        const endDate = endDateObj.toISOString().split('T')[0];
        
        // Get family info
        const familyId = KAStorage.getFamilyIdByCrop(cropName);
        const family = KAStorage.getFamilyById(familyId);
        
        // Get parcel info
        const parcel = parcels.find(p => p.id === parcelId);
        
        // Get last rotation for this parcel
        const lastRotation = KAStorage.getLastRotationForParcel(parcelId);
        const cycleNumber = lastRotation ? lastRotation.cycle_number + 1 : 1;
        
        // Create rotation record
        const record = {
          id: generateId('RH'),
          parcel_id: parcelId,
          parcel_name: parcel?.name || parcelId,
          crop_name: cropName,
          family_id: familyId || 'UNKNOWN',
          family_name: family?.name || 'Inconnue',
          start_date: itemDate,
          end_date: i === sequenceItems.length - 1 ? endDate : null, // Only last item has end date
          cycle_number: cycleNumber + i,
          warning_issued: false,
          notes: i === 0 ? notes : `Séquence ${i + 1}`
        };
        
        // Add to history
        KAStorage.addRotationHistory(record);
      }
    }
    
    // Refresh and close
    this.loadData();
    this.render();
    this.closeRotationPlannerModal();
    
    alert('Plan de rotation enregistré avec succès !');
  },

  savePlantFamily(event) {
    event.preventDefault();
    
    const id = document.getElementById('family-id')?.value || generateId('FAM');
    const name = document.getElementById('family-name')?.value.trim();
    const minYears = parseInt(document.getElementById('family-min-years')?.value) || 2;
    const description = document.getElementById('family-description')?.value.trim() || '';
    const compatible = document.getElementById('family-compatible')?.value.split(',').map(s => s.trim()).filter(s => s) || [];
    const incompatible = document.getElementById('family-incompatible')?.value.split(',').map(s => s.trim()).filter(s => s) || [];
    
    if (!name) {
      alert('Veuillez saisir un nom de famille');
      return;
    }
    
    const family = {
      id,
      name,
      description,
      min_rotation_years: minYears,
      compatible_families: compatible,
      incompatible_families: incompatible
    };
    
    if (id.includes('FAM')) {
      // Update existing
      KAStorage.updatePlantFamily(id, family);
    } else {
      // Add new
      KAStorage.addPlantFamily(family);
    }
    
    // Refresh
    this.loadData();
    this.render();
    this.cancelFamilyForm();
    
    alert('Famille de plantes enregistrée avec succès !');
  },

  saveCropFamily(event) {
    event.preventDefault();
    
    const cropName = document.getElementById('crop-family-crop')?.value;
    const familyId = document.getElementById('crop-family-family')?.value;
    
    if (!cropName || !familyId) {
      alert('Veuillez sélectionner une culture et une famille');
      return;
    }
    
    const family = KAStorage.getFamilyById(familyId);
    if (!family) {
      alert('Famille introuvable');
      return;
    }
    
    const cropFamily = {
      id: generateId('CF'),
      crop_name: cropName,
      family_id: familyId,
      family_name: family.name
    };
    
    KAStorage.addCropFamily(cropFamily);
    
    // Refresh
    this.loadData();
    this.render();
    this.cancelCropFamilyForm();
    
    alert('Association culture-famille enregistrée avec succès !');
  },

  deleteFamily(familyId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette famille ?')) return;
    
    KAStorage.deletePlantFamily(familyId);
    
    this.loadData();
    this.render();
    
    alert('Famille supprimée avec succès !');
  },

  deleteCropFamily(cropFamilyId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette association ?')) return;
    
    const cropFamilies = KAStorage.getCropFamilies();
    const filtered = cropFamilies.filter(cf => cf.id !== cropFamilyId);
    KAStorage.saveCropFamilies(filtered);
    
    this.loadData();
    this.render();
    
    alert('Association supprimée avec succès !');
  },

  confirmDeleteRotation() {
    if (!rotationToDelete) return;
    
    const history = KAStorage.getRotationHistory();
    const filtered = history.filter(r => r.id !== rotationToDelete);
    KAStorage.saveRotationHistory(filtered);
    
    this.loadData();
    this.render();
    this.closeDeleteModal();
    
    alert('Enregistrement de rotation supprimé avec succès !');
  },

  showFamilyDetails(familyId) {
    const family = KAStorage.getFamilyById(familyId);
    if (!family) return;
    
    const familyColor = FAMILY_COLORS[familyId] || { color: '#6b7280' };
    const cropsInFamily = KAStorage.getCropsByFamily(familyId);
    const compatibleFamilies = family.compatible_families.map(id => {
      const f = KAStorage.getFamilyById(id);
      return f ? f.name : id;
    }).join(', ');
    
    const incompatibleFamilies = family.incompatible_families.map(id => {
      const f = KAStorage.getFamilyById(id);
      return f ? f.name : id;
    }).join(', ');
    
    alert(`
Familles de Plantes: ${family.name}

Description: ${family.description}

Années minimum entre rotations: ${family.min_rotation_years}

Cultures dans cette famille: ${cropsInFamily.length > 0 ? cropsInFamily.join(', ') : 'Aucune'}

Familles compatibles: ${compatibleFamilies || 'Aucune'}

Familles incompatibles: ${incompatibleFamilies || 'Aucune'}
    `);
  },

  openParcelRotationDetail(parcelId) {
    const parcel = parcels.find(p => p.id === parcelId);
    if (!parcel) return;
    
    const rotations = KAStorage.getRotationHistoryByParcel(parcelId);
    
    if (rotations.length === 0) {
      alert(`Aucune rotation enregistrée pour la parcelle : ${parcel.name}`);
      return;
    }
    
    let message = `Historique de rotation pour : ${parcel.name}\n\n`;
    
    rotations.forEach((rotation, index) => {
      const family = KAStorage.getFamilyById(rotation.family_id);
      message += `${index + 1}. Cycle #${rotation.cycle_number}\n`;
      message += `   Culture: ${rotation.crop_name}\n`;
      message += `   Famille: ${rotation.family_name}\n`;
      message += `   Période: ${formatDate(rotation.start_date)} - ${formatDate(rotation.end_date || 'En cours')}\n`;
      message += `   Durée: ${rotation.end_date ? daysBetween(rotation.start_date, rotation.end_date) + ' jours' : 'En cours'}\n`;
      if (rotation.notes) {
        message += `   Notes: ${rotation.notes}\n`;
      }
      message += '\n';
    });
    
    alert(message);
  },

  checkRotationCompatibility() {
    const parcelId = document.getElementById('quick-check-parcel')?.value;
    const cropName = document.getElementById('quick-check-crop')?.value;
    
    if (!parcelId || !cropName) {
      alert('Veuillez sélectionner une parcelle et une culture');
      return;
    }
    
    const result = KAStorage.canCropFollow(cropName, parcelId);
    const container = document.getElementById('quick-check-result');
    
    if (!container) return;
    
    container.classList.remove('hidden');
    
    let html = '';
    
    if (result.canFollow) {
      html = `
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-500/10 rounded-lg">
            <i data-lucide="check-circle" class="h-5 w-5 text-emerald-500"></i>
          </div>
          <div>
            <p class="font-bold text-emerald-500 text-sm">COMPATIBLE</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">${result.reason}</p>
          </div>
        </div>
      `;
    } else {
      html = `
        <div class="flex items-center gap-3">
          <div class="p-2 bg-rose-500/10 rounded-lg">
            <i data-lucide="x-circle" class="h-5 w-5 text-rose-500"></i>
          </div>
          <div>
            <p class="font-bold text-rose-500 text-sm">INCOMPATIBLE</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">${result.reason}</p>
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html;
  },

  refreshRotationData() {
    this.loadData();
    this.render();
  },

  filterRotationHistory() {
    const searchTerm = document.getElementById('history-search')?.value.toLowerCase() || '';
    
    // Re-render with filter
    const container = document.getElementById('rotation-history-table-body');
    if (!container) return;
    
    let filteredHistory = [...rotationHistory];
    
    if (searchTerm) {
      filteredHistory = filteredHistory.filter(record => 
        (record.parcel_name || record.parcel_id).toLowerCase().includes(searchTerm) ||
        record.crop_name.toLowerCase().includes(searchTerm) ||
        record.family_name.toLowerCase().includes(searchTerm)
      );
    }
    
    filteredHistory.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    
    container.innerHTML = filteredHistory.map(record => {
      const family = KAStorage.getFamilyById(record.family_id);
      const familyColor = FAMILY_COLORS[record.family_id] || { color: '#6b7280' };
      const endDate = record.end_date || 'En cours';
      const isCurrent = !record.end_date || new Date(record.end_date) >= new Date();
      
      return `
        <tr class="border-b border-slate-200 dark:border-[#143E23]/40 hover:bg-slate-50 dark:hover:bg-[#0D2615]/30 transition-colors">
          <td class="py-4 px-4">
            <div class="font-bold text-slate-800 dark:text-white">${record.parcel_name || record.parcel_id}</div>
          </td>
          <td class="py-4 px-4">
            <span class="font-bold text-slate-700 dark:text-slate-300">${record.crop_name}</span>
          </td>
          <td class="py-4 px-4">
            <span class="px-2 py-1 bg-${familyColor.bgColor} text-${familyColor.color} text-[10px] font-bold rounded-lg">
              ${family ? family.name : record.family_name}
            </span>
          </td>
          <td class="py-4 px-4 text-center">
            <span class="font-mono text-slate-600 dark:text-slate-400">#${record.cycle_number}</span>
          </td>
          <td class="py-4 px-4 text-center">
            <span class="font-mono text-slate-600 dark:text-slate-400">${formatDate(record.start_date)}</span>
          </td>
          <td class="py-4 px-4 text-center">
            <span class="font-mono text-slate-600 dark:text-slate-400">${formatDate(endDate)}</span>
          </td>
          <td class="py-4 px-4 text-center">
            ${isCurrent ? 
              `<span class="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full">EN COURS</span>` :
              `<span class="px-2 py-1 bg-slate-500/10 text-slate-500 text-[10px] font-bold rounded-full">TERMINÉ</span>`
            }
          </td>
          <td class="py-4 px-4">
            <div class="flex items-center justify-center gap-1">
              <button onclick="window.openRotationDetailModal('${record.id}')" 
                      class="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer text-emerald-500">
                <i data-lucide="eye" class="h-4 w-4"></i>
              </button>
              <button onclick="window.openDeleteRotationModal('${record.id}')" 
                      class="p-2 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-rose-500">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
};

// Export for use in HTML
window.RotationModule = RotationModule;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => RotationModule.init());
} else {
  RotationModule.init();
}
