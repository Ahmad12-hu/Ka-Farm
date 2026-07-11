# 🎓 KA Farm - Guide de Formation de l'Équipe

**Version** : 1.0  
**Date** : 16 Novembre 2025  
**Durée** : 2-3 heures  
**Public** : Tous les utilisateurs de KA Farm (terrain & bureau)

---

## 📋 Objectifs Pédagogiques

À la fin de cette formation, l'utilisateur sera capable de :

✅ Se connecter à son espace personnel  
✅ Enregistrer une récolte  
✅ Mettre à jour les stocks  
✅ Enregistrer une transaction financière  
✅ Consulter et modifier les données du personnel  
✅ Comprendre le fonctionnement général du système

---

## 📚 Structure de la Formation

### **Module 1 : Découverte de KA Farm** (30 min)

- Présentation générale
- Architecture du système
- Accès et navigation

### **Module 2 : Gestion des Cultures** (25 min)

- Enregistrer une récolte
- Suivre l'état des cultures
- Comprendre les statuts

### **Module 3 : Gestion des Stocks** (20 min)

- Ajouter/modifier un stock
- Comprendre les alertes
- Historique des mouvements

### **Module 4 : Gestion Financière** (30 min)

- Enregistrer une dépense
- Enregistrer une vente
- Lire les statistiques

### **Module 5 : Gestion du Personnel** (25 min)

- Ajouter un employé
- Pointer les présences
- Gérer les paiements

### **Module 6 : Astuces et Bonnes Pratiques** (20 min)

- Raccourcis clavier
- Erreurs courantes
- Support et aide

---

## 🎥 Module 1 : Découverte de KA Farm

### 1.1 Qu'est-ce que KA Farm ?

**KA Farm** est un système de gestion agricole intégré qui permet de :

- 📊 **Suivre** toutes les activités de l'exploitation
- 🌾 **Gérer** les cultures, stocks, finances et personnel
- 📱 **Accéder** aux données depuis n'importe quel appareil
- 🔄 **Synchroniser** les données en temps réel

### 1.2 Architecture du Système

```
KA Farm
├── 🖥️ Application Web (ce que vous voyez maintenant)
├── 📱 Base de données (stockage sécurisé)
├── 🔐 Authentification (votre compte)
└── 🔄 Synchronisation automatique
```

**Points clés** :

- ✅ Tout est sauvegardé automatiquement
- ✅ Plusieurs utilisateurs peuvent travailler en même temps
- ✅ Accessible 24h/24, 7j/7

### 1.3 Accès et Navigation

