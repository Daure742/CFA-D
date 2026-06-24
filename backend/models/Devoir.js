// models/Devoir.js - Devoir publié par un FORMATEUR
const mongoose = require('mongoose');

const devoirSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    description: String,
    matiere: String,
    dateLimite: { type: Date, required: true },
    formateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cohorte: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohorte', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    fichiers: [{ url: String, nom: String }], // pièces jointes du formateur
    statut: {
      type: String,
      enum: ['actif', 'archivé'],
      default: 'actif'
    }
  },
  { timestamps: true }
);

devoirSchema.index({ tenantId: 1, cohorte: 1, dateLimite: 1 });
devoirSchema.index({ formateur: 1, statut: 1 });

module.exports = mongoose.model('Devoir', devoirSchema);