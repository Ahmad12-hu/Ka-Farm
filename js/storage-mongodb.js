// KA Farm - Storage Engine (MongoDB version)
// Manages MongoDB operations with localStorage fallback

import { connectDB } from '../database/mongodb-config.js';
import { User, Ferme, Parcelle, Culture, Transaction, Tache } from '../database/models/index.js';
import bcrypt from 'bcrypt';

const DEFAULT_CROPS = [
  { id: 'C-101', name: 'Tomate Mongal F1', field: 'Parcelle Nord - Planche 2', sowingDate: '2026-05-10', harvestDate: '2026-08-15', status: 'Floraison', waterStatus: 'Optimale', fertilizerStatus: 'OK', photos: [] },
  { id: 'C-102', name: 'Oignon Rouge de Galmi', field: 'Parcelle Est - Grand Champ', sowingDate: '2026-04-15', harvestDate: '2026-09-01', status: 'Croissance', waterStatus: 'Besoin d\'eau', fertilizerStatus: 'OK', photos: [] },
  { id: 'C-103', name: 'Menthe de Thiès', field: 'Zone Ombragée - Bac A', sowingDate: '2026-06-01', harvestDate: '2026-07-15', status: 'Récoltable', waterStatus: 'Optimale', fertilizerStatus: 'OK', photos: [] },
  { id: 'C-104', name: 'Chou Cabus', field: 'Parcelle Sud - Planche 1', sowingDate: '2026-05-20', harvestDate: '2026-08-25', status: 'Croissance', waterStatus: 'Optimale', fertilizerStatus: 'Besoin d\'azote', photos: [] }
];

const DEFAULT_FINANCES = [
  { id: 'F-501', description: 'Vente de 8 caisses de Tomates Mongal', category: 'Vente Légumes', type: 'Revenu', amount: 120000, date: '2026-06-20' },
  { id: 'F-502', description: 'Achat de semences oignon Galmi', category: 'Semences', type: 'Dépense', amount: 35000, date: '2026-06-18' },
  { id: 'F-503', description: 'Achat compost de Thiès', category: 'Compost', type: 'Dépense', amount: 50000, date: '2026-06-15' },
  { id: 'F-504', description: 'Vente de 4 sacs de menthe fraîche', category: 'Aromates', type: 'Revenu', amount: 60000, date: '2026-06-22' }
];

const DEFAULT_TASKS = [
  { id: 'T-401', title: 'Irrigation matin de l\'oignon Galmi', category: 'Irrigation', dueDate: '2026-06-26', assignee: 'Moussa', priority: 'Haute', completed: false },
  { id: 'T-402', title: 'Sarclage & Désherbage planche choux', category: 'Entretien', dueDate: '2026-06-28', assignee: 'Fatou', priority: 'Moyenne', completed: false },
  { id: 'T-403', title: 'Vérifier la levée de la pépinière tomates', category: 'Pépinière', dueDate: '2026-06-25', assignee: 'Moussa', priority: 'Haute', completed: true }
];

const DEFAULT_USERS = [
  { email: 'moussa@kafarm.sn', name: 'Moussa KA', role: 'terrain', password: 'moussa-village' },
  { email: 'aly@kafarm.sn', name: 'Aly KA', role: 'gestionnaire', password: 'aly-dakar' },
  { email: 'amadoucoumbaka@gmail.com', name: 'Amadou KA', role: 'gestionnaire', password: 'password' }
];

export const CROP_LIBRARY_DATA = [
  {
    name: "Tomate Mongal F1",
    variety: "Variété Résistante d'Hivernage",
    type: "Fruit",
    cycle: "75 - 90 jours (après repiquage)",
    water: "600 - 800 mm (Goutte-à-goutte conseillé)",
    yield: "35 - 50 tonnes / hectare",
    tips: "Variété d'hivernage hautement tolérante à la flétrissure bactérienne et au flétrissement fusarien. Très cultivée au Sénégal.",
    emoji: "🍅"
  },
  {
    name: "Piment Oiseau de Cayenne",
    variety: "Variété de piment fort",
    type: "Fruit",
    cycle: "120 - 150 jours",
    water: "400 - 600 mm (Besoins réguliers)",
    yield: "10 - 15 tonnes / hectare",
    tips: "Semis en pépinière chaude. Exigeant en engrais de fond et de couverture. Sensible à la mouche des fruits.",
    emoji: "🌶️"
  },
  {
    name: "Chou Cabus KK-Cross",
    variety: "Hybride résistant à la chaleur",
    type: "Feuille",
    cycle: "80 - 100 jours",
    water: "500 mm (Irrigation très fréquente)",
    yield: "40 - 60 tonnes / hectare",
    tips: "Idéal pour la contre-saison fraîche au Sénégal (octobre à mars). Arroser régulièrement pour garder le sol frais.",
    emoji: "🥬"
  },
  {
    name: "Oignon Rouge de Gandiol",
    variety: "Écotype côtier de conservation",
    type: "Bulbe",
    cycle: "140 - 170 jours",
    water: "350 - 450 mm (Réduire avant récolte)",
    yield: "25 - 40 tonnes / hectare",
    tips: "Typique du terroir sablonneux du Gandiolais et des Niayes. Excellente aptitude au stockage longue durée.",
    emoji: "🧅"
  }
];

let isInitialized = false;

