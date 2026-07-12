import{K as o,E as T}from"./storage-C1IPJf-V.js";import{U as v}from"./user-manager-ficPWetn.js";function A(e){try{const a=window.AudioContext||window.webkitAudioContext;if(!a){e&&e();return}const t=new a,i=t.createOscillator(),n=t.createGain();i.type="sine",i.frequency.setValueAtTime(950,t.currentTime),i.frequency.exponentialRampToValueAtTime(1400,t.currentTime+.08),n.gain.setValueAtTime(.08,t.currentTime),n.gain.exponentialRampToValueAtTime(.001,t.currentTime+.12),i.connect(n),n.connect(t.destination),i.start(),i.stop(t.currentTime+.12),setTimeout(()=>{t.close(),e&&e()},120)}catch(a){console.error("AudioContext beep failed",a),e&&e()}}const k={irrigation_standard:{title:"Conseil d'irrigation standard",french:"Climat standard. Maintenez le temps d'arrosage habituel de 20 minutes par vanne.",wolofText:"Arrosage normal na : niar fukki minutes par vanne ni nguen ko baaxe.",phonetic:"Clima bi, normal na. Arrossé lène, niar fouki minutes par vanne, ni nguène ko baakhé."},irrigation_drought:{title:"Conseil forte chaleur",french:"Forte chaleur détectée. Augmentez l'irrigation à 30 minutes par vanne.",wolofText:"Tangay bi rëy na lool : yokkuleen arrosage bi ba fanwéer minutes par vanne.",phonetic:"Tangaye bi reuye na lool. Yokou lène, arrossage bi, ba fanwère minutes par vanne, nguir ratakhal souf si."},irrigation_rain:{title:"Conseil pluie détectée",french:"Pluie ou humidité élevée. Réduisez ou suspendez l'arrosage.",wolofText:"Taw na walla tooy na lool : waññileen walla taxawaleen arrosage bi.",phonetic:"Taw na, wala nguelaw li dafa toye lool. Wagnilène, wala deudjelène, arrossage bi."},alert_tuta_absoluta:{title:"Alerte Mineuse de la Tomate",french:"Feuilles flétries avec galeries foliaires argentées... suspicion de Mineuse de la Tomate.",wolofText:"Feuilles yi dafa sew té tooy te xat-xat nekk si biir. Dina mën doon Tuta Absoluta. Teetleen xob yaaxu yi te arrossé leen ak neem.",phonetic:"Attention! Khob yi, dafa sew té toye, té khate-khate nek si biir. Dina meun doon, Touta Absolouta. Teet lène khob yaakhou yi, té arrossé lène ak neem."},alert_mildiou:{title:"Alerte Humidité & Mildiou",french:"Éviter d'arroser les feuilles en fin de journée. Favoriser l'arrosage au pied par goutte-à-goutte pour maintenir le feuillage sec.",wolofText:"Buleen arrossé xob yi si ngoon. Yokkuleen goutte-à-goutte bi ngir xob yi wow té aéré.",phonetic:"Bou lène arrossé khob yi si ngoon. Yokouleun goutte à goutte bi, nguir khob yi wow, té aéré."},alert_preventive_neem:{title:"Traitement préventif Neem",french:"Pulvérisation préventive hebdomadaire de purin de Neem ou savon noir bio. Enlever et brûler immédiatement les feuilles attaquées.",wolofText:"War ngënn di arrossé ak neem walla savon noir bën bën fann yu nekk. Day leen sàggi dëj jinn yi.",phonetic:"War nguène di puss-pussé ak sabou niame wala neem, béne yone par sémane. Teet lène khob yaakhou yi té lakk lène ko sassi."},biosecurity_entry:{title:"Protocole d'entrée",french:"Désinfection systématique des mains et des outils de coupe avant d'entrer dans la serre ou la parcelle.",wolofText:"Setal loxox yi ak tool yi avant ngéney dug si bir parcelle bi.",phonetic:"Rakhass lène, té désemphecté, loxo yi ak outi yi, avant nguéney doug si biir serre bi, wala parcelle bi."},biosecurity_quarantine:{title:"Zone de quarantaine",french:"Isoler immédiatement tout plant suspect et signaler au chef de culture pour diagnostic.",wolofText:"Wétal plant bi yaaxu té wax ko chef de culture bi sassi.",phonetic:"Wétalène, plant bou mën doon sick, té wakh ko chef de culture bi, sassi, nguir mou diokh léne ndiguël."},biosecurity_rotation:{title:"Rotation culturale",french:"Ne jamais enchaîner deux cultures de la même famille sur la même parcelle pour casser le cycle des ravageurs.",wolofText:"Buleen sàkk niari culture yu bërr si béne parcelle ngir bën-bën yi.",phonetic:"Bou lène doli niari culture you bok mbole si béne parcelle, nguir dakh khonkh-khonkh yi ak rabe yi."}};let C=null,d=null;const y={getTranslation(e){return k[e]||null},speak(e){const a=k[e];a&&(this.stop(),A(()=>{if(this.showPlayerWidget(a),!("speechSynthesis"in window)){console.warn("Speech synthesis not supported by this browser.");return}const t=new SpeechSynthesisUtterance(a.phonetic),i=window.speechSynthesis.getVoices(),n=i.find(s=>s.lang.startsWith("fr"))||i[0];n&&(t.voice=n),t.lang="fr-FR",t.rate=.82,t.pitch=.95,t.onend=()=>{this.hidePlayerWidget()},t.onerror=s=>{console.error("SpeechSynthesis error",s),this.hidePlayerWidget()},C=t,window.speechSynthesis.speak(t)}))},stop(){"speechSynthesis"in window&&window.speechSynthesis.cancel(),C=null,this.hidePlayerWidget()},showPlayerWidget(e){if(this.hidePlayerWidget(),d=document.createElement("div"),d.className="fixed bottom-24 md:bottom-6 right-6 left-6 md:left-auto md:w-96 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-4 text-left z-50 animate-fade-in flex flex-col gap-3 backdrop-blur-md bg-opacity-95 text-white",d.id="wolof-audio-player",d.innerHTML=`
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-full animate-pulse">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z"/></svg>
          </div>
          <div>
            <h4 class="text-xs font-black text-emerald-400 uppercase tracking-wider">Note Vocale (Wolof)</h4>
            <p class="text-[10px] text-slate-300 font-bold">${e.title}</p>
          </div>
        </div>
        <button onclick="window.stopWolofAudio()" class="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Spoken Wolof Text transcription for accessibility -->
      <div class="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-emerald-100 italic leading-relaxed">
        "${e.wolofText}"
      </div>

      <!-- Waveform equalizer visualization -->
      <div class="flex items-center justify-between gap-3 bg-slate-950/40 p-2 rounded-xl">
        <div class="flex items-end gap-1 h-6">
          <div class="w-1 bg-emerald-500 rounded-full animate-audio-bar-1"></div>
          <div class="w-1 bg-emerald-400 rounded-full animate-audio-bar-2"></div>
          <div class="w-1 bg-emerald-500 rounded-full animate-audio-bar-3"></div>
          <div class="w-1 bg-emerald-400 rounded-full animate-audio-bar-4"></div>
          <div class="w-1 bg-emerald-500 rounded-full animate-audio-bar-5"></div>
          <div class="w-1 bg-emerald-400 rounded-full animate-audio-bar-6"></div>
          <div class="w-1 bg-emerald-500 rounded-full animate-audio-bar-7"></div>
          <div class="w-1 bg-emerald-400 rounded-full animate-audio-bar-8"></div>
        </div>
        <button onclick="window.stopWolofAudio()" class="px-3 py-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[10px] font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1 uppercase">
          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
          Arrêter
        </button>
      </div>
    `,document.body.appendChild(d),!document.getElementById("wolof-wave-animations")){const a=document.createElement("style");a.id="wolof-wave-animations",a.textContent=`
        @keyframes audioBar {
          0%, 100% { height: 4px; }
          50% { height: 22px; }
        }
        .animate-audio-bar-1 { animation: audioBar 0.6s ease-in-out infinite alternate; }
        .animate-audio-bar-2 { animation: audioBar 0.4s ease-in-out infinite alternate 0.1s; }
        .animate-audio-bar-3 { animation: audioBar 0.7s ease-in-out infinite alternate 0.2s; }
        .animate-audio-bar-4 { animation: audioBar 0.5s ease-in-out infinite alternate 0.3s; }
        .animate-audio-bar-5 { animation: audioBar 0.8s ease-in-out infinite alternate 0.15s; }
        .animate-audio-bar-6 { animation: audioBar 0.6s ease-in-out infinite alternate 0.25s; }
        .animate-audio-bar-7 { animation: audioBar 0.4s ease-in-out infinite alternate 0.35s; }
        .animate-audio-bar-8 { animation: audioBar 0.7s ease-in-out infinite alternate 0.05s; }
      `,document.head.appendChild(a)}},hidePlayerWidget(){d&&(d.classList.add("animate-fade-out"),setTimeout(()=>{d&&d.parentNode&&d.parentNode.removeChild(d),d=null},200))}};window.playWolof=e=>{y.speak(e)};window.stopWolofAudio=()=>{y.stop()};window.addEventListener("beforeunload",()=>{"speechSynthesis"in window&&window.speechSynthesis.cancel()});window.KAStorage=o;window.UserManager=v;window.WolofAudio=y;window.ErrorHandler=T;let l=null,r=!0;window.SENEGAL_WEATHER_PRESETS={dakar:{name:"Dakar (Région de Dakar)",temp:26,wind:15,humidity:82,sun:8,condition:"Nuageux et brumeux",desc:"🌊 Climat maritime humide. Idéal pour cultures maraîchères côtières.",advice:"Humidité élevée sur la côte de Dakar. Limitez l'arrosage de fin de journée pour éviter le mildiou.",lat:14.7167,lon:-17.4677,precipitation:0},diourbel:{name:"Diourbel (Bassin du Baol)",temp:33,wind:12,humidity:58,sun:10,condition:"Chaud et sec",desc:"🌾 Climat chaud et sec du Baol. Sols sableux exigeant un bon paillage.",advice:"Sols sableux. Appliquez un paillage organique épais pour retenir l'humidité.",lat:14.65,lon:-16.2333,precipitation:0},fatick:{name:"Fatick (Sine-Saloum)",temp:31,wind:14,humidity:72,sun:9,condition:"Ensoleillé avec brise marine",desc:"🌊 Estuaires du Sine-Saloum. Vigilance sur la salinité des sols maraîchers.",advice:"Vigilance sur la salinité de l'eau (tannes). Idéal pour cultures tolérantes.",lat:14.3333,lon:-16.4,precipitation:0},kaffrine:{name:"Kaffrine (Bassin Arachidier Est)",temp:33,wind:13,humidity:60,sun:10,condition:"Ensoleillé",desc:"☀️ Zone agricole ensoleillée. Vents desséchants d'Est (Harmattan léger).",advice:"Vents d'Est desséchants. Aménagez des brise-vents autour de vos planches.",lat:14.1059,lon:-15.5508,precipitation:0},kaolack:{name:"Kaolack (Bassin Arachidier)",temp:34,wind:14,humidity:55,sun:10,condition:"Très chaud et ensoleillé",desc:"☀ Climat soudano-sahélien chaud. Sols secs nécessitant une gestion fine de l'arrosage.",advice:"Températures intenses. Priorisez l'arrosage avant 8h du matin et paillez les sols.",lat:14.15,lon:-16.0833,precipitation:0},kedougou:{name:"Kédougou (Sud-Est)",temp:32,wind:9,humidity:80,sun:7,condition:"Orages isolés",desc:"⛰️ Climat soudanien humide. Forte pluviométrie, attention à l'engorgement des sols.",advice:"Précipitations d'hivernage importantes. Assurez des planches bien surélevées.",lat:12.5578,lon:-12.1744,precipitation:1.5},kolda:{name:"Kolda (Haute Casamance)",temp:32,wind:10,humidity:76,sun:8,condition:"Chaud et humide",desc:"🌳 Zone forestière chaude et humide. Excellentes conditions de sol horticole.",advice:"Humidité propice au maraîchage. Surveillez les attaques fongiques sur le gombo.",lat:12.8833,lon:-14.95,precipitation:.5},louga:{name:"Louga (Zone Sylvo-Pastorale)",temp:33,wind:17,humidity:50,sun:10,condition:"Sec et poussiéreux",desc:"🏜️ Climat sahélien sec. Évaporations élevées, irrigation goutte-à-goutte prioritaire.",advice:"Climat sahélien strict. Favorisez l'irrigation au goutte-à-goutte sous ombrage.",lat:15.6167,lon:-16.2167,precipitation:0},matam:{name:"Matam (Moyenne Vallée)",temp:36,wind:18,humidity:45,sun:11,condition:"Chaleur extrême",desc:"🔥 Chaleur extrême du Ferlo. Évapotranspiration critique de fin de journée.",advice:"Températures extrêmes. Arrosage biquotidien et paillage épais indispensables.",lat:15.6553,lon:-13.2554,precipitation:0},"saint-louis":{name:"Saint-Louis (Delta du Fleuve)",temp:29,wind:22,humidity:70,sun:10,condition:"Ensoleillé et venteux",desc:"🌾 Alizés côtiers réguliers. Conditions optimales pour la culture maraîchère de contre-saison.",advice:"Vent sec présent (Harmattan léger). Surveillez l'évaporation des pépinières.",lat:16.0167,lon:-16.5,precipitation:0},sedhiou:{name:"Sédhiou (Moyenne Casamance)",temp:31,wind:8,humidity:82,sun:8,condition:"Humide et orageux",desc:"🌱 Climat guinéen très favorable aux cultures diversifiées et vergers.",advice:"Climat très favorable. Traitez préventivement contre les champignons foliaires.",lat:12.7081,lon:-15.5569,precipitation:1.2},tambacounda:{name:"Tambacounda (Sénégal Oriental)",temp:35,wind:11,humidity:50,sun:10,condition:"Ensoleillé et torride",desc:"☀️ Zone semi-aride continentale. Températures diurnes élevées exigeant un ombrage.",advice:"Chaleur intense. Utilisez de l'ombrage artificiel pour protéger les jeunes semis.",lat:13.77,lon:-13.67,precipitation:0},thies:{name:"Thiès (Plateau / Mbour)",temp:28,wind:16,humidity:75,sun:9,condition:"Partiellement nuageux",desc:"🌅 Zone horticole majeure (Thiès & Petite Côte). Excellente rentabilité.",advice:"Climat idéal maraîcher. Excellente période pour repiquer les plants de piments.",lat:14.7833,lon:-16.9167,precipitation:0},ziguinchor:{name:"Ziguinchor (Casamance horticole)",temp:31,wind:10,humidity:78,sun:8,condition:"Averses légères d'hivernage",desc:"🌴 Zone guinéenne humide. Évaporation modérée. Idéal pour l'arboriculture.",advice:"Hivernage précoce. Assurez un bon drainage des planches de piments.",lat:12.5833,lon:-16.2667,precipitation:2}};window.WEATHER_RECOMMENDATIONS={};Object.entries(window.SENEGAL_WEATHER_PRESETS).forEach(([e,a])=>{const t=e==="saint-louis"?"Saint-Louis":e.charAt(0).toUpperCase()+e.slice(1);window.WEATHER_RECOMMENDATIONS[t]={city:a.name,temp:`${a.temp}°C`,humidity:`${a.humidity}%`,precipitation:`${a.precipitation.toFixed(1)} mm`,condition:a.condition,advice:a.advice,lat:a.lat,lon:a.lon}});window.animateValue=function(e,a,t,i=800){if(!e)return;const n=Number(a)||0,s=Number(t)||0;if(n===s){e.id.includes("revenu")||e.id.includes("depense")||e.id.includes("solde")||e.id.includes("cost")||e.id.includes("profit")?e.textContent=s.toLocaleString("fr-FR")+" F":e.id.includes("percent")?e.textContent=s+"%":e.textContent=s.toLocaleString("fr-FR");return}let m=null;const h=e.id.includes("revenu")||e.id.includes("depense")||e.id.includes("solde")||e.id.includes("cost")||e.id.includes("profit"),p=e.id.includes("percent"),x=b=>{m||(m=b);const c=Math.min((b-m)/i,1),w=1-Math.pow(1-c,3),f=Math.floor(w*(s-n)+n);h?e.textContent=f.toLocaleString("fr-FR")+" F":p?e.textContent=f+"%":e.textContent=f.toLocaleString("fr-FR"),c<1?window.requestAnimationFrame(x):h?e.textContent=s.toLocaleString("fr-FR")+" F":p?e.textContent=s+"%":e.textContent=s.toLocaleString("fr-FR")};window.requestAnimationFrame(x)};const E={init(){v.requireAuth(),l=v.getCurrentUser(),o.init();const e=window.matchMedia("(prefers-color-scheme: dark)"),a=e.matches;r=o.get("ka_farm_dark_mode",a),this.applyTheme(r);const t=i=>{r=i.matches,o.set("ka_farm_dark_mode",r),this.applyTheme(r)};try{e.addEventListener("change",t)}catch{e.addListener(t)}this.injectSidebar(),this.injectMobileHeader(),this.injectMobileBottomNav(),this.injectFooter(),this.setupGlobalListeners(),this.updateBadges()},applyTheme(e){e?(document.documentElement.classList.add("dark"),document.documentElement.classList.remove("light")):(document.documentElement.classList.add("light"),document.documentElement.classList.remove("dark"));const a=document.getElementById("dark-toggle-circle"),t=document.getElementById("dark-toggle-btn");a&&t&&(e?(t.classList.add("bg-emerald-600"),t.classList.remove("bg-slate-300"),a.classList.add("translate-x-4.5")):(t.classList.add("bg-slate-300"),t.classList.remove("bg-emerald-600"),a.classList.remove("translate-x-4.5")));const i=document.getElementById("btn-theme-desktop"),n=document.getElementById("btn-theme-mobile");i&&(i.innerHTML=`<i data-lucide="${e?"sun":"moon"}" class="h-4 w-4"></i>`),n&&(n.innerHTML=`<i data-lucide="${e?"sun":"moon"}" class="h-4.5 w-4.5"></i>`),window.lucide&&window.lucide.createIcons(),typeof window.onThemeChanged=="function"&&window.onThemeChanged(e)},toggleTheme(){r=!r,o.set("ka_farm_dark_mode",r),document.documentElement.classList.add("theme-transition"),this.applyTheme(r),setTimeout(()=>{document.documentElement.classList.remove("theme-transition")},450)},injectSidebar(){const e=document.getElementById("sidebar-placeholder");if(!e)return;e.className="lg:w-64 lg:flex-shrink-0";const a=l?l.name.split(" ").map(m=>m[0]).join(""):"KA",t=l?l.name:"Utilisateur",i=l?l.role:"Visiteur",n=l&&l.enterpriseName?l.enterpriseName:"KA Farm";l&&l.enterpriseCode&&l.enterpriseCode;const s=`
      <aside id="sidebar" class="w-64 flex-shrink-0 bg-[#06130B] dark:bg-[#06130B] text-slate-300 flex flex-col border-r border-[#143E23] z-[60] lg:sticky lg:top-0 lg:h-screen transition-all duration-300 fixed inset-y-0 left-0 transform -translate-x-full lg:translate-x-0 lg:transform-none">
        
        <!-- Sidebar Header -->
        <div class="p-5 border-b border-[#143E23] flex items-center justify-between">
          <a href="/index.html" class="flex items-center gap-3 text-left hover:opacity-90 transition-opacity">
            <!-- Custom High-Fidelity SVG KA Farm Logo -->
            <div class="h-10 w-10 bg-white/5 p-1 rounded-xl border border-[#143E23]/30 flex items-center justify-center">
              <svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Shield Outlines -->
                <path d="M50 12 C70 12, 82 15, 82 34 C82 52, 70 66, 50 75 C30 66, 18 52, 18 34 C18 15, 30 12, 50 12 Z" stroke="#10b981" stroke-width="2" stroke-linejoin="round" fill="none"/>
                <path d="M50 15 C67 15, 78 18, 78 34 C78 50, 67 63, 50 71 C33 63, 22 50, 22 34 C22 18, 33 15, 50 15 Z" stroke="#10b981" stroke-width="0.8" stroke-linejoin="round" fill="none"/>
                
                <!-- "KA" Outline -->
                <path d="M29 29 V46 M29 37 L38 29 M32 39 L39 46" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M44 46 L49 29 L54 46 M46 41 H52" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

                <!-- Sprout Icon -->
                <path d="M59 46 H71" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
                <path d="M65 46 V39" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
                <path d="M65 39 C61 39, 58 36, 58 33 C58 30, 61 29, 65 33 C65 33, 65 39, 65 39 Z" stroke="#10b981" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
                <path d="M65 37 C65 37, 72 37, 72 31 C72 28, 69 27, 65 33" stroke="#10b981" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
                
                <!-- "FARM" Text -->
                <text x="50" y="61" fill="#059669" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="12.5" text-anchor="middle" letter-spacing="1">FARM</text>
              </svg>
            </div>
            <div>
              <h1 class="text-sm font-black tracking-widest text-white leading-tight">KA FARM</h1>
              <p class="text-[10px] text-[#819888] font-bold">Maraîchage & Élevage 🇸🇳</p>
            </div>
          </a>
          <div class="flex items-center gap-1.5">
            <!-- Theme Toggle Button -->
            <button onclick="window.toggleAppTheme()" id="btn-theme-desktop" class="p-1.5 text-slate-400 hover:text-white hover:bg-[#0E2F19] rounded-lg transition-all cursor-pointer" title="Basculer le thème">
              <i data-lucide="${r?"sun":"moon"}" class="h-4 w-4"></i>
            </button>
            <button onclick="window.toggleMobileSidebar()" class="lg:hidden p-1 text-slate-400 hover:text-white">
              <i data-lucide="x" class="h-5 w-5"></i>
            </button>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-left">
          <div class="space-y-1">
            <a href="/index.html" data-tab="accueil" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="home" class="h-4 w-4"></i>
              Accueil
            </a>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-black text-[#4F6D58] uppercase tracking-widest mb-1.5">Mon Espace Personnel</p>
            <a href="/pages/shared/dashboard.html" data-tab="dashboard" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="layout-dashboard" class="h-4 w-4"></i>
              Tableau de Bord
            </a>
            <a href="/pages/personal/my-tasks.html" data-tab="tasks" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="check-square" class="h-4 w-4"></i>
                Tâches d'Entretien
              </div>
              <span id="tasks-badge" class="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-bold hidden">0</span>
            </a>
            <a href="/pages/personal/my-sales.html" data-tab="sales" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="coins" class="h-4 w-4"></i>
              Mes Ventes (Terrain)
            </a>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-black text-[#4F6D58] uppercase tracking-widest mb-1.5">Données d'Exploitation</p>
            <a href="/pages/shared/crops.html" data-tab="crops" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="folder-dot" class="h-4 w-4"></i>
                Suivi des Cultures
              </div>
              <span id="crops-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/parcelles.html" data-tab="parcelles" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="map" class="h-4 w-4"></i>
                Gestion des Parcelles
              </div>
              <span id="parcelles-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/employees.html" data-tab="employees" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="users" class="h-4 w-4"></i>
                Gestion des Employés
              </div>
              <span id="employees-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/irrigation.html" data-tab="irrigation" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="droplet" class="h-4 w-4"></i>
              Planning d'Arrosage
            </a>
            <a href="/pages/shared/calendar.html" data-tab="calendar" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-emerald-300">
              <i data-lucide="calendar-days" class="h-4 w-4 text-emerald-400"></i>
              Calendrier Agricole
            </a>
            <a href="/pages/shared/harvest.html" data-tab="harvest" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="sprout" class="h-4 w-4"></i>
              Journal des Récoltes
            </a>
            <a href="/pages/shared/treatments.html" data-tab="treatments" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="shield-alert" class="h-4 w-4"></i>
                Carnet Phytosanitaire
              </div>
              <span id="treatments-badge" class="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/finances.html" data-tab="finances" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="landmark" class="h-4 w-4"></i>
              Gestion des Finances
            </a>
            <a href="/pages/shared/profitability.html" data-tab="profitability" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="calculator" class="h-4 w-4"></i>
                Rentabilité par Culture
              </div>
              <span id="profitability-badge" class="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/stocks.html" data-tab="stocks" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <div class="flex items-center gap-3">
                <i data-lucide="package" class="h-4 w-4"></i>
                Inventaire & Stocks
              </div>
              <span id="stocks-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/market-prices.html" data-tab="market-prices" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-orange-300">
              <i data-lucide="trending-up" class="h-4 w-4 text-orange-400"></i>
              Prix du Marché
            </a>
            <a href="/pages/shared/tools-sharing.html" data-tab="tools-sharing" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-cyan-300">
              <i data-lucide="tools" class="h-4 w-4 text-cyan-400"></i>
              Bourse d'Outils
            </a>
            <a href="/pages/shared/elevage.html" data-tab="elevage" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-[#ffedd5]">
              <div class="flex items-center gap-3">
                <i data-lucide="paw-print" class="h-4 w-4 text-amber-400"></i>
                Suivi de l'Élevage
              </div>
              <span id="elevage-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">0</span>
            </a>
            <a href="/pages/shared/alerts.html" data-tab="alerts" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-rose-300">
              <i data-lucide="alert-triangle" class="h-4 w-4 text-rose-400"></i>
              Alertes Sanitaires
            </a>
            <a href="/pages/shared/training.html" data-tab="training" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-[#a5f3fc]">
              <i data-lucide="graduation-cap" class="h-4 w-4 text-cyan-400"></i>
              Guides de Formation
            </a>
            <a href="/pages/shared/discussion.html" data-tab="discussion" class="nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-emerald-300">
              <div class="flex items-center gap-3">
                <i data-lucide="message-square" class="h-4 w-4 text-emerald-400"></i>
                Discussion Frères
              </div>
              <span id="messages-badge" class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold hidden">0</span>
            </a>
          </div>

          <div class="space-y-1">
            <p class="px-3 text-[10px] font-black text-[#4F6D58] uppercase tracking-widest mb-1.5">Configuration</p>
            <a href="/pages/personal/profile.html" data-tab="profile" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="user" class="h-4 w-4"></i>
              Mon Profil & Réseaux
            </a>
            <a href="/pages/personal/settings.html" data-tab="settings" class="nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <i data-lucide="settings" class="h-4 w-4"></i>
              Paramètres
            </a>
            <button onclick="window.handleLogout()" class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-[#0E2F19] hover:text-white cursor-pointer transition-all">
              <i data-lucide="log-out" class="h-4 w-4"></i>
              Déconnexion
            </button>
          </div>
        </div>

        <!-- Sidebar Footer User Panel -->
        <div class="p-4 border-t border-[#143E23] space-y-3 bg-[#051009]">
            <div class="px-1 text-left">
            <div class="flex items-center gap-2.5">
              <div id="user-avatar" class="h-8 w-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs border border-emerald-500/30 flex-shrink-0">${a}</div>
              <div class="flex-1 min-w-0">
                <p id="user-name-display" class="text-xs font-black text-white truncate leading-none">${t}</p>
                <p id="user-role-display" class="text-[9px] text-[#819888] font-bold mt-0.5 uppercase tracking-wider">${i}</p>
                <p class="text-[9px] text-emerald-400 font-medium truncate mt-0.5">${n}</p>
              </div>
            </div>
          </div>

          
          <div class="flex items-center justify-between text-[11px] font-bold text-[#819888] px-1 pt-1 border-t border-[#143E23]/40">
            <span class="flex items-center gap-1"><i data-lucide="moon" class="h-3.5 w-3.5 text-emerald-500"></i> Sombre</span>
            <button onclick="window.toggleAppTheme()" id="dark-toggle-btn" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r?"bg-emerald-600":"bg-slate-300"}">
              <span id="dark-toggle-circle" class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${r?"translate-x-4.5":""}"></span>
            </button>
          </div>
        </div>
      </aside>
    `;e.innerHTML=s,document.dispatchEvent(new Event("sidebarInjected"))},injectMobileHeader(){const e=document.getElementById("mobile-header-placeholder");e&&(e.innerHTML=`
      <div class="lg:hidden flex items-center justify-between px-4 py-3 bg-[#06130B] border-b border-[#143E23] text-white">
        <a href="/index.html" class="flex items-center gap-2.5">
          <!-- Custom High-Fidelity SVG KA Farm Logo -->
          <div class="h-9 w-9 bg-white/5 p-0.5 rounded-lg border border-[#143E23]/30 flex items-center justify-center">
            <svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Shield Outlines -->
              <path d="M50 12 C70 12, 82 15, 82 34 C82 52, 70 66, 50 75 C30 66, 18 52, 18 34 C18 15, 30 12, 50 12 Z" stroke="#10b981" stroke-width="2" stroke-linejoin="round" fill="none"/>
              <path d="M50 15 C67 15, 78 18, 78 34 C78 50, 67 63, 50 71 C33 63, 22 50, 22 34 C22 18, 33 15, 50 15 Z" stroke="#10b981" stroke-width="0.8" stroke-linejoin="round" fill="none"/>
              
              <!-- "KA" Outline -->
              <path d="M29 29 V46 M29 37 L38 29 M32 39 L39 46" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M44 46 L49 29 L54 46 M46 41 H52" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

              <!-- Sprout Icon -->
              <path d="M59 46 H71" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
              <path d="M65 46 V39" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
              <path d="M65 39 C61 39, 58 36, 58 33 C58 30, 61 29, 65 33 C65 33, 65 39, 65 39 Z" stroke="#10b981" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
              <path d="M65 37 C65 37, 72 37, 72 31 C72 28, 69 27, 65 33" stroke="#10b981" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
              
              <!-- "FARM" Text -->
              <text x="50" y="61" fill="#059669" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="12.5" text-anchor="middle" letter-spacing="1">FARM</text>
            </svg>
          </div>
          <div>
            <span class="font-extrabold text-sm tracking-tight">KA FARM</span>
            <p class="text-[9px] text-emerald-400 leading-none font-bold">Sénégal • Maraîchage</p>
          </div>
        </a>
        <div class="flex items-center gap-2">
          <!-- Status profile pill -->
          <span class="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-emerald-500/10 text-[9px] font-extrabold text-emerald-400 border border-emerald-500/20">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ${l?l.name.split(" ")[0]:"Amadou"}
          </span>
          <!-- Theme Toggle Button -->
          <button onclick="window.toggleAppTheme()" id="btn-theme-mobile" class="p-1.5 text-slate-300 hover:text-white hover:bg-[#0E2F19] rounded-lg transition-all cursor-pointer" title="Basculer le thème">
            <i data-lucide="${r?"sun":"moon"}" class="h-4.5 w-4.5"></i>
          </button>
        </div>
      </div>
    `)},injectMobileBottomNav(){if(document.getElementById("mobile-bottom-nav"))return;const e=document.createElement("nav");e.id="mobile-bottom-nav",e.className="fixed bottom-0 left-0 right-0 h-16 bg-[#06130B]/95 dark:bg-[#06130B]/95 backdrop-blur-md border-t border-[#143E23] flex items-center justify-around px-2 z-50 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.45)]",e.innerHTML=`
      <a href="/pages/shared/dashboard.html" data-tab="dashboard" class="mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 text-slate-400 dark:text-[#819888] hover:text-emerald-400 dark:hover:text-emerald-400 transition-all duration-200">
        <i data-lucide="layout-dashboard" class="h-5 w-5"></i>
        <span class="text-[9px] font-black mt-1 tracking-tight">Tableau</span>
        <span class="mobile-nav-dot scale-0"></span>
      </a>
      <a href="/pages/shared/parcelles.html" data-tab="parcelles" class="mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 text-slate-400 dark:text-[#819888] hover:text-emerald-400 dark:hover:text-emerald-400 transition-all duration-200">
        <i data-lucide="map" class="h-5 w-5"></i>
        <span class="text-[9px] font-black mt-1 tracking-tight">Parcelles</span>
        <span class="mobile-nav-dot scale-0"></span>
      </a>
      <a href="/pages/shared/crops.html" data-tab="crops" class="mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 text-slate-400 dark:text-[#819888] hover:text-emerald-400 dark:hover:text-emerald-400 transition-all duration-200">
        <i data-lucide="sprout" class="h-5 w-5"></i>
        <span class="text-[9px] font-black mt-1 tracking-tight">Cultures</span>
        <span class="mobile-nav-dot scale-0"></span>
      </a>
      <a href="/pages/shared/elevage.html" data-tab="elevage" class="mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 text-slate-400 dark:text-[#819888] hover:text-emerald-400 dark:hover:text-emerald-400 transition-all duration-200">
        <i data-lucide="paw-print" class="h-5 w-5"></i>
        <span class="text-[9px] font-black mt-1 tracking-tight">Élevage</span>
        <span class="mobile-nav-dot scale-0"></span>
      </a>
      <button onclick="window.toggleMobileSidebar()" class="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 dark:text-[#819888] hover:text-emerald-400 dark:hover:text-emerald-400 cursor-pointer transition-all duration-200">
        <i data-lucide="menu" class="h-5 w-5"></i>
        <span class="text-[9px] font-black mt-1 tracking-tight">Menu</span>
        <span class="mobile-nav-dot scale-0 invisible"></span>
      </button>
    `,document.body.appendChild(e),window.lucide&&window.lucide.createIcons(),setTimeout(()=>{document.dispatchEvent(new Event("sidebarInjected"))},50)},injectFooter(){const e=document.querySelector("main");if(e&&!document.getElementById("app-global-footer")){const a=document.createElement("footer");a.id="app-global-footer",a.className="mt-12 py-6 border-t border-slate-150 dark:border-[#143E23]/15 text-center text-[11px] text-slate-400 dark:text-[#5F8369] font-medium w-full",a.innerHTML=`
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto px-6">
          <div class="flex items-center gap-1.5">
            <span>&copy; 2024 <span class="font-black text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">KA Farm</span>. Tous droits réservés</span>
          </div>
          <div class="flex items-center gap-2 bg-slate-50 dark:bg-[#051108] border border-slate-100 dark:border-[#143E23]/20 px-3 py-1.5 rounded-full text-[10px] text-slate-400 dark:text-[#5F8369]">
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Système Horticole &bull; Sénégal</span>
          </div>
        </div>
      `,e.appendChild(a)}},setupGlobalListeners(){window.toggleMobileSidebar=()=>{const e=document.getElementById("sidebar");if(e)if(e.classList.contains("active")){e.classList.add("-translate-x-full"),e.classList.remove("active");const t=document.getElementById("sidebar-backdrop");t&&(t.classList.remove("opacity-100"),t.classList.add("opacity-0"),setTimeout(()=>{t.remove()},300))}else{e.classList.remove("-translate-x-full"),e.classList.add("active");let t=document.getElementById("sidebar-backdrop");t||(t=document.createElement("div"),t.id="sidebar-backdrop",t.className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 opacity-0",t.onclick=window.toggleMobileSidebar,document.body.appendChild(t),setTimeout(()=>{t.classList.remove("opacity-0"),t.classList.add("opacity-100")},10))}},window.toggleAppTheme=()=>{this.toggleTheme()},window.handleLogout=()=>{confirm("Êtes-vous sûr de vouloir vous déconnecter ?")&&(o.setCurrentUser(null),window.location.href="/pages/auth/login.html")},window.lucide&&window.lucide.createIcons(),document.addEventListener("sidebarInjected",()=>{window.lucide&&window.lucide.createIcons()}),document.addEventListener("click",e=>{const a=e.target;if(!a)return;let t=null;if(a.hasAttribute("data-lucide")||a.tagName==="SVG"||a.closest("[data-lucide]"))t=a.hasAttribute("data-lucide")||a.tagName==="SVG"?a:a.closest("[data-lucide]");else{const i=a.closest('button, a, .nav-btn, [role="button"], .tab-btn');i&&(t=i.querySelector("[data-lucide], svg"))}t&&(t.classList.remove("animate-icon-pop"),t.offsetWidth,t.classList.add("animate-icon-pop"),setTimeout(()=>{t.classList.remove("animate-icon-pop")},350))})},updateBadges(){const e=o.getCrops(),a=document.getElementById("crops-badge");a&&(a.textContent=e.length);const t=o.getParcelles(),i=document.getElementById("parcelles-badge");i&&(i.textContent=t.length);const n=o.getEmployees?o.getEmployees():[],s=document.getElementById("employees-badge");s&&(s.textContent=n.length);const h=o.getTasks().filter(u=>!u.completed).length,p=document.getElementById("tasks-badge");p&&(h>0?(p.textContent=h,p.classList.remove("hidden")):p.classList.add("hidden"));const x=o.getStocks(),b=x.filter(u=>u.quantity<=u.maxQuantity*.2).length,c=document.getElementById("stocks-badge");c&&(b>0?(c.textContent=`${b} Bas`,c.className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full font-bold"):(c.textContent=x.length,c.className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold"));const w=o.getCheptel?o.getCheptel():[],f=w.filter(u=>u.status==="Surveiller"||u.status==="Malade"||u.status==="Alerte").length,g=document.getElementById("elevage-badge");g&&(f>0?(g.textContent=`${f} Alerte`,g.className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-bold"):(g.textContent=w.length,g.className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold"))}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{E.init()}):E.init();
