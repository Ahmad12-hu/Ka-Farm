// KA Farm - Alertes Climatiques Module
import { KAStorage } from '../storage.js';
import { ErrorHandler } from './error-handler.js';

let weatherAlerts = [];
let weatherAlertHistory = [];
let alertToAcknowledge = null;
let alertToDelete = null;

// Severity color and style mapping
const SEVERITY_COLORS = {
  'Faible': { color: '#10b981', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: 'check-circle' },
  'Moyenne': { color: '#fbbf24', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: 'alert-circle' },
  'Élevée': { color: '#f59e0b', badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: 'alert-triangle' },
  'Critique': { color: '#ef4444', badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: 'x-circle' }
};

// Alert type icons
const ALERT_ICONS = {
  'Température Élevée': 'thermometer',
  'Température Basse': 'thermometer',
  'Pluie Intense': 'cloud-rain',
  'Vent Fort': 'wind',
  'Humidité Élevée': 'droplets',
  'Humidité Basse': 'droplets',
  'Sécheresse': 'sun',
  'Gel': 'snowflake',
  'Canicule': 'sun',
  'Orage': 'zap'
};

// Weather condition icons
const WEATHER_ICONS = {
  'thermometer': { high: 'thermometer-sun', low: 'thermometer-snowflake' },
  'cloud-rain': { heavy: 'cloud-rain', light: 'cloud-drizzle' },
  'wind': 'wind',
  'droplets': 'droplets'
};

