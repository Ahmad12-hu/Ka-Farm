// KA Farm - Crops Storage Domain
// Manages crops, nurseries, rotation, and compost data

import { KAStorage } from "./core.js";

// Default Crops Data
const DEFAULT_CROPS = [
  {
    id: "C-101",
    name: "Tomate Mongal F1",
    field: "Parcelle Nord - Planche 2",
    sowingDate: "2026-05-10",
    harvestDate: "2026-08-15",
    status: "Floraison",
    waterStatus: "Optimale",
    fertilizerStatus: "OK",
    photos: [],
  },
  {
    id: "C-102",
    name: "Oignon Rouge de Galmi",
    field: "Parcelle Est - Grand Champ",
    sowingDate: "2026-04-15",
    harvestDate: "2026-09-01",
    status: "Croissance",
    waterStatus: "Besoin d'eau",
    fertilizerStatus: "OK",
    photos: [],
  },
  {
    id: "C-103",
    name: "Menthe de Thiès",
    field: "Zone Ombragée - Bac A",
    sowingDate: "2026-06-01",
    harvestDate: "2026-07-15",
    status: "Récoltable",
    waterStatus: "Optimale",
    fertilizerStatus: "OK",
    photos: [],
  },
  {
    id: "C-104",
    name: "Chou Cabus",
    field: "Parcelle Sud - Planche 1",
    sowingDate: "2026-05-20",
    harvestDate: "2026-08-25",
    status: "Croissance",
    waterStatus: "Optimale",
    fertilizerStatus: "Besoin d'azote",
    photos: [],
  },
];

const DEFAULT_NURSERIES = [
  {
    id: "PEP-201",
    name: "Pépinière Tomates Mongal",
    cropType: "Tomate",
    sowingDate: "2026-06-01",
    plannedTransplantDate: "2026-07-01",
    quantityEst: 1500,
    status: "Levée",
    healthStatus: "Excellent",
  },
  {
    id: "PEP-202",
    name: "Pépinière Poivron Yolo Wonder",
    cropType: "Poivron",
    sowingDate: "2026-06-10",
    plannedTransplantDate: "2026-07-15",
    quantityEst: 800,
    status: "Semis",
    healthStatus: "Excellent",
  },
];

const DEFAULT_HARVESTS = [];

// Crop Library Data for DAR (Diagnostic Advisory Rec)
const CROP_LIBRARY_DATA = [
  {
    id: "CL-001",
    cropName: "Tomate Mongal F1",
    family: "Solanacées",
    commonDiseases: ["Mildiou", "Tuta Absoluta", "Fusarium", "Septoriose"],
    symptoms: {
      Mildiou: "Taches jaunes sur le dessus des feuilles, moisissure blanche en dessous",
      "Tuta Absoluta": "Tunnels dans les feuilles, excréments noirs, fruits perforés",
    },
    treatments: {
      Mildiou: "Purin de neem préventif, bicarbonate de potassium, huile de neem",
      "Tuta Absoluta": "Pièges à phéromones, Bacillus thuringiensis, rotation culturale",
    },
    prevention: [
      "Rotation de 3 ans",
      "Variétés résistantes",
      "Espacement suffisant",
      "Arrosage au goutte-à-goutte",
    ],
  },
  {
    id: "CL-002",
    cropName: "Oignon Rouge de Galmi",
    family: "Amaryllidacées",
    commonDiseases: ["Mildiou", "Pourriture blanche", "Rouille"],
    symptoms: {
      Mildiou: "Taches brunes sur les feuilles avec halo jaune",
      "Pourriture blanche": "Pourriture molle à la base des bulbes",
    },
    treatments: {
      Mildiou: "Extrait de neem, fongicide biologique à base de cuivre",
      "Pourriture blanche": "Améliorer le drainage, rotation, traitements préventifs",
    },
    prevention: [
      "Bon drainage",
      "Rotation de 2 ans",
      "Éviter l'excès d'humidité",
      "Stockage en zone sèche",
    ],
  },
  {
    id: "CL-003",
    cropName: "Chou Cabus",
    family: "Brassicacées",
    commonDiseases: ["Hernie des crucifères", "Mildiou", "Alternariose"],
    symptoms: {
      Hernie: "Gonflement des racines, jaunissement des feuilles",
      Mildiou: "Taches jaunes sur les feuilles avec moisissure grise",
    },
    treatments: {
      Hernie: "Aucun traitement curatif, brûler les plantes atteintes",
      Mildiou: "Fongicide biologique, pursin de neem",
    },
    prevention: [
      "Rotation de 3 ans minimum",
      "Variétés résistantes",
      "pH du sol 6.5-7.5",
      "Éviter l'excès d'azote",
    ],
  },
];

