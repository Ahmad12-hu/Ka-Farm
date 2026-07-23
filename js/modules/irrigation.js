// KA Farm - Calculateur d'Irrigation Intelligente
import { KAStorage } from '../storage.js';
import { ErrorHandler } from './error-handler.js';
import { UserManager } from '../user-manager.js';

// Coefficients par culture (mm/j) - valeurs simplifiées pour le Sénégal
const CROP_IRRIGATION_COEFFS = {
  'tomate': { name: 'Tomate', baseMmPerDay: 4.5, frequency: '2 fois/jour', duration: '20-25 min/vanne' },
  'oignon': { name: 'Oignon', baseMmPerDay: 4.0, frequency: '1 fois/jour', duration: '15-20 min/vanne' },
  'chou': { name: 'Chou', baseMmPerDay: 4.5, frequency: '1 fois/jour', duration: '20 min/vanne' },
  'carotte': { name: 'Carotte', baseMmPerDay: 4.0, frequency: '1 fois/jour', duration: '20 min/vanne' },
  'poivron': { name: 'Poivron', baseMmPerDay: 4.0, frequency: '2 fois/jour', duration: '15-20 min/vanne' },
  'piment': { name: 'Piment', baseMmPerDay: 4.0, frequency: '2 fois/jour', duration: '15-20 min/vanne' },
  'gombo': { name: 'Gombo', baseMmPerDay: 3.5, frequency: '1 fois/jour', duration: '15 min/vanne' },
  'menthe': { name: 'Menthe', baseMmPerDay: 3.5, frequency: '1 fois/jour', duration: '15 min/vanne' },
  'papaye': { name: 'Papaye', baseMmPerDay: 5.0, frequency: '2 fois/jour', duration: '25-30 min/vanne' },
  'arachide': { name: 'Arachide', baseMmPerDay: 3.0, frequency: '1 fois/2 jours', duration: '20 min/vanne' },
  'default': { name: 'Standard', baseMmPerDay: 4.0, frequency: '1 fois/jour', duration: '20 min/vanne' }
};

// Facteurs d'ajustement selon le type de sol
const SOIL_FACTORS = {
  'sableux': { drainage: 1.2, retenue: 0.8, label: 'Sableux (Drainage rapide)' },
  'argileux': { drainage: 0.8, retenue: 1.2, label: 'Argileux (Rétention forte)' },
  'limoneux': { drainage: 1.0, retenue: 1.0, label: 'Argilo-limoneux (Équilibré)' },
  'lateritique': { drainage: 1.1, retenue: 0.9, label: 'Latéritique' }
};

