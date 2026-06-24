// models/Note.js - Note individuelle pour un ÉTUDIANT dans une matière
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    formateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matiere: { type: String, required: true },
    cohorte: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohorte', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    valeur: { type: Number, required: true, min: 0, max: 20 },
    coefficient: { type: Number, default: 1 },
    commentaire: String,
    periode: { type: String, enum: ['1er semestre', '2ème semestre', 'année'], required: true },
    dateEvaluation: Date
  },
  { timestamps: true }
);

noteSchema.index({ etudiant: 1, matiere: 1, periode: 1, cohorte: 1 });
noteSchema.index({ formateur: 1, cohorte: 1 });

module.exports = mongoose.model('Note', noteSchema);