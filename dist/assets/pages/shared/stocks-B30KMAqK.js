import"../../modulepreload-polyfill-B5Qt9EMX.js";import"../../auth-client-BIZ63hJO.js";import"../../router-BlLxvn42.js";import"../../app-DhSchYKj.js";import{K as w}from"../../storage-C1IPJf-V.js";import"../../user-manager-ficPWetn.js";const C={isOfflineSimulated:localStorage.getItem("ka_stocks_offline_simulated")==="true",async init(){this.updateNetworkBadge(),await this.refreshStocksFromServer();const o=new URLSearchParams(window.location.search).get("search");if(o){const l=document.getElementById("stock-search-input");l&&(l.value=o,this.renderStocks())}this.setupListeners(),window.addEventListener("online",()=>this.handleNetworkChange()),window.addEventListener("offline",()=>this.handleNetworkChange())},async handleNetworkChange(){this.updateNetworkBadge(),await this.refreshStocksFromServer(),navigator.onLine&&!this.isOfflineSimulated&&await this.syncOfflineChanges()},updateNetworkBadge(){const s=document.getElementById("network-status-badge"),o=document.getElementById("network-status-dot"),l=document.getElementById("network-status-text"),i=document.getElementById("toggle-offline-btn"),t=document.getElementById("offline-toggle-text"),n=document.getElementById("offline-toggle-icon"),c=this.isOfflineSimulated||!navigator.onLine;s&&o&&l&&(c?(s.className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1.5 transition-all",o.className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse",l.textContent=navigator.onLine?"Simulé Hors-Ligne (Mode Cache)":"Hors-Ligne (Données du Cache)"):(s.className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1.5 transition-all",o.className="h-1.5 w-1.5 bg-emerald-500 rounded-full",l.textContent="En Ligne & Synchronisé")),i&&t&&n&&(this.isOfflineSimulated?(t.textContent="Passer En-ligne",n.setAttribute("data-lucide","wifi-off"),n.className="h-3.5 w-3.5 text-amber-500",i.className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"):(t.textContent="Simuler Hors-ligne",n.setAttribute("data-lucide","wifi"),n.className="h-3.5 w-3.5 text-emerald-500 animate-pulse",i.className="px-3 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#1A4525] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"),window.lucide&&window.lucide.createIcons())},async refreshStocksFromServer(){if(this.isOfflineSimulated||!navigator.onLine){console.log("Stocks Module: simulated or real offline mode. Displaying from cache."),this.renderStocks();return}try{const o=await fetch("/api/stocks");if(!o.ok)throw new Error("Erreur de serveur");const l=await o.json();w.saveStocks(l),this.renderStocks()}catch(o){console.warn("Stocks Module: Failed to fetch from API, falling back to cache.",o),this.renderStocks()}},async saveAndSyncStocks(s){if(w.saveStocks(s),this.renderStocks(),this.isOfflineSimulated||!navigator.onLine){localStorage.setItem("ka_stocks_pending_sync","true"),this.showToast("Sauvegardé en cache (Sera synchronisé une fois en ligne)","warning");return}try{if(!(await fetch("/api/stocks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stocks:s})})).ok)throw new Error("Sync failed");localStorage.removeItem("ka_stocks_pending_sync"),this.showToast("Modifications synchronisées avec succès !","success")}catch(l){console.error("Stocks Module: Sync failed, saved in local cache.",l),localStorage.setItem("ka_stocks_pending_sync","true"),this.showToast("Sauvegardé localement (Erreur de synchronisation)","warning")}},async syncOfflineChanges(){if(localStorage.getItem("ka_stocks_pending_sync")==="true"){const s=w.getStocks();try{(await fetch("/api/stocks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stocks:s})})).ok&&(localStorage.removeItem("ka_stocks_pending_sync"),this.showToast("🔄 Modifications hors-ligne synchronisées avec le serveur !","success"))}catch(o){console.error("Auto-sync failed:",o)}}},showToast(s,o="success"){const l="stocks-toast";let i=document.getElementById(l);i||(i=document.createElement("div"),i.id=l,document.body.appendChild(i)),o==="success"?i.className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 max-w-sm transition-all duration-300 transform bg-emerald-500 text-white border border-emerald-400 opacity-100 translate-y-0":o==="warning"?i.className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 max-w-sm transition-all duration-300 transform bg-amber-500 text-white border border-amber-400 opacity-100 translate-y-0 animate-bounce":i.className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 max-w-sm transition-all duration-300 transform bg-slate-800 text-white border border-slate-700 opacity-100 translate-y-0",i.innerHTML=`
      <i class="h-4 w-4 flex-shrink-0" data-lucide="${o==="success"?"check-circle":"alert-triangle"}"></i>
      <span>${s}</span>
    `,window.lucide&&window.lucide.createIcons(),setTimeout(()=>{i.className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 max-w-sm transition-all duration-300 transform bg-slate-800 text-white border border-slate-700 opacity-0 translate-y-20 pointer-events-none"},4e3)},renderStocks(){var v,m;const s=document.getElementById("stocks-container");if(!s)return;const o=w.getStocks(),l=(((v=document.getElementById("stock-search-input"))==null?void 0:v.value)||"").toLowerCase().trim(),i=((m=document.getElementById("stock-category-filter"))==null?void 0:m.value)||"all",t=document.getElementById("stocks-total-count"),n=document.getElementById("stocks-alert-count"),c=document.getElementById("stocks-average-percent"),r=o.filter(d=>{const h=d.name.toLowerCase().includes(l),y=i==="all"||d.category===i;return h&&y}),u=o.length,e=o.filter(d=>d.quantity<=d.maxQuantity*.2).length;let a=0;o.forEach(d=>{const h=d.maxQuantity>0?d.quantity/d.maxQuantity*100:0;a+=Math.min(100,Math.max(0,h))});const g=u>0?Math.round(a/u):0;if(t&&(window.animateValue?window.animateValue(t,0,u,700):t.textContent=u),n&&(window.animateValue?window.animateValue(n,0,e,700):n.textContent=e,e>0?n.className="text-2xl font-black text-rose-500 mt-1 font-mono":n.className="text-2xl font-black text-emerald-500 mt-1 font-mono"),c&&(window.animateValue?window.animateValue(c,0,g,800):c.textContent=`${g}%`),r.length===0){s.innerHTML=`
        <div class="p-10 text-center bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl text-slate-450 dark:text-slate-500">
          <p class="text-sm font-bold">Aucun intrant ne correspond à votre recherche.</p>
          <p class="text-xs text-slate-400 mt-1">Modifiez vos filtres ou ajoutez un produit.</p>
        </div>
      `;return}const x=r.reduce((d,h)=>{const y=h.category||"Autres";return d[y]||(d[y]=[]),d[y].push(h),d},{});s.innerHTML=Object.entries(x).map(([d,h])=>{const y=h.map(f=>{const b=f.maxQuantity>0?Math.round(f.quantity/f.maxQuantity*100):0;let k="#10b981";b<=20?k="#ef4444":b<=50&&(k="#f59e0b");const I=f.unit.toLowerCase()==="kg"||f.unit.toLowerCase()==="sacs",E=f.unit.toLowerCase()==="l"||f.unit.toLowerCase()==="litres";let S="";return I?S=`
            <svg viewBox="0 0 80 100" class="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="grad-${f.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="${k}" stop-opacity="0.5" />
                  <stop offset="${100-b}%" stop-color="${k}" stop-opacity="0.5" />
                  <stop offset="${100-b}%" stop-color="#475569" stop-opacity="0.1" />
                  <stop offset="100%" stop-color="#475569" stop-opacity="0.1" />
                </linearGradient>
              </defs>
              <path d="M10 100 C 10 90, 0 90, 0 80 L 0 20 C 0 0, 10 0, 20 0 L 60 0 C 70 0, 80 0, 80 20 L 80 80 C 80 90, 70 90, 70 100 Z" fill="url(#grad-${f.id})" stroke="#475569" stroke-width="1.5"/>
              <path d="M20 12 L 60 12" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
            </svg>
          `:E?S=`
            <svg viewBox="0 0 60 100" class="w-full h-full drop-shadow-md">
               <defs>
                <linearGradient id="grad-${f.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="${100-b}%" stop-color="#374151" stop-opacity="0.1" />
                  <stop offset="${100-b}%" stop-color="${k}" stop-opacity="0.6" />
                  <stop offset="100%" stop-color="${k}" stop-opacity="0.6" />
                </linearGradient>
              </defs>
              <rect x="5" y="15" width="50" height="85" rx="10" fill="url(#grad-${f.id})" stroke="#475569" stroke-width="1.5"/>
              <rect x="15" y="0" width="30" height="15" rx="3" fill="#374151" stroke="#475569" stroke-width="1.5"/>
            </svg>
          `:S=`
            <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-md">
              <rect x="5" y="5" width="90" height="90" rx="5" fill="${k}" stroke="#475569" stroke-width="1.5"/>
            </svg>
          `,`
          <div class="flex flex-col items-center gap-2 group cursor-pointer" onclick="window.openAdjustModal('${f.id}', '${f.name.replace(/'/g,"\\'")}', ${f.quantity}, '${f.unit}')">
            <div class="w-16 h-20 relative">
              ${S}
            </div>
            <div class="text-center">
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 transition-colors truncate w-24">${f.name}</p>
              <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400">${f.quantity.toLocaleString("fr-FR")} ${f.unit}</p>
            </div>
          </div>
        `}).join("");return`
        <div class="space-y-4">
          <h3 class="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-2 border-b-2 border-slate-100 dark:border-slate-800">${d}</h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-4 gap-y-6">
            ${y}
          </div>
        </div>
      `}).join(""),window.lucide&&window.lucide.createIcons()},renderStockUsageHistory(s){const o=document.getElementById("stock-usage-history");if(!o)return;const i=w.getTreatments().filter(t=>(t.productName||t.product_name||"").toLowerCase()===s.toLowerCase()).sort((t,n)=>new Date(n.dateApplied||n.date_applied)-new Date(t.dateApplied||t.date_applied));if(i.length===0){o.innerHTML=`
        <div class="p-3 text-center bg-slate-50 dark:bg-[#0D2615]/20 rounded-lg">
          <p class="text-xs text-slate-400 font-semibold">Aucune utilisation enregistrée dans le carnet phytosanitaire.</p>
        </div>
      `;return}o.innerHTML=i.map(t=>{const n=t.quantityUsed||"N/A",c=t.unit||"",r=t.dateApplied||t.date_applied;return`
        <div class="p-2.5 bg-slate-50 dark:bg-[#0D2615]/20 rounded-lg border border-slate-100 dark:border-[#143E23]/30">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-300">${t.parcelName||t.parcel_name||"Parcelle inconnue"}</span>
            <span class="font-mono font-bold text-rose-500">-${n} ${c}</span>
          </div>
          <p class="text-[9px] text-slate-400 font-semibold mt-0.5">${new Date(r).toLocaleDateString("fr-FR")} - Cible: ${t.target||"Non spécifié"}</p>
        </div>
      `}).join("")},setupListeners(){window.toggleOfflineSimulation=async()=>{this.isOfflineSimulated=!this.isOfflineSimulated,localStorage.setItem("ka_stocks_offline_simulated",this.isOfflineSimulated),this.updateNetworkBadge(),this.isOfflineSimulated||!navigator.onLine?this.showToast("Mode Hors-ligne activé (Simulé). Les données de stock sont lues depuis le cache local.","warning"):(this.showToast("Mode En-ligne réactivé. Synchronisation et mise à jour en cours...","success"),await this.syncOfflineChanges()),await this.refreshStocksFromServer()},window.exportStocksCSV=()=>{const t=w.getStocks();if(t.length===0){alert("Aucun produit enregistré en stock !");return}const n=["ID","Nom de l'Intrant","Catégorie","Quantité Actuelle","Capacité Max","Unité de Mesure","Taux de Remplissage (%)"],c=t.map(a=>{const g=a.maxQuantity>0?Math.round(a.quantity/a.maxQuantity*100):0;return[a.id,`"${a.name.replace(/"/g,'""')}"`,a.category,a.quantity,a.maxQuantity,a.unit,g]}),r="\uFEFF"+[n.join(","),...c.map(a=>a.join(","))].join(`
