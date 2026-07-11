# 🛡️ KA Farm - Guide de Configuration Espace Admin

## 📋 Vue d'Ensemble

Ce guide vous explique pas à pas comment créer un **espace administrateur privé** accessible uniquement par vous, le propriétaire de l'entreprise.

---

## 🎯 Architecture

```
Espace Public (Site KA Farm)
├── Pages classiques (dashboard, cultures, finances, etc.)
└── Accessible par tous les utilisateurs

Espace Admin (Privé)
├── /pages/admin/login.html → Page de connexion
├── /pages/admin/dashboard.html → Dashboard protégé
└── Accessible UNIQUEMENT par l'email admin
```

---

## 🔐 Étape 1 : Configuration Supabase Auth

### 1.1 Créer l'utilisateur admin dans Supabase

1. **Aller sur Supabase** → Votre projet "Ka-Farm"
2. Cliquer sur **Authentication** dans le menu gauche
3. Cliquer sur **Add User** → **Create new user**
4. Remplir :
   - **Email** : `votre-email-admin@exemple.sn` (votre vrai email)
   - **Password** : Choisir un mot de passe fort
   - **Auto Confirm** : ✅ Coché
5. Cliquer sur **Create User**

### 1.2 Vérifier l'utilisateur créé

```sql
-- Dans Supabase > Éditeur SQL, vérifier :
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'votre-email-admin@exemple.sn';
```

**Important** : Vérifier que `email_confirmed_at` n'est pas NULL (utilisateur bien confirmé).

---

## 📧 Étape 2 : Mettre à Jour les Fichiers

### 2.1 Mettre à jour `js/auth-client.js`

Ouvrir le fichier et modifier ligne 12 :

```javascript
const ADMIN_EMAIL = "votre-email-admin@exemple.sn"; // ⚠️ REMPLACER PAR VOTRE EMAIL
```

### 2.2 Mettre à jour `pages/admin/login.html`

Modifier ligne 89 :

```javascript
const ADMIN_EMAIL = "votre-email-admin@exemple.sn"; // ⚠️ REMPLACER PAR VOTRE EMAIL
```

### 2.3 Mettre à jour `pages/admin/dashboard.html`

Modifier ligne 353 :

```javascript
const ADMIN_EMAIL = "votre-email-admin@exemple.sn"; // ⚠️ REMPLACER PAR VOTRE EMAIL
```

---

## 🗄️ Étape 3 : Configurer les RLS Policies

### 3.1 Exécuter le script SQL

1. **Aller sur Supabase** → **Éditeur SQL**
2. Ouvrir le fichier `db/admin-rls-policies.sql`
3. **Remplacer** tous les `'votre-email-admin@exemple.sn'` par votre vrai email
4. Copier tout le contenu et coller dans l'éditeur SQL
5. Cliquer sur **Exécuter**

### 3.2 Vérifier que les policies sont créées

```sql
-- Vérifier la table admin_users
SELECT * FROM admin_users;

-- Vérifier les policies sur harvests
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'harvests';
```

**Résultat attendu** : 4 policies (SELECT, INSERT, UPDATE, DELETE) pour chaque table.

---

## 🔧 Étape 4 : Configurer les Variables d'Environnement

### 4.1 Créer/Modifier le fichier `.env`

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Récupérer ces valeurs depuis Supabase > Settings > API
```

### 4.2 Où trouver les clés Supabase ?

1. **Aller sur Supabase** → Votre projet
2. Cliquer sur **Settings** (⚙️ en bas à gauche)
3. Aller dans **API**
4. Copier :
   - **URL** : `https://[PROJECT_ID].supabase.co`
   - **anon/public key** : Clé publique

### 4.3 Ajouter dans Vercel (si déployé)

Si votre site est sur Vercel :

1. **Aller sur Vercel** → Votre projet
2. **Settings** → **Environment Variables**
3. Ajouter :
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`
4. **Redéployer** le projet

---

## 🚀 Étape 5 : Tester le Système

### 5.1 Test 1 : Accès à la page admin

```bash
# Démarrer le serveur
npm run dev
```

Aller sur : `http://localhost:3000/pages/admin/login.html`

**Résultat attendu** : Page de login avec le thème vert KA Farm.

### 5.2 Test 2 : Connexion admin

1. Se connecter avec l'email admin et le mot de passe
2. **Résultat attendu** : Redirection vers `/pages/admin/dashboard.html`
3. Vérifier que les statistiques s'affichent

### 5.3 Test 3 : Protection des routes

1. **Se déconnecter** (cliquer sur "Déconnexion")
2. Essayer d'accéder directement à : `http://localhost:3000/pages/admin/dashboard.html`
3. **Résultat attendu** : Redirection automatique vers `/pages/admin/login.html`

### 5.4 Test 4 : Vérifier RLS Policies

```sql
-- Dans Supabase > Éditeur SQL
-- Tester que les policies fonctionnent :

-- 1. Se connecter avec l'admin dans l'application
-- 2. Vérifier que les harvests sont accessibles
SELECT * FROM harvests;

-- 3. Se déconnecter
-- 4. Vérifier que la lecture est refusée
-- (doit retourner une erreur 401 ou 403)
```

---

## 📁 Structure des Fichiers Admin

