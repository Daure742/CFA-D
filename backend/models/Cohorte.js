// models/Cohorte.js - Classe / promotion regroupant des ÉTUDIANTS et FORMATEURS
const mongoose = require('mongoose');

const cohorteSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true }, // ex : "Développement Web - Mars 2026"
    formation: { type: String, required: true },
    annee: { type: Number, required: true },
    dateDebut: Date,
    dateFin: Date,
    capacite: { type: Number, default: 50, min: 1 },
    statut: {
      type: String,
      enum: ['brouillon', 'ouverte', 'complete', 'terminee', 'archivee'],
      default: 'ouverte'
    },
    planningPublie: { type: Boolean, default: false },
    planningPublieLe: Date,
    planningPubliePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    etudiants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    formateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Liste d'attente: entries when la cohorte est pleine
    waitlist: [
      {
        etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        nom: String,
        prenom: String,
        email: String,
        date: { type: Date, default: Date.now }
      }
    ],
    // Planning des cours associé (sera lié via le modèle Cours)
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  },
  { timestamps: true }
);

cohorteSchema.index({ tenantId: 1, nom: 1 }, { unique: true });
cohorteSchema.index({ tenantId: 1, isActive: 1 });
cohorteSchema.index({ tenantId: 1, formation: 1, statut: 1 });

module.exports = mongoose.model('Cohorte', cohorteSchema);