// Plant Families (Rotation des cultures)
const DEFAULT_PLANT_FAMILIES = [
  {
    id: "FAM-001",
    name: "Solanacées",
    description:
      "Famille des tomates, pommes de terre, aubergines, poivrons et piments. Vulnérables aux nématodes, mildiou et verticilliose.",
    min_rotation_years: 3,
    compatible_families: ["Fabacées", "Graminées", "Liliacées", "Chénopodiacées"],
    incompatible_families: ["Solanacées"],
    notes:
      "Éviter de replanter des solanacées au même endroit avant 3 ans minimum pour prévenir les maladies du sol.",
  },
  {
    id: "FAM-002",
    name: "Fabacées (Légumineuses)",
    description:
      "Famille des haricots, pois, lentilles, arachides. Fixateurs d'azote qui améliorent la fertilité du sol.",
    min_rotation_years: 2,
    compatible_families: ["Solanacées", "Graminées", "Brassicacées", "Apiacées"],
    incompatible_families: ["Fabacées"],
    notes:
      "Excellentes pour enrichir le sol en azote. Peut être semées avant ou après la plupart des cultures.",
  },
  {
    id: "FAM-003",
    name: "Brassicacées (Crucifères)",
    description:
      "Famille des choux, radis, navets, roquette, moutarde. Sensibles à la hernie et aux altises.",
    min_rotation_years: 3,
    compatible_families: ["Fabacées", "Solanacées", "Apiacées", "Amaryllidacées"],
    incompatible_families: ["Brassicacées"],
    notes:
      "Ne pas planter deux années de suite au même endroit. Bénéficient des engrais riches en azote.",
  },
  {
    id: "FAM-004",
    name: "Amaryllidacées (Liliacées)",
    description:
      "Famille des oignons, ail, échalotes, poireaux. Cultures racines sensibles aux nématodes.",
    min_rotation_years: 2,
    compatible_families: ["Fabacées", "Solanacées", "Brassicacées"],
    incompatible_families: ["Amaryllidacées"],
    notes: "Rotation avec des légumineuses recommandée pour réduire les nématodes dans le sol.",
  },
  {
    id: "FAM-005",
    name: "Cucurbitacées",
    description:
      "Famille des courges, concombres, melons, pastèques. Gourmandes en eau et en nutriments.",
    min_rotation_years: 2,
    compatible_families: ["Fabacées", "Graminées", "Solanacées"],
    incompatible_families: ["Cucurbitacées"],
    notes: "Besoins élevés en matière organique. Éviter la succession avec d'autres cucurbitacées.",
  },
  {
    id: "FAM-006",
    name: "Apiacées (Ombellifères)",
    description: "Famille des carottes, céleri, persil, fenouil. Cultures racines à cycle long.",
    min_rotation_years: 2,
    compatible_families: ["Fabacées", "Brassicacées", "Solanacées"],
    incompatible_families: ["Apiacées"],
    notes: "Sensibles aux mouches de la carotte. Rotation avec légumineuses bénéfique.",
  },
  {
    id: "FAM-007",
    name: "Asteracées",
    description:
      "Famille des laitues, artichauts, topinambours, tournesols. Certains sont comestibles, d'autres ornementaux.",
    min_rotation_years: 2,
    compatible_families: ["Fabacées", "Solanacées", "Apiacées"],
    incompatible_families: ["Asteracées"],
    notes:
      "Les laitues ont des besoins en eau élevés et bénéficiant de la rotation avec des légumineuses.",
  },
  {
    id: "FAM-008",
    name: "Graminées (Poacées)",
    description: "Famille du maïs, sorgho, mil, riz, blé. Céréales et fourrages.",
    min_rotation_years: 1,
    compatible_families: ["Fabacées", "Solanacées", "Brassicacées"],
    incompatible_families: ["Graminées"],
    notes: "Épuisent rapidement les réserves du sol. Rotation avec légumineuses essentielle.",
  },
  {
    id: "FAM-009",
    name: "Lamiacées (Labiées)",
    description:
      "Famille des menthes, basilic, thym, romarin, lavande. Plantes aromatiques et médicinales.",
    min_rotation_years: 1,
    compatible_families: ["Fabacées", "Solanacées", "Brassicacées", "Amaryllidacées"],
    incompatible_families: ["Lamiacées"],
    notes: "Peuvent être cultivées plusieurs années au même endroit si le sol est bien amendé.",
  },
  {
    id: "FAM-010",
    name: "Chénopodiacées",
    description:
      "Famille des épinards, betteraves, blettes. Riches en nutriments et peu exigeantes.",
    min_rotation_years: 2,
    compatible_families: ["Fabacées", "Solanacées", "Brassicacées"],
    incompatible_families: ["Chénopodiacées"],
    notes: "Sensibles à la montaison en graine par temps chaud. Rotation régulière recommandée.",
  },
];

