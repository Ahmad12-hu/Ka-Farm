// KA Farm - Diagnostic des Cultures Module
import { KAStorage } from '../storage.js';

let diagnostics = [];
let diagnosticHistory = [];
let currentDiagnostic = null;

// Severity color and style mapping
const SEVERITY_COLORS = {
  'Faible': { color: '#10b981', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: 'check-circle' },
  'Moyenne': { color: '#fbbf24', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: 'alert-circle' },
  'Élevée': { color: '#f59e0b', badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: 'alert-triangle' },
  'Critique': { color: '#ef4444', badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: 'x-circle' }
};

// Disease database - Common diseases and pests in Senegal
const DISEASE_LIBRARY = [
  // Tomate diseases
  {
    id: 'D-001',
    name: 'Mineuse de la Tomate (Tuta Absoluta)',
    cropTypes: ['Tomate', 'Piment', 'Poivron'],
    affectedParts: ['feuilles', 'fruits'],
    symptoms: [
      "Galeries ou tunnels dans les feuilles",
      "Feuilles qui s'enroulent",
      "Taches blanches sur les feuilles",
      "Fruits avec des trous",
      "Présence de chenilles vert clair"
    ],
    description: "La mineuse de la tomate (Tuta absoluta) est un papillon dont les chenilles creusent des galeries dans les feuilles et les fruits. Très destructrice, elle peut causer jusqu'à 100% de pertes si non contrôlée.",
    severity: 'Critique',
    frequency: 'Élevée',
    prevention: [
      "Installer des pièges à phéromones",
      "Utiliser des filets anti-insectes",
      "Rotation des cultures avec des non-solonacées",
      "Élimination et destruction des résidus de culture"
    ],
    organicTreatments: [
      {
        name: 'Purin de Neem',
        dosage: '10-15 ml/L d\'eau',
        frequency: 'Toutes les semaines en prévention',
        dar: 3
      },
      {
        name: 'Bacillus thuringiensis (Bt)',
        dosage: '1-2 g/L d\'eau',
        frequency: 'Traitement curatif à la détection',
        dar: 1
      },
      {
        name: 'Savon noir bio',
        dosage: '20-30 g/L d\'eau',
        frequency: '2-3 fois par semaine',
        dar: 1
      }
    ],
    chemicalTreatments: [
      {
        name: 'Décis',
        dosage: '0.5-1 ml/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 7
      },
      {
        name: 'Coragen',
        dosage: '0.2-0.4 ml/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 3
      }
    ],
    notes: "Traiter tôt le matin ou en soirée. Respecter strictement le DAR (Délai Avant Récolte)."
  },
  {
    id: 'D-002',
    name: 'Mildiou',
    cropTypes: ['Tomate', 'Oignon', 'Pomme de terre', 'Chou'],
    affectedParts: ['feuilles'],
    symptoms: [
      "Taches jaunes sur les feuilles",
      "Taches brunes avec bordure diffuse",
      "Feuilles qui jaunissent et se dessèchent",
      "Croissance arrêtée",
      "Aspect de brûlé sur les feuilles"
    ],
    description: "Maladie fongique causée par Phytophthora infestans. Se développe rapidement par temps humide et chaud. Peut détruire une culture en quelques jours.",
    severity: 'Critique',
    frequency: 'Élevée',
    prevention: [
      "Éviter l'irrigation par aspersion sur les feuilles",
      "Espacer suffisamment les plants pour une bonne aération",
      "Rotation des cultures",
      "Utiliser des variétés résistantes"
    ],
    organicTreatments: [
      {
        name: 'Bouillie bordelaise',
        dosage: '10-20 g/L d\'eau',
        frequency: 'Préventif tous les 10-15 jours',
        dar: 14
      },
      {
        name: 'Décoction d\'ail',
        dosage: '100 g d\'ail/10 L d\'eau',
        frequency: 'Préventif hebdomadaire',
        dar: 1
      }
    ],
    chemicalTreatments: [
      {
        name: 'Ridomil Gold',
        dosage: '2-3 g/L d\'eau',
        frequency: 'Préventif ou curatif',
        dar: 14
      },
      {
        name: 'Curzate',
        dosage: '2-3 g/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 7
      }
    ],
    notes: "Traiter préventivement par temps humide. Enlever et brûler les feuilles infectées."
  },
  {
    id: 'D-003',
    name: 'Oïdium',
    cropTypes: ['Chou', 'Tomate', 'Oignon', 'Poivron'],
    affectedParts: ['feuilles'],
    symptoms: [
      "Feutrage blanc sur la face supérieure des feuilles",
      "Feuilles qui jaunissent et se dessèchent",
      "Croissance ralentie",
      "Taches poudreuses blanches"
    ],
    description: "Maladie fongique causée par Erysiphe spp. ou Leveillula taurica. Se développe par temps chaud et sec. Affecte principalement les feuilles.",
    severity: 'Moyenne',
    frequency: 'Élevée',
    prevention: [
      "Éviter l'irrigation tardive",
      "Maintenir une bonne aération des cultures",
      "Élimination des mauvaises herbes",
      "Rotation des cultures"
    ],
    organicTreatments: [
      {
        name: 'Soufre en poudre',
        dosage: '2-3 g/L d\'eau ou 20-30 kg/ha en poudre',
        frequency: 'Préventif tous les 7-10 jours',
        dar: 3
      },
      {
        name: 'Bicarbonate de soude',
        dosage: '5-10 g/L d\'eau + savon noir",
        frequency: 'Préventif hebdomadaire',
        dar: 1
      }
    ],
    chemicalTreatments: [
      {
        name: 'Topas',
        dosage: '0.5-1 ml/L d\'eau',
        frequency: 'Préventif ou curatif',
        dar: 7
      },
      {
        name: 'Amistar',
        dosage: '1-2 ml/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 3
      }
    ],
    notes: "Traiter préventivement dès les premiers signes. L'oïdium peut réapparaître rapidement."
  },
  {
    id: 'D-004',
    name: 'Pucerons',
    cropTypes: ['Tomate', 'Oignon', 'Piment', 'Poivron', 'Chou', 'Aubergine', 'Laitue'],
    affectedParts: ['feuilles', 'tiges', 'fleurs'],
    symptoms: [
      "Feuilles qui s'enroulent",
      "Croissance déformée",
      "Présence de petits insectes verts ou noirs",
      "Miellat (substance collante) sur les feuilles",
      "Fumagine (noircissement) sur les feuilles",
      "Feuilles jaunes"
    ],
    description: "Insectes suceurs qui se nourrissent de la sève des plantes. Affaiblissent la plante et peuvent transmettre des virus. Se reproduisent très rapidement.",
    severity: 'Élevée',
    frequency: 'Très Élevée',
    prevention: [
      "Installer des pièges englués jaunes",
      "Introduire des coccinelles (prédateurs naturels)",
      "Éviter les excès d\'azote",
      "Irriguer au pied pour éviter de mouiller les feuilles"
    ],
    organicTreatments: [
      {
        name: 'Savon noir bio',
        dosage: '20-30 g/L d\'eau',
        frequency: '2-3 fois par semaine',
        dar: 1
      },
      {
        name: 'Purin de neem',
        dosage: '10-15 ml/L d\'eau',
        frequency: 'Préventif hebdomadaire',
        dar: 3
      },
      {
        name: 'Décoction de piment',
        dosage: '50-100 g de piment/10 L d\'eau',
        frequency: 'Traitement curatif',
        dar: 1
      }
    ],
    chemicalTreatments: [
      {
        name: 'Pyrèthre naturel',
        dosage: '1-2 ml/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 1
      },
      {
        name: 'Imidaclopride',
        dosage: '0.3-0.5 ml/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 7
      }
    ],
    notes: "Traiter le soir pour éviter de tuer les insectes pollinisateurs."
  },
  {
    id: 'D-005',
    name: 'Aleurodes (Mouches blanches)',
    cropTypes: ['Tomate', 'Piment', 'Poivron', 'Chou', 'Aubergine'],
    affectedParts: ['feuilles'],
    symptoms: [
      "Petits insectes blancs qui volent",
      "Feuilles qui jaunissent",
      "Présence de miellat sur les feuilles",
      "Fumagine (noircissement)",
      "Feuilles collantes"
    ],
    description: "Petits insectes blancs suceurs de sève. Proviennent souvent des serres ou des cultures sous abri. Peuvent transmettre des virus.",
    severity: 'Élevée',
    frequency: 'Élevée',
    prevention: [
      "Installer des pièges englués jaunes",
      "Utiliser des filets anti-insectes",
      "Associer avec des plantes répulsives (basilic, menthe)",
      "Maintenir une bonne aération"
    ],
    organicTreatments: [
      {
        name: 'Pyrèthre naturel',
        dosage: '1-2 ml/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 1
      },
      {
        name: 'Savon noir bio',
        dosage: '20-30 g/L d\'eau',
        frequency: '2 fois par semaine',
        dar: 1
      }
    ],
    chemicalTreatments: [
      {
        name: 'Confidor',
        dosage: '0.3-0.5 g/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 7
      }
    ],
    notes: "Traiter le soir. Les aleurodes se cachent sous les feuilles."
  },
  {
    id: 'D-006',
    name: 'Pourriture apicale (Blossom End Rot)',
    cropTypes: ['Tomate', 'Piment', 'Poivron'],
    affectedParts: ['fruits'],
    symptoms: [
      "Taches brunes et nécrotiques à l\'extrémité des fruits",
      "Fruits qui pourrissent avant maturité",
      "Taches noires et enfoncées à la base du fruit"
    ],
    description: "Trouble physiologique causé par une carence en calcium ou des fluctuations de l\'humidité du sol. Très courant dans les cultures de tomate.",
    severity: 'Moyenne',
    frequency: 'Élevée',
    prevention: [
      "Maintenir une irrigation régulière et uniforme",
      "Apporter du calcium (gypse agricole, coquilles d\'œufs broyées)",
      "Éviter les excès d\'azote et de potassium",
      "Utiliser des variétés résistantes"
    ],
    organicTreatments: [
      {
        name: 'Application foliaire de lactate de calcium',
        dosage: '5-10 g/L d\'eau',
        frequency: 'Préventif toutes les 2 semaines',
        dar: 0
      },
      {
        name: 'Coquilles d\'œufs broyées',
        dosage: '100-200 g/plant au pied',
        frequency: 'Au moment de la plantation',
        dar: 0
      }
    ],
    chemicalTreatments: [
      {
        name: 'Wuxal Calcium',
        dosage: '2-3 ml/L d\'eau',
        frequency: 'Application foliaire préventive',
        dar: 1
      }
    ],
    notes: "Problème souvent confondu avec une maladie fongique. C\'est un trouble physiologique, pas une maladie contagieuse."
  },
  {
    id: 'D-007',
    name: 'Fusariose',
    cropTypes: ['Tomate', 'Oignon', 'Pomme de terre'],
    affectedParts: ['racines', 'tiges', 'feuilles'],
    symptoms: [
      "Flétrissement soudain des plants",
      "Jaunissement des feuilles",
      "Pourriture à la base de la tige",
      "Vaisseaux bruns dans la tige (visible en coupant)",
      "Plants qui meurent par foyers"
    ],
    description: "Maladie fongique du sol causée par Fusarium spp. Très difficile à contrôler une fois établie. Peut survivre dans le sol pendant plusieurs années.",
    severity: 'Critique',
    frequency: 'Moyenne',
    prevention: [
      "Rotation des cultures sur au moins 3-4 ans",
      "Utiliser des variétés résistantes",
      "Désinfection du sol (solaire ou à la vapeur)",
      "Éviter le sur-arrosage"
    ],
    organicTreatments: [
      {
        name: 'Solarisation du sol',
        dosage: 'Couvrir le sol de plastique transparent pendant 4-6 semaines',
        frequency: 'Avant plantation',
        dar: 0
      },
      {
        name: 'Compost bien décomposé',
        dosage: '5-10 tonnes/ha',
        frequency: 'Avant plantation',
        dar: 0
      }
    ],
    chemicalTreatments: [
      {
        name: 'Fongicides du sol',
        dosage: 'Suivre les recommandations du fabricant',
        frequency: 'Traitement préventif du sol',
        dar: 0
      }
    ],
    notes: "Une fois installée, la fusariose est très difficile à éradiquer. La prévention est la clé."
  },
  {
    id: 'D-008',
    name: 'Anthracnose',
    cropTypes: ['Tomate', 'Piment', 'Poivron', 'Oignon'],
    affectedParts: ['fruits', 'feuilles'],
    symptoms: [
      "Taches circulaires noires et enfoncées sur les fruits",
      "Taches brunes à centre clair sur les feuilles",
      "Pourriture des fruits mûrs",
      "Taches qui s\'agrandissent par temps humide"
    ],
    description: "Maladie fongique causée par Colletotrichum spp. Affecte particulièrement les fruits mûrs. Se développe par temps chaud et humide.",
    severity: 'Élevée',
    frequency: 'Moyenne',
    prevention: [
      "Éviter de mouiller les feuilles lors de l\'irrigation",
      "Récolter les fruits dès qu\'ils sont mûrs",
      "Élimination des fruits infectés",
      "Rotation des cultures"
    ],
    organicTreatments: [
      {
        name: 'Bouillie bordelaise',
        dosage: '10-20 g/L d\'eau',
        frequency: 'Préventif tous les 10-15 jours',
        dar: 14
      },
      {
        name: 'Décoction d\'ail',
        dosage: '100 g/10 L d\'eau',
        frequency: 'Préventif hebdomadaire',
        dar: 1
      }
    ],
    chemicalTreatments: [
      {
        name: 'Topsin',
        dosage: '1-2 g/L d\'eau',
        frequency: 'Préventif ou curatif',
        dar: 7
      },
      {
        name: 'Cabrio Top',
        dosage: '2-3 g/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 3
      }
    ],
    notes: "Récolter tôt le matin quand les fruits sont secs pour éviter la propagation."
  },
  {
    id: 'D-009',
    name: 'Taches bactériennes',
    cropTypes: ['Tomate', 'Piment', 'Poivron'],
    affectedParts: ['feuilles', 'fruits'],
    symptoms: [
      "Petites taches rondes jaunes ou brunes sur les feuilles",
      "Taches avec un halo jaune",
      "Taches qui percent les feuilles",
      "Taches sur les fruits",
      "Feuilles qui jaunissent et tombent prématurément"
    ],
    description: "Maladie bactérienne causée par Xanthomonas spp. ou Pseudomonas spp. Se propage rapidement par temps humide et par l\'eau d\'irrigation.",
    severity: 'Élevée',
    frequency: 'Élevée',
    prevention: [
      "Utiliser des semences certifiées et saines",
      "Éviter l\'irrigation par aspersion",
      "Désinfecter les outils de taille",
      "Rotation des cultures",
      "Élimination des plants infectés"
    ],
    organicTreatments: [
      {
        name: 'Bouillie bordelaise',
        dosage: '10-20 g/L d\'eau',
        frequency: 'Préventif tous les 10 jours',
        dar: 14
      },
      {
        name: 'Extrait de propolis',
        dosage: '5-10 ml/L d\'eau',
        frequency: 'Traitement curatif',
        dar: 1
      }
    ],
    chemicalTreatments: [
      {
        name: 'Kocide',
        dosage: '2-3 g/L d\'eau',
        frequency: 'Traitement préventif ou curatif',
        dar: 7
      }
    ],
    notes: "Les traitements bactéricides sont peu efficaces une fois la maladie bien installée. La prévention est essentielle."
  },
  {
    id: 'D-010',
    name: 'Virus de la flétrissure bactérienne',
    cropTypes: ['Tomate', 'Piment', 'Poivron'],
    affectedParts: ['feuilles', 'tiges', 'plante_entiere'],
    symptoms: [
      "Flétrissement soudain des plants",
      "Feuilles qui s\'enroulent et se dessèchent",
      "Vaisseaux bruns dans la tige",
      "Plants qui meurent rapidement",
      "Croissance arrêtée"
    ],
    description: "Maladie bactérienne très destructrice causée par Ralstonia solanacearum. Peut tuer des plants en quelques jours. Se propage par l\'eau, le sol et les outils.",
    severity: 'Critique',
    frequency: 'Moyenne',
    prevention: [
      "Utiliser des semences et plants certifiés",
      "Rotation des cultures sur au moins 3 ans",
      "Désinfection du sol et des outils",
      "Éviter le sur-arrosage",
      "Contrôle des adventices"
    ],
    organicTreatments: [
      {
        name: 'Solarisation du sol',
        dosage: 'Couvrir de plastique transparent pendant 4-6 semaines',
        frequency: 'Avant plantation',
        dar: 0
      },
      {
        name: 'Compost bien décomposé',
        dosage: '5-10 tonnes/ha',
        frequency: 'Avant plantation',
        dar: 0
      }
    ],
    chemicalTreatments: [],
    notes: "Aucun traitement curatif efficace. Les plants infectés doivent être arrachés et brûlés immédiatement."
  }
];