export const WeatherAlertsModule = {
  init() {
    try {
      weatherAlerts = KAStorage.getWeatherAlerts() || [];
      weatherAlertHistory = KAStorage.getWeatherAlertHistory() || [];

      this.render();
      this.setupListeners();
      this.loadConfig();
      this.startAutoRefresh();
    } catch (err) {
      ErrorHandler.log(err, 'WeatherAlertsModule.init');
    }
  },

  loadConfig() {
    // Load default weather configuration from storage or use defaults
    const config = KAStorage.getWeatherConfig() || {
      temperature: { high: 40, low: 15 },
      rainfall: { threshold: 50 },
      wind: { threshold: 60 },
      humidity: { low: 30, high: 80 }
    };
    
    // Update UI with config values
    this.updateConfigUI(config);
    
    // Simulate current weather data (in a real app, this would come from an API)
    this.updateCurrentWeather();
  },

  updateConfigUI(config) {
    const tempHigh = document.getElementById('temp-high-threshold');
    const tempLow = document.getElementById('temp-low-threshold');
    const rainThreshold = document.getElementById('rain-threshold');
    const windThreshold = document.getElementById('wind-threshold');
    const humidityLow = document.getElementById('humidity-low-threshold');
    const humidityHigh = document.getElementById('humidity-high-threshold');
    
    if (tempHigh) tempHigh.textContent = config.temperature?.high || 40;
    if (tempLow) tempLow.textContent = config.temperature?.low || 15;
    if (rainThreshold) rainThreshold.textContent = config.rainfall?.threshold || 50;
    if (windThreshold) windThreshold.textContent = config.wind?.threshold || 60;
    if (humidityLow) humidityLow.textContent = config.humidity?.low || 30;
    if (humidityHigh) humidityHigh.textContent = config.humidity?.high || 80;
  },

  async updateCurrentWeather() {
    // Fetch real weather data from API
    const tempEl = document.getElementById('current-temp');
    const humidityEl = document.getElementById('current-humidity');
    const windEl = document.getElementById('current-wind');
    const rainEl = document.getElementById('current-rain');
    
    let currentWeather = KAStorage.getCurrentWeather() || {
      temperature: 25,
      humidity: 65,
      wind: 10,
      rainfall: 0
    };
    
    try {
      // Try to get user's zone from settings
      const userZone = localStorage.getItem('ka_farm_zone') || 'dakar';
      const zoneCoords = {
        dakar: { lat: 14.6937, lon: -17.4441 },
        thiès: { lat: 14.7856, lon: -17.2543 },
        kaolack: { lat: 14.15, lon: -16.0833 },
        ziguinchor: { lat: 12.5833, lon: -16.2667 },
        saint_louis: { lat: 16.0333, lon: -16.5 },
        matam: { lat: 15.1667, lon: -13.2833 }
      };
      
      const coords = zoneCoords[userZone] || zoneCoords.dakar;
      
      const response = await fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`);
      if (response.ok) {
        const data = await response.json();
        currentWeather = {
          temperature: data.temp || currentWeather.temperature,
          humidity: data.humidity || currentWeather.humidity,
          wind: data.wind_speed || currentWeather.wind,
          rainfall: data.precipitation || currentWeather.rainfall
        };
        // Cache the real data
        KAStorage.saveCurrentWeather(currentWeather);
      }
    } catch (err) {
      console.warn('Weather API fetch failed, using cached/default data:', err);
    }
    
    if (tempEl) tempEl.textContent = `${currentWeather.temperature}°C`;
    if (humidityEl) humidityEl.textContent = `${currentWeather.humidity}%`;
    if (windEl) windEl.textContent = `${currentWeather.wind} km/h`;
    if (rainEl) rainEl.textContent = `${currentWeather.rainfall} mm`;
    
    // Check if any alerts should be triggered based on current weather
    this.checkAndTriggerAlerts(currentWeather);
  },

  checkAndTriggerAlerts(currentWeather) {
    // Get alert configurations
    const config = KAStorage.getWeatherConfig() || {
      temperature: { high: 40, low: 15 },
      rainfall: { threshold: 50 },
      wind: { threshold: 60 },
      humidity: { low: 30, high: 80 }
    };
    
    const now = new Date();
    
    // Check temperature high
    if (currentWeather.temperature >= config.temperature?.high) {
      this.triggerAlert({
        alert_type: 'Température Élevée',
        trigger_value: currentWeather.temperature,
        trigger_unit: '°C',
        message: `Alerte : Température élevée détectée à ${currentWeather.temperature}°C`,
        severity: 'Élevée',
        advice: 'Protégez les cultures sensibles à la chaleur. Irriguez tôt le matin ou en soirée.'
      });
    }
    
    // Check temperature low
    if (currentWeather.temperature <= config.temperature?.low) {
      this.triggerAlert({
        alert_type: 'Température Basse',
        trigger_value: currentWeather.temperature,
        trigger_unit: '°C',
        message: `Alerte : Température basse détectée à ${currentWeather.temperature}°C`,
        severity: 'Élevée',
        advice: 'Protégez les cultures sensibles au froid. Utilisez des bâches de protection.'
      });
    }
    
    // Check rainfall
    if (currentWeather.rainfall >= config.rainfall?.threshold) {
      this.triggerAlert({
        alert_type: 'Pluie Intense',
        trigger_value: currentWeather.rainfall,
        trigger_unit: 'mm',
        message: `Alerte : Pluie intense détectée à ${currentWeather.rainfall} mm`,
        severity: 'Moyenne',
        advice: 'Évitez de travailler dans les champs. Vérifiez les drains.'
      });
    }
    
    // Check wind
    if (currentWeather.wind >= config.wind?.threshold) {
      this.triggerAlert({
        alert_type: 'Vent Fort',
        trigger_value: currentWeather.wind,
        trigger_unit: 'km/h',
        message: `Alerte : Vent fort détecté à ${currentWeather.wind} km/h`,
        severity: 'Moyenne',
        advice: 'Sécurisez les structures et les filets de protection.'
      });
    }
    
    // Check humidity
    if (currentWeather.humidity >= config.humidity?.high) {
      this.triggerAlert({
        alert_type: 'Humidité Élevée',
        trigger_value: currentWeather.humidity,
        trigger_unit: '%',
        message: `Alerte : Humidité élevée détectée à ${currentWeather.humidity}%`,
        severity: 'Faible',
        advice: 'Surveillez les maladies fongiques. Aérez les serres.'
      });
    }
    
    if (currentWeather.humidity <= config.humidity?.low) {
      this.triggerAlert({
        alert_type: 'Humidité Basse',
        trigger_value: currentWeather.humidity,
        trigger_unit: '%',
        message: `Alerte : Humidité basse détectée à ${currentWeather.humidity}%`,
        severity: 'Faible',
        advice: 'Irriguez pour maintenir l\'humidité du sol.'
      });
    }
  },

  triggerAlert(alertData) {
    // Check if this alert has already been triggered recently
    const lastTriggered = weatherAlertHistory
      .filter(h => h.alert_type === alertData.alert_type)
      .sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at))[0];
    
    // Only trigger if not already triggered in the last 24 hours
    if (lastTriggered && new Date() - new Date(lastTriggered.triggered_at) < 24 * 60 * 60 * 1000) {
      return;
    }
    
    // Create history entry
    const historyEntry = {
      id: `WAH-${Date.now()}`,
      alert_type: alertData.alert_type,
      trigger_value: alertData.trigger_value,
      trigger_unit: alertData.trigger_unit,
      message: alertData.message,
      severity: alertData.severity,
      advice: alertData.advice,
      triggered_at: new Date().toISOString(),
      acknowledged: false,
      acknowledged_by: '',
      acknowledged_at: '',
      region: 'Niayes',
      enterprise_id: 'ka_farm',
      created_at: new Date().toISOString()
    };
    
    weatherAlertHistory.push(historyEntry);
    KAStorage.setWeatherAlertHistory(weatherAlertHistory);
    
    // Show notification
    this.showNotification(historyEntry);
    
    // Refresh UI
    this.render();
  },

  showNotification(alert) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `p-4 bg-white dark:bg-[#061109] rounded-xl border border-${SEVERITY_COLORS[alert.severity]?.color.replace('#', '')}/20 shadow-lg mb-4 animate-bounce-slow`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-xl bg-${SEVERITY_COLORS[alert.severity]?.color.replace('#', '')}/10">
          <i data-lucide="${ALERT_ICONS[alert.alert_type] || 'alert-triangle'}" class="h-5 w-5 text-${SEVERITY_COLORS[alert.severity]?.color.replace('#', '')}"></i>
        </div>
        <div class="flex-1">
          <p class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Nouvelle Alerte Climatique</p>
          <p class="text-sm font-black text-slate-800 dark:text-white">${alert.alert_type}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">${alert.message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="p-1 text-slate-400 hover:text-slate-600">
          <i data-lucide="x" class="h-4 w-4"></i>
        </button>
      </div>
    `;
    
    // Add to notifications container or top of page
    const alertsContainer = document.getElementById('alerts-container');
    if (alertsContainer) {
      alertsContainer.insertBefore(notification, alertsContainer.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  },

  startAutoRefresh() {
    // Refresh weather data every 5 minutes
    setInterval(() => {
      this.updateCurrentWeather();
    }, 5 * 60 * 1000);
    
    // Initial fetch on page load
    setTimeout(() => {
      this.updateCurrentWeather();
    }, 2000);
  },

  render() {
    this.renderStats();
    this.renderActiveAlerts();
    this.renderAlertHistory();
    this.renderRecentTriggered();
  },

  renderStats() {
    // Count active alerts (non-acknowledged)
    const activeAlerts = weatherAlertHistory.filter(a => !a.acknowledged).length;
    const criticalAlerts = weatherAlertHistory.filter(a => !a.acknowledged && a.severity === 'Critique').length;
    const highAlerts = weatherAlertHistory.filter(a => !a.acknowledged && a.severity === 'Élevée').length;
    const acknowledgedAlerts = weatherAlertHistory.filter(a => a.acknowledged).length;
    const totalTriggered = weatherAlertHistory.length;
    
    const elActive = document.getElementById('stat-active-alerts');
    const elCritical = document.getElementById('stat-critical-alerts');
    const elHigh = document.getElementById('stat-high-alerts');
    const elAcknowledged = document.getElementById('stat-acknowledged-alerts');
    const elTotal = document.getElementById('stat-total-triggered');
    
    if (elActive) elActive.textContent = activeAlerts;
    if (elCritical) elCritical.textContent = criticalAlerts;
    if (elHigh) elHigh.textContent = highAlerts;
    if (elAcknowledged) elAcknowledged.textContent = acknowledgedAlerts;
    if (elTotal) elTotal.textContent = totalTriggered;
  },

  renderActiveAlerts() {
    const tableBody = document.getElementById('active-alerts-table-body');
    if (!tableBody) return;
    
    // Get non-acknowledged alerts, sorted by severity and date
    const activeAlerts = weatherAlertHistory
      .filter(a => !a.acknowledged)
      .sort((a, b) => {
        // Sort by severity (Critique > Élevée > Moyenne > Faible)
        const severityOrder = { 'Critique': 0, 'Élevée': 1, 'Moyenne': 2, 'Faible': 3 };
        const orderA = severityOrder[a.severity] || 3;
        const orderB = severityOrder[b.severity] || 3;
        if (orderA !== orderB) return orderA - orderB;
        // Then by date (newest first)
        return new Date(b.triggered_at) - new Date(a.triggered_at);
      });
    
    if (activeAlerts.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-slate-400">
            <p class="text-xs font-bold">Aucune alerte active.</p>
            <p class="text-[10px] mt-1">Toutes les alertes ont été acquittées ou aucune n\'est active actuellement.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tableBody.innerHTML = activeAlerts.map(alert => {
      const severityInfo = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS['Moyenne'];
      const icon = ALERT_ICONS[alert.alert_type] || 'alert-triangle';
      
      return `
        <tr 
          class="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0D2615]/25 transition-all border-b border-slate-100 dark:border-[#143E23]/20"
        >
          <td class="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <i data-lucide="${icon}" class="h-4 w-4 text-amber-500"></i>
            ${alert.alert_type}
          </td>
          <td class="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">${alert.message}</td>
          <td class="px-4 py-3.5 text-center">
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${severityInfo.badge}">
              ${alert.severity}
            </span>
          </td>
          <td class="px-4 py-3.5 font-mono font-bold text-center text-slate-800 dark:text-slate-200">
            ${alert.trigger_value} ${alert.trigger_unit || ''}
          </td>
          <td class="px-4 py-3.5 font-mono text-center text-slate-600 dark:text-slate-400">
            ${new Date(alert.triggered_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </td>
          <td class="px-4 py-3.5 text-center">
            <div class="inline-flex items-center gap-1" onclick="event.stopPropagation()">
              <button onclick="window.showWeatherAlertDetail('${alert.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer" title="Voir les détails">
                <i data-lucide="eye" class="h-3.5 w-3.5"></i>
              </button>
              <button onclick="window.openAcknowledgeModal('${alert.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer" title="Acquitter l'alerte">
                <i data-lucide="check-circle" class="h-3.5 w-3.5"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderAlertHistory() {
    const tableBody = document.getElementById('alert-history-table-body');
    if (!tableBody) return;
    
    // Sort by date (newest first)
    const sortedHistory = [...weatherAlertHistory].sort((a, b) => 
      new Date(b.triggered_at) - new Date(a.triggered_at)
    );
    
    if (sortedHistory.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-4 py-8 text-center text-slate-400">
            <p class="text-xs font-bold">Aucune alerte dans l\'historique.</p>
            <p class="text-[10px] mt-1">Les alertes climatiques seront affichées ici après leur déclenchement.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tableBody.innerHTML = sortedHistory.map(alert => {
      const severityInfo = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS['Moyenne'];
      const icon = ALERT_ICONS[alert.alert_type] || 'alert-triangle';
      
      return `
        <tr 
          class="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0D2615]/25 transition-all border-b border-slate-100 dark:border-[#143E23]/20"
          onclick="window.showWeatherAlertDetail('${alert.id}')"
        >
          <td class="px-4 py-3.5 font-mono text-slate-400 dark:text-[#819888] font-bold">${alert.id}</td>
          <td class="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <i data-lucide="${icon}" class="h-4 w-4 text-amber-500"></i>
            ${alert.alert_type}
          </td>
          <td class="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">${alert.message}</td>
          <td class="px-4 py-3.5 font-mono font-bold text-center text-slate-800 dark:text-slate-200">
            ${alert.trigger_value} ${alert.trigger_unit || ''}
          </td>
          <td class="px-4 py-3.5 text-center">
            ${alert.acknowledged ? 
              '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Oui</span>' :
              '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border-amber-500/20">Non</span>'
            }
          </td>
          <td class="px-4 py-3.5 font-mono text-center text-slate-600 dark:text-slate-400">
            ${new Date(alert.triggered_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </td>
          <td class="px-4 py-3.5 text-center">
            <div class="inline-flex items-center gap-1" onclick="event.stopPropagation()">
              <button onclick="window.showWeatherAlertDetail('${alert.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer" title="Voir les détails">
                <i data-lucide="eye" class="h-3.5 w-3.5"></i>
              </button>
              ${!alert.acknowledged ? `
                <button onclick="window.openAcknowledgeModal('${alert.id}')" class="action-btn p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer" title="Acquitter l'alerte">
                  <i data-lucide="check-circle" class="h-3.5 w-3.5"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderRecentTriggered() {
    const recentList = document.getElementById('recent-triggered-alerts');
    if (!recentList) return;
    
    // Sort by date and get last 5
    const sorted = [...weatherAlertHistory].sort((a, b) => 
      new Date(b.triggered_at) - new Date(a.triggered_at)
    );
    const recent5 = sorted.slice(0, 5);
    
    if (recent5.length === 0) {
      recentList.innerHTML = '<p class="text-[11px] text-slate-400 text-center py-4">Aucune alerte récente</p>';
      return;
    }
    
    recentList.innerHTML = recent5.map(alert => {
      const severityInfo = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS['Moyenne'];
      const icon = ALERT_ICONS[alert.alert_type] || 'alert-triangle';
      
      return `
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/20 ${!alert.acknowledged ? 'animate-bounce-slow' : ''}">
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-2">
              <div class="p-1.5 rounded-lg bg-${SEVERITY_COLORS[alert.severity]?.color.replace('#', '')}/10">
                <i data-lucide="${icon}" class="h-4 w-4 text-${SEVERITY_COLORS[alert.severity]?.color.replace('#', '')}"></i>
              </div>
              <div>
                <p class="text-sm font-black text-slate-800 dark:text-white">${alert.alert_type}</p>
                <p class="text-[10px] text-[#819888]">${alert.trigger_value} ${alert.trigger_unit} | ${new Date(alert.triggered_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            ${!alert.acknowledged ? '<span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border-amber-500/20">Nouveau</span>' : ''}
          </div>
        </div>
      `;
    }).join('');
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  setupListeners() {
    // Search in history
    const searchInput = document.getElementById('history-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterHistory(e.target.value);
      });
    }
  },

  filterHistory(query) {
    // Implement search filtering for history table
    this.renderAlertHistory();
  }
};

// Window functions for modal management
window.openAddWeatherAlertModal = () => {
  const modal = document.getElementById('add-weather-alert-modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Reset form
    document.getElementById('add-weather-alert-form')?.reset();
    document.getElementById('form-alert-id').value = '';
    document.getElementById('form-is-active').checked = true;
    document.getElementById('form-severity').value = 'Moyenne';
    document.getElementById('form-region').value = 'Niayes';
    document.getElementById('form-trigger-unit').value = '°C';
  }
};

window.closeAddWeatherAlertModal = () => {
  const modal = document.getElementById('add-weather-alert-modal');
  if (modal) modal.classList.add('hidden');
};

window.submitWeatherAlert = (e) => {
  e.preventDefault();
  
  const typeSelect = document.getElementById('form-alert-type');
  const messageInput = document.getElementById('form-alert-message');
  const triggerValueInput = document.getElementById('form-trigger-value');
  const unitSelect = document.getElementById('form-trigger-unit');
  const severitySelect = document.getElementById('form-severity');
  const regionSelect = document.getElementById('form-region');
  const adviceInput = document.getElementById('form-advice');
  const isActiveInput = document.getElementById('form-is-active');
  const idInput = document.getElementById('form-alert-id');
  
  if (!typeSelect || !messageInput || !triggerValueInput || !severitySelect) {
    ErrorHandler.showToast('Veuillez remplir les champs obligatoires : Type, Message, Valeur de déclenchement et Sévérité.', 'error');
    return;
  }
  
  const alertType = typeSelect.value;
  const message = messageInput.value;
  const triggerValue = parseFloat(triggerValueInput.value) || 0;
  const triggerUnit = unitSelect?.value || '';
  const severity = severitySelect.value;
  const region = regionSelect?.value || 'Niayes';
  const advice = adviceInput?.value || '';
  const isActive = isActiveInput?.checked || false;
  const existingId = idInput?.value || '';
  
  if (!alertType || !message || triggerValue <= 0 || !severity) {
    ErrorHandler.showToast('Veuillez remplir tous les champs obligatoires.', 'error');
    return;
  }
  
  const newAlert = {
    id: existingId || `WAL-${Date.now()}`,
    alert_type: alertType,
    trigger_threshold: triggerValue,
    trigger_unit: triggerUnit,
    message: message,
    advice: advice,
    severity: severity,
    is_active: isActive,
    region: region,
    start_date: new Date().toISOString(),
    end_date: '',
    enterprise_id: 'ka_farm',
    created_at: existingId ? new Date().toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  if (existingId) {
    // Update existing
    const index = weatherAlerts.findIndex(a => a.id === existingId);
    if (index !== -1) {
      weatherAlerts[index] = newAlert;
    }
  } else {
    // Add new
    weatherAlerts.push(newAlert);
  }
  
  KAStorage.setWeatherAlerts(weatherAlerts);
  
  // Also add to history if this is a new alert being triggered
  if (!existingId) {
    const historyEntry = {
      id: `WAH-${Date.now()}`,
      alert_id: newAlert.id,
      alert_type: alertType,
      trigger_value: triggerValue,
      trigger_unit: triggerUnit,
      message: message,
      severity: severity,
      advice: advice,
      triggered_at: new Date().toISOString(),
      acknowledged: false,
      acknowledged_by: '',
      acknowledged_at: '',
      region: region,
      enterprise_id: 'ka_farm',
      created_at: new Date().toISOString()
    };
    weatherAlertHistory.push(historyEntry);
    KAStorage.setWeatherAlertHistory(weatherAlertHistory);
    
    // Show notification
    WeatherAlertsModule.showNotification(historyEntry);
  }
  
  WeatherAlertsModule.render();
  window.closeAddWeatherAlertModal();
  
  ErrorHandler.showToast(`Alerte climatique "${alertType}" ${existingId ? 'mise à jour' : 'créée'} avec succès !`, 'success');
};

window.editWeatherAlert = (id) => {
  const alert = weatherAlerts.find(a => a.id === id);
  if (!alert) {
    // Try to find in history
    const historyAlert = weatherAlertHistory.find(h => h.id === id);
    if (!historyAlert) return;
    alert = historyAlert;
  }
  
  // Set form values
  document.getElementById('form-alert-id').value = alert.id;
  document.getElementById('form-alert-type').value = alert.alert_type || alert.alertType || '';
  document.getElementById('form-alert-message').value = alert.message || '';
  document.getElementById('form-trigger-value').value = alert.trigger_threshold || alert.trigger_value || 0;
  document.getElementById('form-trigger-unit').value = alert.trigger_unit || '°C';
  document.getElementById('form-severity').value = alert.severity || 'Moyenne';
  document.getElementById('form-region').value = alert.region || 'Niayes';
  document.getElementById('form-advice').value = alert.advice || '';
  document.getElementById('form-is-active').checked = alert.is_active !== false;
  
  // Open modal
  const modal = document.getElementById('add-weather-alert-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
};

window.deleteWeatherAlert = (id) => {
  const alert = weatherAlerts.find(a => a.id === id);
  if (!alert) return;
  
  alertToDelete = id;
  
  const deleteModal = document.getElementById('delete-weather-alert-confirm-modal');
  const confirmBtn = document.getElementById('confirm-weather-alert-delete-btn');
  
  if (deleteModal && confirmBtn) {
    confirmBtn.onclick = () => {
      weatherAlerts = weatherAlerts.filter(a => a.id !== id);
      KAStorage.setWeatherAlerts(weatherAlerts);
      WeatherAlertsModule.render();
      window.closeDeleteWeatherAlertModal();
      ErrorHandler.showToast(`Alerte climatique supprimée avec succès.`, 'success');
    };
    
    deleteModal.classList.remove('hidden');
  }
};

window.closeDeleteWeatherAlertModal = () => {
  const modal = document.getElementById('delete-weather-alert-confirm-modal');
  if (modal) modal.classList.add('hidden');
  const confirmBtn = document.getElementById('confirm-weather-alert-delete-btn');
  if (confirmBtn) confirmBtn.onclick = null;
  alertToDelete = null;
};

window.showWeatherAlertDetail = (id) => {
  const alert = weatherAlertHistory.find(a => a.id === id);
  if (!alert) return;
  
  const severityInfo = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS['Moyenne'];
  const icon = ALERT_ICONS[alert.alert_type] || 'alert-triangle';
  
  const content = document.getElementById('weather-alert-detail-content');
  if (content) {
    content.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 bg-amber-500/5 dark:bg-amber-950/5 rounded-2xl border border-amber-500/20">
          <p class="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <i data-lucide="${icon}" class="h-3 w-3"></i> Alerte Climatique #${alert.id}
          </p>
          <h3 class="text-xl font-black text-slate-800 dark:text-white mt-2">
            ${alert.alert_type}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">📍 Région : ${alert.region || 'Niayes'}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Type:</span>
              <span class="text-slate-700 dark:text-slate-300">${alert.alert_type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Message:</span>
              <span class="text-slate-700 dark:text-slate-300">${alert.message}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Valeur déclenchée:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${alert.trigger_value} ${alert.trigger_unit || ''}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Déclenchée:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono">${new Date(alert.triggered_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Sévérité:</span>
              <span class="text-slate-700 dark:text-slate-300">${alert.severity}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Acquittée:</span>
              <span class="text-slate-700 dark:text-slate-300">${alert.acknowledged ? 'Oui' : 'Non'}</span>
            </div>
            ${alert.acknowledged ? `
              <div class="flex justify-between">
                <span class="text-slate-400">Acquittée par:</span>
                <span class="text-slate-700 dark:text-slate-300">${alert.acknowledged_by || 'N/A'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Le:</span>
                <span class="text-slate-700 dark:text-slate-300 font-mono">${new Date(alert.acknowledged_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        ${alert.advice ? `
          <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <i data-lucide="lightbulb" class="h-3 w-3"></i> Conseils
            </p>
            <p class="text-sm text-slate-700 dark:text-slate-300">${alert.advice}</p>
          </div>
        ` : ''}
        
        <div class="flex justify-end gap-2 pt-2">
          ${!alert.acknowledged ? `
            <button onclick="window.closeWeatherAlertDetailModal(); window.openAcknowledgeModal('${alert.id}')" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
              <i data-lucide="check-circle" class="h-3.5 w-3.5"></i> Acquitter
            </button>
          ` : ''}
          <button onclick="window.closeWeatherAlertDetailModal()" class="px-4 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#143E23] border border-slate-200 dark:border-[#143E23] text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer">
            Fermer
          </button>
        </div>
      </div>
    `;
  }
  
  const modal = document.getElementById('weather-alert-detail-modal');
  if (modal) modal.classList.remove('hidden');
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

window.closeWeatherAlertDetailModal = () => {
  const modal = document.getElementById('weather-alert-detail-modal');
  if (modal) modal.classList.add('hidden');
};

window.openAcknowledgeModal = (id) => {
  alertToAcknowledge = id;
  const alert = weatherAlertHistory.find(a => a.id === id);
  if (!alert) return;
  
  const modal = document.getElementById('acknowledge-alert-modal');
  const message = document.getElementById('acknowledge-message');
  
  if (modal && message) {
    message.textContent = `Vous êtes sur le point d\'acquitter l\'alerte : "${alert.alert_type}". Cette action marque l\'alerte comme lue et traitée.`;
    modal.classList.remove('hidden');
  }
};

window.closeAcknowledgeModal = () => {
  const modal = document.getElementById('acknowledge-alert-modal');
  if (modal) modal.classList.add('hidden');
  alertToAcknowledge = null;
};

window.confirmAcknowledgeAlert = () => {
  if (!alertToAcknowledge) return;
  
  const alert = weatherAlertHistory.find(a => a.id === alertToAcknowledge);
  if (!alert) return;
  
  // Update alert as acknowledged
  alert.acknowledged = true;
  alert.acknowledged_by = KAStorage.getCurrentUser()?.name || 'Utilisateur';
  alert.acknowledged_at = new Date().toISOString();
  
  KAStorage.setWeatherAlertHistory(weatherAlertHistory);
  
  WeatherAlertsModule.render();
  window.closeAcknowledgeModal();
  
  ErrorHandler.showToast(`Alerte #${alert.id} acquittée avec succès.`, 'success');
};

window.acknowledgeAllAlerts = () => {
  // Mark all non-acknowledged alerts as acknowledged
  let count = 0;
  weatherAlertHistory.forEach(alert => {
    if (!alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledged_by = KAStorage.getCurrentUser()?.name || 'Utilisateur';
      alert.acknowledged_at = new Date().toISOString();
      count++;
    }
  });
  
  if (count > 0) {
    KAStorage.setWeatherAlertHistory(weatherAlertHistory);
    WeatherAlertsModule.render();
    ErrorHandler.showToast(`${count} alerte(s) acquittée(s) avec succès.`, 'success');
  } else {
    ErrorHandler.showToast('Aucune alerte active à acquitter.', 'error');
  }
};

window.refreshWeatherAlerts = () => {
  // Reload data and refresh
  weatherAlerts = KAStorage.getWeatherAlerts() || [];
  weatherAlertHistory = KAStorage.getWeatherAlertHistory() || [];
  WeatherAlertsModule.updateCurrentWeather();
  WeatherAlertsModule.render();
  ErrorHandler.showToast('Alertes climatiques actualisées.', 'success');
};

// Start module when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    WeatherAlertsModule.init();
  });
} else {
  WeatherAlertsModule.init();
}

// Live update listener
document.addEventListener('ka_data_updated', () => {
  weatherAlerts = KAStorage.getWeatherAlerts() || [];
  weatherAlertHistory = KAStorage.getWeatherAlertHistory() || [];
  WeatherAlertsModule.render();
});
