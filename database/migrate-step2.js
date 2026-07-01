// KA-FARM - Script de Migration Étape 2
// Ajoute les clés étrangères et les autres tables

import dotenv from 'dotenv';
import { query, testConnection } from './config.js';

dotenv.config();

async function runMigrationStep2() {
  console.log('🚀 Migration Étape 2: Clés étrangères et autres tables...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Impossible de se connecter à la base de données.');
    process.exit(1);
  }

  const sql = `
-- Ajouter les clés étrangères
ALTER TABLE fermes ADD CONSTRAINT fk_ferme_responsable FOREIGN KEY (responsable_id) REFERENCES utilisateurs(id) ON DELETE SET NULL;
ALTER TABLE utilisateurs ADD CONSTRAINT fk_user_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE SET NULL;
ALTER TABLE parcelles ADD CONSTRAINT fk_parcelle_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;

-- Table des cultures
CREATE TABLE IF NOT EXISTS cultures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcelle_id UUID NOT NULL,
    nom_culture VARCHAR(100) NOT NULL,
    variete VARCHAR(100),
    famille_botanique VARCHAR(50),
    date_semis DATE,
    date_repiquage DATE,
    date_recolte_prevue DATE,
    date_recolte_reelle DATE,
    statut VARCHAR(30) DEFAULT 'pepiniere' CHECK (statut IN ('pepiniere', 'semis', 'levée', 'croissance', 'floraison', 'fructification', 'maturite', 'recolte', 'termine')),
    stade_developpement VARCHAR(50),
    water_status VARCHAR(30) DEFAULT 'normal',
    fertilizer_status VARCHAR(30) DEFAULT 'normal',
    densite_semis_m2 DECIMAL(8, 2),
    quantite_semis_unites INT,
    notes TEXT,
    photos TEXT[],
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE cultures ADD CONSTRAINT fk_culture_parcelle FOREIGN KEY (parcelle_id) REFERENCES parcelles(id) ON DELETE CASCADE;

-- Table des pépinières
CREATE TABLE IF NOT EXISTS pepinieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcelle_id UUID,
    nom_pepiniere VARCHAR(100) NOT NULL,
    culture_type VARCHAR(100) NOT NULL,
    variete VARCHAR(100),
    date_semis DATE NOT NULL,
    nombre_semis INT,
    nombre_alveoles INT,
    surface_m2 DECIMAL(10, 2),
    taux_levee_estime DECIMAL(5, 2),
    date_repiquage_prevue DATE,
    date_repiquage_reelle DATE,
    statut VARCHAR(30) DEFAULT 'semis' CHECK (statut IN ('semis', 'levée', 'croissance', 'pret_repiquage', 'repique', 'termine')),
    sante VARCHAR(30) DEFAULT 'excellent' CHECK (sante IN ('excellent', 'bon', 'moyen', 'mauvais', 'critique')),
    notes TEXT,
    photos TEXT[],
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE pepinieres ADD CONSTRAINT fk_pepiniere_parcelle FOREIGN KEY (parcelle_id) REFERENCES parcelles(id) ON DELETE SET NULL;

-- Table des récoltes
CREATE TABLE IF NOT EXISTS recoltes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    culture_id UUID NOT NULL,
    parcelle_id UUID NOT NULL,
    date_recolte DATE NOT NULL,
    poids_kg DECIMAL(10, 2) NOT NULL,
    qualite VARCHAR(20) DEFAULT 'A' CHECK (qualite IN ('A', 'B', 'C', 'D')),
    nombre_caisse INT,
    prix_unitaire_fcfa DECIMAL(10, 2),
    prix_total_fcfa DECIMAL(10, 2),
    notes TEXT,
    photos TEXT[],
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE recoltes ADD CONSTRAINT fk_recolte_culture FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE CASCADE;
ALTER TABLE recoltes ADD CONSTRAINT fk_recolte_parcelle FOREIGN KEY (parcelle_id) REFERENCES parcelles(id) ON DELETE CASCADE;

-- Table des traitements phytosanitaires
CREATE TABLE IF NOT EXISTS traitements_phytosanitaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    culture_id UUID,
    parcelle_id UUID NOT NULL,
    produit_nom VARCHAR(100) NOT NULL,
    type_produit VARCHAR(50) CHECK (type_produit IN ('fongicide', 'insecticide', 'herbicide', 'biopesticide', 'engrais_foliar')),
    date_application DATE NOT NULL,
    delai_carence_jours INT DEFAULT 7,
    dose_appliquee_g_m2 DECIMAL(8, 2),
    dose_unite VARCHAR(20),
    cible_ravageur VARCHAR(100),
    cible_maladie VARCHAR(100),
    methode_application VARCHAR(50),
    cout_fcfa DECIMAL(10, 2),
    operateur_id UUID,
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE traitements_phytosanitaires ADD CONSTRAINT fk_traitement_culture FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE SET NULL;
ALTER TABLE traitements_phytosanitaires ADD CONSTRAINT fk_traitement_parcelle FOREIGN KEY (parcelle_id) REFERENCES parcelles(id) ON DELETE CASCADE;
ALTER TABLE traitements_phytosanitaires ADD CONSTRAINT fk_traitement_operateur FOREIGN KEY (operateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table des stocks d'intrants
CREATE TABLE IF NOT EXISTS stocks_intrants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    intrant_nom VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('semence', 'engrais', 'traitement', 'amendement', 'equipement', 'alimentation')),
    quantite_disponible DECIMAL(10, 2) NOT NULL,
    unite_mesure VARCHAR(20) NOT NULL CHECK (unite_mesure IN ('kg', 'g', 'L', 'mL', 'sachet', 'sac', 'unite', 'piece')),
    quantite_miniale DECIMAL(10, 2) NOT NULL,
    quantite_maximale DECIMAL(10, 2),
    fournisseur VARCHAR(100),
    date_peremption DATE,
    cout_unitaire_fcfa DECIMAL(10, 2),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE stocks_intrants ADD CONSTRAINT fk_stock_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;
`;

  try {
    await query(sql);
    console.log('✅ Étape 2 terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration étape 2:', error.message);
    process.exit(1);
  }
}

runMigrationStep2().then(() => process.exit(0)).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