// Symptoms database organized by crop and affected part
const SYMPTOMS_DATABASE = {
  'Tomate': {
    feuilles: [
      "Taches jaunes",
      "Taches brunes",
      "Feuilles qui s'enroulent",
      "Galeries ou tunnels",
      "Feutrage blanc",
      "Feuilles collantes (miellat)",
      "Feuilles déformées"
    ],
    tiges: [
      "Tiges noircies",
      "Tiges molles ou flétries",
      "Vaisseaux bruns (en coupant)",
      "Croissance arrêtée"
    ],
    fruits: [
      "Taches noires sur les fruits",
      "Fruits déformés",
      "Pourriture apicale (fond noir)",
      "Trous dans les fruits",
      "Fruits qui pourrissent"
    ],
    racines: [
      "Racines noircies ou pourries",
      "Plants qui tombent facilement"
    ],
    fleurs: [
      "Fleurs qui tombent",
      "Pas de fruits",
      "Déformation des fleurs"
    ],
    'plante_entiere': [
      "Flétrissement soudain",
      "Plante qui meurt",
      "Croissance ralentie"
    ]
  },
  'Oignon': {
    feuilles: [
      "Taches jaunes ou brunes",
      "Feuilles qui jaunissent et sèchent",
      "Feutrage blanc",
      "Feuilles collantes"
    ],
    tiges: [
      "Tiges molles",
      "Tiges noircies"
    ],
    fruits: [
      "Bulbes pourris",
      "Bulbes déformés"
    ],
    racines: [
      "Racines pourries",
      "Bulbes qui pourrissent"
    ],
    fleurs: [],
    'plante_entiere': [
      "Flétrissement",
      "Croissance arrêtée"
    ]
  },
  'Piment': {
    feuilles: [
      "Taches jaunes ou brunes",
      "Feuilles qui s'enroulent",
      "Galeries dans les feuilles",
      "Feutrage blanc",
      "Feuilles collantes"
    ],
    tiges: [
      "Tiges molles",
      "Vaisseaux bruns"
    ],
    fruits: [
      "Taches noires sur les fruits",
      "Fruits déformés",
      "Trous dans les fruits"
    ],
    racines: [],
    fleurs: [
      "Fleurs qui tombent"
    ],
    'plante_entiere': [
      "Flétrissement",
      "Plante qui meurt"
    ]
  },
  'Chou': {
    feuilles: [
      "Taches jaunes ou brunes",
      "Feutrage blanc",
      "Feuilles qui s'enroulent",
      "Taches circulaires"
    ],
    tiges: [
      "Tiges molles"
    ],
    fruits: [],
    racines: [],
    fleurs: [],
    'plante_entiere': [
      "Croissance ralentie"
    ]
  }
};

