// KA Farm - Tools Sharing Storage Domain
// Manages agricultural tools sharing and rental data

import { KAStorage } from "./core.js";

const DEFAULT_TOOLS_SHARING = [
  {
    id: "TS-001",
    tool_name: "Motopompe Honda 5.5 CV",
    tool_type: "Irrigation",
    brand: "Honda",
    model: "EU20i",
    purchase_year: 2023,
    condition: "Bon état",
    description:
      "Motopompe portable pour arrosage des parcelles. Débit: 60m3/h, Hauteur manométrique: 45m",
    daily_rental_price_fcfa: 15000,
    hourly_rental_price_fcfa: 2000,
    minimum_rental_hours: 4,
    is_available: true,
    owner_farm_id: "FARM-001",
    owner_farm_name: "Fermes KA - Niayes",
    owner_contact_name: "Responsable terrain",
    owner_phone: "77 123 45 67",
    owner_location: "Zone Maraîchère de Pout, Niayes",
    owner_lat: 14.7932,
    owner_lng: -17.2654,
    region: "Niayes",
    usage_instructions:
      "Vérifier le niveau d'huile avant utilisation. Ne pas faire fonctionner à vide.",
    maintenance_requirements:
      "Vidange toutes les 100 heures. Nettoyage du filtre à air régulièrement.",
    insurance_required: false,
    deposit_required: 50000,
    total_rentals: 12,
    rating: 4.8,
    is_verified: true,
    photos: ["/assets/tools/motopompe-1.jpg", "/assets/tools/motopompe-2.jpg"],
    notes: "Disponible toute la saison. Livraison possible sur demande.",
  },
  {
    id: "TS-002",
    tool_name: "Charrette à Bœufs - Grande",
    tool_type: "Transport",
    brand: "Artisanal",
    model: "Traditionnelle renforcée",
    purchase_year: 2022,
    condition: "Excellent",
    description: "Charrette solide pour transport de récoltes ou fumier. Capacité: 2 tonnes",
    daily_rental_price_fcfa: 8000,
    hourly_rental_price_fcfa: 0,
    minimum_rental_hours: 1,
    is_available: true,
    owner_farm_id: "FARM-002",
    owner_farm_name: "Ferme Diop - Thiès",
    owner_contact_name: "Responsable bureau",
    owner_phone: "76 456 78 90",
    owner_location: "Keur Massar, Thiès",
    owner_lat: 14.7856,
    owner_lng: -17.2543,
    region: "Thiès",
    usage_instructions: "Ne pas surcharger. Lubrifier les roues avant utilisation.",
    maintenance_requirements: "Vérifier les roues et l'attelage régulièrement.",
    insurance_required: false,
    deposit_required: 20000,
    total_rentals: 8,
    rating: 4.5,
    is_verified: true,
    photos: ["/assets/tools/charrette-1.jpg"],
    notes: "Idéal pour le transport sur terrain irrégulier.",
  },
  {
    id: "TS-003",
    tool_name: "Pulvérisateur à Dos 16L",
    tool_type: "Traitement",
    brand: "Solo",
    model: "425",
    purchase_year: 2024,
    condition: "Neuf",
    description: "Pulvérisateur manuel pour traitements phytosanitaires. Capacité: 16 litres",
    daily_rental_price_fcfa: 5000,
    hourly_rental_price_fcfa: 1000,
    minimum_rental_hours: 2,
    is_available: true,
    owner_farm_id: "FARM-003",
    owner_farm_name: "Ferme Sow - Mbour",
    owner_contact_name: "Fatou Sow",
    owner_phone: "77 789 01 23",
    owner_location: "Somet, Mbour",
    owner_lat: 14.4567,
    owner_lng: -17.0123,
    region: "Mbour",
    usage_instructions: "Porter des équipements de protection. Bien rincer après utilisation.",
    maintenance_requirements: "Nettoyage complet après chaque utilisation.",
    insurance_required: false,
    deposit_required: 15000,
    total_rentals: 15,
    rating: 4.9,
    is_verified: true,
    photos: ["/assets/tools/pulverisateur-1.jpg", "/assets/tools/pulverisateur-2.jpg"],
    notes: "Parfait pour les petits traitements ciblés.",
  },
  {
    id: "TS-004",
    tool_name: "Moto Broyeur de Branches",
    tool_type: "Entretien",
    brand: "Stihl",
    model: "GHE 150",
    purchase_year: 2023,
    condition: "Bon état",
    description: "Broyeur thermique pour branches jusqu'à 5cm de diamètre",
    daily_rental_price_fcfa: 25000,
    hourly_rental_price_fcfa: 4000,
    minimum_rental_hours: 4,
    is_available: true,
    owner_farm_id: "FARM-004",
    owner_farm_name: "Ferme Ndiaye - Kaolack",
    owner_contact_name: "Ibrahima Ndiaye",
    owner_phone: "70 123 45 67",
    owner_location: "Ndande, Kaolack",
    owner_lat: 14.15,
    owner_lng: -16.0833,
    region: "Kaolack",
    usage_instructions:
      "Porter casque et protection auditive. Ne pas broyer de matériaux métalliques.",
    maintenance_requirements: "Affûtage des lames après 20 heures d'utilisation.",
    insurance_required: true,
    deposit_required: 100000,
    total_rentals: 5,
    rating: 4.7,
    is_verified: true,
    photos: ["/assets/tools/broyeur-1.jpg", "/assets/tools/broyeur-2.jpg"],
    notes: "Matériel professionnel. Formation obligatoire avant première utilisation.",
  },
  {
    id: "TS-005",
    tool_name: "Bêche Large",
    tool_type: "Labour",
    brand: "Artisanal",
    model: "Standard",
    purchase_year: 2022,
    condition: "Bon état",
    description: "Bêche en acier pour travail du sol manuel",
    daily_rental_price_fcfa: 2000,
    hourly_rental_price_fcfa: 500,
    minimum_rental_hours: 1,
    is_available: true,
    owner_farm_id: "FARM-005",
    owner_farm_name: "Ferme Fall - Fatick",
    owner_contact_name: "Modou Fall",
    owner_phone: "77 234 56 78",
    owner_location: "Fimela, Fatick",
    owner_lat: 14.3333,
    owner_lng: -16.4,
    region: "Fatick",
    usage_instructions: "Affûter régulièrement pour un travail efficace.",
    maintenance_requirements: "Nettoyer et sécher après utilisation pour éviter la rouille.",
    insurance_required: false,
    deposit_required: 5000,
    total_rentals: 25,
    rating: 4.6,
    is_verified: true,
    photos: ["/assets/tools/beche-1.jpg"],
    notes: "Outils de base disponible en quantité.",
  },
  {
    id: "TS-006",
    tool_name: "Sarcloir à Roue",
    tool_type: "Désherbage",
    brand: "Gardena",
    model: "CombiSystem",
    purchase_year: 2023,
    condition: "Très bon état",
    description: "Sarcloir manuel à roue pour désherbage entre les rangs",
    daily_rental_price_fcfa: 3000,
    hourly_rental_price_fcfa: 0,
    minimum_rental_hours: 1,
    is_available: true,
    owner_farm_id: "FARM-001",
    owner_farm_name: "Fermes KA - Niayes",
    owner_contact_name: "Responsable terrain",
    owner_phone: "77 123 45 67",
    owner_location: "Zone Maraîchère de Pout, Niayes",
    owner_lat: 14.7932,
    owner_lng: -17.2654,
    region: "Niayes",
    usage_instructions: "Régler la hauteur de travail selon la culture.",
    maintenance_requirements: "Lubrifier les parties mobiles régulièrement.",
    insurance_required: false,
    deposit_required: 10000,
    total_rentals: 18,
    rating: 4.8,
    is_verified: true,
    photos: ["/assets/tools/sarcloir-1.jpg"],
    notes: "Idéal pour l'entretien des cultures en ligne.",
  },
];

