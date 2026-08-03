# Guide des Patterns de Tests - KA Farm

## 📋 Vue d'Ensemble

Ce guide standardise les patterns de tests pour KA Farm, garantissant des tests maintenables, lisibles et robustes.

## 🎯 Principes

- ✅ Tests unitaires pour chaque module
- ✅ Mocks complets des dépendances
- ✅ Tests isolés et reproductibles
- ✅ Nommage clair et explicite
- ✅ Assertions précises

## 📦 Structure des Tests

### Arborescence

```
__tests__/
├── storage.test.js          # Tests du storage core
├── crypto.test.js           # Tests du chiffrement
├── app.test.js              # Tests de l'application principale
├── cache.test.js            # Tests du cache
├── api.test.js              # Tests de l'API serveur
├── rbac.test.js             # Tests des permissions
├── crops.test.js            # Tests du module Crops
├── finances.test.js         # Tests du module Finances
├── employees.test.js        # Tests du module Employees
├── stocks.test.js           # Tests du module Stocks
├── parcelles.test.js        # Tests du module Parcelles
├── harvest.test.js          # Tests du module Harvest
└── irrigation.test.js       # Tests du module Irrigation
```

## 🔧 Setup de Base

### Template de Test

```javascript
// KA Farm - Tests pour le module [Nom]
import { [ModuleName] } from '../js/modules/[module-file].js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock KAStorage
const mockKAStorage = {
  get[Items]: () => [],
  save[Items]: (items) => { localStorage.setItem('ka_farm_[items]', JSON.stringify(items)); },
  getScopedKey: (key) => key,
  init: () => {}
};

Object.defineProperty(window, 'KAStorage', { value: mockKAStorage });

// Mock window.confirm
window.confirm = jest.fn(() => true);

// Mock lucide icons
window.lucide = { createIcons: () => {} };

describe('[ModuleName]Module', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ka_farm_[items]', JSON.stringify([]));
    window.confirm = jest.fn(() => true);
  });

  // Tests ici...
});
```

## 📝 Patterns de Tests

### Pattern 1 : Test d'Initialisation

```javascript
test("devrait initialiser le module sans erreur", () => {
  document.body.innerHTML = `
    <div id="module-container"></div>
    <div id="stats-container"></div>
  `;

  expect(() => ModuleName.init()).not.toThrow();
});
```

### Pattern 2 : Test CRUD Create

```javascript
test("devrait ajouter un [item]", () => {
  const items = [];
  mockKAStorage.saveItems(items);

  document.body.innerHTML = `
    <form id="add-item-form">
      <input id="form-item-name" value="Test Item">
      <input id="form-item-value" value="100">
      <div id="items-container"></div>
    </form>
  `;

  const form = document.getElementById("add-item-form");
  form.dispatchEvent(new Event("submit"));

  const savedItems = JSON.parse(localStorage.getItem("ka_farm_items"));
  expect(savedItems.length).toBe(1);
  expect(savedItems[0].name).toBe("Test Item");
  expect(savedItems[0].value).toBe(100);
});
```

### Pattern 3 : Test CRUD Update

```javascript
test("devrait modifier un [item]", () => {
  const items = [{ id: "I-001", name: "Old Name", value: 100 }];
  mockKAStorage.saveItems(items);

  document.body.innerHTML = `
    <form id="edit-item-form">
      <input id="form-item-id" value="I-001">
      <input id="form-item-name" value="New Name">
      <input id="form-item-value" value="200">
      <div id="items-container"></div>
    </form>
  `;

  const form = document.getElementById("edit-item-form");
  form.dispatchEvent(new Event("submit"));

  const savedItems = JSON.parse(localStorage.getItem("ka_farm_items"));
  expect(savedItems[0].name).toBe("New Name");
  expect(savedItems[0].value).toBe(200);
});
```

### Pattern 4 : Test CRUD Delete

```javascript
test("devrait supprimer un [item]", () => {
  const items = [{ id: "I-001", name: "To Delete", value: 100 }];
  mockKAStorage.saveItems(items);

  document.body.innerHTML = `
    <div id="items-container"></div>
  `;

  window.confirm = jest.fn(() => true);
  window.deleteItem("I-001");

  const savedItems = JSON.parse(localStorage.getItem("ka_farm_items"));
  expect(savedItems.length).toBe(0);
  expect(window.confirm).toHaveBeenCalled();
});
```

