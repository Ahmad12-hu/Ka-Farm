# Mode Hors Ligne (Offline-First)

## Vue d'ensemble

KA-Farm implémente une architecture **offline-first** permettant aux utilisateurs de travailler sans connexion Internet. Les données sont sauvegardées localement et synchronisées automatiquement lorsque la connexion est rétablie.

## Architecture

### 1. Service Worker (`sw.js`)

Le Service Worker intercepte toutes les requêtes réseau et implémente une stratégie de cache hybride :

- **Network First** : Pour les pages HTML (tentative de chargement depuis le réseau, fallback vers le cache)
- **Cache First** : Pour les ressources statiques (CSS, JS, images)
- **Exclusions** : Les requêtes Firebase et API sont toujours transmises au réseau

**Fonctionnalités clés :**

- Mise en cache automatique des pages visitées
- Fallback vers `index.html` pour les pages hors ligne
- Gestion des requêtes API et Firebase (toujours en ligne)

### 2. Stockage IndexedDB (`js/modules/offline-storage.js`)

Module de persistance locale basé sur IndexedDB avec les collections suivantes :

- **crops** : Cultures maraîchères
- **parcelles** : Gestion des parcelles
- **stocks** : Inventaire et stocks
- **finances** : Transactions financières
- **tasks** : Tâches et entretiens
- **notifications** : Notifications système
- **syncQueue** : File d'attente de synchronisation

**Fonctionnalités clés :**

- CRUD complet (Create, Read, Update, Delete)
- Indexation pour les requêtes optimisées
- File d'attente de synchronisation automatique

### 3. Gestionnaire de Synchronisation (`js/modules/sync-manager.js`)

Composant central qui gère la synchronisation entre IndexedDB et Firebase :

**Fonctionnalités clés :**

- Détection automatique du statut de connexion (en ligne/hors ligne)
- Synchronisation périodique toutes les 30 secondes
- File d'attente de synchronisation avec retry automatique (max 3 tentatives)
- Indicateur visuel de statut dans le header
- Notifications toast pour informer l'utilisateur
- Reconnexion automatique avec synchronisation immédiate

## Interface Utilisateur

### Indicateur de Connexion

Un indicateur visuel est présent dans le header de toutes les pages :

- **Point vert (en ligne)** : Connexion active, synchronisation automatique
- **Point rouge (hors ligne)** : Mode hors ligne, données sauvegardées localement
- **Statut de synchronisation** : Texte indiquant le dernier sync

**Localisation :** Header de la page, à côté du logo

### Notifications

Des notifications toast informent l'utilisateur :

- ✅ Connexion rétablie - Synchronisation en cours
- ⚠️ Mode hors ligne activé - Données sauvegardées localement
- 🔄 Synchronisation terminée

## Flux de Données

### Mode En Ligne

```
Utilisateur → Action → IndexedDB + Firebase → Sync Queue vidée → UI mise à jour
```

### Mode Hors Ligne

```
Utilisateur → Action → IndexedDB uniquement → Sync Queue → (Attente reconnexion)
```

### Reconnexion

```
Connexion rétablie → Sync Manager détecte → Traitement de la file → Firebase sync → Rafraîchissement UI
```

## Utilisation

### Pour les Utilisateurs

1. **Utilisation normale** : L'application fonctionne comme d'habitude
2. **En cas de perte de connexion** :
   - L'indicateur passe au rouge
   - Les données sont sauvegardées automatiquement
   - Un message d'avertissement s'affiche
3. **À la reconnexion** :
   - Synchronisation automatique
   - Indicateur passe au vert
   - Notification de confirmation

### Pour les Développeurs

#### Initialisation

Le mode offline est automatiquement activé dans `js/app.js` :

```javascript
// Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// Stockage hors ligne
window.offlineStorage.init();

// Synchronisation
window.syncManager.init();
```

#### Ajouter une opération à la queue de synchronisation

```javascript
// Exemple : Créer une culture hors ligne
await window.syncManager.queueOperation({
  type: "CREATE",
  collection: "crops",
  data: {
    id: "crop-123",
    name: "Tomates",
    parcelId: "parcel-1",
    // ... autres données
  },
});
```

#### Récupérer des données locales

```javascript
// Récupérer toutes les cultures depuis IndexedDB
const crops = await window.offlineStorage.getAll("crops");
```

#### Écouter les événements de synchronisation

```javascript
// Écouter le rafraîchissement des données après sync
window.addEventListener("ka_data_refresh", () => {
  // Recharger les données depuis Firebase
  loadCropsFromFirebase();
});
```

## Tests

### Test du mode hors ligne

1. **Simuler mode hors ligne** :
   - Chrome DevTools → Network → Throttling → Offline
   - Ou couper la connexion Internet

2. **Vérifier le comportement** :
   - L'indicateur doit passer au rouge
   - Créer/modifier des données
   - Vérifier dans IndexedDB (DevTools → Application → IndexedDB)

3. **Tester la reconnexion** :
   - Revenir en mode en ligne
   - Vérifier la synchronisation automatique
   - Confirmer que les données sont présentes dans Firebase

### Console Debug

Activer les logs dans la console :

```javascript
// Service Worker
console.log("[SW]", "Message");

// Sync Manager
console.log("[SyncManager]", "Message");

// Offline Storage
console.log("[OfflineStorage]", "Message");
```

## Limitations

1. **Firebase Auth** : L'authentification nécessite une connexion initiale
2. **Stockage local** : Limité à ~50 MB selon le navigateur
3. **Synchronisation** : Uniquement opérations CRUD (pas de requêtes complexes)
4. **Service Worker** : Nécessite HTTPS (sauf localhost)

## Dépannage

### Le Service Worker ne s'enregistre pas

- Vérifier que le fichier `sw.js` est à la racine du projet
- Vérifier la console pour les erreurs d'enregistrement
- S'assurer que le site est servi en HTTPS

### Les données ne se synchronisent pas

- Vérifier que Firebase est correctement configuré
- Vérifier la file d'attente dans IndexedDB
- Vérifier les règles de sécurité Firebase

### L'indicateur de connexion ne s'affiche pas

- Vérifier que `sync-manager.js` est chargé
- Vérifier que les éléments DOM existent (`#connection-indicator`, `#sync-status`)
- Vérifier la console pour les erreurs

## Améliorations Futures

- [ ] Compression des données dans IndexedDB
- [ ] Synchronisation sélective par module
- [ ] Indicateur de progrès de synchronisation
- [ ] Mode avion avec aperçu des modifications en attente
- [ ] Résolution de conflits automatique
- [ ] Export/Import de données hors ligne

## Support

Pour toute question ou problème :

- 📧 contact@kafarm.sn
- 📱 +221 XX XXX XX XX
  \*/

export {};
