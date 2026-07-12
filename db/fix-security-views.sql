-- ============================================
-- KA FARM - CORRECTION SÉCURITÉ DES VUES SQL
-- ============================================
-- Ce script corrige les vues SQL qui utilisent SECURITY DEFINER
-- pour respecter les Row Level Security policies
--
-- Problème : SECURITY DEFINER contourne les RLS
-- Solution : Remplacer par SECURITY INVOKER + ajouter filtres RLS
-- ============================================

BEGIN;

-- ============================================
-- 1. CORRIGER vue_synthese_finances
-- ============================================

DROP VIEW IF EXISTS public.vue_synthese_finances;

CREATE OR REPLACE VIEW public.vue_synthese_finances
WITH (security_invoker = true) AS
SELECT 
  f.id,
  f.user_id,
  f.enterprise_id,
  f.description,
  f.category,
  f.type,
  f.amount,
  f.date,
  f.crop_name,
  f.created_at,
  -- Calculs d'agrégation
  (SELECT SUM(amount) FILTER (WHERE type = 'Revenu') FROM finances fi WHERE fi.user_id = f.user_id) as total_revenus,
  (SELECT SUM(amount) FILTER (WHERE type = 'Dépense') FROM finances fi WHERE fi.user_id = f.user_id) as total_depenses,
  (SELECT SUM(amount) FILTER (WHERE type = 'Revenu') FROM finances fi WHERE fi.user_id = f.user_id) - 
   (SELECT SUM(amount) FILTER (WHERE type = 'Dépense') FROM finances fi WHERE fi.user_id = f.user_id) as solde
FROM finances f
-- Filtre RLS : l'utilisateur ne voit que ses propres données
WHERE f.user_id = auth.uid() OR f.user_id IS NULL OR is_admin();

-- ============================================
-- 2. CORRIGER vue_synthese_cultures
-- ============================================

DROP VIEW IF EXISTS public.vue_synthese_cultures;

CREATE OR REPLACE VIEW public.vue_synthese_cultures
WITH (security_invoker = true) AS
SELECT 
  c.id,
  c.user_id,
  c.enterprise_id,
  c.name as crop_name,
  c.field,
  c.sowing_date,
  c.harvest_date,
  c.status,
  c.water_status,
  c.parcel_id,
  p.name as parcel_name,
  p.surface,
  -- Calculs d'agrégation
  (SELECT SUM(weight_kg) FROM harvests h WHERE h.crop_id = c.id AND h.user_id = c.user_id) as total_harvest_kg,
  (SELECT AVG(weight_kg) FROM harvests h WHERE h.crop_id = c.id AND h.user_id = c.user_id) as avg_harvest_kg
FROM crops c
LEFT JOIN parcelles p ON c.parcel_id = p.id
-- Filtre RLS : l'utilisateur ne voit que ses propres cultures
WHERE c.user_id = auth.uid() OR c.user_id IS NULL OR is_admin();

-- ============================================
-- 3. CORRIGER vue_alertes_stock
-- ============================================

DROP VIEW IF EXISTS public.vue_alertes_stock;

CREATE OR REPLACE VIEW public.vue_alertes_stock
WITH (security_invoker = true) AS
SELECT 
  s.id,
  s.user_id,
  s.enterprise_id,
  s.name,
  s.category,
  s.quantity,
  s.max_quantity,
  s.unit,
  s.alert_threshold,
  s.last_restock_date,
  -- Calcul d'alerte
  CASE 
    WHEN s.quantity <= s.alert_threshold THEN true 
    ELSE false 
  END as is_alert,
  -- Pourcentage restant
  CASE 
    WHEN s.max_quantity > 0 THEN (s.quantity::float / s.max_quantity::float) * 100 
    ELSE 0 
  END as percentage_remaining
FROM stocks s
-- Filtre RLS : l'utilisateur ne voit que ses propres stocks
WHERE s.user_id = auth.uid() OR s.user_id IS NULL OR is_admin();

COMMIT;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. SECURITY INVOKER : La vue s'exécute avec les permissions de l'utilisateur connecté
-- 2. Les filtres WHERE respectent les RLS policies :
--    - user_id = auth.uid() : Données de l'utilisateur
--    - user_id IS NULL : Données admin (visibles par l'admin)
--    - is_admin() : Admin voit tout
-- 3. Les alertes de sécurité Supabase devraient disparaître après l'exécution
-- ============================================
