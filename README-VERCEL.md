# Configuration Vercel - Variables d’environnement

## Problème

L’IA Gemini retourne : “Clé GEMINI_API_KEY non configurée. Veuillez l’ajouter dans l’onglet Environment Variables de Vercel..”

Ce message signifie que la variable `GEMINI_API_KEY` n’est pas définie dans Vercel.

## Solution

1. Va sur https://vercel.com et ouvre le projet **ka-farm**.
2. Clique sur l’onglet **Deployments**.
3. Clique sur le déploiement **Production** le plus récent.
4. Dans la page du déploiement, cherche **Environment Variables** ou **Variables d’environnement**.
5. Ajoute une variable :
   - Name : `GEMINI_API_KEY`
   - Value : ta clé Gemini obtenue depuis Google AI Studio
6. Clique sur **Save**.
7. Fais un **Redeploy** pour appliquer la variable.

## Alternative si tu ne vois pas “Settings”

- Dans la vue actuelle “Deployments”, regarde si tu vois un bouton **“...”** à côté du déploiement : il contient souvent **“Environment Variables”**.
- Si tu es sur l’interface en français du screenshot, cherche aussi :
  - **“Variables d’environnement”**
  - **“Paramètres”**
  - **“Project Settings”** en haut à droite

## Localement

Tu peux aussi créer un fichier `.env` à la racine avec :

```
GEMINI_API_KEY=ta_cle
```

Puis lancer :

```
node server.js
```
