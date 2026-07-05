/**
 * KA Farm - Wolof Audio Assistant & Text-To-Speech System
 * Provides phonetic Wolof voice translations and audio-assisted instructions
 * for farm hands and terrain workers in Senegal.
 */

// Procedural radio chime / walkie-talkie beep to simulate farm communications
function playRadioBeep(onComplete) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      if (onComplete) onComplete();
      return;
    }
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    
    setTimeout(() => {
      ctx.close();
      if (onComplete) onComplete();
    }, 120);
  } catch (e) {
    console.error("AudioContext beep failed", e);
    if (onComplete) onComplete();
  }
}

// Map of texts to their Wolof translations (written phonetically for French TTS voice synthesis)
const WOLOF_TRANSLATIONS = {
  // --- Irrigation Advice ---
  irrigation_standard: {
    title: "Conseil d'irrigation standard",
    french: "Climat standard. Maintenez le temps d'arrosage habituel de 20 minutes par vanne.",
    wolofText: "Arrosage normal na : niar fukki minutes par vanne ni nguen ko baaxe.",
    phonetic: "Clima bi, normal na. Arrossé lène, niar fouki minutes par vanne, ni nguène ko baakhé."
  },
  irrigation_drought: {
    title: "Conseil forte chaleur",
    french: "Forte chaleur détectée. Augmentez l'irrigation à 30 minutes par vanne.",
    wolofText: "Tangay bi rëy na lool : yokkuleen arrosage bi ba fanwéer minutes par vanne.",
    phonetic: "Tangaye bi reuye na lool. Yokou lène, arrossage bi, ba fanwère minutes par vanne, nguir ratakhal souf si."
  },
  irrigation_rain: {
    title: "Conseil pluie détectée",
    french: "Pluie ou humidité élevée. Réduisez ou suspendez l'arrosage.",
    wolofText: "Taw na walla tooy na lool : waññileen walla taxawaleen arrosage bi.",
    phonetic: "Taw na, wala nguelaw li dafa toye lool. Wagnilène, wala deudjelène, arrossage bi."
  },

  // --- Sanitary Alerts / Diseases ---
  alert_tuta_absoluta: {
    title: "Alerte Mineuse de la Tomate",
    french: "Feuilles flétries avec galeries foliaires argentées... suspicion de Mineuse de la Tomate.",
    wolofText: "Feuilles yi dafa sew té tooy te xat-xat nekk si biir. Dina mën doon Tuta Absoluta. Teetleen xob yaaxu yi te arrossé leen ak neem.",
    phonetic: "Attention! Khob yi, dafa sew té toye, té khate-khate nek si biir. Dina meun doon, Touta Absolouta. Teet lène khob yaakhou yi, té arrossé lène ak neem."
  },
  alert_mildiou: {
    title: "Alerte Humidité & Mildiou",
    french: "Éviter d'arroser les feuilles en fin de journée. Favoriser l'arrosage au pied par goutte-à-goutte pour maintenir le feuillage sec.",
    wolofText: "Buleen arrossé xob yi si ngoon. Yokkuleen goutte-à-goutte bi ngir xob yi wow té aéré.",
    phonetic: "Bou lène arrossé khob yi si ngoon. Yokouleun goutte à goutte bi, nguir khob yi wow, té aéré."
  },
  alert_preventive_neem: {
    title: "Traitement préventif Neem",
    french: "Pulvérisation préventive hebdomadaire de purin de Neem ou savon noir bio. Enlever et brûler immédiatement les feuilles attaquées.",
    wolofText: "War ngënn di arrossé ak neem walla savon noir bën bën fann yu nekk. Day leen sàggi dëj jinn yi.",
    phonetic: "War nguène di puss-pussé ak sabou niame wala neem, béne yone par sémane. Teet lène khob yaakhou yi té lakk lène ko sassi."
  },

  // --- Biosecurity Guidelines ---
  biosecurity_entry: {
    title: "Protocole d'entrée",
    french: "Désinfection systématique des mains et des outils de coupe avant d'entrer dans la serre ou la parcelle.",
    wolofText: "Setal loxox yi ak tool yi avant ngéney dug si bir parcelle bi.",
    phonetic: "Rakhass lène, té désemphecté, loxo yi ak outi yi, avant nguéney doug si biir serre bi, wala parcelle bi."
  },
  biosecurity_quarantine: {
    title: "Zone de quarantaine",
    french: "Isoler immédiatement tout plant suspect et signaler au chef de culture pour diagnostic.",
    wolofText: "Wétal plant bi yaaxu té wax ko chef de culture bi sassi.",
    phonetic: "Wétalène, plant bou mën doon sick, té wakh ko chef de culture bi, sassi, nguir mou diokh léne ndiguël."
  },
  biosecurity_rotation: {
    title: "Rotation culturale",
    french: "Ne jamais enchaîner deux cultures de la même famille sur la même parcelle pour casser le cycle des ravageurs.",
    wolofText: "Buleen sàkk niari culture yu bërr si béne parcelle ngir bën-bën yi.",
    phonetic: "Bou lène doli niari culture you bok mbole si béne parcelle, nguir dakh khonkh-khonkh yi ak rabe yi."
  }
};

