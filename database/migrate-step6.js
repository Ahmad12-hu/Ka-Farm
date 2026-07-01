// KA-FARM - Script de Migration Étape 6
// Vues et données initiales

import dotenv from 'dotenv';
import { query, testConnection } from './config.js';

dotenv.config();

async function runMigrationStep6() {
  console.log('🚀 Migration Étape 6: Vues et données initiales...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Impossible de se connecter à la base de données.');
    process.exit(1);
  }

  const sql = `
-- Vue synthèse des finances par ferme
CREATE OR REPLACE VIEW vue_synthese_finances AS
SELECT 
    f.id AS ferme_id,
    f.nom AS ferme_nom,
    COUNT(DISTINCT t.id) AS nombre_transactions,
    SUM(CASE WHEN t.type_transaction = 'revenu' THEN t.montant_fcfa ELSE 0 END) AS total_revenus,
    SUM(CASE WHEN t.type_transaction = 'depense' THEN t.montant_fcfa ELSE 0 END) AS total_depenses,
    SUM(CASE WHEN t.type_transaction = 'revenu' THEN t.montant_fcfa ELSE 0 END) - 
    SUM(CASE WHEN t.type_transaction = 'depense' THEN t.montant_fcfa ELSE 0 END) AS solde,
    MAX(t.date_transaction) AS derniere_transaction
FROM fermes f
LEFT JOIN transactions_financieres t ON f.id = t.ferme_id
GROUP BY f.id, f.nom;

-- Vue synthèse des cultures par ferme
CREATE OR REPLACE VIEW vue_synthese_cultures AS
SELECT 
    f.id AS ferme_id,
    f.nom AS ferme_nom,
    COUNT(DISTINCT c.id) AS nombre_cultures,
    COUNT(DISTINCT CASE WHEN c.statut = 'en_production' THEN c.id END) AS cultures_en_production,
    COUNT(DISTINCT CASE WHEN c.statut = 'pepiniere' THEN c.id END) AS cultures_pepiniere,
    COUNT(DISTINCT CASE WHEN c.statut = 'recolte' THEN c.id END) AS cultures_a_recolter,
    SUM(r.poids_kg) AS total_recolte_kg
FROM fermes f
LEFT JOIN parcelles p ON f.id = p.ferme_id
LEFT JOIN cultures c ON p.id = c.parcelle_id
LEFT JOIN recoltes r ON c.id = r.culture_id
GROUP BY f.id, f.nom;

-- Vue synthèse du stock par ferme
CREATE OR REPLACE VIEW vue_alertes_stock AS
SELECT 
    s.id AS stock_id,
    s.ferme_id,
    f.nom AS ferme_nom,
    s.intrant_nom,
    s.categorie,
    s.quantite_disponible,
    s.quantite_miniale,
    s.unite_mesure,
    CASE 
        WHEN s.quantite_disponible <= s.quantite_miniale THEN 'critique'
        WHEN s.quantite_disponible <= s.quantite_miniale * 1.5 THEN 'attention'
        ELSE 'ok'
    END AS niveau_alerte
FROM stocks_intrants s
JOIN fermes f ON s.ferme_id = f.id
WHERE s.quantite_disponible <= s.quantite_miniale * 1.5;

-- Insérer une ferme par défaut
INSERT INTO fermes (nom, code_ferme, localisation, region, surface_totale_m2, coordonnees_lat, coordonnees_lng)
VALUES 
('KA Farm Exploitation Principale', 'KF-001', 'Zone Maraîchère des Niayes', 'Dakar', 1620, 14.7932, -17.2654)
ON CONFLICT (code_ferme) DO NOTHING;
`;

  try {
    await query(sql);
    console.log('✅ Étape 6 terminée avec succès !\n');
    console.log('🎉 Migration complète terminée !');
    console.log('\n📊 Tables créées:');
    console.log('  - fermes');
    console.log('  - utilisateurs');
    console.log('  - parcelles');
    console.log('  - cultures');
    console.log('  - pepinieres');
    console.log('  - recoltes');
    console.log('  - traitements_phytosanitaires');
    console.log('  - stocks_intrants');
    console.log('  - mouvements_stock');
    console.log('  - employes');
    console.log('  - presences');
    console.log('  - paiements_employes');
    console.log('  - transactions_financieres');
    console.log('  - ventes');
    console.log('  - cheptel');
    console.log('  - production_animale');
    console.log('  - sante_animale');
    console.log('  - taches');
    console.log('  - messages');
    console.log('  - alertes');
    console.log('  - credits');
    console.log('  - equipements');
    console.log('\n📈 Vues créées:');
    console.log('  - vue_synthese_finances');
    console.log('  - vue_synthese_cultures');
    console.log('  - vue_alertes_stock');
    console.log('\n✅ Index et triggers créés');
    console.log('\n🌱 Ferme par défaut insérée');
  } catch (error) {
    console.error('❌ Erreur lors de la migration étape 6:', error.message);
    process.exit(1);
  }
}

runMigrationStep6().then(() => process.exit(0)).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
