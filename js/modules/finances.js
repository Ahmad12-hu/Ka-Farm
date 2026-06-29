// KA Farm - Financial & Compost Calculator Module
import { KAStorage } from '../storage.js';

export const FinancesModule = {
  marketsData: {
    tomate: {
      sandiara: 450,
      mbour: 500,
      dakar: 650,
      'saint-louis': 400
    },
    oignon: {
      sandiara: 500,
      mbour: 550,
      dakar: 600,
      'saint-louis': 450
    },
    piment: {
      sandiara: 1200,
      mbour: 1300,
      dakar: 1600,
      'saint-louis': 1100
    },
    gombo: {
      sandiara: 700,
      mbour: 800,
      dakar: 950,
      'saint-louis': 650
    }
  },

  selectedMarket: 'mbour',

  init() {
    this.renderFinances();
    this.setupListeners();
    this.calculateCompost();
    this.initMarketSimulator();
  },

  renderFinances() {
    const tbody = document.getElementById('finances-table-body');
    if (!tbody) return;

    const finances = KAStorage.getFinances();

    // Cumulative stats - Centralized
    const { totalRevenu: totalRevenre, totalDepense: totalExpense, solde: totalSolde } = KAStorage.getFinanceStats();

    const elRev = document.getElementById('finances-total-revenu');
    const elExp = document.getElementById('finances-total-depense');
    const elSol = document.getElementById('finances-total-solde');

    if (elRev) {
      if (window.animateValue) window.animateValue(elRev, 0, totalRevenre, 900);
      else elRev.textContent = totalRevenre.toLocaleString('fr-FR') + ' F';
    }
    if (elExp) {
      if (window.animateValue) window.animateValue(elExp, 0, totalExpense, 900);
      else elExp.textContent = totalExpense.toLocaleString('fr-FR') + ' F';
    }
    if (elSol) {
      if (window.animateValue) window.animateValue(elSol, 0, totalSolde, 1100);
      else elSol.textContent = totalSolde.toLocaleString('fr-FR') + ' F';
      if (totalSolde >= 0) {
        elSol.className = 'text-xl md:text-2xl font-black text-emerald-500 font-mono';
      } else {
        elSol.className = 'text-xl md:text-2xl font-black text-rose-500 font-mono';
      }
    }

    if (finances.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-10 text-slate-400">
            Aucun flux financier enregistré.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = finances.map(f => {
      const isRevenu = f.type === 'Revenu';
      const typeBadge = isRevenu 
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      
      const amountColor = isRevenu ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold';
      const sign = isRevenu ? '+' : '-';

      return `
        <tr class="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-[#061109]/30 transition-colors">
          <td class="py-3.5 text-slate-850 dark:text-slate-100 font-black">${f.description}</td>
          <td class="py-3.5">
            <span class="px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${typeBadge}">${f.type}</span>
          </td>
          <td class="py-3.5 text-slate-500 font-bold">${f.category}</td>
          <td class="py-3.5 text-slate-450 font-semibold">${f.date}</td>
          <td class="py-3.5 ${amountColor} font-black font-mono">${sign}${f.amount.toLocaleString('fr-FR')} F</td>
          <td class="py-3.5 text-right">
            <button onclick="window.deleteFinance('${f.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  calculateCompost() {
    const carbonInput = document.getElementById('compost-carbon-input');
    const nitrogenInput = document.getElementById('compost-nitrogen-input');
    
    if (!carbonInput || !nitrogenInput) return;

    const carbonKg = parseFloat(carbonInput.value) || 0;
    const nitrogenKg = parseFloat(nitrogenInput.value) || 0;

    const resultBox = document.getElementById('compost-result-box');
    const ratioText = document.getElementById('compost-ratio-text');
    const statusLabel = document.getElementById('compost-status-label');
    const adviceText = document.getElementById('compost-advice-text');

    if (!resultBox) return;

    if (carbonKg === 0 && nitrogenKg === 0) {
      resultBox.classList.add('hidden');
      return;
    }

    resultBox.classList.remove('hidden');

    // Calculate simulated C/N ratio based on input weights
    // Carbonaceous materials (straw, dry leaves) have high carbon (ratio around 60:1)
    // Nitrogenous materials (manure, green scraps) have high nitrogen (ratio around 15:1)
    // Weighted formula: C/N = (CarbonKg * 60 + NitrogenKg * 15) / (CarbonKg * 1 + NitrogenKg * 1)
    let ratioVal = 0;
    if (carbonKg + nitrogenKg > 0) {
      ratioVal = ((carbonKg * 60) + (nitrogenKg * 15)) / (carbonKg + nitrogenKg);
    }
    
    ratioVal = Math.round(ratioVal * 10) / 10;
    if (ratioText) ratioText.textContent = `C/N ≈ ${ratioVal} : 1`;

    if (ratioVal >= 25 && ratioVal <= 35) {
      statusLabel.textContent = '🟢 ÉQUILIBRÉ (Idéal)';
      statusLabel.className = 'inline-block text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20';
      adviceText.textContent = 'Votre mélange de compostage est optimal. L\'échauffement thermique sera excellent pour détruire les graines de mauvaises herbes. Arrosez régulièrement le tas de compost.';
    } else if (ratioVal < 25) {
      statusLabel.textContent = '🟡 EXCES D\'AZOTE (Trop humide / Odorants)';
      statusLabel.className = 'inline-block text-[10px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20';
      const neededCarbon = Math.round((nitrogenKg * 25 - nitrogenKg * 15) / (60 - 25));
      adviceText.textContent = `Votre tas est trop riche en azote. Il risque de se tasser et de dégager de mauvaises odeurs d'ammoniac. Ajoutez environ ${neededCarbon} kg de matières carbonées sèches (paille sèche, feuilles mortes ou copeaux de bois) pour l'équilibrer.`;
    } else {
      statusLabel.textContent = '🟤 EXCES DE CARBONE (Décomposition lente)';
      statusLabel.className = 'inline-block text-[10px] font-black text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20';
      const neededNitrogen = Math.round((carbonKg * 60 - carbonKg * 30) / (30 - 15));
      adviceText.textContent = `Votre tas est trop sec et carboné. La décomposition sera extrêmement lente par manque d'azote pour les bactéries. Ajoutez environ ${neededNitrogen} kg de matières azotées (fientes de poule, bouse de vache, herbe verte ou déchets de cuisine humides).`;
    }
  },

  setupListeners() {
    // CSV Export
    window.exportFinancesCSV = () => {
      const finances = KAStorage.getFinances();
      if (finances.length === 0) {
        alert("Aucune transaction à exporter !");
        return;
      }
      const headers = ["ID", "Description", "Type de Flux", "Rubrique", "Date", "Montant (FCFA)"];
      const rows = finances.map(f => [
        f.id,
        `"${f.description.replace(/"/g, '""')}"`,
        f.type,
        f.category,
        f.date,
        f.amount
      ]);
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ka_farm_bilan_financier_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // PDF Export via beautiful dynamic print overlay
    window.exportFinancesPDF = () => {
      const finances = KAStorage.getFinances();
      const { totalRevenu, totalDepense, solde } = KAStorage.getFinanceStats();
      const zone = localStorage.getItem('ka_farm_zone') || 'Dakar (Niayes)';
      const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

      // Create print style and print container
      const printAreaId = 'print-report-area';
      let printArea = document.getElementById(printAreaId);
      if (printArea) {
        printArea.remove();
      }

      printArea = document.createElement('div');
      printArea.id = printAreaId;
      printArea.className = 'hidden';
      
      // Build a premium-styled printable financial statement
      const transactionsHtml = finances.map(f => {
        const isRevenu = f.type === 'Revenu';
        const sign = isRevenu ? '+' : '-';
        const amountClass = isRevenu ? 'color: #10b981; font-weight: bold;' : 'color: #ef4444; font-weight: bold;';
        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 10px 0; text-align: left; font-weight: 600; color: #1e293b;">${f.description}</td>
            <td style="padding: 10px 0; text-align: left;"><span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; background: ${isRevenu ? '#ecfdf5' : '#fef2f2'}; color: ${isRevenu ? '#065f46' : '#991b1b'}; border: 1px solid ${isRevenu ? '#a7f3d0' : '#fca5a5'};">${f.type.toUpperCase()}</span></td>
            <td style="padding: 10px 0; text-align: left; color: #64748b;">${f.category}</td>
            <td style="padding: 10px 0; text-align: left; color: #64748b;">${f.date}</td>
            <td style="padding: 10px 0; text-align: right; font-family: monospace; ${amountClass}">${sign}${f.amount.toLocaleString('fr-FR')} F</td>
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
          }
        </style>
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #065f46; letter-spacing: -0.5px;">KA FARM SÉNÉGAL</h1>
              <p style="margin: 3px 0 0 0; font-size: 10px; text-transform: uppercase; font-weight: 850; color: #059669; letter-spacing: 1px;">Exploitation Maraîchère & Agro-écologique Familiale</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 8px; font-weight: 800; background: #ecfdf5; color: #047857; padding: 4px 8px; border-radius: 9999px; text-transform: uppercase;">Rapport d'Activité Officiel</span>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #64748b;">Généré le <strong>${today}</strong></p>
            </div>
          </div>

          <!-- Title -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #1e293b; text-transform: uppercase;">Bilan Financier d'Exploitation</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-style: italic;">Présenté pour dossiers de financement, coopératives horticoles et banques partenaires</p>
          </div>

          <!-- Metadata info Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-size: 11px;">
            <div class="report-card" style="border: 1px solid #cbd5e1;">
              <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 9px; color: #047857; letter-spacing: 0.5px;">Détails de l'Exploitation</h4>
              <p style="margin: 4px 0;">📍 <strong>Zone de culture :</strong> ${zone}</p>
              <p style="margin: 4px 0;">🔑 <strong>Exploitant Principal :</strong> Famille KA (Amadou Coumbaka)</p>
              <p style="margin: 4px 0;">🌍 <strong>Localisation :</strong> Sénégal (Niayes & Casamance)</p>
            </div>
            <div class="report-card" style="border: 1px solid #cbd5e1;">
              <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 9px; color: #047857; letter-spacing: 0.5px;">Statut Comptable</h4>
              <p style="margin: 4px 0;">📊 <strong>Type de compte :</strong> Trésorerie d'exploitation directe</p>
              <p style="margin: 4px 0;">💵 <strong>Devise de calcul :</strong> Franc CFA (XOF)</p>
              <p style="margin: 4px 0;">⚖️ <strong>Conformité :</strong> Modèle d'évaluation standard coopérative</p>
            </div>
          </div>

          <!-- Summary widgets -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px;">
            <div style="border: 1px solid #a7f3d0; background: #f0fdf4; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #047857; letter-spacing: 0.5px;">Total Revenus (Entrées)</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #059669; font-family: monospace;">+${totalRevenu.toLocaleString('fr-FR')} F</p>
            </div>
            <div style="border: 1px solid #fca5a5; background: #fef2f2; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #b91c1c; letter-spacing: 0.5px;">Total Dépenses (Sorties)</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #dc2626; font-family: monospace;">-${totalDepense.toLocaleString('fr-FR')} F</p>
            </div>
            <div style="border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #334155; letter-spacing: 0.5px;">Solde Net Trésorerie</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: ${solde >= 0 ? '#10b981' : '#dc2626'}; font-family: monospace;">${solde.toLocaleString('fr-FR')} F</p>
            </div>
          </div>

          <!-- Table -->
          <h3 style="font-size: 11px; text-transform: uppercase; color: #1e293b; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Grand Livre & Historique des Échanges</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; font-size: 10px; text-transform: uppercase; color: #64748b;">
                <th style="padding: 8px 0; text-align: left;">Désignation / Libellé</th>
                <th style="padding: 8px 0; text-align: left;">Type</th>
                <th style="padding: 8px 0; text-align: left;">Rubrique</th>
                <th style="padding: 8px 0; text-align: left;">Date</th>
                <th style="padding: 8px 0; text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${transactionsHtml || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">Aucune transaction comptabilisée</td></tr>'}
            </tbody>
          </table>

          <!-- Footer signatures -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; font-size: 10px;">
            <div style="text-align: left; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Pour l'Exploitation Agricole KA Farm</p>
              <p style="margin: 2px 0 35px 0; color: #64748b; font-style: italic;">Visa & Signature de l'exploitant</p>
              <p style="margin: 0; font-weight: 850; color: #0f172a;">Amadou Coumbaka</p>
            </div>
            <div style="text-align: right; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Pour la Coopérative / Institution Partenaire</p>
              <p style="margin: 2px 0 35px 0; color: #64748b; font-style: italic;">Mention "Reçu et certifié conforme"</p>
              <div style="display: inline-block; border: 1px solid #10b981; color: #10b981; padding: 4px 8px; border-radius: 4px; font-weight: 900; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">KA FARM VERIFIED</div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(printArea);

      // Trigger standard print
      setTimeout(() => {
        window.print();
        // Cleanup after print dialog completes
        setTimeout(() => {
          printArea.remove();
        }, 1000);
      }, 300);
    };

    // Delete finance item
    window.deleteFinance = (id) => {
      if (!confirm('Voulez-vous supprimer cette ligne de comptabilité ?')) return;
      const finances = KAStorage.getFinances().filter(f => f.id !== id);
      KAStorage.saveFinances(finances);
      this.renderFinances();
    };

    // Form submit
    const form = document.getElementById('shared-finance-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const desc = document.getElementById('form-fin-desc').value;
        const type = document.getElementById('form-fin-type').value;
        const cat = document.getElementById('form-fin-cat').value;
        const amt = parseFloat(document.getElementById('form-fin-amount').value);
        const date = document.getElementById('form-fin-date').value;

        if (!desc || !amt || !date) return;

        const finances = KAStorage.getFinances();
        finances.unshift({
          id: `F-${Date.now()}`,
          description: desc,
          type: type,
          category: cat,
          amount: amt,
          date: date
        });

        KAStorage.saveFinances(finances);
        this.renderFinances();
        form.reset();
        
        // Reset date
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('form-fin-date').value = todayStr;

        document.getElementById('finance-modal').classList.add('hidden');
        alert('Flux de trésorerie enregistré avec succès !');
      });
    }

    // Live listening to compost calculator inputs
    const carbonInput = document.getElementById('compost-carbon-input');
    const nitrogenInput = document.getElementById('compost-nitrogen-input');
    
    if (carbonInput && nitrogenInput) {
      const calcFn = () => this.calculateCompost();
      carbonInput.addEventListener('input', calcFn);
      nitrogenInput.addEventListener('input', calcFn);
    }
  },

  initMarketSimulator() {
    window.updateMarketCalculations = () => this.updateMarketCalculations();
    window.setSimSelectedMarket = (marketId) => {
      this.selectedMarket = marketId;
      this.updateMarketCalculations();
    };

    this.updateMarketCalculations();
  },

  renderMarkets() {
    const grid = document.getElementById('markets-comparison-grid');
    if (!grid) return;

    const cropKey = document.getElementById('market-crop-select').value || 'tomate';
    const cropPrices = this.marketsData[cropKey];

    const marketNames = {
      sandiara: 'Sandiara',
      mbour: 'Mbour',
      dakar: 'Dakar (Samba)',
      'saint-louis': 'St-Louis'
    };

    grid.innerHTML = Object.entries(cropPrices).map(([marketId, price]) => {
      const isSelected = marketId === this.selectedMarket;
      const borderClass = isSelected 
        ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 shadow-sm scale-[1.01]' 
        : 'border-slate-100 dark:border-[#143E23]/20 bg-slate-50/50 dark:bg-[#061109]/30 hover:border-[#143E23]/50';

      const checkBadge = isSelected
        ? '<span class="absolute top-2.5 right-2.5 flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>'
        : '';

      return `
        <div onclick="window.setSimSelectedMarket('${marketId}')" class="relative cursor-pointer border rounded-2xl p-3.5 transition-all flex flex-col justify-between text-left space-y-1.5 ${borderClass}">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">${marketNames[marketId]}</span>
            ${checkBadge}
          </div>
          <p class="text-base font-black text-slate-800 dark:text-white font-mono">${price} F <span class="text-[9px] font-bold text-slate-400">/ kg</span></p>
        </div>
      `;
    }).join('');
  },

  updateMarketCalculations() {
    const seeds = parseFloat(document.getElementById('cost-seeds').value) || 0;
    const fertilizers = parseFloat(document.getElementById('cost-fertilizers').value) || 0;
    const fuel = parseFloat(document.getElementById('cost-fuel').value) || 0;
    const labor = parseFloat(document.getElementById('cost-labor').value) || 0;
    const others = parseFloat(document.getElementById('cost-others').value) || 0;
    const qty = parseFloat(document.getElementById('param-yield').value) || 500;

    // Update yield display
    const yieldDisplay = document.getElementById('yield-display');
    if (yieldDisplay) yieldDisplay.textContent = `${qty} kg`;

    const totalCost = seeds + fertilizers + fuel + labor + others;
    const costPerKg = qty > 0 ? Math.round(totalCost / qty) : 0;

    // Current price from selected market and crop
    const cropKey = document.getElementById('market-crop-select').value || 'tomate';
    const currentPrice = this.marketsData[cropKey][this.selectedMarket];

    const totalRevenue = qty * currentPrice;
    const netProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

    // Update fields
    const elCost = document.getElementById('calc-total-cost');
    const elPerKg = document.getElementById('calc-cost-per-kg');
    const elProfit = document.getElementById('calc-net-profit');
    const elRoi = document.getElementById('calc-roi');

    if (elCost) elCost.textContent = `${totalCost.toLocaleString('fr-FR')} F`;
    if (elPerKg) elPerKg.textContent = `${costPerKg.toLocaleString('fr-FR')} F / kg`;
    
    if (elProfit) {
      elProfit.textContent = (netProfit >= 0 ? '+' : '') + `${netProfit.toLocaleString('fr-FR')} F`;
      elProfit.className = netProfit >= 0 
        ? 'text-lg font-black text-emerald-500 font-mono' 
        : 'text-lg font-black text-rose-500 font-mono';
    }

    if (elRoi) {
      elRoi.textContent = `ROI: ${roi >= 0 ? '+' : ''}${roi}%`;
      elRoi.className = roi >= 0
        ? 'text-[9px] text-emerald-500 font-extrabold uppercase'
        : 'text-[9px] text-rose-500 font-extrabold uppercase';
    }

    // Advice box update
    const adviceTitle = document.getElementById('profit-advice-title');
    const adviceDesc = document.getElementById('profit-advice-desc');
    const adviceIcon = document.getElementById('profit-indicator-icon');

    if (adviceTitle && adviceDesc && adviceIcon) {
      if (netProfit < 0) {
        adviceTitle.textContent = "Risque de Perte (Rentabilité Critique)";
        adviceTitle.className = "text-xs font-extrabold text-rose-500";
        adviceDesc.textContent = `Le prix de revient au kg (${costPerKg} F) est supérieur au prix du marché (${currentPrice} F). Réduisez vos coûts d'engrais/carburant ou ciblez un marché plus rémunérateur comme Dakar.`;
        adviceIcon.className = "p-2 bg-rose-500/10 text-rose-500 rounded-lg";
        adviceIcon.innerHTML = `<i data-lucide="alert-triangle" class="h-5 w-5"></i>`;
      } else if (roi < 20) {
        adviceTitle.textContent = "Marge Faible (Seuil de Vigilance)";
        adviceTitle.className = "text-xs font-extrabold text-amber-500";
        adviceDesc.textContent = `Marge fragile de ${roi}%. Pour améliorer la rentabilité, tentez de vendre en direct sans co-intermédiaires, ou stockez les légumes quelques jours si les cours remontent.`;
        adviceIcon.className = "p-2 bg-amber-500/10 text-amber-500 rounded-lg";
        adviceIcon.innerHTML = `<i data-lucide="help-circle" class="h-5 w-5"></i>`;
      } else {
        adviceTitle.textContent = "Rentabilité Excellente (Marge Forte)";
        adviceTitle.className = "text-xs font-extrabold text-emerald-500";
        adviceDesc.textContent = `Excellent profit prévisionnel de +${roi}% avec un prix de vente à ${currentPrice} F/kg. Ce cycle s'annonce très viable, vous pouvez planifier de nouvelles parcelles !`;
        adviceIcon.className = "p-2 bg-emerald-500/10 text-emerald-500 rounded-lg";
        adviceIcon.innerHTML = `<i data-lucide="check-circle" class="h-5 w-5"></i>`;
      }
    }

    this.renderMarkets();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
};

// Start finances module
document.addEventListener('DOMContentLoaded', () => {
  FinancesModule.init();
});