const DEFAULT_CROP_FAMILIES = [
  { id: "CF-001", crop_name: "Tomate Mongal F1", family_id: "FAM-001", family_name: "Solanacées" },
  { id: "CF-002", crop_name: "Tomate", family_id: "FAM-001", family_name: "Solanacées" },
  { id: "CF-003", crop_name: "Pomme de terre", family_id: "FAM-001", family_name: "Solanacées" },
  { id: "CF-004", crop_name: "Aubergine", family_id: "FAM-001", family_name: "Solanacées" },
  { id: "CF-005", crop_name: "Poivron", family_id: "FAM-001", family_name: "Solanacées" },
  { id: "CF-006", crop_name: "Piment", family_id: "FAM-001", family_name: "Solanacées" },
  { id: "CF-007", crop_name: "Piment Oiseau", family_id: "FAM-001", family_name: "Solanacées" },
  { id: "CF-008", crop_name: "Haricot vert", family_id: "FAM-002", family_name: "Fabacées" },
  { id: "CF-009", crop_name: "Haricot", family_id: "FAM-002", family_name: "Fabacées" },
  { id: "CF-010", crop_name: "Arachide", family_id: "FAM-002", family_name: "Fabacées" },
  { id: "CF-011", crop_name: "Pois", family_id: "FAM-002", family_name: "Fabacées" },
  { id: "CF-012", crop_name: "Lentille", family_id: "FAM-002", family_name: "Fabacées" },
  { id: "CF-013", crop_name: "Chou", family_id: "FAM-003", family_name: "Brassicacées" },
  { id: "CF-014", crop_name: "Chou Cabus", family_id: "FAM-003", family_name: "Brassicacées" },
  { id: "CF-015", crop_name: "Chou-fleur", family_id: "FAM-003", family_name: "Brassicacées" },
  { id: "CF-016", crop_name: "Brocoli", family_id: "FAM-003", family_name: "Brassicacées" },
  { id: "CF-017", crop_name: "Radis", family_id: "FAM-003", family_name: "Brassicacées" },
  { id: "CF-018", crop_name: "Navet", family_id: "FAM-003", family_name: "Brassicacées" },
  { id: "CF-019", crop_name: "Oignon", family_id: "FAM-004", family_name: "Amaryllidacées" },
  {
    id: "CF-020",
    crop_name: "Oignon Rouge de Galmi",
    family_id: "FAM-004",
    family_name: "Amaryllidacées",
  },
  {
    id: "CF-021",
    crop_name: "Oignon Rouge de Gandiol",
    family_id: "FAM-004",
    family_name: "Amaryllidacées",
  },
  { id: "CF-022", crop_name: "Ail", family_id: "FAM-004", family_name: "Amaryllidacées" },
  { id: "CF-023", crop_name: "Échalote", family_id: "FAM-004", family_name: "Amaryllidacées" },
  { id: "CF-024", crop_name: "Poireau", family_id: "FAM-004", family_name: "Amaryllidacées" },
  { id: "CF-025", crop_name: "Concombre", family_id: "FAM-005", family_name: "Cucurbitacées" },
  { id: "CF-026", crop_name: "Courgette", family_id: "FAM-005", family_name: "Cucurbitacées" },
  { id: "CF-027", crop_name: "Melon", family_id: "FAM-005", family_name: "Cucurbitacées" },
  { id: "CF-028", crop_name: "Pastèque", family_id: "FAM-005", family_name: "Cucurbitacées" },
  { id: "CF-029", crop_name: "Citrouille", family_id: "FAM-005", family_name: "Cucurbitacées" },
  { id: "CF-030", crop_name: "Carotte", family_id: "FAM-006", family_name: "Apiacées" },
  { id: "CF-031", crop_name: "Céleri", family_id: "FAM-006", family_name: "Apiacées" },
  { id: "CF-032", crop_name: "Persil", family_id: "FAM-006", family_name: "Apiacées" },
  { id: "CF-033", crop_name: "Fenouil", family_id: "FAM-006", family_name: "Apiacées" },
  { id: "CF-034", crop_name: "Laitue", family_id: "FAM-007", family_name: "Asteracées" },
  { id: "CF-035", crop_name: "Laitue de saison", family_id: "FAM-007", family_name: "Asteracées" },
  { id: "CF-036", crop_name: "Artichaut", family_id: "FAM-007", family_name: "Asteracées" },
  { id: "CF-037", crop_name: "Topinambour", family_id: "FAM-007", family_name: "Asteracées" },
  { id: "CF-038", crop_name: "Maïs", family_id: "FAM-008", family_name: "Graminées" },
  { id: "CF-039", crop_name: "Sorgho", family_id: "FAM-008", family_name: "Graminées" },
  { id: "CF-040", crop_name: "Mil", family_id: "FAM-008", family_name: "Graminées" },
  { id: "CF-041", crop_name: "Riz", family_id: "FAM-008", family_name: "Graminées" },
  { id: "CF-042", crop_name: "Blé", family_id: "FAM-008", family_name: "Graminées" },
  { id: "CF-043", crop_name: "Menthe", family_id: "FAM-009", family_name: "Lamiacées" },
  { id: "CF-044", crop_name: "Menthe de Thiès", family_id: "FAM-009", family_name: "Lamiacées" },
  { id: "CF-045", crop_name: "Basilic", family_id: "FAM-009", family_name: "Lamiacées" },
  { id: "CF-046", crop_name: "Thym", family_id: "FAM-009", family_name: "Lamiacées" },
  { id: "CF-047", crop_name: "Romarin", family_id: "FAM-009", family_name: "Lamiacées" },
  { id: "CF-048", crop_name: "Épinard", family_id: "FAM-010", family_name: "Chénopodiacées" },
  { id: "CF-049", crop_name: "Betterave", family_id: "FAM-010", family_name: "Chénopodiacées" },
  { id: "CF-050", crop_name: "Blette", family_id: "FAM-010", family_name: "Chénopodiacées" },
  { id: "CF-051", crop_name: "Gombo", family_id: "FAM-011", family_name: "Malvacées" },
];

