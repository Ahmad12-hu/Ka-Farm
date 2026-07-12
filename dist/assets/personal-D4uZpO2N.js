import{K as i}from"./storage-C1IPJf-V.js";import{U as x}from"./user-manager-ficPWetn.js";const f={init(){this.currentUser=x.getCurrentUser(),this.currentUser&&(this.renderProfile(),this.renderMyTasks(),this.renderMySales(),this.setupListeners(),window.lucide&&window.lucide.createIcons())},renderProfile(){const r=document.getElementById("personal-avatar"),u=document.getElementById("personal-name-input"),c=document.getElementById("personal-email-input"),t=document.getElementById("personal-twitter-input"),e=document.getElementById("personal-linkedin-input"),n=document.getElementById("personal-facebook-input"),s=document.getElementById("personal-role-badge"),o=document.getElementById("personal-stats-tasks"),d=document.getElementById("personal-stats-sales");r&&(r.textContent=this.currentUser.name.split(" ").map(a=>a[0]).join("")),u&&(u.value=this.currentUser.name),c&&(c.value=this.currentUser.email),t&&(t.value=this.currentUser.twitter||""),e&&(e.value=this.currentUser.linkedin||""),n&&(n.value=this.currentUser.facebook||""),s&&(s.textContent=this.currentUser.role==="Terrain"?"🌾 Terrain (Village)":"📊 Bureau (Dakar)");const l=document.getElementById("personal-social-links");if(l){let a="";a+=`
        <a href="mailto:${this.currentUser.email}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" title="Envoyer un email">
          <i data-lucide="mail" class="h-3.5 w-3.5"></i> Email
        </a>
      `,this.currentUser.twitter&&(a+=`
          <a href="${this.currentUser.twitter}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-500 border border-sky-500/20 hover:bg-sky-500/20 transition-all" title="Twitter / X">
            <i data-lucide="twitter" class="h-3.5 w-3.5"></i> Twitter
          </a>
        `),this.currentUser.linkedin&&(a+=`
          <a href="${this.currentUser.linkedin}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-[#0A66C2] dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all" title="LinkedIn">
            <i data-lucide="linkedin" class="h-3.5 w-3.5"></i> LinkedIn
          </a>
        `),this.currentUser.facebook&&(a+=`
          <a href="${this.currentUser.facebook}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-blue-600/10 text-[#1877F2] dark:text-blue-300 border border-blue-600/20 hover:bg-blue-600/20 transition-all" title="Facebook">
            <i data-lucide="facebook" class="h-3.5 w-3.5"></i> Facebook
          </a>
        `),l.innerHTML=a,window.lucide&&window.lucide.createIcons()}if(o){const m=i.getTasks().filter(p=>p.assignee.toLowerCase().includes(this.currentUser.name.split(" ")[0].toLowerCase())&&!p.completed).length;o.textContent=m}if(d){const m=i.getFinances().filter(p=>p.type==="Revenu"&&p.description.toLowerCase().includes("vente")).reduce((p,g)=>p+g.amount,0);d.textContent=m.toLocaleString("fr-FR")+" FCFA"}},renderMyTasks(){const r=document.getElementById("my-tasks-container");if(!r)return;const u=i.getTasks(),c=this.currentUser.name.split(" ")[0],t=u.filter(e=>e.assignee.toLowerCase().includes(c.toLowerCase()));if(t.length===0){r.innerHTML=`
        <div class="text-center py-10 text-slate-450 dark:text-slate-500">
          <span class="text-4xl">🎉</span>
          <p class="text-sm font-bold mt-2">Aucune tâche assignée !</p>
          <p class="text-xs text-slate-400 mt-1">Vous êtes à jour dans vos travaux maraîchers.</p>
        </div>
      `;return}r.innerHTML=t.map(e=>{const n={Haute:"bg-rose-500/10 text-rose-400 border-rose-500/20",Moyenne:"bg-amber-500/10 text-amber-400 border-amber-500/20",Basse:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20"},s=n[e.priority]||n.Moyenne,o=e.completed?"line-through text-slate-400 dark:text-slate-500":"text-slate-800 dark:text-slate-100";return`
        <div class="p-4 bg-white dark:bg-[#0B2112]/50 border border-slate-100 dark:border-[#143E23]/30 rounded-2xl flex items-center justify-between gap-4 task-card">
          <div class="flex items-center gap-3 text-left min-w-0">
            <input type="checkbox" ${e.completed?"checked":""} 
                   onclick="window.toggleMyTaskStatus('${e.id}')"
                   class="accent-emerald-500 h-5 w-5 rounded-lg border-slate-300 dark:border-emerald-900 bg-slate-50 cursor-pointer">
            <div class="min-w-0">
              <p class="text-xs font-black ${o} truncate">${e.title}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[9px] px-1.5 py-0.2 rounded border font-bold ${s}">${e.priority}</span>
                <span class="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold flex items-center gap-1">
                  <i data-lucide="calendar" class="h-3 w-3"></i> Échéance : ${e.dueDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      `}).join(""),window.lucide&&window.lucide.createIcons()},renderMySales(){const r=document.getElementById("my-sales-container");if(!r)return;const c=i.getFinances().filter(t=>t.type==="Revenu"&&t.description.toLowerCase().includes("vente"));if(c.length===0){r.innerHTML=`
        <div class="text-center py-10 text-slate-500">
          <p class="text-xs font-bold">Aucune vente enregistrée.</p>
        </div>
      `;return}r.innerHTML=c.map(t=>`
        <div class="p-3 bg-white dark:bg-[#0B2112]/40 border border-slate-100 dark:border-[#143E23]/20 rounded-xl flex justify-between items-center text-left">
          <div>
            <p class="text-xs font-black text-slate-800 dark:text-slate-100">${t.description}</p>
            <p class="text-[9px] text-slate-400 font-extrabold mt-0.5">${t.date} • ${t.category}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-emerald-500 font-mono mr-1">+${t.amount.toLocaleString("fr-FR")} F</span>
            <button onclick="window.shareSalesWhatsApp('${t.id}')" class="text-emerald-500 hover:text-emerald-400 p-1.5 bg-emerald-500/10 rounded-lg transition-colors cursor-pointer" title="Partager le bon de livraison Bana-Bana sur WhatsApp">
              <i data-lucide="message-circle" class="h-4 w-4"></i>
            </button>
          </div>
        </div>
      `).join(""),window.lucide&&window.lucide.createIcons()},setupListeners(){window.shareSalesWhatsApp=t=>{const n=i.getFinances().find(d=>d.id===t);if(!n)return;const s=`*🚚 BON DE LIVRAISON & REÇU - BANA-BANA*
----------------------------------------
*Réf :* ${n.id}
*Date :* ${n.date}
*Grossiste/Bana-Bana :* Agricole Intermédiaire
*Désignation :* ${n.description}
*Rubrique :* ${n.category}
*Montant Total :* ${n.amount.toLocaleString("fr-FR")} FCFA
*Statut :* Livré & Payé (Règlement comptant)
----------------------------------------
*KA Farm - Zone Maraîchère, Sénégal*
_Merci pour votre collaboration horticole !_`,o=`https://api.whatsapp.com/send?text=${encodeURIComponent(s)}`;window.open(o,"_blank")},window.toggleMyTaskStatus=t=>{const e=i.getTasks(),n=e.findIndex(s=>s.id===t);n!==-1&&(e[n].completed=!e[n].completed,i.saveTasks(e),this.renderMyTasks(),this.renderProfile(),window.App&&typeof window.App.updateBadges=="function"&&window.App.updateBadges())};const r=document.getElementById("personal-profile-form");r&&r.addEventListener("submit",t=>{t.preventDefault();const e=document.getElementById("personal-name-input").value,n=document.getElementById("personal-email-input").value,s=document.getElementById("personal-twitter-input").value,o=document.getElementById("personal-linkedin-input").value,d=document.getElementById("personal-facebook-input").value;if(e&&n){this.currentUser.name=e,this.currentUser.email=n,this.currentUser.twitter=s,this.currentUser.linkedin=o,this.currentUser.facebook=d,i.setCurrentUser(this.currentUser);const l=i.getUsers(),a=l.findIndex(m=>m.email.toLowerCase()===n.toLowerCase());a!==-1&&(l[a].name=e,l[a].twitter=s,l[a].linkedin=o,l[a].facebook=d,i.saveUsers(l)),alert("Profil mis à jour avec succès !"),window.location.reload()}});const u=document.getElementById("personal-task-form");u&&u.addEventListener("submit",t=>{t.preventDefault();const e=document.getElementById("personal-task-title").value,n=document.getElementById("personal-task-priority").value,s=document.getElementById("personal-task-due").value;if(!e||!s)return;const o=i.getTasks(),d={id:`T-${Date.now()}`,title:e,category:"Entretien",dueDate:s,assignee:this.currentUser.name.split(" ")[0],priority:n,completed:!1};o.unshift(d),i.saveTasks(o),u.reset();const l=new Date().toISOString().split("T")[0];document.getElementById("personal-task-due").value=l,this.renderMyTasks(),this.renderProfile(),window.App&&typeof window.App.updateBadges=="function"&&window.App.updateBadges(),alert("Nouvelle tâche ajoutée !")});const c=document.getElementById("personal-sale-form");c&&c.addEventListener("submit",t=>{t.preventDefault();const e=document.getElementById("personal-sale-desc").value,n=document.getElementById("personal-sale-category").value,s=parseFloat(document.getElementById("personal-sale-amount").value),o=document.getElementById("personal-sale-date").value;if(!e||!s||!o)return;const d=i.getFinances(),l={id:`F-${Date.now()}`,description:`Vente : ${e}`,category:n,type:"Revenu",amount:s,date:o};d.unshift(l),i.saveFinances(d),c.reset();const a=new Date().toISOString().split("T")[0];document.getElementById("personal-sale-date").value=a,this.renderMySales(),this.renderProfile(),alert("Vente enregistrée avec succès !")})}};document.addEventListener("DOMContentLoaded",()=>{f.init()});document.addEventListener("ka_data_updated",r=>{r.detail&&(r.detail.key==="ka_farm_users"||r.detail.key==="ka_farm_tasks"||r.detail.key==="ka_farm_finances")&&(f.renderProfile(),f.renderMyTasks(),f.renderMySales())});
