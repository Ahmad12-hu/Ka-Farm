# Guide Multi-Tenant KA-Farm

## ✅ Architecture Multi-Utilisateurs

KA-Farm est conçu comme une application **multi-tenant** où chaque utilisateur gère sa propre ferme de manière isolée.

## 🔐 Isolation des Données

### Principe

Chaque ferme dispose d'un **`enterpriseId` unique** qui isole toutes ses données dans le localStorage.

### Scoping Automatique

La méthode `getScopedKey()` dans `js/storage.js` ajoute automatiquement le préfixe :

```javascript
getScopedKey(key) {
  const user = this.getCurrentUser();
  const enterpriseId = user ? (user.enterpriseId || 'ka_farm') : 'ka_farm';
  return `${enterpriseId}_${key}`;
}
```

### Exemple Concret

**Utilisateur 1 :**

- Email: `amadou@ferme1.sn`
- enterpriseId: `ent_1689234567890`
- Clé localStorage: `ent_1689234567890_ka_farm_crops`

**Utilisateur 2 :**

- Email: `fatou@ferme2.sn`
- enterpriseId: `ent_1689239999999`
- Clé localStorage: `ent_1689239999999_ka_farm_crops`

**Résultat :** Même si les deux utilisateurs sont sur le même navigateur, leurs données sont complètement séparées.

## 👥 Système d'Inscription

### Deux Modes d'Inscription

**1. Mode Solo (nouvelle ferme)**

```javascript
// L'utilisateur créé sa propre ferme
enterpriseId = `ent_${Date.now()}`;
enterpriseName = 'Mon Exploitation';
enterpriseCode = `KAF-${random 4 digits}`;
```

**2. Mode Équipe (rejoindre une ferme existante)**

```javascript
// L'utilisateur rejoint via un code d'invitation
enterpriseId = foundUser.enterpriseId;
enterpriseName = foundUser.enterpriseName;
enterpriseCode = foundUser.enterpriseCode;
```

### Formulaire d'Inscription

**Page:** `pages/auth/signup.html`

**Champs requis:**

- Nom complet
- Email
- Rôle (Admin, Manager, Ouvrier, Stagiaire)
- Mot de passe
- Mode: Créer une ferme / Rejoindre une équipe

**Pour créer une ferme:**

- Nom de l'exploitation (optionnel, défaut: "Mon Exploitation")

**Pour rejoindre une équipe:**

- Code d'équipe (fourni par l'admin)

## 🔑 Authentification

### Connexion

```javascript
Auth.login(email, password, (remember = true));
```

**Stockage de session:**

- `ka_user_email`
- `ka_user_name`
- `ka_user_role`
- `ka_user_enterprise_id`
- `ka_user_enterprise_name`
- `ka_user_enterprise_code`
- `ka_user_remember`

### Rôles Utilisateurs

**Admin / Owner**

- Accès complet à toutes les fonctionnalités
- Gestion des membres de l'équipe
- Paramètres de la ferme

**Manager**

- Gestion des cultures, parcelles, stocks
- Suivi financier
- Validation des tâches

**Ouvrier**

- Consultation des tâches assignées
- Mise à jour du statut des tâches
- Saisie des présences

**Stagiaire**

- Accès en lecture seule
- Formation

## 📊 Isolation par Module

Tous les modules suivants sont automatiquement isolés par `enterpriseId` :

- Cultures (`ka_farm_crops`)
- Parcelles (`ka_farm_parcelles`)
- Stocks (`ka_farm_stocks`)
- Tâches (`ka_farm_tasks`)
- Finances (`ka_farm_finances`)
- Employés (`ka_farm_employees`)
- Présences (`ka_farm_attendance`)
- Cheptel (`ka_farm_cheptel`)
- Traitements (`ka_farm_treatments`)
- Bourse d'outils (`ka_farm_tools_sharing`)
- Commandes groupées (`ka_farm_group_orders`)
- etc.

## 🚀 Migration depuis l'Ancien Système

### Si vous avez des données existantes

Les données par défaut (`DEFAULT_*`) sont partagées globalement et servent de template.

Lors de la première connexion d'un nouvel utilisateur:

1. Vérification si des données existent pour son `enterpriseId`
2. Si non, les valeurs par défaut sont copiées pour cette ferme
3. L'utilisateur peut ensuite personnaliser ses données

### Nettoyage des Données

```javascript
// Supprimer toutes les données d'une ferme (admin uniquement)
KAStorage.clearEnterpriseData(enterpriseId);
```

## 📱 Expérience Utilisateur

### Onboarding Nouvel Utilisateur

1. **Page d'accueil** (`index.html`)
   - Bouton "Créer ma ferme" → Inscription mode solo
   - Bouton "Rejoindre une équipe" → Inscription avec code

2. **Page d'inscription** (`pages/auth/signup.html`)
   - Choix du mode
   - Création du compte
   - Redirection automatique vers le dashboard

3. **Première connexion**
   - Affichage du nom de la ferme dans le header
   - Tutoriel rapide des fonctionnalités principales
   - Invitation à ajouter la première parcelle/culture

### Navigation Contextuelle

**Sidebar:**

- Logo + Nom de la ferme
  -switch thème (Clair/Sombre)
- Profil utilisateur avec rôle

**Pages protégées:**

- Redirection vers `/pages/auth/login.html` si non connecté
- Vérification du `enterpriseId` à chaque chargement

## 🔒 Sécurité

### Mots de Passe

- Hashage PBKDF2 avec salt unique par utilisateur
- Migration automatique des anciens hash SHA-256 vers PBKDF2
- Aucun mot de passe en clair stocké

### Validation des Sessions

```javascript
// Vérification à chaque chargement de page
const user = KAStorage.getCurrentUser();
if (!user) {
  window.location.href = "/pages/auth/login.html";
}
```

### Isolation Garantie

- Pas de fuite de données entre fermes
- Chaque requête passe par `getScopedKey()`
- Test: Deux utilisateurs sur même navigateur = données séparées

## 🛠️ Configuration Firebase

### Cloud Synchronization (Optionnel)

Pour synchroniser les données entre appareils:

```javascript
// Initialiser Firebase Sync
KAFirebaseSync.initSync((key, data) => {
  document.dispatchEvent(
    new CustomEvent("ka_data_updated", { detail: { key, data } }),
  );
});
```

**Isolation Firebase:**

- Document Firestore: `enterprise/{enterpriseId}`
- Collections scindées par `enterpriseId`
- Règles de sécurité Firestore pour bloquer l'accès cross-tenant

## 📋 Checklist de Vérification

**Avant de déployer en production:**

- [ ] Tester inscription mode solo
- [ ] Tester inscription mode équipe avec code
- [ ] Vérifier isolation des données (2 users, mêmes devices)
- [ ] Tester déconnexion/reconnexion
- [ ] Vérifier persistance des sessions (remember me)
- [ ] Tester migration mot de passe legacy
- [ ] Valider les rôles et permissions
- [ ] Tester sur mobile/tablette
- [ ] Vérifier les règles Firestore (si cloud activé)

## 🆘 Support

**Documentation:**

- `MULTI-TENANCY_IMPLEMENTATION.md` - Détails techniques
- `ADMIN_SETUP.md` - Configuration admin
- `VERCEL_DEPLOYMENT.md` - Déploiement

**Contact:**

- Email: support@ka-farm.sn
- GitHub: https://github.com/Ahmad12-hu/Ka-Farm

---

**KA-Farm v2.0+** - Application Multi-Tenant dès la conception 🚜🌱
