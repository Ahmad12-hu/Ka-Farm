-- ============================================
-- KA FARM - POLITIQUES RLS POUR ESPACE ADMIN
-- ============================================
-- À exécuter dans Supabase > Éditeur SQL

-- IMPORTANT : Remplacez 'votre-email-admin@exemple.sn' par votre vrai email admin

-- 1. CRÉER LA TABLE DES ADMINS (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSÉRER VOTRE EMAIL ADMIN
-- Remplacez 'votre-email-admin@exemple.sn' par votre email réel
INSERT INTO admin_users (id, email)
SELECT id, 'votre-email-admin@exemple.sn'
FROM auth.users
WHERE email = 'votre-email-admin@exemple.sn'
ON CONFLICT (email) DO NOTHING;

-- 3. FONCTION DE VÉRIFICATION ADMIN
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. POLITIQUES RLS POUR LA TABLE HARVESTS
-- Seul l'admin peut faire des opérations

ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all harvests"
  ON harvests FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can insert harvests"
  ON harvests FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update harvests"
  ON harvests FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete harvests"
  ON harvests FOR DELETE
  USING (is_admin());

-- 5. POLITIQUES RLS POUR LA TABLE STOCKS

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all stocks"
  ON stocks FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can insert stocks"
  ON stocks FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update stocks"
  ON stocks FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete stocks"
  ON stocks FOR DELETE
  USING (is_admin());

-- 6. POLITIQUES RLS POUR LA TABLE FINANCES

ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all finances"
  ON finances FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can insert finances"
  ON finances FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update finances"
  ON finances FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete finances"
  ON finances FOR DELETE
  USING (is_admin());

-- 7. POLITIQUES RLS POUR LA TABLE EMPLOYEES

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all employees"
  ON employees FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can insert employees"
  ON employees FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update employees"
  ON employees FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete employees"
  ON employees FOR DELETE
  USING (is_admin());

-- 8. POLITIQUES RLS POUR LA TABLE PARCELLES

ALTER TABLE parcelles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all parcelles"
  ON parcelles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can insert parcelles"
  ON parcelles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update parcelles"
  ON parcelles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete parcelles"
  ON parcelles FOR DELETE
  USING (is_admin());

-- 9. POLITIQUES RLS POUR LA TABLE CROPS

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all crops"
  ON crops FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can insert crops"
  ON crops FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update crops"
  ON crops FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete crops"
  ON crops FOR DELETE
  USING (is_admin());

-- 10. ACCORDER LES PERMISSIONS SUR LA TABLE ADMINS
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON admin_users TO service_role;

-- 11. EMPÊCHER LA LECTURE PUBLIQUE DE LA TABLE ADMINS
REVOKE ALL ON admin_users FROM PUBLIC;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que l'admin a été ajouté
SELECT * FROM admin_users;

-- Test : essayer de lire les harvests (doit réussir si connecté en tant qu'admin)
-- SELECT * FROM harvests;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. Remplacez 'votre-email-admin@exemple.sn' par votre vrai email
-- 2. Assurez-vous que cet email est confirmé dans Supabase Auth
-- 3. Exécutez ce script APRÈS avoir créé l'utilisateur admin dans Supabase Auth
-- 4. Les RLS policies ne s'appliquent que si la table a ENABLE ROW LEVEL SECURITY

-- ============================================
-- SUPPRIMER L'ACCÈS PUBLIC (OPTIONNEL)
-- ============================================

-- Si vous voulez que MÊME les utilisateurs connectés non-admin ne puissent pas lire
-- Décommentez les lignes ci-dessous :

-- REVOKE ALL ON harvests FROM authenticated;
-- REVOKE ALL ON stocks FROM authenticated;
-- REVOKE ALL ON finances FROM authenticated;
-- REVOKE ALL ON employees FROM authenticated;
-- REVOKE ALL ON parcelles FROM authenticated;
-- REVOKE ALL ON crops FROM authenticated;

-- Seul l'admin (via la fonction is_admin()) pourra alors accéder aux données