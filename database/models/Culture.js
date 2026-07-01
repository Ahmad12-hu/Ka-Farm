// KA-FARM - Modèle Culture
import mongoose from 'mongoose';

const cultureSchema = new mongoose.Schema({
  parcelleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parcelle',
    required: true
  },
  nom_culture: {
    type: String,
    required: true
  },
  variete: {
    type: String,
    default: ''
  },
  date_semis: {
    type: Date,
    default: null
  },
  date_recolte_estimee: {
    type: Date,
    default: null
  },
  statut: {
    type: String,
    enum: ['pepiniere', 'en_croissance', 'mature', 'recolte', 'echec'],
    default: 'pepiniere'
  },
  water_status: {
    type: String,
    enum: ['besoin_eau', 'arrose', 'exces_eau'],
    default: 'besoin_eau'
  },
  fertilizer_status: {
    type: String,
    enum: ['besoin_fertilisant', 'fertilise', 'exces'],
    default: 'besoin_fertilisant'
  },
  quantite_estimee_kg: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
cultureSchema.index({ parcelleId: 1 });
cultureSchema.index({ statut: 1 });
cultureSchema.index({ nom_culture: 1 });

export const Culture = mongoose.model('Culture', cultureSchema);
