# Guide d'Intégration ErrorHandler - KA Farm

## 📋 Vue d'Ensemble

Ce guide explique comment utiliser le système de gestion d'erreurs centralisé de KA Farm pour une application robuste et maintenable.

## 🎯 Objectifs

- ✅ Gestion uniforme des erreurs
- ✅ Logging centralisé
- ✅ Notifications utilisateur cohérentes
- ✅ Debugging facilité
- ✅ Production-ready

## 📦 Architecture

### Structure des Fichiers

```
js/
├── modules/
│   ├── error-handler.js    # Module principal
│   └── logger.js           # Logs structurés
```

### Composants

1. **ErrorHandler** - Gestion des erreurs et toasts
2. **Logger** - Logs avec niveaux (info, warn, error)
3. **Integration** - Import dans chaque module

## 🚀 Utilisation

### 1. Import du Module

```javascript
import { ErrorHandler } from "./error-handler.js";

// Rendre disponible globalement (optionnel)
window.ErrorHandler = ErrorHandler;
```

### 2. Logging d'Erreurs

```javascript
// Capture et log d'erreur
try {
  // Code risqué
} catch (err) {
  ErrorHandler.log(err, "NomDuModule.fonction");
}

// Avec contexte supplémentaire
ErrorHandler.log(err, "EmployeesModule.submitAddEmployee", {
  employeeId: emp.id,
  action: "create",
});
```

### 3. Notification Utilisateur

```javascript
// Succès
ErrorHandler.showToast("Opération réussie !", "success");

// Erreur
ErrorHandler.showToast("Erreur lors de la sauvegarde", "error");

// Information
ErrorHandler.showToast("Sauvegarde en cours...", "info");
```

### 4. Validation

```javascript
// Validation avec message d'erreur
if (!name || !email) {
  ErrorHandler.showToast("Veuillez remplir tous les champs", "error");
  return;
}
```

## 📝 Patterns Recommandés

### Pattern 1 : Try/Catch dans init()

```javascript
init() {
  try {
    // Chargement des données
    this.data = KAStorage.getData();

    // Rendu initial
    this.render();

    // Setup des événements
    this.setupListeners();

  } catch (err) {
    ErrorHandler.log(err, 'ModuleName.init');
    ErrorHandler.showToast('Erreur au chargement', 'error');
  }
}
```

### Pattern 2 : Validation de Formulaire

```javascript
submitForm() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  // Validation
  if (!name) {
    ErrorHandler.showToast('Le nom est requis', 'error');
    return;
  }

  if (!email.includes('@')) {
    ErrorHandler.showToast('Email invalide', 'error');
    return;
  }

  // Traitement
  try {
    this.saveData();
    ErrorHandler.showToast('Enregistré avec succès', 'success');
  } catch (err) {
    ErrorHandler.log(err, 'ModuleName.submitForm');
    ErrorHandler.showToast('Erreur lors de l\'enregistrement', 'error');
  }
}
```

### Pattern 3 : Opérations CRUD

```javascript
// CREATE
createItem(data) {
  try {
    const newItem = { id: generateId(), ...data };
    this.items.push(newItem);
    KAStorage.saveItems(this.items);
    ErrorHandler.showToast('Élément créé', 'success');
    return newItem;
  } catch (err) {
    ErrorHandler.log(err, 'ModuleName.createItem');
    ErrorHandler.showToast('Erreur lors de la création', 'error');
    throw err;
  }
}

// UPDATE
updateItem(id, updates) {
  try {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');

    this.items[idx] = { ...this.items[idx], ...updates };
    KAStorage.saveItems(this.items);
    ErrorHandler.showToast('Modifications enregistrées', 'success');
  } catch (err) {
    ErrorHandler.log(err, 'ModuleName.updateItem');
    ErrorHandler.showToast('Erreur lors de la modification', 'error');
    throw err;
  }
}

// DELETE
deleteItem(id) {
  if (!confirm('Confirmer la suppression ?')) return;

  try {
    this.items = this.items.filter(i => i.id !== id);
    KAStorage.saveItems(this.items);
    ErrorHandler.showToast('Élément supprimé', 'success');
  } catch (err) {
    ErrorHandler.log(err, 'ModuleName.deleteItem');
    ErrorHandler.showToast('Erreur lors de la suppression', 'error');
  }
}
```

