-- Migration Initiale: Schéma complet KA Farm
-- Version: 001
-- Date: 2024-01-15
-- Description: Création de toutes les tables principales

BEGIN;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Bureau',
  password_hash VARCHAR(255) NOT NULL,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  enterprise_name VARCHAR(255) DEFAULT 'KA Farm',
  enterprise_code VARCHAR(100) DEFAULT 'KA-FARM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_enterprise_id ON users(enterprise_id);

-- Table des parcelles
CREATE TABLE IF NOT EXISTS parcelles (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  surface NUMERIC,
  lat NUMERIC,
  lng NUMERIC,
  status VARCHAR(100) NOT NULL DEFAULT 'Cultivée',
  history TEXT[],
  current_crop VARCHAR(255),
  water_status VARCHAR(100) DEFAULT 'Irrigué',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parcelles_enterprise_id ON parcelles(enterprise_id);

-- Table des cultures
CREATE TABLE IF NOT EXISTS crops (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  field VARCHAR(255),
  sowing_date DATE,
  harvest_date DATE,
  status VARCHAR(100) NOT NULL DEFAULT 'Croissance',
  water_status VARCHAR(100) DEFAULT 'Optimale',
  fertilizer_status VARCHAR(100) DEFAULT 'OK',
  photos TEXT[] DEFAULT '{}',
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crops_enterprise_id ON crops(enterprise_id);

-- Table des stocks
CREATE TABLE IF NOT EXISTS stocks (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  max_quantity NUMERIC NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stocks_enterprise_id ON stocks(enterprise_id);

COMMIT;