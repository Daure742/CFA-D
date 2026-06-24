// models/Bulletin.js - Bulletin de notes semestriel/annuel
const mongoose = require('mongoose');

const bulletinSchema = new mongoose.Schema(
  {
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cohorte: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohorte', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    periode: { type: String, required: true },
    moyennes: [{
      matiere: String,
      moyenne: Number,
      coefficient: Number,
      appréciation: String
    }],
    moyenneGenerale: Number,
    decision: { type: String, enum: ['admis', 'ajourné', 'exclu'] },
    fichierPDF: String,
    generePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateGeneration: Date
  },
  { timestamps: true }
);

bulletinSchema.index({ etudiant: 1, periode: 1, cohorte: 1 });

module.exports = mongoose.model('Bulletin', bulletinSchema);