### Pattern 5 : Test de Filtrage

```javascript
test("devrait filtrer les [items] par [criteria]", () => {
  const items = [
    { id: "I-1", name: "Item A", category: "Cat1" },
    { id: "I-2", name: "Item B", category: "Cat2" },
  ];
  mockKAStorage.saveItems(items);

  document.body.innerHTML = `
    <select id="category-filter"><option value="Cat1" selected></option></select>
    <div id="items-container"></div>
  `;

  ModuleName.filterItems("Cat1");

  const container = document.getElementById("items-container");
  expect(container.innerHTML).toContain("Item A");
  expect(container.innerHTML).not.toContain("Item B");
});
```

### Pattern 6 : Test de Calcul

```javascript
test("devrait calculer le [metric] correctement", () => {
  const items = [
    { id: "I-1", value: 100 },
    { id: "I-2", value: 200 },
  ];
  mockKAStorage.saveItems(items);

  document.body.innerHTML = `
    <span id="total-value"></span>
  `;

  ModuleName.calculateTotal();

  const total = document.getElementById("total-value").textContent;
  expect(total).toBe("300");
});
```

### Pattern 7 : Test d'Affichage

```javascript
test("devrait afficher les détails", () => {
  const items = [{ id: "I-1", name: "Test", description: "Description" }];
  mockKAStorage.saveItems(items);

  document.body.innerHTML = `
    <div id="item-details-container"></div>
  `;

  ModuleName.showDetails("I-1");

  const container = document.getElementById("item-details-container");
  expect(container.innerHTML).toContain("Test");
  expect(container.innerHTML).toContain("Description");
});
```

### Pattern 8 : Test de Validation

```javascript
test("devrait rejeter les données invalides", () => {
  document.body.innerHTML = `
    <form id="add-item-form">
      <input id="form-item-name" value="">
      <input id="form-item-value" value="-100">
      <div id="items-container"></div>
    </form>
  `;

  const form = document.getElementById("add-item-form");
  form.dispatchEvent(new Event("submit"));

  const savedItems = JSON.parse(localStorage.getItem("ka_farm_items"));
  expect(savedItems.length).toBe(0);
});
```

### Pattern 9 : Test de Statistiques

```javascript
test("devrait calculer les statistiques", () => {
  const items = [
    { id: "I-1", status: "Actif" },
    { id: "I-2", status: "Actif" },
    { id: "I-3", status: "Inactif" },
  ];
  mockKAStorage.saveItems(items);

  document.body.innerHTML = `
    <span id="stat-total"></span>
    <span id="stat-active"></span>
  `;

  ModuleName.renderStats();

  expect(document.getElementById("stat-total").textContent).toBe("3");
  expect(document.getElementById("stat-active").textContent).toBe("2");
});
```

### Pattern 10 : Test de Recherche/Filtre

```javascript
test("devrait filtrer par recherche", () => {
  const items = [
    { id: "I-1", name: "Tomate Mongal" },
    { id: "I-2", name: "Oignon Rouge" },
  ];
  mockKAStorage.saveItems(items);

  document.body.innerHTML = `
    <input id="search-input" value="tomate">
    <div id="items-container"></div>
  `;

  ModuleName.filterItems("tomate");

  const container = document.getElementById("items-container");
  expect(container.innerHTML).toContain("Tomate Mongal");
  expect(container.innerHTML).not.toContain("Oignon Rouge");
});
```

## 🎨 Bonnes Pratiques

### 1. Nommage des Tests

```javascript
// ✅ BON : Descriptif et explicite
test('devrait calculer le salaire pour 2.5 jours de travail', () => {...})
test('devrait rejeter un employé sans nom', () => {...})
test('devrait supprimer la parcelle et ses dépendances', () => {...})

// ❌ MAUVAIS : Vague ou technique
test('calculate salary', () => {...})
test('delete works', () => {...})
test('test 1', () => {...})
```

### 2. Arrange-Act-Assert (AAA)

