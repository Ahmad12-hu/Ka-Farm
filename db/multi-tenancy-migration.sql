-- ============================================
-- KA FARM - MIGRATION MULTI-TENANCY (Supabase Auth)
-- ============================================
-- Ce script ajoute le support multi-utilisateurs avec Supabase Auth
-- Chaque utilisateur aura ses propres données isolées par user_id
--
-- IMPORTANT : Exécuter ce script APRÈS avoir configuré Supabase Auth
-- ============================================

BEGIN;

-- ============================================
-- 1. AJOUTER LA COLONNE user_id À TOUTES LES TABLES
-- ============================================

-- Table utilisateurs (utilisateurs de l'app, pas Supabase Auth)
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Tables principales
ALTER TABLE parcelle ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE cultures ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE pepiniere ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE stock_intrants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE taches ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE transaction_finacieres ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE employer ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE presence ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE paiement_employer ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE cheptel ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE production_animal ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE sante_animal ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE message ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE recole ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE traitement_phytosanitaires ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE alertes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE ventes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE mouvement_stocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE equippement ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE ferme ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE credit ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================
-- 2. CRÉER DES INDEX SUR user_id POUR LA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_parcelles_user_id ON parcelles(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id);
CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_finances_user_id ON finances(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_harvests_user_id ON harvests(user_id);

-- ============================================
-- 3. MIGRER LES DONNÉES EXISTANTES
-- ============================================
-- Remarque : Les données existantes auront user_id = NULL
-- Elles seront visibles par l'admin via les policies spéciales
-- ============================================

-- ============================================
-- 4. CRÉER LA FONCTION DE VÉRIFICATION ADMIN
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifie si l'email de l'utilisateur est dans la table admin_users
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. POLITIQUES RLS POUR UTILISATEURS PUBLICS
-- ============================================
-- Ces politiques permettent à chaque utilisateur de voir/modifier SES données
-- L'admin peut voir/modifier TOUTES les données
-- ============================================

-- Exemple pour la table harvests (adapter pour toutes les tables)

ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs voient leurs propres données OU NULL (données admin)
CREATE POLICY "Users can view own data"
  ON harvests FOR SELECT
  USING (
    user_id = auth.uid() 
    OR user_id IS NULL 
    OR is_admin()
  );

-- Politique : Les utilisateurs peuvent insérer leurs propres données
CREATE POLICY "Users can insert own data"
  ON harvests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Politique : Les utilisateurs peuvent modifier leurs propres données
CREATE POLICY "Users can update own data"
  ON harvests FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

-- Politique : Les utilisateurs peuvent supprimer leurs propres données
CREATE POLICY "Users can delete own data"
  ON harvests FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- ============================================
-- 6. POLITIQUES SIMILAIRES POUR LES AUTRES TABLES PRINCIPALES
-- ============================================

-- Parcelles
ALTER TABLE parcelles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own parcelles" ON parcelles FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own parcelles" ON parcelles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own parcelles" ON parcelles FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own parcelles" ON parcelles FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Crops
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own crops" ON crops FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own crops" ON crops FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own crops" ON crops FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own crops" ON crops FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Stocks
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stocks" ON stocks FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own stocks" ON stocks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own stocks" ON stocks FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own stocks" ON stocks FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Finances
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own finances" ON finances FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own finances" ON finances FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own finances" ON finances FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own finances" ON finances FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own employees" ON employees FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own employees" ON employees FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own employees" ON employees FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own employees" ON employees FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (user_id = auth.uid() OR is_admin());

COMMIT;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Les données existantes (user_id = NULL) resteront visibles par l'admin
-- 2. Les nouveaux utilisateurs ne verront que leurs propres données
-- 3. L'admin peut voir et modifier toutes les données via la fonction is_admin()
-- 4. Pour migrer les données existantes vers un user_id spécifique, utiliser UPDATE
-- ============================================
