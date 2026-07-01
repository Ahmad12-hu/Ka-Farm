// KA-FARM - Script de Migration Étape 4
// Tables tâches, messages, alertes, crédits, équipements

import dotenv from 'dotenv';
import { query, testConnection } from './config.js';

dotenv.config();

async function runMigrationStep4() {
  console.log('🚀 Migration Étape 4: Tables tâches, messages, alertes, crédits, équipements...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Impossible de se connecter à la base de données.');
    process.exit(1);
  }

  const sql = `
-- Table des tâches
CREATE TABLE IF NOT EXISTS taches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    categorie VARCHAR(50) CHECK (categorie IN ('irrigation', 'semis', 'recolte', 'entretien', 'pepiniere', 'traitement', 'vente', 'autre')),
    priorite VARCHAR(20) DEFAULT 'moyenne' CHECK (priorite IN ('basse', 'moyenne', 'haute', 'urgente')),
    date_echeance DATE,
    assigne_a UUID,
    statut VARCHAR(20) DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'en_cours', 'termine', 'annulee')),
    date_completion DATE,
    cree_par UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE taches ADD CONSTRAINT fk_tache_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;
ALTER TABLE taches ADD CONSTRAINT fk_tache_assigne FOREIGN KEY (assigne_a) REFERENCES utilisateurs(id) ON DELETE SET NULL;
ALTER TABLE taches ADD CONSTRAINT fk_tache_createur FOREIGN KEY (cree_par) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    expediteur_id UUID NOT NULL,
    contenu TEXT NOT NULL,
    est_prive BOOLEAN DEFAULT false,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN DEFAULT false,
    date_lecture TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE messages ADD CONSTRAINT fk_message_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT fk_message_expediteur FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE;

-- Table des alertes
CREATE TABLE IF NOT EXISTS alertes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    type_alerte VARCHAR(50) NOT NULL CHECK (type_alerte IN ('meteo', 'ravageur', 'maladie', 'stock', 'irrigation', 'autre')),
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    severite VARCHAR(20) DEFAULT 'info' CHECK (severite IN ('info', 'attention', 'warning', 'critique')),
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    est_active BOOLEAN DEFAULT true,
    cree_par UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE alertes ADD CONSTRAINT fk_alerte_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;
ALTER TABLE alertes ADD CONSTRAINT fk_alerte_createur FOREIGN KEY (cree_par) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table des crédits
CREATE TABLE IF NOT EXISTS credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    creancier_nom VARCHAR(100) NOT NULL,
    montant_emprunte_fcfa DECIMAL(12, 2) NOT NULL,
    taux_interet DECIMAL(5, 2),
    date_octroi DATE NOT NULL,
    date_remboursement_prevue DATE,
    montant_rembourse_fcfa DECIMAL(12, 2) DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'rembourse', 'annule', 'retard')),
    objet TEXT,
    enregistre_par UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE credits ADD CONSTRAINT fk_credit_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;
ALTER TABLE credits ADD CONSTRAINT fk_credit_enregistreur FOREIGN KEY (enregistre_par) REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Table des équipements
CREATE TABLE IF NOT EXISTS equipements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
    nom VARCHAR(100) NOT NULL,
    type_equipement VARCHAR(50) NOT NULL CHECK (type_equipement IN ('motopompe', 'pulverisateur', 'tracteur', 'semoir', 'systeme_irrigation', 'autre')),
    marque VARCHAR(100),
    modele VARCHAR(100),
    date_achat DATE,
    cout_achat_fcfa DECIMAL(12, 2),
    statut VARCHAR(20) DEFAULT 'operationnel' CHECK (statut IN ('operationnel', 'en_maintenance', 'hors_service', 'retire')),
    date_derniere_maintenance DATE,
    heures_utilisation INT,
    notes TEXT,
    photos TEXT[],
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE equipements ADD CONSTRAINT fk_equipement_ferme FOREIGN KEY (ferme_id) REFERENCES fermes(id) ON DELETE CASCADE;
`;

  try {
    await query(sql);
    console.log('✅ Étape 4 terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration étape 4:', error.message);
    process.exit(1);
  }
}

runMigrationStep4().then(() => process.exit(0)).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