const DEFAULT_TOOL_RENTALS = [
  {
    id: "TR-001",
    tool_id: "TS-001",
    renter_farm_id: "FARM-006",
    renter_farm_name: "Ferme Ba - Dakar",
    renter_contact_name: "Ousmane Ba",
    renter_phone: "76 543 21 09",
    rental_start: "2026-07-15T08:00:00.000Z",
    rental_end: "2026-07-15T18:00:00.000Z",
    total_hours: 10,
    daily_rate: 15000,
    total_amount_fcfa: 25000,
    deposit_paid_fcfa: 50000,
    balance_due_fcfa: 0,
    payment_status: "Payé",
    pickup_location: "Zone Maraîchère de Pout, Niayes",
    return_location: "Zone Maraîchère de Pout, Niayes",
    actual_return: "2026-07-15T17:30:00.000Z",
    condition_on_return: "Bon état",
    damage_noted: "",
    damage_cost: 0,
    status: "Terminée",
    cancellation_reason: "",
    notes: "Location pour arrosage d'urgence. Retour anticipé.",
  },
  {
    id: "TR-002",
    tool_id: "TS-003",
    renter_farm_id: "FARM-007",
    renter_farm_name: "Ferme Diallo - Saint-Louis",
    renter_contact_name: "Amadou Diallo",
    renter_phone: "70 654 32 10",
    rental_start: "2026-07-12T09:00:00.000Z",
    rental_end: "2026-07-13T17:00:00.000Z",
    total_hours: 30,
    daily_rate: 5000,
    total_amount_fcfa: 30000,
    deposit_paid_fcfa: 15000,
    balance_due_fcfa: 0,
    payment_status: "Payé",
    pickup_location: "Somet, Mbour",
    return_location: "Somet, Mbour",
    actual_return: "2026-07-13T16:00:00.000Z",
    condition_on_return: "Bon état",
    damage_noted: "",
    damage_cost: 0,
    status: "Terminée",
    cancellation_reason: "",
    notes: "Traitement phytosanitaire sur culture de tomates.",
  },
  {
    id: "TR-003",
    tool_id: "TS-002",
    renter_farm_id: "FARM-008",
    renter_farm_name: "Ferme Wane - Thiès",
    renter_contact_name: "Pape Wane",
    renter_phone: "77 345 67 89",
    rental_start: "2026-07-10T07:00:00.000Z",
    rental_end: "2026-07-10T19:00:00.000Z",
    total_hours: 12,
    daily_rate: 8000,
    total_amount_fcfa: 8000,
    deposit_paid_fcfa: 20000,
    balance_due_fcfa: 0,
    payment_status: "Payé",
    pickup_location: "Keur Massar, Thiès",
    return_location: "Keur Massar, Thiès",
    actual_return: "2026-07-10T18:30:00.000Z",
    condition_on_return: "Bon état",
    damage_noted: "",
    damage_cost: 0,
    status: "Terminée",
    cancellation_reason: "",
    notes: "Transport de fumier pour fertilisation.",
  },
];

