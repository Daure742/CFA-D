// models/Rendu.js - Rendu de devoir par un ÉTUDIANT
const mongoose = require('mongoose');

const renduSchema = new mongoose.Schema(
  {
    devoir: { type: mongoose.Schema.Types.ObjectId, ref: 'Devoir', required: true },
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    fichiers: [{ url: String, nom: String }], // rendu de l'étudiant
    commentaire: String,
    dateRendu: { type: Date, default: Date.now },
    // Correction
    note: { type: Number, min: 0, max: 20 },
    commentaireCorrection: String,
    fichierCorrige: [{ url: String, nom: String }],
    corrigePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateCorrection: Date,
    // Statut pour l'étudiant
    statut: {
      type: String,
      enum: ['à faire', 'rendu', 'corrigé', 'en retard'],
      default: 'à faire'
    }
  },
  { timestamps: true }
);

renduSchema.index({ etudiant: 1, devoir: 1 }, { unique: true });
renduSchema.index({ devoir: 1, statut: 1 });

module.exports = mongoose.model('Rendu', renduSchema);