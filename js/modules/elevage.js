// KA Farm - Élevage and Livestock Management Module
import { KAStorage } from '../storage.js';

export const ElevageModule = {
  currentTab: 'cheptel',

  init() {
    this.setupListeners();
    this.switchTab(this.currentTab);
    this.populateHealthTargets();
  },

  setupListeners() {
    // Tab switching
    window.switchElevageTab = (tabId) => {
      this.switchTab(tabId);
    };

    // Search and filters
    const cheptelSearch = document.getElementById('cheptel-search');
    if (cheptelSearch) {
      cheptelSearch.addEventListener('input', () => {
        this.renderCheptel();
      });
    }

    // Modal close when clicking outside
    const modals = ['add-cheptel-modal', 'add-production-modal', 'add-health-modal'];
    modals.forEach(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.add('hidden');
          }
        });
      }
    });

    // Form Submissions
    const cheptelForm = document.getElementById('cheptel-form');
    if (cheptelForm) {
      cheptelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCheptelSubmit();
      });
    }

    const consumptionForm = document.getElementById('feed-consumption-form');
    if (consumptionForm) {
      consumptionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleConsumptionSubmit();
      });
    }

    const productionForm = document.getElementById('production-form');
    if (productionForm) {
      productionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProductionSubmit();
      });
    }

    const healthForm = document.getElementById('health-form');
    if (healthForm) {
      healthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleHealthSubmit();
      });
    }

    // Dynamic unit changes based on production type
    const prodType = document.getElementById('prod-type');
    const prodUnit = document.getElementById('prod-unit');
    if (prodType && prodUnit) {
      prodType.addEventListener('change', () => {
        prodUnit.value = prodType.value === 'Lait' ? 'L' : 'unités';
      });
    }

    // Global triggers
    window.deleteCheptelGroup = (id) => this.deleteCheptel(id);
    window.editCheptelGroup = (id) => this.openEditCheptel(id);
    window.deleteProductionLog = (id) => this.deleteProduction(id);
    window.deleteHealthLog = (id) => this.deleteHealth(id);
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Toggle tab styles
    const tabs = ['cheptel', 'alimentation', 'production', 'health'];
    tabs.forEach(t => {
      const link = document.getElementById(`tab-link-${t}`);
      const content = document.getElementById(`tab-content-${t}`);
      
      if (t === tabId) {
        link?.classList.add('border-emerald-500', 'text-emerald-500');
        link?.classList.remove('border-transparent', 'text-slate-450', 'dark:text-slate-400');
        content?.classList.remove('hidden');
      } else {
        link?.classList.remove('border-emerald-500', 'text-emerald-500');
        link?.classList.add('border-transparent', 'text-slate-450', 'dark:text-slate-400');
        content?.classList.add('hidden');
      }
    });

    // Toggle header actions
    const addCheptelBtn = document.getElementById('add-cheptel-btn');
    const addProductionBtn = document.getElementById('add-production-btn');
    const addHealthBtn = document.getElementById('add-health-btn');

    addCheptelBtn?.classList.add('hidden');
    addProductionBtn?.classList.add('hidden');
    addHealthBtn?.classList.add('hidden');

    if (tabId === 'cheptel') {
      addCheptelBtn?.classList.remove('hidden');
    } else if (tabId === 'production') {
      addProductionBtn?.classList.remove('hidden');
    } else if (tabId === 'health') {
      addHealthBtn?.classList.remove('hidden');
    }

    // Fetch and render data
    this.renderCurrentTab();
  },

  renderCurrentTab() {
    if (this.currentTab === 'cheptel') {
      this.renderCheptel();
    } else if (this.currentTab === 'alimentation') {
      this.renderAlimentation();
    } else if (this.currentTab === 'production') {
      this.renderProduction();
    } else if (this.currentTab === 'health') {
      this.renderHealth();
    }

    // Replace icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  populateHealthTargets() {
    const healthTarget = document.getElementById('health-target');
    if (!healthTarget) return;

    const cheptel = KAStorage.getCheptel();
    healthTarget.innerHTML = cheptel.map(c => `
      <option value="${c.name}">${c.name} (${c.type})</option>
    `).join('') || '<option value="Global">Tout le cheptel</option>';
  },

  // --- TAB 1: CHEPTEL LOGIC ---
  renderCheptel() {
    const container = document.getElementById('cheptel-container');
    if (!container) return;

    const cheptel = KAStorage.getCheptel();
    const query = document.getElementById('cheptel-search')?.value.toLowerCase() || '';

    const filtered = cheptel.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.type.toLowerCase().includes(query) || 
      c.breed.toLowerCase().includes(query) || 
      c.purpose.toLowerCase().includes(query)
    );

    // Calculate Stats
    let totalQty = 0;
    filtered.forEach(c => totalQty += parseInt(c.quantity) || 0);

    const activeGroupsCount = filtered.length;
    const alertGroupsCount = filtered.filter(c => c.status === 'Malade' || c.status === 'Quarantaine').length;
    const healthyPercent = activeGroupsCount > 0 ? Math.round(((activeGroupsCount - alertGroupsCount) / activeGroupsCount) * 100) : 100;

    // Render Stats to DOM
    const totalCountDom = document.getElementById('cheptel-total-count');
    if (totalCountDom) totalCountDom.textContent = totalQty.toLocaleString('fr-FR') + ' têtes';

    const healthDom = document.getElementById('cheptel-health-status');
    if (healthDom) {
      healthDom.textContent = healthyPercent + '%';
      if (healthyPercent < 80) {
        healthDom.className = 'text-2xl font-black text-rose-500 mt-1 font-mono';
      } else if (healthyPercent < 95) {
        healthDom.className = 'text-2xl font-black text-amber-500 mt-1 font-mono';
      } else {
        healthDom.className = 'text-2xl font-black text-emerald-400 mt-1 font-mono';
      }
    }

    const groupsDom = document.getElementById('cheptel-groups-count');
    if (groupsDom) groupsDom.textContent = activeGroupsCount;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-450 dark:text-slate-500 space-y-3">
          <i data-lucide="paw-print" class="h-10 w-10 mx-auto opacity-30 text-amber-500"></i>
          <p class="text-xs font-bold">Aucun groupe d'élevage trouvé.</p>
          <p class="text-[10px]">Utilisez le bouton en haut à droite pour ajouter vos premiers bovins, moutons ou volailles.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(c => {
      let icon = 'cow';
      if (c.type === 'Bovins') icon = 'beef';
      else if (c.type === 'Ovins' || c.type === 'Caprins') icon = 'sheep';
      else if (c.type === 'Volailles') icon = 'egg';
      else icon = 'paw-print';

      let statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      let statusIcon = '🟢';
      if (c.status === 'Surveiller') {
        statusBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        statusIcon = '🟡';
      } else if (c.status === 'Sous traitement') {
        statusBadgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        statusIcon = '🟠';
      } else if (c.status === 'Malade' || c.status === 'Quarantaine') {
        statusBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        statusIcon = '🔴';
      }

      return `
        <div class="p-6 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl text-left space-y-4 hover:border-emerald-500/30 transition-all shadow-sm">
          <div class="flex justify-between items-start gap-3">
            <div class="flex items-center gap-3">
              <div class="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <i data-lucide="${icon}" class="h-5 w-5"></i>
              </div>
              <div>
                <h4 class="text-xs font-black text-slate-850 dark:text-white leading-tight">${c.name}</h4>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">${c.breed || 'Race non définie'}</p>
              </div>
            </div>
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadgeColor}">
              ${statusIcon} ${c.status}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 bg-[#051009]/30 dark:bg-[#051009]/60 border border-[#143E23]/20 p-3 rounded-2xl text-[11px]">
            <div>
              <p class="text-slate-450 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider">Effectif</p>
              <p class="font-bold text-white font-mono text-xs mt-0.5">${c.quantity} ${c.unit}</p>
            </div>
            <div>
              <p class="text-slate-450 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider">Vocation</p>
              <p class="font-bold text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
                ${c.purpose === 'Lait' ? '🥛 Lait' : c.purpose === 'Viande' ? '🥩 Viande' : c.purpose === 'Reproduction' ? '🧬 Reproduction' : '🥚 Œufs'}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-[#143E23]/20">
            <button onclick="window.editCheptelGroup('${c.id}')" class="p-1.5 hover:bg-[#0D2615] text-emerald-500 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer" title="Modifier le groupe">
              <i data-lucide="pencil" class="h-4 w-4"></i>
            </button>
            <button onclick="window.deleteCheptelGroup('${c.id}')" class="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors cursor-pointer" title="Supprimer le groupe">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openEditCheptel(id) {
    const cheptel = KAStorage.getCheptel();
    const group = cheptel.find(c => c.id === id);
    if (!group) return;

    document.getElementById('cheptel-edit-id').value = group.id;
    document.getElementById('cheptel-name').value = group.name;
    document.getElementById('cheptel-type').value = group.type;
    document.getElementById('cheptel-breed').value = group.breed;
    document.getElementById('cheptel-qty').value = group.quantity;
    document.getElementById('cheptel-unit').value = group.unit;
    document.getElementById('cheptel-status').value = group.status;
    document.getElementById('cheptel-purpose').value = group.purpose;

    document.getElementById('add-cheptel-modal').classList.remove('hidden');
  },

  handleCheptelSubmit() {
    const id = document.getElementById('cheptel-edit-id').value;
    const name = document.getElementById('cheptel-name').value;
    const type = document.getElementById('cheptel-type').value;
    const breed = document.getElementById('cheptel-breed').value;
    const quantity = parseInt(document.getElementById('cheptel-qty').value);
    const unit = document.getElementById('cheptel-unit').value;
    const status = document.getElementById('cheptel-status').value;
    const purpose = document.getElementById('cheptel-purpose').value;

    let cheptel = KAStorage.getCheptel();

    if (id) {
      // Edit
      cheptel = cheptel.map(c => c.id === id ? { ...c, name, type, breed, quantity, unit, status, purpose } : c);
    } else {
      // Add
      const newGroup = {
        id: 'CH-' + Date.now().toString().slice(-4),
        name, type, breed, quantity, unit, status, purpose
      };
      cheptel.push(newGroup);
    }

    KAStorage.saveCheptel(cheptel);
    this.populateHealthTargets();
    
    // Close & reset
    document.getElementById('add-cheptel-modal').classList.add('hidden');
    document.getElementById('cheptel-form').reset();
    document.getElementById('cheptel-edit-id').value = '';

    this.renderCheptel();
    
    // Refresh sidebar badges if applicable
    if (window.App && window.App.updateBadges) {
      window.App.updateBadges();
    }
  },

  deleteCheptel(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe d\'élevage du registre de la ferme ?')) return;

    let cheptel = KAStorage.getCheptel();
    cheptel = cheptel.filter(c => c.id !== id);
    KAStorage.saveCheptel(cheptel);
    this.populateHealthTargets();
    this.renderCheptel();

    if (window.App && window.App.updateBadges) {
      window.App.updateBadges();
    }
  },


  // --- TAB 2: ALIMENTATION & CONCENTRÉS ---
  renderAlimentation() {
    const feedsContainer = document.getElementById('feeds-container');
    const selectFeed = document.getElementById('consume-feed-id');
    const banner = document.getElementById('feed-alert-banner');
    
    if (!feedsContainer) return;

    const stocks = KAStorage.getStocks();
    const feeds = stocks.filter(s => s.category === 'Alimentation');

    // Check low stock count specifically for feeds
    const lowFeeds = feeds.filter(f => f.quantity <= (f.maxQuantity * 0.25));
    if (banner) {
      if (lowFeeds.length > 0) {
        banner.classList.remove('hidden');
        // Customize text based on critical item
        const textEl = banner.querySelector('#feed-alert-text') || banner.querySelector('p:nth-of-type(2)');
        if (textEl) {
          textEl.innerHTML = `L'aliment <strong>${lowFeeds[0].name}</strong> est actuellement à <strong>${lowFeeds[0].quantity} / ${lowFeeds[0].maxQuantity} ${lowFeeds[0].unit}</strong> (${Math.round((lowFeeds[0].quantity/lowFeeds[0].maxQuantity)*100)}%). Commandez au plus vite pour assurer l'alimentation quotidienne.`;
        }
      } else {
        banner.classList.add('hidden');
      }
    }

    // Populate ration distribution selector
    if (selectFeed) {
      selectFeed.innerHTML = feeds.map(f => `
        <option value="${f.id}">${f.name} (Restant: ${f.quantity} ${f.unit})</option>
      `).join('') || '<option value="">Aucun aliment disponible dans les stocks</option>';
    }

    if (feeds.length === 0) {
      feedsContainer.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-450 dark:text-slate-500 space-y-3">
          <i data-lucide="wheat" class="h-10 w-10 mx-auto opacity-30 text-amber-500"></i>
          <p class="text-xs font-bold">Aucun stock d'alimentation enregistré.</p>
          <p class="text-[10px]">Enregistrez vos réserves d'alimentation laitière/bovine dans le module "Inventaire & Stocks" sous la catégorie <strong>Alimentation (Élevage)</strong>.</p>
        </div>
      `;
      return;
    }

    feedsContainer.innerHTML = feeds.map(f => {
      const pct = f.maxQuantity > 0 ? Math.round((f.quantity / f.maxQuantity) * 100) : 0;
      
      let barColor = 'bg-emerald-500';
      let textColor = 'text-emerald-500';
      let statusText = 'Niveaux Optimaux';
      let warningTag = '';

      if (pct <= 25) {
        barColor = 'bg-rose-500 animate-pulse';
        textColor = 'text-rose-500';
        statusText = 'STOCK BAS (<25%)';
        warningTag = `<span class="text-[8px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 animate-pulse">⚠️ ALERTE BASSE</span>`;
      } else if (pct <= 50) {
        barColor = 'bg-amber-500';
        textColor = 'text-amber-500';
        statusText = 'Moyen / À Surveiller';
      }

      return `
        <div class="p-6 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl text-left space-y-4">
          <div class="flex justify-between items-start gap-2">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <i data-lucide="wheat" class="h-5 w-5"></i>
              </div>
              <div>
                <h4 class="text-xs font-black text-slate-850 dark:text-white leading-tight">${f.name}</h4>
                <p class="text-[9px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">${statusText}</p>
              </div>
            </div>
            ${warningTag}
          </div>

          <!-- Fill Gauge -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-slate-400 text-[10px]">Taux de réserve : <strong class="${textColor} font-mono">${pct}%</strong></span>
              <span class="text-slate-800 dark:text-slate-200 font-mono font-black">${f.quantity} / ${f.maxQuantity} ${f.unit}</span>
            </div>
            <div class="w-full bg-[#051009] rounded-full h-2.5 overflow-hidden border border-[#143E23]/25">
              <div class="h-full rounded-full ${barColor}" style="width: ${Math.min(pct, 100)}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  handleConsumptionSubmit() {
    const feedId = document.getElementById('consume-feed-id').value;
    const qtyToConsume = parseInt(document.getElementById('consume-feed-qty').value);
    
    if (!feedId) {
      alert('Veuillez d\'abord enregistrer un aliment dans les stocks.');
      return;
    }

    let stocks = KAStorage.getStocks();
    const stockIndex = stocks.findIndex(s => s.id === feedId);
    
    if (stockIndex === -1) return;

    const feedItem = stocks[stockIndex];
    if (feedItem.quantity < qtyToConsume) {
      alert(`Ration supérieure au stock disponible ! Restant : ${feedItem.quantity} ${feedItem.unit}. Veuillez réapprovisionner.`);
      return;
    }

    // Update quantity
    stocks[stockIndex].quantity -= qtyToConsume;
    KAStorage.saveStocks(stocks);

    // Save Finance expense or note if helpful (optional)
    alert(`Ration de ${qtyToConsume} ${feedItem.unit} de "${feedItem.name}" distribuée au troupeau avec succès.`);

    // Reset Form
    document.getElementById('feed-consumption-form').reset();
    
    this.renderAlimentation();

    if (window.App && window.App.updateBadges) {
      window.App.updateBadges();
    }
  },


  // --- TAB 3: RENDEMENTS & PRODUCTION ---
  renderProduction() {
    const tableBody = document.getElementById('production-table-body');
    const milkProdDom = document.getElementById('total-milk-prod');
    const eggProdDom = document.getElementById('total-egg-prod');

    if (!tableBody) return;

    const logs = KAStorage.getElevageProduction();
    
    // Sort descending by date
    const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate total week stats
    const totalMilk = logs.filter(l => l.type === 'Lait').reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);
    const totalEggs = logs.filter(l => l.type === 'Œufs').reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);

    if (milkProdDom) milkProdDom.textContent = totalMilk.toLocaleString('fr-FR') + ' L';
    if (eggProdDom) eggProdDom.textContent = totalEggs.toLocaleString('fr-FR') + ' unités';

    if (sorted.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-450 dark:text-slate-500 font-bold">
            Aucun relevé de production enregistré pour le moment.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = sorted.map(l => {
      return `
        <tr class="hover:bg-[#0E2F19]/20 transition-all">
          <td class="py-3 px-2 font-mono text-slate-400 font-bold">${l.date}</td>
          <td class="py-3 px-2 font-bold">${l.type === 'Lait' ? '🥛 Traite Lait' : '🥚 Collecte Œufs'}</td>
          <td class="py-3 px-2 font-black text-emerald-400 font-mono">${l.quantity} ${l.unit}</td>
          <td class="py-3 px-2 text-slate-400 text-[11px] font-semibold">${l.notes || '-'}</td>
          <td class="py-3 px-2 text-right">
            <button onclick="window.deleteProductionLog('${l.id}')" class="p-1 hover:bg-rose-500/10 text-rose-500 rounded transition-all cursor-pointer">
              <i data-lucide="trash" class="h-3.5 w-3.5"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  handleProductionSubmit() {
    const date = document.getElementById('prod-date').value;
    const type = document.getElementById('prod-type').value;
    const quantity = parseInt(document.getElementById('prod-qty').value);
    const unit = document.getElementById('prod-unit').value;
    const notes = document.getElementById('prod-notes').value;

    const newLog = {
      id: 'PROD-' + Date.now(),
      date, type, quantity, unit, notes
    };

    const logs = KAStorage.getElevageProduction();
    logs.push(newLog);
    KAStorage.saveElevageProduction(logs);

    // Also register custom Sales income under Finances if they select "Vente" or record notes indicating it
    // To make it completely seamless, we can optionally register income in the ledger if they choose.
    // For now we keep it focused on yields.

    document.getElementById('add-production-modal').classList.add('hidden');
    document.getElementById('production-form').reset();
    
    this.renderProduction();
  },

  deleteProduction(id) {
    if (!confirm('Supprimer cette fiche de production ?')) return;

    let logs = KAStorage.getElevageProduction();
    logs = logs.filter(l => l.id !== id);
    KAStorage.saveElevageProduction(logs);

    this.renderProduction();
  },


  // --- TAB 4: SUIVI SANITAIRE & TIMELINE ---
  renderHealth() {
    const timeline = document.getElementById('health-timeline');
    const countDom = document.getElementById('health-interventions-count');
    if (!timeline) return;

    const logs = KAStorage.getElevageHealth();
    const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (countDom) countDom.textContent = sorted.length + (sorted.length > 1 ? ' actes médicales' : ' acte médical');

    if (sorted.length === 0) {
      timeline.innerHTML = `
        <div class="py-12 text-center text-slate-450 dark:text-slate-500 space-y-3">
          <i data-lucide="heart-pulse" class="h-10 w-10 mx-auto opacity-30 text-emerald-500"></i>
          <p class="text-xs font-bold">Le carnet sanitaire est vide.</p>
          <p class="text-[10px]">Ajoutez les interventions vétérinaires, vaccins ou vermifuges du troupeau.</p>
        </div>
      `;
      return;
    }

    timeline.innerHTML = sorted.map(h => {
      return `
        <div class="relative pl-6 sm:pl-8 border-l-2 border-[#143E23]/60 pb-6 text-left last:pb-0">
          <!-- Timeline point dot -->
          <span class="absolute -left-[7px] top-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#061109] ring-4 ring-emerald-500/10"></span>
          
          <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-150 dark:border-[#143E23]/20 rounded-2xl space-y-3 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#143E23]/25 pb-2">
              <div class="space-y-0.5">
                <span class="text-[9px] font-mono text-emerald-400 font-black">${h.date}</span>
                <h4 class="text-xs font-black text-slate-850 dark:text-white leading-tight">${h.intervention}</h4>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-[#0D2615] px-2 py-0.5 rounded border border-[#1A4525]/30">🎯 ${h.target}</span>
                <span class="text-[9px] font-black text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 font-mono">${h.cost.toLocaleString('fr-FR')} F</span>
              </div>
            </div>

            <div class="text-[11px] space-y-1 text-slate-400 font-semibold">
              <p><strong class="text-slate-800 dark:text-slate-300">👨‍⚕️ Praticien :</strong> ${h.practitioner}</p>
              <p><strong class="text-slate-800 dark:text-slate-300">📝 Observations :</strong> ${h.notes || '-'}</p>
            </div>

            <div class="flex justify-end pt-1 border-t border-[#143E23]/10">
              <button onclick="window.deleteHealthLog('${h.id}')" class="p-1 hover:bg-rose-500/10 text-rose-500 rounded transition-all cursor-pointer text-[10px] font-bold flex items-center gap-1">
                <i data-lucide="trash" class="h-3 w-3"></i> Annuler l'acte
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  handleHealthSubmit() {
    const date = document.getElementById('health-date').value;
    const target = document.getElementById('health-target').value;
    const intervention = document.getElementById('health-intervention').value;
    const practitioner = document.getElementById('health-practitioner').value;
    const cost = parseInt(document.getElementById('health-cost').value) || 0;
    const notes = document.getElementById('health-notes').value;

    const newLog = {
      id: 'HEA-' + Date.now(),
      date, target, intervention, practitioner, cost, notes
    };

    const logs = KAStorage.getElevageHealth();
    logs.push(newLog);
    KAStorage.saveElevageHealth(logs);

    // Dynamic Integration with Finances Module
    if (cost > 0) {
      const finances = KAStorage.getFinances();
      const newExpense = {
        id: 'F-' + Date.now(),
        description: `Soin Élevage : ${intervention} (${target})`,
        category: 'Élevage',
        type: 'Dépense',
        amount: cost,
        date: date
      };
      finances.push(newExpense);
      KAStorage.saveFinances(finances);
    }

    document.getElementById('add-health-modal').classList.add('hidden');
    document.getElementById('health-form').reset();

    this.renderHealth();
  },

  deleteHealth(id) {
    if (!confirm('Voulez-vous supprimer ce relevé sanitaire du registre ? Les frais liés ne seront pas effacés du grand livre comptable.')) return;

    let logs = KAStorage.getElevageHealth();
    logs = logs.filter(l => l.id !== id);
    KAStorage.saveElevageHealth(logs);

    this.renderHealth();
  }
};

// Auto initialize on load
document.addEventListener('DOMContentLoaded', () => {
  ElevageModule.init();
});