let activeUtterance = null;
let playerWidget = null;

export const WolofAudio = {
  getTranslation(key) {
    return WOLOF_TRANSLATIONS[key] || null;
  },

  speak(key) {
    const data = WOLOF_TRANSLATIONS[key];
    if (!data) return;

    // Stop existing synthesis
    this.stop();

    // Play walkie-talkie chime first, then execute speech synthesis
    playRadioBeep(() => {
      this.showPlayerWidget(data);

      if (!('speechSynthesis' in window)) {
        console.warn("Speech synthesis not supported by this browser.");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(data.phonetic);
      
      // Select a warm, slower French voice to match standard phonetic reading in Senegal
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find(v => v.lang.startsWith('fr')) || voices[0];
      
      if (frVoice) {
        utterance.voice = frVoice;
      }
      
      utterance.lang = 'fr-FR';
      utterance.rate = 0.82; // slightly slower for high clarity
      utterance.pitch = 0.95; // warm, comfortable resonance

      utterance.onend = () => {
        this.hidePlayerWidget();
      };

      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error", e);
        this.hidePlayerWidget();
      };

      activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  },

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtterance = null;
    this.hidePlayerWidget();
  },

  showPlayerWidget(data) {
    // Remove existing if present
    this.hidePlayerWidget();

    playerWidget = document.createElement('div');
    playerWidget.className = "fixed bottom-24 md:bottom-6 right-6 left-6 md:left-auto md:w-96 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-4 text-left z-50 animate-fade-in flex flex-col gap-3 backdrop-blur-md bg-opacity-95 text-white";
    playerWidget.id = "wolof-audio-player";
    
    playerWidget.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-full animate-pulse">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z"/></svg>
          </div>
          <div>
            <h4 class="text-xs font-black text-emerald-400 uppercase tracking-wider">Note Vocale (Wolof)</h4>
            <p class="text-[10px] text-slate-300 font-bold">${data.title}</p>
          </div>
        </div>
        <button onclick="window.stopWolofAudio()" class="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Spoken Wolof Text transcription for accessibility -->
      <div class="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-emerald-100 italic leading-relaxed">
        "${data.wolofText}"
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
    `;

    document.body.appendChild(playerWidget);

    // Dynamic wave animation keyframes style tag injection if missing
    if (!document.getElementById('wolof-wave-animations')) {
      const style = document.createElement('style');
      style.id = 'wolof-wave-animations';
      style.textContent = `
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
      `;
      document.head.appendChild(style);
    }
  },

  hidePlayerWidget() {
    if (playerWidget) {
      playerWidget.classList.add('animate-fade-out');
      setTimeout(() => {
        if (playerWidget && playerWidget.parentNode) {
          playerWidget.parentNode.removeChild(playerWidget);
        }
        playerWidget = null;
      }, 200);
    }
  }
};

// Register globally so HTML elements can easily run onclick="window.playWolof('key')"
window.playWolof = (key) => {
  WolofAudio.speak(key);
};

window.stopWolofAudio = () => {
  WolofAudio.stop();
};

// Listen for system/page unload to terminate any running audio
window.addEventListener('beforeunload', () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
});
