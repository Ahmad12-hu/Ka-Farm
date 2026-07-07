# KA Farm - Base de données PostgreSQL

## Connexion

Variables d'environnement dans `.env` :

- PG_HOST
- PG_PORT
- PG_USER
- PG_PASSWORD
- PG_DATABASE
- PG_LOG_QUERIES

## Schéma

Exécuter `db/schema.sql` sur la base PostgreSQL cible.

## Migration Firestore -> PostgreSQL

Les collections Firestore ont été mappées vers des tables relationnelles SQL.
Le backend `server.js` bascule automatiquement vers PostgreSQL si `db.js` est disponible, sinon il reste en mode mémoire/localStorage.

## Couche d'accès

- `js/db.js` : helpers génériques `list/getById/search/insert/update/delete/count`

## Mettre à jour le frontend

Pour utiliser PostgreSQL depuis le frontend, passer par les routes API backend `/api/...` plutôt que Firebase.
