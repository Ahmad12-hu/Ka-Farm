// KA Farm - Élevage Module (Cheptel, Production, Sanitaire)
import { KAStorage } from '../storage.js';

export const ElevageModule = {
  currentTab: 'cheptel',

  init() {
    this.renderCheptel();
    this.renderAlimentation();
    this.renderProduction();
    this.renderHealth();
    this.setupListeners();
  },

  // ==================== CHEPTEL ====================
  renderCheptel(filterText = '') {
    const container = document.getElementById('cheptel-container');
    if (!container) return;

    let cheptel = KAStorage.getCheptel();
    
    // Apply search filter
    if (filterText) {
      const lower = filterText.toLowerCase();
      cheptel = cheptel.filter(c => 
        c.name.toLowerCase().includes(lower) ||
        c.type.toLowerCase().includes(lower) ||
        c.breed.toLowerCase().includes(lower) ||
        c.status.toLowerCase().includes(lower)
      );
    }

    // Update stats
    const totalCount = cheptel.reduce((sum, c) => sum + (parseInt(c.quantity) || 0), 0);
    const healthyCount = cheptel.filter(c => c.status === 'Sain').reduce((sum, c) => sum + (parseInt(c.quantity) || 0), 0);
    const healthPercent = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 100;

    const elTotal = document.getElementById('cheptel-total-count');
    const elHealth = document.getElementById('cheptel-health-status');
    const elGroups = document.getElementById('cheptel-groups-count');

    if (elTotal) elTotal.textContent = totalCount;
    if (elHealth) {
      elHealth.textContent = healthPercent + '%';
      elHealth.className = healthPercent >= 80 
        ? 'text-2xl font-black text-emerald-400 mt-1 font-mono'
        : 'text-2xl font-black text-amber-400 mt-1 font-mono';
    }
    if (elGroups) elGroups.textContent = cheptel.length;

    if (cheptel.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-10 text-slate-400">
          <p class="text-xs font-bold">Aucun groupe d'élevage enregistré.</p>
        </div>
      `;
      return;
    }

    const statusConfig = {
      'Sain': { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: 'check-circle' },
      'Surveiller': { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: 'eye' },
      'Sous traitement': { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: 'activity' },
      'Malade': { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: 'alert-circle' },
      'Alerte': { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: 'alert-triangle' }
    };

    container.innerHTML = cheptel.map(c => {
      const status = statusConfig[c.status] || statusConfig['Sain'];
      const emojiMap = {
        'Bovins': '🐄',
        'Ovins': '🐑',
        'Caprins': '🐐',
        'Volailles': '🐔',
        'Autres': '🐴'
      };
      const emoji = emojiMap[c.type] || '🐾';

      return `
        <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl space-y-4 text-left shadow-sm hover:border-emerald-500/30 transition-all">
          <div class="flex justify-between items-start gap-2">
            <div class="flex items-center gap-3">
              <span class="text-3xl">${emoji}</span>
              <div>
                <h3 class="text-sm font-black text-slate-800 dark:text-white">${c.name}</h3>
                <p class="text-[9px] text-[#819888] font-bold uppercase tracking-wider">${c.breed}</p>
              </div>
            </div>
            <button onclick="window.deleteCheptel('${c.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143E23]/20 transition-all cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${status.color}">
              ${status.icon ? `🛡️ ${c.status}` : c.status}
            </span>
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-50 dark:bg-emerald-950/20 text-slate-600 dark:text-emerald-400 border-slate-100 dark:border-[#143E23]/30">
              🎯 ${c.purpose || 'Non défini'}
            </span>
          </div>

          <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 space-y-1.5 text-[11px] font-semibold">
            <div class="flex justify-between">
              <span class="text-slate-400">Effectif:</span>
              <span class="text-slate-700 dark:text-slate-200 font-black">${c.quantity} ${c.unit}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Espèce:</span>
              <span class="text-slate-700 dark:text-slate-200 font-black">${c.type}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // ==================== ALIMENTATION ====================
  renderAlimentation() {
    const container = document.getElementById('feeds-container');
    if (!container) return;

    const stocks = KAStorage.getStocks();
    const feedStocks = stocks.filter(s => s.category === 'Alimentation');

    // Update feed alert banner
    const alertBanner = document.getElementById('feed-alert-banner');
    const alertText = document.getElementById('feed-alert-text');
    
    const lowFeeds = feedStocks.filter(s => (s.quantity / s.maxQuantity) <= 0.25);
    if (alertBanner) {
      if (lowFeeds.length > 0) {
        alertBanner.classList.remove('hidden');
        if (alertText) {
          const names = lowFeeds.map(f => f.name).join(', ');
          alertText.textContent = `Niveau critique: ${names}. Commandez au plus vite.`;
        }
      } else {
        alertBanner.classList.add('hidden');
      }
    }

    // Populate feed select in consumption form
    const consumeSelect = document.getElementById('consume-feed-id');
    if (consumeSelect) {
      consumeSelect.innerHTML = feedStocks.map(f => 
        `<option value="${f.id}">${f.name} (${f.quantity}/${f.maxQuantity} ${f.unit})</option>`
      ).join('');
    }

    if (feedStocks.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-10 text-slate-400">
          <p class="text-xs font-bold">Aucun stock d'alimentation enregistré.</p>
          <p class="text-[10px] mt-1">Ajoutez des aliments dans la section "Inventaire & Stocks".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = feedStocks.map(f => {
      const percentage = Math.round((f.quantity / f.maxQuantity) * 100);
      const isLow = percentage <= 25;
      const progressColor = isLow ? 'bg-rose-500' : percentage <= 50 ? 'bg-amber-500' : 'bg-emerald-500';
      
      return `
        <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl space-y-3 text-left shadow-sm">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="text-xs font-black text-slate-800 dark:text-white">${f.name}</h4>
              <p class="text-[9px] text-[#819888] font-bold mt-0.5">${f.category}</p>
            </div>
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${isLow ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}">
              ${isLow ? 'CRITIQUE' : 'OK'}
            </span>
          </div>
          
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-bold">
              <span class="text-slate-400">Niveau</span>
              <span class="text-slate-600 dark:text-slate-300">${f.quantity} / ${f.maxQuantity} ${f.unit}</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-[#061109] rounded-full h-2 overflow-hidden">
              <div class="${progressColor} h-full rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
            </div>
            <p class="text-[9px] text-slate-400 text-right font-mono">${percentage}%</p>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // ==================== PRODUCTION ====================
  renderProduction() {
    const tbody = document.getElementById('production-table-body');
    if (!tbody) return;

    const productions = KAStorage.getElevageProduction() || [];

    // Calculate totals for the week (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentProds = productions.filter(p => new Date(p.date) >= oneWeekAgo);

    let totalMilk = 0;
    let totalEggs = 0;
    recentProds.forEach(p => {
      if (p.type === 'Lait') totalMilk += parseInt(p.quantity) || 0;
      if (p.type === 'Œufs') totalEggs += parseInt(p.quantity) || 0;
    });

    const elMilk = document.getElementById('total-milk-prod');
    const elEggs = document.getElementById('total-egg-prod');
    if (elMilk) elMilk.textContent = totalMilk + ' L';
    if (elEggs) elEggs.textContent = totalEggs + ' unités';

    // Sort by date descending
    const sorted = [...productions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-10 text-slate-400">
            Aucune production enregistrée.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = sorted.map(p => {
      const icon = p.type === 'Lait' ? '🥛' : '🥚';
      return `
        <tr class="border-b border-[#143E23]/20 hover:bg-slate-50/50 dark:hover:bg-[#061109]/30 transition-colors">
          <td class="py-3 px-2 text-slate-600 dark:text-slate-300 font-mono text-[10px]">${p.date}</td>
          <td class="py-3 px-2">
            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              ${icon} ${p.type}
            </span>
          </td>
          <td class="py-3 px-2 text-slate-800 dark:text-white font-black font-mono">${p.quantity} ${p.unit}</td>
          <td class="py-3 px-2 text-slate-500 text-[10px] max-w-[200px] truncate">${p.notes || '-'}</td>
          <td class="py-3 px-2 text-right">
            <button onclick="window.deleteProduction('${p.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer">
              <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // ==================== SANTÉ ====================
  renderHealth() {
    const container = document.getElementById('health-timeline');
    if (!container) return;

    const healthRecords = KAStorage.getElevageHealth() || [];
    
    // Update interventions count
    const elCount = document.getElementById('health-interventions-count');
    if (elCount) {
      elCount.textContent = healthRecords.length + ' acte' + (healthRecords.length > 1 ? 's' : '') + ' noté' + (healthRecords.length > 1 ? 's' : '');
    }

    // Sort by date descending
    const sorted = [...healthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-400">
          <p class="text-xs font-bold">Aucun acte médical enregistré.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = sorted.map(h => `
      <div class="p-4 bg-slate-50 dark:bg-[#061109]/40 border border-slate-100 dark:border-emerald-950/30 rounded-2xl flex gap-4 items-start">
        <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <i data-lucide="heart-pulse" class="h-5 w-5"></i>
        </div>
        <div class="flex-grow space-y-1.5 text-left min-w-0">
          <div class="flex justify-between items-start gap-2">
            <h4 class="text-xs font-black text-slate-800 dark:text-white">${h.intervention}</h4>
            <button onclick="window.deleteHealthRecord('${h.id}')" class="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer flex-shrink-0">
              <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
            </button>
          </div>
          <p class="text-[10px] text-slate-500 font-semibold">🎯 ${h.target}</p>
          <p class="text-[10px] text-slate-400">👨‍⚕️ ${h.practitioner}</p>
          <p class="text-[10px] text-slate-500">💰 ${h.cost.toLocaleString('fr-FR')} FCFA</p>
          <p class="text-[9px] text-slate-400 font-mono">${h.date}</p>
          ${h.notes ? `<p class="text-[10px] text-slate-600 dark:text-slate-400 italic border-t border-slate-100 dark:border-[#143E23]/20 pt-1 mt-1">${h.notes}</p>` : ''}
        </div>
      </div>
    `).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // ==================== LISTENERS ====================
  setupListeners() {
    // Tab switching
    window.switchElevageTab = (tab) => {
      this.currentTab = tab;
      
      // Update tab links
      ['cheptel', 'alimentation', 'production', 'health'].forEach(t => {
        const link = document.getElementById(`tab-link-${t}`);
        const content = document.getElementById(`tab-content-${t}`);
        
        if (t === tab) {
          link.className = 'px-4 py-2.5 text-xs font-black border-b-2 border-emerald-500 text-emerald-500 flex items-center gap-2 whitespace-nowrap cursor-pointer';
          content.classList.remove('hidden');
        } else {
          link.className = 'px-4 py-2.5 text-xs font-black border-b-2 border-transparent text-slate-450 dark:text-slate-400 hover:text-emerald-500 flex items-center gap-2 whitespace-nowrap cursor-pointer';
          content.classList.add('hidden');
        }
      });

      // Show/hide action buttons based on tab
      const addCheptelBtn = document.getElementById('add-cheptel-btn');
      const addProductionBtn = document.getElementById('add-production-btn');
      const addHealthBtn = document.getElementById('add-health-btn');

      if (addCheptelBtn) addCheptelBtn.classList.toggle('hidden', tab !== 'cheptel');
      if (addProductionBtn) addProductionBtn.classList.toggle('hidden', tab !== 'production');
      if (addHealthBtn) addHealthBtn.classList.toggle('hidden', tab !== 'health');
    };

    // Delete cheptel
    window.deleteCheptel = (id) => {
      if (!confirm('Voulez-vous supprimer ce groupe d\'élevage ?')) return;
      const cheptel = KAStorage.getCheptel().filter(c => c.id !== id);
      KAStorage.saveCheptel(cheptel);
      this.renderCheptel();
    };

    // Delete production
    window.deleteProduction = (id) => {
      if (!confirm('Voulez-vous supprimer cette entrée de production ?')) return;
      const productions = KAStorage.getElevageProduction().filter(p => p.id !== id);
      KAStorage.saveElevageProduction(productions);
      this.renderProduction();
    };

    // Delete health record
    window.deleteHealthRecord = (id) => {
      if (!confirm('Voulez-vous supprimer cet acte de soin ?')) return;
      const health = KAStorage.getElevageHealth().filter(h => h.id !== id);
      KAStorage.saveElevageHealth(health);
      this.renderHealth();
    };

    // Cheptel form
    const cheptelForm = document.getElementById('cheptel-form');
    if (cheptelForm) {
      cheptelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cheptel-name').value;
        const type = document.getElementById('cheptel-type').value;
        const breed = document.getElementById('cheptel-breed').value;
        const qty = parseInt(document.getElementById('cheptel-qty').value);
        const unit = document.getElementById('cheptel-unit').value;
        const status = document.getElementById('cheptel-status').value;
        const purpose = document.getElementById('cheptel-purpose').value;

        if (!name || !qty) return;

        const cheptel = KAStorage.getCheptel();
        cheptel.unshift({
          id: `CH-${Date.now()}`,
          name,
          type,
          breed: breed || 'Non spécifiée',
          quantity: qty,
          unit,
          status,
          purpose
        });

        KAStorage.saveCheptel(cheptel);
        this.renderCheptel();
        cheptelForm.reset();
        document.getElementById('add-cheptel-modal').classList.add('hidden');
        alert('Groupe d\'élevage enregistré !');
      });
    }

    // Production form
    const productionForm = document.getElementById('production-form');
    if (productionForm) {
      productionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('prod-date').value;
        const type = document.getElementById('prod-type').value;
        const qty = parseInt(document.getElementById('prod-qty').value);
        const unit = document.getElementById('prod-unit').value || (type === 'Lait' ? 'L' : 'unités');
        const notes = document.getElementById('prod-notes').value;

        if (!date || !qty) return;

        const productions = KAStorage.getElevageProduction();
        productions.unshift({
          id: `PROD-${Date.now()}`,
          date,
          type,
          quantity: qty,
          unit,
          notes
        });

        KAStorage.saveElevageProduction(productions);
        this.renderProduction();
        productionForm.reset();
        
        // Reset unit to default
        document.getElementById('prod-unit').value = type === 'Lait' ? 'L' : 'unités';
        
        document.getElementById('add-production-modal').classList.add('hidden');
        alert('Production enregistrée !');
      });
    }

    // Health form
    const healthForm = document.getElementById('health-form');
    if (healthForm) {
      healthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('health-date').value;
        const target = document.getElementById('health-target').value;
        const intervention = document.getElementById('health-intervention').value;
        const practitioner = document.getElementById('health-practitioner').value;
        const cost = parseFloat(document.getElementById('health-cost').value) || 0;
        const notes = document.getElementById('health-notes').value;

        if (!date || !target || !intervention || !practitioner) return;

        const health = KAStorage.getElevageHealth();
        health.unshift({
          id: `HEA-${Date.now()}`,
          date,
          target,
          intervention,
          practitioner,
          cost,
          notes
        });

        KAStorage.saveElevageHealth(health);
        this.renderHealth();
        healthForm.reset();
        document.getElementById('add-health-modal').classList.add('hidden');
        alert('Acte de soin enregistré !');
      });
    }

    // Feed consumption form
    const feedForm = document.getElementById('feed-consumption-form');
    if (feedForm) {
      feedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedId = document.getElementById('consume-feed-id').value;
        const qty = parseInt(document.getElementById('consume-feed-qty').value);

        if (!feedId || !qty) return;

        const stocks = KAStorage.getStocks();
        const idx = stocks.findIndex(s => s.id === feedId);
        
        if (idx === -1) {
          alert('Aliment non trouvé !');
          return;
        }

        if (stocks[idx].quantity < qty) {
          alert(`Stock insuffisant ! Disponible: ${stocks[idx].quantity} ${stocks[idx].unit}`);
          return;
        }

        stocks[idx].quantity -= qty;
        KAStorage.saveStocks(stocks);
        
        this.renderAlimentation();
        document.getElementById('feed-consumption-form').reset();
        alert('Consommation enregistrée !');
      });
    }

    // Search filter
    const searchInput = document.getElementById('cheptel-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderCheptel(e.target.value);
      });
    }

    // Populate health target select with animal groups
    const healthTargetSelect = document.getElementById('health-target');
    if (healthTargetSelect) {
      const cheptel = KAStorage.getCheptel();
      if (cheptel.length === 0) {
        healthTargetSelect.innerHTML = `<option value="">Aucun groupe</option>`;
      } else {
        healthTargetSelect.innerHTML = cheptel.map(c => 
          `<option value="${c.name}">${c.name} (${c.type})</option>`
        ).join('');
      }
    }

    // Unit auto-switch based on production type
    const prodTypeSelect = document.getElementById('prod-type');
    const prodUnitInput = document.getElementById('prod-unit');
    if (prodTypeSelect && prodUnitInput) {
      prodTypeSelect.addEventListener('change', (e) => {
        prodUnitInput.value = e.target.value === 'Lait' ? 'L' : 'unités';
      });
    }
  }
};

// Start elevage module
document.addEventListener('DOMContentLoaded', () => {
  ElevageModule.init();
});

// Live update listener from cloud database
document.addEventListener('ka_data_updated', () => {
  ElevageModule.init();
});