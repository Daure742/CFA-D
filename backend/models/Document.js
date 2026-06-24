// models/Document.js - Document interne ou personnel (drive)
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    type: {
      type: String,
      enum: ['reglement', 'charte', 'procedure', 'attestation', 'certificat', 'bulletin', 'personnel', 'cours'],
      required: true
    },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    url: { type: String, required: true },
    version: { type: Number, default: 1 },
    // Pour qui
    destinataire: {
      type: String,
      enum: ['tous', 'etudiant', 'formateur', 'cohorte'],
      default: 'tous'
    },
    cohorte: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohorte' },
    // Formateur ayant partagé le document (pour les documents de cours)
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Cours associé (optionnel, pour lier un document à un cours précis)
    cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' },
    // Acceptation obligatoire (pour les documents CFA)
    acceptationRequise: { type: Boolean, default: false },
    acceptations: [{
      etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      dateAcceptation: { type: Date, default: Date.now },
      ip: String
    }],
    // Archivage
    archive: { type: Boolean, default: false },
    dateArchivage: Date
  },
  { timestamps: true }
);

documentSchema.index({ tenantId: 1, type: 1 });

module.exports = mongoose.model('Document', documentSchema);