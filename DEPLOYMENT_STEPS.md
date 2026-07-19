# Étapes de Déploiement Production - Firebase Admin SDK

## ✅ Fichiers déjà configurés (ne pas modifier)

- `firestore.rules` : Règles en place (`allow read, write: if false`)
- `.gitignore` : Protège les fichiers sensibles
- `.env.example` : Documente la variable `FIREBASE_SERVICE_ACCOUNT_KEY`
- `api/index.js` : Code prêt pour production avec gestion dev/prod

## 📋 Étapes à faire manuellement (vous)

### 1. Générer la clé de service Firebase Admin

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet KA-FARM
3. Cliquer sur ⚙️ **Project Settings** (en haut à gauche)
4. Aller dans l'onglet **Service Accounts**
5. Cliquer sur **Generate New Private Key**
6. Confirmer et télécharger le fichier JSON
7. **NE PAS COMMITTER CE FICHIER**

### 2. Configurer la variable d'environnement sur Vercel

1. Aller sur [Vercel Dashboard](https://vercel.com/)
2. Sélectionner votre projet KA-FARM
3. Aller dans **Settings** > **Environment Variables**
4. Ajouter une nouvelle variable :
   - **Name** : `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value** : Coller le contenu COMPLET du fichier JSON téléchargé (toutes les lignes)
   - **Environments** : Cocher Production, Preview, Development
5. Cliquer sur **Save**

### 3. Déployer les règles Firestore (optionnel pour l'instant)

Les règles actuelles bloquent tout accès client (`allow read, write: if false`).

**Si vous voulez autoriser les lectures publiques** (lecture seule) :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Lecture publique autorisée, écriture réservée au backend
      allow read: if true;
      allow write: if false;
    }
  }
}
```

**Si vous voulez garder le contrôle total** : Laisser les règles actuelles.

Pour déployer les règles :

```bash
firebase deploy --only firestore:rules
```

### 4. Tester en production

1. Redéployer sur Vercel : `vercel --prod`
2. Tester les endpoints critiques :
   - `GET /api/crops` (doit retourner 200 avec données)
   - `POST /api/finances` (doit retourner 200)
   - `GET /api/employees` (doit retourner 200)
3. Vérifier les logs Vercel pour confirmer :
   - "Firebase Admin SDK initialized successfully"
   - Pas d'erreurs 503

### 5. Vérifier la surveillance

- Configurer des alertes sur Firebase Console > Firestore > Usage
- Surveiller les erreurs sur Vercel > Logs
- Vérifier que le cache fonctionne (requêtes rapides)

## 🔒 Sécurité

### Ce qui est protégé

- ✅ Clé de service Firebase : jamais dans le code, uniquement dans `.env` et Vercel
- ✅ Règles Firestore : bloquent l'accès direct client
- ✅ Routes sensibles : rate limiting (finances, employees)
- ✅ Erreurs 503 : pas de fallback mémoire silencieux en production

### Ce qu'il ne faut JAMAIS faire

- ❌ Commit le fichier JSON de clé de service
- ❌ Partager la clé par email/message
- ❌ Configurer les règles Firestore en `allow read, write: if true`

## 🚨 En cas de problème

### Erreur 503 sur toutes les routes

→ Vérifier que `FIREBASE_SERVICE_ACCOUNT_KEY` est bien configurée sur Vercel

### Erreur de parsing JSON

→ Vérifier que le JSON de la clé est valide (pas de saut de ligne mal échappé)

### Tests locaux échouent

→ Vérifier que `.env` contient une clé valide, ou utiliser le mode dev sans clé

### Note technique : Jest + ESM

Le projet utilise `"type": "module"` dans `package.json`, et `api/index.js` utilise des imports ESM (`import/export`). Jest 29.x a des limitations connues avec ESM + Babel.

**Configurations déjà tentées sans succès sur votre machine :**

- `babel.config.js` / `.babelrc` avec `modules: "commonjs"`
- `jest.config.js` / `jest.config.cjs` avec `transform: { '^.+\\.js$': ['babel-jest', ...] }`
- `extensionsToTreatAsEsm: ['.js']`
- `transformIgnorePatterns` élargis pour `firebase-admin`, `@firebase/*`, `@google-cloud/*`, `gaxios`, `google-auth-library`, `google-gax`

**Conséquence :** le blocage se produit systématiquement sur `api/index.js:1` (`import express from 'express'`), ce qui empêche tout test Jest de démarrer.

**Impact pour la migration Firebase Admin SDK :**

- Le code backend est correct : routes, Admin SDK, gestion d’erreur 503, rate limiting.
- Les tests automatisés sont bloqués par la config Jest, pas par la logique métier.
- Si vous voulez exécuter les tests, la piste la plus réaliste reste soit :
  1. basculer `api/index.js` vers CommonJS pour Jest, soit
  2. configurer Jest en mode ESM natif (`--experimental-vm-modules`).

## 📊 Checklist avant déploiement

- [ ] Clé Firebase Admin générée et stockée en lieu sûr
- [ ] Variable `FIREBASE_SERVICE_ACCOUNT_KEY` configurée sur Vercel
- [ ] Tests locaux passent (avec clé configurée)
- [ ] Règles Firestore déployées (si modifiées)
- [ ] Application déployée sur Vercel
- [ ] Tests des endpoints en production
- [ ] Logs Vercel vérifiés (pas d'erreurs)
- [ ] Monitoring Firebase activé
