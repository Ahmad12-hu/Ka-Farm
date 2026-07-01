// KA-FARM - Modèle Tâche
import mongoose from 'mongoose';

const tacheSchema = new mongoose.Schema({
  fermeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ferme',
    required: true
  },
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  priorite: {
    type: String,
    enum: ['basse', 'moyenne', 'haute', 'urgente'],
    default: 'moyenne'
  },
  statut: {
    type: String,
    enum: ['a_faire', 'en_cours', 'terminee', 'annulee'],
    default: 'a_faire'
  },
  assigne_a: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  date_echeance: {
    type: Date,
    required: true
  },
  categorie: {
    type: String,
    enum: ['culture', 'recolte', 'entretien', 'achat', 'vente', 'administratif', 'autre'],
    default: 'autre'
  },
  cree_par: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
tacheSchema.index({ fermeId: 1 });
tacheSchema.index({ statut: 1 });
tacheSchema.index({ priorite: 1 });
tacheSchema.index({ date_echeance: 1 });

export const Tache = mongoose.model('Tache', tacheSchema);