`),u=new Blob([r],{type:"text/csv;charset=utf-8;"}),p=URL.createObjectURL(u),e=document.createElement("a");e.setAttribute("href",p),e.setAttribute("download",`ka_farm_reserve_stocks_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(e),e.click(),document.body.removeChild(e)},window.exportStocksPDF=()=>{const t=w.getStocks();if(t.length===0){alert("Aucun produit enregistré en stock !");return}const n=localStorage.getItem("ka_farm_zone")||"Dakar (Sénégal)",c=new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}),r=t.length,p=t.filter(m=>m.quantity<=m.maxQuantity*.2).length;let e=0;t.forEach(m=>{const d=m.maxQuantity>0?m.quantity/m.maxQuantity*100:0;e+=Math.min(100,Math.max(0,d))});const a=r>0?Math.round(e/r):0,g="print-report-area";let x=document.getElementById(g);x&&x.remove(),x=document.createElement("div"),x.id=g,x.className="hidden";const v=t.map(m=>{const d=m.maxQuantity>0?Math.round(m.quantity/m.maxQuantity*100):0;let h="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;",y="OPTIMAL";return d<=20?(h="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;",y="ALERTE BAS"):d<=50&&(h="background: #fffbeb; color: #92400e; border: 1px solid #fde68a;",y="MOYEN"),`
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 10px 0; text-align: left; font-weight: 600; color: #1e293b;">📦 ${m.name}</td>
            <td style="padding: 10px 0; text-align: left; color: #64748b;">${m.category}</td>
            <td style="padding: 10px 0; text-align: left; font-family: monospace; font-weight: bold; color: #334155;">
              ${m.quantity.toLocaleString("fr-FR")} / ${m.maxQuantity.toLocaleString("fr-FR")} ${m.unit}
            </td>
            <td style="padding: 10px 0; text-align: left; font-family: monospace; font-weight: bold; color: #059669;">
              ${d}%
            </td>
            <td style="padding: 10px 0; text-align: right;">
              <span style="padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; ${h}">${y}</span>
            </td>
          </tr>
        `}).join("");x.innerHTML=`
        <style>
          @media print {
            body > *:not(#${g}) {
              display: none !important;
            }
            #${g} {
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
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #64748b;">Généré le <strong>${c}</strong></p>
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
              <p style="margin: 4px 0;">📍 <strong>Zone d'activité :</strong> ${n}</p>
              <p style="margin: 4px 0;">🔑 <strong>Supervision :</strong> Famille KA (Moussa, Aly & Amadou)</p>
              <p style="margin: 4px 0;">🌱 <strong>Type de traitement :</strong> Intrants certifiés 100% bio & écologiques</p>
            </div>
            <div class="report-card" style="border: 1px solid #cbd5e1; background: #f8fafc;">
              <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 9px; color: #047857; letter-spacing: 0.5px;">Contrôle des Seuils</h4>
              <p style="margin: 4px 0;">🚨 <strong>Alertes de rupture (&lt;20%) :</strong> <strong style="color: ${p>0?"#dc2626":"#10b981"}; font-weight: bold;">${p} produit(s)</strong></p>
              <p style="margin: 4px 0;">📈 <strong>Capacité de réserve globale occupée :</strong> <strong>${a}%</strong></p>
            </div>
          </div>

          <!-- Summary cards -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px;">
            <div style="border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #475569; letter-spacing: 0.5px;">Intrants Total</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #1e293b; font-family: monospace;">${r}</p>
            </div>
            <div style="border: 1px solid ${p>0?"#fca5a5":"#a7f3d0"}; background: ${p>0?"#fef2f2":"#f0fdf4"}; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: ${p>0?"#b91c1c":"#047857"}; letter-spacing: 0.5px;">Alertes Rupture</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: ${p>0?"#dc2626":"#059669"}; font-family: monospace;">${p}</p>
            </div>
            <div style="border: 1px solid #a7f3d0; background: #f0fdf4; border-radius: 12px; padding: 12px; text-align: left;">
              <span style="font-size: 8px; text-transform: uppercase; font-weight: bold; color: #047857; letter-spacing: 0.5px;">Remplissage Moyen</span>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #059669; font-family: monospace;">${a}%</p>
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
              ${v||'<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">Aucun produit enregistré</td></tr>'}
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
      `,document.body.appendChild(x),setTimeout(()=>{window.print(),setTimeout(()=>{x.remove()},1e3)},300)};const s=document.getElementById("stock-search-input"),o=document.getElementById("stock-category-filter");s&&s.addEventListener("input",()=>this.renderStocks()),o&&o.addEventListener("change",()=>this.renderStocks());const l=document.getElementById("new-stock-form");l&&l.addEventListener("submit",t=>{t.preventDefault();const n=document.getElementById("new-stock-name").value,c=document.getElementById("new-stock-cat").value,r=document.getElementById("new-stock-unit").value,u=parseFloat(document.getElementById("new-stock-qty").value),p=parseFloat(document.getElementById("new-stock-max").value);if(!n||isNaN(u)||isNaN(p))return;const e=w.getStocks();e.push({id:`S-${Date.now()}`,name:n,category:c,quantity:u,maxQuantity:p,unit:r}),this.saveAndSyncStocks(e),l.reset(),document.getElementById("add-stock-modal").classList.add("hidden"),window.App&&typeof window.App.updateBadges=="function"&&window.App.updateBadges(),alert("Nouvel intrant enregistré avec succès !")}),window.openAdjustModal=(t,n,c,r)=>{const u=document.getElementById("adjust-stock-modal"),p=document.getElementById("adjust-item-id"),e=document.getElementById("adjust-item-name"),a=document.getElementById("adjust-item-current"),g=document.getElementById("adjust-unit-display");!u||!p||!e||!a||!g||(p.value=t,e.textContent=n,a.textContent=`Niveau de stock actuel : ${c.toLocaleString("fr-FR")} ${r}`,g.textContent=r,document.getElementById("adjust-amount").value="",document.getElementById("adjust-note").value="",document.getElementById("adjust-op-type").value="add",u.classList.remove("hidden"),this.renderStockUsageHistory(n))};const i=document.getElementById("adjust-stock-form");i&&i.addEventListener("submit",t=>{t.preventDefault();const n=document.getElementById("adjust-item-id").value,c=document.getElementById("adjust-op-type").value,r=parseFloat(document.getElementById("adjust-amount").value);if(document.getElementById("adjust-note").value,!n||isNaN(r)||r<=0)return;const u=w.getStocks(),p=u.findIndex(x=>x.id===n);if(p===-1)return;const e=u[p],a=c==="add";if(!a&&e.quantity<r){alert(`Erreur : Vous essayez de prélever ${r} ${e.unit}, mais il ne reste que ${e.quantity} ${e.unit} en stock !`);return}const g=e.quantity;a?(e.quantity+=r,e.quantity>e.maxQuantity&&(e.maxQuantity=e.quantity)):e.quantity=Math.max(0,e.quantity-r),this.saveAndSyncStocks(u),document.getElementById("adjust-stock-modal").classList.add("hidden"),window.App&&typeof window.App.updateBadges=="function"&&window.App.updateBadges(),alert(`Quantité de "${e.name}" mise à jour avec succès (${g} → ${e.quantity} ${e.unit}).`)}),window.deleteStockItem=t=>{if(!confirm("Voulez-vous vraiment supprimer cet intrant de la base de données ?"))return;const n=w.getStocks().filter(c=>c.id!==t);this.saveAndSyncStocks(n),window.App&&typeof window.App.updateBadges=="function"&&window.App.updateBadges()}}};document.addEventListener("DOMContentLoaded",()=>{C.init()});document.addEventListener("ka_data_updated",s=>{s.detail&&s.detail.key==="ka_farm_stocks"&&C.init()});
