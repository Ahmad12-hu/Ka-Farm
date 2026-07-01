// KA-FARM - Script de Migration Étape 3
// Tables employés, finances, élevage, etc.

import dotenv from 'dotenv';
import { query, testConnection } from './config.js';

dotenv.config();

async function runMigrationStep3() {
  console.log('🚀 Migration Étape 3: Tables employés, finances, élevage...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Impossible de se connecter à la base de données.');
    process.exit(1);
  }

  const sql = `
-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id UUID NOT NULL,
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('entree', 'sortie', 'ajustement', 'perte')),
    quantite DECIMAL(10, 2) NOT NULL,
    motif VARCHAR(200),
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operateur_id UUID,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE mouvements_stock ADD CONSTRAINT fk_mouvement_stock FOREIGN KEY (stock_id) REFERENCES stocks_intrants(id) ON DELETE CASCADE;
ALTER TABLE mouvements_stock ADD CONSTRAINT fk_mouvement_operateur FOREIGN KEY (operateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table des employés
CREATE TABLE IF NOT EXISTS employes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    taux_journalier_fcfa DECIMAL(10, 2),
    taux_mensuel_fcfa DECIMAL(10, 2),
    date_embauche DATE,
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'conge', 'licencie')),
    adresse TEXT,
    cni VARCHAR(50),
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE employes ADD CONSTRAINT fk_employe_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;

-- Table des présences
CREATE TABLE IF NOT EXISTS presences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employe_id UUID NOT NULL,
    date DATE NOT NULL,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('present', 'absent', 'demi_journee', 'conge', 'maladie')),
    heures_travaillees DECIMAL(4, 2),
    taches_effectuees TEXT,
    notes TEXT,
    enregistre_par UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employe_id, date)
);

ALTER TABLE presences ADD CONSTRAINT fk_presence_employe FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE;
ALTER TABLE presences ADD CONSTRAINT fk_presence_enregistreur FOREIGN KEY (enregistre_par) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table des paiements employés
CREATE TABLE IF NOT EXISTS paiements_employes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employe_id UUID NOT NULL,
    montant_fcfa DECIMAL(10, 2) NOT NULL,
    date_paiement DATE NOT NULL,
    periode_debut DATE,
    periode_fin DATE,
    methode_paiement VARCHAR(30) CHECK (methode_paiement IN ('especes', 'orange_money', 'wave', 'cheque', 'virement')),
    reference_paiement VARCHAR(100),
    notes TEXT,
    enregistre_par UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE paiements_employes ADD CONSTRAINT fk_paiement_employe FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE;
ALTER TABLE paiements_employes ADD CONSTRAINT fk_paiement_enregistreur FOREIGN KEY (enregistre_par) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table des transactions financières
CREATE TABLE IF NOT EXISTS transactions_financieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    type_transaction VARCHAR(20) NOT NULL CHECK (type_transaction IN ('revenu', 'depense', 'transfert', 'emprunt', 'remboursement')),
    categorie VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    montant_fcfa DECIMAL(12, 2) NOT NULL,
    date_transaction DATE NOT NULL,
    mode_paiement VARCHAR(30) CHECK (mode_paiement IN ('especes', 'orange_money', 'wave', 'cheque', 'virement', 'autre')),
    reference_facture VARCHAR(100),
    tiers VARCHAR(100),
    justificatif_url TEXT,
    enregistre_par UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE transactions_financieres ADD CONSTRAINT fk_transaction_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;
ALTER TABLE transactions_financieres ADD CONSTRAINT fk_transaction_enregistreur FOREIGN KEY (enregistre_par) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table des ventes
CREATE TABLE IF NOT EXISTS ventes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    transaction_id UUID,
    produit VARCHAR(100) NOT NULL,
    quantite_kg DECIMAL(10, 2) NOT NULL,
    prix_unitaire_fcfa DECIMAL(10, 2) NOT NULL,
    prix_total_fcfa DECIMAL(12, 2) NOT NULL,
    destination_marche VARCHAR(100),
    intermediaire_nom VARCHAR(100),
    intermediaire_telephone VARCHAR(20),
    acompte_fcfa DECIMAL(10, 2) DEFAULT 0,
    statut_reglement VARCHAR(30) DEFAULT 'paye' CHECK (statut_reglement IN ('paye', 'partiel', 'non_paye')),
    date_vente DATE NOT NULL,
    notes TEXT,
    enregistre_par UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE ventes ADD CONSTRAINT fk_vente_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;
ALTER TABLE ventes ADD CONSTRAINT fk_vente_transaction FOREIGN KEY (transaction_id) REFERENCES transactions_financieres(id) ON DELETE SET NULL;
ALTER TABLE ventes ADD CONSTRAINT fk_vente_enregistreur FOREIGN KEY (enregistre_par) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table du cheptel
CREATE TABLE IF NOT EXISTS cheptel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    nom_troupeau VARCHAR(100) NOT NULL,
    type_animal VARCHAR(50) NOT NULL CHECK (type_animal IN ('bovin', 'ovin', 'caprin', 'volaille', 'equin', 'porcin', 'autre')),
    race VARCHAR(100),
    quantite INT NOT NULL,
    unite VARCHAR(20) DEFAULT 'tetes' CHECK (unite IN ('tetes', 'sujets', 'unites')),
    sexe VARCHAR(20) CHECK (sexe IN ('male', 'femelle', 'mixte')),
    age_moyen_mois INT,
    but VARCHAR(50) CHECK (but IN ('lait', 'viande', 'reproduction', 'œufs', 'travail', 'autre')),
    statut_sante VARCHAR(30) DEFAULT 'sain' CHECK (statut_sante IN ('sain', 'surveiller', 'malade', 'quarantaine')),
    date_entree DATE,
    notes TEXT,
    photos TEXT[],
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE cheptel ADD CONSTRAINT fk_cheptel_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;

-- Table de production animale
CREATE TABLE IF NOT EXISTS production_animale (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cheptel_id UUID NOT NULL,
    date_production DATE NOT NULL,
    type_production VARCHAR(50) NOT NULL CHECK (type_production IN ('lait', 'œufs', 'viande', 'laine', 'autre')),
    quantite DECIMAL(10, 2) NOT NULL,
    unite VARCHAR(20) NOT NULL,
    qualite VARCHAR(20),
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE production_animale ADD CONSTRAINT fk_production_cheptel FOREIGN KEY (cheptel_id) REFERENCES cheptel(id) ON DELETE CASCADE;

-- Table de santé animale
CREATE TABLE IF NOT EXISTS sante_animale (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cheptel_id UUID NOT NULL,
    date_intervention DATE NOT NULL,
    type_intervention VARCHAR(50) NOT NULL CHECK (type_intervention IN ('vaccination', 'deparasitage', 'traitement', 'verif_sante', 'autre')),
    cible VARCHAR(100),
    praticien VARCHAR(100),
    cout_fcfa DECIMAL(10, 2),
    medicaments TEXT,
    notes TEXT,
    enregistre_par UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE sante_animale ADD CONSTRAINT fk_sante_cheptel FOREIGN KEY (cheptel_id) REFERENCES cheptel(id) ON DELETE CASCADE;
ALTER TABLE sante_animale ADD CONSTRAINT fk_sante_enregistreur FOREIGN KEY (enregistre_par) REFERENCES utilisateurs(id) ON DELETE SET NULL;
`;

  try {
    await query(sql);
    console.log('✅ Étape 3 terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration étape 3:', error.message);
    process.exit(1);
  }
}

runMigrationStep3().then(() => process.exit(0)).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
