// models/Presence.js - Suivi de présence des ÉTUDIANTS aux cours
const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema(
  {
    cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours', required: true },
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    heureDebut: Date,
    heureFin: Date,
    dureeMinutes: Number,
    statut: {
      type: String,
      enum: ['présent', 'absent', 'retard', 'excusé'],
      default: 'absent'
    },
    // Double validation
    valideEtudiant: { type: Boolean, default: false },
    valideFormateur: { type: Boolean, default: false },
    dateValidation: Date,
    meta: {
      socketId: String,
      ip: String,
      userAgent: String
    }
  },
  { timestamps: true }
);

presenceSchema.index({ etudiant: 1, cours: 1 }, { unique: true });
presenceSchema.index({ tenantId: 1, cours: 1 });

module.exports = mongoose.model('Presence', presenceSchema);
