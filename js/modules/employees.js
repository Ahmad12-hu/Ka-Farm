// KA Farm - Gestion des Employés Module
import { KAStorage } from '../storage.js';
import { ErrorHandler } from './error-handler.js';

let employees = [];
let attendance = [];
let payments = [];
let tasks = [];
let selectedEmployeeId = null;

export const EmployeesModule = {
  init() {
    employees = KAStorage.getEmployees();
    attendance = KAStorage.getAttendance();
    payments = KAStorage.getEmployeePayments();
    tasks = KAStorage.getTasks();

    if (employees.length > 0) {
      selectedEmployeeId = employees[0].id;
    }

    // Set default date for attendance pointage to today (2026-06-26)
    const attDateEl = document.getElementById('attendance-date');
    if (attDateEl) {
      attDateEl.value = '2026-06-26'; // Default farm operations date
    }

    // Set default dates for calculator
    const calcStart = document.getElementById('calc-start-date');
    const calcEnd = document.getElementById('calc-end-date');
    if (calcStart) calcStart.value = '2026-06-01';
    if (calcEnd) calcEnd.value = '2026-06-26';

    this.render();
    this.setupListeners();
    this.loadEmployeeSelects();

    // Search filter for registry
    const searchInput = document.getElementById('search-employees');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterEmployees(e.target.value);
      });
    }
  },

  render() {
    employees = KAStorage.getEmployees();
    attendance = KAStorage.getAttendance();
    payments = KAStorage.getEmployeePayments();
    tasks = KAStorage.getTasks();

    this.renderStats();
    this.renderRegistryTable();
    this.renderDetails();
    this.renderAttendanceForm();
    this.renderAttendanceHistoryDays();
    this.renderPaymentsHistory();
  },

  renderStats() {
    if (!employees.length) return;

    // Total Employees
    const totalEmployeesEl = document.getElementById('stat-total-employees');
    if (totalEmployeesEl) totalEmployeesEl.textContent = employees.length;

    const activeCount = employees.filter(e => e.status === 'Actif').length;
    const activePctEl = document.getElementById('stat-active-percentage');
    if (activePctEl) {
      activePctEl.textContent = `${activeCount} actifs sur le terrain`;
    }

    // Presence today
    const selectedDate = document.getElementById('attendance-date')?.value || '2026-06-26';
    const dayAttendance = attendance.filter(a => a.date === selectedDate);
    const presentCount = dayAttendance.filter(a => a.status === 'Présent' || a.status === 'Demi-journée').length;

    const presenceTodayEl = document.getElementById('stat-presence-today');
    if (presenceTodayEl) presenceTodayEl.textContent = presentCount;

    const presenceTotalEl = document.getElementById('stat-presence-total');
    if (presenceTotalEl) presenceTotalEl.textContent = `/ ${employees.filter(e => e.status === 'Actif').length}`;

    const presenceRateEl = document.getElementById('stat-presence-rate');
    if (presenceRateEl) {
      const rate = Math.round((presentCount / (employees.filter(e => e.status === 'Actif').length || 1)) * 100);
      presenceRateEl.textContent = `${rate}% de présence aujourd'hui`;
    }

    // Daily Mass (Masse journalière brute des actifs)
    const dailyMass = employees.filter(e => e.status === 'Actif').reduce((sum, e) => sum + Number(e.dailyRate), 0);
    const dailyMassEl = document.getElementById('stat-daily-mass');
    if (dailyMassEl) dailyMassEl.textContent = dailyMass.toLocaleString('fr-FR');

    // Total payments made
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPaidEl = document.getElementById('stat-total-paid');
    if (totalPaidEl) totalPaidEl.textContent = totalPaid.toLocaleString('fr-FR');
  },

  renderRegistryTable() {
    const tableBody = document.getElementById('employees-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    employees.forEach(emp => {
      const isSelected = emp.id === selectedEmployeeId;
      const tr = document.createElement('tr');
      tr.className = `cursor-pointer transition-all ${isSelected ? 'bg-emerald-500/10 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-[#0D2615]/30'}`;
      tr.addEventListener('click', (e) => {
        if (e.target.closest('.action-btn')) return;
        this.selectEmployee(emp.id);
      });

      let statusBadge = emp.status === 'Actif'
        ? '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Actif</span>'
        : '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">Inactif</span>';

      tr.innerHTML = `
        <td class="px-4 py-3 font-mono text-slate-400 dark:text-[#819888] font-bold">${emp.id}</td>
        <td class="px-4 py-3 font-black text-slate-800 dark:text-slate-100">${emp.name}</td>
        <td class="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">${emp.phone}</td>
        <td class="px-4 py-3 text-slate-500 dark:text-slate-300 font-bold">${emp.role}</td>
        <td class="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-200">${Number(emp.dailyRate).toLocaleString('fr-FR')} <span class="text-[9px] font-normal text-[#819888]">F</span></td>
        <td class="px-4 py-3 text-center">${statusBadge}</td>
        <td class="px-4 py-3 text-center">
          <div class="inline-flex items-center gap-1">
            <button onclick="window.openEditEmployeeModal('${emp.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
              <i data-lucide="edit-2" class="h-3.5 w-3.5"></i>
            </button>
            <button onclick="window.deleteEmployee('${emp.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
              <i data-lucide="trash" class="h-3.5 w-3.5"></i>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  },

  renderDetails() {
    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (!emp) return;

    // Head text
    const nameEl = document.getElementById('detail-emp-name');
    if (nameEl) nameEl.textContent = emp.name;

    const idEl = document.getElementById('detail-emp-id');
    if (idEl) idEl.textContent = `ID: ${emp.id}`;

    const roleEl = document.getElementById('detail-emp-role');
    if (roleEl) roleEl.textContent = emp.role;

    const rateEl = document.getElementById('detail-emp-rate');
    if (rateEl) rateEl.textContent = Number(emp.dailyRate).toLocaleString('fr-FR');

    const phoneEl = document.getElementById('detail-emp-phone');
    if (phoneEl) phoneEl.textContent = emp.phone;

    const callLink = document.getElementById('link-emp-call');
    if (callLink) callLink.href = `tel:${emp.phone.replace(/\s+/g, '')}`;

    const statusBadge = document.getElementById('detail-emp-status');
    if (statusBadge) {
      statusBadge.textContent = emp.status.toUpperCase();
      if (emp.status === 'Actif') {
        statusBadge.className = 'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      } else {
        statusBadge.className = 'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20';
      }
    }

    // Render assigned tasks
    const tasksContainer = document.getElementById('detail-emp-tasks-container');
    if (tasksContainer) {
      tasksContainer.innerHTML = '';
      
      const empTasks = tasks.filter(t => t.assignee.toLowerCase().trim() === emp.name.toLowerCase().trim());
      
      if (empTasks.length === 0) {
        tasksContainer.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500 font-semibold italic py-2">Aucune tâche assignée actuellement.</p>';
      } else {
        empTasks.forEach(t => {
          const taskDiv = document.createElement('div');
          taskDiv.className = `p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${t.completed ? 'bg-slate-50/50 dark:bg-[#0D2615]/10 border-slate-100 dark:border-[#143E23]/15 opacity-60' : 'bg-white dark:bg-[#0B2112]/30 border-slate-100 dark:border-[#143E23]/25'}`;
          
          let priorityBadge = '';
          if (t.priority === 'Haute') {
            priorityBadge = '<span class="text-[8px] px-1.5 py-0.1 bg-rose-500/10 text-rose-500 rounded font-black uppercase">HAUTE</span>';
          } else if (t.priority === 'Moyenne') {
            priorityBadge = '<span class="text-[8px] px-1.5 py-0.1 bg-amber-500/10 text-amber-500 rounded font-black uppercase">MOY</span>';
          } else {
            priorityBadge = '<span class="text-[8px] px-1.5 py-0.1 bg-slate-500/10 text-slate-400 rounded font-black uppercase">BASSE</span>';
          }

          taskDiv.innerHTML = `
            <div class="space-y-0.5 text-left min-w-0 flex-1 pr-2">
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-emerald-400 font-bold font-mono">[${t.category}]</span>
                ${priorityBadge}
              </div>
              <p class="font-black text-slate-800 dark:text-slate-100 truncate ${t.completed ? 'line-through' : ''}">${t.title}</p>
              <p class="text-[9px] text-[#819888] font-bold">Échéance : ${t.dueDate}</p>
            </div>
            <div>
              <button onclick="window.toggleTaskStatusFromEmployees('${t.id}')" class="p-1.5 rounded-lg border transition-all cursor-pointer ${t.completed ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0D2615] border-[#143E23] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'}">
                <i data-lucide="${t.completed ? 'check-square' : 'square'}" class="h-4 w-4"></i>
              </button>
            </div>
          `;
          tasksContainer.appendChild(taskDiv);
        });
      }
    }

    // Bind edit/delete to selected
    const editBtn = document.getElementById('btn-edit-employee');
    if (editBtn) editBtn.onclick = () => window.openEditEmployeeModal(emp.id);

    const deleteBtn = document.getElementById('btn-delete-employee');
    if (deleteBtn) deleteBtn.onclick = () => window.deleteEmployee(emp.id);

    if (window.lucide) window.lucide.createIcons();
  },

  renderAttendanceForm() {
    const tableBody = document.getElementById('attendance-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const selectedDate = document.getElementById('attendance-date')?.value || '2026-06-26';
    const activeEmployees = employees.filter(e => e.status === 'Actif');

    if (activeEmployees.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-8 text-center text-slate-400 font-bold italic">
            Aucun ouvrier actif pour le moment. Veuillez en recruter ou réactiver.
          </td>
        </tr>
      `;
      return;
    }

    activeEmployees.forEach(emp => {
      // Find log if exists
      const log = attendance.find(a => a.employeeId === emp.id && a.date === selectedDate);
      const currentStatus = log ? log.status : 'Présent'; // Default to present
      const currentNotes = log ? log.notes : '';

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 dark:hover:bg-[#0D2615]/20 transition-all';
      
      tr.innerHTML = `
        <td class="px-6 py-4">
          <div class="text-left">
            <p class="font-black text-slate-800 dark:text-slate-100 text-xs">${emp.name}</p>
            <p class="text-[9px] text-[#819888] font-mono font-bold">ID: ${emp.id}</p>
          </div>
        </td>
        <td class="px-6 py-4 text-slate-500 dark:text-slate-300 text-xs">${emp.role}</td>
        <td class="px-6 py-4">
          <div class="flex items-center justify-center gap-4">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="status-${emp.id}" value="Présent" ${currentStatus === 'Présent' ? 'checked' : ''} class="accent-emerald-500 h-3.5 w-3.5 cursor-pointer">
              <span class="text-[10px] font-black uppercase text-emerald-500">Présent</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="status-${emp.id}" value="Demi-journée" ${currentStatus === 'Demi-journée' ? 'checked' : ''} class="accent-amber-500 h-3.5 w-3.5 cursor-pointer">
              <span class="text-[10px] font-black uppercase text-amber-500">Demi-journée</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="status-${emp.id}" value="Absent" ${currentStatus === 'Absent' ? 'checked' : ''} class="accent-rose-500 h-3.5 w-3.5 cursor-pointer">
              <span class="text-[10px] font-black uppercase text-rose-500">Absent</span>
            </label>
          </div>
        </td>
        <td class="px-6 py-4">
          <input type="text" name="notes-${emp.id}" value="${currentNotes}" placeholder="Ex: Retard 30m, Maladie" class="w-full bg-[#0D2615]/30 border border-[#143E23]/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none">
        </td>
      `;

      tableBody.appendChild(tr);
    });
  },

  renderAttendanceHistoryDays() {
    const container = document.getElementById('attendance-history-days');
    if (!container) return;

    container.innerHTML = '';

    // Extract unique dates from attendance database
    const dates = [...new Set(attendance.map(a => a.date))].sort().reverse().slice(0, 6);

    if (dates.length === 0) {
      container.innerHTML = '<p class="text-xs text-[#819888] font-bold italic col-span-full">Aucun historique enregistré.</p>';
      return;
    }

    dates.forEach(d => {
      const dayLogs = attendance.filter(a => a.date === d);
      const totalCount = dayLogs.length;
      const presentCount = dayLogs.filter(a => a.status === 'Présent' || a.status === 'Demi-journée').length;
      
      const div = document.createElement('button');
      div.type = 'button';
      div.onclick = () => {
        const picker = document.getElementById('attendance-date');
        if (picker) {
          picker.value = d;
          this.renderAttendanceForm();
          this.renderStats();
        }
      };

      const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
      
      div.className = 'p-3 bg-[#0D2615]/30 border border-[#143E23]/20 hover:border-emerald-500/30 hover:bg-[#0D2615]/50 rounded-2xl text-left space-y-1 transition-all cursor-pointer';
      
      div.innerHTML = `
        <p class="text-[10px] font-black text-[#819888] uppercase tracking-wider">${d === '2026-06-26' ? 'Aujourd\'hui' : d}</p>
        <div class="text-sm font-black text-slate-800 dark:text-white">${presentCount} / ${totalCount}</div>
        <p class="text-[9px] font-bold text-emerald-500">${pct}% présence</p>
      `;

      container.appendChild(div);
    });
  },

  renderPaymentsHistory() {
    const container = document.getElementById('payments-history-list');
    if (!container) return;

    container.innerHTML = '';

    const sortedPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date));

    if (sortedPayments.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-400 font-semibold italic text-center py-6">Aucun versement enregistré pour le moment.</p>';
      return;
    }

    sortedPayments.forEach(pay => {
      const emp = employees.find(e => e.id === pay.employeeId);
      const empName = emp ? emp.name : 'Ouvrier inconnu';

      const div = document.createElement('div');
      div.className = 'p-3.5 bg-slate-50 dark:bg-[#0D2615]/30 border border-slate-100 dark:border-[#143E23]/25 rounded-2xl text-xs font-semibold space-y-2';
      
      div.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="space-y-0.5 text-left">
            <h4 class="font-black text-slate-800 dark:text-slate-200">${empName}</h4>
            <p class="text-[9px] text-[#819888] font-bold">Période : ${pay.periodStart} au ${pay.periodEnd}</p>
          </div>
          <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAYÉ</span>
        </div>
        <div class="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-[#143E23]/10 text-[10px] font-bold text-[#819888]">
          <div class="flex items-center gap-1.5">
            <i data-lucide="credit-card" class="h-3.5 w-3.5"></i>
            <span>Moyen : ${pay.paymentMethod}</span>
          </div>
          <div>Date: ${pay.date}</div>
        </div>
        <div class="flex justify-between items-baseline pt-1">
          <span class="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Montant versé :</span>
          <span class="text-sm font-black text-emerald-400">${Number(pay.amount).toLocaleString('fr-FR')} FCFA</span>
        </div>
      `;

      container.appendChild(div);
    });

    if (window.lucide) window.lucide.createIcons();
  },

  loadEmployeeSelects() {
    const calcSelect = document.getElementById('calc-employee-select');
    if (calcSelect) {
      calcSelect.innerHTML = employees.map(e => `<option value="${e.id}">${e.name} (${e.role})</option>`).join('');
    }
  },

  selectEmployee(id) {
    selectedEmployeeId = id;
    this.render();
  },

  filterEmployees(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.render();
      return;
    }

    const filtered = employees.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.id.toLowerCase().includes(q) || 
      e.role.toLowerCase().includes(q) ||
      e.phone.includes(q)
    );

    const tableBody = document.getElementById('employees-table-body');
    if (tableBody) {
      tableBody.innerHTML = '';
      filtered.forEach(emp => {
        const isSelected = emp.id === selectedEmployeeId;
        const tr = document.createElement('tr');
        tr.className = `cursor-pointer transition-all ${isSelected ? 'bg-emerald-500/10 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-[#0D2615]/30'}`;
        tr.addEventListener('click', (e) => {
          if (e.target.closest('.action-btn')) return;
          this.selectEmployee(emp.id);
        });

        let statusBadge = emp.status === 'Actif'
          ? '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Actif</span>'
          : '<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">Inactif</span>';

        tr.innerHTML = `
          <td class="px-4 py-3 font-mono text-slate-400 dark:text-[#819888] font-bold">${emp.id}</td>
          <td class="px-4 py-3 font-black text-slate-800 dark:text-slate-100">${emp.name}</td>
          <td class="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">${emp.phone}</td>
          <td class="px-4 py-3 text-slate-500 dark:text-slate-300 font-bold">${emp.role}</td>
          <td class="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-200">${Number(emp.dailyRate).toLocaleString('fr-FR')} FCFA</td>
          <td class="px-4 py-3 text-center">${statusBadge}</td>
          <td class="px-4 py-3 text-center">
            <div class="inline-flex items-center gap-1">
              <button onclick="window.openEditEmployeeModal('${emp.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                <i data-lucide="edit-2" class="h-3.5 w-3.5"></i>
              </button>
              <button onclick="window.deleteEmployee('${emp.id}')" class="action-btn p-1 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
                <i data-lucide="trash" class="h-3.5 w-3.5"></i>
              </button>
            </div>
          </td>
        `;
        tableBody.appendChild(tr);
      });
      if (window.lucide) window.lucide.createIcons();
    }
  },

  setupListeners() {
    // Add Employee Form
    const addForm = document.getElementById('add-employee-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitAddEmployee();
      });
    }

    // Edit Employee Form
    const editForm = document.getElementById('edit-employee-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitEditEmployee();
      });
    }

    // Assign Task Form
    const taskForm = document.getElementById('assign-task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitAssignTask();
      });
    }

    // Pointage Form Submit
    const pointageForm = document.getElementById('attendance-form');
    if (pointageForm) {
      pointageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitAttendancePointage();
      });
    }

    // Payout modal submit
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitPayment();
      });
    }
  },

  submitAddEmployee() {
    const name = document.getElementById('form-emp-name').value.trim();
    const phone = document.getElementById('form-emp-phone').value.trim();
    const role = document.getElementById('form-emp-role').value.trim();
    const dailyRate = parseInt(document.getElementById('form-emp-rate').value);
    const status = document.getElementById('form-emp-status').value;

    const nextNum = employees.reduce((max, e) => {
      const num = parseInt(e.id.split('-')[1]);
      return num > max ? num : max;
    }, 0) + 1;
    const id = `E-${String(nextNum).padStart(3, '0')}`;

    const newEmp = { id, name, phone, role, dailyRate, status };
    employees.push(newEmp);
    KAStorage.saveEmployees(employees);

    selectedEmployeeId = id;
    this.closeAddEmployeeModal();
    this.render();
    this.loadEmployeeSelects();

    // Trigger sidebar badge count update
    if (window.App && typeof window.App.updateBadges === 'function') {
      window.App.updateBadges();
    }
  },

  submitEditEmployee() {
    const id = document.getElementById('form-edit-emp-id').value;
    const name = document.getElementById('form-edit-emp-name').value.trim();
    const phone = document.getElementById('form-edit-emp-phone').value.trim();
    const role = document.getElementById('form-edit-emp-role').value.trim();
    const dailyRate = parseInt(document.getElementById('form-edit-emp-rate').value);
    const status = document.getElementById('form-edit-emp-status').value;

    const idx = employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      employees[idx] = { ...employees[idx], name, phone, role, dailyRate, status };
      KAStorage.saveEmployees(employees);
      this.closeEditEmployeeModal();
      this.render();
      this.loadEmployeeSelects();
    }
  },

  submitAssignTask() {
    const title = document.getElementById('form-task-title').value.trim();
    const category = document.getElementById('form-task-category').value;
    const priority = document.getElementById('form-task-priority').value;
    const dueDate = document.getElementById('form-task-duedate').value;

    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (!emp) return;

    // Load actual tasks from storage
    const currentTasks = KAStorage.getTasks();

    // Generate unique T- ID
    const nextNum = currentTasks.reduce((max, t) => {
      const num = parseInt(t.id.split('-')[1]);
      return num > max ? num : max;
    }, 0) + 1;
    const id = `T-${String(nextNum).padStart(3, '0')}`;

    const newTask = {
      id,
      title,
      category,
      dueDate,
      assignee: emp.name, // assign using exact worker name
      priority,
      completed: false
    };

    currentTasks.unshift(newTask);
    KAStorage.saveTasks(currentTasks);

    this.closeAssignTaskModal();
    this.render();
    
    // Update dashboard & global badging if exists
    if (window.App && typeof window.App.updateBadges === 'function') {
      window.App.updateBadges();
    }
  },

  submitAttendancePointage() {
    const selectedDate = document.getElementById('attendance-date')?.value || '2026-06-26';
    const activeEmployees = employees.filter(e => e.status === 'Actif');

    let currentAttendance = KAStorage.getAttendance();

    activeEmployees.forEach(emp => {
      const selectedStatus = document.querySelector(`input[name="status-${emp.id}"]:checked`)?.value || 'Présent';
      const notes = document.querySelector(`input[name="notes-${emp.id}"]`)?.value.trim() || '';

      // Find and replace or add
      const idx = currentAttendance.findIndex(a => a.employeeId === emp.id && a.date === selectedDate);
      if (idx !== -1) {
        currentAttendance[idx] = { employeeId: emp.id, date: selectedDate, status: selectedStatus, notes };
      } else {
        currentAttendance.push({ employeeId: emp.id, date: selectedDate, status: selectedStatus, notes });
      }
    });

    KAStorage.saveAttendance(currentAttendance);
    this.render();

    // Alert toast
    ErrorHandler.showToast('Pointage journalier enregistré avec succès !', 'success');
  },

  submitPayment() {
    const employeeId = document.getElementById('form-pay-employee-id').value;
    const amount = parseInt(document.getElementById('form-pay-amount').value);
    const periodStart = document.getElementById('form-pay-start-date').value;
    const periodEnd = document.getElementById('form-pay-end-date').value;
    const date = document.getElementById('form-pay-date').value;
    const paymentMethod = document.getElementById('form-pay-method').value;
    const syncFinance = document.getElementById('form-pay-sync-finance').checked;

    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    // Create Payment object
    const nextPayNum = payments.reduce((max, p) => {
      const num = parseInt(p.id.split('-')[1] || p.id.replace('PAY-', ''));
      return num > max ? num : max;
    }, 0) + 1;
    const payId = `PAY-${String(nextPayNum).padStart(3, '0')}`;

    const newPayment = {
      id: payId,
      employeeId,
      amount,
      date,
      periodStart,
      periodEnd,
      paymentMethod,
      status: 'Payé'
    };

    payments.push(newPayment);
    KAStorage.saveEmployeePayments(payments);

    // Synchronize with finances if selected
    if (syncFinance) {
      const finances = KAStorage.getFinances();
      const nextFinNum = finances.reduce((max, f) => {
        const num = parseInt(f.id.split('-')[1]);
        return num > max ? num : max;
      }, 0) + 1;
      const finId = `F-${String(nextFinNum).padStart(3, '0')}`;

      const newFinanceEntry = {
        id: finId,
        description: `Salaire versé à ${emp.name}`,
        category: 'Salaires',
        type: 'Dépense',
        amount,
        date
      };

      finances.unshift(newFinanceEntry);
      KAStorage.saveFinances(finances);
    }

    this.closePaymentModal();
    this.render();

    // Refresh salary calculation display
    window.calculateSalary();
  },

  closeAddEmployeeModal() {
    const modal = document.getElementById('add-employee-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.getElementById('add-employee-form').reset();
    }
  },

  closeEditEmployeeModal() {
    const modal = document.getElementById('edit-employee-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.getElementById('edit-employee-form').reset();
    }
  },

  closeAssignTaskModal() {
    const modal = document.getElementById('assign-task-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.getElementById('assign-task-form').reset();
    }
  },

  closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.getElementById('payment-form').reset();
    }
  }
};

// GLOBAL WINDOW HOOKS
window.switchTab = (tab) => {
  const tabs = ['registry', 'attendance', 'salaries'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const sec = document.getElementById(`section-${t}`);
    if (btn && sec) {
      if (t === tab) {
        btn.className = 'px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-emerald-500 text-emerald-500 outline-none transition-all cursor-pointer';
        sec.classList.remove('hidden');
      } else {
        btn.className = 'px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-transparent text-slate-400 hover:text-slate-200 outline-none transition-all cursor-pointer';
        sec.classList.add('hidden');
      }
    }
  });

  if (tab === 'attendance') {
    EmployeesModule.renderAttendanceForm();
  }
};

window.openAddEmployeeModal = () => {
  const modal = document.getElementById('add-employee-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeAddEmployeeModal = () => {
  EmployeesModule.closeAddEmployeeModal();
};

window.openEditEmployeeModal = (id) => {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  document.getElementById('form-edit-emp-id').value = emp.id;
  document.getElementById('form-edit-emp-name').value = emp.name;
  document.getElementById('form-edit-emp-phone').value = emp.phone;
  document.getElementById('form-edit-emp-role').value = emp.role;
  document.getElementById('form-edit-emp-rate').value = emp.dailyRate;
  document.getElementById('form-edit-emp-status').value = emp.status;

  const modal = document.getElementById('edit-employee-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeEditEmployeeModal = () => {
  EmployeesModule.closeEditEmployeeModal();
};

window.openAssignTaskModal = () => {
  const modal = document.getElementById('assign-task-modal');
  if (modal) {
    modal.classList.remove('hidden');
    // Default deadline to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('form-task-duedate').value = tomorrow.toISOString().split('T')[0];
  }
};

window.closeAssignTaskModal = () => {
  EmployeesModule.closeAssignTaskModal();
};

window.deleteEmployee = (id) => {
  if (confirm(`Êtes-vous sûr de vouloir licencier/supprimer définitivement l'ouvrier ${id} ? Ses pointages et paiements seront conservés.`)) {
    employees = employees.filter(e => e.id !== id);
    KAStorage.saveEmployees(employees);

    if (selectedEmployeeId === id) {
      selectedEmployeeId = employees.length > 0 ? employees[0].id : null;
    }

    EmployeesModule.render();
    EmployeesModule.loadEmployeeSelects();

    if (window.App && typeof window.App.updateBadges === 'function') {
      window.App.updateBadges();
    }
  }
};

