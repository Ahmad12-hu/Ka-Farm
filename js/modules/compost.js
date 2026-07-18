// KA Farm - Module Calculateur de Compostage Organique
// Fonctionnalité 2.3 : Calculateur de compostage organique

import { KAStorage } from '../storage.js';

// ============================================================
// MAIN MODULE EXPORT
// ============================================================

export const CompostModule = {
  // State management
  state: {
    currentCalculatorMaterials: {},
    currentBatchMaterials: {},
    selectedBatchForDelete: null,
    selectedRecipeForEdit: null,
    selectedMaterialForEdit: null,
    currentTemperature: null,
    searchQuery: '',
    filterStatus: 'all'
  },

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
    // Statistics
    this.elements = {
      statTotalBatches: document.getElementById('stat-total-batches'),
      statTotalQuantity: document.getElementById('stat-total-quantity'),
      statCompletedBatches: document.getElementById('stat-completed-batches'),
      statInProgress: document.getElementById('stat-in-progress'),
      statAvgCNRatio: document.getElementById('stat-avg-cn-ratio'),
      statAvgDays: document.getElementById('stat-avg-days'),
      
      // C:N Calculator
      cnRatioDisplay: document.getElementById('cn-ratio-display'),
      cnRatioStatus: document.getElementById('cn-ratio-status'),
      cnRatioCircle: document.getElementById('cn-ratio-circle'),
      materialSelect: document.getElementById('material-select'),
      materialQuantity: document.getElementById('material-quantity'),
      calculatorMaterials: document.getElementById('calculator-materials'),
      cnRecommendations: document.getElementById('cn-recommendations'),
      
      // Current Batches
      currentBatchesGrid: document.getElementById('current-batches-grid'),
      
      // History
      compostHistoryTableBody: document.getElementById('compost-history-table-body'),
      compostHistorySearch: document.getElementById('compost-history-search'),
      
      // Materials Inventory
      materialsGrid: document.getElementById('materials-grid'),
      
      // Temperature
      currentTempDisplay: document.getElementById('current-temp-display'),
      tempStatus: document.getElementById('temp-status'),
      
      // Modals
      newBatchModal: document.getElementById('new-batch-modal'),
      recipeManagerModal: document.getElementById('recipe-manager-modal'),
      materialManagerModal: document.getElementById('material-manager-modal'),
      batchDetailModal: document.getElementById('batch-detail-modal'),
      deleteBatchConfirmModal: document.getElementById('delete-batch-confirm-modal'),
      
      // Modal elements
      batchRecipe: document.getElementById('batch-recipe'),
      batchStartDate: document.getElementById('batch-start-date'),
      batchLocation: document.getElementById('batch-location'),
      batchNotes: document.getElementById('batch-notes'),
      batchMaterialsSelector: document.getElementById('batch-materials-selector'),
      batchCNRatio: document.getElementById('batch-cn-ratio'),
      batchCNProgress: document.getElementById('batch-cn-progress'),
      batchCNStatus: document.getElementById('batch-cn-status'),
      
      recipesList: document.getElementById('recipes-list'),
      recipeDetails: document.getElementById('recipe-details'),
      addRecipeForm: document.getElementById('add-recipe-form'),
      recipeForm: document.getElementById('recipe-form'),
      
      materialsList: document.getElementById('materials-list'),
      materialDetails: document.getElementById('material-details'),
      addMaterialForm: document.getElementById('add-material-form'),
      materialForm: document.getElementById('material-form'),
      
      batchDetailContent: document.getElementById('batch-detail-content'),
      deleteBatchConfirmMessage: document.getElementById('delete-batch-confirm-message')
    };
  },

  loadInitialData() {
    // Set default date for new batch
    const today = new Date().toISOString().split('T')[0];
    if (this.elements.batchStartDate) {
      this.elements.batchStartDate.value = today;
    }
    
    // Load materials into calculator select
    this.loadMaterialSelectOptions();
    
    // Load recipes into batch recipe select
    this.loadRecipeSelectOptions();
    
    // Load temperature (simulated)
    this.updateTemperatureDisplay();
  },

  // ============================================================
  // MAIN RENDER METHOD
  // ============================================================

  render() {
    this.renderStatistics();
    this.renderCurrentBatches();
    this.renderCompostHistory();
    this.renderMaterialsInventory();
    this.renderCalculatorMaterials();
    this.updateCNRatioDisplay();
  },

  // ============================================================
  // STATISTICS
  // ============================================================

  renderStatistics() {
    const stats = this.storage.getCompostStats();
    
    if (this.elements.statTotalBatches) {
      this.elements.statTotalBatches.textContent = stats.totalBatches || 0;
    }
    if (this.elements.statTotalQuantity) {
      this.elements.statTotalQuantity.textContent = `${stats.totalQuantity || 0} kg`;
    }
    if (this.elements.statCompletedBatches) {
      this.elements.statCompletedBatches.textContent = stats.completedBatches || 0;
    }
    if (this.elements.statInProgress) {
      this.elements.statInProgress.textContent = stats.inProgressBatches || 0;
    }
    if (this.elements.statAvgCNRatio) {
      this.elements.statAvgCNRatio.textContent = `${stats.avgCNRatio || 0}:1`;
    }
    if (this.elements.statAvgDays) {
      this.elements.statAvgDays.textContent = stats.avgMaturationDays || 0;
    }
  },

  // ============================================================
  // C:N RATIO CALCULATOR
  // ============================================================

  loadMaterialSelectOptions() {
    const materials = this.storage.getCompostMaterials();
    const select = this.elements.materialSelect;
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Sélectionner un matériau --</option>';
    
    materials.forEach(material => {
      const option = document.createElement('option');
      option.value = material.id;
      option.textContent = `${material.name} (C:N: ${material.c_n_ratio}:1)`;
      option.dataset.cnRatio = material.c_n_ratio;
      option.dataset.carbon = material.carbon_ratio;
      option.dataset.nitrogen = material.nitrogen_ratio;
      select.appendChild(option);
    });
  },

  addMaterialToCalculator() {
    const select = this.elements.materialSelect;
    const quantityInput = this.elements.materialQuantity;
    
    if (!select || !quantityInput) return;
    
    const materialId = select.value;
    const quantity = parseFloat(quantityInput.value) || 0;
    
    if (!materialId || quantity <= 0) {
      this.showToast('Veuillez sélectionner un matériau et une quantité valide', 'error');
      return;
    }
    
    // Add to state
    this.state.currentCalculatorMaterials[materialId] = (
      this.state.currentCalculatorMaterials[materialId] || 0
    ) + quantity;
    
    // Reset for next addition
    select.value = '';
    quantityInput.value = '10';
    
    // Re-render
    this.renderCalculatorMaterials();
    this.updateCNRatioDisplay();
  },

  renderCalculatorMaterials() {
    const container = this.elements.calculatorMaterials;
    if (!container) return;
    
    const materials = this.storage.getCompostMaterials();
    
    container.innerHTML = '';
    
    for (const [materialId, quantity] of Object.entries(this.state.currentCalculatorMaterials)) {
      const material = materials.find(m => m.id === materialId);
      if (!material) continue;
      
      const item = document.createElement('div');
      item.className = 'p-2.5 bg-slate-100 dark:bg-[#0D2615]/50 rounded-lg border border-slate-200 dark:border-[#143E23]/40 flex items-center justify-between';
      item.innerHTML = `
        <div class="flex-1 min-w-0">
          <p class="font-bold text-slate-800 dark:text-white truncate">${material.name}</p>
          <p class="text-[10px] text-slate-500 dark:text-[#819888]">${material.material_type} | C:N: ${material.c_n_ratio}:1</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm text-amber-500">${quantity} ${material.unit}</span>
          <button onclick="window.removeCalculatorMaterial('${materialId}')" class="p-1 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">
            <i data-lucide="trash-2" class="h-4 w-4 text-rose-500"></i>
          </button>
        </div>
      `;
      container.appendChild(item);
    }
  },

  removeCalculatorMaterial(materialId) {
    delete this.state.currentCalculatorMaterials[materialId];
    this.renderCalculatorMaterials();
    this.updateCNRatioDisplay();
  },

  clearCalculator() {
    this.state.currentCalculatorMaterials = {};
    this.renderCalculatorMaterials();
    this.updateCNRatioDisplay();
    this.hideCnRecommendations();
  },

  updateCNRatioDisplay() {
    const ratio = this.storage.calculateCNRatio(this.state.currentCalculatorMaterials);
    const display = this.elements.cnRatioDisplay;
    const status = this.elements.cnRatioStatus;
    const circle = this.elements.cnRatioCircle;
    
    if (!display || !status || !circle) return;
    
    // Update display
    display.textContent = `${Math.round(ratio * 10) / 10}:1`;
    
    // Update status and color
    let statusText = '';
    let progress = 0;
    let bgColor = '';
    
    if (ratio === 0) {
      statusText = 'Ajoutez des matériaux';
      progress = 0;
      bgColor = '#f3f4f6';
    } else if (ratio < 20) {
      statusText = 'Ratio trop bas - Risque de pourriture';
      progress = Math.min(ratio / 20 * 100, 100);
      bgColor = '#fee2e2';
    } else if (ratio >= 20 && ratio <= 35) {
      statusText = 'Ratio idéal';
      progress = 100;
      bgColor = '#dcfce7';
    } else if (ratio > 35 && ratio <= 50) {
      statusText = 'Ratio acceptable';
      progress = Math.max(100 - (ratio - 35) * 2, 50);
      bgColor = '#fffbeb';
    } else {
      statusText = 'Ratio trop élevé - Décomposition lente';
      progress = Math.max(50 - (ratio - 50) * 2, 0);
      bgColor = '#fee2e2';
    }
    
    status.textContent = statusText;
    
    // Update progress ring
    const circumference = 326.7;
    const offset = circumference - (progress / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = progress >= 80 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#ef4444';
    
    // Show recommendations
    if (ratio > 0) {
      this.showCnRecommendations(ratio);
    }
  },

  showCnRecommendations(ratio) {
    const container = this.elements.cnRecommendations;
    if (!container) return;
    
    const recommendations = this.storage.getCNRatioRecommendations(ratio);
    
    if (recommendations.length === 0) {
      container.classList.add('hidden');
      return;
    }
    
    container.classList.remove('hidden');
    container.innerHTML = recommendations.map(rec => {
      const priorityClass = rec.priority === 'critique' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 
                           rec.priority === 'haute' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 
                           'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      return `
        <div class="p-2.5 rounded-lg ${priorityClass} border-l-4">
          <p class="font-bold text-sm">${rec.message}</p>
          <p class="text-[10px] opacity-70 mt-1">Priorité: ${rec.priority}</p>
        </div>
      `;
    }).join('');
  },

  hideCnRecommendations() {
    const container = this.elements.cnRecommendations;
    if (container) {
      container.classList.add('hidden');
    }
  },

  calculateIdealMix() {
    const mix = this.storage.calculateIdealMix(30);
    this.showToast(mix.explanation, 'info', 5000);
  },

  // ============================================================
  // QUICK RECIPES
  // ============================================================

  startQuickRecipe(recipeId) {
    const recipe = this.storage.getCompostRecipeById(recipeId);
    if (!recipe) return;
    
    // Set recipe in batch modal
    if (this.elements.batchRecipe) {
      this.elements.batchRecipe.value = recipeId;
    }
    
    // Load recipe materials into batch
    const ingredients = this.storage.getIngredientsByRecipe(recipeId);
    this.state.currentBatchMaterials = {};
    
    ingredients.forEach(ing => {
      this.state.currentBatchMaterials[ing.material_id] = ing.quantity;
    });
    
    // Update batch materials display
    this.renderBatchMaterialsSelector();
    this.updateBatchCNRatio();
    
    // Open batch modal
    this.openNewBatchModal();
  },

  // ============================================================
  // CURRENT BATCHES
  // ============================================================

  renderCurrentBatches() {
    const container = this.elements.currentBatchesGrid;
    if (!container) return;
    
    const batches = this.storage.getCurrentComposting();
    
    if (batches.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-8">
          <i data-lucide="loader-2" class="h-12 w-12 text-slate-300 mx-auto mb-3"></i>
          <p class="text-sm text-slate-500 dark:text-[#819888]">Aucun tas de compost en cours</p>
          <p class="text-xs text-slate-400 mt-1">Créez un nouveau tas pour commencer</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = batches.map(batch => {
      const recipe = this.storage.getCompostRecipeById(batch.recipe_id);
      return `
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer" onclick="window.showBatchDetail('${batch.id}')">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-bold text-slate-800 dark:text-white">${recipe?.name || 'Recette inconnue'}</h4>
            <span class="px-2 py-0.5 bg-blue-500/10 text-blue-500 font-extrabold text-[9px] rounded-lg">EN COURS</span>
          </div>
          <div class="space-y-1.5 text-[10px]">
            <div class="flex items-center gap-2 text-slate-500 dark:text-[#819888]">
              <i data-lucide="calendar" class="h-3 w-3"></i>
              <span>Début: ${this.formatDate(batch.start_date)}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-500 dark:text-[#819888]">
              <i data-lucide="flame" class="h-3 w-3"></i>
              <span>Ratio C:N: ${batch.c_n_ratio_achieved || '--'}:1</span>
            </div>
            <div class="flex items-center gap-2 text-slate-500 dark:text-[#819888]">
              <i data-lucide="clock" class="h-3 w-3"></i>
              <span>Jours: ${batch.start_date ? this.calculateDaysSince(batch.start_date) : 0}</span>
            </div>
          </div>
          <div class="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-[#143E23]/40">
            <button onclick="event.stopPropagation(); window.markBatchCompleted('${batch.id}')" class="flex-1 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-950/20 hover:bg-emerald-500/20 text-emerald-500 font-extrabold text-[9px] rounded-lg transition-all">
              Terminé
            </button>
            <button onclick="event.stopPropagation(); window.editBatch('${batch.id}')" class="flex-1 px-3 py-1.5 bg-amber-500/10 dark:bg-amber-950/20 hover:bg-amber-500/20 text-amber-500 font-extrabold text-[9px] rounded-lg transition-all">
              Modifier
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  showBatchDetail(batchId) {
    const batch = this.storage.getCompostHistory().find(h => h.id === batchId);
    if (!batch) return;
    
    const recipe = this.storage.getCompostRecipeById(batch.recipe_id);
    const materials = this.storage.getCompostMaterials();
    
    const content = this.elements.batchDetailContent;
    if (!content) return;
    
    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl">
          <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Informations Générales</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">ID du Tas</p>
              <p class="font-bold text-slate-800 dark:text-white">${batch.id}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Recette</p>
              <p class="font-bold text-slate-800 dark:text-white">${recipe?.name || 'Inconnue'}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Date de Début</p>
              <p class="font-bold text-slate-800 dark:text-white">${this.formatDate(batch.start_date)}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Date de Fin</p>
              <p class="font-bold text-slate-800 dark:text-white">${batch.end_date ? this.formatDate(batch.end_date) : 'En cours'}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Statut</p>
              <span class="px-2 py-0.5 bg-${batch.status === 'Terminé' ? 'emerald' : 'blue'}-500/10 text-${batch.status === 'Terminé' ? 'emerald' : 'blue'}-500 font-extrabold text-xs rounded">${batch.status}</span>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Ratio C:N Atteint</p>
              <p class="font-bold text-purple-500">${batch.c_n_ratio_achieved || '--'}:1</p>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl">
          <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Matériaux Utilisés</h4>
          <div class="space-y-2">
            ${Object.entries(batch.materials_used || {}).map(([materialId, quantity]) => {
              const material = materials.find(m => m.id === materialId);
              return material ? `
                <div class="flex items-center justify-between p-2 bg-white dark:bg-[#061109]/40 rounded-lg">
                  <div>
                    <p class="font-bold text-slate-800 dark:text-white">${material.name}</p>
                    <p class="text-[10px] text-slate-500 dark:text-[#819888]">${material.material_type} | C:N: ${material.c_n_ratio}:1</p>
                  </div>
                  <span class="font-bold text-amber-500">${quantity} ${material.unit}</span>
                </div>
              ` : '';
            }).join('')}
          </div>
        </div>
        
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl">
          <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Production</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Quantité Produite</p>
              <p class="font-bold text-emerald-500">${batch.quantity_produced_kg || 0} kg</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Jours de Maturation</p>
              <p class="font-bold text-cyan-500">${batch.start_date && batch.end_date ? this.calculateDaysBetween(batch.start_date, batch.end_date) : 'En cours'} jours</p>
            </div>
          </div>
        </div>
        
        ${batch.notes ? `
        <div class="p-4 bg-slate-50 dark:bg-[#0D2615]/30 rounded-2xl">
          <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Notes</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300">${batch.notes}</p>
        </div>
        ` : ''}
      </div>
    `;
    
    this.openBatchDetailModal();
  },

  editBatch(batchId) {
    const batch = this.storage.getCompostHistory().find(h => h.id === batchId);
    if (!batch) return;
    
    // Load batch data into modal
    if (this.elements.batchRecipe) {
      this.elements.batchRecipe.value = batch.recipe_id;
    }
    if (this.elements.batchStartDate) {
      this.elements.batchStartDate.value = batch.start_date;
    }
    if (this.elements.batchNotes) {
      this.elements.batchNotes.value = batch.notes || '';
    }
    
    // Load materials
    this.state.currentBatchMaterials = { ...batch.materials_used };
    this.renderBatchMaterialsSelector();
    this.updateBatchCNRatio();
    
    // Store batch ID for update
    this.state.editingBatchId = batchId;
    
    this.openNewBatchModal();
  },

  markBatchCompleted(batchId) {
    const batch = this.storage.getCompostHistory().find(h => h.id === batchId);
    if (!batch) return;
    
    const today = new Date().toISOString().split('T')[0];
    const recipe = this.storage.getCompostRecipeById(batch.recipe_id);
    
    // Calculate C:N ratio
    const materialsUsed = batch.materials_used || {};
    const cnRatio = this.storage.calculateCNRatio(materialsUsed);
    
    // Update batch
    const updates = {
      end_date: today,
      status: 'Terminé',
      c_n_ratio_achieved: Math.round(cnRatio * 10) / 10,
      quantity_produced_kg: this.estimateProduction(materialsUsed, recipe)
    };
    
    this.storage.updateCompostHistory(batchId, updates);
    
    this.showToast(`Tas ${batchId} marqué comme terminé!`, 'success');
    this.render();
  },

  estimateProduction(materialsUsed, recipe) {
    // Simple estimation: sum of all materials * 0.6 (60% conversion rate)
    const totalQuantity = Object.values(materialsUsed).reduce((sum, qty) => sum + qty, 0);
    return Math.round(totalQuantity * 0.6);
  },

  // ============================================================
  // BATCH MANAGEMENT (NEW/EDIT)
  // ============================================================

  openNewBatchModal() {
    this.elements.newBatchModal?.classList.remove('hidden');
    this.loadRecipeSelectOptions();
  },

  closeNewBatchModal() {
    this.elements.newBatchModal?.classList.add('hidden');
    this.state.currentBatchMaterials = {};
    this.state.editingBatchId = null;
    this.renderBatchMaterialsSelector();
  },

  loadRecipeSelectOptions() {
    const recipes = this.storage.getCompostRecipes();
    const select = this.elements.batchRecipe;
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Sélectionner une recette --</option>';
    
    recipes.forEach(recipe => {
      const option = document.createElement('option');
      option.value = recipe.id;
      option.textContent = `${recipe.name} (Ratio: ${recipe.target_c_n_ratio}:1, ${recipe.maturation_days} jours)`;
      select.appendChild(option);
    });
  },

  addMaterialToBatch() {
    const select = document.getElementById('batch-material-select');
    const quantityInput = document.getElementById('batch-material-quantity');
    
    if (!select || !quantityInput) return;
    
    const materialId = select.value;
    const quantity = parseFloat(quantityInput.value) || 0;
    
    if (!materialId || quantity <= 0) {
      this.showToast('Veuillez sélectionner un matériau et une quantité', 'error');
      return;
    }
    
    // Add to state
    this.state.currentBatchMaterials[materialId] = (
      this.state.currentBatchMaterials[materialId] || 0
    ) + quantity;
    
    // Reset
    select.value = '';
    quantityInput.value = '10';
    
    // Re-render
    this.renderBatchMaterialsSelector();
    this.updateBatchCNRatio();
  },

  renderBatchMaterialsSelector() {
    const container = this.elements.batchMaterialsSelector;
    if (!container) return;
    
    const materials = this.storage.getCompostMaterials();
    
    // Create material select
    container.innerHTML = `
      <div class="flex gap-2">
        <select id="batch-material-select" class="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
          <option value="">-- Sélectionner un matériau --</option>
          ${materials.map(material => `
            <option value="${material.id}">${material.name} (C:N: ${material.c_n_ratio}:1)</option>
          `).join('')}
        </select>
        <input id="batch-material-quantity" type="number" value="10" min="0.1" step="0.1" class="w-24 px-3 py-2.5 bg-slate-50 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
        <button onclick="window.addMaterialToBatch()" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
          <i data-lucide="plus" class="h-4 w-4"></i>
        </button>
      </div>
      <div id="batch-materials-list" class="space-y-2 mt-3">
      </div>
    `;
    
    // Render current materials
    const listContainer = document.getElementById('batch-materials-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = Object.entries(this.state.currentBatchMaterials).map(([materialId, quantity]) => {
      const material = materials.find(m => m.id === materialId);
      if (!material) return '';
      
      return `
        <div class="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-[#0D2615]/50 rounded-lg border border-slate-200 dark:border-[#143E23]/40">
          <div class="flex-1 min-w-0">
            <p class="font-bold text-slate-800 dark:text-white truncate">${material.name}</p>
            <p class="text-[10px] text-slate-500 dark:text-[#819888]">${material.material_type} | C:N: ${material.c_n_ratio}:1</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-amber-500">${quantity} ${material.unit}</span>
            <button onclick="window.removeBatchMaterial('${materialId}')" class="p-1 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4 text-rose-500"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  removeBatchMaterial(materialId) {
    delete this.state.currentBatchMaterials[materialId];
    this.renderBatchMaterialsSelector();
    this.updateBatchCNRatio();
  },

  updateBatchCNRatio() {
    const ratio = this.storage.calculateCNRatio(this.state.currentBatchMaterials);
    const display = this.elements.batchCNRatio;
    const progress = this.elements.batchCNProgress;
    const status = this.elements.batchCNStatus;
    
    if (!display || !progress || !status) return;
    
    display.textContent = `${Math.round(ratio * 10) / 10}:1`;
    progress.style.width = `${Math.min(ratio / 30 * 100, 100)}%`;
    
    let statusText = '';
    if (ratio === 0) {
      statusText = 'Aucun matériau';
    } else if (ratio < 20) {
      statusText = 'Ratio trop bas';
    } else if (ratio <= 35) {
      statusText = 'Ratio idéal';
    } else if (ratio <= 50) {
      statusText = 'Ratio acceptable';
    } else {
      statusText = 'Ratio trop élevé';
    }
    status.textContent = statusText;
  },

  saveNewBatch() {
    const recipeId = this.elements.batchRecipe?.value;
    const startDate = this.elements.batchStartDate?.value;
    const location = this.elements.batchLocation?.value;
    const notes = this.elements.batchNotes?.value;
    
    if (!recipeId || !startDate) {
      this.showToast('Veuillez sélectionner une recette et une date de début', 'error');
      return;
    }
    
    if (Object.keys(this.state.currentBatchMaterials).length === 0) {
      this.showToast('Veuillez ajouter au moins un matériau', 'error');
      return;
    }
    
    const recipe = this.storage.getCompostRecipeById(recipeId);
    
    // Calculate C:N ratio
    const cnRatio = this.storage.calculateCNRatio(this.state.currentBatchMaterials);
    
    const newBatch = {
      id: `CH-${Date.now()}`,
      recipe_id: recipeId,
      start_date: startDate,
      end_date: null,
      quantity_produced_kg: 0,
      materials_used: { ...this.state.currentBatchMaterials },
      c_n_ratio_achieved: Math.round(cnRatio * 10) / 10,
      status: 'En cours',
      notes: location ? `Emplacement: ${location}. ${notes || ''}` : notes || '',
      created_at: new Date().toISOString()
    };
    
    this.storage.addCompostHistory(newBatch);
    
    this.showToast(`Nouveau tas de compost créé: ${recipe?.name || 'Inconnu'}`, 'success');
    this.closeNewBatchModal();
    this.render();
  },

  // ============================================================
  // COMPOST HISTORY TABLE
  // ============================================================

  renderCompostHistory() {
    const container = this.elements.compostHistoryTableBody;
    if (!container) return;
    
    let history = this.storage.getCompostHistory();
    
    // Apply search filter
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      history = history.filter(h => {
        const recipe = this.storage.getCompostRecipeById(h.recipe_id);
        return (
          h.id.toLowerCase().includes(query) ||
          (recipe?.name || '').toLowerCase().includes(query) ||
          (h.notes || '').toLowerCase().includes(query)
        );
      });
    }
    
    // Apply status filter
    if (this.state.filterStatus !== 'all') {
      history = history.filter(h => h.status === this.state.filterStatus);
    }
    
    if (history.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="8" class="py-8 text-center text-slate-400 dark:text-[#819888]">
            <i data-lucide="history" class="h-8 w-8 mx-auto mb-2 opacity-50"></i>
            <p class="text-sm">Aucun historique trouvé</p>
          </td>
        </tr>
      `;
      return;
    }
    
    container.innerHTML = history.map(batch => {
      const recipe = this.storage.getCompostRecipeById(batch.recipe_id);
      const recipeName = recipe?.name || 'Recette supprimée';
      
      return `
        <tr class="border-b border-slate-200 dark:border-[#143E23]/40 hover:bg-slate-50 dark:hover:bg-[#0D2615]/30 transition-colors">
          <td class="py-4 px-4 font-mono text-sm text-slate-600 dark:text-slate-300">${batch.id}</td>
          <td class="py-4 px-4">
            <div>
              <p class="font-bold text-slate-800 dark:text-white">${recipeName}</p>
              <p class="text-[10px] text-slate-500 dark:text-[#819888]">${recipe?.description?.substring(0, 40) || ''}...</p>
            </div>
          </td>
          <td class="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-200">${this.formatDate(batch.start_date)}</td>
          <td class="py-4 px-4 text-center">
            <span class="font-bold text-sm ${batch.end_date ? 'text-emerald-500' : 'text-blue-500'}">
              ${batch.end_date ? this.formatDate(batch.end_date) : 'En cours'}
            </span>
          </td>
          <td class="py-4 px-4 text-center font-mono text-purple-500">${batch.c_n_ratio_achieved || '--'}:1</td>
          <td class="py-4 px-4 text-center font-bold text-emerald-500">${batch.quantity_produced_kg || 0} kg</td>
          <td class="py-4 px-4 text-center">
            <span class="px-2 py-0.5 bg-${batch.status === 'Terminé' ? 'emerald' : 'blue'}-500/10 text-${batch.status === 'Terminé' ? 'emerald' : 'blue'}-500 font-extrabold text-[9px] rounded-full">
              ${batch.status}
            </span>
          </td>
          <td class="py-4 px-4">
            <div class="flex items-center justify-center gap-2">
              <button onclick="window.showBatchDetail('${batch.id}')" class="p-2 hover:bg-slate-200 dark:hover:bg-[#143E23] rounded-lg transition-colors cursor-pointer">
                <i data-lucide="eye" class="h-4 w-4 text-slate-500 dark:text-slate-400"></i>
              </button>
              ${batch.status === 'En cours' ? `
                <button onclick="window.editBatch('${batch.id}')" class="p-2 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer">
                  <i data-lucide="edit-2" class="h-4 w-4 text-amber-500"></i>
                </button>
                <button onclick="window.openDeleteBatchModal('${batch.id}')" class="p-2 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">
                  <i data-lucide="trash-2" class="h-4 w-4 text-rose-500"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterCompostHistory() {
    this.state.searchQuery = this.elements.compostHistorySearch?.value || '';
    this.renderCompostHistory();
  },

  // ============================================================
  // RECIPE MANAGEMENT
  // ============================================================

  openRecipeModal() {
    this.elements.recipeManagerModal?.classList.remove('hidden');
    this.renderRecipesList();
    this.hideRecipeForm();
  },

  closeRecipeModal() {
    this.elements.recipeManagerModal?.classList.add('hidden');
    this.state.selectedRecipeForEdit = null;
  },

  renderRecipesList() {
    const container = this.elements.recipesList;
    if (!container) return;
    
    const recipes = this.storage.getCompostRecipes();
    
    container.innerHTML = recipes.map(recipe => `
      <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40 cursor-pointer hover:border-amber-500/30 transition-all" onclick="window.showRecipeDetails('${recipe.id}')">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-bold text-slate-800 dark:text-white">${recipe.name}</p>
            <p class="text-[10px] text-slate-500 dark:text-[#819888] mt-0.5">Ratio: ${recipe.target_c_n_ratio}:1 | ${recipe.maturation_days} jours</p>
          </div>
          <span class="px-2 py-0.5 bg-amber-500/10 text-amber-500 font-extrabold text-[9px] rounded-lg">RECETTE</span>
        </div>
      </div>
    `).join('');
  },

  showRecipeDetails(recipeId) {
    const recipe = this.storage.getCompostRecipeById(recipeId);
    if (!recipe) return;
    
    const container = this.elements.recipeDetails;
    if (!container) return;
    
    const ingredients = this.storage.getIngredientsByRecipe(recipeId);
    const materials = this.storage.getCompostMaterials();
    
    container.innerHTML = `
      <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4">Détails de la Recette</h4>
      <div class="space-y-4">
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nom</p>
          <p class="font-bold text-slate-800 dark:text-white">${recipe.name}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description</p>
          <p class="text-sm text-slate-600 dark:text-slate-300">${recipe.description}</p>
        </div>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Ratio C:N Cible</p>
            <p class="font-bold text-purple-500">${recipe.target_c_n_ratio}:1</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Humidité Idéale</p>
            <p class="font-bold text-cyan-500">${recipe.ideal_moisture}%</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Maturation</p>
            <p class="font-bold text-amber-500">${recipe.maturation_days} jours</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Temp. Min</p>
            <p class="font-bold text-rose-500">${recipe.ideal_temperature_min}°C</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Temp. Max</p>
            <p class="font-bold text-rose-500">${recipe.ideal_temperature_max}°C</p>
          </div>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Ingrédients (${ingredients.length})</p>
          <div class="space-y-2">
            ${ingredients.map(ing => {
              const material = materials.find(m => m.id === ing.material_id);
              return material ? `
                <div class="flex items-center justify-between p-2 bg-white dark:bg-[#061109]/40 rounded-lg">
                  <div>
                    <p class="font-bold text-slate-800 dark:text-white">${material.name}</p>
                    <p class="text-[10px] text-slate-500 dark:text-[#819888]">${material.material_type}</p>
                  </div>
                  <span class="font-bold text-amber-500">${ing.quantity} ${ing.unit} (${ing.proportion_percent}%)</span>
                </div>
              ` : '';
            }).join('')}
          </div>
        </div>
        ${recipe.notes ? `
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Notes</p>
          <p class="text-sm text-slate-600 dark:text-slate-300">${recipe.notes}</p>
        </div>
        ` : ''}
        <div class="flex gap-2 pt-2">
          <button onclick="window.editRecipe('${recipe.id}')" class="flex-1 px-4 py-2 bg-amber-500/10 dark:bg-amber-950/20 hover:bg-amber-500/20 text-amber-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1">
            <i data-lucide="edit-2" class="h-3 w-3"></i>
            Modifier
          </button>
          <button onclick="window.deleteRecipe('${recipe.id}')" class="flex-1 px-4 py-2 bg-rose-500/10 dark:bg-rose-950/20 hover:bg-rose-500/20 text-rose-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1">
            <i data-lucide="trash-2" class="h-3 w-3"></i>
            Supprimer
          </button>
        </div>
      </div>
    `;
  },

  showAddRecipeForm() {
    this.elements.addRecipeForm?.classList.remove('hidden');
    this.elements.recipesList?.classList.add('hidden');
    
    // Reset form
    document.getElementById('recipe-id').value = '';
    document.getElementById('recipe-name').value = '';
    document.getElementById('recipe-target-ratio').value = '30';
    document.getElementById('recipe-moisture').value = '60';
    document.getElementById('recipe-temp-min').value = '40';
    document.getElementById('recipe-temp-max').value = '60';
    document.getElementById('recipe-days').value = '90';
    document.getElementById('recipe-description').value = '';
    document.getElementById('recipe-notes').value = '';
    
    this.state.selectedRecipeForEdit = null;
  },

  hideRecipeForm() {
    this.elements.addRecipeForm?.classList.add('hidden');
    this.elements.recipesList?.classList.remove('hidden');
  },

  editRecipe(recipeId) {
    const recipe = this.storage.getCompostRecipeById(recipeId);
    if (!recipe) return;
    
    this.showAddRecipeForm();
    
    document.getElementById('recipe-id').value = recipe.id;
    document.getElementById('recipe-name').value = recipe.name;
    document.getElementById('recipe-target-ratio').value = recipe.target_c_n_ratio;
    document.getElementById('recipe-moisture').value = recipe.ideal_moisture;
    document.getElementById('recipe-temp-min').value = recipe.ideal_temperature_min;
    document.getElementById('recipe-temp-max').value = recipe.ideal_temperature_max;
    document.getElementById('recipe-days').value = recipe.maturation_days;
    document.getElementById('recipe-description').value = recipe.description || '';
    document.getElementById('recipe-notes').value = recipe.notes || '';
    
    this.state.selectedRecipeForEdit = recipeId;
  },

  saveRecipe(event) {
    event.preventDefault();
    
    const id = document.getElementById('recipe-id').value;
    const name = document.getElementById('recipe-name').value;
    const targetRatio = parseFloat(document.getElementById('recipe-target-ratio').value) || 30;
    const moisture = parseInt(document.getElementById('recipe-moisture').value) || 60;
    const tempMin = parseInt(document.getElementById('recipe-temp-min').value) || 40;
    const tempMax = parseInt(document.getElementById('recipe-temp-max').value) || 60;
    const days = parseInt(document.getElementById('recipe-days').value) || 90;
    const description = document.getElementById('recipe-description').value;
    const notes = document.getElementById('recipe-notes').value;
    
    if (!name) {
      this.showToast('Le nom de la recette est obligatoire', 'error');
      return;
    }
    
    const recipe = {
      id: id || `CR-${Date.now()}`,
      name,
      description,
      target_c_n_ratio: targetRatio,
      ideal_moisture: moisture,
      ideal_temperature_min: tempMin,
      ideal_temperature_max: tempMax,
      maturation_days: days,
      notes
    };
    
    if (id) {
      this.storage.updateCompostRecipe(id, recipe);
      this.showToast(`Recette ${name} mise à jour`, 'success');
    } else {
      this.storage.addCompostRecipe(recipe);
      this.showToast(`Nouvelle recette: ${name}`, 'success');
    }
    
    this.hideRecipeForm();
    this.renderRecipesList();
    this.loadRecipeSelectOptions();
  },

  deleteRecipe(recipeId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette recette?')) return;
    
    this.storage.deleteCompostRecipe(recipeId);
    this.showToast('Recette supprimée', 'success');
    this.renderRecipesList();
    this.loadRecipeSelectOptions();
  },

  cancelRecipeForm() {
    this.hideRecipeForm();
  },

  // ============================================================
  // MATERIAL MANAGEMENT
  // ============================================================

  openMaterialModal() {
    this.elements.materialManagerModal?.classList.remove('hidden');
    this.renderMaterialsList();
    this.hideMaterialForm();
  },

  closeMaterialModal() {
    this.elements.materialManagerModal?.classList.add('hidden');
    this.state.selectedMaterialForEdit = null;
  },

  renderMaterialsList() {
    const container = this.elements.materialsList;
    if (!container) return;
    
    const materials = this.storage.getCompostMaterials();
    
    container.innerHTML = materials.map(material => `
      <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/40 cursor-pointer hover:border-cyan-500/30 transition-all" onclick="window.showMaterialDetails('${material.id}')">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-bold text-slate-800 dark:text-white">${material.name}</p>
            <p class="text-[10px] text-slate-500 dark:text-[#819888] mt-0.5">C:N: ${material.c_n_ratio}:1 | ${material.material_type}</p>
          </div>
          <span class="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 font-extrabold text-[9px] rounded-lg">MATÉRIAU</span>
        </div>
      </div>
    `).join('');
  },

  showMaterialDetails(materialId) {
    const material = this.storage.getCompostMaterialById(materialId);
    if (!material) return;
    
    const container = this.elements.materialDetails;
    if (!container) return;
    
    container.innerHTML = `
      <h4 class="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4">Détails du Matériau</h4>
      <div class="space-y-4">
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nom</p>
          <p class="font-bold text-slate-800 dark:text-white">${material.name}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Type</p>
          <span class="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 font-extrabold text-xs rounded">${material.material_type}</span>
        </div>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Ratio Carbone (%)</p>
            <p class="font-bold text-emerald-500">${material.carbon_ratio}%</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Ratio Azote (%)</p>
            <p class="font-bold text-amber-500">${material.nitrogen_ratio}%</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Ratio C:N</p>
            <p class="font-bold text-purple-500">${material.c_n_ratio}:1</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Humidité</p>
            <p class="font-bold text-cyan-500">${material.moisture_content}%</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Unité</p>
            <p class="font-bold">${material.unit}</p>
          </div>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description</p>
          <p class="text-sm text-slate-600 dark:text-slate-300">${material.description}</p>
        </div>
        ${material.notes ? `
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Notes</p>
          <p class="text-sm text-slate-600 dark:text-slate-300">${material.notes}</p>
        </div>
        ` : ''}
        <div class="flex items-center gap-4 pt-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" ${material.is_common_in_senegal ? 'checked' : ''} disabled class="w-4 h-4 rounded border-slate-300 text-cyan-500">
            <span class="text-sm font-bold text-slate-600 dark:text-slate-300">Commun au Sénégal</span>
          </label>
        </div>
        <div class="flex gap-2 pt-2">
          <button onclick="window.editMaterial('${material.id}')" class="flex-1 px-4 py-2 bg-cyan-500/10 dark:bg-cyan-950/20 hover:bg-cyan-500/20 text-cyan-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1">
            <i data-lucide="edit-2" class="h-3 w-3"></i>
            Modifier
          </button>
          <button onclick="window.deleteMaterial('${material.id}')" class="flex-1 px-4 py-2 bg-rose-500/10 dark:bg-rose-950/20 hover:bg-rose-500/20 text-rose-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1">
            <i data-lucide="trash-2" class="h-3 w-3"></i>
            Supprimer
          </button>
        </div>
      </div>
    `;
  },

  showAddMaterialForm() {
    this.elements.addMaterialForm?.classList.remove('hidden');
    this.elements.materialsList?.classList.add('hidden');
    
    // Reset form
    document.getElementById('material-id').value = '';
    document.getElementById('material-name').value = '';
    document.getElementById('material-type').value = '';
    document.getElementById('material-carbon').value = '25';
    document.getElementById('material-nitrogen').value = '1.5';
    document.getElementById('material-cn-ratio').value = '16.7';
    document.getElementById('material-moisture').value = '60';
    document.getElementById('material-unit').value = 'kg';
    document.getElementById('material-description').value = '';
    document.getElementById('material-notes').value = '';
    document.getElementById('material-common').checked = true;
    
    this.state.selectedMaterialForEdit = null;
  },

  hideMaterialForm() {
    this.elements.addMaterialForm?.classList.add('hidden');
    this.elements.materialsList?.classList.remove('hidden');
  },

  editMaterial(materialId) {
    const material = this.storage.getCompostMaterialById(materialId);
    if (!material) return;
    
    this.showAddMaterialForm();
    
    document.getElementById('material-id').value = material.id;
    document.getElementById('material-name').value = material.name;
    document.getElementById('material-type').value = material.material_type;
    document.getElementById('material-carbon').value = material.carbon_ratio;
    document.getElementById('material-nitrogen').value = material.nitrogen_ratio;
    document.getElementById('material-cn-ratio').value = material.c_n_ratio;
    document.getElementById('material-moisture').value = material.moisture_content;
    document.getElementById('material-unit').value = material.unit;
    document.getElementById('material-description').value = material.description || '';
    document.getElementById('material-notes').value = material.notes || '';
    document.getElementById('material-common').checked = material.is_common_in_senegal || false;
    
    this.state.selectedMaterialForEdit = materialId;
  },

  saveMaterial(event) {
    event.preventDefault();
    
    const id = document.getElementById('material-id').value;
    const name = document.getElementById('material-name').value;
    const type = document.getElementById('material-type').value;
    const carbon = parseFloat(document.getElementById('material-carbon').value) || 0;
    const nitrogen = parseFloat(document.getElementById('material-nitrogen').value) || 0;
    const cnRatio = parseFloat(document.getElementById('material-cn-ratio').value) || (carbon / nitrogen) || 0;
    const moisture = parseInt(document.getElementById('material-moisture').value) || 0;
    const unit = document.getElementById('material-unit').value;
    const description = document.getElementById('material-description').value;
    const notes = document.getElementById('material-notes').value;
    const isCommon = document.getElementById('material-common').checked;
    
    if (!name || !type) {
      this.showToast('Le nom et le type sont obligatoires', 'error');
      return;
    }
    
    const material = {
      id: id || `CM-${Date.now()}`,
      name,
      material_type: type,
      carbon_ratio: carbon,
      nitrogen_ratio: nitrogen,
      c_n_ratio: Math.round(cnRatio * 10) / 10,
      moisture_content: moisture,
      unit,
      description,
      is_common_in_senegal: isCommon,
      notes
    };
    
    if (id) {
      this.storage.updateCompostMaterial(id, material);
      this.showToast(`Matériau ${name} mis à jour`, 'success');
    } else {
      this.storage.addCompostMaterial(material);
      this.showToast(`Nouveau matériau: ${name}`, 'success');
    }
    
    this.hideMaterialForm();
    this.renderMaterialsList();
    this.loadMaterialSelectOptions();
  },

  deleteMaterial(materialId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce matériau?')) return;
    
    this.storage.deleteCompostMaterial(materialId);
    this.showToast('Matériau supprimé', 'success');
    this.renderMaterialsList();
    this.loadMaterialSelectOptions();
  },

  cancelMaterialForm() {
    this.hideMaterialForm();
  },

  // ============================================================
  // MATERIALS INVENTORY
  // ============================================================

  renderMaterialsInventory() {
    const container = this.elements.materialsGrid;
    if (!container) return;
    
    const materials = this.storage.getCompostMaterials();
    
    container.innerHTML = materials.map(material => {
      const typeColor = this.getMaterialTypeColor(material.material_type);
      return `
        <div class="p-3 bg-white dark:bg-[#061109]/40 rounded-2xl border border-slate-200 dark:border-[#143E23]/40 ${typeColor} cursor-pointer hover:scale-105 transition-all" onclick="window.showMaterialDetails('${material.id}')">
          <div class="flex items-center gap-2">
            <i data-lucide="layers" class="h-4 w-4 text-cyan-500"></i>
            <div>
              <p class="font-bold text-slate-800 dark:text-white truncate">${material.name}</p>
              <p class="text-[10px] text-slate-500 dark:text-[#819888]">C:N: ${material.c_n_ratio}:1</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  getMaterialTypeColor(type) {
    const colors = {
      'Fumier': 'material-brown',
      'Résidus végétaux': 'material-green',
      'Résidus verts': 'material-green',
      'Déchets de cuisine': 'material-manure',
      'Sous-produit agricole': 'material-manure',
      'Minéral': 'material-mineral'
    };
    return colors[type] || '';
  },

  // ============================================================
  // TEMPERATURE MONITORING
  // ============================================================

  updateTemperatureDisplay() {
    const display = this.elements.currentTempDisplay;
    const status = this.elements.tempStatus;
    
    if (!display || !status) return;
    
    // Simulate temperature (in real app, this would come from sensors)
    const simulatedTemp = Math.floor(Math.random() * 40) + 25;
    this.state.currentTemperature = simulatedTemp;
    
    display.textContent = `${simulatedTemp}°C`;
    
    let statusText = '';
    if (simulatedTemp < 40) {
      statusText = 'Température basse - Réaction lente';
    } else if (simulatedTemp >= 40 && simulatedTemp <= 60) {
      statusText = 'Température optimale';
    } else {
      statusText = 'Température élevée - À surveiller';
    }
    status.textContent = statusText;
  },

  // ============================================================
  // DELETE MODALS
  // ============================================================

  openDeleteBatchModal(batchId) {
    this.state.selectedBatchForDelete = batchId;
    this.elements.deleteBatchConfirmModal?.classList.remove('hidden');
    this.elements.deleteBatchConfirmMessage.textContent = `Êtes-vous sûr de vouloir supprimer ce tas de compost? Cette action est irréversible.`;
  },

  closeDeleteBatchModal() {
    this.elements.deleteBatchConfirmModal?.classList.add('hidden');
    this.state.selectedBatchForDelete = null;
  },

  confirmDeleteBatch() {
    if (!this.state.selectedBatchForDelete) return;
    
    this.storage.deleteCompostHistory(this.state.selectedBatchForDelete);
    this.closeDeleteBatchModal();
    this.showToast('Tas de compost supprimé', 'success');
    this.render();
  },

  // ============================================================
  // BATCH DETAIL MODAL
  // ============================================================

  openBatchDetailModal() {
    this.elements.batchDetailModal?.classList.remove('hidden');
  },

  closeBatchDetailModal() {
    this.elements.batchDetailModal?.classList.add('hidden');
  },

  // ============================================================
  // MODAL MANAGEMENT
  // ============================================================

  openNewBatchModal() {
    this.elements.newBatchModal?.classList.remove('hidden');
    this.state.currentBatchMaterials = {};
    this.renderBatchMaterialsSelector();
    this.updateBatchCNRatio();
  },

  closeNewBatchModal() {
    this.elements.newBatchModal?.classList.add('hidden');
    this.state.currentBatchMaterials = {};
    this.state.editingBatchId = null;
  },

  openRecipeModal() {
    this.elements.recipeManagerModal?.classList.remove('hidden');
    this.renderRecipesList();
    this.hideRecipeForm();
  },

  closeRecipeModal() {
    this.elements.recipeManagerModal?.classList.add('hidden');
  },

  openMaterialModal() {
    this.elements.materialManagerModal?.classList.remove('hidden');
    this.renderMaterialsList();
    this.hideMaterialForm();
  },

  closeMaterialModal() {
    this.elements.materialManagerModal?.classList.add('hidden');
  },

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  formatDate(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  },

  calculateDaysSince(dateString) {
    if (!dateString) return 0;
    const startDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  calculateDaysBetween(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    
    // Remove after duration
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out-0', 'slide-out-to-bottom-4', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  refreshCompostData() {
    this.render();
    this.showToast('Données actualisées', 'success');
  },

  // ============================================================
  // SETUP LISTENERS
  // ============================================================

  setupListeners() {
    // Material select change - auto-update CN ratio preview
    if (this.elements.materialSelect) {
      this.elements.materialSelect.addEventListener('change', (e) => {
        const option = e.target.options[e.target.selectedIndex];
        if (option && option.dataset.cnRatio) {
          // Could show preview here
        }
      });
    }
    
    // Quantity input - update on enter
    if (this.elements.materialQuantity) {
      this.elements.materialQuantity.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addMaterialToCalculator();
        }
      });
    }
    
    // Search input
    if (this.elements.compostHistorySearch) {
      this.elements.compostHistorySearch.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        this.renderCompostHistory();
      });
    }
    
    // Temperature simulation (update every minute)
    setInterval(() => this.updateTemperatureDisplay(), 60000);
    
    // Expose methods to window
    window.addMaterialToCalculator = () => this.addMaterialToCalculator();
    window.removeCalculatorMaterial = (id) => this.removeCalculatorMaterial(id);
    window.clearCalculator = () => this.clearCalculator();
    window.calculateIdealMix = () => this.calculateIdealMix();
    window.startQuickRecipe = (id) => this.startQuickRecipe(id);
    
    window.addMaterialToBatch = () => this.addMaterialToBatch();
    window.removeBatchMaterial = (id) => this.removeBatchMaterial(id);
    window.saveNewBatch = () => this.saveNewBatch();
    
    window.showBatchDetail = (id) => this.showBatchDetail(id);
    window.editBatch = (id) => this.editBatch(id);
    window.markBatchCompleted = (id) => this.markBatchCompleted(id);
    
    window.openNewBatchModal = () => this.openNewBatchModal();
    window.closeNewBatchModal = () => this.closeNewBatchModal();
    
    window.openRecipeModal = () => this.openRecipeModal();
    window.closeRecipeModal = () => this.closeRecipeModal();
    window.showAddRecipeForm = () => this.showAddRecipeForm();
    window.showRecipeDetails = (id) => this.showRecipeDetails(id);
    window.editRecipe = (id) => this.editRecipe(id);
    window.saveRecipe = (e) => this.saveRecipe(e);
    window.deleteRecipe = (id) => this.deleteRecipe(id);
    window.cancelRecipeForm = () => this.cancelRecipeForm();
    
    window.openMaterialModal = () => this.openMaterialModal();
    window.closeMaterialModal = () => this.closeMaterialModal();
    window.showAddMaterialForm = () => this.showAddMaterialForm();
    window.showMaterialDetails = (id) => this.showMaterialDetails(id);
    window.editMaterial = (id) => this.editMaterial(id);
    window.saveMaterial = (e) => this.saveMaterial(e);
    window.deleteMaterial = (id) => this.deleteMaterial(id);
    window.cancelMaterialForm = () => this.cancelMaterialForm();
    
    window.filterCompostHistory = () => this.filterCompostHistory();
    
    window.openDeleteBatchModal = (id) => this.openDeleteBatchModal(id);
    window.closeDeleteBatchModal = () => this.closeDeleteBatchModal();
    window.confirmDeleteBatch = () => this.confirmDeleteBatch();
    
    window.closeBatchDetailModal = () => this.closeBatchDetailModal();
    
    window.refreshCompostData = () => this.refreshCompostData();
  }
};

// Export to window for global access
export default CompostModule;
window.CompostModule = CompostModule;

// Auto-initialize if page is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => CompostModule.init(), 100);
} else {
  document.addEventListener('DOMContentLoaded', () => CompostModule.init());
}
