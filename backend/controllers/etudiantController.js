// controllers/etudiantController.js - Fonctionnalités ÉTUDIANT
const User = require('../models/User');
const Cohorte = require('../models/Cohorte');
const Devoir = require('../models/Devoir');
const Rendu = require('../models/Rendu');
const Document = require('../models/Document');
const Note = require('../models/Note');
const Presence = require('../models/Presence');
const Cours = require('../models/Cours');
const Bulletin = require('../models/Bulletin');
const Schedule = require('../models/Schedule');
// Dashboard données de l'étudiant
exports.getDashboard = async (req, res, next) => {
  try {
    const etudiant = req.user;
    // Prochains cours
    const prochainsCours = await Cours.find({
      cohorte: etudiant.cohorte,
      tenantId: req.tenantId,
      visibleEtudiant: true,
      dateDebut: { $gte: new Date() }
    }).sort('dateDebut').limit(5);
    // Devoirs à faire
    const devoirs = await Devoir.find({
      cohorte: etudiant.cohorte,
      dateLimite: { $gte: new Date() }
    }).sort('dateLimite');
    // Dernières notes
    const notes = await Note.find({ etudiant: etudiant._id }).sort('-createdAt').limit(5);
    // Taux de présence
    const totalCours = await Cours.countDocuments({
      cohorte: etudiant.cohorte,
      tenantId: req.tenantId,
      visibleEtudiant: true,
      statut: 'terminé'
    });
    const presences = await Presence.find({ etudiant: etudiant._id, statut: 'présent' });
    const tauxPresence = totalCours ? (presences.length / totalCours) * 100 : 100;

    res.json({ prochainsCours, devoirs, notes, tauxPresence });
  } catch (error) {
    next(error);
  }
};

// Agenda (cours de la semaine)
exports.getAgenda = async (req, res, next) => {
  try {
    const { debut, fin } = req.query; // dates ISO
    const query = {
      cohorte: req.user.cohorte,
      tenantId: req.tenantId,
      visibleEtudiant: true
    };

    if (debut && fin) {
      query.dateDebut = { $gte: new Date(debut), $lte: new Date(fin) };
    }

    const cours = await Cours.find(query)
      .populate('formateur', 'nom prenom')
      .populate('cohorte', 'nom formation dateDebut dateFin planningPublie')
      .sort('dateDebut');
    res.json(cours);
  } catch (error) {
    next(error);
  }
};

// Emploi du temps simplifié
exports.getEmploiDuTemps = async (req, res, next) => {
  try {
    const debutSemaine = new Date();
    debutSemaine.setHours(0, 0, 0, 0);
    debutSemaine.setDate(debutSemaine.getDate() - debutSemaine.getDay() + 1);
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6);
    const cours = await Cours.find({
      cohorte: req.user.cohorte,
      tenantId: req.tenantId,
      visibleEtudiant: true,
      dateDebut: { $gte: debutSemaine, $lte: finSemaine }
    })
      .populate('formateur', 'nom prenom')
      .populate('cohorte', 'nom formation dateDebut dateFin planningPublie')
      .sort('dateDebut');
    res.json(cours);
  } catch (error) {
    next(error);
  }
};
