import { ErrorHandler } from '../../js/modules/error-handler.js';
window.ErrorHandler = ErrorHandler;

import { KAStorage } from '../../js/storage.js';
import { loadDemoData as loadDemoDataFromModule } from '../../js/modules/demo-data.js';
import { BackupModule } from '../../js/modules/backup.js';

window.runStorageMigration = () => {
  KAStorage.init();
};

document.addEventListener('DOMContentLoaded', () => {
  const usersList = document.getElementById('settings-users-list');
  if (usersList) {
    const renderUsers = () => {
      const users = KAStorage.getUsers();
      usersList.innerHTML = users.map(user => {
        const initials = user.name.split(' ').map(n => n[0]).join('');
        const roleBadge = user.role === 'Terrain'
          ? '<span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full text-[9px] font-black">🌾 Terrain</span>'
          : '<span class="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/10 rounded-full text-[9px] font-black">📊 Bureau</span>';
        return `
          <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#061109]/40 border border-slate-100 dark:border-[#143E23]/15 rounded-xl text-left">
            <div class="h-9 w-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black rounded-full flex items-center justify-center text-xs flex-shrink-0">
              ${initials}
            </div>
            <div class="min-w-0">
              <p class="text-xs font-black text-slate-800 dark:text-slate-100 truncate">${user.name}</p>
              <p class="text-[10px] text-slate-400 truncate mt-0.5">${user.email}</p>
            </div>
            <div class="ml-auto flex-shrink-0">
              ${roleBadge}
            </div>
          </div>
        `;
      }).join('');
    };

    renderUsers();
    document.addEventListener('ka_data_updated', (e) => {
      if (e.detail && e.detail.key === 'ka_farm_users') {
        renderUsers();
      }
    });
  }

  const zoneSelector = document.getElementById('settings-zone-selector');
  const savedZone = localStorage.getItem('ka_farm_zone') || 'Dakar';
  if (zoneSelector) {
    zoneSelector.value = savedZone;
    zoneSelector.addEventListener('change', (e) => {
      localStorage.setItem('ka_farm_zone', e.target.value);
      if (window.ErrorHandler) {
        window.ErrorHandler.showToast('Zone météorologique mise à jour !', 'success');
      }
    });
  }

  window.resetDatabase = () => {
    if (confirm("Voulez-vous vraiment réinitialiser toutes les données ? Votre historique de cultures, tâches, arrosages et ventes sera perdu et remplacé par les données de démonstration de la famille KA.")) {
      const keys = [
        'ka_farm_crops',
        'ka_farm_nurseries',
        'ka_farm_stocks',
        'ka_farm_tasks',
        'ka_farm_finances',
        'ka_farm_parcelles',
        'ka_farm_employees',
        'ka_farm_seeds',
        'ka_farm_products',
        'ka_farm_cheptel'
      ];
      keys.forEach(k => localStorage.removeItem(KAStorage.getScopedKey(k)));
      if (window.ErrorHandler) {
        window.ErrorHandler.showToast('Base de données réinitialisée avec succès ! L\'application va redémarrer.', 'success');
      }
      window.location.href = '/pages/shared/dashboard.html';
    }
  };

  window.loadDemoData = () => {
    if (confirm("Voulez-vous charger le jeu de données de démonstration ? Cela remplacera vos données actuelles par des exemples réalistes.")) {
      try {
        loadDemoDataFromModule(KAStorage);
        if (window.ErrorHandler) {
          window.ErrorHandler.showToast('Données de démo chargées avec succès !', 'success');
        }
        window.location.reload();
      } catch (e) {
        console.error('Failed to load demo data:', e);
        if (window.ErrorHandler) {
          window.ErrorHandler.showToast('Erreur lors du chargement des données de démo.', 'error');
        }
      }
    }
  };

  window.exportBackupData = () => {
    const backup = {
      crops: localStorage.getItem(KAStorage.getScopedKey('ka_farm_crops')),
      nurseries: localStorage.getItem(KAStorage.getScopedKey('ka_farm_nurseries')),
      stocks: localStorage.getItem(KAStorage.getScopedKey('ka_farm_stocks')),
      tasks: localStorage.getItem(KAStorage.getScopedKey('ka_farm_tasks')),
      finances: localStorage.getItem(KAStorage.getScopedKey('ka_farm_finances')),
      parcelles: localStorage.getItem(KAStorage.getScopedKey('ka_farm_parcelles')),
      employees: localStorage.getItem(KAStorage.getScopedKey('ka_farm_employees')),
      attendance: localStorage.getItem(KAStorage.getScopedKey('ka_farm_attendance')),
      employee_payments: localStorage.getItem(KAStorage.getScopedKey('ka_farm_employee_payments')),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ka-farm-sauvegarde-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (window.ErrorHandler) {
      window.ErrorHandler.showToast("Sauvegarde d'exploitation exportée avec succès ! Gardez ce fichier précieusement.", 'success');
    }
  };

  window.importBackupData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (!backup.crops || !backup.tasks || !backup.stocks) {
          if (window.ErrorHandler) {
            window.ErrorHandler.showToast("Erreur : Le fichier sélectionné n'est pas un fichier de sauvegarde KA Farm valide.", 'error');
          }
          return;
        }

        if (confirm("Attention ! L'importation de cette sauvegarde va écraser toutes vos données actuelles. Voulez-vous continuer ?")) {
          // Utiliser le module Backup pour restaurer
          BackupModule.restoreFromBackup(backup);
          
          // Recharger après 2 secondes pour laisser le temps au toast de s'afficher
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (err) {
        if (window.ErrorHandler) {
          window.ErrorHandler.showToast("Erreur lors de la lecture du fichier de sauvegarde : " + err.message, 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  // Remplacer les anciennes fonctions par les nouvelles du BackupModule
  window.manualBackup = () => {
    BackupModule.manualBackup();
  };

  window.downloadBackup = () => {
    BackupModule.downloadBackup();
  };

  // Mettre à jour le statut de dernière sauvegarde
  const updateBackupStatus = () => {
    const lastBackupTime = localStorage.getItem('ka_farm_last_backup');
    const lastBackupElement = document.getElementById('last-backup-time');
    
    if (lastBackupElement) {
      if (lastBackupTime) {
        const date = new Date(parseInt(lastBackupTime));
        lastBackupElement.textContent = date.toLocaleString('fr-FR');
      } else {
        lastBackupElement.textContent = 'Jamais';
      }
    }
  };

  // Mettre à jour le statut au chargement
  updateBackupStatus();

  // Écouter les événements de mise à jour pour rafraîchir le statut
  document.addEventListener('ka_data_updated', () => {
    updateBackupStatus();
  });

  window.copyInvitationLink = () => {
    const signupUrl = window.location.origin + '/pages/auth/signup.html';
    navigator.clipboard.writeText(signupUrl).then(() => {
      if (window.ErrorHandler) {
        window.ErrorHandler.showToast("Lien d'inscription copié ! Envoyez ce lien à votre collaborateur pour qu'il crée son compte.", 'success');
      }
    }).catch(() => {
      const tempInput = document.createElement('input');
      tempInput.value = signupUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      if (window.ErrorHandler) {
        window.ErrorHandler.showToast("Lien d'inscription copié ! Envoyez ce lien à votre collaborateur pour qu'il crée son compte.", 'success');
      }
    });
  };

  window.shareOnWhatsApp = () => {
    const signupUrl = window.location.origin + '/pages/auth/signup.html';
    const message = `🌾 *KA Farm Sénégal* 🌾\n\nBonjour ! Je t'invite à me rejoindre sur notre plateforme de gestion d'exploitation agricole pour travailler ensemble en temps réel.\n\nCrée ton compte collaborateur en cliquant sur ce lien :\n🔗 ${signupUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
});
