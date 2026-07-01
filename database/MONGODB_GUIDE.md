# KA-FARM - Guide MongoDB

## 📋 Vue d'ensemble

Ce guide explique comment configurer et utiliser MongoDB pour KA-FARM au lieu de PostgreSQL ou Firebase/localStorage.

## 🎯 Pourquoi MongoDB ?

- ✅ **Flexible**: Schéma dynamique, facile à modifier
- ✅ **Documents JSON**: Structure naturelle pour les données JavaScript
- ✅ **Scalable**: Facile à mettre à l'échelle horizontalement
- ✅ **Performance**: Optimisé pour les opérations de lecture/écriture
- ✅ **Écosystème riche**: Mongoose, drivers pour tous les langages
- ✅ **Cloud gratuit**: MongoDB Atlas offre 512MB gratuit

## 🚀 Options de déploiement

### Option 1: MongoDB Atlas (Recommandé - Gratuit)

**Avantages :**
- MongoDB managé (pas de serveur à gérer)
- 512MB gratuit pour toujours
- Backup automatique
- Monitoring intégré
- Sécurité avancée

**Étapes :**

1. **Créer un compte MongoDB Atlas**
   - Allez sur https://www.mongodb.com/cloud/atlas
   - Créez un compte gratuit
   - Créez un nouveau cluster (gratuit M0)

2. **Configurer l'accès réseau**
   - Dans Network Access > IP Whitelist
   - Ajoutez `0.0.0.0/0` pour autoriser toutes les IP (pour le développement)
   - Ou ajoutez votre IP spécifique

3. **Créer un utilisateur de base de données**
   - Dans Database Access
   - Créez un nouvel utilisateur avec mot de passe
   - Donnez-lui les droits "Read and write to any database"

4. **Récupérer la chaîne de connexion**
   - Dans Database > Connect
   - Choisissez "Connect your application"
   - Copiez la chaîne de connexion
   - Remplacez `<password>` par votre mot de passe

5. **Configurer les variables d'environnement**
   ```bash
   # Dans votre fichier .env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kafarm_db?retryWrites=true&w=majority
   ```

### Option 2: MongoDB Local

**Avantages :**
- Contrôle total
- Pas de dépendance externe
- Gratuit
- Développement offline

**Étapes :**

1. **Installer MongoDB**
   ```bash
   # Windows
   # Télécharger: https://www.mongodb.com/try/download/community
   
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   
   # Linux (Ubuntu/Debian)
   sudo apt update
   sudo apt install mongodb
   sudo systemctl start mongodb
   ```

2. **Configurer les variables d'environnement**
   ```bash
   # Dans votre fichier .env
   MONGODB_URI=mongodb://localhost:27017/kafarm_db
   ```

### Option 3: MongoDB Cloud (Railway, Render, AWS)

**Avantages :**
- Scalabilité professionnelle
- Backups automatiques
- Haute disponibilité

**Exemple avec Railway:**
1. Créer un compte sur https://railway.app
2. Créer un nouveau projet MongoDB
3. Copier la variable d'environnement MONGODB_URI
4. Ajouter à votre fichier .env

## 📦 Installation des dépendances

```bash
npm install mongoose
```

## 🗄️ Structure de la base de données

### Collections principales (6 collections)

1. **users** - Utilisateurs et rôles
2. **fermes** - Exploitations agricoles
3. **parcelles** - Parcelles de la ferme
4. **cultures** - Cultures en cours
5. **transactions** - Revenus/dépenses
6. **taches** - Tâches et planning

### Modèles Mongoose créés

- `User.js` - Modèle utilisateur avec authentification
- `Ferme.js` - Modèle ferme
- `Parcelle.js` - Modèle parcelle
- `Culture.js` - Modèle culture
- `Transaction.js` - Modèle transaction financière
- `Tache.js` - Modèle tâche

## 🔧 Utilisation dans le code

### Exemple: Connexion à MongoDB

```javascript
import { connectDB } from './database/mongodb-config.js';

await connectDB();
console.log('Connecté à MongoDB');
```

### Exemple: Créer un utilisateur

```javascript
import { User } from './database/models/index.js';
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash('password123', 10);

const newUser = await User.create({
  email: 'user@example.com',
  password: hashedPassword,
  name: 'Jean Dupont',
  role: 'gestionnaire',
  fermeId: null,
  telephone: '+221771234567'
});
```

### Exemple: Récupérer les cultures d'une ferme

