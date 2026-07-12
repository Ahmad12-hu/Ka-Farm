# Guide de Tests et Migrations - KA Farm

Ce document décrit les systèmes de tests et de migrations de base de données implémentés pour améliorer la qualité et la maintenabilité du projet.

---

## 🧪 Tests Unitaires et E2E

### Configuration

**Jest** pour les tests unitaires backend et **Cypress** pour les tests E2E frontend ont été ajoutés au projet.

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
```

### Lancer les tests

```bash
# Tests unitaires Jest
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture de code
npm run test:coverage

# Tests Cypress (interface graphique)
npm run cypress:open

# Tests Cypress (headless)
npm run cypress:run
```

### Structure des tests

```
__tests__/
  └── app.test.js          # Tests unitaires (KAStorage, UserManager, Validators)
cypress/
  ├── e2e/
  │   └── app.cy.js        # Tests E2E (à créer)
  └── support/
      └── commands.js      # Commandes Cypress personnalisées
```

### Exemples de tests

Les tests couvrent:

- ✅ Initialisation du stockage
- ✅ CRUD des utilisateurs
- ✅ Validation d'emails et téléphones sénégalais
- ✅ Validators Zod pour toutes les entités

---

## 🔍 Validation des Données (Zod)

### Configuration

**Zod** est utilisé pour valider toutes les données entrantes côté serveur, garantissant l'intégrité et la sécurité.

```javascript
import {
  validateData,
  ParcelleSchema,
  CropSchema,
  TreatmentSchema,
} from "./js/modules/validators.js";
```

### Schémas de validation disponibles

- `UserSchema` - Utilisateurs
- `ParcelleSchema` - Parcelles avec type de sol
- `CropSchema` - Cultures
- `TreatmentSchema` - Traitements phytosanitaires
- `FinanceSchema` - Transactions financières
- `EmployeeSchema` - Employés
- `StockSchema` - Stocks d'intrants
- `HarvestSchema` - Récoltes
- `SaleSchema` - Ventes
- `TaskSchema` - Tâches

### Utilisation

```javascript
// Validation simple
const result = validateData(ParcelleSchema, data);
if (!result.success) {
  return res.status(400).json({
    error: "Données invalides",
    details: result.errors,
  });
}

// Validation personnalisée
const emailResult = validateEmail("test@example.com");
const phoneResult = validatePhoneNumber("771234567");
```

### Avantages

✅ **Sécurité**: Empêche les données malveillantes ou corrompues
✅ **Typage**: Validation stricte des types
✅ **Messages d'erreur clairs**: Erreurs détaillées par champ
✅ **Réutilisable**: Mêmes schémas partagés entre frontend et backend

---

## 📊 Logging Structuré (Winston)

### Configuration

**Winston** avec rotation quotidienne des logs pour un monitoring professionnel.

```javascript
import { logger } from "./js/modules/logger.js";

// Utilisation
logger.info("Message saved", { messageId: "123" });
logger.error("Database error", { error: err.message, query: "SELECT..." });
logger.warn("Validation failed", { errors: validation.errors });
logger.http("POST /api/messages"); // Requêtes HTTP
logger.debug("Debug info", { data: response });
```

### Niveaux de log

- `error` - Erreurs critiques (logs/error-\*.log)
- `warn` - Avertissements (logs/combined-\*.log)
- `info` - Informations générales (logs/combined-\*.log)
- `http` - Requêtes HTTP (console uniquement)
- `debug` - Informations de debug (logs/debug-\*.log)

### Fichiers de logs

```
logs/
  ├── error-2024-01-15.log      # Erreurs uniquement
  ├── combined-2024-01-15.log   # Info + Warn
  └── debug-2024-01-15.log      # Debug
```

**Rotation automatique:**

- Archive quotidienne (YYYY-MM-DD)
- Compression gzip (.gz)
- Rétention: 14 jours
- Taille max: 20MB par fichier

### Intégration dans server.js

Toutes les requêtes API et erreurs sont maintenant loguées:

```javascript
// Avant
console.error("Error saving treatment to PostgreSQL:", err);

// Après
logger.error("Error saving treatment to PostgreSQL", {
  error: err.message,
  treatmentId: treatment.id,
});
```

---

## 🗄️ Système de Migrations

### Concept

Système de migrations versionnées pour gérer l'évolution du schéma de base de données de manière contrôlée et tracée.

### Commandes

```bash
# Voir le statut des migrations
npm run migrate:status

# Appliquer toutes les migrations en attente
npm run migrate:up

