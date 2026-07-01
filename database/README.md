# KA-FARM - Guide Base de Données PostgreSQL

## 📋 Vue d'ensemble

Ce guide explique comment migrer KA-FARM de Firebase/localStorage vers une base de données PostgreSQL relationnelle robuste.

## 🎯 Pourquoi PostgreSQL ?

- ✅ **Relations natives** : Liens entre fermes, parcelles, cultures, employés
- ✅ **Intégrité des données** : Contraintes FOREIGN KEY, NOT NULL, UNIQUE
- ✅ **Requêtes complexes** : Agrégations, statistiques financières avancées
- ✅ **Performance** : Indexation optimisée pour les requêtes fréquentes
- ✅ **Scalabilité** : Supporte des milliers d'exploitations
- ✅ **Transactions ACID** : Fiabilité des opérations critiques

## 🚀 Options de déploiement

### Option 1: Supabase (Recommandé - Gratuit)

**Avantages :**
- PostgreSQL managé (pas de serveur à gérer)
- API REST automatique
- Authentification intégrée
- Real-time (comme Firebase)
- Stockage de fichiers inclus
- Dashboard web pour gérer la base

**Étapes :**

1. **Créer un compte Supabase**
   - Allez sur https://supabase.com
   - Créez un nouveau projet "kafarm"

2. **Récupérer les credentials**
   ```bash
   # Dans le dashboard Supabase > Settings > API
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```

3. **Configurer les variables d'environnement**
   ```bash
   # Dans votre fichier .env
   DB_HOST=db.your-project.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your-db-password
   ```

4. **Exécuter la migration**
   ```bash
   node database/migrate.js
   ```

### Option 2: PostgreSQL Local

**Avantages :**
- Contrôle total
- Pas de dépendance externe
- Gratuit

**Étapes :**

1. **Installer PostgreSQL**
   ```bash
   # Windows
   # Télécharger: https://www.postgresql.org/download/windows/
   
   # macOS
   brew install postgresql@16
   brew services start postgresql@16
   
   # Linux (Ubuntu/Debian)
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Créer la base de données**
   ```bash
   # Se connecter à PostgreSQL
   psql -U postgres
   
   # Dans psql
   CREATE DATABASE kafarm_db;
   CREATE USER kafarm_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE kafarm_db TO kafarm_user;
   \q
   ```

3. **Configurer les variables d'environnement**
   ```bash
   # Dans votre fichier .env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=kafarm_db
   DB_USER=kafarm_user
   DB_PASSWORD=secure_password
   ```

4. **Exécuter la migration**
   ```bash
   node database/migrate.js
   ```

### Option 3: PostgreSQL Cloud (Railway, Render, AWS RDS)

**Avantages :**
- Scalabilité professionnelle
- Backups automatiques
- Haute disponibilité

**Exemple avec Railway:**
1. Créer un compte sur https://railway.app
2. Créer un nouveau projet PostgreSQL
3. Copier les variables d'environnement fournies
4. Exécuter la migration

## 📦 Installation des dépendances

```bash
npm install pg
```

## 🗄️ Structure de la base de données

### Tables principales (22 tables)

1. **fermes** - Exploitations agricoles
2. **utilisateurs** - Utilisateurs et rôles
3. **parcelles** - Parcelles de la ferme
4. **cultures** - Cultures en cours
5. **pepinieres** - Pépinières
6. **recoltes** - Récoltes enregistrées
7. **traitements_phytosanitaires** - Traitements et DAR
8. **stocks_intrants** - Stocks d'intrants
9. **mouvements_stock** - Entrées/sorties de stock
10. **employes** - Personnel
11. **presences** - Pointage des employés
12. **paiements_employes** - Salaires
13. **transactions_financieres** - Revenus/dépenses
14. **ventes** - Ventes de produits
15. **cheptel** - Animaux
16. **production_animale** - Lait, œufs, etc.
17. **sante_animale** - Santé vétérinaire
18. **taches** - Tâches et planning
19. **messages** - Discussion interne
20. **alertes** - Alertes météo et agricoles
21. **credits** - Emprunts et financements
22. **equipements** - Matériel et équipements

### Vues (3 vues pour les statistiques)

1. **vue_synthese_finances** - Synthèse financière par ferme
2. **vue_synthese_cultures** - Synthèse des cultures par ferme
3. **vue_alertes_stock** - Alertes de stock bas

## 🔧 Exécution de la migration

```bash
# 1. Assurez-vous que .env est configuré
cp .env.example .env
# Éditez .env avec vos credentials

