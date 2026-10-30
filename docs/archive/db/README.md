# Guide d'installation de PostgreSQL pour KA Farm

Ce guide vous explique comment configurer une vraie base de données PostgreSQL pour le projet KA Farm.

## Option 1 : Installation locale (Windows)

### 1.1 Installer PostgreSQL

1. Téléchargez PostgreSQL depuis https://www.postgresql.org/download/windows/
2. Lancez l'installateur et suivez les étapes
3. **Important** : Notez le mot de passe que vous définissez pour l'utilisateur `postgres`
4. Port par défaut : `5432`

### 1.2 Créer la base de données

Après l'installation, ouvrez **pgAdmin** ou **SQL Shell** :

```sql
-- Créer la base de données
CREATE DATABASE kafarm;

-- Se connecter à la base de données
\c kafarm;

-- Exécuter le schéma
\i chemin/vers/schema.sql
```

Ou en ligne de commande :

```bash
psql -U postgres
CREATE DATABASE kafarm;
\c kafarm
\i db/schema.sql
```

### 1.3 Configurer le fichier `.env`

Créez un fichier `.env` dans le dossier racine du projet :

```env
# PostgreSQL Local
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=votre_mot_de_passe_ici
PG_DATABASE=kafarm
```

## Option 2 : Supabase (Cloud - Recommandé)

Supabase offre une base de données PostgreSQL gratuite et hébergée.

### 2.1 Créer un compte

1. Allez sur https://supabase.com
2. Créez un compte gratuit
3. Créez un nouveau projet

### 2.2 Récupérer les informations de connexion

Dans les paramètres du projet Supabase :

- **Database** > **Connection string** > **URI mode**

Copiez la chaîne de connexion, elle ressemble à :

```
postgresql://postgres.votre_projet_id:mot_de_passe@db.votre_projet_id.supabase.co:5432/postgres
```

### 2.3 Créer les tables

1. Dans Supabase, allez dans **SQL Editor**
2. Copiez le contenu de `db/schema.sql`
3. Exécutez le script SQL

### 2.4 Configurer le fichier `.env`

```env
# Supabase
PG_HOST=db.votre_projet_id.supabase.co
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=votre_mot_de_passe_supabase
PG_DATABASE=postgres
```

## Option 3 : Docker (Avancé)

Si vous avez Docker installé :

```bash
# Lancer PostgreSQL dans un conteneur
docker run --name kafarm-postgres \
  -e POSTGRES_PASSWORD=votre_mot_de_passe \
  -e POSTGRES_DB=kafarm \
  -p 5432:5432 \
  -d postgres:15

# Initialiser la base de données
docker exec -i kafarm-postgres psql -U postgres -d kafarm < db/schema.sql
```

## Vérification du fonctionnement

### Démarrer le serveur

```bash
npm run dev
```

### Vérifier les logs

Dans la console, vous devriez voir :

```
[DB] Connexion PostgreSQL établie avec succès
Server running at http://0.0.0.0:3000
Mode: PostgreSQL
```

Si vous voyez :

```
[DB] PostgreSQL non disponible, utilisation du mode fallback mémoire
```

Vérifiez :

1. PostgreSQL est bien démarré
2. Les paramètres dans `.env` sont corrects
3. La base de données `kafarm` existe
4. Les tables ont été créées avec `schema.sql`

## Structure de la base de données

Le schéma `db/schema.sql` crée automatiquement les tables :

- **users** - Utilisateurs et authentification
- **parcelles** - Gestion des parcelles agricoles
- **crops** - Suivi des cultures
- **nurseries** - Pépinières
- **stocks** - Inventaire et stocks
- **tasks** - Tâches d'entretien
- **finances** - Gestion financière
- **employees** - Employés agricoles
- **attendance** - Présences/pointage
- **employee_payments** - Paiements salariaux
- **cheptel** - Gestion du bétail/élevage
- **elevage_production** - Production laitière/œufs
- **elevage_health** - Suivi sanitaire du cheptel
- **messages** - Messages de discussion

## Mode Fallback

Si PostgreSQL n'est pas disponible, l'application fonctionne en mode **fallback mémoire** :

- Les données sont stockées en mémoire vive
- Les données sont perdues au redémarrage du serveur
- Aucune persistance des données

C'est pourquoi il est **fortement recommandé** d'utiliser PostgreSQL pour la production.

## Support

Pour toute question technique :

- Consultez la documentation PostgreSQL : https://www.postgresql.org/docs/
- Consultez la documentation Supabase : https://supabase.com/docs
