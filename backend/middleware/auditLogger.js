// middleware/auditLogger.js - Enregistrement automatique des actions Qualiopi
const AuditLog = require('../models/AuditLog');

const auditLogger = (action, ressource) => {
  return async (req, res, next) => {
    try {
      await AuditLog.create({
        userId: req.user._id,
        tenantId: req.tenantId,
        action,
        ressource,
        ressourceId: req.params.id,
        ip: req.ip,
        details: req.body
      });
    } catch (error) {
      console.error('Erreur audit log:', error);
    }
    next();
  };
};

module.exports = auditLogger;