const DEFAULT_ROTATION_HISTORY = [
  {
    id: "RH-001",
    parcel_id: "P-001",
    crop_id: "C-101",
    crop_name: "Tomate Mongal F1",
    family_id: "FAM-001",
    family_name: "Solanacées",
    start_date: "2025-06-01",
    end_date: "2025-09-15",
    cycle_number: 1,
    warning_issued: false,
    notes: "Première rotation sur cette parcelle. Tomates cultivées avec succès.",
  },
  {
    id: "RH-002",
    parcel_id: "P-001",
    crop_id: "C-104",
    crop_name: "Chou Cabus",
    family_id: "FAM-003",
    family_name: "Brassicacées",
    start_date: "2025-09-20",
    end_date: "2025-12-25",
    cycle_number: 2,
    warning_issued: false,
    notes: "Rotation réussie après tomates. Brassicacées compatibles avec Solanacées.",
  },
  {
    id: "RH-003",
    parcel_id: "P-002",
    crop_id: "C-102",
    crop_name: "Oignon Rouge de Galmi",
    family_id: "FAM-004",
    family_name: "Amaryllidacées",
    start_date: "2025-04-15",
    end_date: "2025-08-30",
    cycle_number: 1,
    warning_issued: false,
    notes: "Oignons cultivés avec succès. Sol riche en matière organique.",
  },
  {
    id: "RH-004",
    parcel_id: "P-003",
    crop_id: "C-103",
    crop_name: "Menthe de Thiès",
    family_id: "FAM-009",
    family_name: "Lamiacées",
    start_date: "2025-01-01",
    end_date: "2025-06-30",
    cycle_number: 1,
    warning_issued: false,
    notes: "Culture aromatique en rotation avec légumes.",
  },
];