**URL** : `https://ka-farm.vercel.app` (ou l'URL fournie par votre admin)

#### **Connexion**

1. Aller sur la page de login
2. Entrer votre **email** et **mot de passe**
3. Cliquer sur **"Se connecter"**

#### **Navigation Principale**

**Desktop** : Utiliser la sidebar (menu à gauche)  
**Mobile** : Menu hamburger (☰) en haut à gauche

**Sections principales** :

- 🏠 **Accueil** : Vue d'ensemble
- 📊 **Tableau de Bord** : Statistiques globales
- 🌾 **Cultures** : Suivi des cultures
- 📦 **Stocks** : Inventaire
- 💰 **Finances** : Revenus et dépenses
- 👥 **Personnel** : Employés et pointage
- 💬 **Discussions** : Messagerie interne

---

## 🌾 Module 2 : Gestion des Cultures

### 2.1 Accéder à la page Cultures

**Chemin** : Sidebar → Cultures (icône 🌾)

**URL** : `/pages/shared/crops.html`

### 2.2 Enregistrer une Nouvelle Culture

**Étapes** :

1. Cliquer sur **"Ajouter une Culture"**
2. Remplir le formulaire :

| Champ            | Description                   | Exemple            |
| ---------------- | ----------------------------- | ------------------ |
| **ID Culture**   | Code unique (C-001, C-002...) | `C-005`            |
| **Nom**          | Nom de la culture             | `Tomate Mongal F1` |
| **Parcelle**     | Où est plantée la culture     | `Parcelle Nord`    |
| **Date Semis**   | Date de plantation            | `2026-06-01`       |
| **Date Récolte** | Date prévue                   | `2026-08-15`       |
| **Statut**       | État actuel                   | `Croissance`       |
| **Eau**          | Besoin en irrigation          | `Optimale`         |
| **Engrais**      | État fertilisation            | `OK`               |

3. Cliquer sur **"Enregistrer"**

### 2.3 Statuts des Cultures

| Statut         | Signification     | Couleur   |
| -------------- | ----------------- | --------- |
| **Semis**      | Planté depuis peu | 🟡 Jaune  |
| **Croissance** | En développement  | 🟢 Vert   |
| **Floraison**  | En fleur          | 🟣 Violet |
| **Récoltable** | Prêt à récolter   | 🟠 Orange |
| **Récolté**    | Déjà récolté      | ⚪ Gris   |

### 2.4 Bonnes Pratiques

✅ **À faire** :

- Enregistrer la culture le jour du semis
- Mettre à jour le statut chaque semaine
- Ajouter des notes dans le champ "notes"

❌ **À éviter** :

- Oublier de changer le statut
- Utiliser des abréviations (écrire le nom complet)
- Créer des doublons

### 2.5 Exercice Pratique

**Ajouter une culture de choux** :

- ID : `C-006`
- Nom : `Chou Cabus`
- Parcelle : `Parcelle Sud`
- Date Semis : `2026-07-01`
- Date Récolte : `2026-09-30`
- Statut : `Croissance`

---

## 📦 Module 3 : Gestion des Stocks

### 3.1 Accéder à la page Stocks

**Chemin** : Sidebar → Stocks (icône 📦)

**URL** : `/pages/shared/stocks.html`

### 3.2 Ajouter un Article en Stock

**Étapes** :

1. Cliquer sur **"Ajouter un Stock"**
2. Remplir :

| Champ         | Description       | Exemple       |
| ------------- | ----------------- | ------------- |
| **ID**        | Code unique       | `S-006`       |
| **Nom**       | Nom du produit    | `Engrais NPK` |
| **Catégorie** | Type d'article    | `Engrais`     |
| **Quantité**  | Quantité actuelle | `50`          |
| **Max**       | Quantité maximale | `200`         |
| **Unité**     | Unité de mesure   | `sacs`        |

3. Cliquer sur **"Enregistrer"**

### 3.3 Comprendre les Alertes

**Indicateur de stock bas** : ⚠️

Une alerte apparaît quand :

```
Quantité actuelle ≤ 20% de Quantité Maximale
```

**Exemple** :

- Quantité max = 100
- Seuil d'alerte = 20
- Alerte si quantité ≤ 20

### 3.4 Mettre à Jour un Stock

**Pour ajouter du stock** :

1. Trouver l'article dans la liste
2. Cliquer sur **✏️ (modifier)**
3. Augmenter la quantité
4. Enregistrer

**Pour retirer du stock** :

1. Même processus
2. Diminuer la quantité
3. Ajouter une note si nécessaire

### 3.5 Exercice Pratique

**Ajouter un stock de semences** :

- ID : `S-007`
- Nom : `Semences Piment Oiseau`
- Catégorie : `Semences`
- Quantité : `15`
- Max : `30`
- Unité : `sachets`

---

## 💰 Module 4 : Gestion Financière

### 4.1 Accéder à la page Finances

**Chemin** : Sidebar → Finances (icône 💰)

**URL** : `/pages/shared/finances.html`

### 4.2 Enregistrer une Transaction

**Types de transactions** :

- 💵 **Revenu** : Vente de produits
- 💸 **Dépense** : Achat d'intrants, salaires, etc.

**Étapes pour enregistrer** :

1. Cliquer sur **"Ajouter Transaction"**
2. Choisir le **type** :
   - `Revenu` si vous recevez de l'argent
   - `Dépense` si vous dépensez de l'argent

3. Remplir les champs :

| Champ           | Description              | Exemple (Revenu) | Exemple (Dépense) |
| --------------- | ------------------------ | ---------------- | ----------------- |
| **ID**          | Code unique              | `F-013`          | `F-014`           |
| **Description** | Détail de la transaction | `Vente tomates`  | `Achat engrais`   |
| **Catégorie**   | Type de revenu/dépense   | `Vente Légumes`  | `Engrais`         |
| **Montant**     | Somme en FCFA            | `150000`         | `35000`           |
| **Date**        | Date de la transaction   | `2026-11-16`     | `2026-11-15`      |

4. Cliquer sur **"Enregistrer"**

### 4.3 Comprendre les Statistiques

**En haut de la page** :

| Indicateur         | Calcul                       | Signification         |
| ------------------ | ---------------------------- | --------------------- |
| **Total Revenus**  | Somme de tous les revenus    | Argent entré          |
| **Total Dépenses** | Somme de toutes les dépenses | Argent sorti          |
| **Solde**          | Revenus - Dépenses           | Trésorerie disponible |

**Exemple** :

- Revenus : 2 000 000 F
- Dépenses : 1 500 000 F
- Solde : +500 000 F (positif ✅)

### 4.4 Catégories Courantes

**Revenus** :

- Vente Légumes
- Vente Fruits
- Vente Animaux
- Autres Revenus

**Dépenses** :

- Semences
- Engrais
- Carburant
- Salaires
- Maintenance
- Autres Dépenses

### 4.5 Exercice Pratique

**Enregistrer une vente de récolte** :

- ID : `F-013`
- Type : `Revenu`
- Description : `Vente 100 kg tomates`
- Catégorie : `Vente Légumes`
- Montant : `65000`
- Date : `2026-11-16`

**Enregistrer un achat** :

- ID : `F-014`
- Type : `Dépense`
- Description : `Achat 10 sacs engrais`
- Catégorie : `Engrais`
- Montant : `50000`
- Date : `2026-11-15`

---

## 👥 Module 5 : Gestion du Personnel

### 5.1 Accéder à la page Personnel

**Chemin** : Sidebar → Employés (icône 👥)

**URL** : `/pages/shared/employees.html`

### 5.2 Ajouter un Employé

**Étapes** :

1. Cliquer sur **"Ajouter Employé"**
2. Remplir :

| Champ               | Description       | Exemple            |
| ------------------- | ----------------- | ------------------ |
| **ID**              | Code unique       | `E-006`            |
| **Nom complet**     | Nom de l'employé  | `Moussa Diop`      |
| **Téléphone**       | Numéro de contact | `77 123 45 67`     |
| **Rôle**            | Fonction          | `Ouvrier agricole` |
| **Taux journalier** | Salaire par jour  | `4000`             |
| **Statut**          | Actif/Inactif     | `Actif`            |

3. Cliquer sur **"Enregistrer"**

### 5.3 Pointer les Présences

**Méthode 1 : Via la page Employés**

1. Aller sur la page Employés
2. Trouver l'employé
3. Cliquer sur **📋 (pointage)**
4. Sélectionner la date et le statut :
   - ✅ Présent
   - ❌ Absent
   - 🕐 Demi-journée
5. Ajouter une note si nécessaire
6. Enregistrer

**Méthode 2 : Via le Dashboard**

1. Aller sur le Tableau de Bord
2. Section "Présences du jour"
3. Cliquer sur les cases à cocher

### 5.4 Enregistrer un Paiement

**Étapes** :

1. Aller sur Employés
2. Cliquer sur **💰 (paiements)**
3. Cliquer sur **"Nouveau Paiement"**
4. Remplir :
   - Employé
   - Période (date début - date fin)
   - Montant total
   - Mode de paiement (Espèces, Wave, Orange Money)
5. Enregistrer

### 5.5 Exercice Pratique

**Ajouter un nouvel employé** :

- ID : `E-006`
- Nom : `Fatou Sow`
- Téléphone : `76 987 65 43`
- Rôle : `Maraîchère`
- Taux : `4500`
- Statut : `Actif`

**Pointer sa présence pour aujourd'hui** :

- Date : `2026-11-16`
- Statut : `Présent`

---

## 💡 Module 6 : Astuces et Bonnes Pratiques

### 6.1 Raccourcis Clavier

| Raccourci  | Action                                 |
| ---------- | -------------------------------------- |
| `Ctrl + N` | Nouvelle entrée (dans les formulaires) |
| `Ctrl + S` | Sauvegarder (si disponible)            |
| `Ctrl + F` | Rechercher dans la page                |
| `F5`       | Actualiser la page                     |
| `Alt + ←`  | Retour à la page précédente            |

### 6.2 Erreurs Courantes et Solutions

#### ❌ Erreur 1 : "Accès refusé"

**Cause** : Session expirée  
**Solution** :

1. Se déconnecter
2. Se reconnecter avec email/mot de passe

#### ❌ Erreur 2 : "Données non sauvegardées"

**Cause** : Problème de connexion internet  
**Solution** :

1. Vérifier la connexion internet
2. Actualiser la page
3. Réessayer l'action

#### ❌ Erreur 3 : "Champ obligatoire manquant"

**Cause** : Oubli de remplir un champ  
**Solution** :

1. Vérifier tous les champs
2. Repérer le champ en rouge
3. Le remplir

### 6.3 Bonnes Pratiques

✅ **À faire** :

- Toujours vérifier avant d'enregistrer
- Mettre à jour les données le jour même
- Utiliser des noms complets (pas d'abréviations)
- Ajouter des notes pour les cas particuliers
- Se déconnecter après utilisation (surtout sur ordinateur partagé)

❌ **À éviter** :

- Partager son mot de passe
- Laisser la session ouverte
- Supprimer des données sans confirmation
- Créer des doublons

### 6.4 Support et Aide

**En cas de problème** :

1. **Contacter l'administrateur** :
   - Email : `admin@kafarm.sn`
   - Téléphone : [À compléter par l'admin]

2. **Message types** :

   ```
   Bonjour, j'ai un problème avec [section].
   Voici ce que j'essaie de faire : [action]
   Message d'erreur : [si applicable]
   Date/Heure : [quand c'est arrivé]
   ```

3. **Délai de réponse** : 24-48h

---

## ✅ Évaluation de la Formation

### Quiz de Validation

**Questions** :

1. **Combien de sections principales y a-t-il dans KA Farm ?**
   - A) 3
   - B) 5
   - C) 7
   - D) 10

   **Réponse** : C) 7 (Cultures, Stocks, Finances, Personnel, Récoltes, Élevage, Discussions)