// Mapping from symptoms to disease probability
const SYMPTOM_TO_DISEASE = {
  'Tomate': {
    feuilles: {
      "Galeries ou tunnels": { 'Mineuse de la Tomate (Tuta Absoluta)': 0.9, 'Aleurodes (Mouches blanches)': 0.1 },
      "Feuilles qui s'enroulent": { 'Mineuse de la Tomate (Tuta Absoluta)': 0.7, 'Pucerons': 0.6, 'Virus de la flétrissure bactérienne': 0.3 },
      "Taches jaunes": { 'Mildiou': 0.8, 'Taches bactériennes': 0.7, 'Anthracnose': 0.4 },
      "Taches brunes": { 'Mildiou': 0.9, 'Anthracnose': 0.6, 'Taches bactériennes': 0.5 },
      "Feutrage blanc": { 'Oïdium': 0.95 },
      "Feuilles collantes (miellat)": { 'Pucerons': 0.9, 'Aleurodes (Mouches blanches)': 0.8 },
      "Feuilles déformées": { 'Pucerons': 0.8, 'Virus de la flétrissure bactérienne': 0.6 }
    },
    fruits: {
      "Taches noires sur les fruits": { 'Anthracnose': 0.9, 'Taches bactériennes': 0.5 },
      "Pourriture apicale (fond noir)": { 'Pourriture apicale (Blossom End Rot)': 0.95 },
      "Trous dans les fruits": { 'Mineuse de la Tomate (Tuta Absoluta)': 0.9 },
      "Fruits qui pourrissent": { 'Anthracnose': 0.7, 'Fusariose': 0.3 }
    },
    tiges: {
      "Vaisseaux bruns (en coupant)": { 'Fusariose': 0.9, 'Virus de la flétrissure bactérienne': 0.8 },
      "Tiges molles ou flétries": { 'Fusariose': 0.8, 'Virus de la flétrissure bactérienne': 0.7 }
    },
    'plante_entiere': {
      "Flétrissement soudain": { 'Fusariose': 0.9, 'Virus de la flétrissure bactérienne': 0.8 },
      "Plante qui meurt": { 'Fusariose': 0.8, 'Virus de la flétrissure bactérienne': 0.7 }
    }
  },
  'Oignon': {
    feuilles: {
      "Taches jaunes ou brunes": { 'Mildiou': 0.8 },
      "Feuilles qui jaunissent et sèchent": { 'Mildiou': 0.9 },
      "Feutrage blanc": { 'Oïdium': 0.95 }
    }
  }
};

