# Guide de Déploiement Production - KA Farm

## 📋 Vue d'Ensemble

Ce guide explique comment déployer KA-FARM en production sur Vercel avec toutes les configurations nécessaires.

## 🎯 Objectifs

- ✅ Déploiement réussi sur Vercel
- ✅ Configuration sécurisée
- ✅ Monitoring actif
- ✅ Performance optimale
- ✅ Rollback plan prêt

---

## 🚀 Étape 1 : Prérequents

### Vérifications

- [ ] Compte Vercel créé
- [ ] Repository GitHub connecté
- [ ] Firebase configuré
- [ ] Variables d'environnement prêtes
- [ ] Tests passent (localement)

### Variables d'Environnement

```bash
# .env.production
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx

# API (si applicable)
VITE_API_URL=https://api.ka-farm.com

# Monitoring (optionnel)
VITE_SENTRY_DSN=xxx
```

---

## 📦 Étape 2 : Build de Production

### 1. Installer les Dépendances

```bash
npm ci --production
```

### 2. Build de Production

```bash
npm run build
```

**Résultat attendu** :

```
✓ 1234 modules transformed
dist/index.html                   0.45 kB
dist/assets/index.css             45.23 kB
dist/assets/index.js              289.45 kB
```

### 3. Vérifier le Build

```bash
# Tester le build localement
npm run preview
```

**Checklist** :

- [ ] Application se lance
- [ ] Pas d'erreur console
- [ ] Firebase fonctionne
- [ ] UI complète

---

## 🌐 Étape 3 : Déploiement Vercel

### Méthode 1 : Via GitHub (Recommandé)

1. **Push sur GitHub**

```bash
git add .
git commit -m "feat: prepare production deployment"
git push origin main
```

2. **Vercel auto-déploie**

- Vercel détecte le push
- Build automatique
- Déploiement automatique

3. **Vérifier le déploiement**

- Aller sur vercel.com
- Vérifier le statut
- Tester l'URL de production

### Méthode 2 : Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

---

## ⚙️ Étape 4 : Configuration Vercel

### 1. Variables d'Environnement

Dans Vercel Dashboard :

```
Settings > Environment Variables > Add
```

**Ajouter** :

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**Environnements** :

- [ ] Production
- [ ] Preview
- [ ] Development

### 2. Domaine Personnalisé (Optionnel)

```
Settings > Domains > Add
```

**Ajouter** :

- Domaine principal : `ka-farm.com`
- Sous-domaine : `app.ka-farm.com`

**Configuration DNS** :

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Configuration du Build

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🔒 Étape 5 : Sécurité

### 1. Firebase Security Rules

**Firestore Rules** (`firestore.rules`) :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authentification requise
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage Rules** (`storage.rules`) :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. HTTPS

- [ ] SSL activé (automatique sur Vercel)
- [ ] Redirection HTTP → HTTPS
- [ ] HSTS activé

### 3. CORS

```javascript
// api/index.js
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["https://ka-farm.com"],
    credentials: true,
  })
);
```

---

## 📊 Étape 6 : Monitoring

### 1. Sentry (Optionnel mais Recommandé)

**Installation** :

```bash
npm install @sentry/vite-plugin
```

**Configuration** :

```javascript
// vite.config.js
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default {
  plugins: [
    sentryVitePlugin({
      org: "ka-farm",
      project: "ka-farm-web",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
};
```

**Variables Vercel** :

```
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 2. Logs Vercel

```
Dashboard > Deployments > View Function Logs
```

**Vérifier** :

- [ ] Pas d'erreur 500
- [ ] Temps de réponse < 200ms
- [ ] Pas de fuite mémoire

### 3. Analytics

**Vercel Analytics** :

```
Dashboard > Analytics > Enable
```

**Métriques à suivre** :

- Visiteurs uniques
- Temps de chargement
- Taux de rebond
- Erreurs 404

---

## ✅ Étape 7 : Tests de Production

### Checklist de Validation

#### Fonctionnel

- [ ] Page d'accueil charge
- [ ] Login/Register fonctionne
- [ ] Dashboard s'affiche
- [ ] Tous les modules accessibles
- [ ] Firebase sync fonctionne
- [ ] Backup fonctionne

#### Performance

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

**Cibles** :

- Performance : ≥ 90
- Accessibility : ≥ 90
- Best Practices : ≥ 90
- SEO : ≥ 90

#### Sécurité

- [ ] HTTPS activé
- [ ] Pas de donnée sensible en console
- [ ] Cookies sécurisés
- [ ] XSS protégé
- [ ] CSRF protégé

#### Responsive

- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## 🔄 Étape 8 : Rollback Plan

### En Cas de Problème

#### Rollback Automatique

Vercel rollback automatique si erreur > 5%

#### Rollback Manuel

```bash
# Via CLI
vercel rollback [deployment-url]

