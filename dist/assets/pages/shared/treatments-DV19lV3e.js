import"../../modulepreload-polyfill-B5Qt9EMX.js";import"../../auth-client-BIZ63hJO.js";import"../../router-BlLxvn42.js";import"../../app-DhSchYKj.js";import{K as g}from"../../storage-C1IPJf-V.js";import"../../user-manager-ficPWetn.js";let s=[],E=[],C=[];const O={"bio-phytosanitaire":3,"chimique-phytosanitaire":7,"bio-engrais":0,"chimique-engrais":0},M={"bio-phytosanitaire":{name:"🌿 Phytosanitaire Bio",color:"emerald"},"chimique-phytosanitaire":{name:"⚠️ Chimique (Pesticide)",color:"rose"},"bio-engrais":{name:"🟤 Amendement Organique",color:"amber"},"chimique-engrais":{name:"🧪 Engrais Minéral",color:"blue"}},b={init(){s=g.getTreatments(),E=g.getParcelles(),C=g.getCrops(),this.render(),this.setupListeners(),this.loadParcelsAndCrops()},loadParcelsAndCrops(){const a=document.getElementById("form-treat-parcel"),e=document.getElementById("form-treat-crop");a&&(a.innerHTML='<option value="">-- Sélectionner une parcelle --</option>',E.forEach(r=>{const t=document.createElement("option");t.value=r.id,t.textContent=r.name,a.appendChild(t)})),e&&(e.innerHTML='<option value="">-- Sélectionner une culture --</option>',C.forEach(r=>{const t=document.createElement("option");t.value=r.id,t.textContent=r.name,e.appendChild(t)}))},render(){this.renderStats(),this.renderAlertPanels(),this.renderTable()},renderStats(){const a=s.length,e=s.filter(i=>i.category==="bio-phytosanitaire"||i.category==="bio-engrais").length,r=s.filter(i=>!i.harvestReady).length,t=s.filter(i=>i.harvestReady).length,n={};s.forEach(i=>{n[i.productName]=(n[i.productName]||0)+1});const o=Object.entries(n).sort((i,h)=>h[1]-i[1])[0],p=document.getElementById("stat-dar-active"),d=document.getElementById("stat-dar-cleared"),l=document.getElementById("stat-bio-count"),m=document.getElementById("stat-total-count"),u=document.getElementById("stat-top-product"),x=document.getElementById("stat-top-product-count");p&&(p.textContent=r),d&&(d.textContent=t),l&&(l.textContent=e),m&&(m.textContent=a),u&&(u.textContent=o?o[0]:"Aucun"),x&&(x.textContent=o?`${o[1]} application${o[1]>1?"s":""}`:"0 applications")},renderAlertPanels(){const a=new Date;a.setHours(0,0,0,0);const e=document.getElementById("dar-alert-list");if(e){const t=s.filter(n=>!n.harvestReady);t.length===0?e.innerHTML='<p class="text-[11px] text-rose-400/70 italic text-center py-2">✅ Aucune alerte DAR active actuellement.</p>':e.innerHTML=t.map(n=>{const o=new Date(n.dateApplied);o.setHours(0,0,0,0);const p=a.getTime()-o.getTime(),d=Math.floor(p/(1e3*60*60*24)),l=Math.max(0,n.dar-d);return`
            <div class="p-3 bg-white dark:bg-[#061109]/30 rounded-xl border border-rose-500/20">
              <div class="flex justify-between items-start gap-2">
                <div>
                  <p class="text-xs font-black text-slate-800 dark:text-white truncate">${n.productName}</p>
                  <p class="text-[10px] text-[#819888] mt-0.5">🌱 ${n.cropName||"Culture non spécifiée"} | ${n.parcelName||"Parcelle non spécifiée"}</p>
                </div>
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">${l}j restant</span>
              </div>
              <p class="text-[10px] text-rose-500 font-bold mt-1">🚫 RÉCOLTE INTERDITE</p>
            </div>
          `}).join("")}const r=document.getElementById("dar-cleared-list");if(r){const t=s.filter(n=>n.harvestReady);t.length===0?r.innerHTML=`<p class="text-[11px] text-emerald-400/70 italic text-center py-2">Aucune culture prête pour l'instant.</p>`:r.innerHTML=t.slice(0,5).map(n=>{const o=new Date(n.dateApplied);return o.setHours(0,0,0,0),a.getTime()-o.getTime(),`
            <div class="p-3 bg-white dark:bg-[#061109]/30 rounded-xl border border-emerald-500/20">
              <div class="flex justify-between items-start gap-2">
                <div>
                  <p class="text-xs font-black text-slate-800 dark:text-white truncate">${n.productName}</p>
                  <p class="text-[10px] text-[#819888] mt-0.5">🌱 ${n.cropName||"Culture non spécifiée"} | ${n.parcelName||"Parcelle non spécifiée"}</p>
                </div>
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">DAR terminé</span>
              </div>
              <p class="text-[10px] text-emerald-500 font-bold mt-1">✅ PRÊT POUR LE MARCHÉ 🇸🇳</p>
            </div>
          `}).join("")}window.lucide&&window.lucide.createIcons()},renderTable(){const a=document.getElementById("treatments-table-body");if(!a)return;const e=new Date;if(e.setHours(0,0,0,0),s.length===0){a.innerHTML=`
        <tr>
          <td colspan="9" class="px-4 py-8 text-center text-slate-400">
            <p class="text-xs font-bold">Aucun traitement phytosanitaire enregistré.</p>
            <p class="text-[10px] mt-1">Commencez par ajouter un traitement via le bouton ci-dessus.</p>
          </td>
        </tr>
      `;return}const r=[...s].sort((t,n)=>{const o=new Date(t.dateApplied);return new Date(n.dateApplied)-o});a.innerHTML=r.map(t=>{const n=new Date(t.dateApplied);n.setHours(0,0,0,0);const o=e.getTime()-n.getTime(),p=Math.floor(o/(1e3*60*60*24)),d=Math.max(0,t.dar-p),l=M[t.category]||{name:t.category,color:"slate"},m=d<=0||t.harvestReady,u=m?"✅ Autorisée":"🚫 Interdite",x=m?"bg-emerald-500/10 text-emerald-500 border-emerald-500/20":"bg-rose-500/10 text-rose-500 border-rose-500/20",i=d<=0?"Terminé":`${d}j restant`;return`
        <tr class="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0D2615]/25 transition-all" onclick="window.showTreatmentDetail('${t.id}')">
          <td class="px-4 py-3.5 font-mono text-slate-400 dark:text-[#819888] font-bold">${t.id}</td>
          <td class="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
            <span class="block">${t.cropName||"N/A"}</span>
            <span class="text-[9px] text-[#819888] font-medium">${t.parcelName||"N/A"}</span>
          </td>
          <td class="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">${t.productName}</td>
          <td class="px-4 py-3.5">
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${l.color==="emerald"?"bg-emerald-500/10 text-emerald-500 border border-emerald-500/20":l.color==="rose"?"bg-rose-500/10 text-rose-500 border border-rose-500/20":l.color==="amber"?"bg-amber-500/10 text-amber-500 border border-amber-500/20":"bg-blue-500/10 text-blue-500 border border-blue-500/20"}">
              ${l.name}
            </span>
          </td>
          <td class="px-4 py-3.5 text-center font-mono text-slate-700 dark:text-slate-300">${t.dateApplied}</td>
          <td class="px-4 py-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">${t.dar}</td>
          <td class="px-4 py-3.5 text-center">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${x}">${u}</span>
          </td>
          <td class="px-4 py-3.5 font-mono ${d<=3?"text-rose-500 font-bold":"text-slate-600"}">
            ${i}
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
      `}).join(""),window.lucide&&window.lucide.createIcons()},setupListeners(){const a=document.getElementById("treatments-search");a&&a.addEventListener("input",e=>{this.filterTreatments(e.target.value)})},filterTreatments(a){}};window.openAddTreatmentModal=()=>{const a=document.getElementById("add-treatment-modal");if(a){a.classList.remove("hidden");const e=new Date().toISOString().split("T")[0];document.getElementById("form-treat-date").value=e,document.getElementById("add-treatment-form").reset(),document.getElementById("dar-suggest-label").textContent="Sélectionnez un type",b.loadParcelsAndCrops()}};window.closeAddTreatmentModal=()=>{const a=document.getElementById("add-treatment-modal");a&&a.classList.add("hidden")};window.onTreatmentCategoryChange=a=>{const e=document.getElementById("form-treat-dar"),r=document.getElementById("dar-suggest-label");if(e&&r){const t=O[a];t!==void 0?(e.value=t,r.textContent=`DAR suggéré: ${t}j`):r.textContent="Sélectionnez un type"}};window.submitAddTreatment=a=>{a.preventDefault();const e=document.getElementById("form-treat-parcel"),r=document.getElementById("form-treat-crop"),t=document.getElementById("form-treat-category"),n=document.getElementById("form-treat-product"),o=document.getElementById("form-treat-date"),p=document.getElementById("form-treat-dar"),d=document.getElementById("form-treat-target"),l=document.getElementById("form-treat-notes"),m=document.getElementById("form-treat-quantity"),u=document.getElementById("form-treat-unit");if(!e||!n||!o||!p||!m||!u)return;const x=e.value,i=r?r.value:"",h=t?t.value:"",y=n.value,k=o.value,$=parseInt(p.value)||0,N=d?d.value:"",j=l?l.value:"",v=parseFloat(m.value),T=u.value;if(!x||!y||!k||!v||v<=0){alert("Veuillez remplir les champs obligatoires: Parcelle, Produit, Quantité et Date.");return}const w=g.getStocks(),I=w.findIndex(c=>c.name.toLowerCase()===y.toLowerCase());if(I!==-1){const c=w[I];let f=v;if(c.unit.toLowerCase()==="kg"&&T.toLowerCase()==="g"&&(f/=1e3),c.unit.toLowerCase()==="l"&&T.toLowerCase()==="ml"&&(f/=1e3),c.quantity<f){alert(`Stock insuffisant pour "${y}".
Stock actuel: ${c.quantity} ${c.unit}
Quantité demandée: ${f.toFixed(2)} ${c.unit}`);return}w[I].quantity-=f,g.saveStocks(w)}else if(!confirm(`Le produit "${y}" n'a pas été trouvé dans vos stocks. Voulez-vous quand même enregistrer ce traitement ?`))return;const B=E.find(c=>c.id===x),D=C.find(c=>c.id===i),P=s.reduce((c,f)=>{const S=parseInt(f.id.split("-")[1]);return S>c?S:c},0)+1,A={id:`TR-${String(P).padStart(3,"0")}`,parcelId:x,parcelName:B?B.name:"Parcelle inconnue",cropId:i||"",cropName:D?D.name:"",category:h,productName:y,dateApplied:k,dar:$,target:N,notes:j,quantityUsed:v,unit:T,harvestReady:!1,enterprise_id:"ka_farm"},L=new Date(k);L.setHours(0,0,0,0);const R=new Date;R.setHours(0,0,0,0);const H=R.getTime()-L.getTime(),q=Math.floor(H/(1e3*60*60*24));A.harvestReady=q>=$,s.push(A),g.set("ka_farm_treatments",s),b.render(),window.closeAddTreatmentModal(),alert("Traitement phytosanitaire enregistré avec succès ! Le DAR est maintenant suivi.")};window.editTreatment=a=>{const e=s.find(o=>o.id===a);if(!e)return;document.getElementById("form-treat-id").value=a;const r=document.getElementById("form-treat-parcel"),t=document.getElementById("form-treat-crop");r&&(r.value=e.parcelId),t&&(t.value=e.cropId||""),document.getElementById("form-treat-category").value=e.category||"",document.getElementById("form-treat-product").value=e.productName,document.getElementById("form-treat-date").value=e.dateApplied,document.getElementById("form-treat-dar").value=e.dar,document.getElementById("form-treat-target").value=e.target||"",document.getElementById("form-treat-notes").value=e.notes||"",window.onTreatmentCategoryChange(e.category);const n=document.getElementById("add-treatment-modal");n&&n.classList.remove("hidden")};window.deleteTreatment=a=>{confirm("Êtes-vous sûr de vouloir supprimer ce traitement ? Cette action ne peut pas être annulée.")&&(s=s.filter(e=>e.id!==a),g.set("ka_farm_treatments",s),b.render())};window.showTreatmentDetail=a=>{const e=s.find(x=>x.id===a);if(!e)return;const r=new Date;r.setHours(0,0,0,0);const t=new Date(e.dateApplied);t.setHours(0,0,0,0);const n=r.getTime()-t.getTime(),o=Math.floor(n/(1e3*60*60*24)),p=Math.max(0,e.dar-o),d=p<=0||e.harvestReady,l=M[e.category]||{name:e.category,color:"slate"},m=document.getElementById("treatment-detail-content");m&&(m.innerHTML=`
      <div class="space-y-4">
        <div class="p-4 bg-rose-500/5 dark:bg-rose-950/5 rounded-2xl border border-rose-500/20">
          <p class="text-xs font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="shield-alert" class="h-3 w-3"></i> Traitement #${e.id}
          </p>
          <h3 class="text-lg font-black text-slate-800 dark:text-white mt-2">${e.productName}</h3>
          <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${l.color==="emerald"?"bg-emerald-500/10 text-emerald-500 border border-emerald-500/20":l.color==="rose"?"bg-rose-500/10 text-rose-500 border border-rose-500/20":l.color==="amber"?"bg-amber-500/10 text-amber-500 border border-amber-500/20":"bg-blue-500/10 text-blue-500 border border-blue-500/20"}">
            ${l.name}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Parcelle:</span>
              <span class="text-slate-700 dark:text-slate-300">${e.parcelName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Culture:</span>
              <span class="text-slate-700 dark:text-slate-300">${e.cropName||"Non spécifiée"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Cible:</span>
              <span class="text-slate-700 dark:text-slate-300">${e.target||"Non spécifiée"}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Date:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${e.dateApplied}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">DAR:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${e.dar} jours</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Jours écoulés:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${o} jours</span>
            </div>
          </div>
        </div>
        
        <div class="p-3 ${d?"bg-emerald-500/5 border border-emerald-500/20":"bg-rose-500/5 border border-rose-500/20"} rounded-xl">
          <p class="text-[10px] font-bold ${d?"text-emerald-500":"text-rose-500"} uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="${d?"check-circle":"alert-triangle"}" class="h-3 w-3"></i> Statut Récolte
          </p>
          <p class="text-sm font-black text-slate-800 dark:text-white mt-1">
            ${d?"✅ RÉCOLTE AUTORISÉE - PRÊT POUR LE MARCHÉ":`🚫 RÉCOLTE INTERDITE - ${p}j de DAR restant`}
          </p>
        </div>
        
        ${e.notes?`
          <div class="space-y-1">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes:</p>
            <p class="text-xs text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl">${e.notes}</p>
          </div>
        `:""}
        
        <div class="flex justify-end gap-2 pt-2">
          <button onclick="window.closeTreatmentDetailModal(); window.editTreatment('${e.id}')" class="px-4 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#143E23] border border-slate-200 dark:border-[#143E23] text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="edit-2" class="h-3 w-3"></i> Modifier
          </button>
          <button onclick="window.closeTreatmentDetailModal(); window.deleteTreatment('${e.id}')" class="px-4 py-2 bg-rose-100 dark:bg-rose-950/20 hover:bg-rose-200 dark:hover:bg-rose-950/30 border border-rose-500/20 text-rose-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i data-lucide="trash-2" class="h-3 w-3"></i> Supprimer
          </button>
        </div>
      </div>
    `);const u=document.getElementById("treatment-detail-modal");u&&u.classList.remove("hidden"),window.lucide&&window.lucide.createIcons()};window.closeTreatmentDetailModal=()=>{const a=document.getElementById("treatment-detail-modal");a&&a.classList.add("hidden")};window.exportTreatments=()=>{const a=JSON.stringify(s,null,2),e=new Blob([a],{type:"application/json"}),r=URL.createObjectURL(e),t=document.createElement("a");t.href=r,t.download=`kafarm-traitements-${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(t),t.click(),document.body.removeChild(t),URL.revokeObjectURL(r)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{b.init()}):b.init();document.addEventListener("ka_data_updated",()=>{b.init()});