# 2. Exécutez la migration
node database/migrate.js
```

## 📝 Utilisation dans le code

### Exemple: Récupérer les cultures d'une ferme

```javascript
import { query } from './database/config.js';

async function getCulturesByFerme(fermeId) {
  const result = await query(`
    SELECT c.*, p.nom_parcelle, p.surface_m2
    FROM cultures c
    JOIN parcelles p ON c.parcelle_id = p.id
    WHERE p.ferme_id = $1
    ORDER BY c.date_creation DESC
  `, [fermeId]);
  
  return result.rows;
}
```

### Exemple: Créer une nouvelle culture

```javascript
import { transaction } from './database/config.js';

async function createCulture(cultureData) {
  return await transaction(async (client) => {
    // Insérer la culture
    const result = await client.query(`
      INSERT INTO cultures (parcelle_id, nom_culture, variete, date_semis, statut)
      VALUES ($1, $2, $3, $4, 'pepiniere')
      RETURNING *
    `, [cultureData.parcelleId, cultureData.nom, cultureData.variete, cultureData.dateSemis]);
    
    // Mettre à jour le statut de la parcelle
    await client.query(`
      UPDATE parcelles
      SET statut = 'en_production', date_modification = NOW()
      WHERE id = $1
    `, [cultureData.parcelleId]);
    
    return result.rows[0];
  });
}
```

### Exemple: Statistiques financières

```javascript
async function getFinancialStats(fermeId) {
  const result = await query(`
    SELECT * FROM vue_synthese_finances
    WHERE ferme_id = $1
  `, [fermeId]);
  
  return result.rows[0];
}
```

## 🔄 Migration des données existantes

### Script de migration depuis localStorage

```javascript
import { query } from './database/config.js';
import { KAStorage } from './js/storage.js';

async function migrateFromLocalStorage() {
  console.log('🔄 Migration des données depuis localStorage...');
  
  // Migrer les cultures
  const cultures = KAStorage.getCrops();
  for (const culture of cultures) {
    await query(`
      INSERT INTO cultures (nom_culture, statut, water_status, fertilizer_status)
      VALUES ($1, $2, $3, $4)
    `, [culture.name, culture.status, culture.waterStatus, culture.fertilizerStatus]);
  }
  
  // Migrer les finances
  const finances = KAStorage.getFinances();
  for (const finance of finances) {
    await query(`
      INSERT INTO transactions_financieres (type_transaction, categorie, description, montant_fcfa, date_transaction)
      VALUES ($1, $2, $3, $4, $5)
    `, [finance.type === 'Revenu' ? 'revenu' : 'depense', finance.category, finance.description, finance.amount, finance.date]);
  }
  
  console.log('✅ Migration terminée');
}
```

## 🔒 Sécurité

### Hashage des mots de passe

```javascript
import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

### Variables d'environnement

Ne jamais commit les credentials dans Git. Utilisez toujours `.env` (dans .gitignore).

## 📊 Monitoring et maintenance

### Vérifier l'état de la base

```javascript
async function checkDatabaseHealth() {
  const result = await query(`
    SELECT 
      schemaname,
      tablename,
      n_tup_ins as inserts,
      n_tup_upd as updates,
      n_tup_del as deletes
    FROM pg_stat_user_tables
    ORDER BY schemaname, tablename
  `);
  
  console.table(result.rows);
}
```

### Backup automatique (Supabase)

Supabase fait des backups automatiques. Pour PostgreSQL local:

```bash
# Backup
pg_dump -U kafarm_user kafarm_db > backup.sql

# Restore
psql -U kafarm_user kafarm_db < backup.sql
```

## 🐛 Dépannage

### Erreur: "Connection refused"

- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez les credentials dans .env
- Vérifiez que le port 5432 n'est pas bloqué par un firewall

### Erreur: "Relation does not exist"

- La migration n'a pas été exécutée
- Exécutez `node database/migrate.js`

### Erreur: "Permission denied"

- Vérifiez que l'utilisateur a les droits GRANT sur la base
- Réexécutez les commandes GRANT dans psql

## 📚 Ressources

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation Supabase](https://supabase.com/docs)
- [pg (Node.js)](https://node-postgres.com/)

## 🎯 Prochaines étapes

1. ✅ Installer PostgreSQL ou créer un compte Supabase
2. ✅ Configurer les variables d'environnement
3. ✅ Exécuter la migration
4. ⏳ Mettre à jour les modules JS pour utiliser PostgreSQL
5. ⏳ Migrer les données existantes depuis localStorage
6. ⏳ Tester l'application
7. ⏳ Déployer en production
