-- KA-FARM - Schéma de Base de Données PostgreSQL
-- Version: 1.0
-- Description: Structure relationnelle pour la gestion agricole

-- Extension pour les UUID et les timestamps
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Table des fermes (exploitations agricoles)
CREATE TABLE fermes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    code_ferme VARCHAR(20) UNIQUE,
    localisation VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL, -- Dakar, Thiès, Saint-Louis, etc.
    surface_totale_m2 DECIMAL(10, 2),
    coordonnees_lat DECIMAL(10, 6),
    coordonnees_lng DECIMAL(10, 6),
    responsable_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
    metadata JSONB DEFAULT '{}'
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_fermes_region ON fermes(region);
CREATE INDEX idx_fermes_responsable ON fermes(responsable_id);
CREATE INDEX idx_fermes_statut ON fermes(statut);

-- Table des utilisateurs
CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'membre' CHECK (role IN ('admin', 'gestionnaire', 'terrain', 'membre', 'invite')),
    ferme_id UUID REFERENCES fermes(id) ON DELETE SET NULL,
    est_actif BOOLEAN DEFAULT true,
    derniere_connexion TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_ferme ON utilisateurs(ferme_id);
CREATE INDEX idx_utilisateurs_role ON utilisateurs(role);

-- Table des parcelles
CREATE TABLE parcelles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    nom_parcelle VARCHAR(100) NOT NULL,
    code_parcelle VARCHAR(20) UNIQUE,
    surface_m2 DECIMAL(10, 2) NOT NULL,
    type_sol VARCHAR(50) DEFAULT 'sableux' CHECK (type_sol IN ('sableux', 'argileux', 'limoneux', 'latéritique', 'mixte')),
    coordonnees_lat DECIMAL(10, 6),
    coordonnees_lng DECIMAL(10, 6),
    statut VARCHAR(30) DEFAULT 'libre' CHECK (statut IN ('libre', 'pepiniere', 'en_production', 'repos', 'en_preparation')),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_parcelles_ferme ON parcelles(ferme_id);
CREATE INDEX idx_parcelles_statut ON parcelles(statut);
CREATE INDEX idx_parcelles_type_sol ON parcelles(type_sol);

-- Table des cultures
CREATE TABLE cultures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcelle_id UUID NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
    nom_culture VARCHAR(100) NOT NULL,
    variete VARCHAR(100),
    famille_botanique VARCHAR(50), -- Solanacées, Alliacées, Légumineuses, etc.
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
    photos TEXT[], -- Array d'URLs de photos
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_cultures_parcelle ON cultures(parcelle_id);
CREATE INDEX idx_cultures_statut ON cultures(statut);
CREATE INDEX idx_cultures_famille ON cultures(famille_botanique);
CREATE INDEX idx_cultures_date_recolte ON cultures(date_recolte_prevue);

-- Table des pépinières
CREATE TABLE pepinieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcelle_id UUID REFERENCES parcelles(id) ON DELETE SET NULL,
    nom_pepiniere VARCHAR(100) NOT NULL,
    culture_type VARCHAR(100) NOT NULL,
    variete VARCHAR(100),
    date_semis DATE NOT NULL,
    nombre_semis INT,
    nombre_alveoles INT,
    surface_m2 DECIMAL(10, 2),
    taux_levee_estime DECIMAL(5, 2), -- Pourcentage
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

CREATE INDEX idx_pepinieres_parcelle ON pepinieres(parcelle_id);
CREATE INDEX idx_pepinieres_statut ON pepinieres(statut);
CREATE INDEX idx_pepinieres_date_repiquage ON pepinieres(date_repiquage_prevue);

-- Table des récoltes
CREATE TABLE recoltes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    culture_id UUID NOT NULL REFERENCES cultures(id) ON DELETE CASCADE,
    parcelle_id UUID NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
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

