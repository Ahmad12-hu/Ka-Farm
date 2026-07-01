// KA-FARM - Modèle Parcelle
import mongoose from 'mongoose';

const parcelleSchema = new mongoose.Schema({
  fermeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ferme',
    required: true
  },
  nom_parcelle: {
    type: String,
    required: true
  },
  surface_m2: {
    type: Number,
    required: true
  },
  type_sol: {
    type: String,
    enum: ['argileux', 'sableux', 'limoneux', 'humifère', 'calcaire', 'autre'],
    default: 'autre'
  },
  statut: {
    type: String,
    enum: ['en_jachere', 'en_production', 'en_preparation'],
    default: 'en_jachere'
  },
  coordonnees: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
parcelleSchema.index({ fermeId: 1 });
parcelleSchema.index({ statut: 1 });

export const Parcelle = mongoose.model('Parcelle', parcelleSchema);
