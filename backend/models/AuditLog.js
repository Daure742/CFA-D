// models/AuditLog.js - Journal d'audit Qualiopi
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    action: { type: String, required: true }, // ex: 'CREATION_DEVOIR', 'CONSULTATION_BULLETIN'
    ressource: { type: String, required: true }, // modèle concerné
    ressourceId: mongoose.Schema.Types.ObjectId,
    ip: String,
    details: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

auditLogSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);