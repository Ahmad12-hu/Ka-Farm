-- ============================================
-- NETTOYAGE DES COMPTES FICTIFS - KA FARM
-- ============================================
-- IMPORTANT : Lisez ce script complètement avant de l'exécuter
-- ============================================

-- ÉTAPE 1 : BACKUP DE SÉCURITÉ
-- ============================================

-- Sauvegardez vos données admin AVANT toute manipulation
-- Exportez ces données et gardez-les précieusement

-- Vérifier d'abord si la table users existe
SELECT 
  'BACKUP - Vérification table users' as info,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'users' 
  AND table_schema = 'public';
  
-- Si la table existe, lister les utilisateurs admin
SELECT 
  id, 
  email, 
  name, 
  role, 
  created_at 
FROM users 
WHERE role IN ('admin', 'super_admin');

-- ============================================
-- ÉTAPE 2 : IDENTIFIER LES COMPTES FICTIFS
-- ============================================

-- Requête 1 : Lister tous les utilisateurs (examinez les résultats)
-- Si la table n'existe pas, vérifiez dans Supabase Auth > Users
SELECT 
  id,
  email,
  name,
  role,
  created_at,
  CASE 
    WHEN email LIKE '%demo%' THEN 'COMPTE DEMO'
    WHEN email LIKE '%test%' THEN 'COMPTE TEST'
    WHEN email LIKE '%example.com%' THEN 'COMPTE EXAMPLE'
    WHEN email LIKE '%fictif%' OR email LIKE '%fake%' THEN 'COMPTE FAKE'
    ELSE 'À VÉRIFIER'
  END as categorie
FROM users
ORDER BY created_at DESC;

-- Si erreur "relation users does not exist", utilisez Supabase Auth
-- Allez dans Authentication > Users pour voir les comptes

-- Requête 2 : Trouver les utilisateurs avec données associées
-- Cette requête montre quelles tables contiennent des données pour chaque utilisateur
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  COUNT(DISTINCT h.id) as nb_harvests,
  COUNT(DISTINCT p.id) as nb_parcelles,
  COUNT(DISTINCT c.id) as nb_crops,
  COUNT(DISTINCT s.id) as nb_stocks,
  COUNT(DISTINCT f.id) as nb_finances,
  COUNT(DISTINCT e.id) as nb_employees,
  COUNT(DISTINCT t.id) as nb_tasks
FROM users u
LEFT JOIN harvests h ON h.user_id = u.id
LEFT JOIN parcelles p ON p.user_id = u.id
LEFT JOIN crops c ON c.user_id = u.id
LEFT JOIN stocks s ON s.user_id = u.id
LEFT JOIN finances f ON f.user_id = u.id
LEFT JOIN employees e ON e.user_id = u.id
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id, u.email, u.name, u.role
ORDER BY nb_harvests DESC;

-- Requête 3 : Identifier les comptes suspects (0 données et récents)
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM harvests WHERE user_id = u.id
)
AND NOT EXISTS (
  SELECT 1 FROM parcelles WHERE user_id = u.id
)
AND NOT EXISTS (
  SELECT 1 FROM crops WHERE user_id = u.id
)
AND role != 'admin'
AND role != 'super_admin'
ORDER BY created_at DESC;

-- ============================================
-- ÉTAPE 3 : SUPPRESSION (À EXÉCUTER UNE FOIS LE BACKUP FAIT)
-- ============================================
-- ⚠️ DÉCOMMENTEZ SEULEMENT APRÈS AVOIR CONFIRMÉ LES COMPTES À SUPPRIMER
-- ⚠️ REMPLACEZ 'USER_ID_FICTIF' PAR LES VRAIS IDs

-- Exemple pour supprimer un utilisateur fictif et toutes ses données :
-- (Répétez pour chaque compte fictif)

-- -- Supprimer les données associées (dans l'ordre des dépendances)
-- DELETE FROM employee_payments WHERE employee_id IN (
--   SELECT id FROM employees WHERE user_id = 'USER_ID_FICTIF'
-- );
-- DELETE FROM daily_workers WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM tasks WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM employees WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM messages WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM stocks WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM treatments WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM harvests WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM parcelles WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM crops WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM finances WHERE user_id = 'USER_ID_FICTIF';
-- DELETE FROM farm_profiles WHERE user_id = 'USER_ID_FICTIF';

-- -- Supprimer l'utilisateur
-- DELETE FROM users WHERE id = 'USER_ID_FICTIF';

-- ============================================
-- ÉTAPE 4 : NETTOYAGE DU CODE
-- ============================================
-- Vérifiez ces fichiers pour les données de démo :

-- 1. server.js - lignes 89-105 (serverMessages, serverStocks, serverCrops)
-- À supprimer ou commenter ces arrays de données fictives

-- 2. js/storage.js - méthodes de peuplement par défaut
-- Cherchez des méthodes comme loadDemoData(), initDefaultData(), etc.

-- 3. js/modules/*.js - Cherchez des données hardcodées
-- grep -r "demo" js/modules/
-- grep -r "test@example" js/modules/
-- grep -r "seed" js/modules/

-- ============================================
-- ÉTAPE 5 : VÉRIFICATION FINALE
-- ============================================

-- Vérifier qu'il ne reste que vos comptes admin et éventuellement votre compte de test
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
ORDER BY created_at DESC;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. NE supprimez JAMAIS les utilisateurs avec role = 'admin' ou 'super_admin'
-- 2. Faites un backup complet avant toute suppression
-- 3. Testez d'abord avec un compte de test
-- 4. Les suppressions dans Supabase Auth doivent être faites manuellement 
--    dans Authentication > Users après suppression dans la table users
-- ============================================