CREATE INDEX idx_recoltes_culture ON recoltes(culture_id);
CREATE INDEX idx_recoltes_parcelle ON recoltes(parcelle_id);
CREATE INDEX idx_recoltes_date ON recoltes(date_recolte);

-- Table des traitements phytosanitaires
CREATE TABLE traitements_phytosanitaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    culture_id UUID REFERENCES cultures(id) ON DELETE SET NULL,
    parcelle_id UUID REFERENCES parcelles(id) ON DELETE CASCADE,
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
    operateur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_traitements_culture ON traitements_phytosanitaires(culture_id);
CREATE INDEX idx_traitements_parcelle ON traitements_phytosanitaires(parcelle_id);
CREATE INDEX idx_traitements_date ON traitements_phytosanitaires(date_application);

-- Table des stocks d'intrants
CREATE TABLE stocks_intrants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    intrant_nom VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('semence', 'engrais', 'traitement', 'amendement', 'equipement', 'alimentation')),
    quantite_disponible DECIMAL(10, 2) NOT NULL,
    unite_mesure VARCHAR(20) NOT NULL CHECK (unite_mesure IN ('kg', 'g', 'L', 'mL', 'sachet', 'sac', 'unite', 'piece')),
    quantite_miniale DECIMAL(10, 2) NOT NULL, -- Seuil d'alerte
    quantite_maximale DECIMAL(10, 2),
    fournisseur VARCHAR(100),
    date_peremption DATE,
    cout_unitaire_fcfa DECIMAL(10, 2),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_stocks_ferme ON stocks_intrants(ferme_id);
CREATE INDEX idx_stocks_categorie ON stocks_intrants(categorie);

-- Table des mouvements de stock
CREATE TABLE mouvements_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id UUID NOT NULL REFERENCES stocks_intrants(id) ON DELETE CASCADE,
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('entree', 'sortie', 'ajustement', 'perte')),
    quantite DECIMAL(10, 2) NOT NULL,
    motif VARCHAR(200),
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operateur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_mouvements_stock ON mouvements_stock(stock_id);
CREATE INDEX idx_mouvements_date ON mouvements_stock(date_mouvement);

-- Table des employés
CREATE TABLE employes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
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

CREATE INDEX idx_employes_ferme ON employes(ferme_id);
CREATE INDEX idx_employes_statut ON employes(statut);

-- Table des présences
CREATE TABLE presences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employe_id UUID NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('present', 'absent', 'demi_journee', 'conge', 'maladie')),
    heures_travaillees DECIMAL(4, 2),
    taches_effectuees TEXT,
    notes TEXT,
    enregistre_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employe_id, date)
);

CREATE INDEX idx_presences_employe ON presences(employe_id);
CREATE INDEX idx_presences_date ON presences(date);
CREATE INDEX idx_presences_statut ON presences(statut);

-- Table des paiements employés
CREATE TABLE paiements_employes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employe_id UUID NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    montant_fcfa DECIMAL(10, 2) NOT NULL,
    date_paiement DATE NOT NULL,
    periode_debut DATE,
    periode_fin DATE,
    methode_paiement VARCHAR(30) CHECK (methode_paiement IN ('especes', 'orange_money', 'wave', 'cheque', 'virement')),
    reference_paiement VARCHAR(100),
    notes TEXT,
    enregistre_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_paiements_employe ON paiements_employes(employe_id);
CREATE INDEX idx_paiements_date ON paiements_employes(date_paiement);

-- Table des transactions financières
CREATE TABLE transactions_financieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    type_transaction VARCHAR(20) NOT NULL CHECK (type_transaction IN ('revenu', 'depense', 'transfert', 'emprunt', 'remboursement')),
    categorie VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    montant_fcfa DECIMAL(12, 2) NOT NULL,
    date_transaction DATE NOT NULL,
    mode_paiement VARCHAR(30) CHECK (mode_paiement IN ('especes', 'orange_money', 'wave', 'cheque', 'virement', 'autre')),
    reference_facture VARCHAR(100),
    tiers VARCHAR(100), -- Fournisseur, client, etc.
    justificatif_url TEXT,
    enregistre_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_transactions_ferme ON transactions_financieres(ferme_id);
