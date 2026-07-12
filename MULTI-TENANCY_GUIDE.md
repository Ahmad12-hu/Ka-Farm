# 🌾 KA Farm - Guide Multi-Tenancy

## 📋 Vue d'Ensemble

Ce guide explique comment transformer KA Farm en application multi-utilisateurs, permettant à chaque personne de gérer SA PROPRE ferme indépendamment.

---

## 🎯 Architecture : Admin vs Utilisateurs Publics

### Espace Admin (Privé - Owner-Only)

**Accès** : `/pages/admin/login.html`

**Qui peut y accéder** :
- Toi (le propriétaire)
- Ton frère (si tu l'ajoutes dans `admin_users`)

**Ce qu'il permet** :
- ✅ Voir TOUTES les données de tous les utilisateurs
- ✅ Modifier les données de n'importe qui
- ✅ Gérer les comptes utilisateurs
- ✅ Accéder aux statistiques globales

**Comment ça marche** :
- Utilise l'authentification locale (`js/auth.js`)
- Email admin vérifié dans la table `admin_users`
- RLS policies : `is_admin()` retourne true → accès total

---

### Espace Public (Multi-Utilisateurs)

**Accès** : `/pages/auth/login.html` → Mode "Utilisateur Public"

**Qui peut y accéder** :
- N'importe qui qui s'inscrit via Supabase Auth

**Ce qu'il permet** :
- ✅ Voir SEULEMENT ses propres données
- ✅ Modifier SEULEMENT ses propres données
- ✅ Gérer sa ferme indépendamment
- ❌ Ne peut pas voir les données des autres utilisateurs

**Comment ça marche** :
- Utilise Supabase Auth (`js/auth-public.js`)
- Chaque utilisateur a un `user_id` unique (UUID de Supabase)
- RLS policies : `user_id = auth.uid()` → isolation des données

---

## 🔐 Séparation des Données

### Avant (Single-Tenant)

```
Tous les utilisateurs voient les mêmes données :
├── Parcelles (toutes)
├── Cultures (toutes)
├── Stocks (tous)
└── Finances (toutes)
```

### Après (Multi-Tenant)

```
Chaque utilisateur voit SES données :
Utilisateur A (user_id = abc-123)
├── Parcelles (filtrées par user_id = abc-123)
├── Cultures (filtrées par user_id = abc-123)
└── Stocks (filtrées par user_id = abc-123)

Utilisateur B (user_id = def-456)
├── Parcelles (filtrées par user_id = def-456)
├── Cultures (filtrées par user_id = def-456)
└── Stocks (filtrées par user_id = def-456)

Admin (is_admin = true)
├── Parcelles (TOUTES, sans filtre)
├── Cultures (TOUTES, sans filtre)
└── Stocks (TOUTES, sans filtre)
```

---

## 📊 Structure des Tables

### Colonnes Ajoutées

Chaque table a maintenant une colonne `user_id` :

```sql
-- Exemple pour la table harvests
ALTER TABLE harvests ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

**Signification** :
- `user_id` = UUID de l'utilisateur Supabase Auth
- `NULL` = Données de l'admin (visibles par l'admin uniquement)
- `user_id = auth.uid()` = Données de l'utilisateur connecté

---

## 🛡️ Row Level Security (RLS)

### Politique pour Utilisateurs Publics

```sql
-- Un utilisateur voit SES données OU les données admin (NULL)
CREATE POLICY "Users can view own data"
  ON harvests FOR SELECT
  USING (
    user_id = auth.uid()        -- Ses propres données
    OR user_id IS NULL          -- Données admin
    OR is_admin()               -- Admin voit tout
  );

-- Un utilisateur peut insérer SES données
CREATE POLICY "Users can insert own data"
  ON harvests FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

### Politique pour Admin

```sql
-- L'admin peut tout faire via la fonction is_admin()
-- Pas besoin de politiques spéciales, is_admin() est vérifié dans chaque politique
```

---

## 🚀 Étapes de Déploiement

### 1. Exécuter la Migration SQL

Ouvrir Supabase → SQL Editor → Exécuter `db/multi-tenancy-migration.sql`

**Ce que ça fait** :
- Ajoute `user_id` à toutes les tables
- Crée les index pour la performance
- Crée les RLS policies pour l'isolation
- Crée la fonction `is_admin()` pour l'admin

### 2. Exécuter l'Onboarding Trigger

Exécuter `db/onboarding-trigger.sql`

**Ce que ça fait** :
- Crée un trigger qui initialise automatiquement les données pour les nouveaux utilisateurs
- Crée une parcelle, une culture, un stock et une tâche par défaut

### 3. Configurer Supabase Auth

1. Aller dans Supabase → Authentication → Settings
2. Activer "Enable email confirmations" (optionnel)
3. Activer "Enable phone confirmations" (optionnel)

### 4. Mettre à jour les Variables d'Environnement

Dans `.env` et Vercel :
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Tester l'Inscription

1. Aller sur `/pages/auth/signup.html`
2. Créer un compte avec un email de test
3. Vérifier que l'utilisateur est créé dans Supabase Auth
4. Vérifier que l'utilisateur est créé dans la table `users`
5. Vérifier que les données d'onboarding sont créées automatiquement

---

## 🔧 Modifications du Code Frontend

### Fichiers Modifiés

1. **`js/auth-public.js`** (NOUVEAU)
   - Gère l'inscription et la connexion via Supabase Auth
   - Stocke l'utilisateur dans `localStorage`
   - Fournit le client Supabase pour les requêtes

2. **`pages/auth/signup.html`**
   - Importe `AuthPublic` au lieu de `Auth`
   - Utilise Supabase Auth pour l'inscription

3. **`pages/auth/login.html`**
   - Ajoute 2 boutons : "Utilisateur Public" et "Admin (Privé)"
   - Utilise `AuthPublic` pour les utilisateurs publics
   - Utilise `Auth` pour l'admin

### Fichiers Non Modifiés

- **`js/auth.js`** : Toujours utilisé pour l'admin (auth locale)
- **`pages/admin/login.html`** : Toujours utilisé pour l'admin
- **`pages/admin/dashboard.html`** : Toujours utilisé pour l'admin

---

## ⚠️ Points d'Attention

### 1. Données Existantes

Les données existantes ont `user_id = NULL`. Elles seront :
- ✅ Visibles par l'admin
- ❌ Non visibles par les nouveaux utilisateurs

**Pour migrer les données existantes vers un utilisateur** :
```sql
UPDATE harvests SET user_id = 'uuid-de-l-utilisateur' WHERE user_id IS NULL;
```

### 2. RLS Policies Existantes

Les anciennes policies dans `db/policies.sql` (accès public) sont remplacées par les nouvelles policies multi-tenant.

**Pour garder l'accès public pendant le développement** :
- Ne pas exécuter `db/multi-tenancy-migration.sql`
- Ou désactiver RLS temporairement

### 3. Espace Admin Non Affecté

L'espace admin (`/pages/admin/*`) n'est PAS affecté par ces changements :
- Il continue à utiliser l'auth locale
- Il continue à fonctionner comme avant
- Les RLS policies admin (`db/admin-rls-policies.sql`) sont séparées

---

## 📝 Résumé des Fichiers Créés

1. **`db/multi-tenancy-migration.sql`** : Migration SQL pour ajouter `user_id` et les RLS policies
2. **`db/onboarding-trigger.sql`** : Trigger pour initialiser les données des nouveaux utilisateurs
3. **`js/auth-public.js`** : Authentification Supabase pour les utilisateurs publics
4. **`MULTI-TENANCY_GUIDE.md`** : Ce guide

---

## 🎓 Prochaines Étapes

1. **Tester l'inscription** : Créer plusieurs comptes de test
2. **Vérifier l'isolation** : S'assurer que chaque utilisateur ne voit que ses données
3. **Tester l'admin** : S'assurer que l'admin voit toutes les données
4. **Personnaliser l'onboarding** : Adapter les données par défaut selon tes besoins
5. **Ajouter des fonctionnalités** : Ajouter la gestion des profils, les paramètres, etc.

---

**🎉 Félicitations ! Ton application KA Farm est maintenant multi-utilisateurs !**
