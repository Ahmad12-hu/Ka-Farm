-- KA Farm: Schéma PostgreSQL
-- Exécuter ce script sur la base de données cible

BEGIN;

-- ENTREPRISE / USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Bureau',
  password_hash VARCHAR(255) NOT NULL,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  enterprise_name VARCHAR(255) DEFAULT 'KA Farm',
  enterprise_code VARCHAR(100) DEFAULT 'KA-FARM',
  twitter VARCHAR(255) DEFAULT '',
  linkedin VARCHAR(255) DEFAULT '',
  facebook VARCHAR(255) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_enterprise_id ON users(enterprise_id);

-- CULTURES / PARCELLES (Parcelles)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_parcelles_enterprise_id ON parcelles(enterprise_id);

-- CULTURES (Crops)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crops_enterprise_id ON crops(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_crops_parcel_id ON crops(parcel_id);

-- PÉPINIÈRES
CREATE TABLE IF NOT EXISTS nurseries (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  crop_type VARCHAR(255) NOT NULL,
  sowing_date DATE,
  planned_transplant_date DATE,
  quantity_est INTEGER,
  status VARCHAR(100) NOT NULL DEFAULT 'Semis',
  health_status VARCHAR(100) DEFAULT 'Excellent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nurseries_enterprise_id ON nurseries(enterprise_id);

-- STOCKS / INVENTAIRE
CREATE TABLE IF NOT EXISTS stocks (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  max_quantity NUMERIC NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stocks_enterprise_id ON stocks(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_stocks_category ON stocks(enterprise_id, category);

-- TÂCHES
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Entretien',
  due_date DATE,
  assignee VARCHAR(255),
  priority VARCHAR(50) NOT NULL DEFAULT 'Moyenne',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_enterprise_id ON tasks(enterprise_id);

-- FLUX FINANCIERS
CREATE TABLE IF NOT EXISTS finances (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Revenu','Dépense')),
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  crop_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_finances_enterprise_id ON finances(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_finances_date ON finances(enterprise_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_finances_type ON finances(enterprise_id, type);

-- EMPLOYÉS
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) DEFAULT '',
  role VARCHAR(255) NOT NULL DEFAULT 'Ouvrier agricole',
  daily_rate INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Actif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_employees_enterprise_id ON employees(enterprise_id);

-- PRÉSENCES / POINTAGE
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  employee_id VARCHAR(100) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Présent',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enterprise_id, employee_id, date)
);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(enterprise_id, employee_id, date);

-- PAIEMENTS SALARIAUX
CREATE TABLE IF NOT EXISTS employee_payments (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  employee_id VARCHAR(100) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  payment_method VARCHAR(100) DEFAULT 'Espèces',
  status VARCHAR(50) NOT NULL DEFAULT 'Payé',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_employee_payments_employee ON employee_payments(enterprise_id, employee_id);

-- CHEPTEL / ANIMAUX
CREATE TABLE IF NOT EXISTS cheptel (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  breed VARCHAR(255) DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'têtes',
  status VARCHAR(100) NOT NULL DEFAULT 'Sain',
  purpose VARCHAR(100) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cheptel_enterprise_id ON cheptel(enterprise_id);

-- PRODUCTION ÉLEVAGE
CREATE TABLE IF NOT EXISTS elevage_production (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  date DATE NOT NULL,
  type VARCHAR(100) NOT NULL,
  quantity NUMERIC NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'unités',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_elevage_production_enterprise_date ON elevage_production(enterprise_id, date DESC);

-- SANTÉ ÉLEVAGE
CREATE TABLE IF NOT EXISTS elevage_health (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  date DATE NOT NULL,
  target VARCHAR(255) NOT NULL,
  intervention VARCHAR(255) NOT NULL,
  practitioner VARCHAR(255) DEFAULT '',
  cost NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_elevage_health_enterprise_date ON elevage_health(enterprise_id, date DESC);

-- DISCUSSIONS / MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  text TEXT DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(enterprise_id, timestamp DESC);

COMMIT;