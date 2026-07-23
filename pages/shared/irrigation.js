import { KAStorage } from '/js/storage.js';

const defaultWatering = [
  { id: 'W-1', crop: 'Tomate Galmi (Planche 1)', day: 'Lundi', time: 'Matin', done: true },
  { id: 'W-2', crop: 'Tomate Galmi (Planche 1)', day: 'Lundi', time: 'Soir', done: false },
  { id: 'W-3', crop: 'Carottes (Planche Ouest)', day: 'Lundi', time: 'Matin', done: true },
  { id: 'W-4', crop: 'Pépinière Poivrons', day: 'Mardi', time: 'Matin', done: false },
  { id: 'W-5', crop: 'Pépinière Poivrons', day: 'Mardi', time: 'Soir', done: false },
  { id: 'W-6', crop: 'Choux Cabus', day: 'Mercredi', time: 'Matin', done: false },
];

function getWatering() {
  const saved = localStorage.getItem('ka_farm_watering');
  if (!saved) {
    localStorage.setItem('ka_farm_watering', JSON.stringify(defaultWatering));
    return defaultWatering;
  }
  return JSON.parse(saved);
}

function saveWatering(data) {
  localStorage.setItem('ka_farm_watering', JSON.stringify(data));
}

function renderDaysHeader() {
  const grid = document.getElementById('weekly-days-grid');
  if (!grid) return;

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const currentDayName = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const normalizedToday = currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1);

  const items = getWatering();

  grid.innerHTML = days.map(day => {
    const dayItems = items.filter(it => it.day === day);
    const doneCount = dayItems.filter(it => it.done).length;
    const totalCount = dayItems.length;

    let statusBg = 'bg-white dark:bg-[#0B2112]/40';
    let ring = 'border-slate-100 dark:border-[#143E23]/20';
    if (day.toLowerCase() === normalizedToday.toLowerCase()) {
      statusBg = 'bg-sky-500/10 dark:bg-sky-500/5';
      ring = 'border-sky-500/30';
    }

    return `
      <div class="p-3 ${statusBg} border ${ring} rounded-2xl text-center space-y-1">
        <p class="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wider">${day.slice(0, 3)}</p>
        <p class="text-xs font-black text-slate-800 dark:text-white">${day}</p>
        <p class="text-[9px] text-sky-400 font-bold">${doneCount}/${totalCount} fait</p>
      </div>
    `;
  }).join('');
}

