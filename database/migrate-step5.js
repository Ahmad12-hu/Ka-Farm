// KA-FARM - Script de Migration Étape 5
// Index, triggers et vues

import dotenv from 'dotenv';
import { query, testConnection } from './config.js';

dotenv.config();

async function runMigrationStep5() {
  console.log('🚀 Migration Étape 5: Index, triggers et vues...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Impossible de se connecter à la base de données.');
    process.exit(1);
  }

  const sql = `
-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_fermes_region ON fermes(region);
CREATE INDEX IF NOT EXISTS idx_fermes_responsable ON fermes(responsable_id);
CREATE INDEX IF NOT EXISTS idx_fermes_statut ON fermes(statut);

CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_ferme ON utilisateurs(ferme_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_role ON utilisateurs(role);

CREATE INDEX IF NOT EXISTS idx_parcelles_ferme ON parcelles(ferme_id);
CREATE INDEX IF NOT EXISTS idx_parcelles_statut ON parcelles(statut);
CREATE INDEX IF NOT EXISTS idx_parcelles_type_sol ON parcelles(type_sol);

CREATE INDEX IF NOT EXISTS idx_cultures_parcelle ON cultures(parcelle_id);
CREATE INDEX IF NOT EXISTS idx_cultures_statut ON cultures(statut);
CREATE INDEX IF NOT EXISTS idx_cultures_famille ON cultures(famille_botanique);
CREATE INDEX IF NOT EXISTS idx_cultures_date_recolte ON cultures(date_recolte_prevue);

CREATE INDEX IF NOT EXISTS idx_pepinieres_parcelle ON pepinieres(parcelle_id);
CREATE INDEX IF NOT EXISTS idx_pepinieres_statut ON pepinieres(statut);
CREATE INDEX IF NOT EXISTS idx_pepinieres_date_repiquage ON pepinieres(date_repiquage_prevue);

CREATE INDEX IF NOT EXISTS idx_recoltes_culture ON recoltes(culture_id);
CREATE INDEX IF NOT EXISTS idx_recoltes_parcelle ON recoltes(parcelle_id);
CREATE INDEX IF NOT EXISTS idx_recoltes_date ON recoltes(date_recolte);

CREATE INDEX IF NOT EXISTS idx_traitements_culture ON traitements_phytosanitaires(culture_id);
CREATE INDEX IF NOT EXISTS idx_traitements_parcelle ON traitements_phytosanitaires(parcelle_id);
CREATE INDEX IF NOT EXISTS idx_traitements_date ON traitements_phytosanitaires(date_application);

CREATE INDEX IF NOT EXISTS idx_stocks_ferme ON stocks_intrants(ferme_id);
CREATE INDEX IF NOT EXISTS idx_stocks_categorie ON stocks_intrants(categorie);

CREATE INDEX IF NOT EXISTS idx_mouvements_stock ON mouvements_stock(stock_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements_stock(date_mouvement);

CREATE INDEX IF NOT EXISTS idx_employes_ferme ON employes(ferme_id);
CREATE INDEX IF NOT EXISTS idx_employes_statut ON employes(statut);

CREATE INDEX IF NOT EXISTS idx_presences_employe ON presences(employe_id);
CREATE INDEX IF NOT EXISTS idx_presences_date ON presences(date);
CREATE INDEX IF NOT EXISTS idx_presences_statut ON presences(statut);

CREATE INDEX IF NOT EXISTS idx_paiements_employe ON paiements_employes(employe_id);
CREATE INDEX IF NOT EXISTS idx_paiements_date ON paiements_employes(date_paiement);

CREATE INDEX IF NOT EXISTS idx_transactions_ferme ON transactions_financieres(ferme_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions_financieres(type_transaction);
CREATE INDEX IF NOT EXISTS idx_transactions_categorie ON transactions_financieres(categorie);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions_financieres(date_transaction);

CREATE INDEX IF NOT EXISTS idx_ventes_ferme ON ventes(ferme_id);
CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes(date_vente);
CREATE INDEX IF NOT EXISTS idx_ventes_statut ON ventes(statut_reglement);

CREATE INDEX IF NOT EXISTS idx_cheptel_ferme ON cheptel(ferme_id);
CREATE INDEX IF NOT EXISTS idx_cheptel_type ON cheptel(type_animal);
CREATE INDEX IF NOT EXISTS idx_cheptel_statut ON cheptel(statut_sante);

CREATE INDEX IF NOT EXISTS idx_production_cheptel ON production_animale(cheptel_id);
CREATE INDEX IF NOT EXISTS idx_production_date ON production_animale(date_production);

CREATE INDEX IF NOT EXISTS idx_sante_cheptel ON sante_animale(cheptel_id);
CREATE INDEX IF NOT EXISTS idx_sante_date ON sante_animale(date_intervention);

CREATE INDEX IF NOT EXISTS idx_taches_ferme ON taches(ferme_id);
CREATE INDEX IF NOT EXISTS idx_taches_assigne ON taches(assigne_a);
CREATE INDEX IF NOT EXISTS idx_taches_statut ON taches(statut);
CREATE INDEX IF NOT EXISTS idx_taches_echeance ON taches(date_echeance);

CREATE INDEX IF NOT EXISTS idx_messages_ferme ON messages(ferme_id);
CREATE INDEX IF NOT EXISTS idx_messages_expediteur ON messages(expediteur_id);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(date_envoi);

CREATE INDEX IF NOT EXISTS idx_alertes_ferme ON alertes(ferme_id);
CREATE INDEX IF NOT EXISTS idx_alertes_type ON alertes(type_alerte);
CREATE INDEX IF NOT EXISTS idx_alertes_active ON alertes(est_active);

CREATE INDEX IF NOT EXISTS idx_credits_ferme ON credits(ferme_id);
CREATE INDEX IF NOT EXISTS idx_credits_statut ON credits(statut);

CREATE INDEX IF NOT EXISTS idx_equipements_ferme ON equipements(ferme_id);
CREATE INDEX IF NOT EXISTS idx_equipements_type ON equipements(type_equipement);
CREATE INDEX IF NOT EXISTS idx_equipements_statut ON equipements(statut);

-- Trigger pour mettre à jour date_modification automatiquement
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables pertinentes
DROP TRIGGER IF EXISTS trigger_fermes_modification ON fermes;
CREATE TRIGGER trigger_fermes_modification
    BEFORE UPDATE ON fermes
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS trigger_parcelles_modification ON parcelles;
CREATE TRIGGER trigger_parcelles_modification
    BEFORE UPDATE ON parcelles
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS trigger_cultures_modification ON cultures;
CREATE TRIGGER trigger_cultures_modification
    BEFORE UPDATE ON cultures
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS trigger_pepinieres_modification ON pepinieres;
CREATE TRIGGER trigger_pepinieres_modification
    BEFORE UPDATE ON pepinieres
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS trigger_stocks_modification ON stocks_intrants;
CREATE TRIGGER trigger_stocks_modification
    BEFORE UPDATE ON stocks_intrants
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS trigger_employes_modification ON employes;
CREATE TRIGGER trigger_employes_modification
    BEFORE UPDATE ON employes
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS trigger_cheptel_modification ON cheptel;
CREATE TRIGGER trigger_cheptel_modification
    BEFORE UPDATE ON cheptel
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS trigger_equipements_modification ON equipements;
CREATE TRIGGER trigger_equipements_modification
    BEFORE UPDATE ON equipements
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();
`;

  try {
    await query(sql);
    console.log('✅ Étape 5 terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration étape 5:', error.message);
    process.exit(1);
  }
}

runMigrationStep5().then(() => process.exit(0)).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
