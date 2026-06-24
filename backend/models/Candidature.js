// models/Candidature.js - Candidature d'un futur ÉTUDIANT
const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true },
    telephone: String,
    formation: { type: String, required: true },
    cv: String,
    lettreMotivation: String,
    statut: {
      type: String,
      enum: ['nouvelle', 'en_revision', 'acceptee', 'refusee'],
      default: 'nouvelle'
    },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    commentaireAdmin: String
  },
  { timestamps: true }
);

// Index pour recherches rapides par tenant + email
candidatureSchema.index({ tenantId: 1, email: 1 });

module.exports = mongoose.model('Candidature', candidatureSchema);