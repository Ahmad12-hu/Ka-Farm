import { supabase } from '../auth-client.js';

const HarvestsModule = {
  async init() {
    console.log("Initialisation du module des récoltes...");
    this.fetchAndRenderHarvests();
  },

  async fetchAndRenderHarvests() {
    const tableBody = document.getElementById('harvests-table-body');
    const loadingRow = document.getElementById('loading-row');

    try {
      // 1. Récupérer les données depuis la table 'harvests'
      const { data: harvests, error } = await supabase
        .from('harvests')
        .select('*')
        .order('harvest_date', { ascending: false });

      if (error) {
        // Si RLS est mal configuré ou autre erreur, l'afficher
        throw error;
      }

      // 2. Vider le tableau (sauf la ligne de chargement)
      tableBody.innerHTML = '';

      if (harvests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-400 font-semibold">Aucune récolte n'a encore été enregistrée.</td></tr>`;
        return;
      }

      // 3. Créer et insérer les lignes pour chaque récolte
      harvests.forEach(harvest => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 dark:hover:bg-[#0E2F19]/50 transition-colors";
        row.innerHTML = `
          <td class="p-4 font-bold text-slate-700 dark:text-slate-200">${harvest.crop_name || 'N/A'}</td>
          <td class="p-4 text-slate-600 dark:text-slate-400 font-semibold">${harvest.parcel_name || 'N/A'}</td>
          <td class="p-4 text-slate-600 dark:text-slate-300 font-mono font-bold">${harvest.quantity_kg || 0} kg</td>
          <td class="p-4 text-slate-600 dark:text-slate-400 font-semibold">${new Date(harvest.harvest_date).toLocaleDateString('fr-FR')}</td>
          <td class="p-4">
            <span class="px-2 py-1 text-[10px] font-black rounded-full ${harvest.quality === 'A' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}">
              Qualité ${harvest.quality || 'B'}
            </span>
          </td>
          <td class="p-4">
            <button class="p-1.5 text-slate-400 hover:text-emerald-500"><i data-lucide="edit-3" class="h-3.5 w-3.5"></i></button>
            <button class="p-1.5 text-slate-400 hover:text-rose-500"><i data-lucide="trash-2" class="h-3.5 w-3.5"></i></button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Recréer les icônes Lucide
      if (window.lucide) {
        lucide.createIcons();
      }

    } catch (err) {
      console.error("Erreur lors de la récupération des récoltes:", err.message);
      loadingRow.innerHTML = `<td colspan="6" class="p-8 text-center text-rose-400 font-semibold">Erreur: Impossible de charger les données. Vérifiez les règles RLS et la connexion.</td>`;
    }
  }
};

// Initialiser le module quand la page est chargée
document.addEventListener('DOMContentLoaded', () => HarvestsModule.init());