```
KA-FARM/
├── pages/
│   └── admin/
│       ├── login.html          # Page de connexion admin
│       └── dashboard.html      # Dashboard protégé
├── js/
│   └── auth-client.js          # Client Supabase Auth
├── db/
│   └── admin-rls-policies.sql  # Politiques RLS Supabase
└── ADMIN_SETUP.md              # Ce fichier
```

---

## 🔒 Sécurité

### Ce qui est protégé :

✅ **Page de login** : Accessible uniquement si non connecté  
✅ **Dashboard admin** : Nécessite d'être connecté + être admin  
✅ **API Supabase** : RLS policies bloquent tout accès non-admin  
✅ **Redirections automatiques** : Si non autorisé → retour login  
✅ **Session** : Gérée par Supabase Auth (sécurisée)

### Ce qui n'est PAS accessible :

❌ Pas de création de compte publique  
❌ Pas de réinitialisation de mot de passe  
❌ Pas d'inscription  
❌ Pas de partage de lien d'invitation

---

## 🎨 Personnalisation

### Changer les couleurs

Dans `pages/admin/login.html` et `pages/admin/dashboard.html` :

```css
/* Couleurs actuelles */
bg-[#0f1a0b]  /* Vert très foncé (background) */
bg-[#162010]  /* Vert foncé (cartes) */
text-[#7ec850] /* Vert clair (accents) */
border-[#2a3f1f] /* Bordures vert foncé */
```

**Remplacer par vos couleurs** :  
https://tailwindcss.com/docs/customizing-colors

### Ajouter des sections

Dans `pages/admin/dashboard.html`, section "Gestion des X" :

```html
<div class="bg-[#162010] border border-[#2a3f1f] rounded-2xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-black text-white">Gestion des PARCELLES</h2>
    <button
      onclick="openSection('parcelles')"
      class="text-[#7ec850] hover:text-[#6bb340] text-sm font-bold"
    >
      Gérer →
    </button>
  </div>
  <div id="parcelles-list" class="space-y-2">
    <!-- Chargé dynamiquement -->
  </div>
</div>
```

Puis ajouter la logique dans le `<script>` :

```javascript
// Charger les parcelles
const parcelles = KAStorage.getParcelles();
const parcellesList = document.getElementById("parcelles-list");
parcellesList.innerHTML = parcelles
  .map(
    (p) => `
  <div class="flex items-center justify-between bg-[#0f1a0b] rounded-lg p-3">
    <div>
      <p class="text-sm font-bold text-white">${p.name}</p>
      <p class="text-xs text-[#7ec850]/60">${p.surface} m²</p>
    </div>
    <span class="text-xs font-bold text-[#7ec850]">${p.status}</span>
  </div>
`,
  )
  .join("");
```

---

## 🐛 Dépannage

### Problème 1 : "Accès refusé" même en étant admin

**Solution** :

1. Vérifier que l'email est bien confirmé dans Supabase Auth
2. Vérifier que l'email est bien dans la table `admin_users`
3. Vérifier que le script SQL a bien été exécuté

```sql
-- Vérifier
SELECT * FROM admin_users WHERE email = 'votre-email-admin@exemple.sn';
```

### Problème 2 : RLS policies ne s'appliquent pas

**Solution** :

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('harvests', 'stocks', 'finances', 'employees');

-- Si rowsecurity = false, exécuter :
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
-- (répéter pour chaque table)
```

### Problème 3 : "Invalid API key"

**Solution** :

1. Vérifier le fichier `.env`
2. Vérifier que les variables commencent par `VITE_`
3. Redémarrer le serveur après modification

---

## 📚 Ressources

- **Supabase Auth** : https://supabase.com/docs/guides/auth
- **RLS Policies** : https://supabase.com/docs/guides/auth/row-level-security
- **Vercel Environment Variables** : https://vercel.com/docs/environment-variables

---

## ✅ Checklist Finale

- [ ] Utilisateur admin créé dans Supabase Auth
- [ ] Email admin confirmé
- [ ] Fichier `.env` configuré avec les clés Supabase
- [ ] `auth-client.js` mis à jour avec le bon email
- [ ] `login.html` mis à jour avec le bon email
- [ ] `dashboard.html` mis à jour avec le bon email
- [ ] Script SQL `admin-rls-policies.sql` exécuté
- [ ] Table `admin_users` contient l'email admin
- [ ] RLS policies activées sur les tables
- [ ] Test de connexion réussi
- [ ] Test de protection des routes réussi

---

## 🎓 Prochaines Étapes

1. **Ajouter des pages de gestion spécifiques**
   - Gestion des récoltes (CRUD complet)
   - Gestion des stocks (CRUD complet)
   - Gestion des finances (CRUD complet)
   - Gestion des employés (CRUD complet)

2. **Ajouter des exports**
   - Export CSV des récoltes
   - Export Excel des finances
   - Export PDF des rapports

3. **Ajouter des statistiques avancées**
   - Graphiques de croissance
   - Analyses de tendances
   - Prédictions

4. **Ajouter un système de sauvegarde**
   - Backup automatique
   - Export de la base de données

---

**🎉 Félicitations ! Votre espace admin est maintenant sécurisé et fonctionnel.**
