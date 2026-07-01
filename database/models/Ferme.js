// KA-FARM - Modèle Ferme
import mongoose from 'mongoose';

const fermeSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  localisation: {
    type: String,
    required: true
  },
  superficie_ha: {
    type: Number,
    required: true
  },
  proprietaire: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  actif: {
    type: Boolean,
    default: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
fermeSchema.index({ proprietaire: 1 });
fermeSchema.index({ localisation: 1 });

export const Ferme = mongoose.model('Ferme', fermeSchema);