```javascript
test("devrait ajouter une culture", () => {
  // Arrange - Préparer les données
  const crops = [];
  mockKAStorage.saveCrops(crops);

  document.body.innerHTML = `
    <form id="crop-form">
      <input id="crop-name" value="Tomate">
      <div id="crops-container"></div>
    </form>
  `;

  // Act - Exécuter l'action
  const form = document.getElementById("crop-form");
  form.dispatchEvent(new Event("submit"));

  // Assert - Vérifier le résultat
  const savedCrops = JSON.parse(localStorage.getItem("ka_farm_crops"));
  expect(savedCrops.length).toBe(1);
  expect(savedCrops[0].name).toBe("Tomate");
});
```

### 3. Isolation des Tests

```javascript
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("ka_farm_items", JSON.stringify([]));
  window.confirm = jest.fn(() => true);
});

// Chaque test est indépendant
test("test 1", () => {
  /* ... */
});
test("test 2", () => {
  /* ... */
});
```

### 4. Mocks Réalistes

```javascript
// Mock des dates
const mockDate = new Date("2026-06-26");
jest.spyOn(global, "Date").mockImplementation(() => mockDate);

// Mock des fonctions async
const mockAsync = jest.fn(() => Promise.resolve("data"));
```

### 5. Vérifications Multiples

```javascript
test("devrait créer un employé complet", () => {
  // Vérifier le storage
  const saved = JSON.parse(localStorage.getItem("ka_farm_employees"));
  expect(saved.length).toBe(1);

  // Vérifier les champs
  expect(saved[0].id).toMatch(/^E-\d{3}$/);
  expect(saved[0].name).toBe("Amadou");
  expect(saved[0].dailyRate).toBeGreaterThan(0);

  // Vérifier le DOM
  expect(document.getElementById("employees-table-body").innerHTML).toContain(
    "Amadou",
  );
});
```

## 🧪 Cas de Test Essentiels

### Pour chaque module :

1. **Initialisation** : Module se charge sans erreur
2. **Create** : Ajout d'élément fonctionne
3. **Read** : Affichage des données correct
4. **Update** : Modification fonctionne
5. **Delete** : Suppression fonctionne
6. **Validation** : Champs requis vérifiés
7. **Filtrage** : Recherche/filtre opérationnel
8. **Calculs** : Mathématiques correctes
9. **Erreurs** : Gestion des cas d'erreur
10. **Edge Cases** : Données limites (vides, null, etc.)

## 🚫 Erreurs Courantes

### ❌ Mauvaise Isolation

```javascript
// Ne pas partager l'état entre tests
let sharedData = [];

test("test 1", () => {
  sharedData.push({ id: 1 }); // Évite ça !
});

test("test 2", () => {
  expect(sharedData.length).toBe(0); // Échoue !
});
```

### ❌ Mocks Incomplets

```javascript
// ❌ Module casse car ID manquant
document.body.innerHTML = `<input id="form-name">`;
// Manque : form-id, form-value, etc.

// ✅ Tous les champs requis
document.body.innerHTML = `
  <input id="form-id">
  <input id="form-name">
  <input id="form-value">
`;
```

### ❌ Assertions Faibles

```javascript
// ❌ Trop vague
expect(savedItems.length).toBeGreaterThan(0);

// ✅ Précis
expect(savedItems.length).toBe(1);
expect(savedItems[0].name).toBe("Tomate");
```

## 📊 Métriques de Qualité

### Couverture

```bash
# Générer le rapport de couverture
npm test -- --coverage

# Visez :
# - 80%+ de couverture globale
# - 90%+ pour les modules critiques
```

### Performance

```javascript
// Tests rapides (< 100ms chacun)
// Pas de setTimeout/setInterval
// Pas de fetch/XMLHttpRequest réel
```

## 🔍 Debugging

### Mode Debug

```bash
# Lancer un test spécifique en mode debug
npm test -- --testNamePattern="devrait ajouter un employé"

# Avec console.log
npm test -- --verbose
```

### Affichage des Erreurs

```javascript
// Dans les tests
console.log("Current state:", JSON.stringify(items));
console.error("Error details:", err);
```

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing JavaScript](https://testingjavascript.com/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Dernière mise à jour** : Sprint 3 - Mars 2026
