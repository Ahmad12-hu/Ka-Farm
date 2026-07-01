# Guide de Migration : Firebase/localStorage vers PostgreSQL

Ce guide explique comment migrer progressivement votre code existant vers PostgreSQL.

## 📋 État Actuel

**Avant (Firebase + localStorage):**
```javascript
// js/storage.js
export const KAStorage = {
  getCrops() {
    return this.get('ka_farm_crops', DEFAULT_CROPS);
  },
  saveCrops(crops) {
    this.set('ka_farm_crops', crops);
  }
};
```

**Après (PostgreSQL):**
```javascript
// database/models.js
import { CultureModel } from './database/models.js';

const cultures = await CultureModel.getByFerme(fermeId);
```

## 🔄 Stratégie de Migration Progressive

Ne remplacez pas tout en une seule fois. Migrez module par module :

### Phase 1 : Infrastructure (✅ Déjà fait)
- ✅ Schéma SQL créé
- ✅ Configuration PostgreSQL
- ✅ Modèles de données créés
- ✅ Script de migration prêt

### Phase 2 : Backend API (À faire)
Migrer d'abord les endpoints API dans `server.js`

### Phase 3 : Frontend Modules (À faire)
Migrer progressivement chaque module JS

## 📝 Exemples de Migration par Module

### Module 1 : Cultures (`js/modules/crops.js`)

**Avant :**
```javascript
// js/modules/crops.js
import { KAStorage } from '../storage.js';

export function loadCrops() {
  return KAStorage.getCrops();
}

export function saveCrop(crop) {
  const crops = KAStorage.getCrops();
  crops.push(crop);
  KAStorage.saveCrops(crops);
}
```

**Après :**
```javascript
// js/modules/crops.js
import { CultureModel } from '../../database/models.js';
import { KAStorage } from '../storage.js';

export async function loadCrops() {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    // Fallback vers localStorage si pas de ferme
    return KAStorage.getCrops();
  }
  return await CultureModel.getByFerme(user.fermeId);
}

export async function saveCrop(cropData) {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    // Fallback vers localStorage
    const crops = KAStorage.getCrops();
    crops.push(cropData);
    KAStorage.saveCrops(crops);
    return cropData;
  }
  return await CultureModel.create({
    ...cropData,
    ferme_id: user.fermeId
  });
}
```

### Module 2 : Finances (`js/modules/finances.js`)

**Avant :**
```javascript
// js/modules/finances.js
import { KAStorage } from '../storage.js';

export function loadFinances() {
  return KAStorage.getFinances();
}

export function addFinance(finance) {
  const finances = KAStorage.getFinances();
  finances.push(finance);
  KAStorage.saveFinances(finances);
}
```

**Après :**
```javascript
// js/modules/finances.js
import { TransactionModel } from '../../database/models.js';
import { KAStorage } from '../storage.js';

export async function loadFinances() {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    return KAStorage.getFinances();
  }
  return await TransactionModel.getByFerme(user.fermeId);
}

export async function addFinance(financeData) {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    const finances = KAStorage.getFinances();
    finances.push(financeData);
    KAStorage.saveFinances(finances);
    return financeData;
  }
  
  const typeTransaction = financeData.type === 'Revenu' ? 'revenu' : 'depense';
  return await TransactionModel.create({
    ferme_id: user.fermeId,
    type_transaction: typeTransaction,
    categorie: financeData.category,
    description: financeData.description,
    montant_fcfa: financeData.amount,
    date_transaction: financeData.date,
    mode_paiement: 'especes',
    enregistre_par: user.email
  });
}

export async function getFinancialStats() {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    return KAStorage.getFinanceStats();
  }
  return await TransactionModel.getSynthese(user.fermeId);
}
```

### Module 3 : Stocks (`js/modules/stocks.js`)

**Avant :**
```javascript
// js/modules/stocks.js
import { KAStorage } from '../storage.js';

export function loadStocks() {
  return KAStorage.getStocks();
}

export function updateStock(stock) {
  const stocks = KAStorage.getStocks();
  const index = stocks.findIndex(s => s.id === stock.id);
  if (index !== -1) {
    stocks[index] = stock;
    KAStorage.saveStocks(stocks);
  }
}
```

**Après :**
```javascript
// js/modules/stocks.js
import { StockModel } from '../../database/models.js';
import { KAStorage } from '../storage.js';

export async function loadStocks() {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    return KAStorage.getStocks();
  }
  return await StockModel.getByFerme(user.fermeId);
}

export async function getStockAlerts() {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    // Fallback: calculer les alertes manuellement
    const stocks = KAStorage.getStocks();
    return stocks.filter(s => s.quantity <= s.maxQuantity * 0.5);
  }
  return await StockModel.getAlertes(user.fermeId);
}

export async function updateStockQuantity(stockId, nouvelleQuantite) {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    const stocks = KAStorage.getStocks();
    const index = stocks.findIndex(s => s.id === stockId);
    if (index !== -1) {
      stocks[index].quantity = nouvelleQuantite;
      KAStorage.saveStocks(stocks);
    }
    return;
  }
  await StockModel.updateQuantite(stockId, nouvelleQuantite, user.email);
}
```