const DEFAULT_ROTATION_RULES = [
  {
    id: "RR-001",
    family_id: "FAM-001",
    cannot_follow_family_id: "FAM-001",
    min_years_between: 3,
    reason:
      "Prévention des maladies du sol spécifiques aux Solanacées (nématodes, mildiou, verticilliose)",
  },
  {
    id: "RR-002",
    family_id: "FAM-003",
    cannot_follow_family_id: "FAM-003",
    min_years_between: 3,
    reason: "Prévention de la hernie des crucifères et accumulation de pathogènes spécifiques",
  },
  {
    id: "RR-003",
    family_id: "FAM-004",
    cannot_follow_family_id: "FAM-004",
    min_years_between: 2,
    reason: "Réduction des populations de nématodes dans le sol",
  },
  {
    id: "RR-004",
    family_id: "FAM-005",
    cannot_follow_family_id: "FAM-005",
    min_years_between: 2,
    reason: "Éviter l'épuisement des nutriments et les maladies spécifiques",
  },
  {
    id: "RR-005",
    family_id: "FAM-006",
    cannot_follow_family_id: "FAM-006",
    min_years_between: 2,
    reason: "Prévention des maladies et ravageurs spécifiques aux Apiacées",
  },
  {
    id: "RR-006",
    family_id: "FAM-008",
    cannot_follow_family_id: "FAM-008",
    min_years_between: 1,
    reason: "Éviter l'épuisement rapide des réserves du sol",
  },
  {
    id: "RR-007",
    family_id: "FAM-002",
    cannot_follow_family_id: "FAM-002",
    min_years_between: 2,
    reason: "Permettre la reconstitution naturelle de l'azote et éviter les maladies",
  },
];

// Treatments data
const DEFAULT_TREATMENTS = [
  {
    id: "TR-001",
    parcelId: "P-001",
    parcelName: "Parcelle Nord - Planche 2",
    cropId: "C-101",
    cropName: "Tomate Mongal F1",
    category: "bio-phytosanitaire",
    productName: "Purin de Neem",
    dateApplied: "2026-06-20",
    dar: 3,
    target: "Chenilles et pucerons",
    notes: "Traitement préventif appliqué le matin. Respecter le DAR de 3 jours.",
    harvestReady: true,
    enterprise_id: "ka_farm",
  },
  {
    id: "TR-002",
    parcelId: "P-002",
    parcelName: "Parcelle Est - Grand Champ",
    cropId: "C-102",
    cropName: "Oignon Rouge de Galmi",
    category: "chimique-phytosanitaire",
    productName: "Décis (Insecticide chimique)",
    dateApplied: "2026-06-23",
    dar: 7,
    target: "Tuta Absoluta",
    notes: "Traitement curatif suite à l'alerte sur les chenilles.",
    harvestReady: false,
    enterprise_id: "ka_farm",
  },
  {
    id: "TR-003",
    parcelId: "P-001",
    parcelName: "Parcelle Nord - Planche 2",
    cropId: "C-101",
    cropName: "Tomate Mongal F1",
    category: "bio-engrais",
    productName: "Compost Organique Bio",
    dateApplied: "2026-06-15",
    dar: 0,
    target: "Amendement du sol",
    notes: "Application en fond pour améliorer la fertilité.",
    harvestReady: true,
    enterprise_id: "ka_farm",
  },
  {
    id: "TR-004",
    parcelId: "P-003",
    parcelName: "Parcelle Sud - Planche 1",
    cropId: "",
    cropName: "Chou Cabus",
    category: "chimique-phytosanitaire",
    productName: "Ridomil Gold",
    dateApplied: "2026-06-22",
    dar: 14,
    target: "Mildiou",
    notes: "Traitement fongicide préventif.",
    harvestReady: false,
    enterprise_id: "ka_farm",
  },
];

