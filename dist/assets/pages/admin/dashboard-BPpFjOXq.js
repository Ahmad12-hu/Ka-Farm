import"../../modulepreload-polyfill-B5Qt9EMX.js";import{s as d}from"../../auth-client-BIZ63hJO.js";/* empty css                      */import{K as n}from"../../storage-C1IPJf-V.js";window.logout=async()=>{confirm("Êtes-vous sûr de vouloir vous déconnecter ?")&&(await d.auth.signOut(),window.location.href="/pages/admin/login.html")};window.openSection=e=>{alert(`La page de gestion "${e}" sera disponible prochainement.

En attendant, utilisez les pages classiques de KA Farm.`)};async function x(){const e=n.getHarvests();document.getElementById("stat-harvests").textContent=e.length;const i=n.getStocks();document.getElementById("stat-stocks").textContent=i.length;const o=n.getFinances(),c=o.filter(s=>s.type==="Revenu").reduce((s,a)=>s+a.amount,0)-o.filter(s=>s.type==="Dépense").reduce((s,a)=>s+a.amount,0);document.getElementById("stat-finances").textContent=c.toLocaleString("fr-FR")+" F";const l=n.getEmployees();document.getElementById("stat-employees").textContent=l.length}function f(){const e=n.getHarvests(),i=document.getElementById("harvests-list");e.length===0?i.innerHTML='<p class="text-sm text-[#7ec850]/60">Aucune récolte enregistrée</p>':i.innerHTML=e.slice(0,5).map(t=>`
          <div class="flex items-center justify-between bg-[#0f1a0b] rounded-lg p-3">
            <div>
              <p class="text-sm font-bold text-white">${t.crop_name||"Culture"}</p>
              <p class="text-xs text-[#7ec850]/60">${t.quantity_kg||0} kg • ${t.quality||"N/A"}</p>
            </div>
            <span class="text-xs text-[#7ec850] font-bold">${t.date||""}</span>
          </div>
        `).join("");const o=n.getStocks(),c=document.getElementById("stocks-list");o.length===0?c.innerHTML='<p class="text-sm text-[#7ec850]/60">Aucun stock enregistré</p>':c.innerHTML=o.slice(0,5).map(t=>`
          <div class="flex items-center justify-between bg-[#0f1a0b] rounded-lg p-3">
            <div>
              <p class="text-sm font-bold text-white">${t.name}</p>
              <p class="text-xs text-[#7ec850]/60">${t.quantity} ${t.unit}</p>
            </div>
            <span class="text-xs font-bold ${t.quantity<=t.maxQuantity*.2?"text-red-400":"text-[#7ec850]"}">
              ${t.quantity<=t.maxQuantity*.2?"⚠️ Bas":"✓ OK"}
            </span>
          </div>
        `).join("");const l=n.getFinances(),s=document.getElementById("finances-summary"),a=l.filter(t=>t.type==="Revenu").reduce((t,p)=>t+p.amount,0),r=l.filter(t=>t.type==="Dépense").reduce((t,p)=>t+p.amount,0);s.innerHTML=`
        <div class="flex items-center justify-between bg-[#0f1a0b] rounded-lg p-3">
          <div>
            <p class="text-sm font-bold text-white">Revenus</p>
            <p class="text-xs text-[#7ec850]/60">Ce mois</p>
          </div>
          <span class="text-sm font-black text-[#7ec850]">${a.toLocaleString("fr-FR")} F</span>
        </div>
        <div class="flex items-center justify-between bg-[#0f1a0b] rounded-lg p-3">
          <div>
            <p class="text-sm font-bold text-white">Dépenses</p>
            <p class="text-xs text-[#7ec850]/60">Ce mois</p>
          </div>
          <span class="text-sm font-black text-red-400">${r.toLocaleString("fr-FR")} F</span>
        </div>
        <div class="flex items-center justify-between bg-[#0f1a0b] rounded-lg p-3">
          <div>
            <p class="text-sm font-bold text-white">Solde</p>
            <p class="text-xs text-[#7ec850]/60">Net</p>
          </div>
          <span class="text-sm font-black ${a-r>=0?"text-[#7ec850]":"text-red-400"}">
            ${(a-r).toLocaleString("fr-FR")} F
          </span>
        </div>
      `;const m=n.getEmployees(),u=document.getElementById("employees-list");m.length===0?u.innerHTML='<p class="text-sm text-[#7ec850]/60">Aucun employé enregistré</p>':u.innerHTML=m.slice(0,5).map(t=>`
          <div class="flex items-center justify-between bg-[#0f1a0b] rounded-lg p-3">
            <div>
              <p class="text-sm font-bold text-white">${t.name}</p>
              <p class="text-xs text-[#7ec850]/60">${t.role}</p>
            </div>
            <span class="text-xs font-bold ${t.status==="Actif"?"text-[#7ec850]":"text-red-400"}">
              ${t.status}
            </span>
          </div>
        `).join("")}async function g(){const{data:{session:e}}=await d.auth.getSession();if(!e){window.location.href="/pages/admin/login.html";return}if(e.user.email!=="admin@kafarm.sn"){alert("Accès refusé. Vous n'êtes pas administrateur."),await d.auth.signOut(),window.location.href="/pages/admin/login.html";return}x(),f()}d.auth.onAuthStateChange((e,i)=>{e==="SIGNED_OUT"&&(window.location.href="/pages/admin/login.html")});g();