const DEFAULT_TOOL_FAVORITES = [
  { id: "TF-001", farm_id: "FARM-006", tool_id: "TS-001" },
  { id: "TF-002", farm_id: "FARM-007", tool_id: "TS-003" },
  { id: "TF-003", farm_id: "FARM-006", tool_id: "TS-006" },
];

const DEFAULT_TOOL_REVIEWS = [
  {
    id: "TRV-001",
    rental_id: "TR-001",
    tool_id: "TS-001",
    renter_farm_id: "FARM-006",
    rating: 5,
    review_text:
      "Excellent équipement, très fiable pour l'arrosage. Le propriétaire est très professionnel.",
    would_rent_again: true,
    created_at: "2026-07-16T10:00:00.000Z",
  },
  {
    id: "TRV-002",
    rental_id: "TR-002",
    tool_id: "TS-003",
    renter_farm_id: "FARM-007",
    rating: 4,
    review_text: "Bon pulvérisateur, mais aurait besoin d'un entretien (buse légèrement obstruée).",
    would_rent_again: true,
    created_at: "2026-07-14T09:00:00.000Z",
  },
  {
    id: "TRV-003",
    rental_id: "TR-003",
    tool_id: "TS-002",
    renter_farm_id: "FARM-008",
    rating: 5,
    review_text:
      "Charrette solide et bien entretenue. Parfaite pour le transport sur nos chemins de terre.",
    would_rent_again: true,
    created_at: "2026-07-11T08:00:00.000Z",
  },
];

