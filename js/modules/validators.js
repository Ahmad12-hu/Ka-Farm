// Zod Validation Schemas pour KA Farm
import { z } from 'zod';

// ==================== SCHÉMAS DE VALIDATION ====================

// Schema pour les utilisateurs
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Nom trop court').max(255),
  role: z.enum(['Bureau', 'admin', 'super_admin']),
  enterprise_id: z.string().default('ka_farm'),
  enterprise_name: z.string().default('KA Farm'),
  enterprise_code: z.string().default('KA-FARM'),
});

// Schema pour les parcelles
export const ParcelleSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  name: z.string().min(1, 'Nom requis').max(255),
  surface: z.number().positive('Surface doit être positive').optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  status: z.enum(['Cultivée', 'En jachère', 'En pépinière', 'Libre']).default('Cultivée'),
  type_sol: z.enum(['sableux', 'argileux', 'limoneux', 'latéritique']).default('sableux'),
  current_crop: z.string().optional(),
  water_status: z.enum(['Irrigué', 'Non irrigué', 'En attente']).default('Irrigué'),
});

// Schema pour les cultures
export const CropSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  name: z.string().min(1, 'Nom de culture requis').max(255),
  field: z.string().optional(),
  sowing_date: z.string().date().optional(),
  harvest_date: z.string().date().optional(),
  status: z.enum(['Croissance', 'Récolte', 'Terminé', 'En pépinière']).default('Croissance'),
  water_status: z.enum(['Optimal', 'Sous-arrosé', 'Sur-arrosé']).default('Optimal'),
  fertilizer_status: z.enum(['OK', 'À appliquer', 'En cours']).default('OK'),
  parcel_id: z.string().uuid().optional(),
});

// Schema pour les traitements phytosanitaires
export const TreatmentSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  parcel_id: z.string().uuid().optional(),
  crop_id: z.string().uuid().optional(),
  crop_name: z.string().min(1, 'Nom de culture requis'),
  parcel_name: z.string().min(1, 'Nom de parcelle requis'),
  product_name: z.string().min(1, 'Nom du produit requis').max(255),
  category: z.string().min(1, 'Catégorie requise'),
  date_applied: z.string().date(),
  dar_days: z.number().int().min(0, 'DAR doit être positif').default(7),
  target: z.string().optional(),
  notes: z.string().optional(),
  harvest_ready: z.boolean().default(false),
});

// Schema pour les finances
export const FinanceSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  description: z.string().min(1, 'Description requise').max(255),
  category: z.string().min(1, 'Catégorie requise'),
  type: z.enum(['Revenu', 'Dépense']),
  amount: z.number().positive('Montant doit être positif'),
  date: z.string().date(),
  parcel_id: z.string().uuid().optional(),
  crop_name: z.string().optional(),
});

// Schema pour les employés
export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  name: z.string().min(2, 'Nom trop court').max(255),
  phone: z.string().optional(),
  role: z.string().default('Ouvrier agricole'),
  daily_rate: z.number().int().min(0, 'Taux journalier doit être positif').default(0),
  status: z.enum(['Actif', 'Inactif', 'En congé']).default('Actif'),
});

// Schema pour les stocks
export const StockSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  name: z.string().min(1, 'Nom requis').max(255),
  category: z.enum(['semence', 'engrais', 'traitement', 'outillage']),
  quantity: z.number().min(0, 'Quantité ne peut être négative').default(0),
  max_quantity: z.number().min(0, 'Capacité maximale doit être positive').default(0),
  unit: z.enum(['kg', 'sac', 'litre', 'sachet', 'unité']),
  alert_threshold: z.number().min(0).default(0),
});

// Schema pour les récoltes
export const HarvestSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  parcel_id: z.string().uuid().optional(),
  crop_id: z.string().uuid().optional(),
  crop_name: z.string().min(1, 'Nom de culture requis'),
  parcel_name: z.string().min(1, 'Nom de parcelle requis'),
  weight_kg: z.number().positive('Poids doit être positif').default(0),
  quality: z.enum(['Choix A', 'Choix B', 'Choix C']).default('Choix A'),
  harvest_date: z.string().date(),
  selling_price_per_kg: z.number().min(0).default(0),
  total_revenue: z.number().min(0).default(0),
});

// Schema pour les ventes
export const SaleSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  harvest_id: z.string().uuid().optional(),
  crop_name: z.string().min(1, 'Nom de culture requis'),
  market_destination: z.string().min(1, 'Destination requise'),
  quantity_kg: z.number().positive('Quantité doit être positive'),
  unit_price_fcfa: z.number().positive('Prix unitaire doit être positif'),
  total_amount_fcfa: z.number().min(0),
  intermediary_name: z.string().optional(),
  intermediary_phone: z.string().optional(),
  payment_status: z.enum(['Payé', 'Partiel', 'Non payé']).default('Non payé'),
  deposit_fcfa: z.number().min(0).default(0),
  balance_fcfa: z.number().min(0).default(0),
  sale_date: z.string().date(),
});

// Schema pour les tâches
export const TaskSchema = z.object({
  id: z.string().uuid(),
  enterprise_id: z.string().default('ka_farm'),
  title: z.string().min(1, 'Titre requis').max(255),
  category: z.enum(['Entretien', 'Irrigation', 'Récolte', 'Traitement', 'Plantation', 'Autre']).default('Entretien'),
  due_date: z.string().date().optional(),
  assignee: z.string().optional(),
  priority: z.enum(['Basse', 'Moyenne', 'Haute', 'Urgente']).default('Moyenne'),
  completed: z.boolean().default(false),
});

// ==================== FONCTIONS DE VALIDATION ====================

export function validateData(schema, data) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'unknown', message: 'Erreur de validation inconnue' }],
    };
  }
}

export function validatePhoneNumber(phone) {
  const phoneSchema = z.string().regex(
    /^(\+221|221)?[0-9]{9}$/,
    'Numéro de téléphone sénégalais invalide (ex: 771234567 ou +221771234567)'
  );
  return validateData(phoneSchema, phone);
}

export function validateEmail(email) {
  const emailSchema = z.string().email('Email invalide');
  return validateData(emailSchema, email);
}

export function validateCoordinates(lat, lng) {
  const schema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  });
  return validateData(schema, { lat, lng });
}

export function validatePositiveNumber(value, fieldName = 'Valeur') {
  const schema = z.number().positive(`${fieldName} doit être positif`);
  return validateData(schema, value);
}

export function validateDate(dateString) {
  const schema = z.string().datetime('Date invalide');
  return validateData(schema, dateString);
}

// Validation groupée
export function validateMultiple(schema, dataArray) {
  return dataArray.map(data => validateData(schema, data));
}