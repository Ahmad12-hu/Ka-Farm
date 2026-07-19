# Configuration de la sécurité Firebase - KA Farm

## Vue d'ensemble

Cette documentation explique comment sécuriser Firestore pour KA-Farm en utilisant Firebase Admin SDK côté backend.

## Architecture de sécurité

```
Frontend (localStorage + KAStorage)
    ↓ Lecture/Écriture
Backend Express (api/index.js)
    ↓ Firebase Admin SDK (authentifié)
Firebase Firestore (règles restrictives)
```

**Principe** : Le client ne peut ni lire ni écrire directement dans Firestore. Toutes les opérations passent par le backend qui utilise Firebase Admin SDK avec des droits administrateur.

## Étape 1 : Déployer les règles Firestore

### Option A - Via Firebase CLI (recommandé)

```bash
firebase deploy --only firestore:rules
```

### Option B - Via Console Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner le projet `lively-ethos-5k76w`
3. Naviguer vers **Firestore Database** → **Rules**
4. Copier le contenu de `firestore.rules` :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Toutes les opérations doivent passer par le backend (Firebase Admin SDK)
      // Le client ne peut ni lire ni écrire directement
      allow read, write: if false;
    }
  }
}
```
5. Cliquer sur **Publier**

## Étape 2 : Générer un Service Account Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner le projet `lively-ethos-5k76w`
3. Naviguer vers **Project Settings** (icône engrenage)
4. Onglet **Service Accounts**
5. Cliquer sur **Generate New Private Key**
6. Sélectionner **JSON** et cliquer sur **Generate**
7. **IMPORTANT** : Télécharger et sécuriser ce fichier. Ne jamais le committer dans Git.

## Étape 3 : Configurer la variable d'environnement

### Pour le développement local

1. Ouvrir `.env.local` (créer le fichier s'il n'existe pas)
2. Ajouter la variable `FIREBASE_SERVICE_ACCOUNT_KEY` avec le contenu JSON du service account en une seule ligne :
```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"lively-ethos-5k76w","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Note** : Remplacer tous les sauts de ligne par `\n` pour avoir le JSON sur une seule ligne.

### Pour Vercel (production)

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet KA-Farm
3. Naviguer vers **Settings** → **Environment Variables**
4. Ajouter une nouvelle variable :
   - **Name** : `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value** : Coller le contenu JSON du service account (une seule ligne)
   - **Environment** : Sélectionner **Production**, **Preview**, et **Development**
5. Cliquer sur **Save**
6. Redéployer le projet

## Étape 4 : Vérifier le déploiement

### Tester localement

```bash
npm run dev
```

Vérifier dans les logs que vous voyez :
```
Firebase Admin SDK initialized successfully
```

### Tester en production

1. Déployer sur Vercel :
```bash
vercel --prod
```

2. Vérifier les logs Vercel pour confirmer l'initialisation du Firebase Admin SDK

## Sécurité

### Ce qui est sécurisé

✅ **Lecture Firestore** : Seul le backend peut lire via Firebase Admin SDK  
✅ **Écriture Firestore** : Seul le backend peut écrire via Firebase Admin SDK  
✅ **Service Account** : Jamais commité dans Git (protégé par .gitignore)  
✅ **Validation** : Toutes les entrées sont validées avec Zod côté backend  
✅ **Rate Limiting** : Protection contre les abus via express-rate-limit  

### Ce qui reste à faire

⚠️ **Authentification frontend** : Actuellement basée sur localStorage (à améliorer avec Firebase Auth ou JWT)  
⚠️ **CORS** : Configuré pour localhost en développement, à restreindre en production  

## Dépannage

### Erreur : "FIREBASE_SERVICE_ACCOUNT_KEY not set"

**Cause** : La variable d'environnement n'est pas configurée  
**Solution** : Suivre l'Étape 3 ci-dessus

### Erreur : "Firebase Admin SDK initialization failed"

**Cause** : Le JSON du service account est invalide ou mal formaté  
**Solution** : Vérifier que le JSON est sur une seule ligne avec `\n` pour les sauts de ligne

### Erreur : "Missing or insufficient permissions"

**Cause** : Les règles Firestore ne sont pas encore déployées  
**Solution** : Suivre l'Étape 1 ci-dessus

## Structure des collections Firestore

Les données sont stockées dans la collection `app_data` avec les sous-collections suivantes :

- `crops` : Cultures
- `parcelles` : Parcelles
- `tasks` : Tâches
- `finances` : Finances
- `employees` : Employés
- `stocks` : Stocks
- `cheptel` : Cheptel
- `elevage_production` : Production élevage
- `elevage_health` : Santé élevage
- `treatments` : Traitements phytosanitaires
- `crop_profits` : Rentabilité des cultures
- `messages` : Messages
- `users` : Utilisateurs

## Maintenance

### Rotation des clés

Il est recommandé de faire une rotation régulière des clés de service account :

1. Générer une nouvelle clé de service account
2. Mettre à jour la variable d'environnement
3. Supprimer l'ancienne clé
4. Redéployer

### Surveillance

Surveillez les logs Firebase pour détecter toute activité suspecte :
- Firebase Console → Firestore → Usage
- Firebase Console → Project Settings → Service Accounts