function renderWateringTasks() {
  const container = document.getElementById('watering-tasks-container');
  if (!container) return;

  const items = getWatering();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400">
        <p class="text-xs font-bold">Aucune session d'arrosage planifiée.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(it => {
    const textClass = it.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200';
    const icon = it.time === 'Matin' ? '🌅 Matin' : '🌇 Soir';

    return `
      <div class="p-4 bg-slate-50 dark:bg-[#061109]/30 border border-slate-100 dark:border-[#143E23]/25 rounded-2xl flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 text-left">
          <input type="checkbox" ${it.done ? 'checked' : ''}
                 onclick="window.toggleWateringDone('${it.id}')"
                 class="accent-sky-500 h-5 w-5 rounded-lg border-slate-300 dark:border-emerald-950 bg-slate-50 cursor-pointer">
          <div>
            <p class="text-xs font-black ${textClass}">${it.crop}</p>
            <div class="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 font-extrabold">
              <span>📅 ${it.day}</span>
              <span>•</span>
              <span class="text-sky-400">${icon}</span>
            </div>
          </div>
        </div>

        <button onclick="window.deleteWatering('${it.id}')" class="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#143E23]/25 transition-all cursor-pointer">
          <i data-lucide="trash-2" class="h-4 w-4"></i>
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

window.toggleWateringDone = (id) => {
  const items = getWatering();
  const idx = items.findIndex(it => it.id === id);
  if (idx !== -1) {
    items[idx].done = !items[idx].done;
    saveWatering(items);
    renderWateringTasks();
    renderDaysHeader();
  }
};

window.deleteWatering = (id) => {
  if (!confirm('Retirer ce tour d\'eau ?')) return;
  const items = getWatering().filter(it => it.id !== id);
  saveWatering(items);
  renderWateringTasks();
  renderDaysHeader();
};

document.getElementById('watering-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const crop = document.getElementById('water-crop').value;
  const day = document.getElementById('water-day').value;
  const time = document.getElementById('water-time').value;

  if (!crop) return;

  const items = getWatering();
  items.push({
    id: `W-${Date.now()}`,
    crop,
    day,
    time,
    done: false
  });

  saveWatering(items);
  document.getElementById('watering-form').reset();
  renderWateringTasks();
  renderDaysHeader();
  if (window.ErrorHandler) {
    window.ErrorHandler.showToast('Tour d\'irrigation programmé !', 'success');
  }
});

// City and Weather Presets for Senegal - obtained from centralized source in app.js
const CITY_PRESETS = window.SENEGAL_WEATHER_PRESETS || {
  dakar: { name: 'Dakar (Région de Dakar)', temp: 26, wind: 15, humidity: 82, sun: 8, desc: '🌊 Climat maritime humide. Idéal pour cultures maraîchères côtières.' },
  diourbel: { name: 'Diourbel (Bassin du Baol)', temp: 33, wind: 12, humidity: 58, sun: 10, desc: '🌾 Climat chaud et sec du Baol. Sols sableux exigeant un bon paillage.' },
  fatick: { name: 'Fatick (Sine-Saloum)', temp: 31, wind: 14, humidity: 72, sun: 9, desc: '🌊 Estuaires du Sine-Saloum. Vigilance sur la salinité des sols maraîchers.' },
  kaffrine: { name: 'Kaffrine (Bassin Arachidier Est)', temp: 33, wind: 13, humidity: 60, sun: 10, desc: '☀️ Zone agricole ensoleillée. Vents desséchants d\'Est (Harmattan léger).' },
  kaolack: { name: 'Kaolack (Bassin Arachidier)', temp: 36, wind: 14, humidity: 35, sun: 10, desc: '☀ Climat soudano-sahélien chaud. Sols secs nécessitant une gestion fine de l\'arrosage.' },
  kedougou: { name: 'Kédougou (Sud-Est)', temp: 32, wind: 9, humidity: 80, sun: 7, desc: '⛰️ Climat soudanien humide. Forte pluviométrie, attention à l\'engorgement des sols.' },
  kolda: { name: 'Kolda (Haute Casamance)', temp: 32, wind: 10, humidity: 76, sun: 8, desc: '🌳 Zone forestière chaude et humide. Excellentes conditions de sol horticole.' },
  louga: { name: 'Louga (Zone Sylvo-Pastorale)', temp: 33, wind: 17, humidity: 50, sun: 10, desc: '🏜️ Climat sahélien sec. Évaporations élevées, irrigation goutte-à-goutte prioritaire.' },
  matam: { name: 'Matam (Moyenne Vallée)', temp: 39, wind: 18, humidity: 20, sun: 11, desc: '🔥 Chaleur extrême du Ferlo. Évapotranspiration critique de fin de journée.' },
  'saint-louis': { name: 'Saint-Louis (Vallée)', temp: 32, wind: 22, humidity: 50, sun: 10, desc: '🌾 Alizés côtiers réguliers. Conditions optimales pour la culture maraîchère de contre-saison.' },
  sedhiou: { name: 'Sédhiou (Moyenne Casamance)', temp: 31, wind: 8, humidity: 82, sun: 8, desc: '🌱 Climat guinéen très favorable aux cultures diversifiées et vergers.' },
  tambacounda: { name: 'Tambacounda (Sénégal Oriental)', temp: 35, wind: 11, humidity: 50, sun: 10, desc: '☀️ Zone semi-aride continentale. Températures diurnes élevées exigeant un ombrage.' },
  thies: { name: 'Thiès (Plateau / Mbour)', temp: 29, wind: 16, humidity: 55, sun: 9, desc: '🌅 Zone horticole majeure (Thiès & Petite Côte). Excellente rentabilité.' },
  ziguinchor: { name: 'Ziguinchor (Casamance)', temp: 28, wind: 10, humidity: 75, sun: 8, desc: '🌴 Zone guinéenne humide. Évaporation modérée. Idéal pour l\'arboriculture.' }
};

const CROP_COEFFICIENTS = {
  tomate: { name: 'Tomate', kc: 1.15 },
  carotte: { name: 'Carotte', kc: 1.00 },
  oignon: { name: 'Oignon', kc: 1.05 },
  poivron: { name: 'Poivron', kc: 1.05 },
  chou: { name: 'Chou', kc: 1.05 },
  gombo: { name: 'Gombo', kc: 0.95 }
};

function calculateET0(temp, wind, humidity, sun) {
  const tContrib = temp * 0.14;
  const wContrib = wind * 0.08;
  const hContrib = (100 - humidity) * 0.05;
  const sContrib = sun * 0.3;

  let et0 = (tContrib + wContrib + hContrib + sContrib) / 2.4;
  et0 = Math.max(1.5, Math.min(11.0, et0));
  return parseFloat(et0.toFixed(1));
}

window.updateET0Calculations = () => {
  const temp = parseInt(document.getElementById('param-temp').value);
  const wind = parseInt(document.getElementById('param-wind').value);
  const humidity = parseInt(document.getElementById('param-humidity').value);
  const sun = parseInt(document.getElementById('param-sun').value);
  const cropKey = document.getElementById('param-crop').value;
  const solKey = document.getElementById('param-sol').value;
  const surface = parseInt(document.getElementById('param-surface').value);

  // Update Slider value displays
  document.getElementById('temp-val').textContent = `${temp} °C`;
  document.getElementById('wind-val').textContent = `${wind} km/h`;
  document.getElementById('humidity-val').textContent = `${humidity} %`;
  document.getElementById('sun-val').textContent = `${sun} h/j`;

  const solNames = {
    sableux: 'Sableux (Dakar)',
    argileux: 'Argileux (Fleuve)',
    limoneux: 'Argilo-limoneux'
  };
  document.getElementById('sol-val').textContent = solNames[solKey] || 'Sableux';
  document.getElementById('surface-val').textContent = `${surface} m²`;

  // Calculate reference ET0
  const et0 = calculateET0(temp, wind, humidity, sun);

  // Calculate crop-specific ETc
  const crop = CROP_COEFFICIENTS[cropKey] || { name: 'Culture', kc: 1.0 };
  const etc = parseFloat((et0 * crop.kc).toFixed(1));

  document.getElementById('kc-val').textContent = `Kc: ${crop.kc}`;
  document.getElementById('et0-value').textContent = et0;
  document.getElementById('etc-value').textContent = etc;

  // Get badges and advice
  const badge = document.getElementById('et0-badge');
  const advice = document.getElementById('watering-advice-text');
  const suggest = document.getElementById('watering-time-suggest');
  const volumeSuggest = document.getElementById('watering-volume-suggest');
  const splitBadge = document.getElementById('cycle-split-badge');

  badge.className = "inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ";

  // Calculate recommended minutes
  let recMinutes = Math.round(20 * (etc / 4.2));

  // Adjust minutes based on Soil Type
  let soilAdvice = "";
  if (solKey === 'sableux') {
    recMinutes = Math.round(recMinutes * 1.15);
    recMinutes = Math.max(12, Math.min(50, recMinutes));
    const halfMinutes = Math.round(recMinutes / 2);
    suggest.textContent = `${halfMinutes} min matin / ${halfMinutes} min soir`;
    splitBadge.textContent = "2 cycles (Sable)";
    splitBadge.className = "text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-extrabold uppercase";
    soilAdvice = " Sols sableux : arrosez en 2 sessions matin/soir pour réduire le lessivage des nutriments.";
  } else if (solKey === 'argileux') {
    recMinutes = Math.round(recMinutes * 0.9);
    recMinutes = Math.max(10, Math.min(40, recMinutes));
    suggest.textContent = `${recMinutes} minutes le matin`;
    splitBadge.textContent = "1 cycle (Argile)";
    splitBadge.className = "text-[9px] px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded-md font-extrabold uppercase";
    soilAdvice = " Sols argileux : un seul arrosage matinal profond suffit, la rétention est maximale.";
  } else {
    recMinutes = Math.max(10, Math.min(45, recMinutes));
    suggest.textContent = `${recMinutes} minutes le matin`;
    splitBadge.textContent = "1 cycle (Limon)";
    splitBadge.className = "text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-350 rounded-md font-extrabold uppercase";
    soilAdvice = " Sols limoneux : structure idéale, arrosage régulier équilibré.";
  }

  // Calculate total volume needed in Litres: ETc * surface (since 1 mm = 1 L/m²)
  // Add safety margins for sandy soil
  let volumeLitres = etc * surface;
  if (solKey === 'sableux') volumeLitres *= 1.15; // 15% leaching loss allowance
  volumeLitres = Math.round(volumeLitres);
  volumeSuggest.textContent = `${volumeLitres.toLocaleString('fr-FR')} Litres`;

  if (et0 < 3.0) {
    badge.textContent = "ET₀ Faible";
    badge.className += "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    advice.textContent = `L'évapotranspiration est faible. Réduisez l'arrosage de 30% pour préserver les racines.${soilAdvice}`;
  } else if (et0 >= 3.0 && et0 < 5.0) {
    badge.textContent = "ET₀ Modérée";
    badge.className += "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    advice.textContent = `Climat équilibré. Les besoins réels de la culture (${crop.name}) s'élèvent à ${etc} mm aujourd'hui.${soilAdvice}`;
  } else if (et0 >= 5.0 && et0 < 7.0) {
    badge.textContent = "ET₀ Élevée";
    badge.className += "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    advice.textContent = `⚠️ Transpiration soutenue due au vent ou à la chaleur. Augmentez l'irrigation de 25% pour combler le déficit hydrique.${soilAdvice}`;
  } else {
    badge.textContent = "ET₀ Critique";
    badge.className += "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    advice.textContent = `🚨 Vent sec (Harmattan) ou canicule intense ! Augmentez l'arrosage de 50% tôt le matin ou après 17h.${soilAdvice}`;
  }
};

