# 🌾 KA Farm - Feuille de Route & Analyse Stratégique (30 Fonctionnalités)

Ce document présente une analyse approfondie du projet **KA Farm** (application de gestion agricole au Sénégal) et propose **30 fonctionnalités innovantes, réalistes et adaptées aux réalités du maraîchage, de l'horticulture et des exploitations familiales en Afrique de l'Ouest**.

---

## 📋 Table des Matières
1. [Introduction & Contexte Sénégalais](#-introduction--contexte-sénégalais)
2. [Synthèse de l'Architecture Existante](#-synthèse-de-larchitecture-existante)
3. [Fonctionnalités Essentielles (Priorité 1)](#1-fonctionnalités-essentielles-priorité-1)
4. [Fonctionnalités Importantes (Priorité 2)](#2-fonctionnalités-importantes-priorité-2)
5. [Fonctionnalités Avancées (Priorité 3)](#3-fonctionnalités-avancées-priorité-3)
6. [Schéma de Données Global Réunifié](#-schéma-de-données-global-réunifié)
7. [Guide d'Intégration Technique](#-guide-dintégration-technique)

---

## 🌍 Introduction & Contexte Sénégalais

Le secteur agricole au Sénégal, en particulier la zone horticole des **Niayes** (Dakar-Thiès-Saint-Louis) et la **Petite Côte** (Mbour), est caractérisé par un dynamisme exceptionnel mais fait face à des défis majeurs :
- **Gestion de l'eau** dans un climat semi-aride à sahélien.
- **Accès aux intrants de qualité** et régulation des traitements phytosanitaires.
- **Rapprochement et communication** entre l'équipe sur le terrain (souvent des membres de la famille au village) et les investisseurs ou décideurs administratifs basés en ville (Dakar).
- **Fluctuation extrême des prix** de vente sur les marchés de gros (Sandika, Mbour, Kaolack).

L'application **KA Farm** vise à combler ce fossé en créant un outil de liaison fiable, simple et direct.

---

## 📊 Synthèse de l'Architecture Existante

KA Farm est actuellement structurée comme suit :
- **Frontend** : Application monopage (SPA) fluide, développée en HTML5/Vanilla JS, stylisée avec **Tailwind CSS** (thème vert sombre haut de gamme, propice à l'immersion agricole) et animée via des bibliothèques légères.
- **Backend** : Serveur d'API Node.js/Express assurant les requêtes proxy sécurisées (notamment pour l'assistant d'IA horticole connecté à Gemini).
- **Modules Actuels** : 
  - **Suivi Exploitation & Tableau de Bord** : Synthèse de l'activité.
  - **Gestion de l'Irrigation** : Planification dynamique selon 14 régions météorologiques de référence au Sénégal.
  - **Alertes Agricoles & Ravageurs** : Prévention des maladies locales.
  - **Suivi Financier & Simulateur de Marges** : Évaluation de rentabilité par culture.

---

## 1. Fonctionnalités Essentielles (Priorité 1)
*Indispensables pour sécuriser la production et structurer les opérations quotidiennes.*

### 1.1. Suivi d'irrigation adapté au type de sol local
* **Problème résolu** : Un sol sableux (Dakar/Niayes) filtre l'eau très vite, tandis qu'un sol argilo-limoneux (Vallée du fleuve Sénégal) retient l'eau au risque d'asphyxier les racines. Les recommandations génériques causent soit du sous-arrosage, soit du gaspillage d'eau.
* **Utilité pour l'agriculteur** : Ajustement automatique du volume d'eau quotidien selon la nature de la parcelle, évitant le mildiou et économisant le carburant de la motopompe.
* **Pages à créer** : Ajout d'un champ "Type de sol" dans la page de configuration des parcelles (`/pages/shared/irrigation.html`).
* **Données à stocker** : `sol_type` (sableux, argileux, limoneux, latéritique), `parcelle_id`.
* **Intégration** : Modifier le script de calcul d'évapotranspiration dans `js/modules/dashboard.js` pour appliquer un coefficient multiplicateur (ex. : `x1.3` pour sol sableux, `x0.8` pour sol argileux).

### 1.2. Carnet phytosanitaire numérique et délai de carence (DAR)
* **Problème résolu** : L'usage excessif ou inapproprié de pesticides chimiques présente des risques sanitaires graves. Les agriculteurs oublient souvent le délai d'attente requis entre le traitement et la récolte (Délai Avant Récolte - DAR).
* **Utilité pour l'agriculteur** : Garantir la sécurité alimentaire des consommateurs et éviter le rejet des produits sur les marchés. Un compte à rebours indique visuellement si la parcelle est "apte à la récolte".
* **Pages à créer** : Nouvel onglet/section "Traitements" (`/pages/shared/treatments.html`).
* **Données à stocker** : `traitement_id`, `parcelle_id`, `produit_nom`, `date_application`, `delai_carence_jours`, `statut_recolte_autorisee` (booléen).
* **Intégration** : Lier au calendrier des récoltes pour afficher un voyant rouge/vert sur la fiche de chaque culture.

### 1.3. Calculateur de rentabilité réelle par culture horticole
* **Problème résolu** : Les producteurs mélangent souvent les coûts globaux et ont du mal à savoir si une culture spécifique (ex: oignon vs piment) est réellement bénéficiaire après déduction des semences, engrais, carburant et main-d'œuvre.
* **Utilité pour l'agriculteur** : Identifier les spéculations les plus rentables pour orienter les prochains cycles de plantation.
* **Pages à créer** : Intégration directe dans la page financière existante (`/pages/shared/finances.html`).
* **Données à stocker** : `depense_par_culture` (ventilée par type de culture : Gombo, Tomate, Oignon, Piment, Aubergine).
* **Intégration** : Un graphique circulaire d'analyse de marge nette par kilo produit.

### 1.4. Enregistrement des récoltes et rendements par parcelle
* **Problème résolu** : Perte de visibilité sur l'historique de productivité d'une même portion de terre d'une année sur l'autre.
* **Utilité pour l'agriculteur** : Détecter la fatigue des sols ou l'efficacité d'un amendement organique.
* **Pages à créer** : Fiche d'enregistrement rapide des récoltes (`/pages/shared/harvests.html`).
* **Données à stocker** : `recolte_id`, `parcelle_id`, `culture_type`, `poids_kg`, `qualite` (Choix A, B, C), `date_recolte`.
* **Intégration** : Lier au tableau de bord pour mettre à jour automatiquement le stock disponible pour la vente.

### 1.5. Registre simplifié de la main-d'œuvre temporaire (journaliers)
* **Problème résolu** : Le maraîchage nécessite beaucoup de main-d'œuvre temporaire (repiquage, désherbage, récolte). Le calcul verbal des paies quotidiennes mène souvent à des conflits ou à des oublis de trésorerie.
* **Utilité pour l'agriculteur** : Suivre les engagements de dépenses salariales au jour le jour.
* **Pages à créer** : Sous-section "Main d'œuvre" dans les finances ou dans un onglet dédié.
* **Données à stocker** : `journalier_nom`, `tache_effectuee`, `cout_journalier_fcfa`, `date`, `statut_paiement` (Payé / Dû).
* **Intégration** : Sommation automatique des montants dus dans le calcul du solde de trésorerie global de l'application.

### 1.6. Gestionnaire de stock d'intrants avec seuil d'alerte de réapprovisionnement
* **Problème résolu** : Tomber en rupture de stock d'engrais ou de biopesticide au milieu d'une phase de croissance critique de la culture.
* **Utilité pour l'agriculteur** : Être averti à l'avance pour planifier l'achat des sacs d'engrais (NPK, Urée) ou de semences.
* **Pages à créer** : Page des stocks d'intrants (`/pages/shared/stocks.html`).
* **Données à stocker** : `intrant_nom`, `categorie` (semence, engrais, traitement), `quantite_disponible`, `unite` (kg, sac, litre), `seuil_alerte`.
* **Intégration** : Notification visuelle jaune/rouge sur le tableau de bord principal lorsque la quantité passe sous le seuil d'alerte.

### 1.7. Système d'alertes locales pour événements climatiques extrêmes (Harmattan, etc.)
* **Problème résolu** : Les vents desséchants de l'Harmattan ou les vagues de chaleur extrême brûlent les jeunes pépinières si elles ne sont pas protégées d'un ombrage ou arrosées en urgence.
* **Utilité pour l'agriculteur** : Prendre des mesures préventives (pose de filets d'ombrage, arrosage d'appoint nocturne) pour sauver les plants sensibles.
* **Pages à créer** : Intégration sur la page d'accueil et alertes météo (`/pages/shared/alerts.html`).
* **Données à stocker** : `alerte_id`, `type_evenement`, `seuil_declenchement`, `message_conseil`.
* **Intégration** : Analyser quotidiennement la température et l'humidité de la région sélectionnée par le producteur et afficher une bannière "Alerte Canicule/Harmattan" avec des conseils d'urgence.

### 1.8. Registre des ventes directes sur les marchés locaux (Sandika, Mbour, Kaolack)
* **Problème résolu** : Manque de suivi des canaux de vente. L'agriculteur ne sait pas si son produit se vend mieux au marché de gros de Dakar ou directement aux grossistes (Bana-Bana) au champ.
* **Utilité pour l'agriculteur** : Comparer et choisir le canal de vente le plus rémunérateur.
* **Pages à créer** : Section "Ventes" sous `/pages/shared/finances.html` ou page dédiée.
* **Données à stocker** : `vente_id`, `destination_marche`, `quantite_vendue_kg`, `prix_unitaire_fcfa`, `intermediaire_nom`, `date_vente`.
* **Intégration** : Calcul du prix moyen de vente obtenu par culture sur le mois.

### 1.9. Carnet de suivi des pépinières (Semis et taux de levée)
* **Problème résolu** : Les pépinières de tomates, piments ou oignons ratent parfois en raison d'un mauvais terreau ou de graines périmées. Sans suivi, difficile de planifier la date de repiquage exacte.
* **Utilité pour l'agriculteur** : Connaître la date exacte où les plants seront prêts (généralement 21 à 30 jours) et ajuster le calendrier de préparation des parcelles principales.
* **Pages à créer** : Section "Pépinières" dans `/pages/shared/crops.html`.
* **Données à stocker** : `pepiniere_id`, `culture_type`, `date_semis`, `nombre_alveoles_ou_surface`, `taux_levee_estime` (%), `date_repiquage_prevue`.
* **Intégration** : Générer une alerte automatique à l'approche de la date de repiquage conseillée.

### 1.10. Suivi des dépenses en eau (forage, carburant, électricité)
* **Problème résolu** : L'irrigation représente le premier poste de dépense récurrent en maraîchage au Sénégal (achat de gasoil pour motopompe ou facture Senelec du forage).
* **Utilité pour l'agriculteur** : Connaître le coût réel en eau par mètre cube ou par cycle de culture.
* **Pages à créer** : Sous-section "Dépenses d'eau" dans les finances.
* **Données à stocker** : `depense_eau_id`, `type_source` (carburant, électricité, abonnement), `montant_fcfa`, `date`, `heures_pompage_associees`.
* **Intégration** : Corréler le temps de fonctionnement des pompes avec le coût d'utilisation estimé par heure.

---

## 2. Fonctionnalités Importantes (Priorité 2)
*Améliorent l'efficacité opérationnelle et optimisent la prise de décision.*

### 2.1. Outil d'aide au diagnostic d'anomalies de cultures guidé par questions
* **Problème résolu** : Les maladies fongiques (mildiou, oïdium) ou les attaques de ravageurs (Tuta absoluta) se propagent à une vitesse fulgurante. Un mauvais diagnostic retarde le traitement adéquat.
* **Utilité pour l'agriculteur** : Diagnostiquer rapidement le problème à travers un arbre de décision simple (symptômes visuels sur feuilles, tiges, fruits).
* **Pages à créer** : Page de diagnostic (`/pages/shared/diagnostics.html`).
* **Données à stocker** : Arbre de décision statique (symptômes -> maladies suggérées -> biopesticides conseillés).
* **Intégration** : Lier aux recommandations de traitements écologiques basés sur des plantes locales (neem, piment, savon noir).

### 2.2. Planificateur intelligent de rotation des cultures (anti-nématodes)
* **Problème résolu** : Planter des tomates ou des aubergines au même endroit d'une année sur l'autre favorise la prolifération des nématodes (ravageurs du sol) et appauvrit la terre.
* **Utilité pour l'agriculteur** : Maintenir la fertilité du sol et casser le cycle des maladies en alternant Solanacées (tomate), Légumineuses (haricot, arachide) et Alliacées (oignon).
* **Pages à créer** : Module "Rotation" dans la page des cultures.
* **Données à stocker** : Historique des familles botaniques cultivées sur chaque parcelle.
* **Intégration** : Bloquer ou envoyer un avertissement si l'utilisateur tente d'enregistrer une culture de la même famille sur la même parcelle que le cycle précédent.

### 2.3. Calculateur personnalisé de compostage organique (fumier local)
* **Problème résolu** : L'achat d'engrais chimiques est coûteux et dégrade le sol à long terme. Le compostage de fumier (vache, cheval, volaille) est une alternative économique mais requiert de bons dosages de matières sèches et humides.
* **Utilité pour l'agriculteur** : Réussir son compostage de manière scientifique avec les ressources disponibles à la ferme.
* **Pages à créer** : Calculateur de compost (`/pages/shared/composting.html`).
* **Données à stocker** : Ratios carbone/azote théoriques des résidus d'Afrique de l'Ouest (paille de mil, coques d'arachide, fientes de volailles, feuilles de neem).
* **Intégration** : L'agriculteur entre la quantité de fumier dont il dispose, et l'application lui indique le volume de paille ou d'eau à ajouter.

### 2.4. Simulateur de marge brute intégrant le coût du transport
* **Problème résolu** : Vendre ses produits à Dakar rapporte plus en théorie, mais le coût de location du camion (clando, Ndiaga Ndiaye) ou de l'essence depuis Mbour ou le delta du fleuve peut annuler le bénéfice par rapport à une vente sur un marché local.
* **Utilité pour l'agriculteur** : Calculer instantanément la marge nette réelle selon le lieu de livraison envisagé.
* **Pages à créer** : Intégration sur la page financière actuelle.
* **Données à stocker** : `tarifs_moyens_transport_par_region` (Dakar, Thiès, Saint-Louis, Kaolack).
* **Intégration** : Formulaire interactif comparant : "Prix de vente Dakar - Coût transport" vs "Prix de vente Mbour - Coût transport".

### 2.5. Module de commandes groupées d'intrants entre fermes locales
* **Problème résolu** : Les petits producteurs achètent leurs intrants au détail au prix fort. L'achat groupé permet d'obtenir des tarifs de gros avantageux auprès des distributeurs d'engrais et de semences.
* **Utilité pour l'agriculteur** : S'associer avec les fermes voisines pour faire des économies d'échelle substantielles.
* **Pages à créer** : Espace coopératif de commandes (`/pages/shared/coop.html`).
* **Données à stocker** : `commande_groupee_id`, `produit_demandé`, `quantite_ferme_demandeuse`, `statut_commande`.
* **Intégration** : Liste partagée visible par les comptes rattachés à la même zone agricole géographique.

### 2.6. Carnet de maintenance et de suivi des équipements mécaniques (motopompes)
* **Problème résolu** : Une panne de motopompe non anticipée en pleine période de chaleur peut ruiner une récolte de tomates en 48 heures.
* **Utilité pour l'agriculteur** : Planifier les vidanges, les changements de filtres et suivre l'état général des équipements d'irrigation.
* **Pages à créer** : Page des équipements (`/pages/shared/equipments.html`).
* **Données à stocker** : `equipement_id`, `type_machine`, `date_derniere_maintenance`, `heures_utilisation_estimées`, `frais_reparation`.
* **Intégration** : Notifications d'entretien préventif basées sur le temps d'utilisation enregistré dans le module d'irrigation.

### 2.7. Module simplifié de gestion des micro-crédits et remboursements
* **Problème résolu** : Beaucoup d'agriculteurs souscrivent à des crédits de campagne auprès d'institutions locales (CNCAS, MEC, etc.) ou de proches de la diaspora, mais éprouvent des difficultés à suivre l'échéancier exact des remboursements au milieu des flux de trésorerie quotidiens.
* **Utilité pour l'agriculteur** : Éviter le surendettement et maintenir une bonne réputation financière pour les prochains financements.
* **Pages à créer** : Section "Crédits" dans les finances.
* **Données à stocker** : `credit_id`, `creancier_nom`, `montant_emprunte`, `taux_interet`, `echeance_date`, `somme_remboursee_a_ce_jour`.
* **Intégration** : Affichage d'une jauge d'avancement du remboursement et calcul de l'encours de dette dans le bilan global.

### 2.8. Module d'estimation de la durée de conservation après récolte
* **Problème résolu** : Les pertes post-récolte sont critiques en Afrique de l'Ouest en raison de la chaleur. Conserver des oignons ou des pommes de terre trop longtemps sous abri inadapté provoque le pourrissement.
* **Utilité pour l'agriculteur** : Connaître la date limite optimale de vente pour liquider les stocks avant dépréciation de la qualité.
* **Pages à créer** : Intégration sur la page de gestion des stocks récoltés.
* **Données à stocker** : Durées de conservation théoriques par culture selon la température de la zone.
* **Intégration** : Alerte visuelle orange sur le stock récolté quand il approche de la fin de sa durée de conservation recommandée sans être vendu.

### 2.9. Calculateur d'espacement des cultures et densité de semis optimaux
* **Problème résolu** : Des plants trop serrés s'étouffent mutuellement et favorisent l'humidité stagnante (favorable aux maladies). Trop espacés, ils réduisent la rentabilité au mètre carré.
* **Utilité pour l'agriculteur** : Connaître le nombre exact de semences nécessaires et le quadrillage idéal au sol pour maximiser l'espace de culture de manière saine.
* **Pages à créer** : Assistant de semis dans `/pages/shared/crops.html`.
* **Données à stocker** : Fiches techniques ISRA/ANCAR (densités de semis conseillées pour oignon, piment, tomate).
* **Intégration** : L'agriculteur saisit la surface de sa parcelle (en m² ou en nombre de planches horticoles standards de 10m x 1m), l'applet calcule le nombre de lignes, l'espacement sur la ligne et la quantité de semences requise.

### 2.10. Journal des livraisons et des bons de commande pour les intermédiaires (Bana-Bana)
* **Problème résolu** : Les intermédiaires (bana-banas) achètent souvent à crédit au champ et règlent après revente en ville. L'absence de trace écrite fiable mène régulièrement à des contestations de prix ou de quantités livrées.
* **Utilité pour l'agriculteur** : Sécuriser les transactions informelles avec un reçu numérique clair (quantité, prix unitaire convenu, acompte versé).
* **Pages à créer** : Section "Bons de livraison" dans le module financier.
* **Données à stocker** : `bon_id`, `intermediaire_nom`, `contact_telephone`, `produit`, `quantite_livree`, `montant_convenu`, `acompte`, `statut_reglement` (Payé, Partiel, Non payé).
* **Intégration** : Bouton d'exportation de l'aperçu du bon sous forme de texte optimisé pour envoi direct par WhatsApp (canal privilégié au Sénégal).

---

## 3. Fonctionnalités Avancées (Priorité 3)
*Haute valeur ajoutée technologique pour faire de KA Farm une application de pointe.*

### 3.1. Module d'IA de diagnostic de maladies par analyse d'images
* **Problème résolu** : L'identification visuelle des maladies des feuilles est complexe pour un agriculteur non formé, et l'accès à un ingénieur agronome sur le terrain est rare et coûteux.
* **Utilité pour l'agriculteur** : Prendre une photo de la feuille malade avec son smartphone et obtenir un diagnostic instantané accompagné du protocole de traitement adapté.
* **Pages à créer** : Page d'analyse IA (`/pages/shared/ai-diagnostic.html`).
* **Données à stocker** : Requêtes d'analyse et historique des diagnostics de la ferme pour le suivi temporel des épidémies.
* **Intégration** : Utiliser la caméra native du téléphone, envoyer l'image en base64 à notre serveur d'API Node.js (`server.js`), qui interroge l'API Gemini en mode multimodal pour retourner un diagnostic horticole structuré.

### 3.2. Analyse prédictive des prix des marchés régionaux sénégalais
* **Problème résolu** : Les prix des légumes fluctuent énormément d'une semaine à l'autre selon l'abondance de l'offre (ex : surproduction d'oignon en avril).
* **Utilité pour l'agriculteur** : Anticiper les baisses ou hausses de prix pour décaler légèrement la date de récolte ou choisir une culture de contre-saison plus lucrative.
* **Pages à créer** : Graphiques prédictifs dans les finances.
* **Données à stocker** : Données historiques mensuelles des prix des marchés de gros du Sénégal (SIM/ANCAR).
* **Intégration** : Algorithme d'interpolation de courbes de prix passés pour estimer les tendances saisonnières par région.

### 3.3. Optimisation de l'arrosage par capteurs d'humidité virtuels
* **Problème résolu** : L'installation de sondes d'humidité physiques dans le sol est trop coûteuse pour la majorité des exploitations horticoles familiales.
* **Utilité pour l'agriculteur** : Estimer l'humidité restante du sol de façon logicielle gratuite, sur la base d'un modèle d'évapotranspiration.
* **Pages à créer** : Tableau de bord d'irrigation dynamique avec indicateurs de niveau de réserve en eau du sol.
* **Données à stocker** : Taux d'infiltration théorique du sol et données météo quotidiennes réelles (vent, soleil, température).
* **Intégration** : Simulation logicielle calculant l'apport hydrique réel (irrigation déclarée) moins les pertes climatiques pour afficher une jauge "Humidité estimée du sol".

### 3.4. Cartographie visuelle et interactive de l'exploitation (Bento-Grid des parcelles)
* **Problème résolu** : Gérer plusieurs parcelles à distance est complexe pour l'investisseur basé à Dakar qui ne visualise pas l'occupation des sols au champ.
* **Utilité pour l'agriculteur** : Avoir une vue d'ensemble colorée et claire de la ferme (quelles parcelles sont en pépinière, en production, prêtes à la récolte ou au repos).
* **Pages à créer** : Plan interactif de l'exploitation (`/pages/shared/farm-map.html`).
* **Données à stocker** : Dimensions géométriques des parcelles et statut culturel courant.
* **Intégration** : Interface graphique interactive en blocs (grilles réordonnables ou canevas SVG) reflétant l'état en temps réel des planches de culture.

### 3.5. Bourse locale de partage et de location d'outils agricoles
* **Problème résolu** : Certains outils coûteux (comme les semoirs mécaniques, motoculteurs ou pulvérisateurs thermiques) ne servent que quelques jours par an et dorment le reste du temps, alors que d'autres fermes en ont cruellement besoin.
* **Utilité pour l'agriculteur** : Rentabiliser ses machines en les louant aux fermes voisines ou trouver du matériel disponible à proximité à moindre coût.
* **Pages à créer** : Espace communautaire d'entraide (`/pages/shared/sharing.html`).
* **Données à stocker** : `outil_id`, `outil_nom`, `prix_location_jour_fcfa`, `disponibilite` (booléen), `contact_ferme_proprietaire`.
* **Intégration** : Liste d'annonces classées géographiquement selon la proximité des fermes rattachées.

### 3.6. Générateur automatique de rapports d'exploitation pour demandes de financements
* **Problème résolu** : Présenter un dossier propre et structuré à une banque (La Banque Agricole du Sénégal, etc.) ou à des partenaires de la diaspora est indispensable pour obtenir des financements, mais complexe à rédiger.
* **Utilité pour l'agriculteur** : Télécharger en un clic un document PDF professionnel synthétisant l'historique des récoltes, les revenus réels et les dépenses de la saison.
* **Pages à créer** : Section "Rapports" dans les paramètres ou les finances.
* **Données à stocker** : Configuration des en-têtes (nom de la ferme, logo, coordonnées).
* **Intégration** : Script frontend assemblant les données financières et de production dans un format HTML imprimable propre ou génération de PDF via une bibliothèque légère.

### 3.7. Suivi des pratiques agroécologiques certifiées (Bilan Carbone & Biodiversité)
* **Problème résolu** : Valoriser financièrement les efforts agroécologiques (utilisation de compost, absence de pesticides chimiques, plantation de haies brise-vents) auprès de certains acheteurs écoresponsables.
* **Utilité pour l'agriculteur** : Suivre ses indicateurs écologiques et obtenir un "Score Agro-Éco" valorisant son travail.
* **Pages à créer** : Tableau de bord environnemental (`/pages/shared/eco-score.html`).
* **Données à stocker** : Critères d'évaluation remplis (ex: % d'amendements organiques, usage d'extraits de neem).
* **Intégration** : Un badge dynamique de niveau de durabilité écologique affiché fièrement sur le profil public de l'exploitation.

### 3.8. Mode hors-ligne complet (Offline-First) avec synchronisation automatique
* **Problème résolu** : La connexion internet mobile (Orange, Free, Expresso) est instable voire inexistante sur de nombreuses parcelles reculées en brousse. L'application doit pouvoir fonctionner au champ sans réseau.
* **Utilité pour l'agriculteur** : Enregistrer ses actions (irrigation, dépenses, récolte) directement sur le terrain sans craindre les pertes de connexion.
* **Pages à créer** : Pas de page physique, amélioration de l'architecture globale de persistance de l'application.
* **Données à stocker** : Stockage local persistant dans le navigateur via IndexedDB / LocalStorage.
* **Intégration** : Détection de l'état du réseau (`navigator.onLine`). Si hors-ligne, les données sont stockées localement sous forme de file d'attente d'actions. Dès que la connexion est rétablie, la synchronisation se lance en arrière-plan sans action requise de l'utilisateur.

### 3.9. Messagerie horticole et d'accompagnement connectée aux conseillers ANCAR / ISRA
* **Problème résolu** : L'isolement technique des producteurs. Pouvoir échanger directement avec des experts du conseil agricole public ou privé sénégalais.
* **Utilité pour l'agriculteur** : Envoyer des rapports complets de son exploitation en un clic pour obtenir des conseils hautement personnalisés de la part de conseillers agricoles officiels.
* **Pages à créer** : Messagerie d'assistance technique (`/pages/shared/chat-conseil.html`).
* **Données à stocker** : `message_id`, `emetteur_id`, `destinataire_id`, `contenu_texte`, `piece_jointe_url`.
* **Intégration** : Système de chat sécurisé avec option d'envoi automatique de la fiche d'identité technique de la ferme en pièce jointe pour faire gagner du temps au conseiller.

### 3.10. Parrainage de parcelles par la diaspora (Financement participatif)
* **Problème résolu** : Beaucoup de Sénégalais vivant à l'étranger souhaitent investir directement et de manière sécurisée dans l'agriculture locale mais craignent le manque de transparence ou de suivi des fonds envoyés.
* **Utilité pour l'agriculteur** : Trouver des financements d'amorçage sans passer par des taux d'intérêt bancaires prohibitifs, en échange d'une transparence totale sur l'évolution de la parcelle parrainée.
* **Pages à créer** : Espace Investisseurs / Diaspora (`/pages/shared/invest.html`).
* **Données à stocker** : `parrainage_id`, `investisseur_nom`, `montant_alloue`, `parcelle_associee`, `statut_avancement_cycle`.
* **Intégration** : Lier aux tableaux de suivi d'irrigation et de croissance pour envoyer automatiquement des mises à jour régulières (photos de croissance, dépenses, récoltes) à l'investisseur sur son espace dédié.

---

## 🗄️ Schéma de Données Global Réunifié

Voici le modèle conceptuel de données recommandé pour implémenter ces nouvelles fonctionnalités dans une base de données relationnelle ou un stockage structuré :

```sql
-- Table des fermes (exploitations)
CREATE TABLE fermes (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    localisation VARCHAR(100) NOT NULL, -- Dakar, Mbour, Saint-Louis, etc.
    surface_totale_m2 DECIMAL(10, 2),
    responsable_id INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des parcelles physiques au sein de la ferme
CREATE TABLE parcelles (
    id SERIAL PRIMARY KEY,
    ferme_id INT REFERENCES fermes(id) ON DELETE CASCADE,
    nom_parcelle VARCHAR(50) NOT NULL,
    surface_m2 DECIMAL(10, 2) NOT NULL,
    type_sol VARCHAR(50) DEFAULT 'sableux', -- sableux, argileux, limoneux, etc.
    statut VARCHAR(30) DEFAULT 'libre' -- libre, pépinière, en_production, repos
);

-- Table des pépinières
CREATE TABLE pepinieres (
    id SERIAL PRIMARY KEY,
    parcelle_id INT REFERENCES parcelles(id),
    culture_type VARCHAR(50) NOT NULL,
    date_semis DATE NOT NULL,
    nombre_semis INT,
    taux_levee_estime DECIMAL(5,2),
    date_repiquage_prevue DATE
);

-- Table des récoltes de fin de cycle
CREATE TABLE recoltes (
    id SERIAL PRIMARY KEY,
    parcelle_id INT REFERENCES parcelles(id),
    culture_type VARCHAR(50) NOT NULL,
    poids_kg DECIMAL(10, 2) NOT NULL,
    qualite VARCHAR(20) DEFAULT 'Choix A',
    date_recolte DATE DEFAULT CURRENT_DATE
);

-- Table du carnet phytosanitaire (traitements de protection des plantes)
CREATE TABLE traitements_phytosanitaires (
    id SERIAL PRIMARY KEY,
    parcelle_id INT REFERENCES parcelles(id),
    produit_nom VARCHAR(100) NOT NULL,
    date_application DATE DEFAULT CURRENT_DATE,
    delai_carence_jours INT DEFAULT 7, -- DAR
    dose_appliquee_g_m2 DECIMAL(8, 2),
    cible_ravageur VARCHAR(100)
);

-- Table de gestion des stocks de fournitures
CREATE TABLE stocks_intrants (
    id SERIAL PRIMARY KEY,
    ferme_id INT REFERENCES fermes(id),
    intrant_nom VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL, -- semence, engrais, traitement
    quantite_disponible DECIMAL(10, 2) NOT NULL,
    unite_mesure VARCHAR(20) DEFAULT 'kg', -- kg, litre, sac, sachet
    seuil_alerte DECIMAL(10, 2) NOT NULL
);

-- Table du registre financier des livraisons (bana-banas)
CREATE TABLE bons_livraison_ventes (
    id SERIAL PRIMARY KEY,
    ferme_id INT REFERENCES fermes(id),
    destinataire_nom VARCHAR(100) NOT NULL,
    destinataire_telephone VARCHAR(30),
    produit VARCHAR(50) NOT NULL,
    quantite_kg DECIMAL(10, 2) NOT NULL,
    prix_unitaire_fcfa DECIMAL(10, 2) NOT NULL,
    acompte_verse_fcfa DECIMAL(10, 2) DEFAULT 0,
    statut_reglement VARCHAR(30) DEFAULT 'Non payé', -- Payé, Partiel, Non payé
    date_vente DATE DEFAULT CURRENT_DATE
);
```

---

## 🛠️ Guide d'Intégration Technique

Pour déployer ces fonctionnalités sans casser l'existant :
1. **Étape 1 : Persistance locale via `localStorage`** : implémenter les structures JSON pour les nouveaux formulaires (pépinières, traitements) directement sur les pages d'administration.
2. **Étape 2 : API REST Backend** dans `server.js` pour centraliser les requêtes d'envoi vers un système de base de données durable (tel que Firestore ou PostgreSQL).
3. **Étape 3 : Routage Frontend** : Mettre à jour `/js/router.js` pour déclarer les nouvelles routes et injecter dynamiquement les interfaces utilisateurs horticoles.
4. **Étape 4 : Tests de non-régression** : Lancer le compilateur d'application pour s'assurer de la parfaite cohésion et fluidité des scripts JS modulaires.