window.toggleTaskStatusFromEmployees = (id) => {
  const currentTasks = KAStorage.getTasks();
  const idx = currentTasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    currentTasks[idx].completed = !currentTasks[idx].completed;
    KAStorage.saveTasks(currentTasks);
    EmployeesModule.render();
  }
};

window.loadAttendanceForSelectedDate = () => {
  EmployeesModule.renderAttendanceForm();
  EmployeesModule.renderStats();
};

window.calculateSalary = () => {
  const empId = document.getElementById('calc-employee-select')?.value;
  const startDate = document.getElementById('calc-start-date')?.value;
  const endDate = document.getElementById('calc-end-date')?.value;

  if (!empId || !startDate || !endDate) return;

  const emp = employees.find(e => e.id === empId);
  if (!emp) return;

  // Filter attendance logs
  const logs = attendance.filter(a => a.employeeId === empId && a.date >= startDate && a.date <= endDate);
  
  const presentLogs = logs.filter(a => a.status === 'Présent');
  const halfLogs = logs.filter(a => a.status === 'Demi-journée');
  const absentLogs = logs.filter(a => a.status === 'Absent');

  const workedDays = presentLogs.length * 1.0 + halfLogs.length * 0.5;
  const grossSalary = workedDays * Number(emp.dailyRate);

  // Filter payments
  const emppayments = payments.filter(p => p.employeeId === empId && p.date >= startDate && p.date <= endDate);
  const totalPaidOnPeriod = emppayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const netDue = Math.max(0, grossSalary - totalPaidOnPeriod);

  // Update DOM
  document.getElementById('calc-days-present').textContent = presentLogs.length;
  document.getElementById('calc-days-half').textContent = halfLogs.length;
  document.getElementById('calc-days-absent').textContent = absentLogs.length;
  
  document.getElementById('calc-gross-salary').textContent = grossSalary.toLocaleString('fr-FR');
  document.getElementById('calc-already-paid').textContent = totalPaidOnPeriod.toLocaleString('fr-FR');
  document.getElementById('calc-net-due').textContent = netDue.toLocaleString('fr-FR');

  // Activate payment button if due amount > 0
  const payBtn = document.getElementById('btn-trigger-payment');
  if (payBtn) {
    payBtn.disabled = netDue <= 0;
  }
};

