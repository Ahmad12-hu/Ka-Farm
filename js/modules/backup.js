// KA Farm - Module de Sauvegarde Automatique
// Exporte les données localStorage vers Firebase Storage ou JSON local
import { ErrorHandler } from "./error-handler.js";
import { logger } from "./logger.js";

export const BackupModule = {
  isBackingUp: false,
  lastBackup: null,

  /**
   * Initialise le module de backup
   */
  init() {
    // Vérifier si un backup automatique est nécessaire (dernier backup > 24h)
    const lastBackupTime = localStorage.getItem("ka_farm_last_backup");
    if (lastBackupTime) {
      const hoursSince = (Date.now() - parseInt(lastBackupTime)) / (1000 * 60 * 60);
      if (hoursSince >= 24) {
        // Auto-backup silencieux après 24h
        this.autoBackup();
      }
    }

    // Exposer les fonctions globalement pour les boutons UI
    window.manualBackup = () => this.manualBackup();
    window.restoreFromBackup = (backupData) => this.restoreFromBackup(backupData);
    window.downloadBackup = () => this.downloadBackup();
  },

  /**
   * Backup automatique silencieux (sans UI)
   */
  async autoBackup() {
    if (this.isBackingUp) return;

    try {
      this.isBackingUp = true;

      const backupData = this.collectAllData();
      const timestamp = Date.now();

      // Sauvegarder dans localStorage (backup local)
      const backupKey = `ka_farm_backup_${timestamp}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      // Garder seulement les 3 derniers backups
      this.cleanOldBackups();

      // Mettre à jour le timestamp
      localStorage.setItem("ka_farm_last_backup", timestamp.toString());
      this.lastBackup = timestamp;

      logger.info("Auto-backup completed", { timestamp });
    } catch (err) {
      ErrorHandler.log(err, "BackupModule.autoBackup");
    } finally {
      this.isBackingUp = false;
    }
  },

  /**
   * Backup manuel avec notification utilisateur
   */
  async manualBackup() {
    if (this.isBackingUp) {
      ErrorHandler.showToast("Sauvegarde en cours, veuillez patienter...", "info");
      return;
    }

    try {
      this.isBackingUp = true;
      ErrorHandler.showToast("Sauvegarde en cours...", "info");

      const backupData = this.collectAllData();
      const timestamp = Date.now();

      // 1. Sauvegarde localStorage
      const backupKey = `ka_farm_backup_${timestamp}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      // 2. Tentative de sauvegarde Firebase (si disponible)
      await this.firebaseBackup(backupData, timestamp);

      // 3. Mettre à jour le timestamp
      localStorage.setItem("ka_farm_last_backup", timestamp.toString());
      this.lastBackup = timestamp;

      // 4. Nettoyer les vieux backups
      this.cleanOldBackups();

      ErrorHandler.showToast("✅ Sauvegarde réussie !", "success");
      logger.info("Manual backup completed", { timestamp });
    } catch (err) {
      ErrorHandler.log(err, "BackupModule.manualBackup");
      ErrorHandler.showToast("Erreur lors de la sauvegarde", "error");
    } finally {
      this.isBackingUp = false;
    }
  },

  /**
   * Collecte toutes les données de l'application
   */
  collectAllData() {
    const data = {
      version: "1.0.0",
      timestamp: Date.now(),
      date: new Date().toISOString(),
      user: this.getCurrentUser(),
      crops: this.getStorageData("ka_farm_crops"),
      parcelles: this.getStorageData("ka_farm_parcelles"),
      nurseries: this.getStorageData("ka_farm_nurseries"),
      finances: this.getStorageData("ka_farm_finances"),
      employees: this.getStorageData("ka_farm_employees"),
      stocks: this.getStorageData("ka_farm_stocks"),
      treatments: this.getStorageData("ka_farm_treatments"),
      tasks: this.getStorageData("ka_farm_tasks"),
      cheptel: this.getStorageData("ka_farm_cheptel"),
      elevageProduction: this.getStorageData("ka_farm_elevage_production"),
      elevageHealth: this.getStorageData("ka_farm_elevage_health"),
      settings: {
        zone: localStorage.getItem("ka_farm_zone"),
        darkMode: localStorage.getItem("ka_farm_dark_mode"),
        language: localStorage.getItem("ka_farm_language"),
      },
    };

    return data;
  },

  /**
   * Restaure les données depuis un backup
   */
  restoreFromBackup(backupData) {
    if (!confirm("⚠️ Cette action va remplacer toutes vos données actuelles. Êtes-vous sûr ?")) {
      return;
    }

    try {
      // Restaurer chaque type de données
      const mappings = {
        crops: "ka_farm_crops",
        parcelles: "ka_farm_parcelles",
        nurseries: "ka_farm_nurseries",
        finances: "ka_farm_finances",
        employees: "ka_farm_employees",
        stocks: "ka_farm_stocks",
        treatments: "ka_farm_treatments",
        tasks: "ka_farm_tasks",
        cheptel: "ka_farm_cheptel",
        elevageProduction: "ka_farm_elevage_production",
        elevageHealth: "ka_farm_elevage_health",
      };

      Object.entries(mappings).forEach(([key, storageKey]) => {
        if (backupData[key]) {
          localStorage.setItem(storageKey, JSON.stringify(backupData[key]));
        }
      });

      // Restaurer les settings
      if (backupData.settings) {
        Object.entries(backupData.settings).forEach(([key, value]) => {
          if (value) {
            localStorage.setItem(`ka_farm_${key}`, value);
          }
        });
      }

      ErrorHandler.showToast("✅ Données restaurées avec succès ! Rechargez la page.", "success");
      logger.info("Data restored from backup", { date: backupData.date });
    } catch (err) {
      ErrorHandler.log(err, "BackupModule.restoreFromBackup");
      ErrorHandler.showToast("Erreur lors de la restauration", "error");
    }
  },

  /**
   * Télécharge le backup en fichier JSON
   */
  downloadBackup() {
    try {
      const backupData = this.collectAllData();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `ka_farm_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      ErrorHandler.showToast("✅ Backup téléchargé !", "success");
    } catch (err) {
      ErrorHandler.log(err, "BackupModule.downloadBackup");
      ErrorHandler.showToast("Erreur lors du téléchargement", "error");
    }
  },

  /**
   * Liste les backups disponibles
   */
  listBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ka_farm_backup_")) {
        const timestamp = parseInt(key.replace("ka_farm_backup_", ""));
        backups.push({
          key,
          timestamp,
          date: new Date(timestamp).toLocaleString("fr-FR"),
        });
      }
    }
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * Supprime un backup spécifique
   */
  deleteBackup(key) {
    if (!confirm("Supprimer cette sauvegarde ?")) return;
    localStorage.removeItem(key);
    ErrorHandler.showToast("Sauvegarde supprimée", "success");
  },

  /**
   * Nettoie les vieux backups (garde seulement les 3 derniers)
   */
  cleanOldBackups() {
    const backups = this.listBackups();
    if (backups.length > 3) {
      backups.slice(3).forEach((backup) => {
        localStorage.removeItem(backup.key);
      });
    }
  },

  /**
   * Sauvegarde vers Firebase Storage
   */
  async firebaseBackup(data, timestamp) {
    try {
      // Vérifier si Firebase est disponible
      if (!window.firebase || !window.firebase.app()) {
        return; // Firebase non configuré, skip
      }

      const db = window.firebase.firestore();

      // Sauvegarder dans une collection "backups"
      await db
        .collection("backups")
        .doc(`backup_${timestamp}`)
        .set({
          data,
          timestamp,
          date: new Date().toISOString(),
          userId: this.getCurrentUser()?.email || "unknown",
        });

      logger.info("Firebase backup successful", { timestamp });
    } catch (err) {
      // Ne pas crasher si Firebase backup échoue
      logger.warn("Firebase backup failed", { error: err.message });
    }
  },

  /**
   * Récupère l'utilisateur actuel
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem("ka_farm_current_user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  /**
   * Récupère les données d'une clé localStorage
   */
  getStorageData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};
