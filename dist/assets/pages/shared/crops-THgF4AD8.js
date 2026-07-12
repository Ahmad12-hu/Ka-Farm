import"../../modulepreload-polyfill-B5Qt9EMX.js";import"../../auth-client-BIZ63hJO.js";import"../../router-BlLxvn42.js";import"../../app-DhSchYKj.js";import{K as l}from"../../storage-C1IPJf-V.js";import"../../user-manager-ficPWetn.js";let v=null,w="";const L=l.getCropLibrary(),h={init(){this.populateParcelOptions(),this.renderCrops(),this.renderNurseries(),this.renderTreatments(),this.renderLibrary(),this.initYieldEstimator(),this.setupListeners();const a=new URLSearchParams(window.location.search).get("search");if(a){const r=document.getElementById("library-search");r&&(r.value=a,window.filterLibraryCrops&&window.filterLibraryCrops())}},populateParcelOptions(){const s=document.getElementById("crops-filter-field"),a=document.getElementById("form-crop-field-select");if(!s&&!a)return;const r=l.getParcelles(),e=l.getCrops(),t=new Set(r.map(o=>o.name));e.forEach(o=>{o.field&&t.add(o.field)});const n=Array.from(t).sort();s&&(s.innerHTML='<option value="all">📍 Toutes Parcelles</option>'+n.map(o=>`<option value="${o}">${o}</option>`).join("")),a&&(a.innerHTML=n.map(o=>`<option value="${o}">${o}</option>`).join("")+'<option value="custom">+ Saisir une nouvelle parcelle...</option>')},initYieldEstimator(){const s=document.getElementById("est-sowing-date");s&&(s.value=new Date().toISOString().split("T")[0]),window.updateYieldEstimator=()=>this.updateYieldEstimator(),this.updateYieldEstimator()},updateYieldEstimator(){var E,C,S,k;const s=(E=document.getElementById("est-crop-select"))==null?void 0:E.value,a=parseFloat((C=document.getElementById("est-surface"))==null?void 0:C.value)||0,r=parseFloat((S=document.getElementById("est-density"))==null?void 0:S.value)||0,e=(k=document.getElementById("est-sowing-date"))==null?void 0:k.value;if(!s)return;let t=0,n=90;s==="tomate"?(t=2.5,n=80):s==="oignon"?(t=.15,n=135):s==="menthe"?(t=.8,n=45):s==="chou"?(t=1.2,n=90):s==="piment"&&(t=.5,n=135);const i=a*r*t,d=i/1e3,c=document.getElementById("est-yield-result"),u=document.getElementById("est-yield-sub");c&&(c.textContent=`${d.toFixed(2)} T`),u&&(u.textContent=`~ ${Math.round(i).toLocaleString("fr-FR")} kg de légumes`);const p=document.getElementById("est-date-result"),m=document.getElementById("est-days-countdown"),g=document.getElementById("est-alert-panel"),f=document.getElementById("est-alert-title"),b=document.getElementById("est-alert-desc"),y=document.getElementById("est-alert-icon");if(e){const $=new Date(e),I=new Date($.getTime()+n*24*60*60*1e3),T={day:"numeric",month:"long",year:"numeric"};p&&(p.textContent=I.toLocaleDateString("fr-FR",T));const B=new Date;B.setHours(0,0,0,0),I.setHours(0,0,0,0);const D=I.getTime()-B.getTime(),x=Math.ceil(D/(1e3*60*60*24));m&&(x>0?m.textContent=`${x} jours restants`:x===0?m.textContent="Aujourd'hui !":m.textContent=`Récolte passée de ${Math.abs(x)} jours`),g&&f&&b&&(x>14?(g.className="p-3.5 bg-emerald-550/5 dark:bg-[#061109]/20 rounded-xl border border-emerald-500/10 flex items-start gap-3",f.className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400",f.textContent="Planche en croissance saine",b.textContent=`La récolte est prévue dans ${x} jours. Continuez l'irrigation selon les recommandations du calculateur intelligent.`,y&&(y.className="h-4 w-4 text-emerald-500")):x<=14&&x>=0?(g.className="p-3.5 bg-amber-550/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-start gap-3 animate-pulse",f.className="text-xs font-extrabold text-amber-600 dark:text-amber-400",f.textContent="Récolte imminente ! 🎉",b.textContent=`Il reste moins de deux semaines (${x} j) avant la maturité optimale. Préparez vos caisses, organisez le transport et vérifiez les cours des marchés locaux !`,y&&(y.className="h-4 w-4 text-amber-500")):(g.className="p-3.5 bg-rose-550/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-start gap-3",f.className="text-xs font-extrabold text-rose-500",f.textContent="Période de récolte dépassée !",b.textContent=`Attention ! Le cycle théorique est achevé depuis ${Math.abs(x)} jours. Récoltez immédiatement pour éviter les pertes ou la pourriture sur pied.`,y&&(y.className="h-4 w-4 text-rose-500")))}else p&&(p.textContent="-- -- ----"),m&&(m.textContent="-- jours restants");window.lucide&&window.lucide.createIcons()},renderLibrary(s=null){const a=document.getElementById("library-container");if(!a)return;const r=s||L;if(r.length===0){a.innerHTML=`
        <div class="col-span-full text-center py-8 text-slate-400">
          <p class="text-xs font-semibold">Aucune fiche ne correspond à votre recherche.</p>
        </div>
      `;return}a.innerHTML=r.map(e=>{let t="";return e.type==="Fruit"?t='<span class="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/10">Fruits</span>':e.type==="Bulbe"?t='<span class="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/10">Bulbe</span>':t='<span class="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">Feuille</span>',`
        <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl space-y-4 text-left shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-200">
          <div class="space-y-3">
            <div class="flex justify-between items-start gap-2">
              <div class="flex items-center gap-2">
                <span class="text-2xl">${e.emoji}</span>
                <div>
                  <h4 class="text-xs font-black text-slate-800 dark:text-white leading-tight">${e.name}</h4>
                  <p class="text-[9px] text-[#819888] font-bold uppercase mt-0.5">${e.variety}</p>
                </div>
              </div>
              ${t}
            </div>

            <div class="space-y-2 text-[11px] font-semibold border-t border-b border-slate-50 dark:border-[#143E23]/10 py-3">
              <div class="flex justify-between gap-1.5">
                <span class="text-slate-400">⏱️ Cycle:</span>
                <span class="text-slate-700 dark:text-slate-200 font-extrabold text-right">${e.cycle}</span>
              </div>
              <div class="flex justify-between gap-1.5">
                <span class="text-slate-400">💧 Eau requis:</span>
                <span class="text-slate-700 dark:text-slate-200 font-extrabold text-right truncate max-w-[130px]" title="${e.water}">${e.water}</span>
              </div>
              <div class="flex justify-between gap-1.5">
                <span class="text-slate-400">📈 Rendement:</span>
                <span class="text-slate-700 dark:text-slate-200 font-extrabold text-right">${e.yield}</span>
              </div>
            </div>

            <div class="space-y-1">
              <span class="text-[8px] text-slate-400 uppercase tracking-wider block font-black">Conseils Pratiques (Sénégal)</span>
              <p class="text-[10px] text-slate-500 dark:text-slate-350 leading-relaxed font-semibold italic">"${e.tips}"</p>
            </div>
          </div>

          <div class="pt-3 flex gap-1.5 border-t border-slate-50 dark:border-[#143E23]/10">
            <button onclick="window.prefillCropForm('${e.name}', 'crop')" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1">
              <i data-lucide="plus" class="h-3 w-3"></i> Cultiver
            </button>
            <button onclick="window.prefillCropForm('${e.name}', 'nursery')" class="flex-1 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-[#061109]/30 dark:hover:bg-[#061109]/60 text-emerald-500 border border-slate-250 dark:border-[#143E23]/20 font-extrabold text-[10px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1">
              <i data-lucide="layers" class="h-3 w-3"></i> Pépinière
            </button>
          </div>
        </div>
      `}).join(""),window.lucide&&window.lucide.createIcons()},renderCrops(s=null){const a=document.getElementById("crops-container");if(!a)return;const r=s||l.getCrops();if(r.length===0){a.innerHTML=`
        <div class="col-span-full text-center py-10 text-slate-400">
          <p class="text-xs font-bold">Aucune culture enregistrée ou aucun résultat de recherche.</p>
        </div>
      `;return}a.innerHTML=r.map(e=>{const t=e.waterStatus==="Besoin d'eau",n=t?"bg-amber-500/10 text-amber-500 border-amber-500/20":"bg-emerald-500/10 text-emerald-500 border-emerald-500/20",o=t?"droplet-off":"droplet",d=e.fertilizerStatus!=="OK"?"bg-purple-500/10 text-purple-400 border-purple-500/20":"bg-emerald-500/10 text-emerald-500 border-emerald-500/20",c=e.photos||[];let u="🟢 Sain",p="bg-emerald-500/10 text-emerald-500 border-emerald-500/20";if(c.length>0){const f=c[0];f.status==="Surveiller"?(u="🟡 À surveiller",p="bg-amber-500/10 text-amber-500 border-amber-500/20"):f.status==="Alerte"&&(u="🔴 Alerte / Maladie",p="bg-rose-500/10 text-rose-500 border-rose-500/20")}const m=e.seedType||"Hybride F1 Certifiée",g=e.season||"Saison Sèche Froide";return`
        <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl space-y-4 text-left shadow-sm">
          <div class="flex justify-between items-start gap-2">
            <div>
              <h3 class="text-sm font-black text-slate-800 dark:text-white">${e.name}</h3>
              <p class="text-[10px] text-[#819888] font-bold mt-0.5 uppercase tracking-wider">${e.field}</p>
            </div>
            <button onclick="window.deleteCrop('${e.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143E23]/20 transition-all cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </div>

          <!-- Status & Season Row -->
          <div class="flex flex-wrap gap-2">
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-slate-100 dark:border-[#143E23]/30 bg-slate-50 dark:bg-emerald-950/20 text-slate-600 dark:text-emerald-400">
              📊 ${e.status}
            </span>
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${p}">
              🛡️ ${u}
            </span>
          </div>

          <!-- Season & Seed Badges -->
          <div class="flex flex-wrap gap-1.5 pt-1">
            <span class="text-[8.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-550/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
              📅 ${g}
            </span>
            <span class="text-[8.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-550/10 text-cyan-600 dark:text-cyan-400 border border-cyan-550/15">
              🌱 ${m}
            </span>
          </div>

          <!-- Parameters Details -->
          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 dark:border-[#143E23]/10 text-[11px] font-semibold">
            <div class="space-y-1">
              <p class="text-[9px] text-slate-400 uppercase tracking-wider">État hydrique</p>
              <button onclick="window.toggleWaterStatus('${e.id}')" class="w-full flex items-center justify-between px-2 py-1 rounded border cursor-pointer transition-colors ${n}">
                <span>${e.waterStatus}</span>
                <i data-lucide="${o}" class="h-3 w-3"></i>
              </button>
            </div>
            <div class="space-y-1">
              <p class="text-[9px] text-slate-400 uppercase tracking-wider">Nutriments</p>
              <button onclick="window.toggleFertStatus('${e.id}')" class="w-full flex items-center justify-between px-2 py-1 rounded border cursor-pointer transition-colors ${d}">
                <span class="truncate">${e.fertilizerStatus}</span>
                <i data-lucide="leaf" class="h-3 w-3"></i>
              </button>
            </div>
          </div>

          <!-- Dates -->
          <div class="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-extrabold">
            <span>📅 Semis: ${e.sowingDate}</span>
            <span>🎯 Récolte: ${e.harvestDate}</span>
          </div>

          <!-- Diagnostic Action -->
          <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 flex gap-2">
            <button onclick="window.openSanitaryDiagnostics('${e.id}')" class="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-[#061109]/35 dark:hover:bg-[#061109]/65 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-xl border border-slate-200 dark:border-[#143E23]/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all">
              <i data-lucide="camera" class="h-3.5 w-3.5"></i> Diagnostic Sanitaire (${c.length})
            </button>
          </div>
        </div>
      `}).join(""),window.lucide&&window.lucide.createIcons(),window.App&&typeof window.App.updateBadges=="function"&&window.App.updateBadges()},renderNurseries(){const s=document.getElementById("nurseries-container");if(!s)return;const a=l.getNurseries();if(a.length===0){s.innerHTML=`
        <div class="col-span-full text-center py-10 text-slate-450">
          <p class="text-xs font-bold">Aucune pépinière enregistrée.</p>
        </div>
      `;return}s.innerHTML=a.map(r=>{let e="bg-[#061109]/40 border-slate-100 text-slate-600 dark:text-slate-400";return r.status==="Prêt pour repiquage"&&(e="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"),`
        <div class="p-5 bg-white dark:bg-[#0B2112] border border-slate-100 dark:border-[#143E23]/30 rounded-3xl space-y-4 text-left shadow-sm">
          <div class="flex justify-between items-start gap-2">
            <div>
              <h3 class="text-sm font-black text-slate-800 dark:text-white">${r.name}</h3>
              <p class="text-[10px] text-[#819888] font-bold mt-0.5 uppercase tracking-wider">${r.cropType} • Est. ${r.quantityEst} plants</p>
            </div>
            <button onclick="window.deleteNursery('${r.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143E23]/20 transition-all cursor-pointer">
              <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
          </div>

          <div class="flex items-center justify-between text-[11px] font-semibold">
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${e}">
              🌱 ${r.status}
            </span>
            <span class="text-[10px] text-[#819888] font-bold">❤️ ${r.healthStatus}</span>
          </div>

          <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 flex gap-2">
            <button onclick="window.nextNurseryStatus('${r.id}')" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="arrow-right-circle" class="h-3.5 w-3.5"></i> Évoluer le stade
            </button>
          </div>

          <div class="pt-2 text-[10px] text-slate-400 font-extrabold flex justify-between">
            <span>📅 Semis: ${r.sowingDate}</span>
            <span>📍 Repiquage: ${r.plannedTransplantDate}</span>
          </div>
        </div>
      `}).join(""),window.lucide&&window.lucide.createIcons()},setupListeners(){window.deleteCrop=r=>{if(!confirm("Voulez-vous supprimer cette culture ?"))return;const e=l.getCrops().filter(t=>t.id!==r);l.saveCrops(e),this.renderCrops()},window.toggleWaterStatus=r=>{const e=l.getCrops(),t=e.findIndex(n=>n.id===r);t!==-1&&(e[t].waterStatus=e[t].waterStatus==="Optimale"?"Besoin d'eau":"Optimale",l.saveCrops(e),this.renderCrops())},window.toggleFertStatus=r=>{const e=l.getCrops(),t=e.findIndex(n=>n.id===r);if(t!==-1){const n=["OK","Besoin d'azote","Besoin de potasse"],o=n.indexOf(e[t].fertilizerStatus);e[t].fertilizerStatus=n[(o+1)%n.length],l.saveCrops(e),this.renderCrops()}},window.deleteNursery=r=>{if(!confirm("Voulez-vous supprimer cette pépinière ?"))return;const e=l.getNurseries().filter(t=>t.id!==r);l.saveNurseries(e),this.renderNurseries()},window.nextNurseryStatus=r=>{const e=l.getNurseries(),t=e.findIndex(n=>n.id===r);if(t!==-1){const n=["Semis","Levée","Prêt pour repiquage"],o=n.indexOf(e[t].status);if(o<n.length-1)e[t].status=n[o+1];else if(confirm("Cette pépinière est prête. Voulez-vous la repiquer et l'ajouter aux planches de cultures actives ?")){const i=l.getCrops(),d={id:`C-${Date.now()}`,name:e[t].name,field:"Parcelle Ouest - Verger",sowingDate:e[t].sowingDate,harvestDate:new Date(Date.now()+2160*60*60*1e3).toISOString().split("T")[0],seedType:"Locale Améliorée",season:"Saison Sèche Froide",status:"Croissance",waterStatus:"Optimale",fertilizerStatus:"OK",photos:[]};i.unshift(d),l.saveCrops(i);const c=e.filter(u=>u.id!==r);l.saveNurseries(c),alert("Pépinière transplantée avec succès !"),this.populateParcelOptions(),this.renderCrops(),this.renderNurseries();return}l.saveNurseries(e),this.renderNurseries()}},window.onCropFieldChange=r=>{const e=document.getElementById("form-crop-field-custom-container"),t=document.getElementById("form-crop-field-custom");e&&(r==="custom"?(e.classList.remove("hidden"),t&&t.setAttribute("required","true")):(e.classList.add("hidden"),t&&t.removeAttribute("required")))},window.filterActiveCrops=()=>{var d,c,u,p;const r=((d=document.getElementById("crops-search"))==null?void 0:d.value.toLowerCase().trim())||"",e=((c=document.getElementById("crops-filter-field"))==null?void 0:c.value)||"all",t=((u=document.getElementById("crops-filter-seed"))==null?void 0:u.value)||"all",n=((p=document.getElementById("crops-filter-season"))==null?void 0:p.value)||"all",i=l.getCrops().filter(m=>{const g=m.name.toLowerCase().includes(r)||m.field&&m.field.toLowerCase().includes(r),f=e==="all"||m.field===e,b=t==="all"||(m.seedType||"Hybride F1 Certifiée")===t,y=n==="all"||(m.season||"Saison Sèche Froide")===n;return g&&f&&b&&y});this.renderCrops(i)};const s=document.getElementById("shared-crop-form");s&&s.addEventListener("submit",r=>{var m,g,f;r.preventDefault();const e=document.getElementById("form-crop-name").value,t=document.getElementById("form-crop-field-select");let n=t?t.value:"";n==="custom"&&(n=((m=document.getElementById("form-crop-field-custom"))==null?void 0:m.value)||"Nouvelle Parcelle");const o=document.getElementById("form-crop-sowing").value,i=document.getElementById("form-crop-harvest").value,d=((g=document.getElementById("form-crop-seed-type"))==null?void 0:g.value)||"Hybride F1 Certifiée",c=((f=document.getElementById("form-crop-season"))==null?void 0:f.value)||"Saison Sèche Froide";if(!e||!n||!o||!i)return;const u=l.getCrops();u.unshift({id:`C-${Date.now()}`,name:e,field:n,sowingDate:o,harvestDate:i,seedType:d,season:c,status:"Semis",waterStatus:"Optimale",fertilizerStatus:"OK",photos:[]}),l.saveCrops(u),this.populateParcelOptions(),this.renderCrops(),s.reset();const p=document.getElementById("form-crop-field-custom-container");p&&p.classList.add("hidden"),document.getElementById("crop-form-modal").classList.add("hidden"),alert("Nouvelle planche de culture enregistrée !")});const a=document.getElementById("shared-nursery-form");a&&a.addEventListener("submit",r=>{r.preventDefault();const e=document.getElementById("form-nursery-name").value,t=document.getElementById("form-nursery-crop").value,n=parseInt(document.getElementById("form-nursery-qty").value),o=document.getElementById("form-nursery-sowing").value,i=document.getElementById("form-nursery-transplant").value;if(!e||!t||!n||!o||!i)return;const d=l.getNurseries();d.unshift({id:`PEP-${Date.now()}`,name:e,cropType:t,sowingDate:o,plannedTransplantDate:i,quantityEst:n,status:"Semis",healthStatus:"Excellent"}),l.saveNurseries(d),this.renderNurseries(),a.reset(),document.getElementById("nursery-form-modal").classList.add("hidden"),alert("Nouvelle pépinière planifiée !")}),window.openSanitaryDiagnostics=r=>{this.openSanitaryModal(r)},window.closeSanitaryModal=()=>{document.getElementById("sanitary-modal").classList.add("hidden"),this.stopLiveCamera()},window.startLiveCamera=()=>{this.startLiveCamera()},window.captureLivePhoto=()=>{this.captureLivePhoto()},window.resetSanitaryPhoto=()=>{this.resetSanitaryPhoto()},window.handleSanitaryFile=r=>{this.handleSanitaryFile(r)},window.saveSanitaryRecord=r=>{this.saveSanitaryRecord(r)},window.deleteSanitaryRecord=(r,e)=>{this.deleteSanitaryRecord(r,e)},window.openTreatmentModal=()=>{const r=document.getElementById("treatment-modal"),e=document.getElementById("form-treat-crop"),t=document.getElementById("form-treat-date"),n=document.getElementById("form-treat-product"),o=document.getElementById("form-treat-notes");if(n&&(n.value=""),o&&(o.value=""),t&&(t.value=new Date().toISOString().split("T")[0]),e){const d=l.getCrops();d.length===0?e.innerHTML='<option value="">-- Aucune culture active --</option>':e.innerHTML=d.map(c=>`<option value="${c.id}">${c.name} (${c.field})</option>`).join("")}const i=document.getElementById("form-treat-category");i&&(i.value="bio-phytosanitaire",window.onTreatmentCategoryChange("bio-phytosanitaire")),r&&r.classList.remove("hidden")},window.onTreatmentCategoryChange=r=>{const e=document.getElementById("form-treat-dar"),t=document.getElementById("dar-suggest-label");e&&(r==="bio-phytosanitaire"?(e.value=3,t&&(t.textContent="Conseillé: 1-3j")):r==="chimique-phytosanitaire"?(e.value=7,t&&(t.textContent="Conseillé: 7-14j")):(r==="bio-engrais"||r==="chimique-engrais")&&(e.value=0,t&&(t.textContent="Conseillé: 0j")))},window.saveTreatmentRecord=r=>{r.preventDefault();const e=document.getElementById("form-treat-crop").value,t=document.getElementById("form-treat-category").value,n=document.getElementById("form-treat-product").value,o=document.getElementById("form-treat-date").value,i=parseInt(document.getElementById("form-treat-dar").value)||0,d=document.getElementById("form-treat-notes").value;if(!e||!n||!o){alert("Veuillez remplir tous les champs obligatoires.");return}const u=l.getCrops().find(f=>f.id===e),p=u?u.name:"Culture inconnue",m=this.getTreatments(),g={id:`TREAT-${Date.now()}`,cropId:e,cropName:p,category:t,productName:n,dateApplied:o,dar:i,notes:d};m.unshift(g),localStorage.setItem("ka_farm_treatments",JSON.stringify(m)),document.getElementById("treatment-modal").classList.add("hidden"),alert("Traitement enregistré et DAR planifié !"),this.renderTreatments()},window.deleteTreatment=r=>{if(!confirm("Voulez-vous supprimer ce traitement du registre ?"))return;const e=this.getTreatments().filter(t=>t.id!==r);localStorage.setItem("ka_farm_treatments",JSON.stringify(e)),this.renderTreatments()}},openSanitaryModal(s){const a=document.getElementById("sanitary-modal"),r=document.getElementById("sanitary-crop-id"),e=document.getElementById("sanitary-modal-title"),n=l.getCrops().find(i=>i.id===s);if(!n)return;r.value=s,e.textContent=`Diagnostic Sanitaire - ${n.name} (${n.field})`,a&&a.classList.remove("hidden");const o=document.getElementById("sanitary-form");o&&o.reset(),this.resetSanitaryPhoto(),this.stopLiveCamera(),this.renderSanitaryHistory(n)},renderSanitaryHistory(s){const a=document.getElementById("sanitary-history");if(!a)return;const r=s.photos||[];if(r.length===0){a.innerHTML=`
        <div class="text-center py-8 text-slate-400 dark:text-slate-500">
          <span class="text-3xl">📋</span>
          <p class="text-[11px] font-bold mt-2">Aucun historique sanitaire pour cette culture.</p>
          <p class="text-[9px] text-slate-450 mt-1">Prenez ou importez une photo à droite pour diagnostiquer.</p>
        </div>
      `;return}a.innerHTML=r.map(e=>{let t="bg-emerald-500/10 text-emerald-500 border-emerald-500/20",n="🟢 Sain";return e.status==="Surveiller"?(t="bg-amber-500/10 text-amber-500 border-amber-500/20",n="🟡 À surveiller"):e.status==="Alerte"&&(t="bg-rose-500/10 text-rose-500 border-rose-500/20",n="🔴 Alerte / Maladie"),`
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/40 border border-slate-100 dark:border-emerald-950/30 rounded-2xl flex gap-3 items-start">
          <img src="${e.imageUrl}" alt="Diagnostic" class="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-emerald-950 flex-shrink-0 cursor-pointer" onclick="window.viewFullSizePhoto('${e.imageUrl}')">
          <div class="flex-grow space-y-1 text-left min-w-0">
            <div class="flex justify-between items-start">
              <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${t}">${n}</span>
              <button onclick="window.deleteSanitaryRecord('${s.id}', '${e.id}')" class="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer">
                <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
              </button>
            </div>
            <p class="text-[9px] text-slate-400 font-extrabold">${e.date}</p>
            <p class="text-xs text-slate-700 dark:text-slate-300 font-semibold break-words leading-relaxed">${e.notes||"Aucune observation."}</p>
          </div>
        </div>
      `}).join(""),window.lucide&&window.lucide.createIcons()},async startLiveCamera(){const s=document.getElementById("sanitary-video"),a=document.getElementById("sanitary-placeholder"),r=document.getElementById("sanitary-camera-controls"),e=document.getElementById("sanitary-preview");e&&e.classList.add("hidden"),a&&a.classList.add("hidden");try{const t=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1});v=t,s&&(s.srcObject=t,s.classList.remove("hidden"),s.play()),r&&r.classList.remove("hidden")}catch(t){console.warn("getUserMedia failed",t),alert("Accès caméra direct indisponible. Veuillez utiliser le bouton 'Importer' pour charger une photo existante ou prendre un cliché via votre smartphone."),a&&a.classList.remove("hidden")}},stopLiveCamera(){const s=document.getElementById("sanitary-video"),a=document.getElementById("sanitary-camera-controls");document.getElementById("sanitary-placeholder"),v&&(v.getTracks().forEach(r=>r.stop()),v=null),s&&(s.pause(),s.srcObject=null,s.classList.add("hidden")),a&&a.classList.add("hidden")},captureLivePhoto(){const s=document.getElementById("sanitary-video"),a=document.getElementById("sanitary-canvas");if(!s||!a)return;const r=s.videoWidth||640,e=s.videoHeight||480;a.width=r,a.height=e,a.getContext("2d").drawImage(s,0,0,r,e),this.stopLiveCamera();const n=a.toDataURL("image/jpeg",.85);this.compressAndStore(n)},handleSanitaryFile(s){if(!s.files||!s.files[0])return;const a=new FileReader;a.onload=r=>{this.compressAndStore(r.target.result)},a.readAsDataURL(s.files[0])},compressAndStore(s){const a=document.getElementById("sanitary-preview"),r=document.getElementById("sanitary-placeholder"),e=document.getElementById("sanitary-reset-preview-btn"),t=new Image;t.onload=()=>{const n=document.createElement("canvas");let o=t.width,i=t.height;const d=600;o>i?o>d&&(i*=d/o,o=d):i>d&&(o*=d/i,i=d),n.width=o,n.height=i,n.getContext("2d").drawImage(t,0,0,o,i);const u=n.toDataURL("image/jpeg",.65);w=u,a&&(a.src=u,a.classList.remove("hidden")),r&&r.classList.add("hidden"),e&&e.classList.remove("hidden")},t.src=s},resetSanitaryPhoto(){const s=document.getElementById("sanitary-preview"),a=document.getElementById("sanitary-placeholder"),r=document.getElementById("sanitary-reset-preview-btn"),e=document.getElementById("sanitary-file-input");w="",e&&(e.value=""),s&&(s.src="",s.classList.add("hidden")),r&&r.classList.add("hidden"),a&&a.classList.remove("hidden")},saveSanitaryRecord(s){s.preventDefault();const a=document.getElementById("sanitary-crop-id").value,r=document.getElementById("sanitary-status-select").value,e=document.getElementById("sanitary-notes").value;if(!w){alert("Veuillez d'abord capturer ou importer une photo.");return}const t=l.getCrops(),n=t.findIndex(p=>p.id===a);if(n===-1)return;const o=new Date,i={day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"},d=o.toLocaleDateString("fr-FR",i),c={id:`SAN-${Date.now()}`,date:d,imageUrl:w,status:r,notes:e};t[n].photos||(t[n].photos=[]),t[n].photos.unshift(c),l.saveCrops(t),this.renderCrops(),this.renderSanitaryHistory(t[n]),this.resetSanitaryPhoto();const u=document.getElementById("sanitary-notes");u&&(u.value=""),alert("Diagnostic sanitaire enregistré avec succès !")},deleteSanitaryRecord(s,a){if(!confirm("Veuillez confirmer la suppression de ce diagnostic."))return;const r=l.getCrops(),e=r.findIndex(t=>t.id===s);e!==-1&&(r[e].photos=(r[e].photos||[]).filter(t=>t.id!==a),l.saveCrops(r),this.renderCrops(),this.renderSanitaryHistory(r[e]))},getTreatments(){const s=[{id:"TREAT-1",cropId:"C-101",cropName:"Tomate Mongal F1",category:"bio-phytosanitaire",productName:"Purin de Neem (Insecticide bio)",dateApplied:"2026-06-25",dar:3,notes:"Traitement foliaire contre la mouche blanche."},{id:"TREAT-2",cropId:"C-102",cropName:"Oignon Rouge de Galmi",category:"bio-engrais",productName:"Compost Organique Bio",dateApplied:"2026-06-15",dar:0,notes:"Amendement de fond mélangé lors du sarclage."},{id:"TREAT-3",cropId:"C-104",cropName:"Chou Cabus",category:"chimique-phytosanitaire",productName:"Décis (Insecticide chimique)",dateApplied:"2026-06-23",dar:7,notes:"Traitement curatif suite à l'alerte sur les chenilles."}],a=localStorage.getItem("ka_farm_treatments");return a?JSON.parse(a):(localStorage.setItem("ka_farm_treatments",JSON.stringify(s)),s)},renderTreatments(){const s=document.getElementById("treatments-container");if(!s)return;const a=this.getTreatments();if(a.length===0){s.innerHTML=`
        <div class="col-span-full text-center py-10 text-slate-450">
          <p class="text-xs font-bold">Aucun traitement ou fertilisation enregistré.</p>
        </div>
      `;return}const r={"bio-phytosanitaire":"🌿 Phytosanitaire Bio","chimique-phytosanitaire":"⚠️ Chimique (Pesticide)","bio-engrais":"🟤 Amendement Organique","chimique-engrais":"🧪 Engrais Minéral"},e=new Date;e.setHours(0,0,0,0),s.innerHTML=a.map(t=>{const n=new Date(t.dateApplied);n.setHours(0,0,0,0);const o=e.getTime()-n.getTime(),i=Math.round(o/(1e3*60*60*24)),d=t.dar-i,c=d>0,u=c?"border-rose-100 dark:border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10":"border-emerald-100 dark:border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10",p=c?"bg-rose-500/10 text-rose-500 border-rose-500/20":"bg-emerald-500/10 text-emerald-500 border-emerald-500/20",m=c?`⏳ DAR ACTIF: ${d} j restant${d>1?"s":""}`:"✅ SAIN & SÉCURISÉ",g=c?'<p class="text-[10px] text-rose-500 font-extrabold flex items-center gap-1">🚫 RÉCOLTE INTERDITE (DAR en cours)</p>':'<p class="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">🟢 PRÊT POUR LE MARCHÉ SÉNÉGALAIS 🇸🇳</p>',f=r[t.category]||t.category;return`
        <div class="p-5 border rounded-3xl space-y-4 text-left shadow-sm flex flex-col justify-between ${u}">
          <div class="space-y-3">
            <div class="flex justify-between items-start gap-2">
              <div>
                <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${p}">
                  ${m}
                </span>
                <h3 class="text-sm font-black text-slate-800 dark:text-white mt-2">${t.productName}</h3>
                <p class="text-[10px] text-[#819888] font-extrabold uppercase tracking-wider mt-0.5">🌱 ${t.cropName}</p>
              </div>
              <button onclick="window.deleteTreatment('${t.id}')" class="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143E23]/20 transition-all cursor-pointer">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
              </button>
            </div>

            <!-- Parameters Details -->
            <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 space-y-2 text-[11px] font-semibold">
              <div class="flex justify-between">
                <span class="text-slate-400">Type de produit:</span>
                <span class="text-slate-700 dark:text-slate-300 font-bold">${f}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Appliqué le:</span>
                <span class="text-slate-700 dark:text-slate-300 font-bold font-mono">${t.dateApplied}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Délai requis (DAR):</span>
                <span class="text-slate-700 dark:text-slate-300 font-bold font-mono">${t.dar} jour${t.dar>1?"s":""}</span>
              </div>
            </div>

            ${t.notes?`
            <div class="p-2.5 bg-white/40 dark:bg-black/20 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">
              "${t.notes}"
            </div>
            `:""}
          </div>

          <!-- Bottom Warning/Safe Badge -->
          <div class="pt-3 border-t border-slate-50 dark:border-[#143E23]/10 flex items-center justify-between">
            ${g}
          </div>
        </div>
      `}).join(""),window.lucide&&window.lucide.createIcons()}};window.viewFullSizePhoto=s=>{const a=document.createElement("div");a.className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out",a.innerHTML=`
    <div class="relative max-w-3xl max-h-[90vh]">
      <img src="${s}" class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10">
      <p class="text-center text-xs text-white/60 mt-3 font-semibold">Cliquez n'importe où pour fermer</p>
    </div>
  `,a.onclick=()=>a.remove(),document.body.appendChild(a)};window.filterLibraryCrops=()=>{var e,t;const s=((e=document.getElementById("library-search"))==null?void 0:e.value.toLowerCase().trim())||"",a=((t=document.getElementById("library-filter"))==null?void 0:t.value)||"all",r=L.filter(n=>{const o=n.name.toLowerCase().includes(s)||n.variety.toLowerCase().includes(s)||n.tips.toLowerCase().includes(s)||n.water.toLowerCase().includes(s),i=a==="all"||n.type===a;return o&&i});h.renderLibrary(r)};window.prefillCropForm=(s,a)=>{if(a==="crop"){const r=document.getElementById("form-crop-name");r&&(r.value=s);const e=document.getElementById("crop-form-modal");e&&e.classList.remove("hidden")}else{const r=document.getElementById("form-nursery-name"),e=document.getElementById("form-nursery-crop");r&&(r.value=`Pépinière ${s}`),e&&(e.value=s);const t=document.getElementById("nursery-form-modal");t&&t.classList.remove("hidden")}};document.addEventListener("DOMContentLoaded",()=>{h.init()});document.addEventListener("ka_data_updated",s=>{s.detail&&(s.detail.key==="ka_farm_crops"||s.detail.key==="ka_farm_nurseries")&&(h.renderCrops(),h.renderNurseries(),h.renderTreatments())});
