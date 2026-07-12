import"../../modulepreload-polyfill-B5Qt9EMX.js";import"../../auth-client-BIZ63hJO.js";import"../../router-BlLxvn42.js";import"../../app-DhSchYKj.js";import{K as v}from"../../storage-C1IPJf-V.js";import"../../user-manager-ficPWetn.js";let s=[],C=[],b=null;const k={Tomate:{emoji:"🍅",color:"emerald"},Oignon:{emoji:"🧅",color:"amber"},Piment:{emoji:"🌶️",color:"rose"},Gombo:{emoji:"🥬",color:"green"},Aubergine:{emoji:"🍆",color:"purple"},Chou:{emoji:"🥬",color:"teal"},Poivron:{emoji:"🌶️",color:"orange"},Laitue:{emoji:"🥬",color:"lime"},Menthe:{emoji:"🌿",color:"cyan"}},F=["#059669","#10b981","#34d399","#6ee7b7","#a7f3d0","#fbbf24","#f59e0b","#d97706","#92400e","#78350f","#ef4444","#f87171","#dc2626","#b91c1c","#991b1b","#8b5cf6","#a855f7","#9333ea","#7e22ce","#6b21a8"],x={init(){s=v.getCropProfits(),C=v.getParcelles(),this.render(),this.setupListeners(),this.loadParcels(),this.initChart()},loadParcels(){const a=document.getElementById("form-profit-parcel");a&&(a.innerHTML='<option value="">-- Sélectionner une parcelle --</option>',C.forEach(e=>{const t=document.createElement("option");t.value=e.id,t.textContent=e.name,a.appendChild(t)}))},render(){this.renderStats(),this.renderTable(),this.renderTopCrops(),this.updateChart()},renderStats(){var g,u;const a=s.length,e=s.reduce((c,p)=>c+(p.netMargin||0),0),t=s.reduce((c,p)=>c+(p.yieldKg||0),0),o=[...s].sort((c,p)=>(p.netMargin||0)-(c.netMargin||0)),n=o[0],r=o.length>0?o[o.length-1]:null,l=document.getElementById("stat-total-crops"),i=document.getElementById("stat-total-margin"),m=document.getElementById("stat-best-crop"),d=document.getElementById("stat-worst-crop"),f=document.getElementById("stat-total-yield");l&&(l.textContent=a),i&&(i.textContent=`${e.toLocaleString("fr-FR")} F`),f&&(f.textContent=`${t.toLocaleString("fr-FR")} kg`),m&&(m.textContent=n?`${((g=k[n.cropName])==null?void 0:g.emoji)||"🌱"} ${n.cropName}`:"Aucune"),d&&(d.textContent=r?`${((u=k[r.cropName])==null?void 0:u.emoji)||"🌱"} ${r.cropName}`:"Aucune",r&&(r.netMargin||0)<0&&(d.className="text-lg font-black text-rose-500 font-mono"))},renderTable(){const a=document.getElementById("profitability-table-body");if(!a)return;if(s.length===0){a.innerHTML=`
        <tr>
          <td colspan="7" class="px-4 py-8 text-center text-slate-400">
            <p class="text-xs font-bold">Aucune analyse de rentabilité enregistrée.</p>
            <p class="text-[10px] mt-1">Commencez par ajouter une analyse via le bouton ci-dessus.</p>
          </td>
        </tr>
      `;return}const e=[...s].sort((t,o)=>(o.netMargin||0)-(t.netMargin||0));a.innerHTML=e.map((t,o)=>{const n=k[t.cropName]||{emoji:"🌱"},r=(t.netMargin||0)>=0,l=(t.netMargin||0)<0;return`
        <tr 
          class="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0D2615]/25 transition-all border-b border-slate-100 dark:border-[#143E23]/20"
          onclick="window.showProfitDetail('${t.id}')"
        >
          <td class="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
            ${n.emoji} ${t.cropName}
            ${t.parcelName?`<span class="block text-[9px] text-[#819888] font-medium">${t.parcelName}</span>`:""}
          </td>
          <td class="px-4 py-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">${(t.yieldKg||0).toLocaleString("fr-FR")}</td>
          <td class="px-4 py-3.5 font-mono font-bold text-emerald-500">${(t.revenue||0).toLocaleString("fr-FR")}</td>
          <td class="px-4 py-3.5 font-mono font-bold text-rose-500">${(t.totalCost||0).toLocaleString("fr-FR")}</td>
          <td class="px-4 py-3.5 font-mono font-bold ${r?"text-emerald-500":"text-rose-500"}">
            ${r?"+":""}${Math.round(t.netMargin||0).toLocaleString("fr-FR")}
          </td>
          <td class="px-4 py-3.5 font-mono font-bold ${l?"text-rose-500":"text-emerald-500"}">
            ${(t.profitabilityPercent||0).toFixed(1)}%
          </td>
          <td class="px-4 py-3.5 text-center">
            <div class="inline-flex items-center gap-1" onclick="event.stopPropagation()">
              <button onclick="window.showProfitDetail('${t.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                <i data-lucide="eye" class="h-3.5 w-3.5"></i>
              </button>
              <button onclick="window.editProfit('${t.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all cursor-pointer">
                <i data-lucide="edit-2" class="h-3.5 w-3.5"></i>
              </button>
              <button onclick="window.deleteProfit('${t.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
                <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `}).join(""),window.lucide&&window.lucide.createIcons()},renderTopCrops(){const a=document.getElementById("top-crops-list");if(!a)return;const t=[...s].sort((o,n)=>(n.netMargin||0)-(o.netMargin||0)).slice(0,5);if(t.length===0){a.innerHTML='<p class="text-[11px] text-slate-400 text-center py-4">Aucune donnée disponible</p>';return}a.innerHTML=t.map((o,n)=>{const r=k[o.cropName]||{emoji:"🌱"},l=o.netMargin>0?(o.netMargin/(o.totalCost||1)*100).toFixed(1):0;return`
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
          <div class="flex justify-between items-start gap-3">
            <div class="flex items-center gap-3">
              <span class="text-xl">${r.emoji}</span>
              <div>
                <p class="text-sm font-black text-slate-800 dark:text-white">#${n+1} ${o.cropName}</p>
                <p class="text-[10px] text-[#819888] mt-0.5">Marge: ${(o.netMargin||0).toLocaleString("fr-FR")} F</p>
              </div>
            </div>
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              ${l}%
            </span>
          </div>
        </div>
      `}).join("")},initChart(){const a=document.getElementById("profitability-chart");if(!a)return;b&&b.destroy();const e=s.map(n=>n.cropName),t=s.map(n=>n.netMargin||0),o=s.map((n,r)=>F[r%F.length]);b=new Chart(a,{type:"doughnut",data:{labels:e,datasets:[{data:t,backgroundColor:o,borderWidth:0,hoverOffset:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:function(n){const r=n.label||"",l=n.raw||0,i=n.dataset.data.reduce((d,f)=>d+f,0),m=i>0?(l/i*100).toFixed(1):0;return`${r}: ${l.toLocaleString("fr-FR")} F (${m}%)`}}}},cutout:"60%"}})},updateChart(){if(!b){this.initChart();return}const a=s.map(o=>o.cropName),e=s.map(o=>o.netMargin||0),t=s.map((o,n)=>F[n%F.length]);b.data.labels=a,b.data.datasets[0].data=e,b.data.datasets[0].backgroundColor=t,b.update()},setupListeners(){const a=document.getElementById("profitability-search");a&&a.addEventListener("input",t=>{this.filterProfits(t.target.value)}),["form-profit-yield","form-profit-price","form-profit-seeds","form-profit-fertilizer","form-profit-water","form-profit-labor"].forEach(t=>{const o=document.getElementById(t);o&&o.addEventListener("input",()=>this.calculateFormValues())})},filterProfits(a){this.render()},calculateFormValues(){const a=document.getElementById("form-profit-yield"),e=document.getElementById("form-profit-price"),t=document.getElementById("form-profit-seeds"),o=document.getElementById("form-profit-fertilizer"),n=document.getElementById("form-profit-water"),r=document.getElementById("form-profit-labor"),l=parseFloat((a==null?void 0:a.value)||0),i=parseFloat((e==null?void 0:e.value)||0),m=parseFloat((t==null?void 0:t.value)||0),d=parseFloat((o==null?void 0:o.value)||0),f=parseFloat((n==null?void 0:n.value)||0),g=parseFloat((r==null?void 0:r.value)||0),u=l*i,c=m+d+f+g,p=u-c,I=c>0?p/c*100:0,w=document.getElementById("calc-revenue"),h=document.getElementById("calc-cost"),y=document.getElementById("calc-margin"),E=document.getElementById("calc-profitability");w&&(w.textContent=`${Math.round(u).toLocaleString("fr-FR")} F`),h&&(h.textContent=`${Math.round(c).toLocaleString("fr-FR")} F`),y&&(y.textContent=`${Math.round(p).toLocaleString("fr-FR")} F`,y.className=`text-lg font-black ${p>=0?"text-emerald-500":"text-rose-500"} font-mono`),E&&(E.textContent=`${I.toFixed(1)}%`,E.className=`text-lg font-black ${I>=0?"text-emerald-500":"text-rose-500"} font-mono`)},calculateProfitabilityData(a,e,t,o){const n=e*t,r=Object.values(o).reduce((m,d)=>m+(parseFloat(d)||0),0),l=n-r,i=r>0?l/r*100:0;return{revenue:n,totalCost:r,netMargin:l,profitabilityPercent:i}}};window.openAddProfitModal=()=>{const a=document.getElementById("add-profit-modal");if(a){a.classList.remove("hidden");const e=new Date().toISOString().split("T")[0];document.getElementById("form-profit-period").value=e,document.getElementById("add-profit-form").reset(),document.getElementById("form-profit-id").value="",["calc-revenue","calc-cost","calc-margin","calc-profitability"].forEach(o=>{const n=document.getElementById(o);n&&(n.textContent="0 F",n.className=n.className.replace(/text-(emerald|rose)-500/,"text-slate-800 dark:text-white"))}),x.loadParcels()}};window.closeAddProfitModal=()=>{const a=document.getElementById("add-profit-modal");a&&a.classList.add("hidden")};window.submitAddProfit=a=>{a.preventDefault();const e=document.getElementById("form-profit-crop"),t=document.getElementById("form-profit-parcel"),o=document.getElementById("form-profit-yield"),n=document.getElementById("form-profit-price"),r=document.getElementById("form-profit-seeds"),l=document.getElementById("form-profit-fertilizer"),i=document.getElementById("form-profit-water"),m=document.getElementById("form-profit-labor"),d=document.getElementById("form-profit-period"),f=document.getElementById("form-profit-notes"),g=document.getElementById("form-profit-id");if(!e||!o||!n){alert("Veuillez remplir les champs obligatoires: Culture, Production et Prix de vente.");return}const u=e.value,c=(t==null?void 0:t.value)||"",p=C.find($=>$.id===c),I=p?p.name:"",w=parseFloat(o.value)||0,h=parseFloat(n.value)||0,y={seeds:parseFloat((r==null?void 0:r.value)||0),fertilizer:parseFloat((l==null?void 0:l.value)||0),water:parseFloat((i==null?void 0:i.value)||0),labor:parseFloat((m==null?void 0:m.value)||0)},E=(d==null?void 0:d.value)||"",L=(f==null?void 0:f.value)||"",B=(g==null?void 0:g.value)||"",{revenue:S,totalCost:R,netMargin:M,profitabilityPercent:j}=x.calculateProfitabilityData(u,w,h,y),P={id:B||`PROF-${Date.now()}`,cropName:u,parcelId:c,parcelName:I,yieldKg:w,pricePerKg:h,revenue:S,costs:y,totalCost:R,netMargin:M,profitabilityPercent:j,period:E,notes:L,createdAt:B?new Date().toISOString():new Date().toISOString(),updatedAt:new Date().toISOString(),enterprise_id:"ka_farm"};if(B){const $=s.findIndex(N=>N.id===B);$!==-1&&(s[$]=P)}else s.push(P);v.setCropProfits(s),x.render(),window.closeAddProfitModal(),alert(`Analyse de rentabilité pour ${u} enregistrée avec succès ! Marge nette: ${Math.round(M).toLocaleString("fr-FR")} F`)};window.editProfit=a=>{var o,n,r,l;const e=s.find(i=>i.id===a);if(!e)return;document.getElementById("form-profit-id").value=e.id,document.getElementById("form-profit-crop").value=e.cropName,document.getElementById("form-profit-parcel").value=e.parcelId||"",document.getElementById("form-profit-yield").value=e.yieldKg||0,document.getElementById("form-profit-price").value=e.pricePerKg||0,document.getElementById("form-profit-seeds").value=((o=e.costs)==null?void 0:o.seeds)||0,document.getElementById("form-profit-fertilizer").value=((n=e.costs)==null?void 0:n.fertilizer)||0,document.getElementById("form-profit-water").value=((r=e.costs)==null?void 0:r.water)||0,document.getElementById("form-profit-labor").value=((l=e.costs)==null?void 0:l.labor)||0,document.getElementById("form-profit-period").value=e.period||"",document.getElementById("form-profit-notes").value=e.notes||"",x.calculateFormValues();const t=document.getElementById("add-profit-modal");t&&t.classList.remove("hidden")};window.deleteProfit=a=>{const e=s.find(r=>r.id===a);if(!e)return;const t=e.cropName,o=document.getElementById("delete-confirm-modal"),n=document.getElementById("confirm-delete-btn");o&&n&&(n.onclick=()=>{s=s.filter(r=>r.id!==a),v.setCropProfits(s),x.render(),window.closeDeleteModal(),alert(`Analyse de rentabilité pour ${t} supprimée avec succès.`)},o.classList.remove("hidden"))};window.closeDeleteModal=()=>{const a=document.getElementById("delete-confirm-modal");a&&a.classList.add("hidden");const e=document.getElementById("confirm-delete-btn");e&&(e.onclick=null)};window.showProfitDetail=a=>{const e=s.find(i=>i.id===a);if(!e)return;const t=k[e.cropName]||{emoji:"🌱"},o=e.netMargin>=0,n=e.netMargin<0,r=document.getElementById("profit-detail-content");r&&(r.innerHTML=`
      <div class="space-y-4">
        <div class="p-4 bg-emerald-500/5 dark:bg-emerald-950/5 rounded-2xl border border-emerald-500/20">
          <p class="text-xs font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="bar-chart-3" class="h-3 w-3"></i> Analyse de Rentabilité #${e.id}
          </p>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mt-2">
            ${t.emoji} ${e.cropName}
          </h3>
          ${e.parcelName?`<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">📍 ${e.parcelName}</p>`:""}
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Production:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${e.yieldKg.toLocaleString("fr-FR")} kg</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Prix de vente:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${e.pricePerKg.toLocaleString("fr-FR")} F/kg</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Revenu total:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${Math.round(e.revenue).toLocaleString("fr-FR")} F</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Période:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${e.period||"Non spécifiée"}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Coût total:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${Math.round(e.totalCost).toLocaleString("fr-FR")} F</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Marge nette:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${Math.round(e.netMargin).toLocaleString("fr-FR")} F</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Rentabilité:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${e.profitabilityPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        ${e.costs?`
          <div class="p-3 bg-slate-50 dark:bg-[#061109]/30 rounded-xl">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Détail des coûts:</p>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
              <div class="flex justify-between"><span class="text-slate-500">Semences:</span> <span class="font-mono">${(e.costs.seeds||0).toLocaleString("fr-FR")} F</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Engrais:</span> <span class="font-mono">${(e.costs.fertilizer||0).toLocaleString("fr-FR")} F</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Eau:</span> <span class="font-mono">${(e.costs.water||0).toLocaleString("fr-FR")} F</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Main d'œuvre:</span> <span class="font-mono">${(e.costs.labor||0).toLocaleString("fr-FR")} F</span></div>
            </div>
          </div>
        `:""}
        
        <div class="p-3 ${o?"bg-emerald-500/5 border border-emerald-500/20":"bg-rose-500/5 border border-rose-500/20"} rounded-xl">
          <p class="text-[10px] font-bold ${o?"text-emerald-500":"text-rose-500"} uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="${o?"check-circle":"alert-triangle"}" class="h-3 w-3"></i> Statut
          </p>
          <p class="text-lg font-black text-slate-800 dark:text-white mt-1">
            ${o?"✅ EXCELLENTE RENTABILITÉ":n?"⚠️ DÉFICITAIRE - À REVOIR":"➖ ÉQUILIBRÉ"}
          </p>
        </div>
        
        ${e.notes?`
          <div class="space-y-1">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes:</p>
            <p class="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl">${e.notes}</p>
          </div>
        `:""}
        
        <div class="flex justify-end gap-2 pt-2">
          <button onclick="window.closeProfitDetailModal(); window.editProfit('${e.id}')" class="px-4 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#143E23] border border-slate-200 dark:border-[#143E23] text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="edit-2" class="h-3.5 w-3.5"></i> Modifier
          </button>
          <button onclick="window.closeProfitDetailModal(); window.deleteProfit('${e.id}')" class="px-4 py-2 bg-rose-100 dark:bg-rose-950/20 hover:bg-rose-200 dark:hover:bg-rose-950/30 border border-rose-500/20 text-rose-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Supprimer
          </button>
        </div>
      </div>
    `);const l=document.getElementById("profit-detail-modal");l&&l.classList.remove("hidden"),window.lucide&&window.lucide.createIcons()};window.closeProfitDetailModal=()=>{const a=document.getElementById("profit-detail-modal");a&&a.classList.add("hidden")};window.exportProfitability=()=>{const a=JSON.stringify(s,null,2),e=new Blob([a],{type:"application/json"}),t=URL.createObjectURL(e),o=document.createElement("a");o.href=t,o.download=`kafarm-rentabilite-${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(t)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{x.init()}):x.init();document.addEventListener("ka_data_updated",()=>{s=v.getCropProfits(),C=v.getParcelles(),x.render()});
