// KA Farm - Module d'export CSV/PDF
import { KAStorage } from '../storage.js';
import { UserManager } from '../user-manager.js';
import { ErrorHandler } from './error-handler.js';

// jsPDF sera chargé dynamiquement via CDN ou import()
let jsPDF = null;

async function getJsPDF() {
  if (!jsPDF) {
    try {
      const module = await import('jspdf');
      jsPDF = module.default || module.jsPDF || module;
    } catch (err) {
      ErrorHandler.log(err, 'ExportModule.getJsPDF', 'warn');
      return null;
    }
  }
  return jsPDF;
}

// Utilitaire: formater la date pour les noms de fichiers
function getTodayString() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// Utilitaire: télécharger un fichier
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==================== CSV EXPORTS ====================

export function exportFinancesCSV() {
  const user = UserManager.getCurrentUser();
  if (!user || !['Bureau', 'Terrain', 'admin', 'super_admin'].includes(user.role)) {
    ErrorHandler.showToast('Accès refusé: vous n\'avez pas les droits d\'export.', 'error');
    return;
  }

  const finances = KAStorage.getFinances();
  if (finances.length === 0) {
    ErrorHandler.showToast('Aucune donnée financière à exporter.', 'warning');
    return;
  }

  // BOM UTF-8 pour Excel français
  let csv = '\uFEFF';
  csv += 'Libellé;Type;Rubrique;Date;Montant (F)\n';

  finances.forEach(f => {
    const row = [
      f.description || '',
      f.type || '',
      f.category || '',
      f.date || '',
      f.amount || 0
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(';');
    csv += row + '\n';
  });

  // Total en bas
  const stats = KAStorage.getFinanceStats();
  csv += `\n"TOTAL REVENUS";"";"";"";${stats.totalRevenu}\n`;
  csv += `"TOTAL DÉPENSES";"";"";"";${stats.totalDepense}\n`;
  csv += `"SOLDE";"";"";"";${stats.solde}\n`;

  downloadFile(csv, `finances_ka-farm_${getTodayString()}.csv`, 'text/csv;charset=utf-8');
  ErrorHandler.showToast('Export CSV financier réussi !', 'success');
}

export function exportStocksCSV() {
  const user = UserManager.getCurrentUser();
  if (!user || !['Bureau', 'Terrain', 'admin', 'super_admin'].includes(user.role)) {
    ErrorHandler.showToast('Accès refusé.', 'error');
    return;
  }

  const stocks = KAStorage.getStocks();
  if (stocks.length === 0) {
    ErrorHandler.showToast('Aucun stock à exporter.', 'warning');
    return;
  }

  let csv = '\uFEFF';
  csv += 'Nom;Catégorie;Quantité;Quantité Max;Unité;Statut\n';

  stocks.forEach(s => {
    const row = [
      s.name || '',
      s.category || '',
      s.quantity || 0,
      s.maxQuantity || 0,
      s.unit || '',
      s.status || 'Actif'
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(';');
    csv += row + '\n';
  });

  downloadFile(csv, `stocks_ka-farm_${getTodayString()}.csv`, 'text/csv;charset=utf-8');
  ErrorHandler.showToast('Export CSV stocks réussi !', 'success');
}

export function exportHarvestsCSV() {
  const user = UserManager.getCurrentUser();
  if (!user || !['Bureau', 'Terrain', 'admin', 'super_admin'].includes(user.role)) {
    ErrorHandler.showToast('Accès refusé.', 'error');
    return;
  }

  const harvests = KAStorage.getHarvests();
  if (harvests.length === 0) {
    ErrorHandler.showToast('Aucune récolte à exporter.', 'warning');
    return;
  }

  let csv = '\uFEFF';
  csv += 'Culture;Parcelle;Quantité (kg);Date;Qualité;Notes\n';

  harvests.forEach(h => {
    const row = [
      h.crop_name || '',
      h.parcel_name || '',
      h.quantity_kg || 0,
      h.date ? new Date(h.date).toLocaleDateString('fr-FR') : '',
      h.quality || 'B',
      h.notes || ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(';');
    csv += row + '\n';
  });

  // Total quantité
  const totalKg = harvests.reduce((sum, h) => sum + (parseFloat(h.quantity_kg) || 0), 0);
  csv += `\n"TOTAL GÉNÉRAL";"";${totalKg.toFixed(1)};"";"";""\n`;

  downloadFile(csv, `recoltes_ka-farm_${getTodayString()}.csv`, 'text/csv;charset=utf-8');
  ErrorHandler.showToast('Export CSV récoltes réussi !', 'success');
}

// ==================== PDF EXPORTS ====================

export async function exportFinancesPDF() {
  const user = UserManager.getCurrentUser();
  if (!user || !['Bureau', 'Terrain', 'admin', 'super_admin'].includes(user.role)) {
    ErrorHandler.showToast('Accès refusé.', 'error');
    return;
  }

  const finances = KAStorage.getFinances();
  if (finances.length === 0) {
    ErrorHandler.showToast('Aucune donnée financière à exporter.', 'warning');
    return;
  }

  const jsPDFLib = await getJsPDF();
  if (!jsPDFLib) {
    ErrorHandler.showToast('Erreur: bibliothèque PDF non disponible.', 'error');
    return;
  }

  const doc = new jsPDFLib();
  const stats = KAStorage.getFinanceStats();

  // En-tête
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KA Farm - Bilan Financier', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

  // Résumé
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Revenus: ${stats.totalRevenu.toLocaleString('fr-FR')} F`, 14, 38);
  doc.text(`Total Dépenses: ${stats.totalDepense.toLocaleString('fr-FR')} F`, 14, 45);
  doc.text(`Solde: ${stats.solde.toLocaleString('fr-FR')} F`, 14, 52);

  // Tableau
  let y = 62;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Libellé', 14, y);
  doc.text('Type', 80, y);
  doc.text('Date', 110, y);
  doc.text('Montant', 150, y);
  y += 2;

  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  finances.forEach(f => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    const libelle = f.description.substring(0, 35);
    doc.text(libelle, 14, y);
    doc.text(f.type || '', 80, y);
    doc.text(f.date || '', 110, y);
    doc.text(`${f.amount.toLocaleString('fr-FR')} F`, 150, y);
    y += 6;
  });

  // Totaux en bas
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL REVENUS: ${stats.totalRevenu.toLocaleString('fr-FR')} F`, 14, y);
  y += 6;
  doc.text(`TOTAL DÉPENSES: ${stats.totalDepense.toLocaleString('fr-FR')} F`, 14, y);
  y += 6;
  doc.text(`SOLDE: ${stats.solde.toLocaleString('fr-FR')} F`, 14, y);

  doc.save(`finances_ka-farm_${getTodayString()}.pdf`);
  ErrorHandler.showToast('Export PDF réussi !', 'success');
}

export async function exportStocksPDF() {
  const user = UserManager.getCurrentUser();
  if (!user || !['Bureau', 'Terrain', 'admin', 'super_admin'].includes(user.role)) {
    ErrorHandler.showToast('Accès refusé.', 'error');
    return;
  }

  const stocks = KAStorage.getStocks();
  if (stocks.length === 0) {
    ErrorHandler.showToast('Aucun stock à exporter.', 'warning');
    return;
  }

  const jsPDFLib = await getJsPDF();
  if (!jsPDFLib) {
    ErrorHandler.showToast('Erreur: bibliothèque PDF non disponible.', 'error');
    return;
  }

  const doc = new jsPDFLib();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KA Farm - État des Stocks', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

  let y = 40;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Nom', 14, y);
  doc.text('Catégorie', 60, y);
  doc.text('Qté', 90, y);
  doc.text('Max', 110, y);
  doc.text('Unité', 130, y);
  y += 2;

  doc.line(14, y, 196, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  stocks.forEach(s => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    doc.text((s.name || '').substring(0, 30), 14, y);
    doc.text(s.category || '', 60, y);
    doc.text(String(s.quantity || 0), 90, y);
    doc.text(String(s.maxQuantity || 0), 110, y);
    doc.text(s.unit || '', 130, y);
    y += 6;
  });

  doc.save(`stocks_ka-farm_${getTodayString()}.pdf`);
  ErrorHandler.showToast('Export PDF stocks réussi !', 'success');
}

export async function exportHarvestsPDF() {
  const user = UserManager.getCurrentUser();
  if (!user || !['Bureau', 'Terrain', 'admin', 'super_admin'].includes(user.role)) {
    ErrorHandler.showToast('Accès refusé.', 'error');
    return;
  }

  const harvests = KAStorage.getHarvests();
  if (harvests.length === 0) {
    ErrorHandler.showToast('Aucune récolte à exporter.', 'warning');
    return;
  }

  const jsPDFLib = await getJsPDF();
  if (!jsPDFLib) {
    ErrorHandler.showToast('Erreur: bibliothèque PDF non disponible.', 'error');
    return;
  }

  const doc = new jsPDFLib();
  const totalKg = harvests.reduce((sum, h) => sum + (parseFloat(h.quantity_kg) || 0), 0);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KA Farm - Journal des Récoltes', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
  doc.text(`Total récolté: ${totalKg.toFixed(1)} kg`, 14, 35);

  let y = 45;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Culture', 14, y);
  doc.text('Parcelle', 50, y);
  doc.text('Qté (kg)', 90, y);
  doc.text('Date', 120, y);
  doc.text('Qualité', 150, y);
  y += 2;

  doc.line(14, y, 196, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  harvests.forEach(h => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    doc.text((h.crop_name || '').substring(0, 25), 14, y);
    doc.text((h.parcel_name || '').substring(0, 25), 50, y);
    doc.text(String(h.quantity_kg || 0), 90, y);
    doc.text(h.date ? new Date(h.date).toLocaleDateString('fr-FR') : '', 120, y);
    doc.text(h.quality || 'B', 150, y);
    y += 6;
  });

  doc.save(`recoltes_ka-farm_${getTodayString()}.pdf`);
  ErrorHandler.showToast('Export PDF récoltes réussi !', 'success');
}

// ==================== RBAC HELPERS ====================

export function canExport() {
  const user = UserManager.getCurrentUser();
  return user && ['Bureau', 'Terrain', 'admin', 'super_admin'].includes(user.role);
}

// Export global pour window (appelé par les boutons HTML)
window.exportFinancesCSV = exportFinancesCSV;
window.exportFinancesPDF = exportFinancesPDF;
window.exportStocksCSV = exportStocksCSV;
window.exportStocksPDF = exportStocksPDF;
window.exportHarvestsCSV = exportHarvestsCSV;
window.exportHarvestsPDF = exportHarvestsPDF;