```javascript
import { Culture } from './database/models/index.js';
import { Parcelle } from './database/models/index.js';

// Récupérer les parcelles de la ferme
const parcelles = await Parcelle.find({ fermeId: fermeId });

// Récupérer les cultures de ces parcelles
const parcelleIds = parcelles.map(p => p._id);
const cultures = await Culture.find({ 
  parcelleId: { $in: parcelleIds } 
}).populate('parcelleId');
```

### Exemple: Créer une transaction

```javascript
import { Transaction } from './database/models/index.js';

const transaction = await Transaction.create({
  fermeId: fermeId,
  type_transaction: 'revenu',
  categorie: 'Vente de produits',
  description: 'Vente de tomates',
  montant_fcfa: 50000,
  date_transaction: new Date(),
  mode_paiement: 'especes'
});
```

### Exemple: Login avec MongoDB

```javascript
import { UserManagerMongoDB } from './js/user-manager-mongodb.js';

const result = await UserManagerMongoDB.login(email, password);
if (result.success) {
  console.log('Connecté:', result.user);
} else {
  console.error('Erreur:', result.error);
}
```

## 🔄 Migration des données existantes

### Script de migration depuis localStorage

Le script `database/migrate-to-mongodb.js` migre automatiquement vos données depuis localStorage vers MongoDB.

**Exécution:**

```bash
# Note: Ce script doit être exécuté dans un environnement Node.js
# avec accès à localStorage (navigateur ou environnement simulé)
node database/migrate-to-mongodb.js
```

**Ce que le script migre:**
- ✅ Utilisateurs (avec hashage des mots de passe)
- ✅ Fermes
- ✅ Cultures
- ✅ Transactions financières
- ✅ Tâches

## 🔒 Sécurité

### Hashage des mots de passe

Les mots de passe sont automatiquement hashés avec bcrypt lors de la création et vérifiés lors du login.

### Variables d'environnement

Ne jamais commit les credentials dans Git. Utilisez toujours `.env` (dans .gitignore).

```bash
# .env.example
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kafarm_db
```

## 📊 Monitoring et maintenance

### Vérifier l'état de la base

```javascript
import mongoose from 'mongoose';

console.log('État de la connexion:', mongoose.connection.readyState);
// 0 = déconnecté, 1 = connecté, 2 = en connexion, 3 = déconnexion
```

### Backup (MongoDB Atlas)

MongoDB Atlas fait des backups automatiques. Pour MongoDB local:

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/kafarm_db" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/kafarm_db" ./backup/kafarm_db
```

## 🐛 Dépannage

### Erreur: "Connection refused"

- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez la chaîne de connexion dans .env
- Pour MongoDB Atlas, vérifiez l'IP Whitelist

### Erreur: "Authentication failed"

- Vérifiez le nom d'utilisateur et mot de passe
- Vérifiez que l'utilisateur a les droits nécessaires dans Atlas

### Erreur: "MongooseError: Buffering timed out"

- Vérifiez votre connexion internet
- Vérifiez que le cluster Atlas est actif (pas en pause)

## 📚 Ressources

- [Documentation MongoDB](https://docs.mongodb.com/)
- [Documentation Mongoose](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🎯 Prochaines étapes

1. ✅ Installer MongoDB ou créer un compte Atlas
2. ✅ Configurer les variables d'environnement (.env)
3. ✅ Tester la connexion avec `node database/test-mongodb.js`
4. ⏳ Exécuter la migration des données existantes
5. ⏳ Mettre à jour les modules JS pour utiliser MongoDB
6. ⏳ Tester l'application
7. ⏳ Déployer en production

## 🔄 Comparaison avec PostgreSQL

| Caractéristique | MongoDB | PostgreSQL |
|----------------|---------|------------|
| Type | NoSQL (Document) | SQL (Relationnel) |
| Schéma | Flexible | Rigide |
| Relations | Références | FOREIGN KEY |
| Scalabilité | Horizontale facile | Verticale |
| Complexité | Simple pour débutants | Plus complexe |
| Requêtes complexes | Limité | Très puissant |
| Transactions | Supporté | ACID complet |

**Choisir MongoDB si:**
- Vous voulez un schéma flexible
- Vos données sont hiérarchiques/nestées
- Vous prévoyez une scalabilité horizontale
- Vous préférez JavaScript natif

**Choisir PostgreSQL si:**
- Vous avez des relations complexes
- Vous avez besoin de requêtes SQL avancées
- L'intégrité des données est critique
- Vous avez de l'expérience SQL
