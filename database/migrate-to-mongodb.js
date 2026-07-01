// KA-FARM - Script de migration depuis localStorage vers MongoDB
import { connectDB, disconnectDB } from './mongodb-config.js';
import { User, Ferme, Parcelle, Culture, Transaction, Tache } from './models/index.js';
import bcrypt from 'bcrypt';

// Fonction pour migrer les utilisateurs
async function migrateUsers() {
  console.log('🔄 Migration des utilisateurs...');
  
  try {
    const usersJSON = localStorage.getItem('kafarm_users');
    if (!usersJSON) {
      console.log('⚠️ Aucun utilisateur trouvé dans localStorage');
      return;
    }
    
    const users = JSON.parse(usersJSON);
    let migrated = 0;
    
    for (const user of users) {
      // Vérifier si l'utilisateur existe déjà
      const existing = await User.findOne({ email: user.email });
      if (existing) {
        console.log(`⏭️ Utilisateur ${user.email} existe déjà`);
        continue;
      }
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await User.create({
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role || 'invite',
        fermeId: user.fermeId || null,
        telephone: user.telephone || null,
        actif: true
      });
      
      migrated++;
      console.log(`✅ Utilisateur ${user.email} migré`);
    }
    
    console.log(`✅ ${migrated} utilisateurs migrés`);
  } catch (error) {
    console.error('❌ Erreur migration utilisateurs:', error);
  }
}

// Fonction pour migrer les fermes
async function migrateFermes() {
  console.log('🔄 Migration des fermes...');
  
  try {
    const fermesJSON = localStorage.getItem('kafarm_fermes');
    if (!fermesJSON) {
      console.log('⚠️ Aucune ferme trouvée dans localStorage');
      return;
    }
    
    const fermes = JSON.parse(fermesJSON);
    let migrated = 0;
    
    for (const ferme of fermes) {
      const existing = await Ferme.findOne({ nom: ferme.nom });
      if (existing) {
        console.log(`⏭️ Ferme ${ferme.nom} existe déjà`);
        continue;
      }
      
      await Ferme.create({
        nom: ferme.nom,
        localisation: ferme.localisation || 'Non spécifié',
        superficie_ha: ferme.superficie || 0,
        proprietaire: ferme.proprietaire || 'Non spécifié',
        telephone: ferme.telephone || '',
        description: ferme.description || '',
        actif: true
      });
      
      migrated++;
      console.log(`✅ Ferme ${ferme.nom} migrée`);
    }
    
    console.log(`✅ ${migrated} fermes migrées`);
  } catch (error) {
    console.error('❌ Erreur migration fermes:', error);
  }
}

// Fonction pour migrer les cultures
async function migrateCultures() {
  console.log('🔄 Migration des cultures...');
  
  try {
    const cropsJSON = localStorage.getItem('kafarm_crops');
    if (!cropsJSON) {
      console.log('⚠️ Aucune culture trouvée dans localStorage');
      return;
    }
    
    const crops = JSON.parse(cropsJSON);
    let migrated = 0;
    
    // Créer une ferme par défaut si nécessaire
    let defaultFerme = await Ferme.findOne({ nom: 'Ferme par défaut' });
    if (!defaultFerme) {
      defaultFerme = await Ferme.create({
        nom: 'Ferme par défaut',
        localisation: 'Non spécifié',
        superficie_ha: 1,
        proprietaire: 'Non spécifié',
        telephone: ''
      });
    }
    
    // Créer une parcelle par défaut si nécessaire
    let defaultParcelle = await Parcelle.findOne({ nom_parcelle: 'Parcelle par défaut' });
    if (!defaultParcelle) {
      defaultParcelle = await Parcelle.create({
        fermeId: defaultFerme._id,
        nom_parcelle: 'Parcelle par défaut',
        surface_m2: 1000,
        type_sol: 'autre',
        statut: 'en_production'
      });
    }
    
    for (const crop of crops) {
      await Culture.create({
        parcelleId: defaultParcelle._id,
        nom_culture: crop.name || 'Culture sans nom',
        variete: crop.variety || '',
        statut: crop.status || 'pepiniere',
        water_status: crop.waterStatus || 'besoin_eau',
        fertilizer_status: crop.fertilizerStatus || 'besoin_fertilisant',
        notes: crop.notes || ''
      });
      
      migrated++;
      console.log(`✅ Culture ${crop.name} migrée`);
    }
    
    console.log(`✅ ${migrated} cultures migrées`);
  } catch (error) {
    console.error('❌ Erreur migration cultures:', error);
  }
}