# Revenir en arrière (annuler la dernière migration)
npm run migrate:down
```

### Structure

```
db/
  ├── schema.sql              # Schéma complet legacy (50 tables)
  ├── 001_initial_schema.sql  # Migration initiale
  ├── 002_add_xxx.sql         # Futures migrations
  ├── migrate.js               # Outil de migration
  └── schema_migrations        # Table de suivi (créée auto)
```

### Créer une nouvelle migration

1. Créer un fichier SQL avec le format: `NNN_description.sql`
2. Numéro séquentiel (001, 002, 003...)
3. Contenu SQL idempotent (peut être exécuté plusieurs fois)

**Exemple:**

```sql
-- db/002_add_soil_type_to_parcelles.sql
BEGIN;

-- Ajouter la colonne type_sol si elle n'existe pas
ALTER TABLE parcelles
  ADD COLUMN IF NOT EXISTS type_sol VARCHAR(50) DEFAULT 'sableux';

-- Mettre à jour les valeurs existantes
UPDATE parcelles
SET type_sol = 'sableux'
WHERE type_sol IS NULL;

COMMIT;
```

### Table de suivi

La table `schema_migrations` enregistre:

- `version` - Numéro de migration (001, 002...)
- `name` - Nom du fichier
- `applied_at` - Date d'application
- `execution_time_ms` - Temps d'exécution

### Requête de statut

```bash
$ npm run migrate:status

📊 Statut des migrations

────────────────────────────────────────────────────────────────────────────────
Version    Nom                                        Statut
────────────────────────────────────────────────────────────────────────────────
001        initial_schema                             ✓ Appliquée
002        add_soil_type_to_parcelles                 ○ En attente
────────────────────────────────────────────────────────────────────────────────

Total: 1/2 migrations appliquées
```

### Workflow recommandé

```bash
# 1. Créer la migration SQL
# nano db/002_add_new_feature.sql

# 2. Vérifier le statut
npm run migrate:status

# 3. Appliquer
npm run migrate:up

# 4. Vérifier
npm run migrate:status

# 5. Commit
git add db/002_add_new_feature.sql
git commit -m "feat: add soil_type column to parcelles"
```

### Rollback

```bash
# Annuler la dernière migration
npm run migrate:down
```

**Note:** Le rollback supprime seulement l'enregistrement de la table `schema_migrations`. Pour rollback réel du SQL, utilisez des migrations DOWN séparées (à implémenter si nécessaire).

---

## 📋 Checklist d'Amélioration

### ✅ Complété

- [x] Ajout de Jest (tests unitaires)
- [x] Ajout de Cypress (tests E2E)
- [x] Intégration de Zod (validation)
- [x] Intégration de Winston (logging)
- [x] Système de migrations
- [x] Configuration Jest
- [x] Tests unitaires de base
- [x] Schémas Zod pour toutes les entités
- [x] Logger Winston avec rotation
- [x] Migration initiale SQL
- [x] Mise à jour .gitignore
- [x] Intégration dans server.js

### 🔄 À faire (optionnel)

- [ ] Ajouter des tests Cypress E2E complets
- [ ] Créer plus de tests unitaires (couverture >80%)
- [ ] Implémenter les migrations DOWN (rollback SQL)
- [ ] Ajouter des hooks pre/post migration
- [ ] Créer un healthcheck endpoint
- [ ] Ajouter Sentry pour monitoring erreurs production
- [ ] Implémenter des fixtures de test
- [ ] Ajouter des tests d'intégration API
- [ ] Créer des tests de charge (k6, Artillery)

---

## 🚀 Utilisation en Production

### Variables d'environnement

```env
# .env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=secret
PG_DATABASE=kafarm

# Logs
LOG_LEVEL=info  # error, warn, info, debug
```

### Migration en production

```bash
# 1. Backup de la base de données
pg_dump -U postgres kafarm > backup_$(date +%Y%m%d).sql

# 2. Appliquer les migrations
npm run migrate:up

# 3. Vérifier
npm run migrate:status

# 4. Redémarrer le serveur
npm start
```

### Monitoring

```bash
# Voir les logs en temps réel
tail -f logs/combined-$(date +%Y-%m-%d).log

# Erreurs uniquement
tail -f logs/error-$(date +%Y-%m-%d).log

# Statistiques
grep -c "ERROR" logs/*.log
```

---

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Zod Documentation](https://zod.dev/)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [PostgreSQL Migrations Best Practices](https://www.prisma.io/dataguide/postgresql/migrations)

---

**Dernière mise à jour:** 2024-01-15
**Version:** 1.0.0
**Auteur:** KA Farm Team
