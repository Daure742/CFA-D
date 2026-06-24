// models/Message.js - Messagerie interne (classe ou privé)
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    expediteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cohorte: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohorte' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    contenu: { type: String, required: true },
    type: {
      type: String,
      enum: ['classe', 'prive'],
      required: true
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    archivedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lu: { type: Boolean, default: false }
  },
  { timestamps: true }
);

messageSchema.index({ cohorte: 1, createdAt: -1 });
messageSchema.index({ destinataire: 1, lu: 1 });

module.exports = mongoose.model('Message', messageSchema);
