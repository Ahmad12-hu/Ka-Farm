// Schémas Zod partagés par l'API de production (api/index.js) et le serveur
// de développement (server.js) — évite la dérive entre les deux contrats.
import { z } from "zod";

// ==================== SANITISATION ====================

// Caractères de contrôle (sauf \t, \n, \r conservés pour les textes multi-lignes).
// eslint-disable-next-line no-control-regex -- ces caractères sont précisément la cible.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
// Balises HTML ouvrantes/fermantes uniquement : "< 5 000 F" reste intact.
const HTML_TAGS = /<\/?[a-z][^>]*>/gi;

export function sanitizeText(value) {
  return value.replace(CONTROL_CHARS, "").replace(HTML_TAGS, "").trim();
}

// Chaîne sanitisée puis bornée : z.string() refuse d'abord les non-chaînes,
// la transformation nettoie, le pipe applique présence + longueur maximale.
function text(max, { required = false, message = "Champ requis", label = "Texte" } = {}) {
  const bound = required
    ? z.string().min(1, message).max(max, `${label} trop long (${max} caractères max)`)
    : z.string().max(max, `${label} trop long (${max} caractères max)`);
  return z
    .string()
    .transform((value) => sanitizeText(value))
    .pipe(bound);
}

const id = () => text(120, { required: true, message: "ID requis", label: "ID" });
const label = (max, required = false, message = "Champ requis") => text(max, { required, message });
const freeText = (max) => text(max, { label: "Texte" });
const dateString = () => freeText(64);

export const CropSchema = z
  .object({
    id: id(),
    name: label(255, true, "Nom requis"),
    field: freeText(255).optional(),
    sowingDate: dateString().optional(),
    harvestDate: dateString().optional(),
    status: label(50).optional(),
    waterStatus: label(50).optional(),
    fertilizerStatus: label(50).optional(),
  })
  .passthrough();

export const ParcelleSchema = z
  .object({
    id: id(),
    name: label(255, true, "Nom requis"),
    surface: z.number().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    status: label(50).optional(),
  })
  .passthrough();

export const EmployeeSchema = z
  .object({
    id: id(),
    name: label(255, true, "Nom requis"),
    phone: label(30).optional(),
    role: label(100).optional(),
    dailyRate: z.number().optional(),
    status: label(50).optional(),
  })
  .passthrough();

export const FinanceSchema = z
  .object({
    id: id(),
    description: label(255, true, "Description requise"),
    type: z.enum(["Revenu", "Dépense"]).optional(),
    category: label(100).optional(),
    amount: z.number().positive("Montant doit être positif").optional(),
    date: dateString().optional(),
  })
  .passthrough();

export const TaskSchema = z
  .object({
    id: id(),
    title: label(255, true, "Titre requis"),
    category: label(100).optional(),
    dueDate: dateString().optional(),
    assignee: freeText(255).optional(),
    priority: label(50).optional(),
    completed: z.boolean().optional(),
  })
  .passthrough();

export const CheptelSchema = z
  .object({
    id: id(),
    name: label(255, true, "Nom requis"),
    type: label(100).optional(),
    breed: label(100).optional(),
    quantity: z.number().int().positive("Quantité doit être positive").optional(),
    unit: label(30).optional(),
    status: label(50).optional(),
    purpose: label(100).optional(),
  })
  .passthrough();

export const ElevageProductionSchema = z
  .object({
    id: id(),
    date: text(64, { required: true, message: "Date requise", label: "Date" }),
    type: label(100, true, "Type requis"),
    quantity: z.number().positive("Quantité doit être positive").optional(),
    unit: label(30).optional(),
    notes: freeText(2000).optional(),
  })
  .passthrough();

export const ElevageHealthSchema = z
  .object({
    id: id(),
    date: text(64, { required: true, message: "Date requise", label: "Date" }),
    target: label(255, true, "Cible requise"),
    intervention: text(2000, {
      required: true,
      message: "Intervention requise",
      label: "Intervention",
    }),
    practitioner: freeText(255).optional(),
    cost: z.number().nonnegative("Coût doit être positif").optional(),
    notes: freeText(2000).optional(),
  })
  .passthrough();

