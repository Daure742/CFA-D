// controllers/noteController.js - Carnet de notes
const Note = require('../models/Note');
const Bulletin = require('../models/Bulletin');
const calcMoyenne = require('../utils/calcMoyenne');

// Ajouter/modifier une note
exports.upsertNote = async (req, res, next) => {
  try {
    const { etudiantId, matiere, valeur, coefficient, periode } = req.body;
    const note = await Note.findOneAndUpdate(
      { etudiant: etudiantId, matiere, periode, cohorte: req.body.cohorte },
      { valeur, coefficient, formateur: req.user._id, tenantId: req.tenantId },
      { upsert: true, new: true }
    );
    res.json(note);
  } catch (error) {
    next(error);
  }
};

// Récupérer les notes d'un étudiant
exports.getNotesEtudiant = async (req, res, next) => {
  try {
    const notes = await Note.find({ etudiant: req.user._id, tenantId: req.tenantId }).sort({ dateEvaluation: -1, createdAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

exports.getBulletinsEtudiant = async (req, res, next) => {
  try {
    const bulletins = await Bulletin.find({
      etudiant: req.user._id,
      tenantId: req.tenantId
    }).sort({ createdAt: -1 });

    res.json(bulletins);
  } catch (error) {
    next(error);
  }
};

// Générer un bulletin (admin/formateur)
exports.generateBulletin = async (req, res, next) => {
  try {
    const { etudiantId, cohorteId, periode } = req.body;
    const notes = await Note.find({ etudiant: etudiantId, periode, cohorte: cohorteId });
    const moyennes = calcMoyenne(notes); // retourne [{matiere, moyenne, coefficient}]
    const moyenneGenerale = moyennes.length ? moyennes.reduce((acc, m) => acc + m.moyenne * m.coefficient, 0) / moyennes.reduce((acc, m) => acc + m.coefficient, 0) : 0;
    const bulletin = await Bulletin.create({
      etudiant: etudiantId,
      cohorte: cohorteId,
      tenantId: req.tenantId,
      periode,
      moyennes,
      moyenneGenerale,
      decision: moyenneGenerale >= 10 ? 'admis' : 'ajourné',
      generePar: req.user._id,
      dateGeneration: new Date()
    });
    // Générer le PDF via Puppeteer (appel asynchrone)
    // generatePDF.bulletin(bulletin); // à implémenter
    res.status(201).json(bulletin);
  } catch (error) {
    next(error);
  }
};
