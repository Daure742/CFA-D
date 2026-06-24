const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Cours = require('../models/Cours');
const Presence = require('../models/Presence');
const generatePDF = require('../utils/generatePDF');

router.use(authMiddleware, tenantMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const query = req.user.role === 'etudiant' ? { etudiant: req.user._id } : { tenantId: req.tenantId };
    const presences = await Presence.find(query)
      .populate('etudiant', 'nom prenom email')
      .populate('cours', 'titre dateDebut dateFin')
      .sort('-createdAt');
    res.json(presences);
  } catch (error) {
    next(error);
  }
});

router.get('/cours/:coursId', roleMiddleware('admin', 'formateur'), async (req, res, next) => {
  try {
    const cours = await Cours.findOne({ _id: req.params.coursId, tenantId: req.tenantId });
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    if (req.user.role === 'formateur' && String(cours.formateur) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Accès interdit à cette feuille de présence' });
    }

    const presences = await Presence.find({ cours: cours._id, tenantId: req.tenantId })
      .populate('etudiant', 'nom prenom email')
      .populate('cours', 'titre dateDebut dateFin')
      .sort('createdAt');

    res.json(presences);
  } catch (error) {
    next(error);
  }
});

router.get('/cours/:coursId/feuille.pdf', roleMiddleware('admin', 'formateur'), async (req, res, next) => {
  try {
    const cours = await Cours.findOne({ _id: req.params.coursId, tenantId: req.tenantId })
      .populate('formateur', 'nom prenom email');
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    if (req.user.role === 'formateur' && String(cours.formateur._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Accès interdit à cette feuille de présence' });
    }

    const presences = await Presence.find({ cours: cours._id, tenantId: req.tenantId })
      .populate('etudiant', 'nom prenom email')
      .sort('createdAt');
    const pdf = await generatePDF.feuillePresence({ cours, presences });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="feuille-presence-${cours._id}.pdf"`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

router.get('/:presenceId/attestation.pdf', async (req, res, next) => {
  try {
    const query = { _id: req.params.presenceId, tenantId: req.tenantId };
    if (req.user.role === 'etudiant') query.etudiant = req.user._id;

    const presence = await Presence.findOne(query)
      .populate('etudiant', 'nom prenom email')
      .populate({
        path: 'cours',
        select: 'titre dateDebut dateFin formateur tenantId',
        populate: { path: 'formateur', select: 'nom prenom email' }
      });
    if (!presence) return res.status(404).json({ message: 'Présence introuvable' });
    if (!presence.valideFormateur) {
      return res.status(400).json({ message: 'Attestation disponible après validation formateur' });
    }

    const pdf = await generatePDF.attestationPresence({ presence });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="attestation-presence-${presence._id}.pdf"`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

// Mettre à jour une présence (validation individuelle par formateur/admin)
router.patch('/:presenceId', roleMiddleware('formateur', 'admin'), async (req, res, next) => {
  try {
    const { presenceId } = req.params;
    const update = {};
    if (req.body.valideFormateur !== undefined) update.valideFormateur = Boolean(req.body.valideFormateur);
    if (req.body.statut) update.statut = req.body.statut;
    if (req.body.heureFin) update.heureFin = req.body.heureFin;
    if (req.body.heureDebut) update.heureDebut = req.body.heureDebut;

    const presence = await Presence.findOneAndUpdate({ _id: presenceId, tenantId: req.tenantId }, { $set: update }, { new: true });
    if (!presence) return res.status(404).json({ message: 'Présence introuvable' });
    // If validated by formateur, set dateValidation
    if (update.valideFormateur) {
      presence.dateValidation = new Date();
      await presence.save();
    }
    res.json(presence);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
