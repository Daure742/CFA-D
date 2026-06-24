const Cohorte = require('../models/Cohorte');

exports.getWaitlist = async (req, res, next) => {
  try {
    const { cohorteId } = req.params;
    const cohorte = await Cohorte.findById(cohorteId).select('nom waitlist');
    if (!cohorte) return res.status(404).json({ message: 'Cohorte introuvable' });
    res.json({ id: cohorte._id, nom: cohorte.nom, waitlist: cohorte.waitlist || [] });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWaitlist = async (req, res, next) => {
  try {
    const { cohorteId, entryId } = req.params;
    const cohorte = await Cohorte.findById(cohorteId);
    if (!cohorte) return res.status(404).json({ message: 'Cohorte introuvable' });
    cohorte.waitlist = (cohorte.waitlist || []).filter((w) => String(w._id) !== String(entryId));
    await cohorte.save();
    res.json({ message: 'Supprimé de la liste d attente' });
  } catch (err) {
    next(err);
  }
};

// Promote a waitlisted entry into the cohort: set user.status='active', add to etudiants and remove from waitlist
exports.promoteFromWaitlist = async (req, res, next) => {
  try {
    const { cohorteId, entryId } = req.params;
    const cohorte = await Cohorte.findById(cohorteId);
    if (!cohorte) return res.status(404).json({ message: 'Cohorte introuvable' });

    const entry = (cohorte.waitlist || []).find((w) => String(w._id) === String(entryId));
    if (!entry) return res.status(404).json({ message: 'Entrée de la liste d attente introuvable' });

    const User = require('../models/User');

    // Use a transaction to atomically promote user and update cohort
    const session = await Cohorte.startSession();
    session.startTransaction();
    try {
      const user = await User.findById(entry.etudiant).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      user.status = 'active';
      user.cohorte = cohorte._id;
      await user.save({ session });

      // reload cohort in session and update
      const coh = await Cohorte.findById(cohorteId).session(session);
      coh.etudiants = coh.etudiants || [];
      if (!coh.etudiants.some((id) => String(id) === String(user._id))) {
        coh.etudiants.push(user._id);
      }
      coh.waitlist = (coh.waitlist || []).filter((w) => String(w._id) !== String(entryId));
      await coh.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Utilisateur promu dans la cohorte', userId: user._id, cohorteId: coh._id });
    } catch (errTx) {
      await session.abortTransaction();
      session.endSession();
      throw errTx;
    }
  } catch (err) {
    next(err);
  }
};