window.onCityChange = (cityKey) => {
  const display = document.getElementById('weather-quick-display');

  if (cityKey === 'custom') {
    display.innerHTML = `
      <div class="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
        <p class="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <i data-lucide="sliders" class="h-3 w-3"></i> Mode Manuel Actif
        </p>
        <p class="text-[10px] text-slate-400 mt-1">Ajustez librement les curseurs à droite pour simuler vos propres conditions.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const preset = CITY_PRESETS[cityKey];
  if (!preset) return;

  // Update inputs
  document.getElementById('param-temp').value = preset.temp;
  document.getElementById('param-wind').value = preset.wind;
  document.getElementById('param-humidity').value = preset.humidity;
  document.getElementById('param-sun').value = preset.sun;

  // Show quick weather info card
  display.innerHTML = `
    <div class="space-y-1.5 text-[11px]">
      <p class="font-extrabold text-slate-800 dark:text-slate-200">${preset.name}</p>
      <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium">${preset.desc}</p>
      <div class="grid grid-cols-2 gap-2 pt-1 border-t border-[#143E23]/10">
        <span class="text-slate-400">🌡 Temp: <strong class="text-slate-750 dark:text-slate-200">${preset.temp}°C</strong></span>
        <span class="text-slate-400">💨 Vent: <strong class="text-slate-750 dark:text-slate-200">${preset.wind} km/h</strong></span>
        <span class="text-slate-400">💧 Humid: <strong class="text-slate-750 dark:text-slate-200">${preset.humidity}%</strong></span>
        <span class="text-slate-400">☀ Soleil: <strong class="text-slate-750 dark:text-slate-200">${preset.sun} h/j</strong></span>
      </div>
    </div>
  `;

  window.updateET0Calculations();
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

// Start
renderDaysHeader();
renderWateringTasks();
window.onCityChange('thies');

// ==================== INTEGRATION CALCULATEUR D'IRRIGATION ====================
window.updateCalcDisplay = () => {
  if (window.IrrigationModule && typeof window.IrrigationModule.calculateAndDisplay === 'function') {
    window.IrrigationModule.calculateAndDisplay();
  }
};

// Afficher/masquer les résultats
const calcBtn = document.getElementById('btn-calculate-irrigation');
if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const results = document.getElementById('calc-results');
    if (results) {
      results.classList.remove('hidden');
    }
    window.updateCalcDisplay();
  });
}