window.openPaymentModal = () => {
  const empId = document.getElementById('calc-employee-select')?.value;
  const startDate = document.getElementById('calc-start-date')?.value;
  const endDate = document.getElementById('calc-end-date')?.value;
  const netDueText = document.getElementById('calc-net-due')?.textContent || '0';
  const netDue = parseInt(netDueText.replace(/\s+/g, '')) || 0;

  const emp = employees.find(e => e.id === empId);
  if (!emp || netDue <= 0) return;

  document.getElementById('form-pay-employee-id').value = emp.id;
  document.getElementById('form-pay-employee-name').textContent = emp.name;
  document.getElementById('form-pay-amount').value = netDue;
  document.getElementById('form-pay-start-date').value = startDate;
  document.getElementById('form-pay-end-date').value = endDate;
  document.getElementById('form-pay-date').value = '2026-06-26'; // Default current operation date

  const modal = document.getElementById('payment-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closePaymentModal = () => {
  EmployeesModule.closePaymentModal();
};

// Initialize module on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  EmployeesModule.init();
});

document.addEventListener('ka_data_updated', (e) => {
  if (e.detail && (
    e.detail.key === 'ka_farm_employees' ||
    e.detail.key === 'ka_farm_attendance' ||
    e.detail.key === 'ka_farm_employee_payments'
  )) {
    EmployeesModule.render();
  }
});