export const DiagnosticsModule = {
  init() {
    diagnostics = KAStorage.getDiagnostics() || [];
    diagnosticHistory = KAStorage.getDiagnosticHistory() || [];
    
    this.render();
    this.setupListeners();
    this.loadDiseaseLibrary();
  },

  loadDiseaseLibrary() {
    // Disease library is already defined as a constant
    // We can add custom diseases from storage if needed
  },

  render() {
    this.renderStats();
    this.renderDiseaseLibrary();
    this.renderHistory();
  },

  renderStats() {
    const total = diagnostics.length;
    const critical = diagnostics.filter(d => d.severity === 'Critique').length;
    const high = diagnostics.filter(d => d.severity === 'Élevée').length;
    const resolved = diagnostics.filter(d => d.status === 'Résolu').length;
    const pending = diagnostics.filter(d => d.status === 'En cours').length;
    
    const elTotal = document.getElementById('stat-total-diagnostics');
    const elCritical = document.getElementById('stat-critical-diseases');
    const elHigh = document.getElementById('stat-high-diseases');
    const elResolved = document.getElementById('stat-resolved');
    const elPending = document.getElementById('stat-pending');
    
    if (elTotal) elTotal.textContent = total;
    if (elCritical) elCritical.textContent = critical;
    if (elHigh) elHigh.textContent = high;
    if (elResolved) elResolved.textContent = resolved;
    if (elPending) elPending.textContent = pending;
  },

  renderDiseaseLibrary() {
    const tableBody = document.getElementById('disease-library-table-body');
    if (!tableBody) return;
    
    const cropFilter = document.getElementById('disease-filter-crop')?.value || '';
    const searchQuery = document.getElementById('disease-search')?.value?.toLowerCase() || '';
    
    let filteredDiseases = DISEASE_LIBRARY;
    
    if (cropFilter) {
      filteredDiseases = filteredDiseases.filter(d => 
        d.cropTypes.includes(cropFilter)
      );
    }
    
    if (searchQuery) {
      filteredDiseases = filteredDiseases.filter(d => 
        d.name.toLowerCase().includes(searchQuery) ||
        d.description.toLowerCase().includes(searchQuery) ||
        d.cropTypes.some(c => c.toLowerCase().includes(searchQuery))
      );
    }
    
    if (filteredDiseases.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-slate-400">
            <p class="text-xs font-bold">Aucune maladie trouvée.</p>
            <p class="text-[10px] mt-1">Essayez de modifier vos critères de recherche.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tableBody.innerHTML = filteredDiseases.map(disease => {
      const severityInfo = SEVERITY_COLORS[disease.severity] || SEVERITY_COLORS['Moyenne'];
      const frequencyColor = disease.frequency === 'Très Élevée' ? 'rose' : 
                           disease.frequency === 'Élevée' ? 'amber' : 
                           disease.frequency === 'Moyenne' ? 'blue' : 'slate';
      
      return `
        <tr 
          class="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0D2615]/25 transition-all border-b border-slate-100 dark:border-[#143E23]/20"
          onclick="window.showDiseaseDetail('${disease.id}')"
        >
          <td class="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">${disease.name}</td>
          <td class="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">${disease.cropTypes.join(', ')}</td>
          <td class="px-4 py-3.5 text-center">
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${severityInfo.badge}">
              ${disease.severity}
            </span>
          </td>
          <td class="px-4 py-3.5 text-center">
            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-${frequencyColor}-500/10 text-${frequencyColor}-500 border-${frequencyColor}-500/20">
              ${disease.frequency}
            </span>
          </td>
          <td class="px-4 py-3.5 text-center">
            <button onclick="event.stopPropagation(); window.showDiseaseDetail('${disease.id}')" class="p-1.5 bg-slate-100 dark:bg-[#0D2615]/50 border border-slate-200 dark:border-[#143E23]/40 rounded text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer" title="Voir les détails">
              <i data-lucide="eye" class="h-3.5 w-3.5"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderHistory() {
    const historyList = document.getElementById('diagnostic-history-list');
    if (!historyList) return;
    
    // Sort by date (most recent first)
    const sorted = [...diagnostics].sort((a, b) => 
      new Date(b.diagnosisDate) - new Date(a.diagnosisDate)
    );
    
    if (sorted.length === 0) {
      historyList.innerHTML = '<p class="text-[11px] text-slate-400 text-center py-4">Aucun diagnostic dans l\'historique</p>';
      return;
    }
    
    historyList.innerHTML = sorted.slice(0, 10).map(diag => {
      const disease = DISEASE_LIBRARY.find(d => d.name === diag.diseaseName);
      const severityInfo = SEVERITY_COLORS[diag.severity] || SEVERITY_COLORS['Moyenne'];
      
      return `
        <div class="p-3 bg-slate-50 dark:bg-[#061109]/30 rounded-xl border border-slate-200 dark:border-[#143E23]/20 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#0D2615]/20 transition-all" onclick="window.showDiagnosticDetail('${diag.id}')">
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-2">
              <div class="p-1.5 rounded-lg bg-${SEVERITY_COLORS[diag.severity]?.color.replace('#', '')}/10">
                <i data-lucide="${SEVERITY_COLORS[diag.severity]?.icon || 'alert-triangle'}" class="h-4 w-4 text-${SEVERITY_COLORS[diag.severity]?.color.replace('#', '')}"></i>
              </div>
              <div>
                <p class="text-sm font-black text-slate-800 dark:text-white">${diag.diseaseName || 'Diagnostic'}</p>
                <p class="text-[10px] text-[#819888]">${diag.cropType} | ${diag.affectedPart} | ${new Date(diag.diagnosisDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            ${diag.status === 'Résolu' ? '<span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Résolu</span>' : '<span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border-amber-500/20">En cours</span>'}
          </div>
        </div>
      `;
    }).join('');
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  startNewDiagnostic() {
    // Reset wizard
    currentDiagnostic = {
      id: `DIAG-${Date.now()}`,
      diagnosisDate: new Date().toISOString(),
      cropType: '',
      affectedPart: '',
      symptoms: [],
      diseaseName: '',
      confidence: 0,
      severity: '',
      treatmentRecommendations: [],
      notes: '',
      status: 'En cours',
      enterprise_id: 'ka_farm'
    };
    
    // Reset wizard UI
    this.resetWizard();
    
    // Show step 1
    document.getElementById('wizard-crop').value = '';
    document.getElementById('wizard-affected-part').value = '';
    document.getElementById('symptoms-list').innerHTML = '';
    document.getElementById('diagnostic-results').innerHTML = '';
    
    this.showStep(1);
    document.getElementById('wizard-status').textContent = 'Étape 1/4';
  },

  resetWizard() {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
      const stepContainer = document.getElementById(`step-${i}-container`);
      if (stepContainer) stepContainer.classList.add('hidden');
      
      const stepCircle = document.getElementById(`step-${i}`);
      if (stepCircle) {
        stepCircle.className = 'step-pending step-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold';
      }
    }
  },

  showStep(stepNumber) {
    this.resetWizard();
    
    const stepContainer = document.getElementById(`step-${stepNumber}-container`);
    if (stepContainer) stepContainer.classList.remove('hidden');
    
    // Update step indicators
    for (let i = 1; i <= stepNumber; i++) {
      const stepCircle = document.getElementById(`step-${i}`);
      if (stepCircle) {
        stepCircle.className = i < stepNumber ? 'step-completed step-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold' : 
                                  'step-active step-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold';
      }
    }
    
    document.getElementById('wizard-status').textContent = `Étape ${stepNumber}/4`;
  },

  nextWizardStep(currentStep) {
    const crop = document.getElementById('wizard-crop').value;
    const affectedPart = document.getElementById('wizard-affected-part').value;
    
    // Validate current step
    if (currentStep === 1 && !crop) {
      alert('Veuillez sélectionner une culture.');
      return;
    }
    
    if (currentStep === 2 && !affectedPart) {
      alert('Veuillez sélectionner la partie atteinte de la plante.');
      return;
    }
    
    if (currentStep === 3) {
      // Get selected symptoms
      const selectedSymptoms = [];
      const checkboxes = document.querySelectorAll('#symptoms-list input[type="checkbox"]:checked');
      checkboxes.forEach(cb => {
        selectedSymptoms.push(cb.value);
      });
      
      if (selectedSymptoms.length === 0) {
        alert('Veuillez sélectionner au moins un symptôme.');
        return;
      }
      
      // Save symptoms
      currentDiagnostic.symptoms = selectedSymptoms;
      
      // Perform diagnosis
      this.performDiagnosis();
    }
    
    // Save current step data
    if (currentStep === 1) {
      currentDiagnostic.cropType = crop;
    } else if (currentStep === 2) {
      currentDiagnostic.affectedPart = affectedPart;
      // Load symptoms for this crop and part
      this.loadSymptoms(crop, affectedPart);
    }
    
    // Show next step
    this.showStep(currentStep + 1);
  },

  prevWizardStep(currentStep) {
    if (currentStep > 1) {
      this.showStep(currentStep - 1);
    }
  },

  loadSymptoms(crop, affectedPart) {
    const symptomsList = document.getElementById('symptoms-list');
    if (!symptomsList) return;
    
    const symptoms = SYMPTOMS_DATABASE[crop]?.[affectedPart] || [];
    
    if (symptoms.length === 0) {
      symptomsList.innerHTML = '<p class="text-sm text-slate-500">Aucun symptôme enregistré pour cette combinaison.</p>';
      return;
    }
    
    symptomsList.innerHTML = symptoms.map(symptom => `
      <label class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#0D2615]/50 rounded-xl border border-slate-200 dark:border-[#143E23]/30 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all cursor-pointer">
        <input type="checkbox" value="${symptom}" class="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500">
        <span class="text-sm text-slate-700 dark:text-slate-300">${symptom}</span>
      </label>
    `).join('');
  },

  selectAffectedPart(part) {
    document.getElementById('wizard-affected-part').value = part;
    
    // Highlight selected button
    const buttons = document.querySelectorAll('#step-2-container button');
    buttons.forEach(btn => {
      btn.classList.remove('bg-emerald-500/10', 'border-emerald-500/30');
      btn.classList.add('bg-slate-50', 'dark:bg-[#0D2615]/50', 'border-slate-200', 'dark:border-[#143E23]/40');
    });
    
    const selectedBtn = Array.from(buttons).find(btn => 
      btn.getAttribute('onclick')?.includes(`'${part}'`)
    );
    
    if (selectedBtn) {
      selectedBtn.classList.remove('bg-slate-50', 'dark:bg-[#0D2615]/50', 'border-slate-200', 'dark:border-[#143E23]/40');
      selectedBtn.classList.add('bg-emerald-500/10', 'border-emerald-500/30');
    }
  },

  performDiagnosis() {
    const resultsContainer = document.getElementById('diagnostic-results');
    if (!resultsContainer) return;
    
    const crop = currentDiagnostic.cropType;
    const part = currentDiagnostic.affectedPart;
    const symptoms = currentDiagnostic.symptoms;
    
    // Get disease probabilities
    const symptomMapping = SYMPTOM_TO_DISEASE[crop]?.[part];
    if (!symptomMapping) {
      resultsContainer.innerHTML = `
        <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p class="text-sm text-slate-700 dark:text-slate-300">
            Désolé, aucune maladie correspondante trouvée dans notre base de données pour cette culture et cette partie de plante avec les symptômes sélectionnés.
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Essayez de sélectionner des symptômes différents ou consultez la bibliothèque des maladies.
          </p>
        </div>
      `;
      return;
    }
    
    // Calculate probabilities
    const diseaseScores = {};
    symptoms.forEach(symptom => {
      const diseaseProbs = symptomMapping[symptom];
      if (diseaseProbs) {
        Object.entries(diseaseProbs).forEach(([disease, prob]) => {
          diseaseScores[disease] = (diseaseScores[disease] || 0) + prob;
        });
      }
    });
    
    // Convert to percentages
    const total = Object.values(diseaseScores).reduce((sum, score) => sum + score, 0);
    const diseaseResults = Object.entries(diseaseScores).map(([disease, score]) => ({
      disease,
      score: score / total * 100
    })).sort((a, b) => b.score - a.score);
    
    // Get disease details
    const resultsHTML = diseaseResults.map(result => {
      const disease = DISEASE_LIBRARY.find(d => d.name === result.disease);
      if (!disease) return '';
      
      currentDiagnostic.diseaseName = disease.name;
      currentDiagnostic.confidence = Math.round(result.score);
      currentDiagnostic.severity = disease.severity;
      
      const severityInfo = SEVERITY_COLORS[disease.severity] || SEVERITY_COLORS['Moyenne'];
      
      return `
        <div class="p-4 bg-white dark:bg-[#061109]/40 rounded-xl border border-${SEVERITY_COLORS[disease.severity]?.color.replace('#', '')}/20 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-lg bg-${SEVERITY_COLORS[disease.severity]?.color.replace('#', '')}/10">
              <i data-lucide="${SEVERITY_COLORS[disease.severity]?.icon || 'alert-triangle'}" class="h-5 w-5 text-${SEVERITY_COLORS[disease.severity]?.color.replace('#', '')}"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-black text-slate-800 dark:text-white">${disease.name}</p>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-full bg-slate-200 dark:bg-[#143E23]/40 rounded-full h-2">
                  <div class="bg-${SEVERITY_COLORS[disease.severity]?.color.replace('#', '')} h-2 rounded-full" style="width: ${Math.round(result.score)}%"></div>
                </div>
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400">${Math.round(result.score)}%</span>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-slate-400">Sévérité:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300"> ${disease.severity}</span>
            </div>
            <div>
              <span class="text-slate-400">Fréquence:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300"> ${disease.frequency}</span>
            </div>
            <div>
              <span class="text-slate-400">Cultures:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300"> ${disease.cropTypes.join(', ')}</span>
            </div>
            <div>
              <span class="text-slate-400">Partie atteinte:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300"> ${disease.affectedParts.join(', ')}</span>
            </div>
          </div>
          
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-3">${disease.description}</p>
          
          <button onclick="window.showDiseaseDetail('${disease.id}')" class="mt-3 w-full py-2 bg-emerald-500/10 dark:bg-emerald-950/20 hover:bg-emerald-500/20 dark:hover:bg-emerald-950/30 border border-emerald-500/20 text-emerald-500 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1">
            <i data-lucide="book-open" class="h-3 w-3"></i>
            Voir la fiche complète et les traitements
          </button>
        </div>
      `;
    }).join('');
    
    resultsContainer.innerHTML = resultsHTML;
    
    // Set treatment recommendations
    if (diseaseResults.length > 0) {
      const topDisease = DISEASE_LIBRARY.find(d => d.name === diseaseResults[0].disease);
      if (topDisease) {
        currentDiagnostic.treatmentRecommendations = [
          ...topDisease.organicTreatments,
          ...topDisease.chemicalTreatments
        ];
      }
    }
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  saveDiagnostic() {
    // Set final data
    currentDiagnostic.status = 'En cours';
    currentDiagnostic.updatedAt = new Date().toISOString();
    
    // Add to diagnostics
    diagnostics.push(currentDiagnostic);
    KAStorage.setDiagnostics(diagnostics);
    
    // Also add to history
    diagnosticHistory.push(currentDiagnostic);
    KAStorage.setDiagnosticHistory(diagnosticHistory);
    
    this.render();
    this.resetWizard();
    
    alert(`Diagnostic enregistré avec succès ! Maladie suspectée : ${currentDiagnostic.diseaseName} (${currentDiagnostic.confidence}% de confiance)`);
    
    currentDiagnostic = null;
  },

  quickDiagnose(diseaseName) {
    const disease = DISEASE_LIBRARY.find(d => d.name === diseaseName);
    if (!disease) return;
    
    currentDiagnostic = {
      id: `DIAG-${Date.now()}`,
      diagnosisDate: new Date().toISOString(),
      cropType: disease.cropTypes[0],
      affectedPart: disease.affectedParts[0],
      symptoms: disease.symptoms.slice(0, 3), // First 3 symptoms
      diseaseName: disease.name,
      confidence: 90,
      severity: disease.severity,
      treatmentRecommendations: [
        ...disease.organicTreatments,
        ...disease.chemicalTreatments
      ],
      notes: '',
      status: 'En cours',
      enterprise_id: 'ka_farm'
    };
    
    // Show results
    this.performDiagnosis();
    this.showStep(4);
    document.getElementById('wizard-crop').value = disease.cropTypes[0];
    document.getElementById('wizard-affected-part').value = disease.affectedParts[0];
  },

  showDiseaseDetail(diseaseId) {
    const disease = DISEASE_LIBRARY.find(d => d.id === diseaseId);
    if (!disease) return;
    
    const severityInfo = SEVERITY_COLORS[disease.severity] || SEVERITY_COLORS['Moyenne'];
    
    const content = document.getElementById('disease-detail-content');
    if (content) {
      content.innerHTML = `
        <div class="space-y-4">
          <div class="p-4 bg-blue-500/5 dark:bg-blue-950/5 rounded-2xl border border-blue-500/20">
            <p class="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <i data-lucide="book-open" class="h-3 w-3"></i> ${disease.name}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ${disease.cropTypes.join(' • ')} | Sévérité : <strong class="text-${SEVERITY_COLORS[disease.severity]?.color.replace('#', '')}">${disease.severity}</strong>
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-slate-400">ID:</span>
                <span class="text-slate-700 dark:text-slate-300 font-mono">${disease.id}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Cultures affectées:</span>
                <span class="text-slate-700 dark:text-slate-300">${disease.cropTypes.join(', ')}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Parties atteintes:</span>
                <span class="text-slate-700 dark:text-slate-300">${disease.affectedParts.join(', ')}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Fréquence:</span>
                <span class="text-slate-700 dark:text-slate-300">${disease.frequency}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-slate-400">Sévérité:</span>
                <span class="text-slate-700 dark:text-slate-300">${disease.severity}</span>
              </div>
            </div>
          </div>
          
          <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description:</p>
            <p class="text-sm text-slate-700 dark:text-slate-300">${disease.description}</p>
          </div>
          
          <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <i data-lucide="shield" class="h-3 w-3"></i> Mesures de prévention
            </p>
            <ul class="text-sm text-slate-700 dark:text-slate-300 mt-2 space-y-1">
              ${disease.prevention.map((p, i) => `<li key="p-${i}">${i + 1}. ${p}</li>`).join('')}
            </ul>
          </div>
          
          ${disease.organicTreatments.length > 0 ? `
            <div class="p-3 bg-emerald-500/5 dark:bg-emerald-950/5 rounded-xl border border-emerald-500/20">
              <p class="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i data-lucide="leaf" class="h-3 w-3"></i> Traitements Biologiques
              </p>
              <div class="space-y-2">
                ${disease.organicTreatments.map(treatment => `
                  <div class="p-2 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-lg border border-emerald-500/20">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="text-sm font-bold text-slate-800 dark:text-white">${treatment.name}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400">Dosage: ${treatment.dosage}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400">Fréquence: ${treatment.frequency}</p>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500">DAR: ${treatment.dar} jours</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${disease.chemicalTreatments.length > 0 ? `
            <div class="p-3 bg-amber-500/5 dark:bg-amber-950/5 rounded-xl border border-amber-500/20">
              <p class="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i data-lucide="flask-conical" class="h-3 w-3"></i> Traitements Chimiques
              </p>
              <p class="text-[10px] text-slate-400 mb-2">À utiliser en dernier recours, en respectant les doses et le DAR</p>
              <div class="space-y-2">
                ${disease.chemicalTreatments.map(treatment => `
                  <div class="p-2 bg-amber-500/5 dark:bg-amber-950/10 rounded-lg border border-amber-500/20">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="text-sm font-bold text-slate-800 dark:text-white">${treatment.name}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400">Dosage: ${treatment.dosage}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400">Fréquence: ${treatment.frequency}</p>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500">DAR: ${treatment.dar} jours</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${disease.notes ? `
            <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i data-lucide="info" class="h-3 w-3"></i> Remarques
              </p>
              <p class="text-sm text-slate-700 dark:text-slate-300">${disease.notes}</p>
            </div>
          ` : ''}
          
          <div class="flex justify-end gap-2 pt-2">
            <button onclick="window.closeDiseaseDetailModal()" class="px-4 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#143E23] border border-slate-200 dark:border-[#143E23] text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer">
              Fermer
            </button>
          </div>
        </div>
      `;
    }
    
    const modal = document.getElementById('disease-detail-modal');
    if (modal) modal.classList.remove('hidden');
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  showDiagnosticDetail(diagId) {
    const diagnostic = diagnostics.find(d => d.id === diagId);
    if (!diagnostic) return;
    
    const disease = DISEASE_LIBRARY.find(d => d.name === diagnostic.diseaseName);
    const severityInfo = SEVERITY_COLORS[diagnostic.severity] || SEVERITY_COLORS['Moyenne'];
    
    const content = document.getElementById('diagnostic-detail-content');
    if (content) {
      content.innerHTML = `
        <div class="space-y-4">
          <div class="p-4 bg-emerald-500/5 dark:bg-emerald-950/5 rounded-2xl border border-emerald-500/20">
            <p class="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <i data-lucide="file-text" class="h-3 w-3"></i> Diagnostic #${diagnostic.id}
            </p>
            <h3 class="text-xl font-black text-slate-800 dark:text-white mt-2">
              ${diagnostic.diseaseName || 'Diagnostic'}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Confiance: <strong class="text-emerald-500">${diagnostic.confidence || 0}%</strong> | 
              Sévérité: <strong class="text-${SEVERITY_COLORS[diagnostic.severity]?.color.replace('#', '')}">${diagnostic.severity}</strong>
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-slate-400">Date:</span>
                <span class="text-slate-700 dark:text-slate-300 font-mono">${new Date(diagnostic.diagnosisDate).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Culture:</span>
                <span class="text-slate-700 dark:text-slate-300">${diagnostic.cropType || 'Non spécifiée'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Partie atteinte:</span>
                <span class="text-slate-700 dark:text-slate-300">${diagnostic.affectedPart || 'Non spécifiée'}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-slate-400">Statut:</span>
                <span class="text-slate-700 dark:text-slate-300">${diagnostic.status || 'En cours'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Symptômes:</span>
                <span class="text-slate-700 dark:text-slate-300">${diagnostic.symptoms?.length || 0}</span>
              </div>
            </div>
          </div>
          
          ${diagnostic.symptoms && diagnostic.symptoms.length > 0 ? `
            <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i data-lucide="list" class="h-3 w-3"></i> Symptômes observés
              </p>
              <ul class="text-sm text-slate-700 dark:text-slate-300 mt-2 space-y-1">
                ${diagnostic.symptoms.map((s, i) => `<li key="s-${i}">• ${s}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${disease ? `
            <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i data-lucide="book-open" class="h-3 w-3"></i> Description de la maladie
              </p>
              <p class="text-sm text-slate-700 dark:text-slate-300">${disease.description}</p>
            </div>
          ` : ''}
          
          ${disease && disease.prevention && disease.prevention.length > 0 ? `
            <div class="p-3 bg-emerald-500/5 dark:bg-emerald-950/5 rounded-xl border border-emerald-500/20">
              <p class="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i data-lucide="shield" class="h-3 w-3"></i> Mesures de prévention
              </p>
              <ul class="text-sm text-slate-700 dark:text-slate-300 mt-2 space-y-1">
                ${disease.prevention.map((p, i) => `<li key="p-${i}">${i + 1}. ${p}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${disease && (disease.organicTreatments.length > 0 || disease.chemicalTreatments.length > 0) ? `
            <div class="p-3 bg-amber-500/5 dark:bg-amber-950/5 rounded-xl border border-amber-500/20">
              <p class="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i data-lucide="flask-conical" class="h-3 w-3"></i> Traitements recommandés
              </p>
              
              ${disease.organicTreatments.length > 0 ? `
                <div class="mb-3">
                  <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Traitements Biologiques:</p>
                  <div class="space-y-2">
                    ${disease.organicTreatments.map(treatment => `
                      <div class="p-2 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-lg border border-emerald-500/20">
                        <p class="text-sm font-bold text-slate-800 dark:text-white">${treatment.name}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400">Dosage: ${treatment.dosage} | Fréquence: ${treatment.frequency} | DAR: ${treatment.dar} jours</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              ${disease.chemicalTreatments.length > 0 ? `
                <div>
                  <p class="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Traitements Chimiques (dernier recours):</p>
                  <div class="space-y-2">
                    ${disease.chemicalTreatments.map(treatment => `
                      <div class="p-2 bg-amber-500/5 dark:bg-amber-950/10 rounded-lg border border-amber-500/20">
                        <p class="text-sm font-bold text-slate-800 dark:text-white">${treatment.name}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400">Dosage: ${treatment.dosage} | Fréquence: ${treatment.frequency} | DAR: ${treatment.dar} jours</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${diagnostic.notes ? `
            <div class="p-3 bg-slate-50 dark:bg-[#0D2615]/20 rounded-xl border border-slate-200 dark:border-[#143E23]/20">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Remarques:</p>
              <p class="text-sm text-slate-700 dark:text-slate-300">${diagnostic.notes}</p>
            </div>
          ` : ''}
          
          <div class="flex justify-end gap-2 pt-2">
            ${diagnostic.status === 'En cours' ? `
              <button onclick="window.markDiagnosticResolved('${diagnostic.id}')" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
                <i data-lucide="check-circle" class="h-3.5 w-3.5"></i> Marquer comme résolu
              </button>
            ` : ''}
            <button onclick="window.closeDiagnosticDetailModal(); window.deleteDiagnostic('${diagnostic.id}')" class="px-4 py-2 bg-rose-100 dark:bg-rose-950/20 hover:bg-rose-200 dark:hover:bg-rose-950/30 border border-rose-500/20 text-rose-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1">
              <i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Supprimer
            </button>
            <button onclick="window.closeDiagnosticDetailModal()" class="px-4 py-2 bg-slate-100 dark:bg-[#0D2615] hover:bg-slate-200 dark:hover:bg-[#143E23] border border-slate-200 dark:border-[#143E23] text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer">
              Fermer
            </button>
          </div>
        </div>
      `;
    }
    
    const modal = document.getElementById('diagnostic-detail-modal');
    if (modal) modal.classList.remove('hidden');
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  closeDiagnosticDetailModal() {
    const modal = document.getElementById('diagnostic-detail-modal');
    if (modal) modal.classList.add('hidden');
  },

  closeDiseaseDetailModal() {
    const modal = document.getElementById('disease-detail-modal');
    if (modal) modal.classList.add('hidden');
  },

  markDiagnosticResolved(diagId) {
    const diagnostic = diagnostics.find(d => d.id === diagId);
    if (!diagnostic) return;
    
    diagnostic.status = 'Résolu';
    diagnostic.resolvedDate = new Date().toISOString();
    
    KAStorage.setDiagnostics(diagnostics);
    KAStorage.setDiagnosticHistory(diagnosticHistory);
    
    this.render();
    this.closeDiagnosticDetailModal();
    
    alert(`Diagnostic #${diagId} marqué comme résolu.`);
  },

  deleteDiagnostic(diagId) {
    const diagnostic = diagnostics.find(d => d.id === diagId);
    if (!diagnostic) return;
    
    const deleteModal = document.getElementById('delete-diagnostic-confirm-modal');
    const confirmBtn = document.getElementById('confirm-diagnostic-delete-btn');
    
    if (deleteModal && confirmBtn) {
      confirmBtn.onclick = () => {
        diagnostics = diagnostics.filter(d => d.id !== diagId);
        diagnosticHistory = diagnosticHistory.filter(d => d.id !== diagId);
        KAStorage.setDiagnostics(diagnostics);
        KAStorage.setDiagnosticHistory(diagnosticHistory);
        this.render();
        this.closeDiagnosticDeleteModal();
        alert(`Diagnostic #${diagId} supprimé avec succès.`);
      };
      
      deleteModal.classList.remove('hidden');
    }
  },

  closeDiagnosticDeleteModal() {
    const modal = document.getElementById('delete-diagnostic-confirm-modal');
    if (modal) modal.classList.add('hidden');
    const confirmBtn = document.getElementById('confirm-diagnostic-delete-btn');
    if (confirmBtn) confirmBtn.onclick = null;
  },

  setupListeners() {
    // Search in disease library
    const searchInput = document.getElementById('disease-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderDiseaseLibrary();
      });
    }
    
    // Filter by crop
    const cropFilter = document.getElementById('disease-filter-crop');
    if (cropFilter) {
      cropFilter.addEventListener('change', () => {
        this.renderDiseaseLibrary();
      });
    }
  }
};

// Window functions for modal management
window.startNewDiagnostic = () => {
  DiagnosticsModule.startNewDiagnostic();
};

window.nextWizardStep = (currentStep) => {
  DiagnosticsModule.nextWizardStep(currentStep);
};

window.prevWizardStep = (currentStep) => {
  DiagnosticsModule.prevWizardStep(currentStep);
};

window.selectAffectedPart = (part) => {
  DiagnosticsModule.selectAffectedPart(part);
};

window.quickDiagnose = (diseaseName) => {
  DiagnosticsModule.quickDiagnose(diseaseName);
};

window.saveDiagnostic = () => {
  DiagnosticsModule.saveDiagnostic();
};

window.showDiagnosticDetail = (id) => {
  DiagnosticsModule.showDiagnosticDetail(id);
};

window.closeDiagnosticDetailModal = () => {
  DiagnosticsModule.closeDiagnosticDetailModal();
};

window.showDiseaseDetail = (id) => {
  DiagnosticsModule.showDiseaseDetail(id);
};

window.closeDiseaseDetailModal = () => {
  DiagnosticsModule.closeDiseaseDetailModal();
};

window.markDiagnosticResolved = (id) => {
  DiagnosticsModule.markDiagnosticResolved(id);
};

window.deleteDiagnostic = (id) => {
  DiagnosticsModule.deleteDiagnostic(id);
};

window.closeDiagnosticDeleteModal = () => {
  DiagnosticsModule.closeDiagnosticDeleteModal();
};

// Start module when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    DiagnosticsModule.init();
  });
} else {
  DiagnosticsModule.init();
}

// Live update listener
document.addEventListener('ka_data_updated', () => {
  diagnostics = KAStorage.getDiagnostics() || [];
  diagnosticHistory = KAStorage.getDiagnosticHistory() || [];
  DiagnosticsModule.render();
});
