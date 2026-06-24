// controllers/devoirController.js - Devoirs et rendus
const Devoir = require('../models/Devoir');
const Rendu = require('../models/Rendu');
const Notification = require('../models/Notification');

// Lister les devoirs de l'etudiant connecte avec son rendu eventuel
exports.getMesDevoirs = async (req, res, next) => {
  try {
    const devoirs = await Devoir.find({
      tenantId: req.tenantId,
      cohorte: req.user.cohorte,
      statut: 'actif'
    })
      .populate('formateur', 'nom prenom')
      .sort({ dateLimite: 1 });

    const rendus = await Rendu.find({
      tenantId: req.tenantId,
      etudiant: req.user._id,
      devoir: { $in: devoirs.map((devoir) => devoir._id) }
    });

    const rendusByDevoir = new Map(rendus.map((rendu) => [rendu.devoir.toString(), rendu]));

    res.json(
      devoirs.map((devoir) => {
        const rendu = rendusByDevoir.get(devoir._id.toString());
        const isLate = !rendu && devoir.dateLimite < new Date();

        return {
          ...devoir.toObject(),
          rendu: rendu || null,
          statutEtudiant: rendu?.statut || (isLate ? 'en retard' : 'à faire')
        };
      })
    );
  } catch (error) {
    next(error);
  }
};

// Créer un devoir (formateur)
exports.createDevoir = async (req, res, next) => {
  try {
    const devoir = await Devoir.create({
      ...req.body,
      formateur: req.user._id,
      tenantId: req.tenantId
    });
    // Notifier les étudiants de la cohorte
    res.status(201).json(devoir);
  } catch (error) {
    next(error);
  }
};

// Rendre un devoir (étudiant)
exports.rendreDevoir = async (req, res, next) => {
  try {
    const { devoirId } = req.params;
    const { fichiers } = req.body;
    const devoir = await Devoir.findById(devoirId);
    if (!devoir) return res.status(404).json({ message: 'Devoir non trouvé' });

    const rendu = await Rendu.findOneAndUpdate(
      { tenantId: req.tenantId, devoir: devoirId, etudiant: req.user._id },
      {
        tenantId: req.tenantId,
        devoir: devoirId,
        etudiant: req.user._id,
        fichiers,
        dateRendu: new Date(),
        statut: devoir.dateLimite < new Date() ? 'en retard' : 'rendu'
      },
      { upsert: true, new: true }
    );
    res.json(rendu);
  } catch (error) {
    next(error);
  }
};

// Corriger un devoir (formateur)
exports.corrigerDevoir = async (req, res, next) => {
  try {
    const { renduId } = req.params;
    const { note, commentaire, fichierCorrige } = req.body;
    const rendu = await Rendu.findById(renduId).populate('devoir');
    if (!rendu || rendu.devoir.formateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    rendu.note = note;
    rendu.commentaireCorrection = commentaire;
    rendu.fichierCorrige = fichierCorrige;
    rendu.statut = 'corrigé';
    rendu.dateCorrection = new Date();
    await rendu.save();
    res.json(rendu);
  } catch (error) {
    next(error);
  }
};

// Lister les devoirs pour le formateur avec leurs rendus
exports.getDevoirsForFormateur = async (req, res, next) => {
  try {
    const devoirs = await Devoir.find({ tenantId: req.tenantId, formateur: req.user._id }).sort({ dateLimite: 1 });
    const rendus = await Rendu.find({ tenantId: req.tenantId, devoir: { $in: devoirs.map((d) => d._id) } })
      .populate('etudiant', 'nom prenom email')
      .populate('devoir', 'titre dateLimite');

    res.json({ devoirs, rendus });
  } catch (error) {
    next(error);
  }
};