2. **Quand une alerte de stock bas apparaît-elle ?**
   - A) Quantité = 0
   - B) Quantité ≤ 50% du max
   - C) Quantité ≤ 20% du max
   - D) Quantité < 10

   **Réponse** : C) Quantité ≤ 20% du max

3. **Comment enregistrer une vente de 100 kg de tomates à 650 F/kg ?**
   - Type : Revenu
   - Description : Vente tomates
   - Montant : 65000 F

   **Réponse** : ✅ Correct !

4. **Que faire si la session expire ?**
   - A) Redémarrer l'ordinateur
   - B) Vider le cache
   - C) Se déconnecter et se reconnecter
   - D) Appeler l'admin

   **Réponse** : C) Se déconnecter et se reconnecter

### Checklist de Compétences

Cocher chaque élément maîtrisé :

- [ ] Je sais me connecter à mon espace
- [ ] Je sais naviguer entre les sections
- [ ] Je sais ajouter une culture
- [ ] Je sais modifier le statut d'une culture
- [ ] Je sais ajouter un article en stock
- [ ] Je sais interpréter les alertes de stock
- [ ] Je sais enregistrer une transaction financière
- [ ] Je sais lire les statistiques financières
- [ ] Je sais ajouter un employé
- [ ] Je sais pointer les présences
- [ ] Je sais enregistrer un paiement
- [ ] Je sais contacter le support en cas de problème

