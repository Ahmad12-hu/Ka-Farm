// KA-FARM - Modèle Transaction Financière
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  fermeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ferme',
    required: true
  },
  type_transaction: {
    type: String,
    enum: ['revenu', 'depense'],
    required: true
  },
  categorie: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  montant_fcfa: {
    type: Number,
    required: true
  },
  date_transaction: {
    type: Date,
    required: true
  },
  mode_paiement: {
    type: String,
    enum: ['especes', 'mobile_money', 'virement', 'cheque', 'autre'],
    default: 'especes'
  },
  reference: {
    type: String,
    default: ''
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
transactionSchema.index({ fermeId: 1 });
transactionSchema.index({ type_transaction: 1 });
transactionSchema.index({ date_transaction: 1 });
transactionSchema.index({ categorie: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