export const ToolsSharingStorage = {
  getToolsSharing() {
    return KAStorage.get("ka_farm_tools_sharing", DEFAULT_TOOLS_SHARING);
  },
  saveToolsSharing(tools) {
    KAStorage.set("ka_farm_tools_sharing", tools);
  },
  addToolSharing(tool) {
    const tools = this.getToolsSharing();
    tools.push(tool);
    this.saveToolsSharing(tools);
    return tool;
  },
  updateToolSharing(id, updates) {
    const tools = this.getToolsSharing();
    const index = tools.findIndex((t) => t.id === id);
    if (index !== -1) {
      tools[index] = { ...tools[index], ...updates };
      this.saveToolsSharing(tools);
      return tools[index];
    }
    return null;
  },
  deleteToolSharing(id) {
    const tools = this.getToolsSharing();
    const filtered = tools.filter((t) => t.id !== id);
    this.saveToolsSharing(filtered);
    return filtered;
  },
  getToolSharingById(id) {
    const tools = this.getToolsSharing();
    return tools.find((t) => t.id === id);
  },
  getToolsByRegion(region) {
    const tools = this.getToolsSharing();
    return tools.filter((t) => t.region === region);
  },
  getToolsByType(toolType) {
    const tools = this.getToolsSharing();
    return tools.filter((t) => t.tool_type === toolType);
  },
  getAvailableTools() {
    const tools = this.getToolsSharing();
    return tools.filter((t) => t.is_available);
  },
  getVerifiedTools() {
    const tools = this.getToolsSharing();
    return tools.filter((t) => t.is_verified);
  },
  searchTools(query) {
    const tools = this.getToolsSharing();
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.tool_name.toLowerCase().includes(q) ||
        t.tool_type.toLowerCase().includes(q) ||
        t.owner_farm_name.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  },
  toggleToolAvailability(id) {
    const tools = this.getToolsSharing();
    const index = tools.findIndex((t) => t.id === id);
    if (index !== -1) {
      tools[index] = { ...tools[index], is_available: !tools[index].is_available };
      this.saveToolsSharing(tools);
      return tools[index];
    }
    return null;
  },

  getToolRentals() {
    return KAStorage.get("ka_farm_tool_rentals", DEFAULT_TOOL_RENTALS);
  },
  saveToolRentals(rentals) {
    KAStorage.set("ka_farm_tool_rentals", rentals);
  },
  addToolRental(rental) {
    const rentals = this.getToolRentals();
    rentals.push(rental);
    this.saveToolRentals(rentals);
    return rental;
  },
  updateToolRental(id, updates) {
    const rentals = this.getToolRentals();
    const index = rentals.findIndex((r) => r.id === id);
    if (index !== -1) {
      rentals[index] = { ...rentals[index], ...updates };
      this.saveToolRentals(rentals);
      return rentals[index];
    }
    return null;
  },
  deleteToolRental(id) {
    const rentals = this.getToolRentals();
    const filtered = rentals.filter((r) => r.id !== id);
    this.saveToolRentals(filtered);
    return filtered;
  },
  getToolRentalById(id) {
    const rentals = this.getToolRentals();
    return rentals.find((r) => r.id === id);
  },
  getRentalsByTool(toolId) {
    const rentals = this.getToolRentals();
    return rentals.filter((r) => r.tool_id === toolId);
  },
  getRentalsByRenter(renterFarmId) {
    const rentals = this.getToolRentals();
    return rentals.filter((r) => r.renter_farm_id === renterFarmId);
  },
  getActiveRentals() {
    const rentals = this.getToolRentals();
    const now = new Date();
    return rentals.filter((r) => {
      const endDate = new Date(r.rental_end);
      return endDate >= now && r.status !== "Annulée" && r.status !== "Terminée";
    });
  },
  getRentalHistory(toolId) {
    const rentals = this.getToolRentals();
    return rentals
      .filter((r) => r.tool_id === toolId)
      .sort((a, b) => new Date(b.rental_start) - new Date(a.rental_start));
  },

  getToolFavorites() {
    return KAStorage.get("ka_farm_tool_favorites", DEFAULT_TOOL_FAVORITES);
  },
  saveToolFavorites(favorites) {
    KAStorage.set("ka_farm_tool_favorites", favorites);
  },
  addToolFavorite(favorite) {
    const favorites = this.getToolFavorites();
    const existing = favorites.find(
      (f) => f.farm_id === favorite.farm_id && f.tool_id === favorite.tool_id
    );
    if (!existing) {
      favorites.push(favorite);
      this.saveToolFavorites(favorites);
    }
    return favorite;
  },
  removeToolFavorite(farmId, toolId) {
    const favorites = this.getToolFavorites();
    const filtered = favorites.filter(!((f) => f.farm_id === farmId && f.tool_id === toolId));
    this.saveToolFavorites(filtered);
    return filtered;
  },
  getFavoritesByFarm(farmId) {
    const favorites = this.getToolFavorites();
    return favorites.filter((f) => f.farm_id === farmId);
  },
  isToolFavorited(farmId, toolId) {
    const favorites = this.getToolFavorites();
    return favorites.some((f) => f.farm_id === farmId && f.tool_id === toolId);
  },

  getToolReviews() {
    return KAStorage.get("ka_farm_tool_reviews", DEFAULT_TOOL_REVIEWS);
  },
  saveToolReviews(reviews) {
    KAStorage.set("ka_farm_tool_reviews", reviews);
  },
  addToolReview(review) {
    const reviews = this.getToolReviews();
    reviews.push(review);
    this.saveToolReviews(reviews);
    return review;
  },
  updateToolReview(id, updates) {
    const reviews = this.getToolReviews();
    const index = reviews.findIndex((r) => r.id === id);
    if (index !== -1) {
      reviews[index] = { ...reviews[index], ...updates };
      this.saveToolReviews(reviews);
      return reviews[index];
    }
    return null;
  },
  deleteToolReview(id) {
    const reviews = this.getToolReviews();
    const filtered = reviews.filter((r) => r.id !== id);
    this.saveToolReviews(filtered);
    return filtered;
  },
  getToolReviewsByTool(toolId) {
    const reviews = this.getToolReviews();
    return reviews.filter((r) => r.tool_id === toolId);
  },
  getAverageToolRating(toolId) {
    const reviews = this.getToolReviewsByTool(toolId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  },
  getToolReviewCount(toolId) {
    const reviews = this.getToolReviewsByTool(toolId);
    return reviews.length;
  },
};
