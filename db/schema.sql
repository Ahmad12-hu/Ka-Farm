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

-- PÉPINIÈRES (Carnet de suivi des pépinières)
CREATE TABLE IF NOT EXISTS nurseries (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  crop_type VARCHAR(255) NOT NULL,
  sowing_date DATE,
  planned_transplant_date DATE,
  quantity_est INTEGER,
  number_of_seedlings INTEGER DEFAULT 0,
  surface_area NUMERIC DEFAULT 0,
  surface_unit VARCHAR(20) DEFAULT 'm2',
  estimated_germination_rate NUMERIC DEFAULT 0,
  actual_germination_rate NUMERIC DEFAULT 0,
  status VARCHAR(100) NOT NULL DEFAULT 'Semis',
  health_status VARCHAR(100) DEFAULT 'Excellent',
  transplant_alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nurseries_enterprise_id ON nurseries(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_nurseries_parcel ON nurseries(parcel_id);
CREATE INDEX IF NOT EXISTS idx_nurseries_transplant_date ON nurseries(enterprise_id, planned_transplant_date);

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

-- TRAITEMENTS PHYTOSANITAIRES (Carnet phytosanitaire & DAR)
CREATE TABLE IF NOT EXISTS traitements_phytosanitaires (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) NOT NULL,
  parcel_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date_applied DATE NOT NULL,
  dar_days INTEGER NOT NULL DEFAULT 0,
  target VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT '',
  harvest_ready BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_traitements_phytosanitaires_enterprise ON traitements_phytosanitaires(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_traitements_phytosanitaires_parcel ON traitements_phytosanitaires(parcel_id);
CREATE INDEX IF NOT EXISTS idx_traitements_phytosanitaires_crop ON traitements_phytosanitaires(crop_id);
CREATE INDEX IF NOT EXISTS idx_traitements_phytosanitaires_date ON traitements_phytosanitaires(enterprise_id, date_applied DESC);

-- RENTABILITÉ PAR CULTURE (Calculateur de rentabilité)
CREATE TABLE IF NOT EXISTS crop_profitability (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  crop_name VARCHAR(255) NOT NULL,
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  parcel_name VARCHAR(255) NOT NULL,
  yield_kg NUMERIC NOT NULL DEFAULT 0,
  price_per_kg NUMERIC NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  costs JSONB NOT NULL DEFAULT '{}',
  total_cost NUMERIC NOT NULL DEFAULT 0,
  net_margin NUMERIC NOT NULL DEFAULT 0,
  profitability_percent NUMERIC NOT NULL DEFAULT 0,
  period DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crop_profitability_enterprise ON crop_profitability(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_crop_profitability_crop ON crop_profitability(crop_name);
CREATE INDEX IF NOT EXISTS idx_crop_profitability_parcel ON crop_profitability(parcel_id);
CREATE INDEX IF NOT EXISTS idx_crop_profitability_margin ON crop_profitability(enterprise_id, net_margin DESC);

-- RÉCOLTES (Enregistrement des récoltes et rendements par parcelle)
CREATE TABLE IF NOT EXISTS harvests (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) NOT NULL,
  parcel_name VARCHAR(255) NOT NULL,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  quality VARCHAR(20) NOT NULL DEFAULT 'Choix A',
  harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  selling_price_per_kg NUMERIC DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_harvests_enterprise ON harvests(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_harvests_parcel ON harvests(parcel_id);
CREATE INDEX IF NOT EXISTS idx_harvests_crop ON harvests(crop_id);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(enterprise_id, harvest_date DESC);

-- MAIN-D'ŒUVRE TEMPORAIRE (Registre des journaliers)
CREATE TABLE IF NOT EXISTS daily_workers (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  worker_name VARCHAR(255) NOT NULL,
  worker_phone VARCHAR(100) DEFAULT '',
  task_performed VARCHAR(255) NOT NULL,
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  hours_worked NUMERIC DEFAULT 1,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Dû',
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_daily_workers_enterprise ON daily_workers(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_daily_workers_date ON daily_workers(enterprise_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_workers_status ON daily_workers(enterprise_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_daily_workers_parcel ON daily_workers(parcel_id);

-- STOCKS D'INTRANTS (Gestionnaire avec seuil d'alerte)
CREATE TABLE IF NOT EXISTS intrants (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity_available NUMERIC NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'kg',
  alert_threshold NUMERIC NOT NULL DEFAULT 0,
  last_restock_date DATE,
  next_restock_date DATE,
  supplier VARCHAR(255) DEFAULT '',
  supplier_contact VARCHAR(100) DEFAULT '',
  unit_price NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_intrants_enterprise ON intrants(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_intrants_category ON intrants(enterprise_id, category);
CREATE INDEX IF NOT EXISTS idx_intrants_alert ON intrants(enterprise_id) WHERE quantity_available <= alert_threshold;

-- ALERTES CLIMATIQUES (Système d'alertes locales pour événements extrêmes)
CREATE TABLE IF NOT EXISTS weather_alerts (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  alert_type VARCHAR(100) NOT NULL,
  trigger_threshold NUMERIC,
  trigger_unit VARCHAR(50) DEFAULT '',
  message TEXT NOT NULL,
  advice TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL DEFAULT 'Moyenne',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  region VARCHAR(100) DEFAULT 'Niayes',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_enterprise ON weather_alerts(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_active ON weather_alerts(enterprise_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_weather_alerts_type ON weather_alerts(enterprise_id, alert_type);

-- HISTORIQUE DES ALERTES DÉCLENCHÉES
CREATE TABLE IF NOT EXISTS weather_alert_history (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  alert_id VARCHAR(100) REFERENCES weather_alerts(id) ON DELETE SET NULL,
  trigger_value NUMERIC,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_weather_alert_history_enterprise ON weather_alert_history(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_weather_alert_history_triggered ON weather_alert_history(enterprise_id, triggered_at DESC);

-- VENTES DIRECTES (Registre des ventes sur les marchés locaux)
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  harvest_id VARCHAR(100) REFERENCES harvests(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) NOT NULL,
  market_destination VARCHAR(255) NOT NULL,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  unit_price_fcfa NUMERIC NOT NULL DEFAULT 0,
  total_amount_fcfa NUMERIC NOT NULL DEFAULT 0,
  intermediary_name VARCHAR(255) DEFAULT '',
  intermediary_phone VARCHAR(100) DEFAULT '',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Payé',
  deposit_fcfa NUMERIC DEFAULT 0,
  balance_fcfa NUMERIC DEFAULT 0,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_enterprise ON sales(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(enterprise_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_crop ON sales(enterprise_id, crop_name);
CREATE INDEX IF NOT EXISTS idx_sales_market ON sales(enterprise_id, market_destination);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(enterprise_id, payment_status);

-- DÉPENSES EN EAU (Suivi des dépenses en eau)
CREATE TABLE IF NOT EXISTS water_expenses (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  source_type VARCHAR(100) NOT NULL,
  amount_fcfa NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  associated_pumping_hours NUMERIC DEFAULT 0,
  pumping_rate_fcfa_per_hour NUMERIC DEFAULT 0,
  water_volume_m3 NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_water_expenses_enterprise ON water_expenses(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_water_expenses_date ON water_expenses(enterprise_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_expenses_parcel ON water_expenses(parcel_id);
CREATE INDEX IF NOT EXISTS idx_water_expenses_source ON water_expenses(enterprise_id, source_type);

-- DIAGNOSTIC CULTURES (Outil d'aide au diagnostic d'anomalies)
CREATE TABLE IF NOT EXISTS crop_diseases (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  crop_type VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  severity VARCHAR(50) DEFAULT 'Moyenne',
  is_common BOOLEAN NOT NULL DEFAULT FALSE,
  prevention_methods TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crop_diseases_enterprise ON crop_diseases(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_crop_diseases_crop ON crop_diseases(crop_type);

-- SYMPTÔMES
CREATE TABLE IF NOT EXISTS crop_symptoms (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  affected_part VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crop_symptoms_enterprise ON crop_symptoms(enterprise_id);

-- LIENS SYMPTÔMES -> MALADIES
CREATE TABLE IF NOT EXISTS disease_symptoms (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  disease_id VARCHAR(100) NOT NULL REFERENCES crop_diseases(id) ON DELETE CASCADE,
  symptom_id VARCHAR(100) NOT NULL REFERENCES crop_symptoms(id) ON DELETE CASCADE,
  weight NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_disease_symptoms_enterprise ON disease_symptoms(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_disease_symptoms_disease ON disease_symptoms(disease_id);

-- TRAITEMENTS RECOMMANDÉS
CREATE TABLE IF NOT EXISTS recommended_treatments (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  disease_id VARCHAR(100) NOT NULL REFERENCES crop_diseases(id) ON DELETE CASCADE,
  treatment_name VARCHAR(255) NOT NULL,
  treatment_type VARCHAR(100) NOT NULL,
  dosage TEXT DEFAULT '',
  application_method TEXT DEFAULT '',
  frequency TEXT DEFAULT '',
  is_organic BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recommended_treatments_enterprise ON recommended_treatments(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_recommended_treatments_disease ON recommended_treatments(disease_id);

-- HISTORIQUE DES DIAGNOSTICS
CREATE TABLE IF NOT EXISTS diagnostic_history (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  disease_id VARCHAR(100) REFERENCES crop_diseases(id) ON DELETE SET NULL,
  confidence_percent NUMERIC DEFAULT 0,
  diagnosis_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_diagnostic_history_enterprise ON diagnostic_history(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_history_date ON diagnostic_history(enterprise_id, diagnosis_date DESC);

-- ROTATION DES CULTURES (Planificateur anti-nématodes)
CREATE TABLE IF NOT EXISTS plant_families (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  min_rotation_years INTEGER DEFAULT 1,
  compatible_families TEXT[] DEFAULT '{}',
  incompatible_families TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_plant_families_enterprise ON plant_families(enterprise_id);

-- MAPPING CULTURES -> FAMILLES
CREATE TABLE IF NOT EXISTS crop_families (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  crop_name VARCHAR(255) NOT NULL,
  family_id VARCHAR(100) NOT NULL REFERENCES plant_families(id) ON DELETE CASCADE,
  family_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crop_families_enterprise ON crop_families(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_crop_families_crop ON crop_families(crop_name);

-- HISTORIQUE DE ROTATION PAR PARCELLE
CREATE TABLE IF NOT EXISTS rotation_history (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) NOT NULL,
  family_id VARCHAR(100) REFERENCES plant_families(id) ON DELETE SET NULL,
  family_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  warning_issued BOOLEAN NOT NULL DEFAULT FALSE,
  warning_message TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rotation_history_enterprise ON rotation_history(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_rotation_history_parcel ON rotation_history(parcel_id);
CREATE INDEX IF NOT EXISTS idx_rotation_history_family ON rotation_history(family_id);
CREATE INDEX IF NOT EXISTS idx_rotation_history_dates ON rotation_history(parcel_id, start_date DESC);

-- RÈGLES DE ROTATION
CREATE TABLE IF NOT EXISTS rotation_rules (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  family_id VARCHAR(100) NOT NULL REFERENCES plant_families(id) ON DELETE CASCADE,
  cannot_follow_family_id VARCHAR(100) REFERENCES plant_families(id) ON DELETE CASCADE,
  min_years_between INTEGER NOT NULL DEFAULT 1,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rotation_rules_enterprise ON rotation_rules(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_rotation_rules_family ON rotation_rules(family_id);

-- COMPOSTAGE ORGANIQUE (Calculateur personnalisé)
CREATE TABLE IF NOT EXISTS compost_materials (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  material_type VARCHAR(100) NOT NULL,
  carbon_ratio NUMERIC NOT NULL DEFAULT 0,
  nitrogen_ratio NUMERIC NOT NULL DEFAULT 0,
  c_n_ratio NUMERIC NOT NULL DEFAULT 0,
  moisture_content NUMERIC DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  description TEXT DEFAULT '',
  is_common_in_senegal BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_compost_materials_enterprise ON compost_materials(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_compost_materials_type ON compost_materials(material_type);

-- RECETTES DE COMPOST
CREATE TABLE IF NOT EXISTS compost_recipes (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  target_c_n_ratio NUMERIC DEFAULT 30,
  ideal_moisture NUMERIC DEFAULT 60,
  ideal_temperature_min NUMERIC DEFAULT 40,
  ideal_temperature_max NUMERIC DEFAULT 60,
  maturation_days INTEGER DEFAULT 90,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_compost_recipes_enterprise ON compost_recipes(enterprise_id);

-- INGRÉDIENTS DES RECETTES
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  recipe_id VARCHAR(100) NOT NULL REFERENCES compost_recipes(id) ON DELETE CASCADE,
  material_id VARCHAR(100) NOT NULL REFERENCES compost_materials(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  proportion_percent NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_enterprise ON recipe_ingredients(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

-- HISTORIQUE DE COMPOSTAGE
CREATE TABLE IF NOT EXISTS compost_history (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  recipe_id VARCHAR(100) REFERENCES compost_recipes(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  quantity_produced_kg NUMERIC DEFAULT 0,
  materials_used JSONB DEFAULT '{}',
  c_n_ratio_achieved NUMERIC DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'En cours',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_compost_history_enterprise ON compost_history(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_compost_history_status ON compost_history(enterprise_id, status);

-- TARIFS DE TRANSPORT (Simulateur de marge brute)
CREATE TABLE IF NOT EXISTS transport_rates (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  region_from VARCHAR(100) NOT NULL,
  region_to VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL DEFAULT 'Camion',
  rate_per_ton_fcfa NUMERIC NOT NULL DEFAULT 0,
  rate_per_km_fcfa NUMERIC DEFAULT 0,
  distance_km NUMERIC DEFAULT 0,
  min_load_kg NUMERIC DEFAULT 0,
  max_load_kg NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transport_rates_enterprise ON transport_rates(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_transport_rates_route ON transport_rates(region_from, region_to);

-- SIMULATIONS DE MARGE
CREATE TABLE IF NOT EXISTS margin_simulations (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  harvest_id VARCHAR(100) REFERENCES harvests(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) NOT NULL,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  selling_price_per_kg_fcfa NUMERIC NOT NULL DEFAULT 0,
  destination_region VARCHAR(100) NOT NULL,
  transport_cost_fcfa NUMERIC NOT NULL DEFAULT 0,
  other_costs_fcfa NUMERIC DEFAULT 0,
  gross_revenue_fcfa NUMERIC NOT NULL DEFAULT 0,
  net_revenue_fcfa NUMERIC NOT NULL DEFAULT 0,
  margin_percent NUMERIC NOT NULL DEFAULT 0,
  simulation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_margin_simulations_enterprise ON margin_simulations(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_margin_simulations_date ON margin_simulations(enterprise_id, simulation_date DESC);
CREATE INDEX IF NOT EXISTS idx_margin_simulations_crop ON margin_simulations(crop_name);

-- COMMANDES GROUPÉES D'INTRANTS (Module coopératif)
CREATE TABLE IF NOT EXISTS group_orders (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  group_name VARCHAR(255) NOT NULL,
  initiated_by VARCHAR(255) NOT NULL,
  supplier_id VARCHAR(100) DEFAULT '',
  supplier_name VARCHAR(255) DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'En cours',
  total_amount_fcfa NUMERIC NOT NULL DEFAULT 0,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  delivery_address TEXT DEFAULT '',
  region VARCHAR(100) NOT NULL DEFAULT 'Niayes',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_group_orders_enterprise ON group_orders(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_group_orders_status ON group_orders(enterprise_id, status);
CREATE INDEX IF NOT EXISTS idx_group_orders_region ON group_orders(region);

-- DÉTAILS DES COMMANDES PAR FERME
CREATE TABLE IF NOT EXISTS group_order_items (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  group_order_id VARCHAR(100) NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  farm_id VARCHAR(100) NOT NULL,
  farm_name VARCHAR(255) NOT NULL,
  intrant_id VARCHAR(100) REFERENCES intrants(id) ON DELETE SET NULL,
  intrant_name VARCHAR(255) NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'kg',
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  delivery_received BOOLEAN NOT NULL DEFAULT FALSE,
  received_quantity NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_group_order_items_enterprise ON group_order_items(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_group_order_items_group ON group_order_items(group_order_id);
CREATE INDEX IF NOT EXISTS idx_group_order_items_farm ON group_order_items(farm_id);

-- FERMES PAR RÉGION (pour la coopération)
CREATE TABLE IF NOT EXISTS farms_community (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  farm_name VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(100) DEFAULT '',
  contact_email VARCHAR(255) DEFAULT '',
  location TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_order_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_farms_community_enterprise ON farms_community(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_farms_community_region ON farms_community(region);

-- ÉQUIPEMENTS (Carnet de maintenance)
CREATE TABLE IF NOT EXISTS equipments (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100) NOT NULL,
  brand VARCHAR(255) DEFAULT '',
  model VARCHAR(255) DEFAULT '',
  serial_number VARCHAR(100) DEFAULT '',
  purchase_date DATE,
  purchase_price NUMERIC DEFAULT 0,
  location VARCHAR(255) DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'Actif',
  hours_used NUMERIC NOT NULL DEFAULT 0,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_hours NUMERIC DEFAULT 0,
  maintenance_interval_days INTEGER DEFAULT 0,
  assigned_to VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_equipments_enterprise ON equipments(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_equipments_type ON equipments(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipments_status ON equipments(status);
CREATE INDEX IF NOT EXISTS idx_equipments_maintenance ON equipments(next_maintenance_date);

-- HISTORIQUE DE MAINTENANCE
CREATE TABLE IF NOT EXISTS maintenance_history (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  equipment_id VARCHAR(100) NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(100) NOT NULL,
  maintenance_date DATE NOT NULL,
  description TEXT DEFAULT '',
  cost_fcfa NUMERIC DEFAULT 0,
  performed_by VARCHAR(255) DEFAULT '',
  parts_replaced TEXT[] DEFAULT '{}',
  hours_worked NUMERIC DEFAULT 0,
  next_maintenance_recommended DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_enterprise ON maintenance_history(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_equipment ON maintenance_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_date ON maintenance_history(equipment_id, maintenance_date DESC);

-- ALERTES DE MAINTENANCE
CREATE TABLE IF NOT EXISTS maintenance_alerts (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  equipment_id VARCHAR(100) NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL,
  trigger_hours NUMERIC,
  trigger_date DATE,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by VARCHAR(255),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_enterprise ON maintenance_alerts(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_active ON maintenance_alerts(enterprise_id, is_active) WHERE is_active = TRUE;

-- MICRO-CRÉDITS (Module de gestion des crédits et remboursements)
CREATE TABLE IF NOT EXISTS credits (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  creditor_name VARCHAR(255) NOT NULL,
  creditor_type VARCHAR(100) NOT NULL DEFAULT 'Banque',
  creditor_contact VARCHAR(255) DEFAULT '',
  loan_amount NUMERIC NOT NULL DEFAULT 0,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  interest_type VARCHAR(50) NOT NULL DEFAULT 'Annuel',
  loan_date DATE NOT NULL,
  first_payment_date DATE,
  maturity_date DATE,
  payment_frequency VARCHAR(50) NOT NULL DEFAULT 'Mensuel',
  total_installments INTEGER DEFAULT 0,
  installment_amount NUMERIC DEFAULT 0,
  purpose VARCHAR(255) DEFAULT '',
  collateral_description TEXT DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'Actif',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credits_enterprise ON credits(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_credits_creditor ON credits(creditor_name);
CREATE INDEX IF NOT EXISTS idx_credits_status ON credits(status);
CREATE INDEX IF NOT EXISTS idx_credits_maturity ON credits(maturity_date);

-- HISTORIQUE DES REMBOURSEMENTS
CREATE TABLE IF NOT EXISTS credit_payments (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  credit_id VARCHAR(100) NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  installment_number INTEGER,
  principal_portion NUMERIC DEFAULT 0,
  interest_portion NUMERIC DEFAULT 0,
  payment_method VARCHAR(100) DEFAULT 'Espèces',
  receipt_number VARCHAR(100) DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'Payé',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_payments_enterprise ON credit_payments(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_credit ON credit_payments(credit_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_date ON credit_payments(credit_id, payment_date DESC);

-- RÉSUMÉ DE L'ENCOURS DE DETTE
CREATE TABLE IF NOT EXISTS debt_summary (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_principal NUMERIC NOT NULL DEFAULT 0,
  total_interest NUMERIC NOT NULL DEFAULT 0,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  total_remaining NUMERIC NOT NULL DEFAULT 0,
  next_payment_due NUMERIC DEFAULT 0,
  next_payment_date DATE,
  debt_to_equity_ratio NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_debt_summary_enterprise ON debt_summary(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_debt_summary_date ON debt_summary(enterprise_id, calculation_date DESC);

-- DURÉES DE CONSERVATION (Module d'estimation post-récolte)
CREATE TABLE IF NOT EXISTS storage_lifespans (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  crop_name VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL DEFAULT 'Niayes',
  optimal_temperature_min NUMERIC DEFAULT 0,
  optimal_temperature_max NUMERIC DEFAULT 40,
  avg_temperature NUMERIC DEFAULT 25,
  shelf_life_days INTEGER NOT NULL DEFAULT 7,
  shelf_life_conditions TEXT DEFAULT '',
  warning_days_before INTEGER NOT NULL DEFAULT 3,
  storage_method VARCHAR(255) DEFAULT '',
  quality_degradation_rate NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_storage_lifespans_enterprise ON storage_lifespans(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_storage_lifespans_crop ON storage_lifespans(crop_name);
CREATE INDEX IF NOT EXISTS idx_storage_lifespans_region ON storage_lifespans(region);

-- STOCK RÉCOLTÉ AVEC SUIVI DE CONSERVATION
CREATE TABLE IF NOT EXISTS stored_harvests (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  harvest_id VARCHAR(100) NOT NULL REFERENCES harvests(id) ON DELETE CASCADE,
  crop_name VARCHAR(255) NOT NULL,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  storage_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_expiry_date DATE,
  actual_expiry_date DATE,
  storage_location VARCHAR(255) DEFAULT '',
  storage_conditions TEXT DEFAULT '',
  current_quality VARCHAR(20) DEFAULT 'Choix A',
  conservation_status VARCHAR(50) NOT NULL DEFAULT 'Bon',
  alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
  sold BOOLEAN NOT NULL DEFAULT FALSE,
  sale_id VARCHAR(100) REFERENCES sales(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stored_harvests_enterprise ON stored_harvests(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_stored_harvests_expiry ON stored_harvests(estimated_expiry_date);
CREATE INDEX IF NOT EXISTS idx_stored_harvests_status ON stored_harvests(conservation_status);
CREATE INDEX IF NOT EXISTS idx_stored_harvests_alert ON stored_harvests(enterprise_id, alert_sent) WHERE alert_sent = FALSE;

-- ALERTES DE CONSERVATION
CREATE TABLE IF NOT EXISTS conservation_alerts (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  stored_harvest_id VARCHAR(100) NOT NULL REFERENCES stored_harvests(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL DEFAULT 'Approche expiration',
  alert_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL DEFAULT 'Moyenne',
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by VARCHAR(255),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conservation_alerts_enterprise ON conservation_alerts(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_conservation_alerts_ack ON conservation_alerts(enterprise_id, acknowledged) WHERE acknowledged = FALSE;

-- DENSITÉS DE SEMI (Calculateur d'espacement des cultures)
CREATE TABLE IF NOT EXISTS seeding_densities (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  crop_name VARCHAR(255) NOT NULL,
  variety VARCHAR(255) DEFAULT '',
  row_spacing_cm NUMERIC NOT NULL DEFAULT 0,
  plant_spacing_cm NUMERIC NOT NULL DEFAULT 0,
  plants_per_m2 NUMERIC NOT NULL DEFAULT 0,
  seeds_per_hole NUMERIC NOT NULL DEFAULT 1,
  germination_rate_percent NUMERIC DEFAULT 90,
  seeds_per_kg NUMERIC DEFAULT 0,
  recommended_bed_width NUMERIC DEFAULT 100,
  plants_per_bed NUMERIC DEFAULT 0,
  source VARCHAR(255) DEFAULT 'ISRA',
  region VARCHAR(100) DEFAULT 'Niayes',
  season VARCHAR(50) DEFAULT 'Toutes',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seeding_densities_enterprise ON seeding_densities(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_seeding_densities_crop ON seeding_densities(crop_name);
CREATE INDEX IF NOT EXISTS idx_seeding_densities_region ON seeding_densities(region);

-- CALCULS DE SEMI
CREATE TABLE IF NOT EXISTS seeding_calculations (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) NOT NULL,
  seeding_density_id VARCHAR(100) REFERENCES seeding_densities(id) ON DELETE SET NULL,
  parcel_surface_m2 NUMERIC NOT NULL DEFAULT 0,
  parcel_length_m NUMERIC DEFAULT 0,
  parcel_width_m NUMERIC DEFAULT 0,
  number_of_beds INTEGER DEFAULT 0,
  bed_length_m NUMERIC DEFAULT 10,
  bed_width_m NUMERIC DEFAULT 1,
  calculated_row_spacing NUMERIC DEFAULT 0,
  calculated_plant_spacing NUMERIC DEFAULT 0,
  total_plants INTEGER DEFAULT 0,
  total_seeds_needed INTEGER DEFAULT 0,
  seeds_weight_kg NUMERIC DEFAULT 0,
  calculation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seeding_calculations_enterprise ON seeding_calculations(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_seeding_calculations_parcel ON seeding_calculations(parcel_id);
CREATE INDEX IF NOT EXISTS idx_seeding_calculations_crop ON seeding_calculations(crop_name);

-- BONS DE LIVRAISON (Journal des livraisons aux intermédiaires)
CREATE TABLE IF NOT EXISTS delivery_notes (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  note_number VARCHAR(100) NOT NULL,
  intermediary_name VARCHAR(255) NOT NULL,
  intermediary_phone VARCHAR(100) NOT NULL,
  intermediary_address TEXT DEFAULT '',
  harvest_id VARCHAR(100) REFERENCES harvests(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) NOT NULL,
  quantity_delivered_kg NUMERIC NOT NULL DEFAULT 0,
  unit_price_fcfa NUMERIC NOT NULL DEFAULT 0,
  total_amount_fcfa NUMERIC NOT NULL DEFAULT 0,
  deposit_paid_fcfa NUMERIC NOT NULL DEFAULT 0,
  balance_due_fcfa NUMERIC NOT NULL DEFAULT 0,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Non payé',
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_time TIME DEFAULT NULL,
  delivery_location TEXT DEFAULT '',
  vehicle_number VARCHAR(100) DEFAULT '',
  driver_name VARCHAR(255) DEFAULT '',
  whatsapp_message TEXT DEFAULT '',
  is_exported BOOLEAN NOT NULL DEFAULT FALSE,
  export_date TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_enterprise ON delivery_notes(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_intermediary ON delivery_notes(intermediary_name);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_status ON delivery_notes(payment_status);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_date ON delivery_notes(enterprise_id, delivery_date DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_note_number ON delivery_notes(note_number);

-- PAIEMENTS DES BONS DE LIVRAISON
CREATE TABLE IF NOT EXISTS delivery_payments (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  delivery_note_id VARCHAR(100) NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  payment_method VARCHAR(100) NOT NULL DEFAULT 'Espèces',
  receipt_number VARCHAR(100) DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_delivery_payments_enterprise ON delivery_payments(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_delivery_payments_delivery ON delivery_payments(delivery_note_id);
CREATE INDEX IF NOT EXISTS idx_delivery_payments_date ON delivery_payments(delivery_note_id, payment_date DESC);

-- INTERMÉDIAIRES (Bana-Bana)
CREATE TABLE IF NOT EXISTS intermediaries (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  secondary_phone VARCHAR(100) DEFAULT '',
  whatsapp_number VARCHAR(100) DEFAULT '',
  address TEXT DEFAULT '',
  market VARCHAR(255) DEFAULT '',
  company_name VARCHAR(255) DEFAULT '',
  payment_terms VARCHAR(255) DEFAULT '',
  reliability_rating INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_amount_fcfa NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_intermediaries_enterprise ON intermediaries(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_intermediaries_phone ON intermediaries(phone);
CREATE INDEX IF NOT EXISTS idx_intermediaries_name ON intermediaries(name);

-- DIAGNOSTIC IA PAR IMAGES (Module d'analyse de maladies)
CREATE TABLE IF NOT EXISTS ai_diagnosis_requests (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  request_id VARCHAR(100) NOT NULL,
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  crop_name VARCHAR(255) NOT NULL,
  parcel_name VARCHAR(255) DEFAULT '',
  image_url TEXT NOT NULL,
  image_base64 TEXT,
  image_metadata JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'En attente',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  api_response JSONB DEFAULT '{}',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_diagnosis_enterprise ON ai_diagnosis_requests(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_ai_diagnosis_status ON ai_diagnosis_requests(status);
CREATE INDEX IF NOT EXISTS idx_ai_diagnosis_submitted ON ai_diagnosis_requests(enterprise_id, submitted_at DESC);

-- RÉSULTATS DE DIAGNOSTIC IA
CREATE TABLE IF NOT EXISTS ai_diagnosis_results (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  request_id VARCHAR(100) NOT NULL REFERENCES ai_diagnosis_requests(id) ON DELETE CASCADE,
  primary_disease VARCHAR(255) DEFAULT '',
  confidence_percent NUMERIC DEFAULT 0,
  disease_id VARCHAR(100) REFERENCES crop_diseases(id) ON DELETE SET NULL,
  detected_diseases JSONB DEFAULT '{}',
  detected_pests JSONB DEFAULT '{}',
  detected_deficiencies JSONB DEFAULT '{}',
  severity_level VARCHAR(50) DEFAULT '',
  recommended_actions JSONB DEFAULT '{}',
  treatment_suggestions JSONB DEFAULT '{}',
  urgency VARCHAR(50) DEFAULT 'Moyenne',
  farmer_action_taken BOOLEAN NOT NULL DEFAULT FALSE,
  action_date TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_diagnosis_results_enterprise ON ai_diagnosis_results(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_ai_diagnosis_results_request ON ai_diagnosis_results(request_id);

-- PARAMÈTRES D'API IA
CREATE TABLE IF NOT EXISTS ai_api_config (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  api_name VARCHAR(100) NOT NULL DEFAULT 'Gemini',
  api_endpoint TEXT NOT NULL,
  api_key_encrypted TEXT,
  model_name VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  max_tokens INTEGER DEFAULT 4096,
  temperature NUMERIC DEFAULT 0.7,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  total_requests INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_api_config_enterprise ON ai_api_config(enterprise_id);

-- PRIX DES MARCHÉS (Analyse prédictive)
CREATE TABLE IF NOT EXISTS market_prices (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  market_name VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL,
  crop_name VARCHAR(255) NOT NULL,
  quality VARCHAR(50) DEFAULT 'Choix A',
  price_per_kg_fcfa NUMERIC NOT NULL DEFAULT 0,
  price_per_ton_fcfa NUMERIC NOT NULL DEFAULT 0,
  price_date DATE NOT NULL,
  price_source VARCHAR(100) DEFAULT 'SIM',
  is_estimated BOOLEAN NOT NULL DEFAULT FALSE,
  season VARCHAR(50) DEFAULT '',
  supply_level VARCHAR(50) DEFAULT 'Normale',
  demand_level VARCHAR(50) DEFAULT 'Normale',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_market_prices_enterprise ON market_prices(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_market ON market_prices(market_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(crop_name, price_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_prices_region ON market_prices(region, crop_name);

-- TENDANCES SAISONNIÈRES
CREATE TABLE IF NOT EXISTS season_trends (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  region VARCHAR(100) NOT NULL,
  crop_name VARCHAR(255) NOT NULL,
  season VARCHAR(50) NOT NULL,
  avg_price NUMERIC NOT NULL DEFAULT 0,
  min_price NUMERIC NOT NULL DEFAULT 0,
  max_price NUMERIC NOT NULL DEFAULT 0,
  std_deviation NUMERIC DEFAULT 0,
  trend_direction VARCHAR(20) DEFAULT 'Stable',
  trend_strength NUMERIC DEFAULT 0,
  prediction_next_month NUMERIC DEFAULT 0,
  confidence_percent NUMERIC DEFAULT 0,
  data_points INTEGER DEFAULT 0,
  last_updated DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_season_trends_enterprise ON season_trends(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_season_trends_region_crop ON season_trends(region, crop_name);
CREATE INDEX IF NOT EXISTS idx_season_trends_season ON season_trends(season);

-- ALERTES DE PRIX
CREATE TABLE IF NOT EXISTS price_alerts (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  market_name VARCHAR(255) NOT NULL,
  crop_name VARCHAR(255) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  threshold_price NUMERIC NOT NULL,
  current_price NUMERIC DEFAULT 0,
  trigger_date TIMESTAMPTZ,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by VARCHAR(255),
  acknowledged_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_price_alerts_enterprise ON price_alerts(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(enterprise_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_price_alerts_crop ON price_alerts(crop_name);

-- HUMIDITÉ DU SOL (Optimisation de l'arrosage virtuel)
CREATE TABLE IF NOT EXISTS soil_moisture_config (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
  soil_type VARCHAR(100) NOT NULL,
  field_capacity NUMERIC NOT NULL DEFAULT 30,
  wilting_point NUMERIC NOT NULL DEFAULT 15,
  saturation_point NUMERIC NOT NULL DEFAULT 100,
  infiltration_rate NUMERIC NOT NULL DEFAULT 10,
  drainage_rate NUMERIC NOT NULL DEFAULT 5,
  root_depth_cm NUMERIC NOT NULL DEFAULT 30,
  crop_water_requirement NUMERIC NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_soil_moisture_config_enterprise ON soil_moisture_config(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_soil_moisture_config_parcel ON soil_moisture_config(parcel_id);

-- DONNÉES MÉTÉO QUOTIDIENNES
CREATE TABLE IF NOT EXISTS daily_weather (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  region VARCHAR(100) NOT NULL,
  weather_date DATE NOT NULL,
  temperature_min NUMERIC NOT NULL DEFAULT 20,
  temperature_max NUMERIC NOT NULL DEFAULT 35,
  temperature_avg NUMERIC NOT NULL DEFAULT 25,
  humidity_percent NUMERIC NOT NULL DEFAULT 60,
  wind_speed_kmh NUMERIC NOT NULL DEFAULT 10,
  solar_radiation NUMERIC NOT NULL DEFAULT 500,
  rainfall_mm NUMERIC NOT NULL DEFAULT 0,
  evapotranspiration NUMERIC NOT NULL DEFAULT 5,
  weather_source VARCHAR(100) DEFAULT 'Météo Sénégal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_daily_weather_enterprise ON daily_weather(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_daily_weather_region_date ON daily_weather(region, weather_date);

-- SUIVI DE L'HUMIDITÉ ESTIMÉE
CREATE TABLE IF NOT EXISTS moisture_tracking (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  tracking_date DATE NOT NULL,
  tracking_time TIME NOT NULL DEFAULT CURRENT_TIME,
  estimated_moisture_percent NUMERIC NOT NULL DEFAULT 50,
  moisture_status VARCHAR(50) NOT NULL DEFAULT 'Optimal',
  water_added_mm NUMERIC DEFAULT 0,
  evapotranspiration_mm NUMERIC DEFAULT 0,
  rainfall_mm NUMERIC DEFAULT 0,
  drainage_mm NUMERIC DEFAULT 0,
  water_balance NUMERIC DEFAULT 0,
  irrigation_recommendation TEXT DEFAULT '',
  next_irrigation_date DATE,
  next_irrigation_amount_mm NUMERIC DEFAULT 0,
  alert_level VARCHAR(20) DEFAULT 'Aucun',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_moisture_tracking_enterprise ON moisture_tracking(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_moisture_tracking_parcel ON moisture_tracking(parcel_id);
CREATE INDEX IF NOT EXISTS idx_moisture_tracking_date ON moisture_tracking(parcel_id, tracking_date DESC);
CREATE INDEX IF NOT EXISTS idx_moisture_tracking_status ON moisture_tracking(moisture_status);

-- HISTORIQUE D'IRRIGATION
CREATE TABLE IF NOT EXISTS irrigation_history (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  irrigation_date DATE NOT NULL,
  irrigation_time TIME,
  duration_minutes NUMERIC NOT NULL DEFAULT 0,
  water_volume_m3 NUMERIC NOT NULL DEFAULT 0,
  water_volume_mm NUMERIC NOT NULL DEFAULT 0,
  method VARCHAR(100) NOT NULL DEFAULT 'Goutte-à-goutte',
  performed_by VARCHAR(255) DEFAULT '',
  cost_fcfa NUMERIC DEFAULT 0,
  moisture_before NUMERIC DEFAULT 0,
  moisture_after NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_irrigation_history_enterprise ON irrigation_history(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_history_parcel ON irrigation_history(parcel_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_history_date ON irrigation_history(parcel_id, irrigation_date DESC);

-- CARTOGRAPHIE DE L'EXPLOITATION (Plan interactif Bento-Grid)
CREATE TABLE IF NOT EXISTS farm_map_config (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  map_name VARCHAR(255) NOT NULL DEFAULT 'Carte de la ferme',
  layout_type VARCHAR(50) NOT NULL DEFAULT 'Grid',
  grid_columns INTEGER NOT NULL DEFAULT 3,
  grid_rows INTEGER NOT NULL DEFAULT 3,
  cell_width_px INTEGER NOT NULL DEFAULT 200,
  cell_height_px INTEGER NOT NULL DEFAULT 150,
  show_parcel_names BOOLEAN NOT NULL DEFAULT TRUE,
  show_crop_status BOOLEAN NOT NULL DEFAULT TRUE,
  show_irrigation_status BOOLEAN NOT NULL DEFAULT TRUE,
  color_scheme VARCHAR(50) NOT NULL DEFAULT 'Vert',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_farm_map_config_enterprise ON farm_map_config(enterprise_id);

-- POSITIONS DES PARCELLES SUR LA CARTE
CREATE TABLE IF NOT EXISTS parcel_positions (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
  grid_row INTEGER NOT NULL,
  grid_column INTEGER NOT NULL,
  grid_span_rows INTEGER NOT NULL DEFAULT 1,
  grid_span_columns INTEGER NOT NULL DEFAULT 1,
  x_position NUMERIC DEFAULT 0,
  y_position NUMERIC DEFAULT 0,
  width_px NUMERIC DEFAULT 200,
  height_px NUMERIC DEFAULT 150,
  rotation_degrees NUMERIC DEFAULT 0,
  color VARCHAR(20) NOT NULL DEFAULT '#4CAF50',
  border_color VARCHAR(20) NOT NULL DEFAULT '#2E7D32',
  border_width INTEGER NOT NULL DEFAULT 2,
  label_position VARCHAR(20) NOT NULL DEFAULT 'centre',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_parcel_positions_enterprise ON parcel_positions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_parcel_positions_parcel ON parcel_positions(parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcel_positions_grid ON parcel_positions(grid_row, grid_column);

-- STATUTS VISUELS DES PARCELLES
CREATE TABLE IF NOT EXISTS parcel_visual_status (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  parcel_id VARCHAR(100) NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
  status_type VARCHAR(50) NOT NULL,
  status_value VARCHAR(100) NOT NULL,
  color_code VARCHAR(20) NOT NULL DEFAULT '#4CAF50',
  icon_name VARCHAR(50) DEFAULT '',
  tooltip_text TEXT DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 1,
  is_blinking BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_parcel_visual_status_enterprise ON parcel_visual_status(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_parcel_visual_status_parcel ON parcel_visual_status(parcel_id);

-- LÉGENDE DE LA CARTE
CREATE TABLE IF NOT EXISTS map_legend (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  item_type VARCHAR(50) NOT NULL,
  item_value VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  color VARCHAR(20) NOT NULL,
  icon VARCHAR(50) DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_map_legend_enterprise ON map_legend(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_map_legend_type ON map_legend(item_type);

-- BOURSE D'OUTILS AGRICOLES (Partage et location)
CREATE TABLE IF NOT EXISTS tools_sharing (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  tool_name VARCHAR(255) NOT NULL,
  tool_type VARCHAR(100) NOT NULL,
  brand VARCHAR(255) DEFAULT '',
  model VARCHAR(255) DEFAULT '',
  purchase_year INTEGER DEFAULT 0,
  condition VARCHAR(50) NOT NULL DEFAULT 'Bon état',
  description TEXT DEFAULT '',
  daily_rental_price_fcfa NUMERIC NOT NULL DEFAULT 0,
  hourly_rental_price_fcfa NUMERIC DEFAULT 0,
  minimum_rental_hours NUMERIC DEFAULT 1,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  owner_farm_id VARCHAR(100) NOT NULL,
  owner_farm_name VARCHAR(255) NOT NULL,
  owner_contact_name VARCHAR(255) NOT NULL,
  owner_phone VARCHAR(100) NOT NULL,
  owner_location VARCHAR(255) NOT NULL,
  owner_lat NUMERIC,
  owner_lng NUMERIC,
  region VARCHAR(100) NOT NULL,
  usage_instructions TEXT DEFAULT '',
  maintenance_requirements TEXT DEFAULT '',
  insurance_required BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_required NUMERIC DEFAULT 0,
  total_rentals INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tools_sharing_enterprise ON tools_sharing(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_tools_sharing_type ON tools_sharing(tool_type);
CREATE INDEX IF NOT EXISTS idx_tools_sharing_available ON tools_sharing(enterprise_id, is_available) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_tools_sharing_owner ON tools_sharing(owner_farm_id);
CREATE INDEX IF NOT EXISTS idx_tools_sharing_region ON tools_sharing(region);

-- LOCATIONS (Réservations)
CREATE TABLE IF NOT EXISTS tool_rentals (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  tool_id VARCHAR(100) NOT NULL REFERENCES tools_sharing(id) ON DELETE CASCADE,
  renter_farm_id VARCHAR(100) NOT NULL,
  renter_farm_name VARCHAR(255) NOT NULL,
  renter_contact_name VARCHAR(255) NOT NULL,
  renter_phone VARCHAR(100) NOT NULL,
  rental_start DATETIME NOT NULL,
  rental_end DATETIME NOT NULL,
  total_hours NUMERIC NOT NULL DEFAULT 0,
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  total_amount_fcfa NUMERIC NOT NULL DEFAULT 0,
  deposit_paid_fcfa NUMERIC DEFAULT 0,
  balance_due_fcfa NUMERIC DEFAULT 0,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'En attente',
  pickup_location VARCHAR(255) DEFAULT '',
  return_location VARCHAR(255) DEFAULT '',
  actual_return DATETIME,
  condition_on_return VARCHAR(50) DEFAULT 'Bon état',
  damage_noted TEXT DEFAULT '',
  damage_cost NUMERIC DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Confirmée',
  cancellation_reason TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tool_rentals_enterprise ON tool_rentals(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_tool_rentals_tool ON tool_rentals(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_rentals_renter ON tool_rentals(renter_farm_id);
CREATE INDEX IF NOT EXISTS idx_tool_rentals_dates ON tool_rentals(rental_start, rental_end);
CREATE INDEX IF NOT EXISTS idx_tool_rentals_status ON tool_rentals(status);

-- FAVORIS ET RECOMMANDATIONS
CREATE TABLE IF NOT EXISTS tool_favorites (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  farm_id VARCHAR(100) NOT NULL,
  tool_id VARCHAR(100) NOT NULL REFERENCES tools_sharing(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tool_favorites_enterprise ON tool_favorites(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_tool_favorites_farm_tool ON tool_favorites(farm_id, tool_id);

-- REVIEWS DES OUTILS
CREATE TABLE IF NOT EXISTS tool_reviews (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  rental_id VARCHAR(100) NOT NULL REFERENCES tool_rentals(id) ON DELETE CASCADE,
  tool_id VARCHAR(100) NOT NULL REFERENCES tools_sharing(id) ON DELETE CASCADE,
  renter_farm_id VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT DEFAULT '',
  would_rent_again BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_enterprise ON tool_reviews(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_tool ON tool_reviews(tool_id);

-- RAPPORTS D'EXPLOITATION (Générateur automatique)
CREATE TABLE IF NOT EXISTS report_templates (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL DEFAULT 'Financier',
  description TEXT DEFAULT '',
  header_json JSONB DEFAULT '{}',
  sections_json JSONB DEFAULT '{}',
  footer_json JSONB DEFAULT '{}',
  styles TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by VARCHAR(255) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_report_templates_enterprise ON report_templates(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(template_type);

-- RAPPORTS GÉNÉRÉS
CREATE TABLE IF NOT EXISTS generated_reports (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  template_id VARCHAR(100) REFERENCES report_templates(id) ON DELETE SET NULL,
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL DEFAULT 'Financier',
  period_start DATE,
  period_end DATE,
  report_data JSONB NOT NULL DEFAULT '{}',
  summary JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'Brouillon',
  file_path TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_format VARCHAR(20) DEFAULT 'HTML',
  file_size_bytes INTEGER DEFAULT 0,
  generated_by VARCHAR(255) DEFAULT '',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exported_at TIMESTAMPTZ,
  sent_to_email TEXT DEFAULT '',
  sent_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_generated_reports_enterprise ON generated_reports(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_generated_reports_period ON generated_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_generated_reports_status ON generated_reports(status);

-- CONFIGURATION DES EN-TÊTES DE RAPPORTS
CREATE TABLE IF NOT EXISTS report_headers (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  farm_name VARCHAR(255) NOT NULL,
  farm_logo TEXT DEFAULT '',
  farm_address TEXT DEFAULT '',
  farm_phone VARCHAR(100) DEFAULT '',
  farm_email VARCHAR(255) DEFAULT '',
  farm_registration_number VARCHAR(100) DEFAULT '',
  tax_id VARCHAR(100) DEFAULT '',
  owner_name VARCHAR(255) NOT NULL,
  owner_title VARCHAR(100) DEFAULT '',
  report_title VARCHAR(255) DEFAULT '',
  report_subtitle VARCHAR(255) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_report_headers_enterprise ON report_headers(enterprise_id);

-- PLANIFICATION DES RAPPORTS AUTOMATIQUES
CREATE TABLE IF NOT EXISTS report_schedules (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  template_id VARCHAR(100) NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  schedule_name VARCHAR(255) NOT NULL,
  frequency VARCHAR(50) NOT NULL DEFAULT 'Mensuel',
  next_run_date DATE,
  last_run_date DATE,
  start_time TIME DEFAULT CURRENT_TIME,
  recipients TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_report_schedules_enterprise ON report_schedules(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON report_schedules(enterprise_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run_date);

-- PRATIQUES AGROÉCOLOGIQUES (Suivi et score)
CREATE TABLE IF NOT EXISTS eco_practices (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  practice_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  max_points INTEGER NOT NULL DEFAULT 100,
  weight NUMERIC NOT NULL DEFAULT 1,
  measurement_unit VARCHAR(50) DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eco_practices_enterprise ON eco_practices(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_eco_practices_category ON eco_practices(category);

-- ÉVALUATIONS AGROÉCOLOGIQUES
CREATE TABLE IF NOT EXISTS eco_assessments (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  assessor_name VARCHAR(255) DEFAULT '',
  total_score INTEGER NOT NULL DEFAULT 0,
  max_possible_score INTEGER NOT NULL DEFAULT 1000,
  percentage NUMERIC NOT NULL DEFAULT 0,
  grade VARCHAR(50) DEFAULT 'D',
  carbon_footprint_kg CO2e NUMERIC DEFAULT 0,
  biodiversity_index NUMERIC DEFAULT 0,
  soil_health_score NUMERIC DEFAULT 0,
  water_efficiency_score NUMERIC DEFAULT 0,
  chemical_reduction_percent NUMERIC DEFAULT 0,
  organic_input_percent NUMERIC DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Validé',
  certificate_number VARCHAR(100) DEFAULT '',
  certificate_expiry DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eco_assessments_enterprise ON eco_assessments(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_eco_assessments_date ON eco_assessments(enterprise_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_eco_assessments_score ON eco_assessments(enterprise_id, total_score DESC);

-- DÉTAILS DES SCORES PAR PRATIQUE
CREATE TABLE IF NOT EXISTS eco_assessment_details (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  assessment_id VARCHAR(100) NOT NULL REFERENCES eco_assessments(id) ON DELETE CASCADE,
  practice_id VARCHAR(100) NOT NULL REFERENCES eco_practices(id) ON DELETE CASCADE,
  practice_value NUMERIC NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  evidence_description TEXT DEFAULT '',
  evidence_file TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eco_assessment_details_enterprise ON eco_assessment_details(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_eco_assessment_details_assessment ON eco_assessment_details(assessment_id);

-- ACTIONS AGROÉCOLOGIQUES
CREATE TABLE IF NOT EXISTS eco_actions (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  action_name VARCHAR(255) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  practice_id VARCHAR(100) REFERENCES eco_practices(id) ON DELETE SET NULL,
  quantity NUMERIC DEFAULT 0,
  unit VARCHAR(50) DEFAULT '',
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cost_fcfa NUMERIC DEFAULT 0,
  impact_score INTEGER DEFAULT 0,
  impact_description TEXT DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'Complétée',
  parcel_id VARCHAR(100) REFERENCES parcelles(id) ON DELETE SET NULL,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eco_actions_enterprise ON eco_actions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_eco_actions_date ON eco_actions(enterprise_id, action_date DESC);
CREATE INDEX IF NOT EXISTS idx_eco_actions_type ON eco_actions(action_type);

-- CERTIFICATS ET LABELS
CREATE TABLE IF NOT EXISTS eco_certifications (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  certification_name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255) NOT NULL,
  certificate_number VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Actif',
  verification_url TEXT DEFAULT '',
  certificate_file TEXT DEFAULT '',
  score_achieved NUMERIC DEFAULT 0,
  max_score NUMERIC DEFAULT 100,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eco_certifications_enterprise ON eco_certifications(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_eco_certifications_status ON eco_certifications(status);
CREATE INDEX IF NOT EXISTS idx_eco_certifications_expiry ON eco_certifications(expiry_date);

-- SYNCHRONISATION HORS-LIGNE (Mode Offline-First)
CREATE TABLE IF NOT EXISTS sync_queue (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  operation_type VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  data_json JSONB NOT NULL DEFAULT '{}',
  old_data_json JSONB DEFAULT '{}',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'En attente',
  error_message TEXT DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 1,
  created_by VARCHAR(255) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sync_queue_enterprise ON sync_queue(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(enterprise_id, status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_sync_queue_next_attempt ON sync_queue(next_attempt_at);

-- CONFLITS DE SYNCHRONISATION
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  local_data JSONB NOT NULL DEFAULT '{}',
  server_data JSONB DEFAULT '{}',
  conflict_type VARCHAR(50) NOT NULL DEFAULT 'Update',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255) DEFAULT '',
  resolution_type VARCHAR(50) DEFAULT '',
  resolved_data JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'Non résolu',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_enterprise ON sync_conflicts(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(status);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_table ON sync_conflicts(table_name, record_id);

-- STATUS DE SYNCHRONISATION
CREATE TABLE IF NOT EXISTS sync_status (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  last_sync_at TIMESTAMPTZ,
  last_successful_sync_at TIMESTAMPTZ,
  sync_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  total_pending INTEGER NOT NULL DEFAULT 0,
  total_resolved INTEGER NOT NULL DEFAULT 0,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  last_online_at TIMESTAMPTZ,
  last_offline_at TIMESTAMPTZ,
  device_info TEXT DEFAULT '',
  app_version VARCHAR(50) DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sync_status_enterprise ON sync_status(enterprise_id);

-- ACTIONS OFFLINE (Audit)
CREATE TABLE IF NOT EXISTS offline_actions (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  action_type VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) DEFAULT '',
  record_id VARCHAR(100) DEFAULT '',
  data_json JSONB DEFAULT '{}',
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  performed_by VARCHAR(255) DEFAULT '',
  ip_address VARCHAR(100) DEFAULT '',
  device_type VARCHAR(50) DEFAULT '',
  location_lat NUMERIC,
  location_lng NUMERIC,
  battery_level INTEGER,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_offline_actions_enterprise ON offline_actions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_offline_actions_type ON offline_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_offline_actions_performed ON offline_actions(performed_at DESC);

-- MESSAGERIE HORTICOLE (Chat avec conseillers ANCAR/ISRA)
CREATE TABLE IF NOT EXISTS advisors (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  advisor_id VARCHAR(100) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100) DEFAULT '',
  organization VARCHAR(100) NOT NULL,
  organization_code VARCHAR(50) DEFAULT '',
  specialty TEXT[] DEFAULT '{}',
  region VARCHAR(100) NOT NULL,
  zone_coverage TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at TIMESTAMPTZ,
  rating NUMERIC DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  avatar_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_advisors_enterprise ON advisors(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_advisors_organization ON advisors(organization);
CREATE INDEX IF NOT EXISTS idx_advisors_region ON advisors(region);
CREATE INDEX IF NOT EXISTS idx_advisors_available ON advisors(is_available);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  farm_id VARCHAR(100) NOT NULL,
  advisor_id VARCHAR(100) NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  conversation_type VARCHAR(50) NOT NULL DEFAULT 'Technique',
  status VARCHAR(50) NOT NULL DEFAULT 'Ouverte',
  priority VARCHAR(20) NOT NULL DEFAULT 'Normale',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  total_messages INTEGER DEFAULT 0,
  farm_data_attached BOOLEAN NOT NULL DEFAULT FALSE,
  resolution_rating INTEGER,
  resolution_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversations_enterprise ON conversations(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_conversations_farm ON conversations(farm_id);
CREATE INDEX IF NOT EXISTS idx_conversations_advisor ON conversations(advisor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- MESSAGES DE LA MESSAGERIE
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  conversation_id VARCHAR(100) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL,
  sender_id VARCHAR(100) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  message_text TEXT NOT NULL,
  is_rich_text BOOLEAN NOT NULL DEFAULT FALSE,
  attachments JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(50) NOT NULL DEFAULT 'Envoyé',
  parent_message_id VARCHAR(100) DEFAULT '',
  message_type VARCHAR(50) DEFAULT 'texte',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_enterprise ON chat_messages(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent ON chat_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(conversation_id, read_at) WHERE read_at IS NULL;

-- PIÈCES JOINTES
CREATE TABLE IF NOT EXISTS chat_attachments (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  message_id VARCHAR(100) NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  is_image BOOLEAN NOT NULL DEFAULT FALSE,
  is_document BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by VARCHAR(255) NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_enterprise ON chat_attachments(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments(message_id);

-- RACCORCIS (Shortcuts)
CREATE TABLE IF NOT EXISTS quick_replies (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  shortcut VARCHAR(50) NOT NULL,
  response_text TEXT NOT NULL,
  category VARCHAR(100) DEFAULT '',
  advisor_id VARCHAR(100) REFERENCES advisors(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quick_replies_enterprise ON quick_replies(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_shortcut ON quick_replies(shortcut);

-- PARRAINAGE DE PARCELLES (Financement participatif par la diaspora)
CREATE TABLE IF NOT EXISTS investors (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  investor_id VARCHAR(100) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100) DEFAULT '',
  whatsapp VARCHAR(100) DEFAULT '',
  address TEXT DEFAULT '',
  city VARCHAR(255) DEFAULT '',
  country VARCHAR(100) DEFAULT 'Sénégal',
  diaspora_country VARCHAR(100) DEFAULT '',
  investor_type VARCHAR(50) NOT NULL DEFAULT 'Particulier',
  kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
  kyc_document TEXT DEFAULT '',
  preferred_language VARCHAR(20) DEFAULT 'fr',
  total_invested NUMERIC DEFAULT 0,
  total_returns NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_investors_enterprise ON investors(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
CREATE INDEX IF NOT EXISTS idx_investors_country ON investors(country);
CREATE INDEX IF NOT EXISTS idx_investors_active ON investors(is_active);

-- PARRAINAGES
CREATE TABLE IF NOT EXISTS sponsorships (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  sponsor_id VARCHAR(100) NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  parcel_id VARCHAR(100) NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
  crop_id VARCHAR(100) REFERENCES crops(id) ON DELETE SET NULL,
  sponsorship_name VARCHAR(255) NOT NULL,
  amount_allocated NUMERIC NOT NULL DEFAULT 0,
  expected_return_percent NUMERIC DEFAULT 0,
  return_type VARCHAR(50) NOT NULL DEFAULT 'Partage récolte',
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_status VARCHAR(50) NOT NULL DEFAULT 'Semis',
  progress_percent NUMERIC DEFAULT 0,
  current_phase VARCHAR(100) DEFAULT '',
  updates_frequency VARCHAR(50) DEFAULT 'Hebdomadaire',
  auto_send_updates BOOLEAN NOT NULL DEFAULT TRUE,
  last_update_sent TIMESTAMPTZ,
  total_updates_sent INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Actif',
  contract_file TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sponsorships_enterprise ON sponsorships(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsor ON sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_parcel ON sponsorships(parcel_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_cycle ON sponsorships(cycle_status);

-- MISES À JOUR POUR INVESTISSEURS
CREATE TABLE IF NOT EXISTS sponsorship_updates (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  sponsorship_id VARCHAR(100) NOT NULL REFERENCES sponsorships(id) ON DELETE CASCADE,
  update_type VARCHAR(100) NOT NULL,
  update_title VARCHAR(255) NOT NULL,
  update_message TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  progress_data JSONB DEFAULT '{}',
  expenses_data JSONB DEFAULT '{}',
  harvest_data JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  investor_feedback TEXT DEFAULT '',
  feedback_rating INTEGER,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sponsorship_updates_enterprise ON sponsorship_updates(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_updates_sponsorship ON sponsorship_updates(sponsorship_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_updates_sent ON sponsorship_updates(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsorship_updates_unread ON sponsorship_updates(sponsorship_id, read_at) WHERE read_at IS NULL;

-- PAIEMENTS ET RETOURS
CREATE TABLE IF NOT EXISTS sponsorship_payments (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  sponsorship_id VARCHAR(100) NOT NULL REFERENCES sponsorships(id) ON DELETE CASCADE,
  payment_type VARCHAR(50) NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(100) DEFAULT 'Virement',
  transaction_reference VARCHAR(255) DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'Complété',
  related_harvest_id VARCHAR(100) REFERENCES harvests(id) ON DELETE SET NULL,
  related_sale_id VARCHAR(100) REFERENCES sales(id) ON DELETE SET NULL,
  description TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sponsorship_payments_enterprise ON sponsorship_payments(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_payments_sponsorship ON sponsorship_payments(sponsorship_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_payments_date ON sponsorship_payments(payment_date DESC);

-- TABLEAU DE BORD INVESTISSEUR
CREATE TABLE IF NOT EXISTS investor_dashboard (
  id VARCHAR(100) PRIMARY KEY,
  enterprise_id VARCHAR(100) NOT NULL DEFAULT 'ka_farm',
  investor_id VARCHAR(100) NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  total_active_sponsorships INTEGER DEFAULT 0,
  total_invested NUMERIC DEFAULT 0,
  total_returns_earned NUMERIC DEFAULT 0,
  avg_roi NUMERIC DEFAULT 0,
  portfolio_value NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ,
  favorite_parcels TEXT[] DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_investor_dashboard_enterprise ON investor_dashboard(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_investor_dashboard_investor ON investor_dashboard(investor_id);

COMMIT;