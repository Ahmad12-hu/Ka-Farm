import"../../modulepreload-polyfill-B5Qt9EMX.js";import"../../auth-client-BIZ63hJO.js";/* empty css                     */import"../../router-BlLxvn42.js";import"../../app-DhSchYKj.js";import{K as l}from"../../storage-C1IPJf-V.js";import"../../user-manager-ficPWetn.js";document.addEventListener("DOMContentLoaded",()=>{const r=document.getElementById("settings-users-list");if(r){const t=()=>{const e=l.getUsers();r.innerHTML=e.map(n=>{const o=n.name.split(" ").map(i=>i[0]).join(""),a=n.role==="Terrain"?'<span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full text-[9px] font-black">🌾 Terrain</span>':'<span class="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/10 rounded-full text-[9px] font-black">📊 Bureau</span>';return`
              <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#061109]/40 border border-slate-100 dark:border-[#143E23]/15 rounded-xl text-left">
                <div class="h-9 w-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black rounded-full flex items-center justify-center text-xs flex-shrink-0">
                  ${o}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black text-slate-800 dark:text-slate-100 truncate">${n.name}</p>
                  <p class="text-[10px] text-slate-400 truncate mt-0.5">${n.email}</p>
                </div>
                <div class="ml-auto flex-shrink-0">
                  ${a}
                </div>
              </div>
            `}).join("")};t(),document.addEventListener("ka_data_updated",e=>{e.detail&&e.detail.key==="ka_farm_users"&&t()})}window.copyInvitationLink=()=>{const t=window.location.origin+"/pages/auth/signup.html";navigator.clipboard.writeText(t).then(()=>{alert("Lien d'inscription copié ! Envoyez ce lien à votre collaborateur pour qu'il crée son compte.")}).catch(()=>{const e=document.createElement("input");e.value=t,document.body.appendChild(e),e.select(),document.execCommand("copy"),document.body.removeChild(e),alert("Lien d'inscription copié ! Envoyez ce lien à votre collaborateur pour qu'il crée son compte.")})},window.shareOnWhatsApp=()=>{const e=`🌾 *KA Farm Sénégal* 🌾

Bonjour ! Je t'invite à me rejoindre sur notre plateforme de gestion d'exploitation agricole pour travailler ensemble en temps réel.

Crée ton compte collaborateur en cliquant sur ce lien :
🔗 ${window.location.origin+"/pages/auth/signup.html"}`,n=`https://api.whatsapp.com/send?text=${encodeURIComponent(e)}`;window.open(n,"_blank")}});
