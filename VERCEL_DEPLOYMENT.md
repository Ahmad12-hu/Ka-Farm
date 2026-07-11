# 🚀 KA Farm - Guide de Déploiement sur Vercel

**Déployez votre application KA Farm en production en 10 minutes !**

---

## 📋 Prérequis

- ✅ Compte [GitHub](https://github.com) (créé)
- ✅ Compte [Vercel](https://vercel.com) (à créer)
- ✅ Repository GitHub `Ka-Farm` pushé
- ✅ Clés Supabase configurées

---

## 🎯 Étape 1 : Créer un Compte Vercel

### 1.1 Inscription

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Sign Up"**
3. Choisir **"Continue with GitHub"**
4. Autoriser Vercel à accéder à vos repos GitHub

### 1.2 Vérification

- ✅ Email vérifié
- ✅ Compte GitHub connecté
- ✅ Accès au dashboard Vercel

---

## 📦 Étape 2 : Importer le Projet

### 2.1 Créer un Nouveau Projet

1. Dans Vercel Dashboard, cliquer sur **"Add New..."** → **"Project"**
2. Dans la liste des repos GitHub, trouver **"Ka-Farm"**
3. Cliquer sur **"Import"**

### 2.2 Configuration du Build

Vercel détecte automatiquement Vite. Vérifier :

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

**Si un champ est manquant** :

- Build Command : `npm run build`
- Output Directory : `dist`

---

## 🔐 Étape 3 : Configurer les Variables d'Environnement

### 3.1 Ouvrir les Settings

1. Dans la page d'import, cliquer sur **"Environment Variables"**
2. Ajouter les variables suivantes :

#### Variables Supabase (OBLIGATOIRES)

| Nom                      | Valeur                    | Où la trouver             |
| ------------------------ | ------------------------- | ------------------------- |
| `VITE_SUPABASE_URL`      | `https://xxx.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...`             | Supabase → Settings → API |

#### Variables Optionnelles

| Nom              | Valeur       | Description                    |
| ---------------- | ------------ | ------------------------------ |
| `GEMINI_API_KEY` | `AIzaSyD...` | Pour le chatbot IA (optionnel) |

### 3.2 Comment Récupérer les Clés Supabase

1. **Aller sur Supabase** : [supabase.com](https://supabase.com)
2. **Sélectionner votre projet** : `Ka-Farm`
3. **Aller dans Settings** (⚙️ en bas à gauche)
4. **Cliquer sur "API"**
5. **Copier** :
   - **URL** : `https://[PROJECT_ID].supabase.co`
   - **anon/public key** : La clé publique (commence par `eyJ`)

### 3.3 Ajouter dans Vercel

1. **Nom** : `VITE_SUPABASE_URL`
2. **Valeur** : `https://votre-projet.supabase.co`
3. **Environments** : ✅ Production ✅ Preview ✅ Development
4. **CLiquer sur "Add"**

Répéter pour `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Étape 4 : Déployer

### 4.1 Premier Déploiement

1. Vérifier que toutes les variables sont ajoutées
2. Cliquer sur **"Deploy"**
3. Attendre 2-3 minutes

### 4.2 Surveiller le Build

**Logs à surveiller** :

```
✓ Build completed successfully
✓ Deployment completed
```

**En cas d'erreur** :

- Vérifier les variables d'environnement
- Vérifier que `npm run build` fonctionne en local
- Consulter les logs d'erreur

---

## ✅ Étape 5 : Vérifier le Déploiement

### 5.1 Accéder au Site

1. Vercel attribue une URL : `https://ka-farm-xxx.vercel.app`
2. Cliquer sur **"Visit"** pour ouvrir le site
3. Vérifier que la page d'accueil se charge

### 5.2 Tester les Fonctionnalités

- [ ] Page d'accueil accessible
- [ ] Connexion fonctionne
- [ ] Navigation entre pages OK
- [ ] Thème vert s'affiche correctement
- [ ] Responsive mobile OK

---

## 🔧 Étape 6 : Configurer le Domaine Personnalisé (Optionnel)

### 6.1 Ajouter un Domaine

Si vous avez un domaine (ex: `kafarm.sn`) :

1. Aller dans **Project Settings** → **Domains**
2. Cliquer sur **"Add Domain"**
3. Entrer : `kafarm.sn`
4. Cliquer sur **"Verify DNS Configuration"**

### 6.2 Configurer le DNS

Chez votre registrar (godaddy, namecheap, etc.) :

```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

Ou pour le domaine racine :

```
Type: A
Host: @
Value: 76.76.21.21 (IP Vercel)
```

### 6.3 Activer HTTPS

Vercel active automatiquement HTTPS (certificat Let's Encrypt).

---

## 🔄 Étape 7 : Configuration des Auto-Déploiements

### 7.1 Déploiement automatique

À chaque push sur GitHub :

```bash
git add .
git commit -m "nouvelle feature"
git push
# → Vercel déploie automatiquement en 2-3 min
```

### 7.2 Branches de déploiement

- **Production** : Branch `main` → `https://kafarm.sn`
- **Preview** : Autres branches → `https://kafarm-git-branch.vercel.app`

---

## 📊 Étape 8 : Monitoring et Logs

### 8.1 Voir les Déploiements

1. Aller dans l'onglet **"Deployments"**
2. Voir l'historique complet
3. Statuts : ✅ Ready, ❌ Failed, ⏳ Building

### 8.2 Voir les Logs

1. Cliquer sur un déploiement
2. Onglet **"Function Logs"** : Logs serveur
3. Onglet **"Build Logs"** : Logs de compilation

---

## 🐛 Dépannage

### Problème 1 : "Build Failed"

**Cause** : Erreur de compilation  
**Solution** :

```bash
# Tester en local
npm run build

# Si erreur, corriger et re-pusher
```

### Problème 2 : "Module not found"

**Cause** : Dépendance manquante  
**Solution** :

```bash
npm install
git add package-lock.json
git commit -m "fix: add lock file"
git push
```

### Problème 3 : "Environment variable not found"

**Cause** : Variable mal configurée  
**Solution** :

1. Vérifier l'orthographe dans Vercel
2. Vérifier que c'est bien `VITE_` et pas `VITE`
3. Redéployer après modification

### Problème 4 : "Routes not found" (404)

**Cause** : Configuration SPA manquante  
**Solution** : Ajouter dans `vercel.json` :

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🔒 Sécurité en Production

### Checklist Avant Mise en Ligne

- [ ] Variables d'environnement configurées
- [ ] Pas de secrets dans le code (`.env` dans `.gitignore`)
- [ ] HTTPS activé
- [ ] RLS policies Supabase activées
- [ ] Authentification admin testée
- [ ] Backup de la base de données

### Recommandations

1. **Activer les preview deployments** pour tester avant prod
2. **Configurer des alerts** (email sur erreurs)
3. **Activer le cache** pour les assets statiques
4. **Limiter les déploiements** aux branches importantes

---

## 📈 Performance

### Optimisations Vercel Automatiques

- ✅ Compression Gzip/Brotli
- ✅ CDN mondial (Edge Network)
- ✅ Cache intelligent
- ✅ Image optimization (si utilisé)

### Vérifier les Performances

1. Aller dans **Analytics** du projet
2. Voir :
   - Temps de chargement moyen
   - Taux de succès (99.9% visé)
   - Erreurs 404/500

---

## 💰 Coûts

### Plan Gratuit (Hobby)

- **500 déploiements/mois** : ✅ Suffisant pour commencer
- **100 GB bandwidth/mois** : ✅ Suffisant pour petite équipe
- **HTTPS inclus** : ✅ Gratuit
- **Support communautaire** : ✅

### Plan Pro ($20/mois)

- Déploiements illimités
- 1TB bandwidth
- Support prioritaire
- Analytics avancées

**Recommandation** : Commencer par le plan gratuit, passer en Pro seulement si nécessaire.

---

## 🎯 Checklist Finale de Déploiement

### Avant le Premier Déploiement

- [ ] Repository GitHub pushé
- [ ] Compte Vercel créé et connecté
- [ ] Variables d'environnement configurées
- [ ] Build testé en local (`npm run build`)
- [ ] RLS policies Supabase exécutées
- [ ] Utilisateur admin créé

### Après le Déploiement

- [ ] Site accessible via URL Vercel
- [ ] Connexion fonctionne
- [ ] Navigation OK
- [ ] Theme vert s'affiche
- [ ] Responsive mobile testé
- [ ] Performance acceptable (< 3s chargement)

### En Production Continue

- [ ] Domain personnalisé configuré (optionnel)
- [ ] Monitoring activé
- [ ] Alertes configurées
- [ ] Backup automatique activé
- [ ] Équipe formée (voir TRAINING/)

---

## 📞 Support

**Problèmes de déploiement** :

- 📧 Email : `admin@kafarm.sn`
- 📚 Docs Vercel : [vercel.com/docs](https://vercel.com/docs)
- 💬 Community : [github.com/Ahmad12-hu/Ka-Farm/issues](https://github.com/Ahmad12-hu/Ka-Farm/issues)

---

**🎉 Félicitations ! Votre application KA Farm est maintenant en ligne !**

**URL** : `https://kafarm.vercel.app` (après configuration)

---

## 🚀 Prochaines Étapes

1. **Partager l'URL** avec l'équipe
2. **Former les utilisateurs** (voir TRAINING/)
3. **Collecter les retours**
4. **Itérer et améliorer**
5. **Déployer les mises à jour** automatiquement

---

**🌾 Bon déploiement et bonne récolte !**
