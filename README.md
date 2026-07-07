# 🌾 KA Farm

Application de gestion agricole pour exploitations maraîchères au Sénégal.

## Fonctionnalités

- Tableau de bord exploitation
- Gestion des parcelles et cultures
- Suivi financier et simulateur de marges
- Gestion des stocks et alertes
- Suivi des employés et pointage
- Élevage : cheptel, production, santé
- Irrigation et alertes météo
- Discussions et messagerie

## Stack

- Frontend : HTML/Vanilla JS, Tailwind CSS
- Backend : Node.js/Express
- Base de données : PostgreSQL
- IA : Gemini API

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

## Base de données PostgreSQL

- Exécuter le schéma : `db/schema.sql`
- Configurer les variables `PG_*` dans `.env`
- Le backend bascule automatiquement vers PostgreSQL quand les variables sont présentes.

## Documentation technique

- `README.md` : ce fichier
- `db/README.md` : guide de la couche données
- `db/schema.sql` : schéma complet PostgreSQL
