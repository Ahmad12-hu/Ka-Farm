import { KAStorage } from '../storage.js';
import { AIAgent } from './ai-agent.js';

function showStatus(message, type) {
  const statusDiv = document.getElementById('api-key-status');
  if (!statusDiv) return;

  statusDiv.classList.remove('hidden');
  statusDiv.textContent = message;
  statusDiv.className = 'p-2.5 rounded-xl text-[10px] font-bold ';

  if (type === 'success') {
    statusDiv.className += 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
  } else if (type === 'error') {
    statusDiv.className += 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
  } else {
    statusDiv.className += 'bg-sky-500/10 text-sky-600 border border-sky-500/20';
  }

  setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 5000);
}

async function initAIAgent() {
  if (!window.AIAgent) {
    await AIAgent.init();
    window.AIAgent = AIAgent;
    return AIAgent;
  }
  await window.AIAgent.init();
  return window.AIAgent;
}

function renderUsersList() {
  const usersList = document.getElementById('settings-users-list');
  if (!usersList) return;

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
}

window.showStatus = showStatus;

window.copyInvitationLink = () => {
  const signupUrl = window.location.origin + '/pages/auth/signup.html';
  navigator.clipboard.writeText(signupUrl).then(() => {
    alert('Lien d\'inscription copié ! Envoyez ce lien à votre collaborateur pour qu\'il crée son compte.');
  }).catch(() => {
    const tempInput = document.createElement('input');
    tempInput.value = signupUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Lien d\'inscription copié ! Envoyez ce lien à votre collaborateur pour qu\'il crée son compte.');
  });
};

window.shareOnWhatsApp = () => {
  const signupUrl = window.location.origin + '/pages/auth/signup.html';
  const message = `🌾 *KA Farm Sénégal* 🌾\n\nBonjour ! Je t\'invite à me rejoindre sur notre plateforme de gestion d\'exploitation agricole pour travailler ensemble en temps réel.\n\nCrée ton compte collaborateur en cliquant sur ce lien :\n🔗 ${signupUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

window.resetDatabase = () => {
  if (confirm("Voulez-vous vraiment réinitialiser toutes les données ? Votre historique de cultures, tâches, arrosages et ventes sera perdu et remplacé par les données de démonstration de la famille KA.")) {
    localStorage.removeItem('ka_farm_crops');
    localStorage.removeItem('ka_farm_nurseries');
    localStorage.removeItem('ka_farm_stocks');
    localStorage.removeItem('ka_farm_tasks');
    localStorage.removeItem('ka_farm_finances');
    localStorage.removeItem('ka_farm_parcelles');
    localStorage.removeItem('ka_farm_employees');
    localStorage.removeItem('ka_farm_attendance');
    localStorage.removeItem('ka_farm_employee_payments');
    localStorage.removeItem('ka_farm_cheptel');
    localStorage.removeItem('ka_farm_elevage_production');
    localStorage.removeItem('ka_farm_elevage_health');
    localStorage.removeItem('ka_farm_messages');
    alert('Base de données réinitialisée avec succès ! L\'application va redémarrer.');
    window.location.href = '/pages/shared/dashboard.html';
  }
};

window.exportBackupData = () => {
  const backup = {
    crops: localStorage.getItem('ka_farm_crops'),
    nurseries: localStorage.getItem('ka_farm_nurseries'),
    stocks: localStorage.getItem('ka_farm_stocks'),
    tasks: localStorage.getItem('ka_farm_tasks'),
    finances: localStorage.getItem('ka_farm_finances'),
    parcelles: localStorage.getItem('ka_farm_parcelles'),
    employees: localStorage.getItem('ka_farm_employees'),
    attendance: localStorage.getItem('ka_farm_attendance'),
    employee_payments: localStorage.getItem('ka_farm_employee_payments'),
    version: '1.0',
    exportedAt: new Date().toISOString()
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `ka-farm-sauvegarde-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  alert('Sauvegarde d\'exploitation exportée avec succès ! Gardez ce fichier précieusement.');
};