export const IrrigationModule = {
  canCalculate() {
    // RBAC: Bureau et Admin peuvent calculer, Terrain peut consulter (lecture seule)
    const user = UserManager.getCurrentUser();
    return user && (user.role === 'Bureau' || user.role === 'Terrain' || user.role === 'admin' || user.role === 'super_admin');
  },

  // Point d'entrée principal
  init() {
    if (!this.canCalculate()) {
      this.showAccessDenied();
      return;
    }

    this.setupParcelSelector();
    this.setupWeatherIntegration();
    this.render();
  },

  showAccessDenied() {
    const container = document.getElementById('irrigation-calculator-section');
    if (container) {
      container.innerHTML = `
        <div class="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <p class="text-sm font-black text-rose-500">Accès refusé</p>
          <p class="text-xs text-slate-400 mt-1">Seuls les utilisateurs autorisés peuvent utiliser le calculateur.</p>
        </div>
      `;
    }
  },

  // Configure le sélecteur de parcelle avec pré-remplissage
  setupParcelSelector() {
    const select = document.getElementById('calc-parcel-select');
    if (!select) return;

    const parcelles = KAStorage.getParcelles();
    select.innerHTML = '<option value="">-- Sélectionner une parcelle --</option>' +
      parcelles.map(p => `<option value="${p.id}">${p.name} (${p.surface} m²)</option>`).join('');

    // Écouteur de changement
    select.addEventListener('change', (e) => {
      const parcelId = e.target.value;
      this.fillFromParcel(parcelId);
    });
  },

  // Pré-remplit les champs depuis les données de la parcelle
  fillFromParcel(parcelId) {
    if (!parcelId) {
      this.resetManualFields();
      return;
    }

    const parcelles = KAStorage.getParcelles();
    const parcel = parcelles.find(p => p.id === parcelId);
    if (!parcel) return;

    // Pré-remplir surface
    const surfaceInput = document.getElementById('calc-surface');
    if (surfaceInput) surfaceInput.value = parcel.surface || '';

    // Pré-remplir type de sol
    const solSelect = document.getElementById('calc-sol');
    if (solSelect && parcel.type_sol) solSelect.value = parcel.type_sol;

    // Pré-remplir culture (essayer de matcher avec la culture actuelle)
    const cropSelect = document.getElementById('calc-crop');
    if (cropSelect && parcel.currentCrop) {
      const cropKey = this.matchCropKey(parcel.currentCrop);
      if (cropKey) cropSelect.value = cropKey;
    }

    // Déclencher le calcul
    this.calculateAndDisplay();
  },

  // Essaie de matcher un nom de culture avec une clé du sélecteur
  matchCropKey(cropName) {
    if (!cropName) return null;
    const name = cropName.toLowerCase();
    if (name.includes('tomate')) return 'tomate';
    if (name.includes('oignon')) return 'oignon';
    if (name.includes('chou')) return 'chou';
    if (name.includes('carotte')) return 'carotte';
    if (name.includes('poivron') || name.includes('piment')) return 'poivron';
    if (name.includes('gombo')) return 'gombo';
    if (name.includes('menthe')) return 'menthe';
    if (name.includes('papaye') || name.includes('papayer')) return 'papaye';
    if (name.includes('arachide')) return 'arachide';
    return null;
  },

  // Réinitialise les champs manuels
  resetManualFields() {
    const surfaceInput = document.getElementById('calc-surface');
    const solSelect = document.getElementById('calc-sol');
    const cropSelect = document.getElementById('calc-crop');
    if (surfaceInput) surfaceInput.value = '100';
    if (solSelect) solSelect.value = 'sableux';
    if (cropSelect) cropSelect.value = 'tomate';
  },

  // Setup intégration météo
  setupWeatherIntegration() {
    // Essayer de récupérer les données météo du dashboard
    // Le dashboard expose window.WEATHER_RECOMMENDATIONS
    this.weatherData = null;

    // Tentative de récupération depuis l'API
    this.fetchWeatherData();
  },

  async fetchWeatherData() {
    try {
      // Récupérer la zone depuis localStorage
      const zone = localStorage.getItem('ka_farm_zone') || 'thies';
      const cityDetails = window.WEATHER_RECOMMENDATIONS?.[zone];

      if (cityDetails?.lat && cityDetails?.lon) {
        const response = await fetch(`/api/weather?lat=${cityDetails.lat}&lon=${cityDetails.lon}`);
        if (response.ok) {
          this.weatherData = await response.json();
        }
      }
    } catch (err) {
      ErrorHandler.log(err, 'IrrigationModule.fetchWeatherData', 'warn');
      // Fallback silencieux - on utilisera les valeurs manuelles
    }
  },

  // Calcul principal
  calculateIrrigation(surface, cropKey, solKey) {
    surface = parseInt(surface) || 0;
    const crop = CROP_IRRIGATION_COEFFS[cropKey] || CROP_IRRIGATION_COEFFS['default'];
    const soil = SOIL_FACTORS[solKey] || SOIL_FACTORS['sableux'];

    if (surface <= 0) {
      return { error: 'Surface invalide' };
    }

    // 1. Besoin de base de la culture (mm/jour)
    let baseNeed = crop.baseMmPerDay;

    // 2. Ajustement sol
    baseNeed = baseNeed * soil.drainage;

    // 3. Ajustement météo (pluviométrie récente)
    let weatherAdjustment = 1.0;
    let weatherNote = 'Conditions standard';
    let rainReduction = 0;

    if (this.weatherData) {
      const precip = parseFloat(this.weatherData.precipitation) || 0;
      const temp = parseFloat(this.weatherData.temp) || 25;
      const humidity = parseFloat(this.weatherData.humidity) || 50;
      const wind = parseFloat(this.weatherData.wind_speed) || 10;

      // Si pluie récente > 5mm, réduire l'irrigation
      if (precip > 5) {
        rainReduction = Math.min(0.4, precip / 50); // max 40% de réduction
        weatherAdjustment = 1.0 - rainReduction;
        weatherNote = `Pluie récente (${precip.toFixed(1)} mm) : irrigation réduite de ${Math.round(rainReduction * 100)}%`;
      } else if (temp > 35) {
        weatherAdjustment = 1.3;
        weatherNote = `Forte chaleur (${temp.toFixed(1)}°C) : augmentation de 30% recommandée`;
      } else if (wind > 20) {
        weatherAdjustment = 1.2;
        weatherNote = `Vent sec (${wind.toFixed(1)} km/h) : augmentation de 20% recommandée`;
      } else if (humidity > 80) {
        weatherAdjustment = 0.85;
        weatherNote = `Humidité élevée (${humidity}%) : irrigation réduite de 15%`;
      }
    }

    // 4. Besoin final ajusté
    const finalNeedPerDay = baseNeed * weatherAdjustment;

    // 5. Volume total (1 mm = 1 L/m²)
    const volumeLitresPerDay = Math.round(finalNeedPerDay * surface);
    const volumeM3PerDay = (volumeLitresPerDay / 1000).toFixed(2);

    // 6. Fréquence et durée
    let frequency = crop.frequency;
    let duration = crop.duration;

    if (solKey === 'sableux') {
      frequency = '2 fois/jour';
      duration = `${Math.round(parseInt(duration) * 0.7)} min matin + ${Math.round(parseInt(duration) * 0.7)} min soir`;
    } else if (solKey === 'argileux') {
      frequency = '1 fois/jour';
      duration = `${Math.round(parseInt(duration) * 1.2)} min matin (arrosage profond)`;
    }

    // 7. Estimation coût carburant (pompe 1HP = ~1L/h = ~500F/h)
    const pumpLitersPerMinute = 0.015; // ~15 mL/s = 0.9 L/h
    const fuelCostPerLiter = 900; // FCFA
    const totalMinutesPerDay = parseInt(duration) || 20;
    const fuelPerDay = (pumpLitersPerMinute * totalMinutesPerDay).toFixed(1);
    const costPerDay = Math.round(fuelPerDay * fuelCostPerLiter);

    return {
      volumeLitres: volumeLitresPerDay,
      volumeM3: volumeM3PerDay,
      frequency,
      duration,
      weatherNote,
      rainReduction: Math.round(rainReduction * 100),
      estimatedFuel: fuelPerDay,
      estimatedCost: costPerDay,
      cropName: crop.name,
      soilLabel: soil.label
    };
  },

  // Affiche les résultats
  renderResults(result) {
    const volumeEl = document.getElementById('calc-volume');
    const frequencyEl = document.getElementById('calc-frequency');
    const durationEl = document.getElementById('calc-duration');
    const weatherEl = document.getElementById('calc-weather-note');
    const fuelEl = document.getElementById('calc-fuel-estimate');
    const explanationEl = document.getElementById('calc-explanation');

    if (!volumeEl) return;

    if (result.error) {
      volumeEl.textContent = '--';
      frequencyEl.textContent = '--';
      durationEl.textContent = '--';
      weatherEl.textContent = result.error;
      fuelEl.textContent = '--';
      explanationEl.textContent = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    volumeEl.textContent = `${result.volumeLitres.toLocaleString('fr-FR')} L (${result.volumeM3} m³)`;
    frequencyEl.textContent = result.frequency;
    durationEl.textContent = result.duration;
    weatherEl.textContent = result.weatherNote;
    fuelEl.textContent = `${result.estimatedFuel} L/jour (~${result.estimatedCost.toLocaleString('fr-FR')} FCFA/jour)`;

    // Explication pédagogique
    const explanation = `
      <strong>Calcul :</strong> Culture "${result.cropName}" sur ${result.volumeLitres} L/jour pour la surface donnée.
      Type de sol : ${result.soilLabel}.
      ${result.rainReduction > 0 ? `<br><strong>Économie :</strong> Grâce à la pluie récente, vous économisez ~${result.rainReduction}% d'eau et de carburant.` : ''}
      <br><em>Coût estimé basé sur une motopompe 1HP consommant ~0.9 L/h de carburant.</em>
    `;
    explanationEl.innerHTML = explanation;
  },

  // Point d'entrée pour le bouton calculer
  calculateAndDisplay() {
    const surface = document.getElementById('calc-surface')?.value;
    const cropKey = document.getElementById('calc-crop')?.value;
    const solKey = document.getElementById('calc-sol')?.value;

    const result = this.calculateIrrigation(surface, cropKey, solKey);
    this.renderResults(result);

    // Sauvegarder le calcul dans l'historique local
    this.saveCalculationHistory(surface, cropKey, solKey, result);
  },

  saveCalculationHistory(surface, cropKey, solKey, result) {
    const history = JSON.parse(localStorage.getItem('ka_farm_irrigation_calculations') || '[]');
    history.unshift({
      date: new Date().toISOString(),
      surface,
      crop: cropKey,
      soil: solKey,
      volume: result.volumeLitres,
      weatherNote: result.weatherNote
    });
    // Garder seulement les 20 derniers calculs
    const trimmed = history.slice(0, 20);
    localStorage.setItem('ka_farm_irrigation_calculations', JSON.stringify(trimmed));
  },

  render() {
    // Rendu initial si nécessaire
    const btn = document.getElementById('btn-calculate-irrigation');
    if (btn) {
      btn.addEventListener('click', () => this.calculateAndDisplay());
    }
  }
};

// Export pour window global (pour compatibilité avec irrigation.html existant)
window.IrrigationModule = IrrigationModule;

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  if (window.IrrigationModule) {
    window.IrrigationModule.init();
  }
});