export const KAStorageMongoDB = {
  async init() {
    if (isInitialized) return;
    isInitialized = true;
    
    try {
      await connectDB();
      console.log('✅ KAStorageMongoDB initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation KAStorageMongoDB:', error);
      // Fallback to localStorage if MongoDB fails
      console.log('⚠️ Utilisation de localStorage en fallback');
    }
  },

  // Users
  async getUsers() {
    try {
      await connectDB();
      const users = await User.find({ actif: true });
      return users.map(u => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
        password: u.password // Hashé
      }));
    } catch (error) {
      console.error('Erreur getUsers MongoDB:', error);
      return DEFAULT_USERS;
    }
  },

  async saveUsers(users) {
    try {
      await connectDB();
      for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.findOneAndUpdate(
          { email: user.email },
          { 
            email: user.email, 
            password: hashedPassword, 
            name: user.name, 
            role: user.role.toLowerCase(),
            actif: true 
          },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error('Erreur saveUsers MongoDB:', error);
    }
  },

  // Crops (Cultures)
  async getCrops() {
    try {
      await connectDB();
      const cultures = await Culture.find().populate('parcelleId');
      return cultures.map(c => ({
        id: c._id.toString(),
        name: c.nom_culture,
        field: c.parcelleId ? c.parcelleId.nom_parcelle : 'Non assigné',
        sowingDate: c.date_semis ? c.date_semis.toISOString().split('T')[0] : '',
        harvestDate: c.date_recolte_estimee ? c.date_recolte_estimee.toISOString().split('T')[0] : '',
        status: c.statut,
        waterStatus: c.water_status,
        fertilizerStatus: c.fertilizer_status,
        photos: c.photos || []
      }));
    } catch (error) {
      console.error('Erreur getCrops MongoDB:', error);
      return DEFAULT_CROPS;
    }
  },

  async saveCrops(crops) {
    try {
      await connectDB();
      for (const crop of crops) {
        await Culture.findOneAndUpdate(
          { _id: crop.id },
          {
            nom_culture: crop.name,
            statut: crop.status,
            water_status: crop.waterStatus,
            fertilizer_status: crop.fertilizerStatus,
            photos: crop.photos || []
          },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error('Erreur saveCrops MongoDB:', error);
    }
  },

  // Finances
  async getFinances() {
    try {
      await connectDB();
      const transactions = await Transaction.find();
      return transactions.map(t => ({
        id: t._id.toString(),
        description: t.description,
        type: t.type_transaction === 'revenu' ? 'Revenu' : 'Dépense',
        category: t.categorie,
        amount: t.montant_fcfa,
        date: t.date_transaction.toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('Erreur getFinances MongoDB:', error);
      return DEFAULT_FINANCES;
    }
  },

  async saveFinances(finances) {
    try {
      await connectDB();
      for (const finance of finances) {
        await Transaction.findOneAndUpdate(
          { _id: finance.id },
          {
            type_transaction: finance.type === 'Revenu' ? 'revenu' : 'depense',
            categorie: finance.category,
            description: finance.description,
            montant_fcfa: finance.amount,
            date_transaction: new Date(finance.date)
          },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error('Erreur saveFinances MongoDB:', error);
    }
  },

  // Tasks
  async getTasks() {
    try {
      await connectDB();
      const taches = await Tache.find();
      return taches.map(t => ({
        id: t._id.toString(),
        title: t.titre,
        category: t.categorie,
        dueDate: t.date_echeance.toISOString().split('T')[0],
        assignee: t.assigne_a ? 'Assigné' : 'Non assigné',
        priority: t.priorite,
        completed: t.statut === 'terminee'
      }));
    } catch (error) {
      console.error('Erreur getTasks MongoDB:', error);
      return DEFAULT_TASKS;
    }
  },

  async saveTasks(tasks) {
    try {
      await connectDB();
      for (const task of tasks) {
        await Tache.findOneAndUpdate(
          { _id: task.id },
          {
            titre: task.title,
            categorie: task.category,
            date_echeance: new Date(task.dueDate),
            priorite: task.priority,
            statut: task.completed ? 'terminee' : 'a_faire'
          },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error('Erreur saveTasks MongoDB:', error);
    }
  },

  // Current User Session (localStorage only - session management)
  getCurrentUser() {
    const email = localStorage.getItem('ka_user_email');
    const name = localStorage.getItem('ka_user_name');
    const role = localStorage.getItem('ka_user_role');
    
    if (email) {
      return { 
        email, 
        name: name || 'Amadou KA', 
        role: role || 'gestionnaire'
      };
    }
    return null;
  },

  setCurrentUser(user, remember = true) {
    if (user) {
      localStorage.setItem('ka_user_email', user.email);
      localStorage.setItem('ka_user_name', user.name);
      localStorage.setItem('ka_user_role', user.role);
      localStorage.setItem('ka_user_remember', JSON.stringify(remember));
    } else {
      localStorage.removeItem('ka_user_email');
      localStorage.removeItem('ka_user_name');
      localStorage.removeItem('ka_user_role');
      localStorage.removeItem('ka_user_remember');
    }
  },

  // Finance Stats
  async getFinanceStats() {
    const finances = await this.getFinances();
    const totalRevenu = finances.filter(f => f.type === 'Revenu').reduce((sum, f) => sum + f.amount, 0);
    const totalDepense = finances.filter(f => f.type === 'Dépense').reduce((sum, f) => sum + f.amount, 0);
    const solde = totalRevenu - totalDepense;
    return { totalRevenu, totalDepense, solde };
  },

  // Crop Library (static data)
  getCropLibrary() {
    return CROP_LIBRARY_DATA;
  },

  // Password hashing (for compatibility)
  hashPassword(password) {
    // This is handled by bcrypt in MongoDB version
    return password;
  }
};
