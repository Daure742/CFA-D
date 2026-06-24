// middleware/authMiddleware.js - Vérification du JWT access token
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant, accès non autorisé' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-motDePasse');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Utilisateur non trouvé ou désactivé' });
    }
    req.user = user;
    req.tenantId = user.tenantId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = authMiddleware;