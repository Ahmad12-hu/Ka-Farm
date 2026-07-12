import"../../modulepreload-polyfill-B5Qt9EMX.js";import"../../auth-client-BIZ63hJO.js";import"../../router-BlLxvn42.js";import"../../app-DhSchYKj.js";import{K as l}from"../../storage-C1IPJf-V.js";import"../../user-manager-ficPWetn.js";let i=[];const c={init(){this.renderAlerts(),this.renderAdvisorChat(),this.setupListeners()},renderAlerts(){const o=document.getElementById("alerts-container");if(!o)return;const s=l.getCrops(),t=[];if(s.forEach(e=>{(e.photos||[]).forEach(a=>{(a.status==="Surveiller"||a.status==="Alerte")&&t.push({cropName:e.name,cropField:e.field,cropId:e.id,...a})})}),t.length===0){o.innerHTML=`
        <div class="p-6 bg-[#0B2112]/40 border border-[#143E23]/25 rounded-3xl text-center space-y-4 animate-fadeIn">
          <div class="inline-flex h-16 w-16 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl items-center justify-center text-3xl shadow-lg shadow-emerald-500/5">
            🛡️
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-black text-white">Aucune anomalie active détectée</h4>
            <p class="text-xs text-[#819888] font-semibold max-w-sm mx-auto">Toutes les planches de l'exploitation KA Farm sont saines et sous contrôle rigoureux.</p>
          </div>
          
          <div class="grid grid-cols-2 gap-3 pt-3 text-left">
            <div class="p-3 bg-[#051009]/50 border border-[#143E23]/30 rounded-2xl">
              <span class="text-[8px] font-black text-[#4F6D58] uppercase tracking-widest">Pépinières</span>
              <p class="text-xs font-black text-emerald-400 mt-1 flex items-center gap-1">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Conforme
              </p>
            </div>
            <div class="p-3 bg-[#051009]/50 border border-[#143E23]/30 rounded-2xl">
              <span class="text-[8px] font-black text-[#4F6D58] uppercase tracking-widest">Ravageurs</span>
              <p class="text-xs font-black text-emerald-400 mt-1 flex items-center gap-1">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Pression nulle
              </p>
            </div>
            <div class="p-3 bg-[#051009]/50 border border-[#143E23]/30 rounded-2xl col-span-2">
              <span class="text-[8px] font-black text-[#4F6D58] uppercase tracking-widest">Dernière inspection terrain</span>
              <p class="text-[11px] font-bold text-slate-300 mt-1 flex items-center justify-between">
                <span>Aujourd'hui, 08:15</span>
                <span class="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-black">Validée</span>
              </p>
            </div>
          </div>
        </div>
      `;return}t.sort((e,r)=>r.id.localeCompare(e.id)),o.innerHTML=t.map(e=>{const r=e.status==="Alerte",a=r?"bg-rose-500/10 text-rose-500 border-rose-500/20":"bg-amber-500/10 text-amber-500 border-amber-500/20",n=r?"Grave / Alerte":"À Surveiller",d=r?"shield-x":"alert-circle";return`
        <div class="p-5 bg-[#0B2112]/40 border border-[#143E23]/30 rounded-3xl flex flex-col sm:flex-row gap-4 text-left shadow-xl hover:border-emerald-500/20 transition-all duration-300 hover:scale-[1.01] animate-fadeIn">
          <!-- Alert Photo with hover lens icon effect -->
          <div class="relative group w-24 h-24 flex-shrink-0 mx-auto sm:mx-0">
            <img src="${e.imageUrl}" alt="Alerte" class="w-full h-full object-cover rounded-2xl border border-[#143E23]/60 cursor-pointer transition-transform group-hover:scale-105 duration-300" onclick="window.viewFullSizePhoto('${e.imageUrl}')">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center pointer-events-none">
              <i data-lucide="zoom-in" class="h-5 w-5 text-white"></i>
            </div>
          </div>

          <div class="flex-grow space-y-2 min-w-0">
            <div class="flex justify-between items-start gap-2 flex-wrap">
              <div>
                <h4 class="text-sm font-black text-white flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full ${r?"bg-rose-500":"bg-amber-500"} animate-pulse"></span>
                  ${e.cropName}
                </h4>
                <p class="text-[10px] text-[#819888] font-bold uppercase tracking-wider">${e.cropField}</p>
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${a} flex items-center gap-1">
                <i data-lucide="${d}" class="h-3 w-3"></i> ${n}
              </span>
            </div>

            <div class="bg-[#051009]/40 p-3 rounded-xl border border-[#143E23]/25">
              <p class="text-xs text-slate-300 font-semibold leading-relaxed whitespace-pre-line">${e.notes}</p>
            </div>

            <div class="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <span class="text-[9px] text-[#4F6D58] font-black uppercase tracking-wider">Signalé le ${e.date}</span>
              <button onclick="window.askAdvisorAbout('${e.cropName}', '${e.notes}')" class="px-3.5 py-2 bg-purple-600/15 hover:bg-purple-600/30 border border-purple-500/30 text-purple-350 hover:text-white font-extrabold text-[10px] rounded-xl cursor-pointer transition-all flex items-center gap-1.5">
                <i data-lucide="sparkles" class="h-3.5 w-3.5 text-purple-450"></i> Demander conseil à l'IA Advisor
              </button>
            </div>
          </div>
        </div>
      `}).join(""),window.lucide&&window.lucide.createIcons()},renderAdvisorChat(){const o=document.getElementById("advisor-chat-container");if(o){if(i.length===0){o.innerHTML=`
        <div class="h-full flex flex-col justify-center text-left p-6 md:p-8 space-y-6 animate-fadeIn">
          <div class="space-y-3">
            <div class="h-11 w-11 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/5">
              <i data-lucide="sparkles" class="h-5 w-5"></i>
            </div>
            
            <h1 class="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight max-w-md">
              Bonjour, de quoi votre exploitation a-t-elle besoin aujourd'hui ?
            </h1>
            <p class="text-[11px] text-[#819888] font-bold max-w-sm leading-relaxed">
              Je suis KA-Advisor, votre IA d'expertise horticole et d'agriculture écologique au Sénégal. Posez-moi une question ou demandez-moi un traitement biologique pour soigner vos cultures.
            </p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div onclick="window.askPreset('Fiche complète sur la Mineuse de la tomate (Tuta Absoluta)')" class="p-4 bg-[#0B2112]/50 hover:bg-[#0B2112]/85 border border-[#143E23]/45 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all space-y-1 group">
              <div class="flex items-center gap-2">
                <span class="text-xs">🐛</span>
                <h5 class="text-xs font-black text-white group-hover:text-purple-300 transition-colors">Tuta Absoluta</h5>
              </div>
              <p class="text-[10px] text-slate-400 leading-relaxed font-semibold">Comment diagnostiquer et éradiquer biologiquement la mineuse de la tomate au Sénégal.</p>
            </div>

            <div onclick="window.askPreset('Comment préparer facilement du purin de neem à la ferme ?')" class="p-4 bg-[#0B2112]/50 hover:bg-[#0B2112]/85 border border-[#143E23]/45 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all space-y-1 group">
              <div class="flex items-center gap-2">
                <span class="text-xs">🌱</span>
                <h5 class="text-xs font-black text-white group-hover:text-purple-300 transition-colors">Purin de Neem</h5>
              </div>
              <p class="text-[10px] text-slate-400 leading-relaxed font-semibold">Recette traditionnelle, dosage de traitement et étapes d'application faciles.</p>
            </div>
          </div>
        </div>
      `,window.lucide&&window.lucide.createIcons();return}o.innerHTML=i.map(s=>{const t=s.role==="user",e=t?"bg-emerald-600 border border-emerald-500 text-white rounded-br-none ml-12":"bg-[#0B2112] border border-[#143E23]/40 text-slate-100 rounded-bl-none mr-12 shadow-md",r=t?"justify-end":"justify-start",a=t?"Vous":"KA-Advisor (IA)",n=t?"text-emerald-300":"text-purple-300";return`
        <div class="flex ${r} text-left animate-fadeIn">
          <div class="p-4 rounded-2xl ${e} max-w-[85%] space-y-2">
            <div class="flex items-center gap-1.5 pb-1 border-b border-[#143E23]/15">
              <i data-lucide="${t?"user":"bot"}" class="h-3 w-3 ${n}"></i>
              <span class="text-[9px] font-black uppercase tracking-wider ${n}">${a}</span>
            </div>
            <p class="text-xs font-semibold leading-relaxed whitespace-pre-line">${s.text}</p>
          </div>
        </div>
      `}).join(""),o.scrollTop=o.scrollHeight,window.lucide&&window.lucide.createIcons()}},async sendToAdvisor(o){if(!o.trim())return;i.push({role:"user",text:o}),this.renderAdvisorChat();const s=document.getElementById("advisor-chat-container"),t=`load-${Date.now()}`;if(s){const e=document.createElement("div");e.id=t,e.className="flex justify-start text-left",e.innerHTML=`
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/70 border border-slate-100 dark:border-emerald-950/20 text-slate-500 rounded-2xl rounded-tl-none mr-12 flex items-center gap-2">
          <span class="text-[9px] font-black uppercase tracking-wider text-purple-400">🤖 Conseiller</span>
          <p class="text-xs font-bold italic flex items-center gap-1 animate-pulse">
            Analyse et rédaction du diagnostic en cours...
          </p>
        </div>
      `,s.appendChild(e),s.scrollTop=s.scrollHeight}try{const r=await(await fetch("/api/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:o,history:i.slice(0,-1)})})).json(),a=document.getElementById(t);if(a&&a.remove(),r.error)throw new Error(r.error);i.push({role:"advisor",text:r.text})}catch(e){console.error(e);const r=document.getElementById(t);r&&r.remove(),i.push({role:"advisor",text:`⚠️ Désolé, une erreur technique est survenue lors de la communication avec l'IA horticole : ${e.message||"Serveur indisponible"}.`})}this.renderAdvisorChat()},setupListeners(){const o=document.getElementById("advisor-chat-form");o&&o.addEventListener("submit",s=>{s.preventDefault();const t=document.getElementById("advisor-chat-input");if(!t)return;const e=t.value;t.value="",this.sendToAdvisor(e)}),window.askPreset=s=>{this.sendToAdvisor(s)},window.clearChatHistory=()=>{i=[],this.renderAdvisorChat()},window.viewFullSizePhoto=s=>{const t=document.getElementById("photo-modal"),e=document.getElementById("modal-image");t&&e&&(e.src=s,t.classList.remove("hidden"))},window.closePhotoModal=()=>{const s=document.getElementById("photo-modal");s&&s.classList.add("hidden")},window.askAdvisorAbout=(s,t)=>{const e=`Bonjour KA-Advisor, que me conseilles-tu d'utiliser pour soigner ma planche de ${s} ? Le diagnostic indique : "${t}". Quels biopesticides locaux ou remèdes écologiques sénégalais comme le neem me conseilles-tu ?`;this.sendToAdvisor(e);const r=document.getElementById("advisor-chat-input");r&&r.scrollIntoView({behavior:"smooth",block:"center"})},window.simulateDemoAlert=()=>{const s=l.getCrops();if(s.length===0){alert("Aucune culture n'est actuellement configurée dans votre base.");return}const t=s.find(a=>a.name.toLowerCase().includes("tomate"))||s[0];if(t.photos||(t.photos=[]),t.photos.some(a=>a.id==="demo-alert-1")){alert("L'alerte de démonstration est déjà active ! Regardez le panneau de gauche.");return}const e={id:"demo-alert-1",imageUrl:"https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=600&q=80",status:"Alerte",date:new Date().toLocaleDateString("fr-FR"),notes:"Anomalie identifiée : Feuilles flétries avec galeries foliaires argentées creusées par des larves. Forte suspicion de Mineuse de la Tomate (Tuta Absoluta) sur la planche."};t.photos.unshift(e),l.saveCrops(s),this.renderAlerts();const r=document.getElementById("alerts-container");r&&r.scrollIntoView({behavior:"smooth",block:"start"})}}};document.addEventListener("DOMContentLoaded",()=>{c.init()});
