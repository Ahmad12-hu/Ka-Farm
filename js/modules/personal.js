// KA Farm - Personal Workspace Logic
import { KAStorage } from "../storage.js";
import { UserManager } from "../user-manager.js";
import { ErrorHandler } from "./error-handler.js";

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
      ErrorHandler.log(err, "PersonalModule.init");
    }
  },

  renderProfile() {
    const avatar = document.getElementById("personal-avatar");
    const nameInput = document.getElementById("personal-name-input");
    const emailInput = document.getElementById("personal-email-input");
    const twitterInput = document.getElementById("personal-twitter-input");
    const linkedinInput = document.getElementById("personal-linkedin-input");
    const facebookInput = document.getElementById("personal-facebook-input");
    const roleBadge = document.getElementById("personal-role-badge");
    const statsTasks = document.getElementById("personal-stats-tasks");
    const statsSales = document.getElementById("personal-stats-sales");

    if (avatar) {
      avatar.textContent = this.currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("");
    }
    if (nameInput) nameInput.value = this.currentUser.name;
    if (emailInput) emailInput.value = this.currentUser.email;
    if (twitterInput) twitterInput.value = this.currentUser.twitter || "";
    if (linkedinInput) linkedinInput.value = this.currentUser.linkedin || "";
    if (facebookInput) facebookInput.value = this.currentUser.facebook || "";
    if (roleBadge) {
      roleBadge.textContent =
        this.currentUser.role === "Terrain" ? "🌾 Terrain (Village)" : "📊 Bureau (Dakar)";
    }

    // Dynamic Social Media Links render
    const socialLinksContainer = document.getElementById("personal-social-links");
    if (socialLinksContainer) {
      let html = "";

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
      const myCount = tasks.filter(
        (t) =>
          t.assignee.toLowerCase().includes(this.currentUser.name.split(" ")[0].toLowerCase()) &&
          !t.completed
      ).length;
      statsTasks.textContent = myCount;
    }

    if (statsSales) {
      const finances = KAStorage.getFinances();
      // Calculate my total recorded sales
      const mySales = finances
        .filter((f) => f.type === "Revenu" && f.description.toLowerCase().includes("vente"))
        .reduce((sum, f) => sum + f.amount, 0);
      statsSales.textContent = mySales.toLocaleString("fr-FR") + " FCFA";
    }
  },

  renderMyTasks() {
    const container = document.getElementById("my-tasks-container");
    if (!container) return;

    const tasks = KAStorage.getTasks();
    const firstName = this.currentUser.name.split(" ")[0];

    // Filter tasks assigned to current user
    const myTasks = tasks.filter((t) => t.assignee.toLowerCase().includes(firstName.toLowerCase()));

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

    container.innerHTML = myTasks
      .map((task) => {
        const priorityColors = {
          Haute: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          Moyenne: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          Basse: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };

        const badge = priorityColors[task.priority] || priorityColors["Moyenne"];
        const textClass = task.completed
          ? "line-through text-slate-400 dark:text-slate-500"
          : "text-slate-800 dark:text-slate-100";

        return `
        <div class="p-4 bg-white dark:bg-[#0B2112]/50 border border-slate-100 dark:border-[#143E23]/30 rounded-2xl flex items-center justify-between gap-4 task-card">
          <div class="flex items-center gap-3 text-left min-w-0">
            <input type="checkbox" ${task.completed ? "checked" : ""} 
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
          <div class="flex items-center gap-1">
            <button type="button" onclick="window.editMyTask('${task.id}')" class="p-1.5 text-sky-500 hover:bg-sky-500/10 rounded-lg" aria-label="Modifier la tâche"><i data-lucide="pencil" class="h-4 w-4"></i></button>
            <button type="button" onclick="window.deleteMyTask('${task.id}')" class="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg" aria-label="Supprimer la tâche"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
          </div>
        </div>
      `;
      })
      .join("");

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderMySales() {
    const container = document.getElementById("my-sales-container");
    if (!container) return;

    const finances = KAStorage.getFinances();
    // Only sales recorded by Terrain (or any Sales descriptions)
    const sales = finances.filter(
      (f) => f.type === "Revenu" && f.description.toLowerCase().includes("vente")
    );

    if (sales.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-500">
          <p class="text-xs font-bold">Aucune vente enregistrée.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = sales
      .map((s) => {
        const paidAmount = Object.prototype.hasOwnProperty.call(s, "paidAmount")
          ? Number(s.paidAmount) || 0
          : Number(s.amount) || 0;
        const remaining = Math.max(0, Number(s.amount) - paidAmount);
        const paymentStatus =
          remaining === 0 ? "Soldée" : paidAmount > 0 ? "Partielle" : "À encaisser";
        const payments = (s.payments || [])
          .map(
            (payment) =>
              `<span class="inline-flex items-center mr-2">${Number(payment.amount).toLocaleString("fr-FR")} F le ${payment.date} (${payment.method})</span>`
          )
          .join("");
        return `
        <div class="p-3 bg-white dark:bg-[#0B2112]/40 border border-slate-100 dark:border-[#143E23]/20 rounded-xl flex justify-between items-center text-left">
          <div>
            <p class="text-xs font-black text-slate-800 dark:text-slate-100">${s.description}</p>
            <p class="text-[9px] text-slate-400 font-extrabold mt-0.5">${s.date} • ${s.category}</p>
            <p class="text-[9px] text-slate-500 dark:text-slate-400 mt-1">Encaissé ${paidAmount.toLocaleString("fr-FR")} / ${Number(s.amount).toLocaleString("fr-FR")} FCFA${remaining ? ` · Reste ${remaining.toLocaleString("fr-FR")} FCFA` : ""}</p>
            ${payments ? `<p class="text-[9px] text-slate-400 mt-1">${payments}</p>` : ""}
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-black ${remaining ? "text-amber-500" : "text-emerald-500"}">${paymentStatus}</span>
            ${remaining ? `<button onclick="window.recordSaleCollection('${s.id}')" class="text-emerald-500 hover:text-emerald-400 p-1.5 bg-emerald-500/10 rounded-lg transition-colors cursor-pointer" title="Enregistrer un encaissement"><i data-lucide="banknote" class="h-4 w-4"></i></button>` : ""}
            <button onclick="window.editMySale('${s.id}')" class="text-sky-500 hover:text-sky-400 p-1.5 bg-sky-500/10 rounded-lg transition-colors cursor-pointer" title="Modifier la vente"><i data-lucide="pencil" class="h-4 w-4"></i></button>
            <button onclick="window.shareSalesWhatsApp('${s.id}')" class="text-emerald-500 hover:text-emerald-400 p-1.5 bg-emerald-500/10 rounded-lg transition-colors cursor-pointer" title="Partager le bon de livraison Bana-Bana sur WhatsApp">
              <i data-lucide="message-circle" class="h-4 w-4"></i>
            </button>
            <button onclick="window.deleteMySale('${s.id}')" class="text-rose-500 hover:text-rose-400 p-1.5 bg-rose-500/10 rounded-lg transition-colors cursor-pointer" title="Supprimer la vente"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
          </div>
        </div>
      `;
      })
      .join("");

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  setupListeners() {
    // WhatsApp Export of a Bana-Bana receipt
    window.shareSalesWhatsApp = (id) => {
      const finances = KAStorage.getFinances();
      const s = finances.find((item) => item.id === id);
      if (!s) return;

      const paidAmount = Object.prototype.hasOwnProperty.call(s, "paidAmount")
        ? Number(s.paidAmount) || 0
        : Number(s.amount) || 0;
      const text =
        `*🚚 BON DE LIVRAISON & REÇU - BANA-BANA*\n` +
        `----------------------------------------\n` +
        `*Réf :* ${s.id}\n` +
        `*Date :* ${s.date}\n` +
        `*Grossiste/Bana-Bana :* Agricole Intermédiaire\n` +
        `*Désignation :* ${s.description}\n` +
        `*Rubrique :* ${s.category}\n` +
        `*Montant Total :* ${s.amount.toLocaleString("fr-FR")} FCFA\n` +
        `*Encaissé :* ${paidAmount.toLocaleString("fr-FR")} / ${Number(s.amount).toLocaleString("fr-FR")} FCFA\n` +
        `----------------------------------------\n` +
        `*KA Farm - Zone Maraîchère, Sénégal*\n` +
        `_Merci pour votre collaboration horticole !_`;

      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    };

    window.editMySale = (id) => {
      const sale = KAStorage.getFinances().find((item) => item.id === id);
      if (!sale) return;
      document.getElementById("personal-sale-id").value = sale.id;
      document.getElementById("personal-sale-desc").value = sale.description.replace(
        /^Vente\s*:\s*/i,
        ""
      );
      document.getElementById("personal-sale-category").value = sale.category;
      document.getElementById("personal-sale-amount").value = sale.amount;
      document.getElementById("personal-sale-date").value = sale.date;
      const paidAmount = Object.prototype.hasOwnProperty.call(sale, "paidAmount")
        ? Number(sale.paidAmount) || 0
        : Number(sale.amount) || 0;
      document.getElementById("personal-sale-paid").value = paidAmount;
      document.getElementById("personal-sale-paid").disabled = true;
      document.getElementById("personal-sale-method").disabled = true;
      document.getElementById("sale-form-modal").classList.remove("hidden");
    };

    window.recordSaleCollection = (id) => {
      const sale = KAStorage.getFinances().find((item) => item.id === id);
      if (!sale) return;
      const paidAmount = Object.prototype.hasOwnProperty.call(sale, "paidAmount")
        ? Number(sale.paidAmount) || 0
        : Number(sale.amount) || 0;
      document.getElementById("collection-sale-id").value = id;
      document.getElementById("collection-remaining").textContent =
        `${Math.max(0, Number(sale.amount) - paidAmount).toLocaleString("fr-FR")} FCFA à encaisser`;
      document.getElementById("collection-amount").max = Math.max(
        0,
        Number(sale.amount) - paidAmount
      );
      document.getElementById("collection-amount").value = "";
      document.getElementById("collection-date").value = new Date().toISOString().slice(0, 10);
      document.getElementById("sale-collection-modal").classList.remove("hidden");
    };

    window.deleteMySale = (id) => {
      if (!confirm("Supprimer cette vente et son historique d'encaissements ?")) return;
      KAStorage.saveFinances(KAStorage.getFinances().filter((item) => item.id !== id));
      this.renderMySales();
      this.renderProfile();
      ErrorHandler.showToast("Vente supprimée.", "success");
    };

    window.editMyTask = (id) => {
      const task = KAStorage.getTasks().find((item) => item.id === id);
      if (!task) return;
      document.getElementById("personal-task-id").value = task.id;
      document.getElementById("personal-task-title").value = task.title;
      document.getElementById("personal-task-priority").value = task.priority;
      document.getElementById("personal-task-due").value = task.dueDate;
      document.getElementById("task-form-modal").classList.remove("hidden");
    };

    window.deleteMyTask = (id) => {
      if (!confirm("Supprimer cette tâche ?")) return;
      KAStorage.saveTasks(KAStorage.getTasks().filter((task) => task.id !== id));
      this.renderMyTasks();
      this.renderProfile();
      if (window.App && typeof window.App.updateBadges === "function") {
        window.App.updateBadges();
      }
      ErrorHandler.showToast("Tâche supprimée.", "success");
    };

    // Expose toggle task globally
    window.toggleMyTaskStatus = (id) => {
      const tasks = KAStorage.getTasks();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx !== -1) {
        tasks[idx].completed = !tasks[idx].completed;
        tasks[idx].completedAt = tasks[idx].completed ? new Date().toISOString() : null;
        KAStorage.saveTasks(tasks);
        this.renderMyTasks();
        this.renderProfile();
        // Update app badges too!
        if (window.App && typeof window.App.updateBadges === "function") {
          window.App.updateBadges();
        }
      }
    };

    window.openNewTaskModal = () => {
      document.getElementById("personal-task-form").reset();
      document.getElementById("personal-task-id").value = "";
      document.getElementById("personal-task-due").value = new Date().toISOString().slice(0, 10);
      document.getElementById("task-form-modal").classList.remove("hidden");
    };

    // Form submissions
    const profileForm = document.getElementById("personal-profile-form");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newName = document.getElementById("personal-name-input").value;
        const newEmail = document.getElementById("personal-email-input").value;
        const newTwitter = document.getElementById("personal-twitter-input").value;
        const newLinkedin = document.getElementById("personal-linkedin-input").value;
        const newFacebook = document.getElementById("personal-facebook-input").value;

        if (newName && newEmail) {
          this.currentUser.name = newName;
          this.currentUser.email = newEmail;
          this.currentUser.twitter = newTwitter;
          this.currentUser.linkedin = newLinkedin;
          this.currentUser.facebook = newFacebook;
          KAStorage.setCurrentUser(this.currentUser);

          // Also update users DB
          const users = KAStorage.getUsers();
          const uIdx = users.findIndex((u) => u.email.toLowerCase() === newEmail.toLowerCase());
          if (uIdx !== -1) {
            users[uIdx].name = newName;
            users[uIdx].twitter = newTwitter;
            users[uIdx].linkedin = newLinkedin;
            users[uIdx].facebook = newFacebook;
            KAStorage.saveUsers(users);
          }

          ErrorHandler.showToast("Profil mis à jour avec succès !", "success");
          window.location.reload();
        }
      });
    }

    const taskForm = document.getElementById("personal-task-form");
    if (taskForm) {
      taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("personal-task-title").value.trim();
        const priority = document.getElementById("personal-task-priority").value;
        const dueDate = document.getElementById("personal-task-due").value;
        const taskId = document.getElementById("personal-task-id").value;

        const tasks = KAStorage.getTasks();
        if (!title || !dueDate) {
          ErrorHandler.showToast("Le titre et la date d'échéance sont obligatoires.", "error");
          return;
        }
        if (taskId) {
          const task = tasks.find((item) => item.id === taskId);
          if (!task) return;
          task.title = title;
          task.priority = priority;
          task.dueDate = dueDate;
          KAStorage.saveTasks(tasks);
          taskForm.reset();
          document.getElementById("personal-task-id").value = "";
          document.getElementById("task-form-modal").classList.add("hidden");
          this.renderMyTasks();
          this.renderProfile();
          ErrorHandler.showToast("Tâche mise à jour.", "success");
          return;
        }
        const newTask = {
          id: `T-${Date.now()}`,
          title,
          category: "Entretien",
          dueDate,
          assignee: this.currentUser.name,
          priority,
          completed: false,
        };

        tasks.unshift(newTask);
        KAStorage.saveTasks(tasks);

        taskForm.reset();
        document.getElementById("personal-task-id").value = "";
        document.getElementById("task-form-modal").classList.add("hidden");
        // Reset date to today
        const todayStr = new Date().toISOString().split("T")[0];
        document.getElementById("personal-task-due").value = todayStr;

        this.renderMyTasks();
        this.renderProfile();

        if (window.App && typeof window.App.updateBadges === "function") {
          window.App.updateBadges();
        }

        ErrorHandler.showToast("Nouvelle tâche ajoutée !", "success");
      });
    }

    const saleForm = document.getElementById("personal-sale-form");
    if (saleForm) {
      saleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const desc = document.getElementById("personal-sale-desc").value.trim();
        const category = document.getElementById("personal-sale-category").value;
        const amount = parseFloat(document.getElementById("personal-sale-amount").value);
        const date = document.getElementById("personal-sale-date").value;
        const paidAmount = parseFloat(document.getElementById("personal-sale-paid").value || "0");
        const paymentMethod = document.getElementById("personal-sale-method").value;
        const saleId = document.getElementById("personal-sale-id").value;

        if (!desc || !Number.isFinite(amount) || amount <= 0 || !date) {
          ErrorHandler.showToast(
            "Renseignez une désignation, un montant positif et une date.",
            "error"
          );
          return;
        }
        if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > amount) {
          ErrorHandler.showToast(
            "L'encaissement initial doit être compris entre 0 et le montant total.",
            "error"
          );
          return;
        }

        const finances = KAStorage.getFinances();
        const existingIndex = finances.findIndex((item) => item.id === saleId);
        if (existingIndex !== -1) {
          const existing = finances[existingIndex];
          const alreadyPaid = Object.prototype.hasOwnProperty.call(existing, "paidAmount")
            ? Number(existing.paidAmount) || 0
            : Number(existing.amount) || 0;
          if (amount < alreadyPaid || paidAmount < alreadyPaid) {
            ErrorHandler.showToast(
              "Le montant ne peut pas être inférieur aux encaissements déjà enregistrés.",
              "error"
            );
            return;
          }
          finances[existingIndex] = {
            ...existing,
            description: `Vente : ${desc}`,
            category,
            amount,
            date,
            paidAmount: alreadyPaid,
            paymentStatus:
              alreadyPaid === amount ? "payée" : alreadyPaid > 0 ? "partielle" : "à encaisser",
          };
        } else {
          const newSale = {
            id: `F-${Date.now()}`,
            description: `Vente : ${desc}`,
            category,
            type: "Revenu",
            amount,
            date,
            paidAmount,
            paymentStatus:
              paidAmount === amount ? "payée" : paidAmount > 0 ? "partielle" : "à encaisser",
            payments: paidAmount > 0 ? [{ amount: paidAmount, date, method: paymentMethod }] : [],
          };
          finances.unshift(newSale);
        }
        KAStorage.saveFinances(finances);

        saleForm.reset();
        document.getElementById("personal-sale-id").value = "";
        document.getElementById("sale-form-modal").classList.add("hidden");
        // Reset date to today
        const todayStr = new Date().toISOString().split("T")[0];
        document.getElementById("personal-sale-date").value = todayStr;

        this.renderMySales();
        this.renderProfile();

        ErrorHandler.showToast("Vente enregistrée avec succès !", "success");
      });
    }

    const collectionForm = document.getElementById("sale-collection-form");
    if (collectionForm) {
      collectionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("collection-sale-id").value;
        const amount = Number(document.getElementById("collection-amount").value);
        const date = document.getElementById("collection-date").value;
        const method = document.getElementById("collection-method").value;
        const finances = KAStorage.getFinances();
        const sale = finances.find((item) => item.id === id);
        if (!sale) return;
        const paidAmount = Object.prototype.hasOwnProperty.call(sale, "paidAmount")
          ? Number(sale.paidAmount) || 0
          : Number(sale.amount) || 0;
        const remaining = Math.max(0, Number(sale.amount) - paidAmount);
        if (!Number.isFinite(amount) || amount <= 0 || amount > remaining || !date) {
          ErrorHandler.showToast(
            "Le montant encaissé doit être positif et ne pas dépasser le solde restant.",
            "error"
          );
          return;
        }
        sale.paidAmount = paidAmount + amount;
        sale.payments = [...(sale.payments || []), { amount, date, method }];
        sale.paymentStatus = sale.paidAmount >= Number(sale.amount) ? "payée" : "partielle";
        KAStorage.saveFinances(finances);
        collectionForm.reset();
        document.getElementById("sale-collection-modal").classList.add("hidden");
        this.renderMySales();
        this.renderProfile();
        ErrorHandler.showToast("Encaissement enregistré.", "success");
      });
    }

    window.openNewSaleModal = () => {
      document.getElementById("personal-sale-form").reset();
      document.getElementById("personal-sale-id").value = "";
      document.getElementById("personal-sale-paid").value = "0";
      document.getElementById("personal-sale-paid").disabled = false;
      document.getElementById("personal-sale-method").disabled = false;
      document.getElementById("personal-sale-date").value = new Date().toISOString().slice(0, 10);
      document.getElementById("sale-form-modal").classList.remove("hidden");
    };
  },
};

// Start personal module
document.addEventListener("DOMContentLoaded", () => {
  PersonalModule.init();
});

document.addEventListener("ka_data_updated", (e) => {
  if (
    e.detail &&
    (e.detail.key === "ka_farm_users" ||
      e.detail.key === "ka_farm_tasks" ||
      e.detail.key === "ka_farm_finances")
  ) {
    PersonalModule.renderProfile();
    PersonalModule.renderMyTasks();
    PersonalModule.renderMySales();
  }
});
