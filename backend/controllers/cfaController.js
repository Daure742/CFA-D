const CFA = require('../models/CFA');
const User = require('../models/User');

// GET /api/cfas/annuaire
exports.getAnnuaire = async (req, res, next) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }
    const tenantId = req.user.tenantId;
    const users = await User.find({
      tenantId,
      role: { $in: ['etudiant', 'formateur'] },
      isActive: true,
      isDeleted: { $ne: true }
    })
    .select('nom prenom email role formationChoisie matieres cohorte')
    .populate('cohorte', 'nom formation')
    .sort('nom prenom');
    
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/cfas?q=search
exports.searchCfas = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const query = { isActive: true };
    if (q) {
      // search by name or partial match
      query.nom = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }
    const cfases = await CFA.find(query).select('nom contactEmail adresse').limit(50).sort('nom');
    res.json(cfases.map((c) => ({ id: c._id, nom: c.nom, contactEmail: c.contactEmail, adresse: c.adresse })));
  } catch (err) {
    next(err);
  }
};

// GET /api/cfas/:id
exports.getById = async (req, res, next) => {
  try {
    const cfa = await CFA.findById(req.params.id).select('nom contactEmail adresse');
    if (!cfa) return res.status(404).json({ message: 'CFA introuvable' });
    res.json({ id: cfa._id, nom: cfa.nom, contactEmail: cfa.contactEmail, adresse: cfa.adresse });
  } catch (err) {
    next(err);
  }
};
