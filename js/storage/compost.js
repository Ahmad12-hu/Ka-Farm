// KA Farm - Compost Storage Domain
// Manages organic composting data

import { KAStorage } from './core.js';

const DEFAULT_COMPOST_MATERIALS = [
  {
    id: 'CM-001',
    name: 'Fumier de Vache',
    material_type: 'Fumier',
    carbon_ratio: 25,
    nitrogen_ratio: 1.5,
    c_n_ratio: 16.7,
    moisture_content: 60,
    unit: 'kg',
    description: 'Fumier de vache fraîchement produit. Riche en azote et matière organique. Nécessite un compostage prolongé.',
    is_common_in_senegal: true,
    notes: 'Disponible localement dans les fermes d\'élevage. Peut contenir des graines de mauvaises herbes.'
  },
  {
    id: 'CM-002',
    name: 'Fumier de Cheval',
    material_type: 'Fumier',
    carbon_ratio: 28,
    nitrogen_ratio: 1.2,
    c_n_ratio: 23.3,
    moisture_content: 55,
    unit: 'kg',
    description: 'Fumier de cheval avec paille. Bonne structure pour l\'aération du tas de compost.',
    is_common_in_senegal: true,
    notes: 'Séchage recommandé avant compostage pour réduire le volume.'
  },
  {
    id: 'CM-003',
    name: 'Fumier de Mouton',
    material_type: 'Fumier',
    carbon_ratio: 30,
    nitrogen_ratio: 1.8,
    c_n_ratio: 16.7,
    moisture_content: 50,
    unit: 'kg',
    description: 'Fumier de mouton compact et riche en nutriments. Excellente source d\'azote.',
    is_common_in_senegal: true,
    notes: 'Très utilisé au Sénégal pour les cultures maraîchères.'
  },
  {
    id: 'CM-004',
    name: 'Fumier de Poulet (Fientes)',
    material_type: 'Fumier',
    carbon_ratio: 15,
    nitrogen_ratio: 3.5,
    c_n_ratio: 4.3,
    moisture_content: 70,
    unit: 'kg',
    description: 'Fientes de volaille très riches en azote et phosphore. À utiliser avec précaution (risque de brûlures).',
    is_common_in_senegal: true,
    notes: 'Doit être bien composté avant utilisation. Ne jamais utiliser frais.'
  },
  {
    id: 'CM-005',
    name: 'Résidus de Récolte (Tiges de Maïs)',
    material_type: 'Résidus végétaux',
    carbon_ratio: 40,
    nitrogen_ratio: 0.8,
    c_n_ratio: 50,
    moisture_content: 15,
    unit: 'kg',
    description: 'Tiges et feuilles de maïs après récolte. Riche en carbone, pauvre en azote.',
    is_common_in_senegal: true,
    notes: 'Idéal pour équilibrer les matériaux riches en azote.'
  },
  {
    id: 'CM-006',
    name: 'Paille de Riz',
    material_type: 'Résidus végétaux',
    carbon_ratio: 45,
    nitrogen_ratio: 0.5,
    c_n_ratio: 90,
    moisture_content: 10,
    unit: 'kg',
    description: 'Paille de riz légère et riche en silice. Excellente pour l\'aération.',
    is_common_in_senegal: true,
    notes: 'Disponible en grande quantité dans la région de Saint-Louis.'
  },
  {
    id: 'CM-007',
    name: 'Feuilles Sèches',
    material_type: 'Résidus végétaux',
    carbon_ratio: 35,
    nitrogen_ratio: 1.0,
    c_n_ratio: 35,
    moisture_content: 10,
    unit: 'kg',
    description: 'Feuilles d\'arbres et arbustes. Décomposition rapide si broyées.',
    is_common_in_senegal: true,
    notes: 'Collecte facile en saison sèche dans les zones boisées.'
  },
  {
    id: 'CM-008',
    name: 'Tontes de Gazons',
    material_type: 'Résidus verts',
    carbon_ratio: 20,
    nitrogen_ratio: 2.5,
    c_n_ratio: 8,
    moisture_content: 80,
    unit: 'kg',
    description: 'Herbe fraîchement coupée. Riche en azote mais peut former des boules.',
    is_common_in_senegal: true,
    notes: 'À mélanger avec des matériaux secs pour éviter le tassement.'
  },
  {
    id: 'CM-009',
    name: 'Mauvaises Herbes (sans graines)',
    material_type: 'Résidus verts',
    carbon_ratio: 22,
    nitrogen_ratio: 2.0,
    c_n_ratio: 11,
    moisture_content: 75,
    unit: 'kg',
    description: 'Mauvaises herbes coupées avant montaison en graines. Riche en nutriments.',
    is_common_in_senegal: true,
    notes: 'Attention à ne pas utiliser si les plantes ont des graines.'
  },
  {
    id: 'CM-010',
    name: 'Épluchures de Légumes',
    material_type: 'Déchets de cuisine',
    carbon_ratio: 15,
    nitrogen_ratio: 2.0,
    c_n_ratio: 7.5,
    moisture_content: 90,
    unit: 'kg',
    description: 'Épluchures de carottes, oignons, choux, etc. Décomposition très rapide.',
    is_common_in_senegal: true,
    notes: 'À ajouter en petites quantités pour éviter les odeurs.'
  },
  {
    id: 'CM-011',
    name: 'Coquilles d\'Arachide',
    material_type: 'Résidus de récolte',
    carbon_ratio: 45,
    nitrogen_ratio: 0.5,
    c_n_ratio: 90,
    moisture_content: 10,
    unit: 'kg',
    description: 'Coquilles d\'arachide après extraction des graines. Très riches en carbone.',
    is_common_in_senegal: true,
    notes: 'Utilisées comme paillage ou dans le compost pour améliorer la structure.'
  },
  {
    id: 'CM-012',
    name: 'Cendres de Bois',
    material_type: 'Minéral',
    carbon_ratio: 0,
    nitrogen_ratio: 0,
    c_n_ratio: 0,
    moisture_content: 5,
    unit: 'kg',
    description: 'Cendres de bois non traité. Riche en potassium et calcium.',
    is_common_in_senegal: true,
    notes: 'À utiliser avec modération (max 5% du volume). Alkalinise le compost.'
  },
  {
    id: 'CM-013',
    name: 'Tourteau d\'Arachide',
    material_type: 'Sous-produit agricole',
    carbon_ratio: 20,
    nitrogen_ratio: 4.0,
    c_n_ratio: 5,
    moisture_content: 10,
    unit: 'kg',
    description: 'Résidu de l\'extraction de l\'huile d\'arachide. Très riche en azote.',
    is_common_in_senegal: true,
    notes: 'À utiliser en petites quantités. Peut contenir des aflatoxines.'
  },
  {
    id: 'CM-014',
    name: 'Son de Mil',
    material_type: 'Sous-produit agricole',
    carbon_ratio: 25,
    nitrogen_ratio: 1.5,
    c_n_ratio: 16.7,
    moisture_content: 12,
    unit: 'kg',
    description: 'Enveloppe du mil après décorticage. Bonne source de carbone et fibres.',
    is_common_in_senegal: true,
    notes: 'Disponible en grande quantité après la récolte du mil.'
  }
];

