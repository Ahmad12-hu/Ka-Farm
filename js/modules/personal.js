// KA Farm - Personal Workspace Logic
import { KAStorage } from '../storage.js';
import { UserManager } from '../user-manager.js';
import { ErrorHandler } from './error-handler.js';

export const PersonalModule = {
  init() {
    try {
      this.currentUser = UserManager.getCurrentUser();
      if (!this.currentUser) return;

      this.renderProfile();
      this.renderMyTasks();
      this.renderMySales();
      this.setupListeners();

      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (err) {
      ErrorHandler.log(err, 'PersonalModule.init');
    }
  },

  renderProfile() {
    const avatar = document.getElementById('personal-avatar');
    const nameInput = document.getElementById('personal-name-input');
    const emailInput = document.getElementById('personal-email-input');
    const twitterInput = document.getElementById('personal-twitter-input');
    const linkedinInput = document.getElementById('personal-linkedin-input');
    const facebookInput = document.getElementById('personal-facebook-input');
    const roleBadge = document.getElementById('personal-role-badge');
    const statsTasks = document.getElementById('personal-stats-tasks');
    const statsSales = document.getElementById('personal-stats-sales');

    if (avatar) {
      avatar.textContent = this.currentUser.name.split(' ').map(n => n[0]).join('');
    }
    if (nameInput) nameInput.value = this.currentUser.name;
    if (emailInput) emailInput.value = this.currentUser.email;
    if (twitterInput) twitterInput.value = this.currentUser.twitter || '';
    if (linkedinInput) linkedinInput.value = this.currentUser.linkedin || '';
    if (facebookInput) facebookInput.value = this.currentUser.facebook || '';
    if (roleBadge) {
      roleBadge.textContent = this.currentUser.role === 'Terrain' ? '🌾 Terrain (Village)' : '📊 Bureau (Dakar)';
    }

    // Dynamic Social Media Links render
    const socialLinksContainer = document.getElementById('personal-social-links');
    if (socialLinksContainer) {
      let html = '';
      
      // Email link (always present)
      html += `
        <a href="mailto:${this.currentUser.email}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" title="Envoyer un email">
          <i data-lucide="mail" class="h-3.5 w-3.5"></i> Email
        </a>
      `;

      // Twitter link (conditional)
      if (this.currentUser.twitter) {
        html += `
          <a href="${this.currentUser.twitter}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-500 border border-sky-500/20 hover:bg-sky-500/20 transition-all" title="Twitter / X">
            <i data-lucide="twitter" class="h-3.5 w-3.5"></i> Twitter
          </a>
        `;
      }

      // LinkedIn link (conditional)
      if (this.currentUser.linkedin) {
        html += `
          <a href="${this.currentUser.linkedin}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-[#0A66C2] dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all" title="LinkedIn">
            <i data-lucide="linkedin" class="h-3.5 w-3.5"></i> LinkedIn
          </a>
        `;
      }

      // Facebook link (conditional)
      if (this.currentUser.facebook) {
        html += `
          <a href="${this.currentUser.facebook}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-blue-600/10 text-[#1877F2] dark:text-blue-300 border border-blue-600/20 hover:bg-blue-600/20 transition-all" title="Facebook">
            <i data-lucide="facebook" class="h-3.5 w-3.5"></i> Facebook
          </a>
        `;
      }

      socialLinksContainer.innerHTML = html;
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }

    // Counts
    if (statsTasks) {
      const tasks = KAStorage.getTasks();
      const myCount = tasks.filter(t => t.assignee.toLowerCase().includes(this.currentUser.name.split(' ')[0].toLowerCase()) && !t.completed).length;
      statsTasks.textContent = myCount;
    }

    if (statsSales) {
      const finances = KAStorage.getFinances();
      // Calculate my total recorded sales
      const mySales = finances.filter(f => f.type === 'Revenu' && f.description.toLowerCase().includes('vente')).reduce((sum, f) => sum + f.amount, 0);
      statsSales.textContent = mySales.toLocaleString('fr-FR') + ' FCFA';
    }
  },

  renderMyTasks() {
    const container = document.getElementById('my-tasks-container');
    if (!container) return;

    const tasks = KAStorage.getTasks();
    const firstName = this.currentUser.name.split(' ')[0];
    
    // Filter tasks assigned to current user
    const myTasks = tasks.filter(t => t.assignee.toLowerCase().includes(firstName.toLowerCase()));

    if (myTasks.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-450 dark:text-slate-500">
          <span class="text-4xl">🎉</span>
          <p class="text-sm font-bold mt-2">Aucune tâche assignée !</p>
          <p class="text-xs text-slate-400 mt-1">Vous êtes à jour dans vos travaux maraîchers.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = myTasks.map(task => {
      const priorityColors = {
        'Haute': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        'Moyenne': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Basse': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
      
      const badge = priorityColors[task.priority] || priorityColors['Moyenne'];
      const textClass = task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100';

      return `
        <div class="p-4 bg-white dark:bg-[#0B2112]/50 border border-slate-100 dark:border-[#143E23]/30 rounded-2xl flex items-center justify-between gap-4 task-card">
          <div class="flex items-center gap-3 text-left min-w-0">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onclick="window.toggleMyTaskStatus('${task.id}')"
                   class="accent-emerald-500 h-5 w-5 rounded-lg border-slate-300 dark:border-emerald-900 bg-slate-50 cursor-pointer">
            <div class="min-w-0">
              <p class="text-xs font-black ${textClass} truncate">${task.title}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[9px] px-1.5 py-0.2 rounded border font-bold ${badge}">${task.priority}</span>
                <span class="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold flex items-center gap-1">
                  <i data-lucide="calendar" class="h-3 w-3"></i> Échéance : ${task.dueDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderMySales() {
    const container = document.getElementById('my-sales-container');
    if (!container) return;

    const finances = KAStorage.getFinances();
    // Only sales recorded by Terrain (or any Sales descriptions)
    const sales = finances.filter(f => f.type === 'Revenu' && f.description.toLowerCase().includes('vente'));

    if (sales.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-500">
          <p class="text-xs font-bold">Aucune vente enregistrée.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = sales.map(s => {
      return `
        <div class="p-3 bg-white dark:bg-[#0B2112]/40 border border-slate-100 dark:border-[#143E23]/20 rounded-xl flex justify-between items-center text-left">
          <div>
            <p class="text-xs font-black text-slate-800 dark:text-slate-100">${s.description}</p>
            <p class="text-[9px] text-slate-400 font-extrabold mt-0.5">${s.date} • ${s.category}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-emerald-500 font-mono mr-1">+${s.amount.toLocaleString('fr-FR')} F</span>
            <button onclick="window.shareSalesWhatsApp('${s.id}')" class="text-emerald-500 hover:text-emerald-400 p-1.5 bg-emerald-500/10 rounded-lg transition-colors cursor-pointer" title="Partager le bon de livraison Bana-Bana sur WhatsApp">
              <i data-lucide="message-circle" class="h-4 w-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  setupListeners() {
    // WhatsApp Export of a Bana-Bana receipt
    window.shareSalesWhatsApp = (id) => {
      const finances = KAStorage.getFinances();
      const s = finances.find(item => item.id === id);
      if (!s) return;

      const text = `*🚚 BON DE LIVRAISON & REÇU - BANA-BANA*\n` +
                   `----------------------------------------\n` +
                   `*Réf :* ${s.id}\n` +
                   `*Date :* ${s.date}\n` +
                   `*Grossiste/Bana-Bana :* Agricole Intermédiaire\n` +
                   `*Désignation :* ${s.description}\n` +
                   `*Rubrique :* ${s.category}\n` +
                   `*Montant Total :* ${s.amount.toLocaleString('fr-FR')} FCFA\n` +
                   `*Statut :* Livré & Payé (Règlement comptant)\n` +
                   `----------------------------------------\n` +
                   `*KA Farm - Zone Maraîchère, Sénégal*\n` +
                   `_Merci pour votre collaboration horticole !_`;

      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    };

    // Expose toggle task globally
    window.toggleMyTaskStatus = (id) => {
      const tasks = KAStorage.getTasks();
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx].completed = !tasks[idx].completed;
        KAStorage.saveTasks(tasks);
        this.renderMyTasks();
        this.renderProfile();
        // Update app badges too!
        if (window.App && typeof window.App.updateBadges === 'function') {
          window.App.updateBadges();
        }
      }
    };

    // Form submissions
    const profileForm = document.getElementById('personal-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('personal-name-input').value;
        const newEmail = document.getElementById('personal-email-input').value;
        const newTwitter = document.getElementById('personal-twitter-input').value;
        const newLinkedin = document.getElementById('personal-linkedin-input').value;
        const newFacebook = document.getElementById('personal-facebook-input').value;
        
        if (newName && newEmail) {
          this.currentUser.name = newName;
          this.currentUser.email = newEmail;
          this.currentUser.twitter = newTwitter;
          this.currentUser.linkedin = newLinkedin;
          this.currentUser.facebook = newFacebook;
          KAStorage.setCurrentUser(this.currentUser);
          
          // Also update users DB
          const users = KAStorage.getUsers();
          const uIdx = users.findIndex(u => u.email.toLowerCase() === newEmail.toLowerCase());
          if (uIdx !== -1) {
            users[uIdx].name = newName;
            users[uIdx].twitter = newTwitter;
            users[uIdx].linkedin = newLinkedin;
            users[uIdx].facebook = newFacebook;
            KAStorage.saveUsers(users);
          }

          ErrorHandler.showToast('Profil mis à jour avec succès !', 'success');
          window.location.reload();
        }
      });
    }

    const taskForm = document.getElementById('personal-task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('personal-task-title').value;
        const priority = document.getElementById('personal-task-priority').value;
        const dueDate = document.getElementById('personal-task-due').value;

        if (!title || !dueDate) return;

        const tasks = KAStorage.getTasks();
        const newTask = {
          id: `T-${Date.now()}`,
          title: title,
          category: 'Entretien',
          dueDate: dueDate,
          assignee: this.currentUser.name.split(' ')[0],
          priority: priority,
          completed: false
        };

        tasks.unshift(newTask);
        KAStorage.saveTasks(tasks);
        
        taskForm.reset();
        // Reset date to today
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('personal-task-due').value = todayStr;

        this.renderMyTasks();
        this.renderProfile();
        
        if (window.App && typeof window.App.updateBadges === 'function') {
          window.App.updateBadges();
        }
        
        ErrorHandler.showToast('Nouvelle tâche ajoutée !', 'success');
      });
    }

    const saleForm = document.getElementById('personal-sale-form');
    if (saleForm) {
      saleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const desc = document.getElementById('personal-sale-desc').value;
        const category = document.getElementById('personal-sale-category').value;
        const amount = parseFloat(document.getElementById('personal-sale-amount').value);
        const date = document.getElementById('personal-sale-date').value;

        if (!desc || !amount || !date) return;

        const finances = KAStorage.getFinances();
        const newSale = {
          id: `F-${Date.now()}`,
          description: `Vente : ${desc}`,
          category: category,
          type: 'Revenu',
          amount: amount,
          date: date
        };

        finances.unshift(newSale);
        KAStorage.saveFinances(finances);

        saleForm.reset();
        // Reset date to today
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('personal-sale-date').value = todayStr;

        this.renderMySales();
        this.renderProfile();

        ErrorHandler.showToast('Vente enregistrée avec succès !', 'success');
      });
    }
  }
};

// Start personal module
document.addEventListener('DOMContentLoaded', () => {
  PersonalModule.init();
});

document.addEventListener('ka_data_updated', (e) => {
  if (e.detail && (
    e.detail.key === 'ka_farm_users' ||
    e.detail.key === 'ka_farm_tasks' ||
    e.detail.key === 'ka_farm_finances'
  )) {
    PersonalModule.renderProfile();
    PersonalModule.renderMyTasks();
    PersonalModule.renderMySales();
  }
});