// Fonction pour migrer les transactions financières
async function migrateTransactions() {
  console.log('🔄 Migration des transactions...');
  
  try {
    const financesJSON = localStorage.getItem('kafarm_finances');
    if (!financesJSON) {
      console.log('⚠️ Aucune transaction trouvée dans localStorage');
      return;
    }
    
    const finances = JSON.parse(financesJSON);
    let migrated = 0;
    
    // Créer une ferme par défaut si nécessaire
    let defaultFerme = await Ferme.findOne({ nom: 'Ferme par défaut' });
    if (!defaultFerme) {
      defaultFerme = await Ferme.create({
        nom: 'Ferme par défaut',
        localisation: 'Non spécifié',
        superficie_ha: 1,
        proprietaire: 'Non spécifié',
        telephone: ''
      });
    }
    
    for (const finance of finances) {
      await Transaction.create({
        fermeId: defaultFerme._id,
        type_transaction: finance.type === 'Revenu' ? 'revenu' : 'depense',
        categorie: finance.category || 'Autre',
        description: finance.description || '',
        montant_fcfa: finance.amount || 0,
        date_transaction: finance.date ? new Date(finance.date) : new Date(),
        mode_paiement: 'especes'
      });
      
      migrated++;
      console.log(`✅ Transaction migrée`);
    }
    
    console.log(`✅ ${migrated} transactions migrées`);
  } catch (error) {
    console.error('❌ Erreur migration transactions:', error);
  }
}

// Fonction pour migrer les tâches
async function migrateTasks() {
  console.log('🔄 Migration des tâches...');
  
  try {
    const tasksJSON = localStorage.getItem('kafarm_tasks');
    if (!tasksJSON) {
      console.log('⚠️ Aucune tâche trouvée dans localStorage');
      return;
    }
    
    const tasks = JSON.parse(tasksJSON);
    let migrated = 0;
    
    // Créer une ferme par défaut si nécessaire
    let defaultFerme = await Ferme.findOne({ nom: 'Ferme par défaut' });
    if (!defaultFerme) {
      defaultFerme = await Ferme.create({
        nom: 'Ferme par défaut',
        localisation: 'Non spécifié',
        superficie_ha: 1,
        proprietaire: 'Non spécifié',
        telephone: ''
      });
    }
    
    for (const task of tasks) {
      await Tache.create({
        fermeId: defaultFerme._id,
        titre: task.title || 'Tâche sans titre',
        description: task.description || '',
        priorite: task.priority || 'moyenne',
        statut: task.status || 'a_faire',
        date_echeance: task.dueDate ? new Date(task.dueDate) : new Date(),
        categorie: task.category || 'autre'
      });
      
      migrated++;
      console.log(`✅ Tâche ${task.title} migrée`);
    }
    
    console.log(`✅ ${migrated} tâches migrées`);
  } catch (error) {
    console.error('❌ Erreur migration tâches:', error);
  }
}

// Fonction principale de migration
async function migrateToMongoDB() {
  console.log('🚀 Début de la migration vers MongoDB...');
  
  try {
    // Connexion à MongoDB
    await connectDB();
    
    // Exécuter les migrations
    await migrateUsers();
    await migrateFermes();
    await migrateCultures();
    await migrateTransactions();
    await migrateTasks();
    
    console.log('✅ Migration terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    // Déconnexion
    await disconnectDB();
  }
}

// Exécuter la migration
migrateToMongoDB();