// Crop Profits
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
    notes: "Excellent rendement grâce au goutte-à-goutte. Marge exceptionnelle cette saison.",
    enterprise_id: "ka_farm",
  },
  {
    id: "PROF-002",
    cropName: "Oignon Rouge de Galmi",
    parcelId: "P-002",
    parcelName: "Parcelle Est - Grand Champ",
    yieldKg: 8000,
    pricePerKg: 500,
    revenue: 4000000,
    costs: { seeds: 200000, fertilizer: 150000, water: 80000, labor: 400000 },
    totalCost: 830000,
    netMargin: 3170000,
    profitabilityPercent: 382.05,
    period: "2026-06-20",
    notes: "Culture très rentable. Prix stable sur le marché de Sandiara.",
    enterprise_id: "ka_farm",
  },
  {
    id: "PROF-003",
    cropName: "Piment Oiseau",
    parcelId: "P-003",
    parcelName: "Parcelle Sud - Planche 1",
    yieldKg: 1500,
    pricePerKg: 1200,
    revenue: 1800000,
    costs: { seeds: 80000, fertilizer: 50000, water: 30000, labor: 150000 },
    totalCost: 310000,
    netMargin: 1490000,
    profitabilityPercent: 480.65,
    period: "2026-06-28",
    notes: "Petite surface mais très haut prix au kg. Culture stratégique.",
    enterprise_id: "ka_farm",
  },
  {
    id: "PROF-004",
    cropName: "Chou Cabus",
    parcelId: "P-004",
    parcelName: "Zone Ombragée - Bac A",
    yieldKg: 3000,
    pricePerKg: 400,
    revenue: 1200000,
    costs: { seeds: 60000, fertilizer: 40000, water: 25000, labor: 200000 },
    totalCost: 325000,
    netMargin: 875000,
    profitabilityPercent: 269.23,
    period: "2026-06-15",
    notes: "Culture d'hivernage. Bon rendement sous ombrage.",
    enterprise_id: "ka_farm",
  },
];