CREATE INDEX idx_transactions_type ON transactions_financieres(type_transaction);
CREATE INDEX idx_transactions_categorie ON transactions_financieres(categorie);
CREATE INDEX idx_transactions_date ON transactions_financieres(date_transaction);

-- Table des ventes
CREATE TABLE ventes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions_financieres(id) ON DELETE SET NULL,
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
    enregistre_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_ventes_ferme ON ventes(ferme_id);
CREATE INDEX idx_ventes_date ON ventes(date_vente);
CREATE INDEX idx_ventes_statut ON ventes(statut_reglement);

-- Table du cheptel (animaux)
CREATE TABLE cheptel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
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

CREATE INDEX idx_cheptel_ferme ON cheptel(ferme_id);
CREATE INDEX idx_cheptel_type ON cheptel(type_animal);
CREATE INDEX idx_cheptel_statut ON cheptel(statut_sante);

-- Table de production animale
CREATE TABLE production_animale (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cheptel_id UUID NOT NULL REFERENCES cheptel(id) ON DELETE CASCADE,
    date_production DATE NOT NULL,
    type_production VARCHAR(50) NOT NULL CHECK (type_production IN ('lait', 'œufs', 'viande', 'laine', 'autre')),
    quantite DECIMAL(10, 2) NOT NULL,
    unite VARCHAR(20) NOT NULL,
    qualite VARCHAR(20),
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_production_cheptel ON production_animale(cheptel_id);
CREATE INDEX idx_production_date ON production_animale(date_production);

-- Table de santé animale
CREATE table sante_animale (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cheptel_id UUID NOT NULL REFERENCES cheptel(id) ON DELETE CASCADE,
    date_intervention DATE NOT NULL,
    type_intervention VARCHAR(50) NOT NULL CHECK (type_intervention IN ('vaccination', 'deparasitage', 'traitement', 'verif_sante', 'autre')),
    cible VARCHAR(100),
    praticien VARCHAR(100),
    cout_fcfa DECIMAL(10, 2),
    medicaments TEXT,
    notes TEXT,
    enregistre_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_sante_cheptel ON sante_animale(cheptel_id);
CREATE INDEX idx_sante_date ON sante_animale(date_intervention);

-- Table des tâches
CREATE TABLE taches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    categorie VARCHAR(50) CHECK (categorie IN ('irrigation', 'semis', 'recolte', 'entretien', 'pepiniere', 'traitement', 'vente', 'autre')),
    priorite VARCHAR(20) DEFAULT 'moyenne' CHECK (priorite IN ('basse', 'moyenne', 'haute', 'urgente')),
    date_echeance DATE,
    assigne_a UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    statut VARCHAR(20) DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'en_cours', 'termine', 'annulee')),
    date_completion DATE,
    cree_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_taches_ferme ON taches(ferme_id);
CREATE INDEX idx_taches_assigne ON taches(assigne_a);
CREATE INDEX idx_taches_statut ON taches(statut);
CREATE INDEX idx_taches_echeance ON taches(date_echeance);

-- Table des messages (discussion interne)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    expediteur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    est_prive BOOLEAN DEFAULT false,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN DEFAULT false,
    date_lecture TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_messages_ferme ON messages(ferme_id);
CREATE INDEX idx_messages_expediteur ON messages(expediteur_id);
CREATE INDEX idx_messages_date ON messages(date_envoi);

-- Table des alertes
CREATE TABLE alertes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    type_alerte VARCHAR(50) NOT NULL CHECK (type_alerte IN ('meteo', 'ravageur', 'maladie', 'stock', 'irrigation', 'autre')),
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    severite VARCHAR(20) DEFAULT 'info' CHECK (severite IN ('info', 'attention', 'warning', 'critique')),
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    est_active BOOLEAN DEFAULT true,
    cree_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_alertes_ferme ON alertes(ferme_id);