const DEFAULT_MAIN = [
  { id: 'CR-001', name: 'Recette Classique 3 Couches', description: 'Recette traditionnelle en couches alternées de matériaux verts et bruns. Idéale pour les débutants.', target_c_n_ratio: 30, ideal_moisture: 60, ideal_temperature_min: 40, ideal_temperature_max: 60, maturation_days: 90, notes: 'Ratio recommandé : 2 parties de matériaux bruns pour 1 partie de matériaux verts.' },
  { id: 'CR-002', name: 'Recette Rapide pour Maraîchage', description: 'Recette optimisée pour une décomposition rapide. Parfaite pour les cultures intensives.', target_c_n_ratio: 25, ideal_moisture: 65, ideal_temperature_min: 45, ideal_temperature_max: 65, maturation_days: 60, notes: 'Nécessite un retournement fréquent du tas pour maintenir la température.' },
  { id: 'CR-003', name: 'Recette pour Sol Appauvri', description: 'Recette enrichie en nutriments pour revitaliser les sols épuisés.', target_c_n_ratio: 20, ideal_moisture: 55, ideal_temperature_min: 40, ideal_temperature_max: 55, maturation_days: 120, notes: 'Contient une forte proportion de fumier animal et de cendres.' },
  { id: 'CR-004', name: 'Recette Économique Local', description: 'Recette utilisant des matériaux facilement disponibles au Sénégal.', target_c_n_ratio: 35, ideal_moisture: 50, ideal_temperature_min: 35, ideal_temperature_max: 50, maturation_days: 180, notes: 'Utilise principalement fumier de mouton, paille de riz et résidus de récolte.' },
  { id: 'CR-005', name: 'Recette Bio-Intensive', description: 'Recette optimisée pour une production maximale de compost de haute qualité.', target_c_n_ratio: 28, ideal_moisture: 62, ideal_temperature_min: 50, ideal_temperature_max: 70, maturation_days: 45, notes: 'Nécessite une gestion précise de l\'humidité et de l\'aération.' }
];