// Export all crop-related getters/setters
export const CropsStorage = {
  getCrops() {
    return KAStorage.get("ka_farm_crops", DEFAULT_CROPS);
  },
  saveCrops(crops) {
    KAStorage.set("ka_farm_crops", crops);
  },

  getNurseries() {
    return KAStorage.get("ka_farm_nurseries", DEFAULT_NURSERIES);
  },
  saveNurseries(nurseries) {
    KAStorage.set("ka_farm_nurseries", nurseries);
  },

  getHarvests() {
    return KAStorage.get("ka_farm_harvests", DEFAULT_HARVESTS);
  },
  saveHarvests(harvests) {
    KAStorage.set("ka_farm_harvests", harvests);
  },

  getTreatments() {
    return KAStorage.get("ka_farm_treatments", DEFAULT_TREATMENTS);
  },
  saveTreatments(treatments) {
    KAStorage.set("ka_farm_treatments", treatments);
  },

  getCropProfits() {
    return KAStorage.get("ka_farm_crop_profits", DEFAULT_CROP_PROFITS);
  },
  saveCropProfits(profits) {
    KAStorage.set("ka_farm_crop_profits", profits);
  },

  getPlantFamilies() {
    return KAStorage.get("ka_farm_plant_families", DEFAULT_PLANT_FAMILIES);
  },
  savePlantFamilies(families) {
    KAStorage.set("ka_farm_plant_families", families);
  },
  addPlantFamily(family) {
    const families = this.getPlantFamilies();
    families.push(family);
    this.savePlantFamilies(families);
    return family;
  },
  updatePlantFamily(id, updates) {
    const families = this.getPlantFamilies();
    const index = families.findIndex((f) => f.id === id);
    if (index !== -1) {
      families[index] = { ...families[index], ...updates };
      this.savePlantFamilies(families);
      return families[index];
    }
    return null;
  },
  deletePlantFamily(id) {
    const families = this.getPlantFamilies();
    const filtered = families.filter((f) => f.id !== id);
    this.savePlantFamilies(filtered);
    return filtered;
  },

  getCropFamilies() {
    return KAStorage.get("ka_farm_crop_families", DEFAULT_CROP_FAMILIES);
  },
  saveCropFamilies(cropFamilies) {
    KAStorage.set("ka_farm_crop_families", cropFamilies);
  },
  addCropFamily(cropFamily) {
    const cropFamilies = this.getCropFamilies();
    cropFamilies.push(cropFamily);
    this.saveCropFamilies(cropFamilies);
    return cropFamily;
  },
  getCropFamily(cropName) {
    const cropFamilies = this.getCropFamilies();
    return cropFamilies.find((cf) => cf.crop_name === cropName);
  },
  getCropsByFamily(familyId) {
    const cropFamilies = this.getCropFamilies();
    return cropFamilies.filter((cf) => cf.family_id === familyId).map((cf) => cf.crop_name);
  },

  getRotationHistory() {
    return KAStorage.get("ka_farm_rotation_history", DEFAULT_ROTATION_HISTORY);
  },
  saveRotationHistory(history) {
    KAStorage.set("ka_farm_rotation_history", history);
  },
  addRotationHistory(record) {
    const history = this.getRotationHistory();
    history.push(record);
    this.saveRotationHistory(history);
    return record;
  },
  getRotationHistoryByParcel(parcelId) {
    const history = this.getRotationHistory();
    return history
      .filter((r) => r.parcel_id === parcelId)
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  },
  getLastRotationForParcel(parcelId) {
    const history = this.getRotationHistoryByParcel(parcelId);
    return history.length > 0 ? history[0] : null;
  },

  getRotationRules() {
    return KAStorage.get("ka_farm_rotation_rules", DEFAULT_ROTATION_RULES);
  },
  saveRotationRules(rules) {
    KAStorage.set("ka_farm_rotation_rules", rules);
  },
  addRotationRule(rule) {
    const rules = this.getRotationRules();
    rules.push(rule);
    this.saveRotationRules(rules);
    return rule;
  },
  deleteRotationRule(id) {
    const rules = this.getRotationRules();
    const filtered = rules.filter((r) => r.id !== id);
    this.saveRotationRules(filtered);
    return filtered;
  },

  // Helper methods for rotation planning
  getFamilyById(familyId) {
    const families = this.getPlantFamilies();
    return families.find((f) => f.id === familyId);
  },

  getFamilyIdByCrop(cropName) {
    const cropFamily = this.getCropFamily(cropName);
    return cropFamily ? cropFamily.family_id : null;
  },

  // Check if a crop can follow another crop on a parcel
  canCropFollow(cropName, parcelId) {
    const familyId = this.getFamilyIdByCrop(cropName);
    if (!familyId) return { canFollow: true, reason: "Pas de famille définie pour cette culture" };

    const lastRotation = this.getLastRotationForParcel(parcelId);
    if (!lastRotation) return { canFollow: true, reason: "Première culture sur cette parcelle" };

    const lastFamilyId = lastRotation.family_id;

    // Check direct incompatibility
    if (familyId === lastFamilyId) {
      const family = this.getFamilyById(familyId);
      if (family) {
        return {
          canFollow: false,
          reason: `Impossible : ${family.name} nécessite ${family.min_rotation_years} an(s) entre deux cultures successives`,
        };
      }
    }

    // Check rotation rules
    const rules = this.getRotationRules();
    const conflictingRule = rules.find(
      (r) => r.family_id === familyId && r.cannot_follow_family_id === lastFamilyId
    );

    if (conflictingRule) {
      return {
        canFollow: false,
        reason: `Impossible selon la règle : ${conflictingRule.reason}`,
      };
    }

    // Check if enough time has passed for the same family
    if (familyId === lastFamilyId) {
      const family = this.getFamilyById(familyId);
      if (family) {
        const lastEndDate = new Date(lastRotation.end_date);
        const currentDate = new Date();
        const yearsPassed = (currentDate - lastEndDate) / (1000 * 60 * 60 * 24 * 365);

        if (yearsPassed < family.min_rotation_years) {
          return {
            canFollow: false,
            reason: `Attendre encore ${Math.ceil(family.min_rotation_years - yearsPassed)} an(s) pour ${family.name}`,
          };
        }
      }
    }

    return { canFollow: true, reason: "Rotation autorisée" };
  },

  // Get recommended crops for a parcel
  getRecommendedCrops(parcelId) {
    const allCrops = this.getCrops();
    const cropFamilies = this.getCropFamilies();
    const lastRotation = this.getLastRotationForParcel(parcelId);

    if (!lastRotation) {
      // First crop on parcel - all crops are recommended
      return allCrops.map((c) => ({
        crop: c,
        reason: "Première culture sur cette parcelle",
        priority: 1,
      }));
    }

    const lastFamilyId = lastRotation.family_id;
    const lastFamily = this.getFamilyById(lastFamilyId);

    const recommendations = [];

    // Get compatible families from last family
    const compatibleFamilies = lastFamily ? lastFamily.compatible_families : [];

    for (const crop of allCrops) {
      const cropFamily = cropFamilies.find((cf) => cf.crop_name === crop.name);
      if (!cropFamily) continue;

      const canFollow = this.canCropFollow(crop.name, parcelId);

      if (canFollow.canFollow) {
        // Check if it's in compatible families
        if (compatibleFamilies.includes(cropFamily.family_id)) {
          recommendations.push({
            crop,
            reason: `Famille compatible : ${cropFamily.family_name}`,
            priority: 3,
          });
        } else {
          recommendations.push({
            crop,
            reason: canFollow.reason,
            priority: 2,
          });
        }
      } else {
        recommendations.push({
          crop,
          reason: canFollow.reason,
          priority: 0,
          warning: true,
        });
      }
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  },

  // Get rotation warnings for all parcels
  getRotationWarnings() {
    const parcels = KAStorage.getParcelles();
    const warnings = [];

    for (const parcel of parcels) {
      const lastRotation = this.getLastRotationForParcel(parcel.id);
      if (!lastRotation) continue;

      const currentCrop = this.getCrops().find((c) => c.id === parcel.currentCrop);
      if (!currentCrop) continue;

      const currentFamilyId = this.getFamilyIdByCrop(currentCrop.name);
      const lastFamilyId = lastRotation.family_id;

      if (currentFamilyId && currentFamilyId === lastFamilyId) {
        const family = this.getFamilyById(currentFamilyId);
        if (family) {
          warnings.push({
            parcelId: parcel.id,
            parcelName: parcel.name,
            cropName: currentCrop.name,
            familyName: family.name,
            message: `Violation de rotation : ${family.name} planté deux fois de suite`,
            severity: "Critique",
            minYears: family.min_rotation_years,
          });
        }
      }
    }

    return warnings;
  },

  // Crop Library for DAR
  getCropLibrary() {
    return KAStorage.get("ka_farm_crop_library", CROP_LIBRARY_DATA);
  },
  saveCropLibrary(library) {
    KAStorage.set("ka_farm_crop_library", library);
  },
  getCropLibraryEntry(cropName) {
    return this.getCropLibrary().find(
      (entry) => entry.cropName.toLowerCase() === cropName.toLowerCase()
    );
  },
};
