import"../../modulepreload-polyfill-B5Qt9EMX.js";import{s as n}from"../../auth-client-BIZ63hJO.js";/* empty css                      */import"../../router-BlLxvn42.js";import"../../app-DhSchYKj.js";import"../../user-manager-ficPWetn.js";import"../../storage-C1IPJf-V.js";const l={async init(){console.log("Initialisation du module des récoltes..."),this.fetchAndRenderHarvests()},async fetchAndRenderHarvests(){const s=document.getElementById("harvests-table-body"),r=document.getElementById("loading-row");try{const{data:e,error:o}=await n.from("harvests").select("*").order("harvest_date",{ascending:!1});if(o)throw o;if(s.innerHTML="",e.length===0){s.innerHTML=`<tr><td colspan="6" class="p-8 text-center text-slate-400 font-semibold">Aucune récolte n'a encore été enregistrée.</td></tr>`;return}e.forEach(t=>{const a=document.createElement("tr");a.className="hover:bg-slate-50 dark:hover:bg-[#0E2F19]/50 transition-colors",a.innerHTML=`
          <td class="p-4 font-bold text-slate-700 dark:text-slate-200">${t.crop_name||"N/A"}</td>
          <td class="p-4 text-slate-600 dark:text-slate-400 font-semibold">${t.parcel_name||"N/A"}</td>
          <td class="p-4 text-slate-600 dark:text-slate-300 font-mono font-bold">${t.quantity_kg||0} kg</td>
          <td class="p-4 text-slate-600 dark:text-slate-400 font-semibold">${new Date(t.harvest_date).toLocaleDateString("fr-FR")}</td>
          <td class="p-4">
            <span class="px-2 py-1 text-[10px] font-black rounded-full ${t.quality==="A"?"bg-emerald-500/10 text-emerald-500":"bg-amber-500/10 text-amber-500"}">
              Qualité ${t.quality||"B"}
            </span>
          </td>
          <td class="p-4">
            <button class="p-1.5 text-slate-400 hover:text-emerald-500"><i data-lucide="edit-3" class="h-3.5 w-3.5"></i></button>
            <button class="p-1.5 text-slate-400 hover:text-rose-500"><i data-lucide="trash-2" class="h-3.5 w-3.5"></i></button>
          </td>
        `,s.appendChild(a)}),window.lucide&&lucide.createIcons()}catch(e){console.error("Erreur lors de la récupération des récoltes:",e.message),r.innerHTML='<td colspan="6" class="p-8 text-center text-rose-400 font-semibold">Erreur: Impossible de charger les données. Vérifiez les règles RLS et la connexion.</td>'}}};document.addEventListener("DOMContentLoaded",()=>l.init());
