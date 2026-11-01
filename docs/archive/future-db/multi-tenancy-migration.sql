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

CREATE INDEX IF NOT EXISTS idx_utilisateurs_user_id ON utilisateurs(user_id);
CREATE INDEX IF NOT EXISTS idx_parcelle_user_id ON parcelle(user_id);
CREATE INDEX IF NOT EXISTS idx_cultures_user_id ON cultures(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_intrants_user_id ON stock_intrants(user_id);
CREATE INDEX IF NOT EXISTS idx_taches_user_id ON taches(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_finacieres_user_id ON transaction_finacieres(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_user_id ON employer(user_id);
CREATE INDEX IF NOT EXISTS idx_recole_user_id ON recole(user_id);

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

-- Exemple pour la table recole (adapter pour toutes les tables)

ALTER TABLE recole ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs voient leurs propres données OU NULL (données admin)
CREATE POLICY "Users can view own data"
  ON recole FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IS NULL
    OR is_admin()
  );

-- Politique : Les utilisateurs peuvent insérer leurs propres données
CREATE POLICY "Users can insert own data"
  ON recole FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Politique : Les utilisateurs peuvent modifier leurs propres données
CREATE POLICY "Users can update own data"
  ON recole FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

-- Politique : Les utilisateurs peuvent supprimer leurs propres données
CREATE POLICY "Users can delete own data"
  ON recole FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- ============================================
-- 6. POLITIQUES SIMILAIRES POUR LES AUTRES TABLES PRINCIPALES
-- ============================================

-- Parcelle
ALTER TABLE parcelle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own parcelle" ON parcelle FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own parcelle" ON parcelle FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own parcelle" ON parcelle FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own parcelle" ON parcelle FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Cultures
ALTER TABLE cultures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cultures" ON cultures FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own cultures" ON cultures FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own cultures" ON cultures FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own cultures" ON cultures FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Stock Intrants
ALTER TABLE stock_intrants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stock_intrants" ON stock_intrants FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own stock_intrants" ON stock_intrants FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own stock_intrants" ON stock_intrants FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own stock_intrants" ON stock_intrants FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Transaction Financieres
ALTER TABLE transaction_finacieres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transaction_finacieres" ON transaction_finacieres FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own transaction_finacieres" ON transaction_finacieres FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own transaction_finacieres" ON transaction_finacieres FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own transaction_finacieres" ON transaction_finacieres FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Employer
ALTER TABLE employer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own employer" ON employer FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own employer" ON employer FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own employer" ON employer FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own employer" ON employer FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Taches
ALTER TABLE taches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own taches" ON taches FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR is_admin());
CREATE POLICY "Users can insert own taches" ON taches FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own taches" ON taches FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can delete own taches" ON taches FOR DELETE USING (user_id = auth.uid() OR is_admin());

COMMIT;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Les données existantes (user_id = NULL) resteront visibles par l'admin
-- 2. Les nouveaux utilisateurs ne verront que leurs propres données
-- 3. L'admin peut voir et modifier toutes les données via la fonction is_admin()
-- 4. Pour migrer les données existantes vers un user_id spécifique, utiliser UPDATE
-- ============================================