CREATE INDEX idx_alertes_type ON alertes(type_alerte);
CREATE INDEX idx_alertes_active ON alertes(est_active);

-- Table des crédits/emprunts
CREATE table credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
    creancier_nom VARCHAR(100) NOT NULL,
    montant_emprunte_fcfa DECIMAL(12, 2) NOT NULL,
    taux_interet DECIMAL(5, 2),
    date_octroi DATE NOT NULL,
    date_remboursement_prevue DATE,
    montant_rembourse_fcfa DECIMAL(12, 2) DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'rembourse', 'annule', 'retard')),
    objet TEXT,
    enregistre_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_credits_ferme ON credits(ferme_id);
CREATE INDEX idx_credits_statut ON credits(statut);

-- Table des équipements
CREATE TABLE equipements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL REFERENCES fermes(id) ON DELETE CASCADE,
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

CREATE INDEX idx_equipements_ferme ON equipements(ferme_id);
CREATE INDEX idx_equipements_type ON equipements(type_equipement);
CREATE INDEX idx_equipements_statut ON equipements(statut);

-- ============================================
-- TRIGGERS POUR LA MISE À JOUR AUTOMATIQUE
-- ============================================

-- Trigger pour mettre à jour date_modification automatiquement
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables pertinentes
CREATE TRIGGER trigger_fermes_modification
    BEFORE UPDATE ON fermes
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER trigger_parcelles_modification
    BEFORE UPDATE ON parcelles
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER trigger_cultures_modification
    BEFORE UPDATE ON cultures
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER trigger_pepinieres_modification
    BEFORE UPDATE ON pepinieres
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER trigger_stocks_modification
    BEFORE UPDATE ON stocks_intrants
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER trigger_employes_modification
    BEFORE UPDATE ON employes
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER trigger_cheptel_modification
    BEFORE UPDATE ON cheptel
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER trigger_equipements_modification
    BEFORE UPDATE ON equipements
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

-- ============================================
-- VUES POUR LES REQUÊTES FRÉQUENTES
-- ============================================

-- Vue synthèse des finances par ferme
CREATE VIEW vue_synthese_finances AS
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
CREATE VIEW vue_synthese_cultures AS
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
CREATE VIEW vue_alertes_stock AS
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

-- ============================================
-- DONNÉES INITIALES (SEED DATA)
-- ============================================

-- Insérer une ferme par défaut
INSERT INTO fermes (nom, code_ferme, localisation, region, surface_totale_m2, coordonnees_lat, coordonnees_lng)
VALUES 
('KA Farm Exploitation Principale', 'KF-001', 'Zone Maraîchère des Niayes', 'Dakar', 1620, 14.7932, -17.2654);

-- Insérer des utilisateurs par défaut
INSERT INTO utilisateurs (email, password_hash, nom, prenom, role, ferme_id) VALUES
('moussa@kafarm.sn', '$2b$10$placeholder_hash_to_replace', 'KA', 'Moussa', 'terrain', (SELECT id FROM fermes WHERE code_ferme = 'KF-001')),
('aly@kafarm.sn', '$2b$10$placeholder_hash_to_replace', 'KA', 'Aly', 'gestionnaire', (SELECT id FROM fermes WHERE code_ferme = 'KF-001')),
('amadoucoumbaka@gmail.com', '$2b$10$placeholder_hash_to_replace', 'KA', 'Amadou', 'admin', (SELECT id FROM fermes WHERE code_ferme = 'KF-001'));

-- Commentaire pour rappeler de remplacer les hashes par de vrais passwords hashés
COMMENT ON TABLE utilisateurs IS 'Les passwords doivent être hashés avec bcrypt avant insertion';
