// models/CFA.js - Centre de Formation d'Apprentis (tenant)
const mongoose = require('mongoose');

const cfaSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    adresse: String,
    telephone: String,
    email: String,
    siret: { type: String, required: true, unique: true },
    logo: String,
    parametres: {
      modeInscription: { type: String, enum: ['ouverte', 'surValidation'], default: 'surValidation' },
      delaiAnnulationCours: Number, // en heures
      nbMaxEtudiantsParCohorte: Number,
      modulesActifs: [{ type: String }]
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CFA', cfaSchema);