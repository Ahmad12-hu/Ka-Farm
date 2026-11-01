# Modèle de données Firestore — un document par entité

## Pourquoi ce document

Le modèle historique stockait **tout le tableau d'une collection dans un seul
document** :

```
app_data/{enterpriseId}/{collection}/data   →  { data: [ {...}, {...}, ... ] }
```

Deux problèmes structurels :

1. **Limite de 1 Mo par document** Firestore — atteinte dès qu'une collection
   contient des photos (base64) ou un volume important.
2. **Écrasement concurrent** (`set` du tableau entier, *last-write-wins*) —
   deux écritures simultanées → perte de données.

## Modèle cible

```
app_data/{enterpriseId}/{collection}/{id}   →  { ...une entité... }
app_data/{enterpriseId}/{collection}/__meta →  { model: "entity", migratedAt }
```

Un document par enregistrement. Plus de limite de 1 Mo, écritures indépendantes
par entité.

## Implémentation (`api/index.js`)

| Helper | Rôle |
| --- | --- |
| `readCollection(collection, fallback, enterpriseId)` | Liste les entités (`__meta` présent) sinon replie sur le doc tableau hérité. |
| `getEntity(collection, id, enterpriseId)` | Lit une entité. |
| `upsertEntity(collection, entity, enterpriseId)` | Crée / met à jour une entité. |
| `deleteEntity(collection, id, enterpriseId)` | Supprime une entité. |
| `replaceCollection(collection, entities, enterpriseId)` | Remplace une collection entière (upsert + suppression des absents). |

`syncWithFirestore` reste un alias de `readCollection` (routes GET inchangées).

## Migration sans downtime

La migration est **paresseuse et automatique** : au premier write d'une
collection non migrée, le document tableau hérité est converti en documents par
entité, un marqueur `__meta` est posé, puis le document tableau est supprimé.
Aucune perte : la lecture voit soit l'ancien modèle (avant migration), soit le
nouveau (après).

Pour migrer **proactivement** toutes les exploitations :

```bash
node scripts/migrate-firestore-entities.js                 # dry-run
node scripts/migrate-firestore-entities.js --execute       # écrit réellement
```

Le script est idempotent (les collections déjà migrées sont ignorées).

## Index

Les routes lisent une collection entière (pas de requête `where`), donc aucun
index composite n'est requis pour l'instant. À ajouter dans
`firestore.indexes.json` le jour où l'on filtrera/triera côté Firestore.

## Rollback

Le modèle hérité reste lisible : tant qu'une collection n'a pas de `__meta`, la
lecture utilise le document tableau. En cas de besoin, on peut restaurer
l'ancien code sans migration de données.
