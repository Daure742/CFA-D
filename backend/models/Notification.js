// models/Notification.js - Notification in-app
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    titre: { type: String, required: true },
    message: String,
    type: {
      type: String,
      enum: ['devoir', 'cours', 'absence', 'message', 'administratif', 'alerte']
    },
    lu: { type: Boolean, default: false },
    lien: String // route éventuelle
  },
  { timestamps: true }
);

notificationSchema.index({ destinataire: 1, lu: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);