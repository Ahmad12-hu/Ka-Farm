-- ============================================
-- KA FARM - ONBOARDING AUTOMATIQUE POUR NOUVEAUX UTILISATEURS
-- ============================================
-- Ce script crée un trigger PostgreSQL qui initialise automatiquement
-- les données de base pour un nouvel utilisateur après son inscription
--
-- Quand un nouvel utilisateur est créé dans la table utilisateurs,
-- ce trigger crée automatiquement :
-- - Une parcelle par défaut
-- - Une culture par défaut
-- - Un stock par défaut
-- - Une tâche par défaut
-- ============================================

BEGIN;

-- ============================================
-- 1. FONCTION D'ONBOARDING
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID;
  new_enterprise_id VARCHAR(100);
  parcel_id VARCHAR(100);
  crop_id VARCHAR(100);
  stock_id VARCHAR(100);
  task_id VARCHAR(100);
BEGIN
  -- Récupérer l'ID du nouvel utilisateur
  new_user_id := NEW.user_id;
  new_enterprise_id := NEW.enterprise_id;

  -- Générer des IDs uniques
  parcel_id := 'parc_' || substr(md5(random()::text), 1, 8);
  crop_id := 'crop_' || substr(md5(random()::text), 1, 8);
  stock_id := 'stock_' || substr(md5(random()::text), 1, 8);
  task_id := 'task_' || substr(md5(random()::text), 1, 8);

  -- Créer une parcelle par défaut
  INSERT INTO parcelle (
    id,
    user_id,
    enterprise_id,
    name,
    surface,
    status,
    water_status
  ) VALUES (
    parcel_id,
    new_user_id,
    new_enterprise_id,
    'Parcelle Principale',
    1000, -- 1000 m²
    'Cultivée',
    'Irrigué'
  );

  -- Créer une culture par défaut
  INSERT INTO cultures (
    id,
    user_id,
    enterprise_id,
    name,
    field,
    sowing_date,
    status,
    water_status,
    parcel_id
  ) VALUES (
    crop_id,
    new_user_id,
    new_enterprise_id,
    'Tomate',
    parcel_id,
    CURRENT_DATE,
    'Croissance',
    'Optimale',
    parcel_id
  );

  -- Créer un stock par défaut
  INSERT INTO stock_intrants (
    id,
    user_id,
    enterprise_id,
    name,
    category,
    quantity,
    max_quantity,
    unit
  ) VALUES (
    stock_id,
    new_user_id,
    new_enterprise_id,
    'Semences Tomate',
    'Semences',
    50,
    100,
    'kg'
  );

  -- Créer une tâche par défaut
  INSERT INTO taches (
    id,
    user_id,
    enterprise_id,
    title,
    category,
    due_date,
    priority,
    completed
  ) VALUES (
    task_id,
    new_user_id,
    new_enterprise_id,
    'Arroser les plants',
    'Entretien',
    CURRENT_DATE + INTERVAL '1 day',
    'Haute',
    false
  );

  -- Log de l'onboarding (optionnel, pour le debug)
  RAISE NOTICE 'Onboarding terminé pour l utilisateur %', NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. CRÉER LE TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS on_new_user_trigger ON utilisateurs;

CREATE TRIGGER on_new_user_trigger
  AFTER INSERT ON utilisateurs
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 3. TEST DE L'ONBOARDING
-- ============================================
-- Pour tester, vous pouvez insérer un utilisateur manuellement :
-- INSERT INTO utilisateurs (id, email, name, role, user_id, enterprise_id, enterprise_name, enterprise_code)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   'Test User',
--   'Bureau',
--   gen_random_uuid(),
--   'test_ent',
--   'Test Farm',
--   'TEST-1234'
-- );

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Ce trigger s'exécute automatiquement après chaque INSERT dans la table utilisateurs
-- 2. Les données créées sont liées à l'utilisateur via user_id
-- 3. Les RLS policies s'appliqueront automatiquement pour isoler ces données
-- 4. Vous pouvez personnaliser les données par défaut selon vos besoins
-- ============================================

COMMIT;
