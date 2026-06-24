// controllers/formateurController.js - Espace FORMATEUR
const mongoose = require('mongoose');
const Cohorte = require('../models/Cohorte');
const Cours = require('../models/Cours');
const Devoir = require('../models/Devoir');
const Rendu = require('../models/Rendu');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
  try {
    const formateurId = req.user._id;
    const prochainsCours = await Cours.find({
      formateur: formateurId,
      dateDebut: { $gte: new Date() }
    }).sort('dateDebut').limit(5);
    const devoirsEnAttente = await Rendu.countDocuments({ statut: 'rendu', devoir: { $in: await Devoir.find({ formateur: formateurId }).select('_id') } });
    const cohortes = await Cohorte.find({ tenantId: req.tenantId, formateurs: formateurId }).populate('etudiants', 'nom prenom email');

    res.json({ prochainsCours, devoirsEnAttente, cohortes });
  } catch (error) {
    next(error);
  }
};

exports.getMesCohortes = async (req, res, next) => {
  try {
    const cohortes = await Cohorte.find({ tenantId: req.tenantId, formateurs: req.user._id }).populate('etudiants', 'nom prenom email');
    res.json(cohortes);
  } catch (error) {
    next(error);
  }
};

exports.getMesCours = async (req, res, next) => {
  try {
    const cours = await Cours.find({ formateur: req.user._id, tenantId: req.tenantId })
      .populate('cohorte', 'nom formation')
      .sort({ dateDebut: -1 })
      .limit(80);
    res.json(cours);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { nom, prenom, matieres, sessionIds } = req.body;
    const formateur = await User.findById(req.user._id);
    if (!formateur) {
      return res.status(404).json({ message: 'Formateur introuvable' });
    }

    if (nom) formateur.nom = nom;
    if (prenom) formateur.prenom = prenom;
    if (matieres !== undefined) {
      formateur.matieres = Array.isArray(matieres)
        ? matieres.map((item) => String(item).trim()).filter(Boolean)
        : String(matieres || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (Array.isArray(sessionIds)) {
      const validSessionIds = Array.from(new Set(sessionIds)).filter((id) => mongoose.Types.ObjectId.isValid(id));

      await Cohorte.updateMany(
        { formateurs: formateur._id, tenantId: req.tenantId },
        { $pull: { formateurs: formateur._id } }
      );

      if (validSessionIds.length > 0) {
        await Cohorte.updateMany(
          { _id: { $in: validSessionIds }, tenantId: req.tenantId },
          { $addToSet: { formateurs: formateur._id } }
        );
        formateur.cohorte = validSessionIds[0];
      }
    }

    await formateur.save();

    res.json({
      message: 'Profil formateur mis à jour',
      user: {
        id: formateur._id,
        nom: formateur.nom,
        prenom: formateur.prenom,
        email: formateur.email,
        role: formateur.role,
        tenantId: formateur.tenantId,
        matieres: formateur.matieres,
        cohorte: formateur.cohorte
      }
    });
  } catch (error) {
    next(error);
  }
};
