// KA-FARM - Script de Migration Étape 1
// Crée les extensions et les tables principales

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './config.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrationStep1() {
  console.log('🚀 Migration Étape 1: Extensions et tables principales...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Impossible de se connecter à la base de données.');
    process.exit(1);
  }

  const sql = `
-- Extension pour les UUID et les timestamps
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table des fermes (exploitations agricoles)
CREATE TABLE IF NOT EXISTS fermes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    code_ferme VARCHAR(20) UNIQUE,
    localisation VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    surface_totale_m2 DECIMAL(10, 2),
    coordonnees_lat DECIMAL(10, 6),
    coordonnees_lng DECIMAL(10, 6),
    responsable_id UUID,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
    metadata JSONB DEFAULT '{}'
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'membre' CHECK (role IN ('admin', 'gestionnaire', 'terrain', 'membre', 'invite')),
    ferme_id UUID,
    est_actif BOOLEAN DEFAULT true,
    derniere_connexion TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Table des parcelles
CREATE TABLE IF NOT EXISTS parcelles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ferme_id UUID NOT NULL,
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
`;

  try {
    await query(sql);
    console.log('✅ Étape 1 terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration étape 1:', error.message);
    process.exit(1);
  }
}

runMigrationStep1().then(() => process.exit(0)).catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
