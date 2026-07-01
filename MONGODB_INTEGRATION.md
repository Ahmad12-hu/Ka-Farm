# Guide d'Intégration MongoDB - KA-FARM

## 📋 Résumé de l'intégration

J'ai intégré MongoDB dans votre projet KA-FARM pour remplacer localStorage. Voici ce qui a été fait:

### ✅ Fichiers créés/modifiés

**Nouveaux fichiers:**
- `database/mongodb-config.js` - Configuration de connexion MongoDB
- `database/models/User.js` - Modèle utilisateur avec authentification
- `database/models/Ferme.js` - Modèle ferme
- `database/models/Parcelle.js` - Modèle parcelle
- `database/models/Culture.js` - Modèle culture
- `database/models/Transaction.js` - Modèle transaction financière
- `database/models/Tache.js` - Modèle tâche
- `database/models/index.js` - Export des modèles
- `js/storage-mongodb.js` - Storage engine version MongoDB
- `js/user-manager-mongodb.js` - User manager version MongoDB
- `database/test-mongodb.js` - Script de test
- `database/migrate-to-mongodb.js` - Script de migration

**Fichiers modifiés:**
- `js/modules/crops.js` - Utilise maintenant KAStorageMongoDB
- `js/modules/finances.js` - Utilise maintenant KAStorageMongoDB
- `js/modules/dashboard.js` - Utilise maintenant KAStorageMongoDB
- `.env.template` - Ajouté MONGODB_URI
- `package.json` - Ajouté mongoose

## 🚀 Comment ça fonctionne

### 1. Architecture

```
KA-FARM Application
    ↓
Modules (crops.js, finances.js, dashboard.js)
    ↓
KAStorageMongoDB (storage-mongodb.js)
    ↓
Mongoose Models (User, Culture, Transaction, etc.)
    ↓
MongoDB Database
```

### 2. Flux de données

**Exemple: Ajouter une culture**
1. Utilisateur remplit le formulaire dans crops.js
2. CropsModule appelle `KAStorageMongoDB.saveCrops(crops)`
3. KAStorageMongoDB se connecte à MongoDB via mongoose
4. Les données sont enregistrées dans la collection `cultures`
5. L'interface est mise à jour automatiquement

### 3. Fallback localStorage

Si MongoDB n'est pas disponible, le système utilise automatiquement localStorage comme fallback. Cela garantit que l'application fonctionne même sans connexion MongoDB.

## 🔧 Configuration requise

### Étape 1: Installer MongoDB

**Option A: MongoDB Atlas (Recommandé - Gratuit)**
1. Allez sur https://www.mongodb.com/cloud/atlas
2. Créez un compte gratuit
3. Créez un nouveau cluster (gratuit M0)
4. Configurez l'accès réseau (IP Whitelist: 0.0.0.0/0 pour le développement)
5. Créez un utilisateur de base de données
6. Copiez la chaîne de connexion

**Option B: MongoDB Local**
1. Téléchargez MongoDB: https://www.mongodb.com/try/download/community
2. Installez MongoDB sur votre machine
3. Démarrez le service MongoDB

### Étape 2: Configurer les variables d'environnement

1. Copiez `.env.template` vers `.env`:
```bash
cp .env.template .env
```

2. Éditez `.env` et configurez `MONGODB_URI`:

**Pour MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kafarm_db?retryWrites=true&w=majority
```

**Pour MongoDB Local:**
```env
MONGODB_URI=mongodb://localhost:27017/kafarm_db
```

### Étape 3: Tester la connexion

```bash
node database/test-mongodb.js
```

Si tout fonctionne, vous verrez:
```
🚀 Début du test MongoDB...

1️⃣ Test de connexion...
✅ Connexion MongoDB réussie

2️⃣ Test création utilisateur...
✅ Utilisateur créé: test@kafarm.sn

...
✅ Tous les tests MongoDB réussis !
```

### Étape 4: Migrer les données existantes (optionnel)

Si vous avez des données dans localStorage que vous voulez migrer:

```bash
node database/migrate-to-mongodb.js
```

## 📊 Structure des données MongoDB

### Collections créées

1. **users** - Utilisateurs avec rôles
   - email, password (hashé), name, role, fermeId

2. **fermes** - Exploitations agricoles
   - nom, localisation, superficie_ha, proprietaire

3. **parcelles** - Parcelles de la ferme
   - fermeId, nom_parcelle, surface_m2, type_sol, statut

4. **cultures** - Cultures en cours
   - parcelleId, nom_culture, variete, statut, water_status, fertilizer_status

5. **transactions** - Revenus/dépenses
   - fermeId, type_transaction, categorie, description, montant_fcfa

6. **taches** - Tâches et planning
   - fermeId, titre, priorite, statut, date_echeance

## 🔄 Différences avec localStorage

| Aspect | localStorage | MongoDB |
|--------|-------------|---------|
| Persistance | Navigateur uniquement | Serveur centralisé |
| Capacité | ~5-10MB | Illimitée |
| Partage | Non | Multi-utilisateurs |
| Requêtes | Basique | Avancées (aggregation, etc.) |
| Sécurité | Limitée | Authentification native |
| Backup | Manuel | Automatique (Atlas) |

## 🛠️ Utilisation dans le code

### Exemple: Récupérer les cultures

```javascript
import { KAStorageMongoDB } from '../storage-mongodb.js';

// Dans un module async
const crops = await KAStorageMongoDB.getCrops();
console.log(crops);
```

### Exemple: Créer une transaction

```javascript
import { KAStorageMongoDB } from '../storage-mongodb.js';

const finances = await KAStorageMongoDB.getFinances();
finances.unshift({
  id: `F-${Date.now()}`,
  description: 'Vente de tomates',
  type: 'Revenu',
  category: 'Vente Légumes',
  amount: 50000,
  date: '2026-07-01'
});
await KAStorageMongoDB.saveFinances(finances);
```

## ⚠️ Points d'attention

1. **Async/Await**: Toutes les opérations MongoDB sont asynchrones. Les fonctions doivent être marquées `async`.

2. **Connexion**: La connexion est établie automatiquement lors du premier appel à `KAStorageMongoDB.init()`.

3. **Fallback**: Si MongoDB échoue, le système utilise localStorage automatiquement.

4. **Mots de passe**: Les mots de passe sont hashés avec bcrypt dans MongoDB.

## 🎯 Prochaines étapes

1. ✅ Configuration MongoDB terminée
2. ⏳ Configurer votre fichier `.env` avec MONGODB_URI
3. ⏳ Tester la connexion avec `node database/test-mongodb.js`
4. ⏳ Lancer l'application et tester les fonctionnalités
5. ⏳ Migrer les données existantes si nécessaire

## 📞 Support

Si vous rencontrez des problèmes:
- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez que MONGODB_URI est correct dans `.env`
- Consultez les logs dans la console pour les erreurs
- Voir `database/MONGODB_GUIDE.md` pour plus de détails
