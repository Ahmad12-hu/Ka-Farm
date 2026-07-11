2# Configuration de la Base de Données PostgreSQL - KA Farm

## 🎯 Objectif

Connecter votre projet KA Farm à une vraie base de données PostgreSQL via Supabase.

## 📋 Prérequis

- Un compte Supabase (déjà créé : projet "Ka-Farm")
- Le fichier `.env` configuré
- Le serveur démarré avec `npm run dev`

## 🚀 Configuration en 5 étapes

### Étape 1 : Récupérer les informations de connexion Supabase

Dans votre projet Supabase "Ka-Farm" :

1. Cliquez sur **⚙️ Paramètres** (en bas à gauche)
2. Sélectionnez **Base de données**
3. Descendez jusqu'à **Chaîne de connexion**
4. Cliquez sur **Mode URI**
5. Copiez la chaîne de connexion

Exemple :

```
postgresql://postgres:MotDePasse123@db.abcdefg.supabase.co:5432/postgres
```

### Étape 2 : Créer le fichier `.env`

Dans le dossier racine du projet, créez un fichier `.env` :

```env
# Configuration Supabase
PG_HOST=db.abcdefg.supabase.co
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=MotDePasse123
PG_DATABASE=postgres

# Gemini AI (déjà configuré)
GEMINI_API_KEY=AIzaSyDvBwiYrxsGgnJLoJrBqQAAB0oSZoQBSLk

# Application
NODE_ENV=development
PORT=3000
```

**Remplacez les valeurs par les vôtres !**

### Étape 3 : Créer les tables

1. Dans Supabase, allez dans **Éditeur SQL** (icône terminal)
2. Ouvrez le fichier `db/schema.sql` du projet
3. Copiez tout le contenu
4. Collez dans l'éditeur SQL de Supabase
5. Cliquez sur **Exécuter**
6. Vous devriez voir : `Succès. Aucune ligne retournée`

### Étape 4 : Configurer les politiques d'accès

1. Toujours dans **Éditeur SQL**, cliquez sur **Nouvelle requête**
2. Ouvrez le fichier `db/policies.sql` du projet
3. Copiez tout le contenu
4. Collez dans l'éditeur SQL de Supabase
5. Cliquez sur **Exécuter**
6. Vous devriez voir : `Politiques RLS créées avec succès pour toutes les tables`

### Étape 5 : Démarrer le serveur

```bash
npm run dev
```

Vous devriez voir :

```
[DB] Connexion PostgreSQL établie avec succès
Server running at http://0.0.0.0:3000
Mode: PostgreSQL
```

## ✅ Vérification

### Test 1 : Vérifier la connexion

```bash
# Dans un terminal
curl http://localhost:3000/api/cheptel
```

Vous devriez recevoir du JSON avec les données du cheptel.

### Test 2 : Tester l'application

1. Ouvrez http://localhost:3000
2. Connectez-vous avec : `moussa@kafarm.sn` / `moussa-village`
3. Ajoutez un groupe d'élevage
4. Vérifiez dans Supabase > Table Editor > cheptel que la donnée est bien sauvegardée

## 📊 Structure de la base de données

Votre base de données Supabase contient maintenant 14 tables :

- **users** - Utilisateurs
- **parcelles** - Parcelles agricoles
- **crops** - Cultures
- **nurseries** - Pépinières
- **stocks** - Stocks et inventaire
- **tasks** - Tâches
- **finances** - Transactions financières
- **employees** - Employés
- **attendance** - Présences
- **employee_payments** - Paiements
- **cheptel** - Bétail
- **elevage_production** - Production (lait, œufs)
- **elevage_health** - Santé du bétail
- **messages** - Messages

## 🔧 Dépannage

### Erreur : "PostgreSQL non disponible"

**Causes possibles :**

1. Fichier `.env` manquant ou mal configuré
2. Mot de passe incorrect
3. Projet Supabase non actif

**Solutions :**

1. Vérifiez le fichier `.env`
2. Testez la connexion dans Supabase > Settings > Database
3. Redémarrez le serveur

### Erreur : "relation 'xxx' does not exist"

**Cause :** Les tables n'ont pas été créées

**Solution :**

1. Allez dans Supabase > Éditeur SQL
2. Exécutez le contenu de `db/schema.sql`

### Erreur : "permission denied for table xxx"

**Cause :** Les politiques RLS n'ont pas été créées

**Solution :**

1. Allez dans Supabase > Éditeur SQL
2. Exécutez le contenu de `db/policies.sql`

## 🎓 Comptes de test

- **Moussa** (Terrain) : `moussa@kafarm.sn` / `moussa-village`
- **Aly** (Bureau) : `aly@kafarm.sn` / `aly-dakar`
- **Amadou** (Bureau) : `contact@kafarm.sn` / `password`

## 📚 Documentation

- Guide Supabase : `SOP.md`
- Schéma complet : `db/schema.sql`
- Politiques RLS : `db/policies.sql`
- Guide PostgreSQL : `db/README.md`

## 🎉 Félicitations !

Vous avez maintenant une vraie base de données PostgreSQL cloud pour votre projet KA Farm !

**Prochaines étapes :**

- Testez toutes les fonctionnalités
- Ajoutez vos propres données
- Déployez sur Vercel avec la même base de données
