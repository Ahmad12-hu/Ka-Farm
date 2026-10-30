// Schémas Zod partagés par l'API de production (api/index.js) et le serveur
// de développement (server.js) — évite la dérive entre les deux contrats.
import { z } from "zod";

export const CropSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    name: z.string().min(1, "Nom requis"),
    field: z.string().optional(),
    sowingDate: z.string().optional(),
    harvestDate: z.string().optional(),
    status: z.string().optional(),
    waterStatus: z.string().optional(),
    fertilizerStatus: z.string().optional(),
  })
  .passthrough();

export const ParcelleSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    name: z.string().min(1, "Nom requis"),
    surface: z.number().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    status: z.string().optional(),
  })
  .passthrough();

export const EmployeeSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    name: z.string().min(1, "Nom requis"),
    phone: z.string().optional(),
    role: z.string().optional(),
    dailyRate: z.number().optional(),
    status: z.string().optional(),
  })
  .passthrough();

export const FinanceSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    description: z.string().min(1, "Description requise"),
    type: z.enum(["Revenu", "Dépense"]).optional(),
    category: z.string().optional(),
    amount: z.number().positive("Montant doit être positif").optional(),
    date: z.string().optional(),
  })
  .passthrough();

export const TaskSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    title: z.string().min(1, "Titre requis"),
    category: z.string().optional(),
    dueDate: z.string().optional(),
    assignee: z.string().optional(),
    priority: z.string().optional(),
    completed: z.boolean().optional(),
  })
  .passthrough();

export const CheptelSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    name: z.string().min(1, "Nom requis"),
    type: z.string().optional(),
    breed: z.string().optional(),
    quantity: z.number().int().positive("Quantité doit être positive").optional(),
    unit: z.string().optional(),
    status: z.string().optional(),
    purpose: z.string().optional(),
  })
  .passthrough();

export const ElevageProductionSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    date: z.string().min(1, "Date requise"),
    type: z.string().min(1, "Type requis"),
    quantity: z.number().positive("Quantité doit être positive").optional(),
    unit: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough();

export const ElevageHealthSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    date: z.string().min(1, "Date requise"),
    target: z.string().min(1, "Cible requise"),
    intervention: z.string().min(1, "Intervention requise"),
    practitioner: z.string().optional(),
    cost: z.number().nonnegative("Coût doit être positif").optional(),
    notes: z.string().optional(),
  })
  .passthrough();

export const MessageSchema = z
  .object({
    id: z.string().optional(),
    senderEmail: z.string().email("Email invalide").min(1, "Email requis"),
    senderName: z.string().optional(),
    text: z.string().min(1, "Message requis"),
    timestamp: z.string().optional(),
    isPrivate: z.boolean().optional(),
  })
  .passthrough();

export const TreatmentSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    product_name: z.string().min(1, "Nom du produit requis").optional(),
    productName: z.string().min(1, "Nom du produit requis").optional(),
    parcel_id: z.string().optional(),
    crop_id: z.string().optional(),
    crop_name: z.string().optional(),
    parcel_name: z.string().optional(),
    category: z.string().optional(),
    date_applied: z.string().optional(),
    dar_days: z.number().optional(),
    target: z.string().optional(),
    notes: z.string().optional(),
    harvest_ready: z.boolean().optional(),
  })
  .passthrough()
  .refine((treatment) => Boolean(treatment.product_name || treatment.productName), {
    message: "Nom du produit requis",
    path: ["product_name"],
  });

export const CropProfitSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    crop_name: z.string().min(1, "Nom de la culture requis").optional(),
    cropName: z.string().min(1, "Nom de la culture requis").optional(),
    parcel_id: z.string().optional(),
    parcel_name: z.string().optional(),
    yield_kg: z.number().optional(),
    price_per_kg: z.number().optional(),
    revenue: z.number().optional(),
    costs: z.number().optional(),
    total_cost: z.number().optional(),
    net_margin: z.number().optional(),
    profitability_percent: z.number().optional(),
    period: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough()
  .refine((profit) => Boolean(profit.crop_name || profit.cropName), {
    message: "Nom de la culture requis",
    path: ["crop_name"],
  });

// Intrants — forme envoyée par le frontend (camelCase, catégories libres).
export const StockSchema = z
  .object({
    id: z.string().min(1, "ID requis"),
    name: z.string().min(1, "Nom requis"),
    category: z.string().optional(),
    quantity: z.number().nonnegative("Quantité ne peut être négative").optional(),
    maxQuantity: z.number().nonnegative("Capacité maximale invalide").optional(),
    unit: z.string().optional(),
  })
  .passthrough();

export const StocksPayloadSchema = z.object({ stocks: z.array(StockSchema) }).passthrough();

export const TreatmentsSyncSchema = z
  .object({
    treatments: z.array(z.object({ id: z.string().min(1, "ID requis") }).passthrough()),
  })
  .passthrough();

export const CropProfitsSyncSchema = z
  .object({
    cropProfits: z.array(z.object({ id: z.string().min(1, "ID requis") }).passthrough()),
  })
  .passthrough();

export const LoginSchema = z
  .object({
    email: z.string().trim().min(1, "Email requis").email("Email invalide"),
    password: z.string().min(1, "Mot de passe requis"),
    remember: z.boolean().optional(),
  })
  .passthrough();

export const SyncActionSchema = z
  .object({
    collection: z.string().min(1, "Collection requise"),
    type: z.string().optional(),
  })
  .passthrough();

// Requêtes IA (gemini, openai, claude, stream).
export const AiRequestSchema = z
  .object({
    prompt: z.string().min(1, "Prompt requis"),
    history: z
      .array(z.object({ role: z.string().optional(), text: z.string().optional() }).passthrough())
      .optional(),
    image: z.string().optional(),
    systemPrompt: z.string().optional(),
    model: z.string().optional(),
    agentType: z.string().optional(),
    language: z.string().optional(),
  })
  .passthrough();

export const TranslateSchema = z
  .object({
    text: z.string().min(1, "Texte requis"),
    fromLang: z.string().optional(),
    toLang: z.string().optional(),
  })
  .passthrough();

// ==================== HELPERS ====================

export function validationDetails(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

// Middleware Express : valide req.body, remplace par les données parsées,
// ou répond 400 avec le détail des champs invalides.
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
