# Archive — artefacts obsolètes (ne pas utiliser comme référence)

Ce dossier regroupe des documents et schémas **historiques ou jamais déployés**.
Ils sont conservés uniquement à titre d'archive et **ne reflètent pas** le
fonctionnement réel de KA Farm.

## Source de vérité actuelle

- **Persistance** : Firebase **Firestore** via `firebase-admin` dans `api/index.js`
  (chemin `app_data/{enterpriseId}/{collection}/data`).
- **Authentification** : Firebase Auth (ID tokens) — cf. `js/auth.js`.
- **Contrat d'entrée API** : `js/modules/api-validation.js` (Zod).
- **Règles Firestore** : `firestore.rules` (racine).

## Contenu archivé et raison

| Élément | Pourquoi il est archivé |
| --- | --- |
| `schema.sql` (racine) | Ancien schéma PostgreSQL (14 tables). Aucun code ne l'utilise. |
| `db/` | Migration initiale PostgreSQL + README. Le runner `db/migrate.js` référencé par `package.json` n'a jamais existé. |
| `future-db/` | Schéma PostgreSQL « futur » (~50 tables) et RLS jamais déployés. |
| `README_DATABASE.md` | Guide de configuration PostgreSQL/Supabase obsolète. |
| `MULTI-TENANCY_GUIDE.md`, `MULTITENANCY_GUIDE.md`, `MULTI_TENANCY_IMPLEMENTATION.md` | Trois documents contradictoires (localStorage vs Supabase RLS) décrivant des architectures non implémentées. |

> La table Supabase `feedback` (`supabase/feedback-table.sql`) reste **active**
> et n'est pas archivée.
