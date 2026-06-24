// middleware/tenantMiddleware.js - Injection du tenantId depuis le token
module.exports = (req, res, next) => {
  // Le tenantId est déjà extrait dans authMiddleware, on le réinjecte dans les query
  req.query.tenantId = req.tenantId;
  next();
};