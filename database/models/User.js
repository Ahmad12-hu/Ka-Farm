// KA-FARM - Modèle Utilisateur
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['terrain', 'gestionnaire', 'admin', 'invite'],
    default: 'invite'
  },
  fermeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ferme',
    default: null
  },
  telephone: {
    type: String,
    default: null
  },
  actif: {
    type: Boolean,
    default: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereConnexion: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ fermeId: 1 });

export const User = mongoose.model('User', userSchema);