### Pattern 4 : Confirmation Utilisateur

```javascript
// Toujours utiliser ErrorHandler après confirm
if (confirm("Êtes-vous sûr ?")) {
  try {
    // Action risquée
    this.deleteItem(id);
  } catch (err) {
    ErrorHandler.log(err, "ModuleName.dangerousAction");
    ErrorHandler.showToast("Action échouée", "error");
  }
}
```

## ⚠️ Erreurs Courantes à Éviter

### ❌ Mauvais

```javascript
// Console direct
console.error("Erreur:", err);

// Alert native
alert("Erreur !");

// Pas de gestion d'erreur
function save() {
  KAStorage.save(data);
}
```

### ✅ Bon

```javascript
// Utiliser ErrorHandler
ErrorHandler.log(err, "ModuleName.function");

// Toast élégant
ErrorHandler.showToast("Message", "error");

// Try/catch
function save() {
  try {
    KAStorage.save(data);
    ErrorHandler.showToast("Sauvegardé", "success");
  } catch (err) {
    ErrorHandler.log(err, "ModuleName.save");
    ErrorHandler.showToast("Erreur", "error");
  }
}
```

## 🎨 Personnalisation

### Messages Contextuels

```javascript
// Avec données supplémentaires
ErrorHandler.log(err, "FinanceModule.addTransaction", {
  amount: amount,
  category: category,
  userId: currentUser.id,
});

// Messages utilisateur spécifiques
if (amount <= 0) {
  ErrorHandler.showToast("Le montant doit être positif", "error");
  return;
}
```

### Gestion d'Erreurs Spécifiques

```javascript
try {
  // Opération risquée
} catch (err) {
  // Log technique
  ErrorHandler.log(err, "ModuleName.operation");

  // Message utilisateur adapté
  if (err.message.includes("network")) {
    ErrorHandler.showToast("Problème de connexion", "error");
  } else if (err.message.includes("permission")) {
    ErrorHandler.showToast("Permissions insuffisantes", "error");
  } else {
    ErrorHandler.showToast("Une erreur est survenue", "error");
  }
}
```

## 🧪 Tests

### Mocking ErrorHandler

```javascript
// Dans les tests
const mockErrorHandler = {
  log: jest.fn(),
  showToast: jest.fn(),
};

Object.defineProperty(window, "ErrorHandler", {
  value: mockErrorHandler,
});

// Vérification
expect(mockErrorHandler.showToast).toHaveBeenCalledWith(
  "Message attendu",
  "success",
);
```

## 📊 Monitoring Production

### Logs Serveur

```javascript
// api/index.js utilise déjà ErrorHandler
// Les erreurs sont loggées dans la console serveur
```

### Intégration Sentry (Optionnel)

```javascript
// Dans error-handler.js
if (process.env.SENTRY_DSN) {
  Sentry.captureException(err);
}
```

## ✅ Checklist d'Intégration

Pour chaque nouveau module :

- [ ] Importer ErrorHandler
- [ ] Wrapper init() dans try/catch
- [ ] Utiliser showToast() pour feedback utilisateur
- [ ] Logger les erreurs avec contexte
- [ ] Valider les entrées utilisateur
- [ ] Tester les cas d'erreur
- [ ] Documenter les erreurs possibles

## 🎓 Bonnes Pratiques

1. **Toujours catcher les erreurs** - Ne jamais laisser une erreur non gérée
2. **Logger avec contexte** - Faciliter le debugging
3. **Messages clairs** - L'utilisateur doit comprendre le problème
4. **Feedback immédiat** - Toast après chaque action utilisateur
5. **Graceful degradation** - L'app doit continuer de fonctionner
6. **Pas de console.log** - Utiliser ErrorHandler.log()

## 📚 Ressources

- [Gestion d'erreurs JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Exceptions)
- [Logging best practices](https://12factor.net/logs)

---

**Dernière mise à jour** : Sprint 3 - Mars 2026
