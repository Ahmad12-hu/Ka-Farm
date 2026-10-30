-- KA Farm PostgreSQL Schema
-- Création des tables pour l'application KA Farm

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    enterprise_name VARCHAR(255) DEFAULT 'KA Farm',
    enterprise_code VARCHAR(50) DEFAULT 'KA-FARM',
    twitter VARCHAR(255),
    linkedin VARCHAR(255),
    facebook VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des cultures
CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    field VARCHAR(255),
    sowing_date DATE,
    harvest_date DATE,
    status VARCHAR(50),
    water_status VARCHAR(50),
    fertilizer_status VARCHAR(50),
    photos TEXT[],
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des pépinières
CREATE TABLE IF NOT EXISTS nurseries (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    crop_type VARCHAR(100),
    sowing_date DATE,
    planned_transplant_date DATE,
    quantity_est INTEGER,
    status VARCHAR(50),
    health_status VARCHAR(50),
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des stocks
CREATE TABLE IF NOT EXISTS stocks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INTEGER,
    max_quantity INTEGER,
    unit VARCHAR(50),
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    due_date DATE,
    assignee VARCHAR(255),
    priority VARCHAR(50),
    completed BOOLEAN DEFAULT FALSE,
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des finances
CREATE TABLE IF NOT EXISTS finances (
    id VARCHAR(50) PRIMARY KEY,
    description TEXT,
    category VARCHAR(100),
    type VARCHAR(50),
    amount DECIMAL(10, 2),
    date DATE,
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des parcelles
CREATE TABLE IF NOT EXISTS parcelles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surface DECIMAL(10, 2),
    lat DECIMAL(10, 8),
    lng DECIMAL(10, 8),
    status VARCHAR(50),
    type_sol VARCHAR(50) DEFAULT 'sableux',
    history TEXT[],
    current_crop VARCHAR(255),
    water_status VARCHAR(50),
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100),
    daily_rate DECIMAL(10, 2),
    status VARCHAR(50),
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des présences
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id),
    date DATE,
    status VARCHAR(50),
    notes TEXT,
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements employés
CREATE TABLE IF NOT EXISTS employee_payments (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id),
    amount DECIMAL(10, 2),
    date DATE,
    period_start DATE,
    period_end DATE,
    payment_method VARCHAR(100),
    status VARCHAR(50),
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table du cheptel
CREATE TABLE IF NOT EXISTS cheptel (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    breed VARCHAR(255),
    quantity INTEGER,
    unit VARCHAR(50),
    status VARCHAR(50),
    purpose VARCHAR(100),
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de la production d'élevage
CREATE TABLE IF NOT EXISTS elevage_production (
    id VARCHAR(50) PRIMARY KEY,
    date DATE,
    type VARCHAR(100),
    quantity DECIMAL(10, 2),
    unit VARCHAR(50),
    notes TEXT,
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de la santé d'élevage
CREATE TABLE IF NOT EXISTS elevage_health (
    id VARCHAR(50) PRIMARY KEY,
    date DATE,
    target VARCHAR(255),
    intervention TEXT,
    practitioner VARCHAR(255),
    cost DECIMAL(10, 2),
    notes TEXT,
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    text TEXT,
    timestamp TIMESTAMP,
    is_private BOOLEAN DEFAULT FALSE,
    image TEXT,
    enterprise_id VARCHAR(50) DEFAULT 'ka_farm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_enterprise ON users(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_crops_enterprise ON crops(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_stocks_enterprise ON stocks(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_tasks_enterprise ON tasks(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_finances_enterprise ON finances(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_messages_enterprise ON messages(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
