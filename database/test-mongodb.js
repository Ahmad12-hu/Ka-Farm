// KA-FARM - Script de test MongoDB
// Teste la connexion et les opérations de base

import { testConnection, connectDB, disconnectDB } from './mongodb-config.js';
import { User, Ferme, Parcelle, Culture, Transaction, Tache } from './models/index.js';

async function testMongoDB() {
  console.log('🚀 Début du test MongoDB...\n');
  
  try {
    // 1. Tester la connexion
    console.log('1️⃣ Test de connexion...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Échec de la connexion');
      return;
    }
    
    // 2. Tester la création d'un utilisateur
    console.log('\n2️⃣ Test création utilisateur...');
    const testUser = await User.create({
      email: 'test@kafarm.sn',
      password: 'password123', // Sera hashé par le pre-save hook
      name: 'Utilisateur Test',
      role: 'invite',
      actif: true
    });
    console.log('✅ Utilisateur créé:', testUser.email);
    
    // 3. Tester la création d'une ferme
    console.log('\n3️⃣ Test création ferme...');
    const testFerme = await Ferme.create({
      nom: 'Ferme Test',
      localisation: 'Dakar',
      superficie_ha: 5,
      proprietaire: 'Test Owner',
      telephone: '771234567',
      actif: true
    });
    console.log('✅ Ferme créée:', testFerme.nom);
    
    // 4. Tester la création d'une parcelle
    console.log('\n4️⃣ Test création parcelle...');
    const testParcelle = await Parcelle.create({
      fermeId: testFerme._id,
      nom_parcelle: 'Parcelle Test',
      surface_m2: 1000,
      type_sol: 'argileux',
      statut: 'en_production'
    });
    console.log('✅ Parcelle créée:', testParcelle.nom_parcelle);
    
    // 5. Tester la création d'une culture
    console.log('\n5️⃣ Test création culture...');
    const testCulture = await Culture.create({
      parcelleId: testParcelle._id,
      nom_culture: 'Tomate Test',
      variete: 'Mongal F1',
      statut: 'pepiniere',
      water_status: 'besoin_eau',
      fertilizer_status: 'besoin_fertilisant'
    });
    console.log('✅ Culture créée:', testCulture.nom_culture);
    
    // 6. Tester la création d'une transaction
    console.log('\n6️⃣ Test création transaction...');
    const testTransaction = await Transaction.create({
      fermeId: testFerme._id,
      type_transaction: 'revenu',
      categorie: 'Vente',
      description: 'Vente de test',
      montant_fcfa: 50000,
      date_transaction: new Date(),
      mode_paiement: 'especes'
    });
    console.log('✅ Transaction créée:', testTransaction.description);
    
    // 7. Tester la création d'une tâche
    console.log('\n7️⃣ Test création tâche...');
    const testTache = await Tache.create({
      fermeId: testFerme._id,
      titre: 'Tâche de test',
      description: 'Description de test',
      priorite: 'moyenne',
      statut: 'a_faire',
      date_echeance: new Date(),
      categorie: 'culture'
    });
    console.log('✅ Tâche créée:', testTache.titre);
    
    // 8. Tester les requêtes
    console.log('\n8️⃣ Test requêtes...');
    const users = await User.find({ role: 'invite' });
    console.log(`✅ ${users.length} utilisateurs avec rôle 'invite'`);
    
    const cultures = await Culture.find({ statut: 'pepiniere' }).populate('parcelleId');
    console.log(`✅ ${cultures.length} cultures en pépinière`);
    
    const transactions = await Transaction.find({ type_transaction: 'revenu' });
    console.log(`✅ ${transactions.length} transactions de revenu`);
    
    // 9. Nettoyage
    console.log('\n9️⃣ Nettoyage des données de test...');
    await Tache.deleteOne({ _id: testTache._id });
    await Transaction.deleteOne({ _id: testTransaction._id });
    await Culture.deleteOne({ _id: testCulture._id });
    await Parcelle.deleteOne({ _id: testParcelle._id });
    await Ferme.deleteOne({ _id: testFerme._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Données de test supprimées');
    
    console.log('\n✅ Tous les tests MongoDB réussis !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error);
  } finally {
    await disconnectDB();
  }
}

// Exécuter le test
testMongoDB();
