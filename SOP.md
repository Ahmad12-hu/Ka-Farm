# Guide rapide : Configuration de Supabase pour KA Farm

## Étape 1 : Créer un compte Supabase

1. Ouvrez votre navigateur et allez sur **https://supabase.com**
2. Cliquez sur **"Démarrer"** ou **"Start your project"**
3. Vous pouvez vous inscrire avec :
   - GitHub (recommandé)
   - Google
   - Email
4. Confirmez votre email si nécessaire

## Étape 2 : Créer un nouveau projet

1. Une fois connecté, cliquez sur **"Nouveau projet"**
2. Remplissez les informations :
   - **Nom du projet** : `kafarm` (ou nom de votre choix)
   - **Mot de passe de la base de données** : Choisissez un mot de passe fort (**IMPORTANT : notez-le !**)
   - **Région** : Choisissez la région la plus proche (ex: `Europe Ouest` ou `Asie Pacifique`)
3. Cliquez sur **"Créer un nouveau projet"**
4. Attendez 1-2 minutes que le projet soit créé

## Étape 3 : Récupérer la chaîne de connexion

1. Dans votre projet Supabase, cliquez sur **"Paramètres"** (icône engrenage en bas à gauche)
2. Dans le menu, sélectionnez **"Base de données"**
3. Descendez jusqu'à **"Chaîne de connexion"**
4. Cliquez sur l'onglet **"Mode URI"**
5. Vous verrez une chaîne de connexion comme celle-ci :

```
postgresql://postgres:QVGHkICyVaBpoWCS@db.project_id.supabase.co:5432/postgres
```

6. **Copiez cette chaîne** (Ctrl+C)

## Étape 4 : Configurer le fichier .env

Dans le dossier du projet KA Farm, trouvez le fichier `.env` (s'il n'existe pas, copiez `.env.example` vers `.env`).

Remplacez les paramètres PostgreSQL par ceux de Supabase :

```env
# Configuration Supabase
PG_HOST=db.votre_projet_id.supabase.co
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=votre_mot_de_passe_supabase
PG_DATABASE=postgres
```

**Remplacez les valeurs ci-dessus par les vôtres :**

- `votre_projet_id` : l'ID de votre projet Supabase
- `votre_mot_de_passe_supabase` : le mot de passe que vous avez défini

## Étape 5 : Créer les tables dans Supabase

1. Dans Supabase, allez dans **"Éditeur SQL"** (icône terminal dans le menu gauche)
2. Cliquez sur **"Nouvelle requête"**
3. Ouvrez le fichier `db/schema.sql` dans votre projet KA Farm
4. Copiez TOUT le contenu du fichier
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **"Exécuter"** (ou appuyez sur Ctrl+Entrée)
7. Vous devriez voir : `Succès. Aucune ligne retournée`

**Les tables sont maintenant créées !**

## Étape 5bis : Configurer les politiques d'accès (RLS)

Supabase nécessite des politiques de sécurité pour permettre l'accès aux tables :

1. Toujours dans **"Éditeur SQL"**, cliquez sur **"Nouvelle requête"**
2. Ouvrez le fichier `db/policies.sql` dans votre projet KA Farm
3. Copiez TOUT le contenu du fichier
4. Collez-le dans l'éditeur SQL de Supabase
5. Cliquez sur **"Exécuter"** (ou appuyez sur Ctrl+Entrée)
6. Vous devriez voir : `Politiques RLS créées avec succès pour toutes les tables`

✅ **Les politiques d'accès sont maintenant configurées !**

## Étape 6 : Vérifier que ça fonctionne

1. Ouvrez un terminal dans le dossier du projet
2. Démarrez le serveur :

```bash
npm run dev
```

3. Dans la console, vous devriez voir :

```
[DB] Connexion PostgreSQL établie avec succès
Server running at http://0.0.0.0:3000
Mode: PostgreSQL
```

**Félicitations !** Vous êtes maintenant connecté à PostgreSQL via Supabase.

## Étape 7 : Tester l'application

1. Ouvrez votre navigateur : **http://localhost:3000**
2. Connectez-vous avec un compte :
   - Email : `moussa@kafarm.sn`
   - Mot de passe : `moussa-village`
3. Testez les fonctionnalités :
   - Page d'élevage : http://localhost:3000/pages/shared/elevage.html
   - Guide de formation : http://localhost:3000/pages/shared/training.html
4. Ajoutez/modifiez des données et vérifiez qu'elles sont bien sauvegardées

## Dépannage

### Erreur : "PostgreSQL non disponible"

Vérifiez :

1. Le fichier `.env` est bien configuré
2. Le mot de passe est correct
3. L'URL de connexion est exacte
4. Le projet Supabase est bien actif

### Erreur de connexion

Dans Supabase :

- Allez dans Paramètres > Base de données
- Vérifiez que la connexion est active
- Regénérez le mot de passe si nécessaire

### Les tables n'existent pas

Exécutez à nouveau le script `db/schema.sql` dans l'Éditeur SQL de Supabase.

## Avantages de Supabase

✅ **Gratuit** pour commencer (jusqu'à 500 Mo de données)
✅ **Pas d'installation** nécessaire sur votre ordinateur
✅ **Accès depuis n'importe où** (cloud)
✅ **Sauvegarde automatique** des données
✅ **Interface web** pour gérer vos données
✅ **Évolutif** si votre projet grandit

## Passer en production

Quand votre application sera prête, vous pourrez :

1. Déployer sur Vercel (déjà configuré)
2. Utiliser la même base de données Supabase
3. Les données seront accessibles depuis le monde entier

## Support

- Documentation Supabase : https://supabase.com/docs
- Discord Supabase : https://discord.supabase.com