**Score** : \_\_\_\_ / 12

**Validation** :

- 10-12 : ✅ Excellent, prêt à utiliser KA Farm
- 7-9 : ✅ Bon, quelques révisions recommandées
- < 7 : ⚠️ Formation complémentaire nécessaire

---

## 📖 Ressources Complémentaires

### Documents de Référence

1. **ADMIN_SETUP.md** : Configuration technique (pour l'admin)
2. **README.md** : Documentation générale du projet
3. **SOP.md** : Procédures opérationnelles standard

### Tutoriels Vidéo (à venir)

- 🎥 Connexion et navigation (3 min)
- 🎥 Gestion des cultures (5 min)
- 🎥 Gestion des stocks (4 min)
- 🎥 Gestion financière (6 min)
- 🎥 Gestion du personnel (5 min)

### FAQ (Foire Aux Questions)

**Q1 : Puis-je utiliser KA Farm sur mon téléphone ?**  
R : Oui, KA Farm est compatible avec tous les smartphones et tablettes.

**Q2 : Que se passe-t-il si je perd ma connexion internet ?**  
R : Les données sont sauvegardées localement et synchronisées automatiquement quand la connexion revient.

**Q3 : Puis-je modifier une entrée après l'avoir enregistrée ?**  
R : Oui, cliquez sur l'icône ✏️ (modifier) à côté de l'entrée.

**Q4 : Comment supprimer une entrée ?**  
R : Cliquez sur 🗑️ (supprimer) et confirmez. Attention, cette action est irréversible.

**Q5 : Qui peut voir mes données ?**  
R : Seuls les membres de votre équipe et l'administrateur ont accès.

**Q6 : Mes données sont-elles sauvegardées ?**  
R : Oui, automatiquement et régulièrement. Vous pouvez aussi faire des exports.

**Q7 : Puis-je exporter mes données ?**  
R : Oui, contactez l'administrateur pour un export complet.

**Q8 : Que faire en cas de bug ?**  
R : Notez le message d'erreur et contactez l'administrateur.

---

## 🎯 Plan d'Action Post-Formation

### Semaine 1 : Découverte

- Jour 1-2 : Navigation et exploration libre
- Jour 3-4 : Enregistrement de 2-3 cultures
- Jour 5-7 : Enregistrement de stocks et transactions

### Semaine 2 : Pratique

- Enregistrement quotidien des présences
- Mise à jour des stocks après chaque utilisation
- Enregistrement des transactions financières

### Semaine 3 : Autonomie

- Utilisation complète sans aide
- Formation d'un nouveau utilisateur
- Remarques et suggestions d'amélioration

---

## 📞 Support

**Contact Support** :

- 📧 Email : support@kafarm.sn
- 📱 Téléphone : [À compléter]
- 💬 Discussion interne : Section "Discussions" de KA Farm

**Temps de réponse garanti** : 24-48h

---

## 🎓 Certification

**Après avoir complété cette formation et réussi le quiz** :

Vous recevrez une **attestation de formation** qui certifie que vous maîtrisez l'utilisation de KA Farm.

**Critères d'obtention** :

- Quiz réussi (≥ 10/12)
- Checklist de compétences complétée (≥ 10/12)
- Validation par l'administrateur

---

**🎉 Félicitations ! Vous êtes maintenant prêt à utiliser KA Farm !**

**Bon travail et bonne récolte ! 🌾**