const DEFAULT_RECIPE_INGREDIENTS = [
  { id: 'RI-001', recipe_id: 'CR-001', material_id: 'CM-005', quantity: 100, unit: 'kg', proportion_percent: 30, notes: 'Base carbone' },
  { id: 'RI-002', recipe_id: 'CR-001', material_id: 'CM-006', quantity: 50, unit: 'kg', proportion_percent: 15, notes: 'Aération' },
  { id: 'RI-003', recipe_id: 'CR-001', material_id: 'CM-001', quantity: 50, unit: 'kg', proportion_percent: 15, notes: 'Source azote' },
  { id: 'RI-004', recipe_id: 'CR-001', material_id: 'CM-008', quantity: 40, unit: 'kg', proportion_percent: 12, notes: 'Matériau vert' },
  { id: 'RI-005', recipe_id: 'CR-001', material_id: 'CM-012', quantity: 5, unit: 'kg', proportion_percent: 1.5, notes: 'Minéraux' },
  { id: 'RI-006', recipe_id: 'CR-002', material_id: 'CM-003', quantity: 60, unit: 'kg', proportion_percent: 30, notes: 'Fumier de mouton - riche en azote' },
  { id: 'RI-007', recipe_id: 'CR-002', material_id: 'CM-007', quantity: 40, unit: 'kg', proportion_percent: 20, notes: 'Feuilles sèches - carbone' },
  { id: 'RI-008', recipe_id: 'CR-002', material_id: 'CM-009', quantity: 50, unit: 'kg', proportion_percent: 25, notes: 'Mauvaises herbes - azote' },
  { id: 'RI-009', recipe_id: 'CR-002', material_id: 'CM-010', quantity: 30, unit: 'kg', proportion_percent: 15, notes: 'Épluchures - activation' },
  { id: 'RI-010', recipe_id: 'CR-002', material_id: 'CM-012', quantity: 3, unit: 'kg', proportion_percent: 1.5, notes: 'Cendres - minéraux' },
  { id: 'RI-011', recipe_id: 'CR-003', material_id: 'CM-001', quantity: 80, unit: 'kg', proportion_percent: 40, notes: 'Fumier de vache' },
  { id: 'RI-012', recipe_id: 'CR-003', material_id: 'CM-002', quantity: 50, unit: 'kg', proportion_percent: 25, notes: 'Fumier de cheval' },
  { id: 'RI-013', recipe_id: 'CR-003', material_id: 'CM-013', quantity: 20, unit: 'kg', proportion_percent: 10, notes: 'Tourteau d\'arachide - azote' },
  { id: 'RI-014', recipe_id: 'CR-003', material_id: 'CM-012', quantity: 10, unit: 'kg', proportion_percent: 5, notes: 'Cendres - potassium' },
  { id: 'RI-015', recipe_id: 'CR-003', material_id: 'CM-005', quantity: 40, unit: 'kg', proportion_percent: 20, notes: 'Tiges de maïs - carbone' },
  { id: 'RI-016', recipe_id: 'CR-004', material_id: 'CM-003', quantity: 100, unit: 'kg', proportion_percent: 50, notes: 'Fumier de mouton - base' },
  { id: 'RI-017', recipe_id: 'CR-004', material_id: 'CM-006', quantity: 60, unit: 'kg', proportion_percent: 30, notes: 'Paille de riz - carbone' },
  { id: 'RI-018', recipe_id: 'CR-004', material_id: 'CM-014', quantity: 40, unit: 'kg', proportion_percent: 20, notes: 'Son de mil - fibres' },
  { id: 'RI-019', recipe_id: 'CR-005', material_id: 'CM-004', quantity: 30, unit: 'kg', proportion_percent: 15, notes: 'Fientes de poulet - azote concentré' },
  { id: 'RI-020', recipe_id: 'CR-005', material_id: 'CM-009', quantity: 60, unit: 'kg', proportion_percent: 30, notes: 'Mauvaises herbes - matière verte' },
  { id: 'RI-021', recipe_id: 'CR-005', material_id: 'CM-007', quantity: 50, unit: 'kg', proportion_percent: 25, notes: 'Feuilles sèches - carbone' },
  { id: 'RI-022', recipe_id: 'CR-005', material_id: 'CM-010', quantity: 40, unit: 'kg', proportion_percent: 20, notes: 'Épluchures - activation microbienne' },
  { id: 'RI-023', recipe_id: 'CR-005', material_id: 'CM-015', quantity: 20, unit: 'kg', proportion_percent: 10, notes: 'Bouse séchée - équilibre' }
];

