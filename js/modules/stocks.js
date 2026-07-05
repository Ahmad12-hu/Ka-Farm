// KA Farm - Stocks & Inputs Management Module
import { KAStorage } from '../storage.js';

export const StocksModule = {
  isOfflineSimulated: localStorage.getItem('ka_stocks_offline_simulated') === 'true',

  async init() {
    this.updateNetworkBadge();
    await this.refreshStocksFromServer();

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      const searchInput = document.getElementById('stock-search-input');
      if (searchInput) {
        searchInput.value = searchParam;
        this.renderStocks();
      }
    }

    this.setupListeners();

    // Listen for real browser network changes
    window.addEventListener('online', () => this.handleNetworkChange());
    window.addEventListener('offline', () => this.handleNetworkChange());
  },

  async handleNetworkChange() {
    this.updateNetworkBadge();
    await this.refreshStocksFromServer();
    if (navigator.onLine && !this.isOfflineSimulated) {
      await this.syncOfflineChanges();
    }
  },

  updateNetworkBadge() {
    const badge = document.getElementById('network-status-badge');
    const dot = document.getElementById('network-status-dot');
    const text = document.getElementById('network-status-text');
    const toggleBtn = document.getElementById('toggle-offline-btn');
    const toggleText = document.getElementById('offline-toggle-text');
    const toggleIcon = document.getElementById('offline-toggle-icon');

    const isOffline = this.isOfflineSimulated || !navigator.onLine;

    if (badge && dot && text) {
      if (isOffline) {
        badge.className = "text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1.5 transition-all";
        dot.className = "h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse";
        text.textContent = !navigator.onLine ? "Hors-Ligne (Données du Cache)" : "Simulé Hors-Ligne (Mode Cache)";
      } else {
        badge.className = "text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1.5 transition-all";
        dot.className = "h-1.5 w-1.5 bg-emerald-500 rounded-full";
        text.textContent = "En Ligne & Synchronisé";
      }
    }

    if (toggleBtn && toggleText && toggleIcon) {
      if (this.isOfflineSimulated) {
        toggleText.textContent = "Passer En-ligne";
        toggleIcon.setAttribute('data-lucide', 'wifi-off');
        toggleIcon.className = "h-3.5 w-3.5 text-amber-500";
        toggleBtn.className = "px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all";
      } else {
        toggleText.textContent = "Simuler Hors-ligne";
        toggleIcon.setAttribute('data-lucide', 'wifi');
        toggleIcon.className = "h-3.5 w-3.5 text-emerald-500 animate-pulse";
        toggleBtn.className = "px-3 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#1A4525] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all";
      }
      if (window.lucide) window.lucide.createIcons();
    }
  },

  async refreshStocksFromServer() {
    const isOffline = this.isOfflineSimulated || !navigator.onLine;
    if (isOffline) {
      console.log("Stocks Module: simulated or real offline mode. Displaying from cache.");
      this.renderStocks();
      return;
    }

    try {
      const response = await fetch('/api/stocks');
      if (!response.ok) throw new Error("Erreur de serveur");
      const remoteStocks = await response.json();
      
      // Update local storage cache
      KAStorage.saveStocks(remoteStocks);
      this.renderStocks();
    } catch (e) {
      console.warn("Stocks Module: Failed to fetch from API, falling back to cache.", e);
      this.renderStocks();
    }
  },

  async saveAndSyncStocks(stocks) {
    // Save to local cache first
    KAStorage.saveStocks(stocks);
    this.renderStocks();

    const isOffline = this.isOfflineSimulated || !navigator.onLine;
    if (isOffline) {
      localStorage.setItem('ka_stocks_pending_sync', 'true');
      this.showToast("Sauvegardé en cache (Sera synchronisé une fois en ligne)", "warning");
      return;
    }

    try {
      const response = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stocks })
      });
      if (!response.ok) throw new Error("Sync failed");
      localStorage.removeItem('ka_stocks_pending_sync');
      this.showToast("Modifications synchronisées avec succès !", "success");
    } catch (e) {
      console.error("Stocks Module: Sync failed, saved in local cache.", e);
      localStorage.setItem('ka_stocks_pending_sync', 'true');
      this.showToast("Sauvegardé localement (Erreur de synchronisation)", "warning");
    }
  },

  async syncOfflineChanges() {
    if (localStorage.getItem('ka_stocks_pending_sync') === 'true') {
      const stocks = KAStorage.getStocks();
      try {
        const response = await fetch('/api/stocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stocks })
        });
        if (response.ok) {
          localStorage.removeItem('ka_stocks_pending_sync');
          this.showToast("🔄 Modifications hors-ligne synchronisées avec le serveur !", "success");
        }
      } catch (e) {
        console.error("Auto-sync failed:", e);
      }
    }
  },

  showToast(message, type = "success") {
    const toastId = "stocks-toast";
    let toast = document.getElementById(toastId);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = toastId;
      document.body.appendChild(toast);
    }

    if (type === "success") {
      toast.className = "fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 max-w-sm transition-all duration-300 transform bg-emerald-500 text-white border border-emerald-400 opacity-100 translate-y-0";
    } else if (type === "warning") {
      toast.className = "fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 max-w-sm transition-all duration-300 transform bg-amber-500 text-white border border-amber-400 opacity-100 translate-y-0 animate-bounce";
    } else {
      toast.className = "fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 max-w-sm transition-all duration-300 transform bg-slate-800 text-white border border-slate-700 opacity-100 translate-y-0";
    }

    toast.innerHTML = `
      <i class="h-4 w-4 flex-shrink-0" data-lucide="${type === 'success' ? 'check-circle' : 'alert-triangle'}"></i>
      <span>${message}</span>
    `;
    
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.className = "fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 max-w-sm transition-all duration-300 transform bg-slate-800 text-white border border-slate-700 opacity-0 translate-y-20 pointer-events-none";
    }, 4000);
  },

  renderStocks() {
    const container = document.getElementById('stocks-container');
    if (!container) return;

    const stocks = KAStorage.getStocks();
    const searchQuery = (document.getElementById('stock-search-input')?.value || '').toLowerCase().trim();
    const categoryFilter = document.getElementById('stock-category-filter')?.value || 'all';

    // Statistics elements
    const totalCountEl = document.getElementById('stocks-total-count');
    const alertCountEl = document.getElementById('stocks-alert-count');
    const averagePercentEl = document.getElementById('stocks-average-percent');

    // Filter stocks
    const filteredStocks = stocks.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery);
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Calculate overall stats
    const totalItems = stocks.length;
    const lowStocks = stocks.filter(s => s.quantity <= (s.maxQuantity * 0.2));
    const lowCount = lowStocks.length;
    
    let totalPercentSum = 0;
    stocks.forEach(s => {
      const pct = s.maxQuantity > 0 ? (s.quantity / s.maxQuantity) * 100 : 0;
      totalPercentSum += Math.min(100, Math.max(0, pct));
    });
    const avgPercent = totalItems > 0 ? Math.round(totalPercentSum / totalItems) : 0;

    // Display statistics
    if (totalCountEl) {
      if (window.animateValue) window.animateValue(totalCountEl, 0, totalItems, 700);
      else totalCountEl.textContent = totalItems;
    }
    if (alertCountEl) {
      if (window.animateValue) window.animateValue(alertCountEl, 0, lowCount, 700);
      else alertCountEl.textContent = lowCount;
      if (lowCount > 0) {
        alertCountEl.className = 'text-2xl font-black text-rose-500 mt-1 font-mono';
      } else {
        alertCountEl.className = 'text-2xl font-black text-emerald-500 mt-1 font-mono';
      }
    }
    if (averagePercentEl) {
      if (window.animateValue) window.animateValue(averagePercentEl, 0, avgPercent, 800);
      else averagePercentEl.textContent = `${avgPercent}%`;
    }

    if (filteredStocks.length === 0) {
      container.innerHTML = `
        <div class="p-10 text-center bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl text-slate-450 dark:text-slate-500">
          <p class="text-sm font-bold">Aucun intrant ne correspond à votre recherche.</p>
          <p class="text-xs text-slate-400 mt-1">Modifiez vos filtres ou ajoutez un produit.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredStocks.map(s => {
      const percent = s.maxQuantity > 0 ? Math.round((s.quantity / s.maxQuantity) * 100) : 0;
      
      // Visual statuses
      let barColor = 'bg-emerald-500';
      let textColor = 'text-emerald-500';
      let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      let statusText = 'Optimal';

      if (percent <= 20) {
        barColor = 'bg-rose-500';
        textColor = 'text-rose-500';
        badgeColor = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        statusText = 'Alerte Bas';
      } else if (percent <= 50) {
        barColor = 'bg-amber-500';
        textColor = 'text-amber-500';
        badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        statusText = 'Moyen';
      }

      // Icon matching category
      let catIcon = 'package';
      if (s.category === 'Amendements') catIcon = 'leaf';
      else if (s.category === 'Semences') catIcon = 'sprout';
      else if (s.category === 'Traitements') catIcon = 'shield-check';
      else if (s.category === 'Alimentation') catIcon = 'wheat';

      return `
        <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl text-left space-y-4 shadow-sm hover:border-[#143E23]/50 transition-all">
          <div class="flex justify-between items-start gap-3">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <i data-lucide="${catIcon}" class="h-5 w-5"></i>
              </div>
              <div>
                <h4 class="text-xs font-black text-slate-850 dark:text-white leading-tight">${s.name}</h4>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">${s.category}</p>
              </div>
            </div>
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}">${statusText}</span>
          </div>

          <!-- Quantity level display bar -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-baseline text-xs font-semibold">
              <span class="text-slate-400 text-[10px]">Niveau de remplissage : <strong class="${textColor} font-mono">${percent}%</strong></span>
              <span class="text-slate-800 dark:text-slate-200 font-mono font-black">${s.quantity.toLocaleString('fr-FR')} / ${s.maxQuantity.toLocaleString('fr-FR')} ${s.unit}</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-emerald-950/20 h-2 rounded-full overflow-hidden">
              <div class="h-full ${barColor} transition-all duration-500" style="width: ${Math.min(100, percent)}%"></div>
            </div>
          </div>

          <!-- Actions footer -->
          <div class="pt-2 border-t border-slate-50 dark:border-emerald-950/10 flex justify-between items-center">
            <button onclick="window.openAdjustModal('${s.id}', '${s.name.replace(/'/g, "\\'")}', ${s.quantity}, '${s.unit}')" class="px-3.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 font-black text-[10px] rounded-lg cursor-pointer transition-colors flex items-center gap-1">
              <i data-lucide="sliders" class="h-3.5 w-3.5"></i> Ajuster Quantité
            </button>
            <button onclick="window.deleteStockItem('${s.id}')" class="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  setupListeners() {
    window.toggleOfflineSimulation = async () => {
      this.isOfflineSimulated = !this.isOfflineSimulated;
      localStorage.setItem('ka_stocks_offline_simulated', this.isOfflineSimulated);
      this.updateNetworkBadge();
      
      const isOffline = this.isOfflineSimulated || !navigator.onLine;
      if (isOffline) {
        this.showToast("Mode Hors-ligne activé (Simulé). Les données de stock sont lues depuis le cache local.", "warning");
      } else {
        this.showToast("Mode En-ligne réactivé. Synchronisation et mise à jour en cours...", "success");
        await this.syncOfflineChanges();
      }
      
      await this.refreshStocksFromServer();
    };

    window.exportStocksCSV = () => {
      const stocks = KAStorage.getStocks();
      if (stocks.length === 0) {
        alert("Aucun produit enregistré en stock !");
        return;
      }
      const headers = ["ID", "Nom de l'Intrant", "Catégorie", "Quantité Actuelle", "Capacité Max", "Unité de Mesure", "Taux de Remplissage (%)"];
      const rows = stocks.map(s => {
        const fillPercent = s.maxQuantity > 0 ? Math.round((s.quantity / s.maxQuantity) * 100) : 0;
        return [
          s.id,
          `"${s.name.replace(/"/g, '""')}"`,
          s.category,
          s.quantity,
          s.maxQuantity,
          s.unit,
          fillPercent
        ];
      });
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ka_farm_reserve_stocks_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.exportStocksPDF = () => {
      const stocks = KAStorage.getStocks();
      if (stocks.length === 0) {
        alert("Aucun produit enregistré en stock !");
        return;
      }
      const zone = localStorage.getItem('ka_farm_zone') || 'Dakar (Sénégal)';
      const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

      // Statistics
      const totalItems = stocks.length;
      const lowStocks = stocks.filter(s => s.quantity <= (s.maxQuantity * 0.2));
      const lowCount = lowStocks.length;
      let totalPercentSum = 0;
      stocks.forEach(s => {
        const pct = s.maxQuantity > 0 ? (s.quantity / s.maxQuantity) * 100 : 0;
        totalPercentSum += Math.min(100, Math.max(0, pct));
      });
      const avgPercent = totalItems > 0 ? Math.round(totalPercentSum / totalItems) : 0;

      const printAreaId = 'print-report-area';
      let printArea = document.getElementById(printAreaId);
      if (printArea) {
        printArea.remove();
      }

      printArea = document.createElement('div');
      printArea.id = printAreaId;
      printArea.className = 'hidden';

      const tableRowsHtml = stocks.map(s => {
        const percent = s.maxQuantity > 0 ? Math.round((s.quantity / s.maxQuantity) * 100) : 0;
        let badgeStyle = 'background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;';
        let statusText = 'OPTIMAL';
        if (percent <= 20) {
          badgeStyle = 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;';
          statusText = 'ALERTE BAS';
        } else if (percent <= 50) {
          badgeStyle = 'background: #fffbeb; color: #92400e; border: 1px solid #fde68a;';
          statusText = 'MOYEN';
        }

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 10px 0; text-align: left; font-weight: 600; color: #1e293b;">📦 ${s.name}</td>
            <td style="padding: 10px 0; text-align: left; color: #64748b;">${s.category}</td>
            <td style="padding: 10px 0; text-align: left; font-family: monospace; font-weight: bold; color: #334155;">
              ${s.quantity.toLocaleString('fr-FR')} / ${s.maxQuantity.toLocaleString('fr-FR')} ${s.unit}
            </td>
            <td style="padding: 10px 0; text-align: left; font-family: monospace; font-weight: bold; color: #059669;">
              ${percent}%
            </td>
            <td style="padding: 10px 0; text-align: right;">
              <span style="padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; ${badgeStyle}">${statusText}</span>
            </td>
          </tr>
        `;
      }).join('');

      printArea.innerHTML = `
        <style>
          @media print {
            body > *:not(#${printAreaId}) {
              display: none !important;
            }
            #${printAreaId} {
              display: block !important;
              background: white !important;
              color: black !important;
              font-family: 'Inter', system-ui, sans-serif !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
          .report-card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            background: #f8fafc;
            position: relative;
            z-index: 10;
          }
          .print-watermark {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-8deg);
            width: 480px;
            height: 480px;
            opacity: 0.038;
            pointer-events: none;
            z-index: 1;
          }
        </style>
        <div style="max-width: 800px; margin: 0 auto; padding: 20px; position: relative; min-height: 1000px;">
          <!-- Elegant Background Watermark -->
          <div class="print-watermark">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
              <path d="M50 12 C70 12, 82 15, 82 34 C82 52, 70 66, 50 75 C30 66, 18 52, 18 34 C18 15, 30 12, 50 12 Z" stroke="#059669" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
              <path d="M50 15 C67 15, 78 18, 78 34 C78 50, 67 63, 50 71 C33 63, 22 50, 22 34 C22 18, 33 15, 50 15 Z" stroke="#059669" stroke-width="0.6" stroke-linejoin="round" fill="none"/>
              <path d="M29 29 V46 M29 37 L38 29 M32 39 L39 46" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M44 46 L49 29 L54 46 M46 41 H52" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M59 46 H71" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M65 46 V39" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M65 39 C61 39, 58 36, 58 33 C58 30, 61 29, 65 33 C65 33, 65 39, 65 39 Z" stroke="#059669" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
              <path d="M65 37 C65 37, 72 37, 72 31 C72 28, 69 27, 65 33" stroke="#059669" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
              <text x="50" y="61" fill="#059669" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="11.5" text-anchor="middle" letter-spacing="1.2">FARM</text>
            </svg>
          </div>

          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; position: relative; z-index: 10;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <!-- High-Fidelity Logo -->
              <div style="width: 55px; height: 55px; flex-shrink: 0;">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                  <path d="M50 12 C70 12, 82 15, 82 34 C82 52, 70 66, 50 75 C30 66, 18 52, 18 34 C18 15, 30 12, 50 12 Z" stroke="#059669" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
                  <path d="M50 15 C67 15, 78 18, 78 34 C78 50, 67 63, 50 71 C33 63, 22 50, 22 34 C22 18, 33 15, 50 15 Z" stroke="#059669" stroke-width="0.6" stroke-linejoin="round" fill="none"/>
                  <path d="M29 29 V46 M29 37 L38 29 M32 39 L39 46" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M44 46 L49 29 L54 46 M46 41 H52" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M59 46 H71" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M65 46 V39" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M65 39 C61 39, 58 36, 58 33 C58 30, 61 29, 65 33 C65 33, 65 39, 65 39 Z" stroke="#059669" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
                  <path d="M65 37 C65 37, 72 37, 72 31 C72 28, 69 27, 65 33" stroke="#059669" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
                  <text x="50" y="61" fill="#059669" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="11.5" text-anchor="middle" letter-spacing="1.2">FARM</text>
                </svg>
              </div>
              <div>
                <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #065f46; letter-spacing: -0.5px;">KA FARM SÉNÉGAL</h1>
                <p style="margin: 3px 0 0 0; font-size: 10px; text-transform: uppercase; font-weight: 850; color: #059669; letter-spacing: 1px;">Régulation de la Réserve & Gestion des Intrants</p>
              </div>
            </div>
            <div style="text-align: right; position: relative; z-index: 10;">
              <span style="font-size: 8px; font-weight: 800; background: #ecfdf5; color: #047857; padding: 4px 8px; border-radius: 9999px; text-transform: uppercase;">Inventaire de Réserve</span>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #64748b;">Généré le <strong>${today}</strong></p>
            </div>
          </div>

          <!-- Title -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #1e293b; text-transform: uppercase;">Rapport Officiel d'Inventaire des Stocks</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-style: italic;">Registre d'état des engrais bio, traitements naturels et semences certifiées horticoles</p>
          </div>

          <!-- Info cards -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-size: 11px;">
            <div class="report-card">
              <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 9px; color: #047857; letter-spacing: 0.5px;">Exploitation & Normes</h4>
              <p style="margin: 4px 0;">📍 <strong>Zone d'activité :</strong> ${zone}</p>
              <p style="margin: 4px 0;">🔑 <strong>Supervision :</strong> Famille KA (Moussa, Aly & Amadou)</p>
              <p style="margin: 4px 0;">🌱 <strong>Type de traitement :</strong> Intrants certifiés 100% bio & écologiques</p>
            </div>
            <div class="report-card" style="border: 1px solid #cbd5e1; background: #f8fafc;">
              <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 9px; color: #047857; letter-spacing: 0.5px;">Contrôle des Seuils</h4>
              <p style="margin: 4px 0;">🚨 <strong>Alertes de rupture (&lt;20%) :</strong> <strong style="color: ${lowCount > 0 ? '#dc2626' : '#10b981'}; font-weight: bold;">${lowCount} produit(s)</strong></p>
              <p style="margin: 4px 0;">📈 <strong>Capacité de réserve globale occupée :</strong> <strong>${avgPercent}%</strong></p>
            </div>
          </div>

          <!-- Summary cards -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px;">
            <div style="border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #475569; letter-spacing: 0.5px;">Intrants Total</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #1e293b; font-family: monospace;">${totalItems}</p>
            </div>
            <div style="border: 1px solid ${lowCount > 0 ? '#fca5a5' : '#a7f3d0'}; background: ${lowCount > 0 ? '#fef2f2' : '#f0fdf4'}; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: ${lowCount > 0 ? '#b91c1c' : '#047857'}; letter-spacing: 0.5px;">Alertes Rupture</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: ${lowCount > 0 ? '#dc2626' : '#059669'}; font-family: monospace;">${lowCount}</p>
            </div>
            <div style="border: 1px solid #a7f3d0; background: #f0fdf4; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #047857; letter-spacing: 0.5px;">Remplissage Moyen</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #059669; font-family: monospace;">${avgPercent}%</p>
            </div>
          </div>

          <!-- Table -->
          <h3 style="font-size: 11px; text-transform: uppercase; color: #1e293b; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Inventaire Global & État de Réserve</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; font-size: 10px; text-transform: uppercase; color: #64748b;">
                <th style="padding: 8px 0; text-align: left;">Nom de l'Intrant</th>
                <th style="padding: 8px 0; text-align: left;">Catégorie</th>
                <th style="padding: 8px 0; text-align: left;">Quantité en Stock</th>
                <th style="padding: 8px 0; text-align: left;">Seuil (%)</th>
                <th style="padding: 8px 0; text-align: right;">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">Aucun produit enregistré</td></tr>'}
            </tbody>
          </table>

          <!-- Signatures footer -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; font-size: 10px;">
            <div style="text-align: left; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Pour le Responsable de Réserve</p>
              <p style="margin: 2px 0 35px 0; color: #64748b; font-style: italic;">Visa & Signature du responsable logistique</p>
              <p style="margin: 0; font-weight: 850; color: #0f172a;">Samba KA</p>
            </div>
            <div style="text-align: right; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Secrétariat de Gestion KA Farm</p>
              <p style="margin: 2px 0 35px 0; color: #64748b; font-style: italic;">Visa pour conformité d'inventaire</p>
              <div style="display: inline-block; border: 1px solid #10b981; color: #10b981; padding: 4px 8px; border-radius: 4px; font-weight: 900; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">INVENTORY COMPLIANT CERTIFICATE</div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(printArea);

      setTimeout(() => {
        window.print();
        setTimeout(() => {
          printArea.remove();
        }, 1000);
      }, 300);
    };

    // 1. Live filters (search and category)
    const searchInput = document.getElementById('stock-search-input');
    const catFilter = document.getElementById('stock-category-filter');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderStocks());
    }
    if (catFilter) {
      catFilter.addEventListener('change', () => this.renderStocks());
    }

    // 2. Add New Stock form
    const formNewStock = document.getElementById('new-stock-form');
    if (formNewStock) {
      formNewStock.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-stock-name').value;
        const category = document.getElementById('new-stock-cat').value;
        const unit = document.getElementById('new-stock-unit').value;
        const qty = parseFloat(document.getElementById('new-stock-qty').value);
        const max = parseFloat(document.getElementById('new-stock-max').value);

        if (!name || isNaN(qty) || isNaN(max)) return;

        const stocks = KAStorage.getStocks();
        stocks.push({
          id: `S-${Date.now()}`,
          name: name,
          category: category,
          quantity: qty,
          maxQuantity: max,
          unit: unit
        });

        this.saveAndSyncStocks(stocks);
        formNewStock.reset();

        document.getElementById('add-stock-modal').classList.add('hidden');
        
        // Notify sidebar update and alert success
        if (window.App && typeof window.App.updateBadges === 'function') {
          window.App.updateBadges();
        }
        alert('Nouvel intrant enregistré avec succès !');
      });
    }

    // 3. Open Adjust Modal
    window.openAdjustModal = (id, name, currentQty, unit) => {
      const modal = document.getElementById('adjust-stock-modal');
      const itemIdInput = document.getElementById('adjust-item-id');
      const itemNameEl = document.getElementById('adjust-item-name');
      const itemCurrentEl = document.getElementById('adjust-item-current');
      const unitDisplay = document.getElementById('adjust-unit-display');
      
      if (!modal || !itemIdInput || !itemNameEl || !itemCurrentEl || !unitDisplay) return;

      itemIdInput.value = id;
      itemNameEl.textContent = name;
      itemCurrentEl.textContent = `Niveau de stock actuel : ${currentQty.toLocaleString('fr-FR')} ${unit}`;
      unitDisplay.textContent = unit;

      // Reset inputs
      document.getElementById('adjust-amount').value = '';
      document.getElementById('adjust-note').value = '';
      document.getElementById('adjust-op-type').value = 'add';

      modal.classList.remove('hidden');
    };

    // 4. Handle Adjust Stock Form Submit
    const formAdjustStock = document.getElementById('adjust-stock-form');
    if (formAdjustStock) {
      formAdjustStock.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('adjust-item-id').value;
        const opType = document.getElementById('adjust-op-type').value;
        const amt = parseFloat(document.getElementById('adjust-amount').value);
        const note = document.getElementById('adjust-note').value;

        if (!id || isNaN(amt) || amt <= 0) return;

        const stocks = KAStorage.getStocks();
        const itemIndex = stocks.findIndex(s => s.id === id);
        
        if (itemIndex === -1) return;

        const item = stocks[itemIndex];
        const isAdd = opType === 'add';

        if (!isAdd && item.quantity < amt) {
          alert(`Erreur : Vous essayez de prélever ${amt} ${item.unit}, mais il ne reste que ${item.quantity} ${item.unit} en stock !`);
          return;
        }

        const prevQty = item.quantity;
        if (isAdd) {
          item.quantity += amt;
          // Dynamically scale maxQuantity if user enters stock beyond initial estimated capacity
          if (item.quantity > item.maxQuantity) {
            item.maxQuantity = item.quantity;
          }
        } else {
          item.quantity = Math.max(0, item.quantity - amt);
        }

        // Save and re-render
        this.saveAndSyncStocks(stocks);

        // Register action as a financial or log note if they want, but let's just close modal
        document.getElementById('adjust-stock-modal').classList.add('hidden');

        if (window.App && typeof window.App.updateBadges === 'function') {
          window.App.updateBadges();
        }

        alert(`Quantité de "${item.name}" mise à jour avec succès (${prevQty} → ${item.quantity} ${item.unit}).`);
      });
    }

    // 5. Delete Stock Item
    window.deleteStockItem = (id) => {
      if (!confirm('Voulez-vous vraiment supprimer cet intrant de la base de données ?')) return;
      
      const stocks = KAStorage.getStocks().filter(s => s.id !== id);
      this.saveAndSyncStocks(stocks);

      if (window.App && typeof window.App.updateBadges === 'function') {
        window.App.updateBadges();
      }
    };
  }
};

// Start stocks module
document.addEventListener('DOMContentLoaded', () => {
  StocksModule.init();
});

// Live update listener from cloud database
document.addEventListener('ka_data_updated', (e) => {
  if (e.detail && e.detail.key === 'ka_farm_stocks') {
    StocksModule.init();
  }
});
