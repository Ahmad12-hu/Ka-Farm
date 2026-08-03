# Guide de Configuration Firebase - KA Farm

## 📋 Vue d'Ensemble

Ce guide explique comment configurer les variables Firebase pour le déploiement production de KA-FARM sur Vercel.

## 🎯 Objectif

Configurer les variables d'environnement Firebase pour que l'application fonctionne en production.

---

## 🔑 Étape 1 : Récupérer les Clés Firebase

### 1.1 Aller sur Firebase Console

```
https://console.firebase.google.com
```

### 1.2 Sélectionner le Projet

- Ouvrir le projet **KA-FARM**
- Ou créer un nouveau projet si nécessaire

### 1.3 Accéder aux Paramètres du Projet

1. Cliquer sur l'**icône d'engrenage** ⚙️ (en haut à gauche)
2. Sélectionner **"Paramètres du projet"**
3. Aller dans l'onglet **"Général"**
4. Descendre jusqu'à **"Vos applications"**

### 1.4 Trouver les Clés API

Dans la section **"SDK setup and configuration"** :

```
┌─────────────────────────────────────────────────────────┐
│ Config                                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  const firebaseConfig = {                               │
│    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",      │
│    authDomain: "ka-farm.firebaseapp.com",               │
│    projectId: "ka-farm",                                │
│    storageBucket: "ka-farm.appspot.com",                │
│    messagingSenderId: "123456789012",                   │
│    appId: "1:123456789012:web:abc123def456"             │
│  };                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Copier ces 6 valeurs** :

- ✅ `apiKey`
- ✅ `authDomain`
- ✅ `projectId`
- ✅ `storageBucket`
- ✅ `messagingSenderId`
- ✅ `appId`

---

## ⚙️ Étape 2 : Configurer les Variables dans Vercel

### 2.1 Accéder à Vercel Dashboard

```
1. Aller sur https://vercel.com
2. Se connecter avec votre compte
3. Chercher le projet "Ka-Farm"
4. Cliquer sur le projet
```

### 2.2 Ouvrir les Paramètres

```
1. Cliquer sur l'onglet "Settings" (paramètres)
2. Dans le menu gauche, cliquer sur "Environment Variables"
```

### 2.3 Ajouter les Variables

Cliquer sur **"Add"** pour chaque variable :

#### Variable 1 : API Key

```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Environment: Production, Preview, Development
```

#### Variable 2 : Auth Domain

```
Name: VITE_FIREBASE_AUTH_DOMAIN
Value: ka-farm.firebaseapp.com
Environment: Production, Preview, Development
```

#### Variable 3 : Project ID

```
Name: VITE_FIREBASE_PROJECT_ID
Value: ka-farm
Environment: Production, Preview, Development
```

#### Variable 4 : Storage Bucket

```
Name: VITE_FIREBASE_STORAGE_BUCKET
Value: ka-farm.appspot.com
Environment: Production, Preview, Development
```

#### Variable 5 : Messaging Sender ID

```
Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 123456789012
Environment: Production, Preview, Development
```

#### Variable 6 : App ID

```
Name: VITE_FIREBASE_APP_ID
Value: 1:123456789012:web:abc123def456
Environment: Production, Preview, Development
```

### 2.4 Sauvegarder

```
1. Cliquer sur "Save" pour chaque variable
2. Vérifier que toutes les 6 variables sont présentes dans la liste
```

---

## 🚀 Étape 3 : Redéployer

### 3.1 Option A : Via Vercel Dashboard

```
1. Aller dans l'onglet "Deployments"
2. Cliquer sur "Redeploy" sur le dernier déploiement
3. Confirmer
```

### 3.2 Option B : Via Git Push

```bash
# Créer un commit vide pour déclencher le déploiement
git commit --allow-empty -m "chore: trigger deployment with Firebase config"
git push origin main
```

---

## ✅ Étape 4 : Vérifier la Configuration

### 4.1 Tester l'Application

```
1. Attendre le déploiement (2-3 min)
2. Ouvrir l'URL de production
3. Tester le login/register
4. Vérifier que Firebase fonctionne
```

### 4.2 Vérifier les Logs

```
1. Vercel Dashboard > Deployments
2. Cliquer sur le dernier déploiement
3. Vérifier les logs (pas d'erreur Firebase)
```

---

## 🔧 Étape 5 : Configuration Firebase (si nécessaire)

### 5.1 Activer Authentication

```
Firebase Console > Authentication > Sign-in method
- Activer "Email/Password"
- Activer "Google" (optionnel)
```

### 5.2 Créer la Base de Données Firestore

```
Firebase Console > Firestore Database > Create Database
- Mode : Test mode (pour développement)
- Location : europe-west3 (Frankfurt) ou us-central
```

### 5.3 Configurer les Règles de Sécurité

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5.4 Activer Storage (optionnel)

```
Firebase Console > Storage > Get Started
- Permissions : Autoriser tous les utilisateurs authentifiés
```

---

## 📋 Checklist de Vérification

### Variables Configurées

- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID

### Firebase Configuré

- [ ] Authentication activé
- [ ] Firestore créé
- [ ] Règles de sécurité déployées
- [ ] Storage activé (si nécessaire)

### Tests

- [ ] Application charge
- [ ] Login fonctionne
- [ ] Dashboard s'affiche
- [ ] Données se synchronisent

---

## 🚨 Troubleshooting

### Erreur : "Firebase not initialized"

**Cause** : Variables d'environnement manquantes
**Solution** :

1. Vérifier les variables dans Vercel Dashboard
2. Vérifier que les noms commencent par `VITE_`
3. Redéployer

### Erreur : "Invalid API Key"

**Cause** : API key incorrecte
**Solution** :

1. Vérifier la clé dans Firebase Console
2. Copier-coller à nouveau dans Vercel
3. Redéployer

### Erreur : "Project not found"

**Cause** : Project ID incorrect
**Solution** :

1. Vérifier le projectId dans Firebase Console
2. Vérifier la variable `VITE_FIREBASE_PROJECT_ID`
3. Redéployer

---

## 📊 Structure des Variables

### Format Correct

```bash
# .env (local)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Important

- ✅ Toutes les variables doivent commencer par `VITE_`
- ✅ Pas d'espaces autour du `=`
- ✅ Pas de guillemets
- ✅ Valeurs copiées exactement depuis Firebase Console

---

## 🎯 Exemple Complet

### Depuis Firebase Console

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-XXXX-XXXX-XXXX-XXXX-XXXX",
  authDomain: "ka-farm.firebaseapp.com",
  projectId: "ka-farm",
  storageBucket: "ka-farm.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:ABC123def456",
};
```

### À Ajouter dans Vercel

```
VITE_FIREBASE_API_KEY = AIzaSyD-XXXX-XXXX-XXXX-XXXX-XXXX
VITE_FIREBASE_AUTH_DOMAIN = ka-farm.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = ka-farm
VITE_FIREBASE_STORAGE_BUCKET = ka-farm.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789012
VITE_FIREBASE_APP_ID = 1:123456789012:web:ABC123def456
```

---

## 📚 Ressources

- [Firebase Console](https://console.firebase.google.com)
- [Vercel Dashboard](https://vercel.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)

---

**Dernière mise à jour** : 8 Mars 2026
**Version** : 1.0.0
**Statut** : ✅ GUIDE COMPLET