const DEFAULT_COMPOST_HISTORY = [
  {
    id: 'CH-001',
    recipe_id: 'CR-001',
    start_date: '2026-05-01',
    end_date: '2026-07-30',
    quantity_produced_kg: 500,
    materials_used: { 'CM-005': 100, 'CM-006': 50, 'CM-001': 50, 'CM-008': 40, 'CM-012': 5 },
    c_n_ratio_achieved: 28.5,
    status: 'Terminé',
    notes: 'Premier tas de compost de la saison. Bonne décomposition. Utilisé sur la parcelle des tomates.'
  },
  {
    id: 'CH-002',
    recipe_id: 'CR-002',
    start_date: '2026-06-15',
    end_date: '2026-08-15',
    quantity_produced_kg: 300,
    materials_used: { 'CM-003': 60, 'CM-007': 40, 'CM-009': 50, 'CM-010': 30, 'CM-012': 3 },
    c_n_ratio_achieved: 24.8,
    status: 'Terminé',
    notes: 'Compost rapide pour la pépinière de poivrons. Très bonne qualité.'
  },
  {
    id: 'CH-003',
    recipe_id: 'CR-004',
    start_date: '2026-07-01',
    end_date: null,
    quantity_produced_kg: 0,
    materials_used: { 'CM-003': 100, 'CM-006': 60, 'CM-014': 40 },
    c_n_ratio_achieved: 32,
    status: 'En cours',
    notes: 'Tas en cours de maturation. Retourne tous les 15 jours.'
  }
];