export const MessageSchema = z
  .object({
    id: freeText(120).optional(),
    senderEmail: text(320, { required: true, message: "Email requis", label: "Email" }).pipe(
      z.string().email("Email invalide")
    ),
    senderName: freeText(255).optional(),
    text: text(10000, { required: true, message: "Message requis", label: "Message" }),
    timestamp: dateString().optional(),
    isPrivate: z.boolean().optional(),
  })
  .passthrough();

export const TreatmentSchema = z
  .object({
    id: id(),
    product_name: label(255).optional(),
    productName: label(255).optional(),
    parcel_id: freeText(120).optional(),
    crop_id: freeText(120).optional(),
    crop_name: freeText(255).optional(),
    parcel_name: freeText(255).optional(),
    category: label(100).optional(),
    date_applied: dateString().optional(),
    dar_days: z.number().optional(),
    target: freeText(255).optional(),
    notes: freeText(2000).optional(),
    harvest_ready: z.boolean().optional(),
  })
  .passthrough()
  .refine((treatment) => Boolean(treatment.product_name || treatment.productName), {
    message: "Nom du produit requis",
    path: ["product_name"],
  });

export const CropProfitSchema = z
  .object({
    id: id(),
    crop_name: freeText(255).optional(),
    cropName: freeText(255).optional(),
    parcel_id: freeText(120).optional(),
    parcel_name: freeText(255).optional(),
    yield_kg: z.number().optional(),
    price_per_kg: z.number().optional(),
    revenue: z.number().optional(),
    costs: z.number().optional(),
    total_cost: z.number().optional(),
    net_margin: z.number().optional(),
    profitability_percent: z.number().optional(),
    period: freeText(100).optional(),
    notes: freeText(2000).optional(),
  })
  .passthrough()
  .refine((profit) => Boolean(profit.crop_name || profit.cropName), {
    message: "Nom de la culture requis",
    path: ["crop_name"],
  });

// Intrants — forme envoyée par le frontend (camelCase, catégories libres).
export const StockSchema = z
  .object({
    id: id(),
    name: label(255, true, "Nom requis"),
    category: label(100).optional(),
    quantity: z.number().nonnegative("Quantité ne peut être négative").optional(),
    maxQuantity: z.number().nonnegative("Capacité maximale invalide").optional(),
    unit: label(30).optional(),
  })
  .passthrough();

export const StocksPayloadSchema = z.object({ stocks: z.array(StockSchema) }).passthrough();

export const TreatmentsSyncSchema = z
  .object({
    treatments: z.array(z.object({ id: id() }).passthrough()),
  })
  .passthrough();

export const CropProfitsSyncSchema = z
  .object({
    cropProfits: z.array(z.object({ id: id() }).passthrough()),
  })
  .passthrough();

// Le mot de passe n'est jamais trimé ni nettoyé : il doit rester identique.
export const LoginSchema = z
  .object({
    email: text(320, { required: true, message: "Email requis", label: "Email" }).pipe(
      z.string().email("Email invalide")
    ),
    password: z.string().min(1, "Mot de passe requis").max(200, "Mot de passe trop long"),
    remember: z.boolean().optional(),
  })
  .passthrough();

export const SyncActionSchema = z
  .object({
    collection: text(120, { required: true, message: "Collection requise", label: "Collection" }),
    type: label(50).optional(),
  })
  .passthrough();

// Requêtes IA (gemini, openai, claude, stream).
export const AiRequestSchema = z
  .object({
    prompt: text(20000, { required: true, message: "Prompt requis", label: "Prompt" }),
    history: z
      .array(
        z
          .object({
            role: label(30).optional(),
            text: freeText(20000).optional(),
          })
          .passthrough()
      )
      .optional(),
    // Image base64/data URL : jamais transformée.
    image: z.string().optional(),
    systemPrompt: freeText(5000).optional(),
    model: label(100).optional(),
    agentType: label(50).optional(),
    language: label(50).optional(),
  })
  .passthrough();

export const TranslateSchema = z
  .object({
    text: text(20000, { required: true, message: "Texte requis", label: "Texte" }),
    fromLang: label(50).optional(),
    toLang: label(50).optional(),
  })
  .passthrough();

// ==================== HELPERS ====================

export function validationDetails(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

// Middleware Express : valide req.body, remplace par les données parsées
// (donc sanitisées), ou répond 400 avec le détail des champs invalides.
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return res
        .status(400)
        .json({ error: "Données invalides", details: validationDetails(result.error) });
    }
    req.body = result.data;
    return next();
  };
}