### Module 4 : Employés (`js/modules/employees.js`)

**Avant :**
```javascript
// js/modules/employees.js
import { KAStorage } from '../storage.js';

export function loadEmployees() {
  return KAStorage.getEmployees();
}

export function addEmployee(employee) {
  const employees = KAStorage.getEmployees();
  employees.push(employee);
  KAStorage.saveEmployees(employees);
}
```

**Après :**
```javascript
// js/modules/employees.js
import { EmployeModel, PresenceModel, PaiementEmployeModel } from '../../database/models.js';
import { KAStorage } from '../storage.js';

export async function loadEmployees() {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    return KAStorage.getEmployees();
  }
  return await EmployeModel.getByFerme(user.fermeId);
}

export async function addEmployee(employeeData) {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    const employees = KAStorage.getEmployees();
    employees.push(employeeData);
    KAStorage.saveEmployees(employees);
    return employeeData;
  }
  return await EmployeModel.create({
    ...employeeData,
    ferme_id: user.fermeId
  });
}

export async function recordPresence(presenceData) {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    // Fallback localStorage pour les présences
    const attendance = KAStorage.getAttendance();
    attendance.push(presenceData);
    KAStorage.saveAttendance(attendance);
    return presenceData;
  }
  return await PresenceModel.create({
    ...presenceData,
    enregistre_par: user.email
  });
}

export async function getEmployeePayments(employeeId) {
  const user = KAStorage.getCurrentUser();
  if (!user || !user.fermeId) {
    const payments = KAStorage.getEmployeePayments();
    return payments.filter(p => p.employeeId === employeeId);
  }
  return await PaiementEmployeModel.getByEmploye(employeeId);
}
```

## 🔧 Mise à jour de `server.js`

Ajoutez les endpoints PostgreSQL à votre serveur existant :

```javascript
// server.js
import { query } from './database/config.js';
import { CultureModel, TransactionModel, StockModel } from './database/models.js';

// Endpoint pour tester la connexion PostgreSQL
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'ok', timestamp: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Endpoint pour récupérer les cultures (PostgreSQL)
app.get('/api/cultures-postgres', async (req, res) => {
  try {
    const { fermeId } = req.query;
    if (!fermeId) {
      return res.status(400).json({ error: 'fermeId requis' });
    }
    const cultures = await CultureModel.getByFerme(fermeId);
    res.json(cultures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour créer une culture (PostgreSQL)
app.post('/api/cultures-postgres', async (req, res) => {
  try {
    const culture = await CultureModel.create(req.body);
    res.json(culture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour les statistiques financières
app.get('/api/financial-stats', async (req, res) => {
  try {
    const { fermeId } = req.query;
    if (!fermeId) {
      return res.status(400).json({ error: 'fermeId requis' });
    }
    const stats = await TransactionModel.getSynthese(fermeId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🔐 Mise à jour de l'Authentification

**Avant (localStorage):**
```javascript
// js/user-manager.js
export const UserManager = {
  login(email, password) {
    const users = KAStorage.getUsers();
    const user = users.find(u => u.email === email && u.password === KAStorage.hashPassword(password));
    if (user) {
      KAStorage.setCurrentUser(user);
      return true;
    }
    return false;
  }
};
```

**Après (PostgreSQL + bcrypt):**
```javascript
// js/user-manager.js
import bcrypt from 'bcrypt';
import { UtilisateurModel } from '../database/models.js';

export const UserManager = {
  async login(email, password) {
    // Essayer PostgreSQL d'abord
    try {
      const user = await UtilisateurModel.getByEmail(email);
      if (user && await bcrypt.compare(password, user.password_hash)) {
        await UtilisateurModel.updateLastLogin(user.id);
        KAStorage.setCurrentUser({
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          role: user.role,
          fermeId: user.ferme_id
        });
        return true;
      }
    } catch (error) {
      console.error('Erreur login PostgreSQL:', error);
    }
    
    // Fallback vers localStorage
    const users = KAStorage.getUsers();
    const localUser = users.find(u => u.email === email && u.password === KAStorage.hashPassword(password));
    if (localUser) {
      KAStorage.setCurrentUser(localUser);
      return true;
    }
    return false;
  }
};
```

## 📊 Script de Migration des Données Existantes

Créez un script pour migrer les données localStorage vers PostgreSQL :

```javascript
// database/migrate-data.js
import { query } from './config.js';
import { KAStorage } from '../js/storage.js';