export const CompostStorage = {
  getCompostMaterials() {
    return KAStorage.get('ka_farm_compost_materials', DEFAULT_COMPOST_MATERIALS);
  },
  saveCompostMaterials(materials) {
    KAStorage.set('ka_farm_compost_materials', materials);
  },
  addCompostMaterial(material) {
    const materials = this.getCompostMaterials();
    materials.push(material);
    this.saveCompostMaterials(materials);
    return material;
  },
  updateCompostMaterial(id, updates) {
    const materials = this.getCompostMaterials();
    const index = materials.findIndex(m => m.id === id);
    if (index !== -1) {
      materials[index] = { ...materials[index], ...updates };
      this.saveCompostMaterials(materials);
      return materials[index];
    }
    return null;
  },
  deleteCompostMaterial(id) {
    const materials = this.getCompostMaterials();
    const filtered = materials.filter(m => m.id !== id);
    this.saveCompostMaterials(filtered);
    return filtered;
  },
  getCompostMaterialById(id) {
    const materials = this.getCompostMaterials();
    return materials.find(m => m.id === id);
  },

  getCompostRecipes() {
    return KAStorage.get('ka_farm_compost_recipes', DEFAULT_COMPOST_RECIPES);
  },
  saveCompostRecipes(recipes) {
    KAStorage.set('ka_farm_compost_recipes', recipes);
  },
  addCompostRecipe(recipe) {
    const recipes = this.getCompostRecipes();
    recipes.push(recipe);
    this.saveCompostRecipes(recipes);
    return recipe;
  },
  updateCompostRecipe(id, updates) {
    const recipes = this.getCompostRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1) {
      recipes[index] = { ...recipes[index], ...updates };
      this.saveCompostRecipes(recipes);
      return recipes[index];
    }
    return null;
  },
  deleteCompostRecipe(id) {
    const recipes = this.getCompostRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    this.saveCompostRecipes(filtered);
    return filtered;
  },
  getCompostRecipeById(id) {
    const recipes = this.getCompostRecipes();
    return recipes.find(r => r.id === id);
  },

  getRecipeIngredients() {
    return KAStorage.get('ka_farm_recipe_ingredients', DEFAULT_RECIPE_INGREDIENTS);
  },
  saveRecipeIngredients(ingredients) {
    KAStorage.set('ka_farm_recipe_ingredients', ingredients);
  },
  addRecipeIngredient(ingredient) {
    const ingredients = this.getRecipeIngredients();
    ingredients.push(ingredient);
    this.saveRecipeIngredients(ingredients);
    return ingredient;
  },
  deleteRecipeIngredient(id) {
    const ingredients = this.getRecipeIngredients();
    const filtered = ingredients.filter(i => i.id !== id);
    this.saveRecipeIngredients(filtered);
    return filtered;
  },
  getIngredientsByRecipe(recipeId) {
    const ingredients = this.getRecipeIngredients();
    return ingredients.filter(i => i.recipe_id === recipeId);
  },
  getIngredientsByMaterial(materialId) {
    const ingredients = this.getRecipeIngredients();
    return ingredients.filter(i => i.material_id === materialId);
  },

  getCompostHistory() {
    return KAStorage.get('ka_farm_compost_history', DEFAULT_COMPOST_HISTORY);
  },
  saveCompostHistory(history) {
    KAStorage.set('ka_farm_compost_history', history);
  },
  addCompostHistory(record) {
    const history = this.getCompostHistory();
    history.push(record);
    this.saveCompostHistory(history);
    return record;
  },
  updateCompostHistory(id, updates) {
    const history = this.getCompostHistory();
    const index = history.findIndex(h => h.id === id);
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      this.saveCompostHistory(history);
      return history[index];
    }
    return null;
  },
  deleteCompostHistory(id) {
    const history = this.getCompostHistory();
    const filtered = history.filter(h => h.id !== id);
    this.saveCompostHistory(filtered);
    return filtered;
  },
  getCompostHistoryByRecipe(recipeId) {
    const history = this.getCompostHistory();
    return history.filter(h => h.recipe_id === recipeId);
  },
  getCurrentComposting() {
    const history = this.getCompostHistory();
    return history.filter(h => h.status === 'En cours' && !h.end_date);
  },
  getCompletedComposting() {
    const history = this.getCompostHistory();
    return history.filter(h => h.status === 'Terminé' && h.end_date);
  },

  calculateCNRatio(materialsUsed) {
    const materials = this.getCompostMaterials();
    let totalCarbon = 0;
    let totalNitrogen = 0;
    
    for (const [materialId, quantity] of Object.entries(materialsUsed)) {
      const material = materials.find(m => m.id === materialId);
      if (material) {
        totalCarbon += material.carbon_ratio * quantity;
        totalNitrogen += material.nitrogen_ratio * quantity;
      }
    }
    
    return totalNitrogen > 0 ? totalCarbon / totalNitrogen : 0;
  },

  getCNRatioRecommendations(currentRatio, targetRatio = 30) {
    const recommendations = [];
    
    if (currentRatio < targetRatio * 0.8) {
      recommendations.push({
        type: 'add_carbon',
        message: 'Ajouter des matériaux riches en carbone (paille, feuilles sèches, coquilles)',
        priority: 'haute'
      });
    } else if (currentRatio > targetRatio * 1.2) {
      recommendations.push({
        type: 'add_nitrogen',
        message: 'Ajouter des matériaux riches en azote (fumier, fientes, tonte de gazon)',
        priority: 'haute'
      });
    }
    
    if (currentRatio < 20) {
      recommendations.push({
        type: 'warning',
        message: 'Ratio trop bas - Risque de pourriture et d\'odeurs',
        priority: 'critique'
      });
    } else if (currentRatio > 50) {
      recommendations.push({
        type: 'warning',
        message: 'Ratio trop élevé - Décomposition très lente',
        priority: 'critique'
      });
    }
    
    return recommendations;
  },

  calculateIdealMix(targetRatio = 30) {
    const materials = this.getCompostMaterials();
    const greens = materials.filter(m => m.material_type === 'Fumier' || m.material_type === 'Résidus verts' || m.material_type === 'Déchets de cuisine');
    const browns = materials.filter(m => m.material_type === 'Résidus végétaux' || m.material_type === 'Sous-produit agricole');
    
    const avgGreenRatio = greens.length > 0 ? greens.reduce((sum, m) => sum + m.c_n_ratio, 0) / greens.length : 15;
    const avgBrownRatio = browns.length > 0 ? browns.reduce((sum, m) => sum + m.c_n_ratio, 0) / browns.length : 40;
    
    const greenN = 2;
    const brownC = 40;
    
    const greenProp = (targetRatio * greenN) / (targetRatio * greenN + brownC);
    const brownProp = 1 - greenProp;
    
    return {
      greenProportion: Math.round(greenProp * 100),
      brownProportion: Math.round(brownProp * 100),
      greenRatio: avgGreenRatio,
      brownRatio: avgBrownRatio,
      explanation: `Pour obtenir un ratio C:N de ${targetRatio}:1, mélanger environ ${Math.round(greenProp * 100)}% de matériaux verts (ratio ~${Math.round(avgGreenRatio)}:1) avec ${Math.round(brownProp * 100)}% de matériaux bruns (ratio ~${Math.round(avgBrownRatio)}:1)`
    };
  },

  getCompostStats() {
    const history = this.getCompostHistory();
    const totalQuantity = history.reduce((sum, h) => sum + (h.quantity_produced_kg || 0), 0);
    const completed = history.filter(h => h.status === 'Terminé');
    const inProgress = history.filter(h => h.status === 'En cours');
    const avgCNRatio = completed.length > 0 ? completed.reduce((sum, h) => sum + (h.c_n_ratio_achieved || 0), 0) / completed.length : 0;
    
    return {
      totalBatches: history.length,
      totalQuantity: Math.round(totalQuantity),
      completedBatches: completed.length,
      inProgressBatches: inProgress.length,
      avgCNRatio: Math.round(avgCNRatio * 10) / 10,
      avgMaturationDays: completed.length > 0 ? Math.round(completed.reduce((sum, h) => {
        if (h.start_date && h.end_date) {
          return sum + daysBetween(h.start_date, h.end_date);
        }
        return sum;
      }, 0) / completed.length) : 0
    };
  }
};