# Via Dashboard
Dashboard > Deployments > ... > Rollback
```

#### Checklist Rollback

- [ ] Identifier le problème
- [ ] Communiquer à l'équipe
- [ ] Lancer le rollback
- [ ] Vérifier la stabilisation
- [ ] Investiguer en staging
- [ ] Fix et re-déploiement

---

## 📈 Étape 9 : Post-Déploiement

### Monitoring (24-48h)

**Jour 1** :

- [ ] Vérifier les logs chaque heure
- [ ] Monitorer les erreurs Sentry
- [ ] Vérifier les performances
- [ ] Tester les fonctionnalités critiques

**Jour 2** :

- [ ] Vérifier les analytics
- [ ] Monitorer les temps de réponse
- [ ] Vérifier les backups
- [ ] Collecter les feedbacks

### Communication

**Équipe** :

- [ ] Notifier le déploiement
- [ ] Partager l'URL de production
- [ ] Partager les guides créés
- [ ] Former sur le backup

**Utilisateurs** :

- [ ] Email de notification
- [ ] Guide de démarrage rapide
- [ ] Support disponible

---

## 🎓 Étape 10 : Formation Équipe

### Guides à Partager

1. **docs/ERROR_HANDLER_GUIDE.md**
   - Gestion des erreurs
   - Logging
   - Notifications

2. **docs/TESTING_PATTERNS.md**
   - Créer des tests
   - Patterns à suivre
   - Bonnes pratiques

3. **docs/QUALITY_CHECKLIST.md**
   - Checklist avant PR
   - Standards de qualité
   - Review process

### Session de Formation

**Durée** : 1h
**Contenu** :

- Présentation des améliorations
- Démonstration du backup
- Comment créer des tests
- Standards de code

---

## 🚨 Troubleshooting

### Problème 1 : Build Échoue

**Solution** :

```bash
# Vérifier les logs
vercel logs [deployment-url]

# Vérifier les variables d'environnement
vercel env ls

# Re-build localement
npm run build
```

### Problème 2 : Firebase Erreur

**Solution** :

- Vérifier les règles de sécurité
- Vérifier les variables d'environnement
- Tester en local avec les mêmes variables

### Problème 3 : Performance Lente

**Solution** :

- Analyser le bundle
- Optimiser les images
- Activer le cache
- Vérifier les requêtes Firebase

---

## 📋 Checklist Finale

### Avant Déploiement

- [ ] Tests passent localement
- [ ] Build réussit
- [ ] Variables d'environnement configurées
- [ ] Firebase rules déployées
- [ ] Documentation à jour

### Pendant Déploiement

- [ ] Build Vercel réussi
- [ ] Pas d'erreur dans les logs
- [ ] Application accessible
- [ ] HTTPS fonctionne
- [ ] Domaine personnalisé OK

### Après Déploiement

- [ ] Tests fonctionnels OK
- [ ] Performance acceptable
- [ ] Monitoring actif
- [ ] Équipe formée
- [ ] Utilisateurs notifiés

---

## 🎯 Métriques de Succès

### Technique

- ✅ Uptime : 99.9%
- ✅ Temps de réponse : < 200ms
- ✅ Performance Lighthouse : ≥ 90
- ✅ Erreurs : < 1%

### Business

- ✅ Utilisateurs actifs
- ✅ Données sauvegardées
- ✅ Feedback positif
- ✅ Adoption équipe

---

## 📞 Support

### Contacts

- **DevOps** : [Contact]
- **Tech Lead** : [Contact]
- **Support** : [Contact]

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Sentry Documentation](https://docs.sentry.io)

---

**Dernière mise à jour** : 8 Mars 2026
**Version** : 1.0.0
**Statut** : ✅ PRÊT POUR PRODUCTION