async function migrateAllData() {
  console.log('🔄 Migration des données depuis localStorage vers PostgreSQL...');
  
  // 1. Migrer les cultures
  console.log('📝 Migration des cultures...');
  const cultures = KAStorage.getCrops();
  for (const culture of cultures) {
    try {
      // Trouver ou créer la parcelle correspondante
      const parcelleResult = await query(
        'SELECT id FROM parcelles WHERE nom_parcelle = $1',
        [culture.field]
      );
      
      if (parcelleResult.rows.length > 0) {
        await query(`
          INSERT INTO cultures (parcelle_id, nom_culture, statut, water_status, fertilizer_status, date_creation)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [parcelleResult.rows[0].id, culture.name, culture.status, culture.waterStatus, culture.fertilizerStatus]);
      }
    } catch (error) {
      console.error('Erreur migration culture:', culture.name, error.message);
    }
  }
  
  // 2. Migrer les finances
  console.log('💰 Migration des finances...');
  const finances = KAStorage.getFinances();
  for (const finance of finances) {
    try {
      const typeTransaction = finance.type === 'Revenu' ? 'revenu' : 'depense';
      await query(`
        INSERT INTO transactions_financieres (ferme_id, type_transaction, categorie, description, montant_fcfa, date_transaction, mode_paiement)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [1, typeTransaction, finance.category, finance.description, finance.amount, finance.date, 'especes']);
    } catch (error) {
      console.error('Erreur migration finance:', finance.description, error.message);
    }
  }
  
  // 3. Migrer les stocks
  console.log('📦 Migration des stocks...');
  const stocks = KAStorage.getStocks();
  for (const stock of stocks) {
    try {
      await query(`
        INSERT INTO stocks_intrants (ferme_id, intrant_nom, categorie, quantite_disponible, unite_mesure, quantite_miniale)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [1, stock.name, stock.category, stock.quantity, stock.unit, stock.maxQuantity * 0.3]);
    } catch (error) {
      console.error('Erreur migration stock:', stock.name, error.message);
    }
  }
  
  console.log('✅ Migration terminée!');
}

migrateAllData();
```

## 🧪 Tests de Migration

Testez chaque module après migration :

```javascript
// tests/test-cultures.js
import { CultureModel } from '../database/models.js';

async function testCultures() {
  console.log('🧪 Test du module Cultures...');
  
  // Test 1: Créer une culture
  const newCulture = await CultureModel.create({
    parcelle_id: 'uuid-de-la-parcelle',
    nom_culture: 'Tomate Test',
    variete: 'Mongal F1',
    date_semis: '2026-07-01',
    statut: 'pepiniere'
  });
  console.log('✅ Culture créée:', newCulture);
  
  // Test 2: Récupérer les cultures
  const cultures = await CultureModel.getByFerme('uuid-de-la-ferme');
  console.log('✅ Cultures récupérées:', cultures.length);
  
  // Test 3: Mettre à jour une culture
  const updated = await CultureModel.update(newCulture.id, {
    nom_culture: 'Tomate Test Modifiée',
    statut: 'croissance'
  });
  console.log('✅ Culture mise à jour:', updated);
  
  console.log('🎉 Tests terminés avec succès!');
}

testCultures();
```

## 📋 Checklist de Migration

- [ ] Installer PostgreSQL ou créer compte Supabase
- [ ] Configurer les variables d'environnement (.env)
- [ ] Installer les dépendances (`npm install pg bcrypt`)
- [ ] Exécuter la migration (`node database/migrate.js`)
- [ ] Tester la connexion (`node database/config.js`)
- [ ] Migrer le module Authentification
- [ ] Migrer le module Cultures
- [ ] Migrer le module Finances
- [ ] Migrer le module Stocks
- [ ] Migrer le module Employés
- [ ] Migrer le module Élevage
- [ ] Migrer le module Tâches
- [ ] Migrer le module Messages
- [ ] Exécuter le script de migration des données
- [ ] Tester l'application complète
- [ ] Supprimer le code Firebase/localStorage obsolète

## ⚠️ Points d'Attention

1. **IDs différents** : Firebase utilise des IDs auto-générés, PostgreSQL utilise des UUID. Les IDs ne seront pas les mêmes après migration.

2. **Dates** : Vérifiez le format des dates (YYYY-MM-DD pour PostgreSQL).

3. **Tableaux/Arrays** : PostgreSQL supporte les arrays natifs, mais la syntaxe est différente.

4. **Transactions** : Utilisez les transactions pour les opérations complexes (ex: création vente + transaction financière).

5. **Fallback** : Gardez le code localStorage en fallback pendant la période de transition.

## 🚀 Déploiement en Production

Une fois la migration terminée et testée :

1. **Backup** : Faites un backup de la base de données
2. **Environment** : Configurez les variables d'environnement de production
3. **Migration** : Exécutez la migration en production
4. **Monitoring** : Surveillez les logs et les performances
5. **Rollback** : Préparez un plan de rollback en cas de problème

## 📞 Support

En cas de problème :
- Vérifiez les logs PostgreSQL
- Vérifiez les variables d'environnement
- Testez les requêtes SQL directement dans psql ou le dashboard Supabase
- Consultez la documentation PostgreSQL : https://www.postgresql.org/docs/
