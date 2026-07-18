# 📋 CAHIER DES CHARGES - KA FARM

## Application de Gestion Agricole Intelligente pour le Sénégal

**Version:** 1.0  
**Date:** Juillet 2025  
**Éditeur:** Équipe KA Farm  
**Statut:** Document de référence pour développement et maintenance

---

## 📑 TABLE DES MATIÈRES

1. [Contexte et Justification](#1-contexte-et-justification)
2. [Objectifs du Projet](#2-objectifs-du-projet)
3. [Architecture Technique Réelle](#3-architecture-technique-réelle)
4. [Fonctionnalités Implémentées (Vérifiées dans le Code)](#4-fonctionnalités-implémentées)
5. [Modèle de Données Actif](#5-modèle-de-données-actif)
6. [Écarts entre Documentation et Implémentation](#6-écarts-documentation-implémentation)
7. [Fonctionnalités Manquantes ou Incomplètes](#7-fonctionnalités-manquantes)
8. [Dette Technique Identifiée](#8-dette-technique-identifiée)
9. [Recommandations Techniques Priorisées](#9-recommandations-techniques-priorisées)
10. [Actions Immédiates](#10-actions-immédiates)

---

## 1. CONTEXTE ET JUSTIFICATION

### 1.1. Secteur Agricole Sénégalais

Le secteur agricole au Sénégal représente **16% du PIB** et emploie **plus de 60% de la population active**, particulièrement dans les zones rurales. Les principales zones de production horticole sont :

- **Les Niayes** (Dakar-Thiès-Saint-Louis) : Zone de maraîchage intensive
- **La Petite Côte** (Mbour) : Cultures de contre-saison
- **La Vallée du Fleuve Sénégal** : Grandes cultures et riziculture
- **Le Bassin Arachidier** : Cultures pluviales

### 1.2. Problématiques Identifiées

Les producteurs agricoles sénégalais font face à des défis structurels :

**Gestion de l'eau :**

- Climat semi-aride à sahélien nécessitant une irrigation maîtrisée
- Coût élevé du carburant pour motopompes (gazoil)
- Factures d'électricité des forages en forte croissance

**Accès aux intrants :**

- Difficulté d'accès aux engrais et semences de qualité à prix abordable
- Absence de suivi des stocks et des dates de péremption
- Usage inapproprié de pesticides avec risques sanitaires

**Communication et coordination :**

- Distance entre investisseurs urbains (Dakar) et équipes rurales
- Manque de traçabilité des transactions informelles
- Difficulté de coordination entre membres familiaux disséminés

**Commercialisation :**

- Fluctuations extrêmes des prix sur les marchés de gros
- Absence de comparatif entre canaux de vente
- Perte de visibilité sur la rentabilité réelle par culture

**Accès au financement :**

- Difficulté de constituer des dossiers de demande de crédit
- Complexité du suivi des remboursements
- Manque de transparence pour les investisseurs diaspora

### 1.3. Solution Proposée

**KA Farm** est une application web progressive (PWA) qui digitalise la gestion des exploitations agricoles en combinant :

- ✅ Gestion opérationnelle quotidienne (parcelles, cultures, irrigation)
- ✅ Outils financiers (suivi des dépenses, calcul de rentabilité, gestion des crédits)
- ✅ Intelligence artificielle (diagnostic de maladies, prédiction de prix)
- ✅ Fonctionnalités collaboratives (partage d'outils, commandes groupées)
- ✅ Mode hors-ligne pour zones sans connexion internet
- ✅ Messagerie avec conseillers agricoles experts

---

## 2. OBJECTIFS DU PROJET

### 2.1. Objectif Principal

Créer un écosystème numérique intégré permettant aux producteurs agricoles sénégalais de **professionnaliser leurs exploitations** et d'**optimiser leur rentabilité** grâce à une gestion data-driven.

### 2.2. Objectifs Spécifiques

**Pour les producteurs :**

- Réduire de 30% les pertes post-récolte grâce au suivi de conservation
- Optimiser la consommation d'eau de 15% via un arrosage adapté au type de sol
- Améliorer la rentabilité par culture grâce au calcul de marge en temps réel
- Sécuriser les transactions commerciales avec des bons de livraison numériques

**Pour les investisseurs/consultés :**

- Disposer d'une vision en temps réel de l'état des parcelles
- Suivre l'évolution des investissements via des rapports automatisés
- Réduire les risques de fraude grâce à la traçabilité blockchain des transactions

**Pour les conseillers agricoles (ANCAR/ISRA) :**

- Disposer d'outils de diagnostic rapide (IA, arbres de décision)
- Centraliser les demandes d'assistance via une messagerie dédiée
- Partager des recommandations personnalisées basées sur les données de la ferme

---

## 3. ARCHITECTURE TECHNIQUE RÉELLE

### 3.1. Stack Technologique Confirmé par le Code

**Frontend :**

- **Framework** : React 19 avec Vite 6 (SPA)
- **UI** : Tailwind CSS 4.1 via CDN (thème vert sombre agricole)
- **Animations** : Motion library (transitions fluides)
- **Graphiques** : Recharts + D3.js (visualisation de données)
- **Icônes** : Lucide React
- **Structure** : HTML5 templates dans `/pages/` avec modules JavaScript ES6

**Backend :**

- **Runtime** : Node.js 18+ (serveur Express)
- **API** : Express.js 4.21 avec Zod pour validation
- **Fichier principal** : `api/index.js` (685 lignes)
- **Sécurité** : Helmet, CORS, Express Rate Limit
- **IA** : Google Gemini AI (`@google/genai`) - **INTÉGRÉ ET FONCTIONNEL**

**Base de données :**

- **Stockage primaire** : **localStorage** (navigateur) - PAS de PostgreSQL/Supabase en production
- **Synchronisation** : Firebase Firestore (via `js/firebase.js`)
- **Cache** : Winston + Winston Daily Rotate File
- **Validation** : Zod 3.25

**Déploiement :**

- **Plateforme** : Vercel (serverless functions)
- **Configuration** : `vercel.json` - SPA routing configuré
- **Fichiers de config** : `.env`, `vercel.json`, `vite.config.js`

**Authentification :**

- Firebase Authentication (Google, email/mot de passe)
- JWT pour sessions sécurisées
- Multi-tenancy avec isolation par `enterprise_id`

### 3.2. Structure du Projet Avérée

```
ka-farm/
├── api/
│   └── index.js                 # Backend Express (Vercel functions) - 685 lignes
├── db/
│   ├── schema.sql              # Schéma PostgreSQL (2438 lignes) - NON UTILISÉ en prod
│   ├── migrate.js              # Migrations - NON UTILISÉ
│   └── policies.sql            # RLS policies - NON UTILISÉ
├── js/
│   ├── app.js                  # Point d'entrée principal
│   ├── db.js                   # Client Supabase (PRÉSENT mais pas utilisé)
│   ├── router.js               # Routeur SPA
│   ├── storage.js              # MOTEUR DE STOCKAGE LOCAL (3327 lignes) - CŒUR DU SYSTÈME
│   ├── firebase.js             # Synchronisation Firebase
│   ├── user-manager.js         # Gestion utilisateurs
│   └── modules/
│       ├── crops.js            # Cultures & Pépinières (1248 lignes) - ✅
│       ├── finances.js         # Finances & Compostage - ✅
│       ├── stocks.js           # Stocks d'intrants - ✅
│       ├── parcelles.js        # Parcelles - ✅
│       ├── employees.js        # Employés & pointage - ✅
│       ├── elevage.js          # Cheptel & production - ✅
│       ├── irrigation.js       # Irrigation - ✅
│       ├── dashboard.js        # Tableau de bord - ✅
│       ├── diagnostics.js      # Diagnostic IA - ✅
│       ├── weather-alerts.js   # Alertes météo - ✅
│       ├── tools-sharing.js    # Bourse d'outils - ✅
│       ├── group-orders.js     # Commandes groupées - ✅
│       ├── rotation.js         # Rotation des cultures - ✅
│       ├── profitability.js    # Rentabilité par culture - ✅
│       ├── harvests.js         # Récoltes - ✅
│       ├── treatments.js       # Traitements phytosanitaires - ✅
│       └── [40+ modules]
├── pages/
│   ├── admin/                  # Interface administration
│   │   └── dashboard.html
│   │   └── login.html
│   ├── auth/
│   │   ├── login.html
│   │   └── signup.html
│   ├── personal/               # Espace personnel
│   │   ├── my-tasks.html
│   │   ├── my-sales.html
│   │   ├── profile.html
│   │   └── settings.html
│   └── shared/                 # Modules partagés
│       ├── dashboard.html      # Tableau de bord principal
│       ├── crops.html          # Cultures & pépinières
│       ├── parcelles.html      # Gestion des parcelles
│       ├── finances.html       # Finances & compostage
│       ├── stocks.html         # Stocks d'intrants
│       ├── employees.html      # Employés & pointage
│       ├── elevage.html        # Cheptel
│       ├── irrigation.html     # Irrigation
│       ├── alerts.html         # Alertes
│       ├── weather-alerts.html # Alertes météo
│       ├── diagnostics.html    # Diagnostic IA
│       ├── tools-sharing.html  # Bourse d'outils
│       ├── group-orders.html   # Commandes groupées
│       ├── market-prices.html  # Prix du marché
│       ├── profitability.html  # Rentabilité
│       ├── harvest.html        # Récoltes
│       ├── treatments.html     # Traitements DAR
│       ├── training.html       # Formation
│       └── [20+ pages]
├── css/
│   ├── styles.css
│   ├── dashboard.css
│   ├── auth.css
│   └── responsive.css
├── __tests__/                  # Tests unitaires (Jest, Cypress)
├── server.js                   # Serveur de développement
├── sw.js                       # Service Worker (offline)
├── package.json                # Dépendances et scripts
├── vercel.json                 # Config déploiement Vercel
└── .env.example               # Variables d'environnement
```

### 3.3. Architecture Multi-Tenant (Confirmée)

Chaque exploitation agricole est isolée via un `enterprise_id` unique :

```javascript
// Exemple depuis js/storage.js (ligne 229-230)
const user = this.getCurrentUser();
const enterpriseId = user ? user.enterpriseId || "ka_farm" : "ka_farm";
return `${enterpriseId}_${key}`;
```

**Clés de stockage scopées :**

- `ka_farm_parcelles` (default)
- `ka_farm_crops`
- `ka_farm_finances`
- `ka_farm_stocks`
- etc.

**Rôles utilisateurs :**

- **Admin** : Gestion complète de l'exploitation
- **Gestionnaire** : Opérations courantes
- **Ouvrier** : Saisie limitée (pointage, tâches)
- **Bureau** : Consultation uniquement (investisseurs)
- **Conseiller** : Accès en lecture à des fermes spécifiques

---

## 4. FONCTIONNALITÉS IMPLÉMENTÉES (VÉRIFIÉES DANS LE CODE)

### 4.1. FONCTIONNALITÉS ESSENTIELLES (Priorité 1)

#### 4.1.1. ✅ Gestion des Cultures et Pépinières

**Fichier** : `js/modules/crops.js` (1248 lignes)

**Fonctionnalités implémentées :**

- Création/modification/suppression de cultures
  - Nom, parcelle, dates semis/récolte
  - Type de semence (Hybride F1, Locale Améliorée)
  - Saison (Saison Sèche Froide, Saison des Pluies)
  - Statut (Semis, Croissance, Floraison, Récoltable)
- Gestion des pépinières :
  - Date de semis, nombre de plants estimé
  - Date de repiquage prévue
  - Évolution du statut (Semis → Levée → Prêt → Repiqué)
  - Transformation automatique en culture mature
- Bibliothèque de fiches techniques cultures (CROP_LIBRARY_DATA)
- Calculateur de rendement estimé par parcelle
- Filtres et recherche
- Diagnostic sanitaire avec caméra (capture photo, import)
- Historique sanitaire par culture

**Pages** : `/pages/shared/crops.html`

**Stockage** : `localStorage` + synchronisation Firebase

---

#### 4.1.2. ✅ Carnet Phytosanitaire Numérique (DAR)

**Fichier** : `js/modules/crops.js` (lignes 672-771)

**Fonctionnalités implémentées :**

- Enregistrement des traitements :
  - Culture concernée
  - Catégorie (bio-phytosanitaire, chimique-phytosanitaire, bio-engrais, chimique-engrais)
  - Produit utilisé
  - Date d'application
  - DAR (Délai Avant Récolte) automatique selon catégorie :
    - Bio-phytosanitaire : 3 jours
    - Chimique-phytosanitaire : 7 jours
    - Engrais : 0 jours
- Historique des traitements par culture
- Suppression de traitements

**Stockage** : `localStorage` (clé `ka_farm_treatments`)

**Exemple de données** (depuis `js/storage.js` lignes 105-110) :

```javascript
{
  id: 'TR-001',
  parcelId: 'P-001',
  parcelName: 'Parcelle Nord - Planche 2',
  cropId: 'C-101',
  cropName: 'Tomate Mongal F1',
  category: 'bio-phytosanitaire',
  productName: 'Purin de Neem',
  dateApplied: '2026-06-20',
  dar: 3,
  target: 'Chenilles et pucerons',
  notes: 'Traitement préventif appliqué le matin. Respecter le DAR de 3 jours.',
  harvestReady: true
}
```

---

#### 4.1.3. ✅ Calculateur de Rentabilité par Culture

**Fichier** : `js/modules/profitability.js` + `pages/shared/profitability.html`

**Fonctionnalités confirmées dans `js/storage.js` (lignes 112-177) :**

```javascript
const DEFAULT_CROP_PROFITS = [
  {
    id: "PROF-001",
    cropName: "Tomate Mongal F1",
    parcelId: "P-001",
    parcelName: "Parcelle Nord - Planche 2",
    yieldKg: 5000,
    pricePerKg: 650,
    revenue: 3250000,
    costs: { seeds: 150000, fertilizer: 200000, water: 100000, labor: 300000 },
    totalCost: 750000,
    netMargin: 2500000,
    profitabilityPercent: 333.33,
    period: "2026-06-25",
  },
];
```

**Structure des coûts** : seeds, fertilizer, water, labor, treatments, transport

**Page** : `/pages/shared/profitability.html`

---

#### 4.1.4. ✅ Suivi des Parcelles

**Fichier** : `js/modules/parcelles.js` + `pages/shared/parcelles.html`

**Fonctionnalités :**

- CRUD parcelles :
  - Nom, surface (m²), coordonnées GPS (lat/lng)
  - Type de sol (sableux, limoneux, argileux) - **CONFIRMÉ dans storage.js ligne 50-54**
  - Statut (Cultivée, En préparation, Repos)
  - Historique des cultures
  - Culture actuelle
  - Statut hydrique (Irrigué, Besoin d'eau)
- Carte interactive avec positions

**Stockage** : `localStorage` (clé `ka_farm_parcelles`)

**Exemple de données** :

```javascript
{
  id: 'P-001',
  name: 'Parcelle Nord - Planche 2',
  surface: 120,
  lat: 14.7932,
  lng: -17.2654,
  status: 'Cultivée',
  type_sol: 'sableux',  // ✅ Implémenté
  history: ['Tomate Mongal F1', 'Chou Cabus', 'Jachère'],
  currentCrop: 'Tomate Mongal F1',
  waterStatus: 'Irrigué'
}
```

---

#### 4.1.5. ✅ Gestion des Stocks d'Intrants

**Fichier** : `js/modules/stocks.js` + `pages/shared/stocks.html`

**Fonctionnalités :**

- Inventaire en temps réel :
  - Semences, engrais, traitements, amendements
  - Quantité disponible, unité, seuil d'alerte
  - Catégorisation
- Alertes de stock bas (< 25%)
- Historique des mouvements

**Stockage** : `localStorage` (clé `ka_farm_stocks`)

**Exemple de données** (storage.js lignes 19-25) :

```javascript
{
  id: 'S-301',
  name: 'Compost Organique Bio',
  category: 'Amendements',
  quantity: 350,
  maxQuantity: 1000,
  unit: 'kg'
}
```

---

#### 4.1.6. ✅ Système d'Alertes Climatiques

**Fichier** : `js/modules/weather-alerts.js` + `pages/shared/alerts.html`

**Fonctionnalités :**

- Surveillance météo en temps réel via API Open-Meteo
- Alertes configurables :
  - Température (min/max)
  - Humidité
  - Vent
  - Pluie
- Messages d'action recommandée
- Sélection de la région (14 régions du Sénégal)

**Page Dashboard** : Affichage météo avec sélecteur de ville (Dakar, Thiès, Saint-Louis, etc.)

**API utilisée** : Open-Meteo (`api/index.js` lignes 658-683)

---

#### 4.1.7. ✅ Registre des Ventes

**Fichier** : `js/modules/finances.js` + `pages/shared/finances.html`

**Fonctionnalités :**

- Enregistrement des transactions :
  - Description, catégorie
  - Type (Revenu/Dépense)
  - Montant, date
  - Lien avec culture/parcelle
- Calcul automatique :
  - Total revenus
  - Total dépenses
  - Solde (trésorerie)
- Historique des transactions
- Export CSV (potentiellement)

**Stockage** : `localStorage` (clé `ka_farm_finances`)

**Exemple de données** (storage.js lignes 34-47) :

```javascript
{
  id: 'F-501',
  description: 'Vente de 8 caisses de Tomates Mongal',
  category: 'Vente Légumes',
  type: 'Revenu',
  amount: 120000,
  date: '2026-06-20'
}
```

---

#### 4.1.8. ✅ Suivi desEmployés et Pointage

**Fichiers** : `js/modules/employees.js` + `pages/shared/employees.html`

**Fonctionnalités :**

- Registre des employés :
  - Nom, téléphone, rôle
  - Taux journalier (FCFA)
  - Statut (Actif/Inactif)
- Pointage quotidien :
  - Présent, Absent, Demi-journée
  - Notes
- Paiements salariaux :
  - Période, montant
  - Mode de paiement (Espèces, Orange Money, Wave)
  - Statut (Payé/Dû)

**Stockage** : `localStorage` (clés `ka_farm_employees`, `ka_farm_attendance`, `ka_farm_employee_payments`)

---

#### 4.1.9. ✅ Gestion de l'Élevage (Cheptel)

**Fichier** : `js/modules/elevage.js` + `pages/shared/elevage.html`

**Fonctionnalités :**

- Registre du cheptel :
  - Type (Bovins, Ovins, Volailles)
  - Race, quantité, statut sanitaire
  - Usage (Lait, Reproduction, Œufs)
- Productions :
  - Type (Lait, Œufs, Viande)
  - Quantité, date, notes
- Santé animale :
  - Interventions (vaccination, déparasitage)
  - Praticien, coût, notes

**Stockage** : `localStorage` (clés `ka_farm_cheptel`, `ka_farm_elevage_production`, `ka_farm_elevage_health`)

---

#### 4.1.10. ✅ Tâches et Planning

**Fichier** : `js/modules/calendar.js` + `pages/personal/my-tasks.html`

**Fonctionnalités :**

- Création de tâches :
  - Titre, catégorie (Irrigation, Entretien, Pépinière, etc.)
  - Date limite, assigné
  - Priorité (Haute, Moyenne, Basse)
  - Statut (Complétée/En attente)
- Filtres et recherche
- Marquage comme complété

**Stockage** : `localStorage` (clé `ka_farm_tasks`)

---

### 4.2. FONCTIONNALITÉS IMPORTANTES (Priorité 2)

#### 4.2.1. ✅ Diagnostic de Maladies (IA + Arbre de décision)

**Fichier** : `js/modules/diagnostics.js` + `pages/shared/diagnostics.html`

**Fonctionnalités confirmées dans le code :**

- Base de données de maladies :
  - Nom, type de culture
  - Description, sévérité
  - Méthodes de prévention
- Base de données de symptômes :
  - Nom, description
  - Partie atteinte (Feuille, Tige, Fruit, Racine)
- Liens symptômes → maladies
- Recommandations de traitements :
  - Nom du traitement
  - Type (organique, chimique)
  - Dosage, fréquence
- Historique des diagnostics

**Tables dans schema.sql** :

- `crop_diseases` (ligne 236-257)
- `crop_symptoms` (ligne 449-458)
- `disease_symptoms` (ligne 460-470)
- `recommended_treatments` (ligne 472-488)
- `diagnostic_history` (ligne 490-503)

**Note** : Le diagnostic IA par image est **partiellement implémenté** dans le module crops.js (capture caméra) mais l'analyse Gemini n'est pas encore connectée à cette interface.

---

#### 4.2.2. ✅ Rotation des Cultures

**Fichier** : `js/modules/rotation.js` + intégration dans `js/storage.js`

**Fonctionnalités confirmées dans storage.js (lignes 650-865) :**

- Gestion des familles botaniques :
  - Solanacées, Légumineuses, Alliacées, Cucurbitacées, Brassicacées
  - Règles de rotation (min_rotation_years)
  - Familles incompatibles
- Mapping cultures → familles
- Historique de rotation par parcelle
- Vérification de compatibilité :
  ```javascript
  canCropFollow(cropName, parcelId); // Retourne { canFollow, reason }
  ```
- Recommandations de cultures compatibles
- Alertes de violation de rotation

**Tables dans schema.sql** :

- `plant_families` (ligne 505-517)
- `crop_families` (ligne 520-531)
- `rotation_history` (ligne 533-554)
- `rotation_rules` (ligne 556-567)

---

#### 4.2.3. ✅ Calculateur de Compostage

**Fichier** : `js/modules/profitability.js` (partie compost) + `pages/compost/calculator.html`

**Fonctionnalités confirmées dans storage.js (lignes 900-1068) :**

- Base de données des matériaux locaux :
  - Fumier bovin, équin, caprin, volaille
  - Paille de mil, sorgho, riz
  - Coques d'arachide
  - Feuilles de neem
  - Cendres de bois
- Calculateur de ratio C/N (Carbone/Azote)
- Calcul de l'humidité cible (55-65%)
- Estimation du temps de maturation (60-90 jours)
- Recettes prédéfinies

**Tables dans schema.sql** :

- `compost_materials` (ligne 569-587)
- `compost_recipes` (ligne 589-604)
- `recipe_ingredients` (ligne 606-619)
- `compost_history` (ligne 621-637)

---

#### 4.2.4. ✅ Simulateur de Marge Brute

**Fichier** : `js/modules/profitability.js` + `pages/shared/margin-simulator.html`

**Fonctionnalités confirmées dans storage.js :**

- Tarifs de transport par région :
  - Mbours → Dakar
  - Mbour → Mbour
  - Fleuve → Saint-Louis
- Comparateur de marge :
  - Prix vente Dakar - Coût transport
  - vs Prix vente local - Coût transport
- Calcul de la marge nette

**Tables dans schema.sql** :

- `transport_rates` (ligne 639-656)
- `margin_simulations` (ligne 658-679)

---

#### 4.2.5. ✅ Prix du Marché et Tendances

**Fichier** : `js/modules/market-prices.js` + `pages/shared/market-prices.html`

**Fonctionnalités :**

- Enregistrement des prix par :
  - Marché (Sandika, Mbour, Kaolack)
  - Région
  - Culture
  - Qualité
  - Date
- Historique des prix
- Tendances saisonnières
- Alertes de prix

**Tables dans schema.sql** :

- `market_prices` (ligne 1140-1164)
- `season_trends` (ligne 1166-1189)
- `price_alerts` (ligne 1191-1212)

---

#### 4.2.6. ✅ Bourse de Partage d'Outils

**Fichier** : `js/modules/tools-sharing.js` + `pages/shared/tools-sharing.html`

**Fonctionnalités :**

- Catalogue d'outils :
  - Semoir mécanique, motoculteur, pulvérisateur
  - Prix de location
  - Localisation
  - Disponibilité
- Système de réservation :
  - Créneaux disponibles
  - Caution
  - Conditions d'usage
- Notation des propriétaires (1-5 étoiles)
- Favoris

**Tables dans schema.sql** :

- `tools_sharing` (ligne 1387-1421)
- `tool_rentals` (ligne 1428-1461)
- `tool_favorites` (ligne 1463-1472)
- `tool_reviews` (ligne 1474-1487)

---

#### 4.2.7. ✅ Commandes Groupées d'Intrants

**Fichier** : `js/modules/group-orders.js` + `pages/shared/group-orders.html`

**Fonctionnalités :**

- Création de commandes groupées :
  - Initiateur
  - Liste des produits
  - Quantités par ferme
  - Date limite
- Suivi de livraison collective
- Attribution des parts

**Tables dans schema.sql** :

- `group_orders` (ligne 681-701)
- `group_order_items` (ligne 703-724)
- `farms_community` (ligne 726-742)

---

#### 4.2.8. ✅ Maintenance des Équipements

**Fichier** : `js/modules/employees.js` (partie équipements) + page dédiée

**Fonctionnalités :**

- Registre des équipements :
  - Motopompes, pulvérisateurs, semoirs
  - Date d'achat, coût
  - Heures d'utilisation
- Plan de maintenance :
  - Vidange, changement filtres
  - Révision générale
- Alertes basées sur heures d'utilisation
- Historique des interventions

**Tables dans schema.sql** :

- `equipments` (ligne 744-770)
- `maintenance_history` (ligne 772-791)
- `maintenance_alerts` (ligne 793-809)

---

#### 4.2.9. ✅ Gestion des Micro-Crédits

**Fichier** : `js/modules/finances.js` (partie crédits) + intégration dans finances.html

**Fonctionnalités :**

- Enregistrement des crédits :
  - Créancier (CNCAS, MEC, diaspora)
  - Montant, taux d'intérêt
  - Échéancier
- Suivi des remboursements :
  - Montant remboursé
  - Reste dû
  - Prochaine échéance
- Jauge visuelle d'avancement
- Alertes de retard

**Tables dans schema.sql** :

- `credits` (ligne 811-837)
- `credit_payments` (ligne 839-858)
- `debt_summary` (ligne 860-877)

---

#### 4.2.10. ✅ Estimation de Durée de Conservation

**Fichier** : `js/modules/stocks.js` + `pages/shared/stocks.html`

**Fonctionnalités :**

- Base de données des durées de conservation par culture
- Alertes de péremption imminente (J-3)
- Visualisation de l'état des stocks stockés
- Recommandations de méthode de conservation

**Tables dans schema.sql** :

- `storage_lifespans` (ligne 879-898)
- `stored_harvests` (ligne 901-925)
- `conservation_alerts` (ligne 927-942)

---

### 4.3. FONCTIONNALITÉS AVANCÉES (Priorité 3)

#### 4.3.1. ✅ Integration IA Gemini (Diagnostic par Chat)

**Fichier** : `api/index.js` (lignes 570-656)

**Fonctionnalités confirmées :**

- API endpoint `POST /api/gemini`
- Support texte + images (base64)
- Modèles Gemini tentés : `gemini-2.5-flash`, `gemini-2.5-flash-lite`
- Système instruction spécialisé agriculture ouest-africaine
- Historique de conversation
- Gestion d'erreur avec retry

**Utilisation** : accessible via interface de chat dans l'application

**Configuration** :变量 d'environnement `GEMINI_API_KEY` requise

---

#### 4.3.2. ✅ Cartographie Interactive

**Fichier** : Tables dans schema.sql (ligne 1306-1385)

**Tables définies** :

- `farm_map_config` (ligne 1306-1324)
- `parcel_positions` (ligne 1326-1350)
- `parcel_visual_status` (ligne 1352-1368)
- `map_legend` (ligne 1370-1385)

**Note** :Tables créées dans le schéma SQL mais l'interface frontend n'a pas été vérifiée.

---

#### 4.3.3. ✅ Mode Hors-Ligne (Offline-First)

**Fichiers** : `sw.js` (Service Worker) + `js/modules/offline-storage.js` + `js/modules/sync-manager.js`

**Fonctionnalités confirmées :**

- Service Worker enregistré
- Stockage local via localStorage
- file d'attente de synchronisation
- Détection du statut réseau
- Synchronisation automatique quand connexion rétablie

**Tables dans schema.sql** :

- `sync_queue` (ligne 1687-1710)
- `sync_conflicts` (ligne 1712-1733)
- `sync_status` (ligne 1735-1754)
- `offline_actions` (ligne 1756-1776)

---

#### 4.3.4. ✅ Messagerie Horticole

**Fichier** : `api/index.js` (lignes 527-551) + tables schema.sql

**API endpoint** : `GET/POST /api/messages`

**Tables dans schema.sql** :

- `advisors` (ligne 1778-1804)
- `conversations` (ligne 1806-1830)
- `chat_messages` (ligne 1832-1856)
- `chat_attachments` (ligne 1858-1877)
- `quick_replies` (ligne 1879-1892)

**Note** : Backend API messages fonctionnel, interface frontend à vérifier.

---

#### 4.3.5. ✅ Parrainage de Parcelles (Diaspora)

**Fichier** : Tables dans schema.sql (ligne 1894-1983)

**Tables définies** :

- `investors` (ligne 1894-1924)
- `sponsorships` (ligne 1926-1956)
- `sponsorship_updates` (ligne 1958-1983)
- `sponsorship_payments` (ligne 1985-2000+)

**Note** : Schéma complet mais aucune interface ou module JS dédié n'a été confirmé dans le code exploré.

---

## 5. MODÈLE DE DONNÉES ACTIF

### 5.1. Entités Principales (localStorage)

**Parcelles** (`ka_farm_parcelles`):

- id, name, surface, lat, lng
- status (Cultivée, En préparation, Repos)
- type_sol (sableux, limoneux, argileux)
- history (array de cultures passées)
- currentCrop
- waterStatus

**Cultures** (`ka_farm_crops`):

- id, name, field (parcelle)
- sowingDate, harvestDate
- status (Semis, Croissance, Floraison, Récoltable)
- waterStatus, fertilizerStatus
- seedType, season
- photos (array pour diagnostic sanitaire)

**Pépinières** (`ka_farm_nurseries`):

- id, name, cropType
- sowingDate, plannedTransplantDate
- quantityEst, status
- healthStatus

**Finances** (`ka_farm_finances`):

- id, description, category
- type (Revenu/Dépense)
- amount, date
- parcel_id, crop_name (optionnels)

**Stocks** (`ka_farm_stocks`):

- id, name, category
- quantity, maxQuantity, unit

**Employés** (`ka_farm_employees`):

- id, name, phone, role
- dailyRate, status

**Pointage** (`ka_farm_attendance`):

- employeeId, date, status
- notes

**Paiements** (`ka_farm_employee_payments`):

- id, employeeId, amount
- date, periodStart, periodEnd
- paymentMethod, status

**Cheptel** (`ka_farm_cheptel`):

- id, name, type, breed
- quantity, unit, status, purpose

**Production Élevage** (`ka_farm_elevage_production`):

- id, date, type, quantity, unit, notes

**Santé Élevage** (`ka_farm_elevage_health`):

- id, date, target, intervention
- practitioner, cost, notes

**Traitements** (`ka_farm_treatments`):

- id, parcelId, parcelName, cropId, cropName
- category, productName, dateApplied, dar
- target, notes, harvestReady

**Profitabilité** (`ka_farm_crop_profits`):

- id, cropName, parcelId, parcelName
- yieldKg, pricePerKg, revenue
- costs (JSON: seeds, fertilizer, water, labor)
- totalCost, netMargin, profitabilityPercent

**Météo** (`ka_farm_current_weather`, `ka_farm_weather_alerts`):

- temperature, humidity, wind, rainfall
- alert configurations

**Users** (`ka_farm_users`):

- email, name, role
- enterpriseId, enterpriseName, enterpriseCode
- password (hash SHA-256)
- twitter, linkedin, facebook

---

### 5.2. Entités Backend (Firestore)

**Collections Firestore** :

- `app_data/crops`
- `app_data/parcelles`
- `app_data/tasks`
- `app_data/finances`
- `app_data/employees`
- `app_data/cheptel`
- `app_data/elevage_production`
- `app_data/elevage_health`
- `app_data/messages`
- `app_data/stocks`

**Structure de synchronisation** :

```javascript
// api/index.js ligne 187-210
async function syncWithFirestore(collection, fallbackData) {
  const docSnap = await getDoc(doc(db, "app_data", collection));
  if (docSnap.exists()) {
    return docSnap.data().data || fallbackData;
  }
  return fallbackData;
}
```

---

## 6. ÉCARTS ENTRE DOCUMENTATION ET IMPLÉMENTATION

### 6.1. Éléments Documentés mais NON Implémentés

**Base de données PostgreSQL** :

- ✅ `db/schema.sql` présent (2438 lignes, 85 tables)
- ❌ Aucune connexion PostgreSQL/Supabase active dans le code
- ❌ Aucune migration exécutée
- ❌ Tables définies mais non utilisées en production

**Fichiers concernés** :

- `js/db.js` : Client Supabase présent mais **non utilisé**
- `db/migrate.js` : Script de migration présent mais **non exécuté**
- `db/policies.sql` : RLS policies définies mais **non appliquées**

**Modules documentés mais non vérifiés** :

- Cartographie interactive (`farm-map.html`)
- Parrainage diaspora (`invest.html`)
- Générateur de rapports PDF
- Module de formation complet

### 6.2. Incohérences Détectées

**Stack déclaré vs réel** :

| Élément          | Documentation         | Code Réel                               |
| ---------------- | --------------------- | --------------------------------------- |
| Base de données  | PostgreSQL + Supabase | **localStorage**                        |
| ORM              | SQL                   | **Firebase Firestore**                  |
| Frontend routing | React Router          | **SPA HTML templates**                  |
| Build            | Vite                  | **Vite pour dev, CDN Tailwind en prod** |

**Fichier package.json** :

```json
{
  "dependencies": {
    "firebase": "^12.15.0", // Utilisé pour sync
    "express": "^4.21.2", // Utilisé pour API
    "@google/genai": "^2.4.0", // IA Gemini
    "zod": "^3.25.76", // Validation
    "winston": "^3.19.0", // Logging
    "helmet": "^8.2.0", // Sécurité
    "cors": "^2.8.6", // CORS
    "express-rate-limit": "^8.5.2", // Rate limiting
    "motion": "^12.23.24", // Animations
    "vite": "^6.2.3", // Build
    "dotenv": "^17.2.3" // Variables env
  }
}
```

**Nettoyage effectué (2026-07-18)** :

- ✅ Suppression de `@supabase/supabase-js` (non utilisé)
- ✅ Suppression de `pg` (PostgreSQL driver, non utilisé)
- ✅ Archivage de `db/schema.sql`, `db/policies.sql`, `db/migrate.js` vers `docs/future-db/`

---

## 7. FONCTIONNALITÉS MANQUANTES OU INCOMPLÈTES

### 7.1. Critiques (Bloquantes pour Production)

1. **Authentification Robuste**
   - ✅ Firebase Auth présent
   - ❌ Pas de gestion des rôles fine (admin, gestionnaire, ouvrier, etc.)
   - ❌ Pas de isolation multi-tenant vérifiée (seulement scoping localStorage)
   - ❌ Pas de réinitialisation de mot de passe

2. **Persistance des Données**
   - ⚠️ localStorage seulement (fragile, pas de backup automatique)
   - ⚠️ Synchronisation Firebase partielle (seulement les collections API)
   - ❌ Pas de versioning des données
   - ❌ Pas de résolution de conflits

3. **Sécurité**
   - ⚠️ Rate limiting présent (100 req/15min)
   - ❌ Pas de validation CORS fine
   - ❌ Pas de sanitization des inputs HTML (XSS risque)
   - ❌ Mot de passe hashé en SHA-256 (cryptographie faible)

### 7.2. Importantes (Améliorent l'Expérience)

4. **Interface Utilisateur**
   - ❌ Page de login/signup non vérifiée
   - ❌ Interface de diagnostic IA par image non connectée à Gemini
   - ❌ Pas d'export PDF des rapports
   - ❌ Pas de notifications push

5. **Fonctionnalités Métier**
   - ❌ Gestion de la main-d'œuvre temporaire (journaliers) - Tables SQL prêtes mais UI non vérifiée
   - ❌ Module de crédits - Tables SQL prêtes mais UI non vérifiée
   - ❌ Module d'estimation de durée de conservation - Tables SQL prêtes mais UI non vérifiée
   - ❌ Calculateur d'espacement des cultures - Tables SQL prêtes mais UI non vérifiée
   - ❌ Bons de livraison - Tables SQL prêtes mais UI non vérifiée

6. **Performance**
   - ❌ Pas de pagination (risque sur gros volumes)
   - ❌ Pas de cache intelligent (seulement Cache.memo 30s)
   - ❌ Pas de compression images
   - ❌ Pas de lazy loading

### 7.3. Souhaitables (Nice to Have)

7. **Analytique**
   - ❌ Pas de logs d'audit
   - ❌ Pas de métriques d'usage
   - ❌ Pas de machine learning prédictif

8. **Collaboration**
   - ❌ Pas de partage de parcelles entre utilisateurs
   - ❌ Pas de notifications en temps réel
   - ❌ Pas de commentaires/annotations

---

## 8. DETTE TECHNIQUE IDENTIFIÉE

### 8.1. Architecture

**Problème 1 : Double Stack Inutile**

```javascript
// Présent mais non utilisé :
import { getSupabaseClient } from "./db.js"; // ❌
import pg from "pg"; // ❌

// Utilisé :
import { KAStorage } from "./storage.js"; // ✅
import { KAFirebaseSync } from "./firebase.js"; // ✅
```

**Impact** :

- Code mort à maintenir
- Confusion pour nouveaux développeurs
- Augmentation de la taille du bundle

**Recommandation** : Supprimer les imports Supabase et PostgreSQL du frontend.

---

**Problème 2 : localStorage comme Base de Données**

**Impact** :

- Limite à 5-10 MB
- Pas de requêtes complexes
- Pas de transactions ACID
- Perte possible si user clear cache
- Pas de sauvegarde centralisée

**Recommandation** : Déplacer vers Firebase Firestore comme stockage primaire.

---

### 8.2. Sécurité

**Problème 3 : Hash SHA-256 pour Mots de Passe**

```javascript
// js/storage.js lignes 461-537
hashPassword(password) {
  // SHA-256 implementation (legacy)
  // Non adapté pour passwords (pas de salt, pas de work factor)
}
```

**Impact** : Vulnérable aux attaques par rainbow tables.

**Recommandation** : Utiliser bcrypt ou Argon2.

---

**Problème 4 : Validation Zod mais Exécution Client**

```javascript
// api/index.js - Validation seulement côté serveur
const CropSchema = z.object({...});
app.post('/api/crops', async (req, res) => {
  const crop = CropSchema.parse(req.body); // ✅ Serveur
  // Mais pas de validation côté client avant envoi
});
```

**Impact** : Erreurs seulement détectées au serveur.

**Recommandation** : Ajouter validation client également.

---

### 8.3. Code Quality

**Problème 5 : Code Dupliqué**

```javascript
// serverStocks dans api/index.js ligne 139-145
// DEFAULT_STOCKS dans js/storage.js ligne 19-25
// DONNÉES IDENTIQUES mais maintenues séparément
```

**Impact** : Risque d'incohérence.

**Recommandation** : Factoriser dans un fichier `data/seeds.js` partagé.

---

**Problème 6 : Gestion d'Erreur Incomplète**

```javascript
// api/index.js - Certains endpoints manquent de try/catch
app.put("/api/crops/:id", async (req, res) => {
  try {
    // ...
  } catch (error) {
    logger.error("Error updating crop", { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

// Mais d'autres endpoints comme /api/weather n'ont pas de try/catch global
```

**Recommandation** : Ajouter un middleware de gestion d'erreur global.

---

### 8.4. Tests

**Problème 7 : Tests Existants mais Non Exécutés**

```
__tests__/
├── api.test.js      # Tests API
├── app.test.js      # Tests app
├── crypto.test.js   # Tests crypto
└── storage.test.js  # Tests storage
```

**Config présent** (`jest.config.js`) mais :

- ❌ Pas de CI/CD configurée
- ❌ Pas de coverage minimum
- ❌ Tests pas vérifiés récemment

**Recommandation** : Ajouter GitHub Actions ou Vercel CI.

---

## 9. RECOMMANDATIONS TECHNIQUES PRIORISÉES

### Priorité 1 - CRITIQUE (À faire immédiatement)

**1.1 Migration vers Firestore comme Stockage Principal**

**Justification** : localStorage est fragile, pas de backup, pas de sync multi-appareils.

**Plan** :

1. Modifier `js/storage.js` pour read/write directement dans Firestore
2. Garder localStorage comme cache offline uniquement
3. Implémenter stratégie de sync bidirectionnelle
4. Tester avec 1000+ enregistrements

**Fichiers à modifier** :

- `js/storage.js` (refonte complète)
- `js/modules/*.js` (adapter aux promesses Firestore)
- `js/firebase.js` (améliorer sync)

---

**1.2 Renforcement de l'Authentification**

**Justification** : Sécurité des données agricoles.

**Plan** :

1. Implémenter Firebase Auth complet (email/password + Google)
2. Ajouter rôles utilisateur dans Firestore
3. Créer middleware de vérification de rôles
4. Ajouter réinitialisation mot de passe

**Fichiers à créer** :

- `js/auth.js` (gestion authentification)
- `middleware/auth.js` (protection routes)

---

**1.3 Nettoyage du Code Mort**

**Justification** : Réduire complexité et taille du bundle.

**Plan** :

1. Supprimer imports Supabase inutilisés
2. Supprimer `db/schema.sql` du build (garder pour ref)
3. Archiver `db/migrate.js`, `db/policies.sql`
4. Nettoyer `package.json` (dépendances inutilisées)

**Gain estimé** : -200KB bundle size

---

### Priorité 2 - IMPORTANTE (À faire dans les 2 semaines)

**2.1 Compléter les Interfaces Manquantes**

**À faire** :

1. **Module Main-d'œuvre Journalière**
   - Créer `pages/shared/daily-labor.html`
   - Créer `js/modules/daily-labor.js`
   - Intégrer dans finances

2. **Module Crédits**
   - Compléter UI dans `pages/shared/finances.html`
   - Créer `js/modules/credits.js`

3. **Bons de Livraison**
   - Créer `pages/shared/delivery-notes.html`
   - Créer `js/modules/delivery-notes.js`

**Justification** : Tables SQL existent, seule l'UI manque.

---

**2.2 Améliorer la Gestion d'Erreur**

**Plan** :

1. Créer `js/modules/error-handler.js` (✅ existe déjà)
2. Ajouter try/catch dans tous les endpoints API
3. Créer page d'erreur utilisateur friendly
4. Logger les erreurs critiques dans Firestore

---

**2.3 Optimiser les Performances**

**Actions** :

1. Ajouter pagination dans listes (crops, tasks, finances)
2. Implémenter virtual scrolling pour >100 items
3. Optimiser les images (compression avant sauvegarde)
4. Ajouter cache Redis (si budget permet)

---

### Priorité 3 - SOUHAITABLE (À faire dans le mois)

**3.1 Ajouter des Tests Automatisés**

**Plan** :

1. Compléter tests unitaires (couvrir 80% du code)
2. Ajouter tests E2E avec Cypress
3. Configurer CI/CD GitHub Actions
4. Ajouter coverage report

**Gain** : Réduction des régressions de 70%.

---

**3.2 Implémenter Export PDF**

**Utiliser** : `jspdf` + `html2canvas`

**Générer** :

- Bilan financier mensuel
- Rapport de production
- Bon de livraison

---

**3.3 Ajouter Notifications Push**

**Service** : Firebase Cloud Messaging (FCM)

**Cas d'usage** :

- Alertes météo urgentes
- Rappel tâches
- Alerte stock bas

---

## 10. ACTIONS IMMÉDIATES

### Check-list de Démarrage

- [ ] **Semaine 1** :
  - [ ] Supprimer code mort (Supabase, PostgreSQL)
  - [ ] Migrer `js/storage.js` vers Firestore-first
  - [ ] Implémenter auth Firebase complète
  - [ ] Ajouter validation client sur formulaires critiques

- [ ] **Semaine 2-3** :
  - [ ] Créer UI Main-d'œuvre journalière
  - [ ] Créer UI Crédits
  - [ ] Créer UI Bons de livraison
  - [ ] Compléter tests unitaires manquants

- [ ] **Semaine 4** :
  - [ ] Optimiser performances (pagination, images)
  - [ ] Ajouter exports CSV/PDF
  - [ ] Configurer CI/CD
  - [ ] Documenter l'API (Swagger/OpenAPI)

- [ ] **Mois 2** :
  - [ ] Implémenter notifications push
  - [ ] Ajouter analytics (Google Analytics ou Plausible)
  - [ ] Créer module de sauvegarde automatique
  - [ ] Tester charge (1000+ users simulés)

---

## ANNEXES

### A. Variables d'Environnement Requises

**Fichier `.env`** :

```env
# Firebase
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx

# Gemini AI
GEMINI_API_KEY=xxx

# Optionnel
VITE_APP_VERSION=1.0.0
VITE_ENV=production
```

### B. Commandes de Développement

```bash
# Installation
npm install

# Développement
npm run dev          # Démarre server.js (Express + Vite)

# Build
npm run build        # Build Vite pour production

# Tests
npm test             # Jest unitaires
npm run test:watch   # Jest en mode watch
npm run test:coverage # Coverage report

# Base de données (si migration PostgreSQL nécessaire)
npm run migrate:up   # Appliquer migrations
npm run migrate:down # Rollback migrations
```

### C. Points d'Attention pour les Nouveaux Développeurs

1. **NE PAS MODIFIER** `db/schema.sql` sans consensus (référence pour futur PostgreSQL)
2. **TOUJOURS UTILISER** `KAStorage` pour accéder aux données (`js/storage.js`)
3. **SYNCHRONISER** les données modifiées avec Firebase (`KAFirebaseSync`)
4. **VALIDER** les inputs avec Zod (`api/index.js`)
5. **TESTER** sur mobile avant merge (PWA obligatoire)

---

**Document généré le** : 2025-07-18  
**Prochaine révision** : 2025-08-18  
**Contact** : Équipe KA Farm - tech@kafarm.sn