window.importBackupData = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.crops || !backup.tasks || !backup.stocks) {
        alert('Erreur : Le fichier sélectionné n\'est pas un fichier de sauvegarde KA Farm valide.');
        return;
      }
      if (confirm('Attention ! L\'importation de cette sauvegarde va écraser toutes vos données actuelles. Voulez-vous continuer ?')) {
        if (backup.crops) localStorage.setItem('ka_farm_crops', backup.crops);
        if (backup.nurseries) localStorage.setItem('ka_farm_nurseries', backup.nurseries);
        if (backup.stocks) localStorage.setItem('ka_farm_stocks', backup.stocks);
        if (backup.tasks) localStorage.setItem('ka_farm_tasks', backup.tasks);
        if (backup.finances) localStorage.setItem('ka_farm_finances', backup.finances);
        if (backup.parcelles) localStorage.setItem('ka_farm_parcelles', backup.parcelles);
        if (backup.employees) localStorage.setItem('ka_farm_employees', backup.employees);
        if (backup.attendance) localStorage.setItem('ka_farm_attendance', backup.attendance);
        if (backup.employee_payments) localStorage.setItem('ka_farm_employee_payments', backup.employee_payments);
        alert('Importation réussie ! Vos données d\'exploitation ont été restaurées. L\'application va s\'actualiser.');
        window.location.reload();
      }
    } catch (err) {
      alert('Erreur lors de la lecture du fichier de sauvegarde : ' + err.message);
    }
  };

  reader.readAsText(file);
};

function initializeSettingsPage() {
  const zoneSelector = document.getElementById('settings-zone-selector');
  const savedZone = localStorage.getItem('ka_farm_zone') || 'Dakar';

  if (zoneSelector) {
    zoneSelector.value = savedZone;
    zoneSelector.addEventListener('change', (e) => {
      localStorage.setItem('ka_farm_zone', e.target.value);
      alert('Zone météorologique mise à jour !');
    });
  }

  const apiKeyInput = document.getElementById('gemini-api-key-input');
  const saveBtn = document.getElementById('save-api-key-btn');
  const testBtn = document.getElementById('test-api-key-btn');

  const existingKey = localStorage.getItem('ka_farm_gemini_api_key');
  if (existingKey && apiKeyInput) {
    apiKeyInput.value = existingKey;
  }

  if (saveBtn && apiKeyInput) {
    saveBtn.addEventListener('click', async () => {
      try {
        const key = apiKeyInput.value.trim();
        if (!key) {
          showStatus('Veuillez entrer une clé API valide.', 'error');
          return;
        }
        localStorage.setItem('ka_farm_gemini_api_key', key);
        showStatus('✅ Clé API enregistrée avec succès !', 'success');
        await initAIAgent();
      } catch (error) {
        showStatus('❌ Erreur: ' + error.message, 'error');
      }
    });
  }

  if (testBtn && apiKeyInput) {
    testBtn.addEventListener('click', async () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        showStatus('Veuillez entrer une clé API d\'abord.', 'error');
        return;
      }
      showStatus('⏳ Test en cours...', 'info');
      try {
        localStorage.setItem('ka_farm_gemini_api_key', key);
        await initAIAgent();
        if (window.AIAgent && window.AIAgent.isConfigured()) {
          const response = await window.AIAgent.sendMessage('Bonjour, peux-tu me confirmer que tu fonctionnes ?');
          if (response.success) {
            showStatus('✅ Clé API valide ! L\'assistant IA est opérationnel.', 'success');
          } else {
            showStatus('❌ Erreur: ' + response.message, 'error');
          }
        } else {
          showStatus('❌ Clé API invalide ou manquante.', 'error');
        }
      } catch (error) {
        showStatus('❌ Erreur lors du test: ' + error.message, 'error');
      }
    });
  }

  renderUsersList();
  document.addEventListener('ka_data_updated', (e) => {
    if (e.detail && e.detail.key === 'ka_farm_users') {
      renderUsersList();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSettingsPage);
} else {
  initializeSettingsPage();
}
