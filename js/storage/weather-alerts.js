// KA Farm - Weather Alerts Storage Domain
// Manages weather alerts and climate configuration

import { KAStorage } from './core.js';

export const WeatherAlertsStorage = {
  getWeatherAlerts() {
    return KAStorage.get('ka_farm_weather_alerts', []);
  },
  saveWeatherAlerts(alerts) {
    KAStorage.set('ka_farm_weather_alerts', alerts);
  },

  getWeatherAlertHistory() {
    return KAStorage.get('ka_farm_weather_alert_history', []);
  },
  saveWeatherAlertHistory(history) {
    KAStorage.set('ka_farm_weather_alert_history', history);
  },

  getWeatherConfig() {
    return KAStorage.get('ka_farm_weather_config', {
      temperature: { high: 40, low: 15 },
      rainfall: { threshold: 50 },
      wind: { threshold: 60 },
      humidity: { low: 30, high: 80 }
    });
  },
  saveWeatherConfig(config) {
    KAStorage.set('ka_farm_weather_config', config);
  },

  getCurrentWeather() {
    return KAStorage.get('ka_farm_current_weather', {
      temperature: 25,
      humidity: 65,
      wind: 10,
      rainfall: 0
    });
  },
  saveCurrentWeather(weather) {
    KAStorage.set('ka_farm_current_weather', weather);
  }
};