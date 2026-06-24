// models/Cours.js - Séance de cours planifiée (live / replay)
const mongoose = require('mongoose');

const coursSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    description: String,
    matiere: String,

    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    lienVisio: String,
    salle: String,
    modalite: {
      type: String,
      enum: ['presentiel', 'distanciel', 'hybride'],
      default: 'distanciel'
    },
    formateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cohorte: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohorte', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    visibleEtudiant: { type: Boolean, default: false },
    publieLe: Date,
    publiePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statut: {
      type: String,
      enum: ['planifié', 'en_cours', 'terminé', 'annulé'],
      default: 'planifié'
    },
    demarreLe: Date,
    termineLe: Date,
    // Enregistrement (replay)
    replayUrl: String,
    replayExpireAt: Date,
    // Émargement double
    emargementEtudiant: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    emargementFormateur: { type: Boolean, default: false }
  },
  { timestamps: true }
);

coursSchema.index({ tenantId: 1, cohorte: 1, dateDebut: 1 });
coursSchema.index({ formateur: 1, statut: 1 });
// Index to help find expired replays for cleanup
coursSchema.index({ replayExpireAt: 1 });

module.exports = mongoose.model('Cours', coursSchema);
