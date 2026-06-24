// controllers/coursController.js - Gestion des cours live et replays
const Cours = require('../models/Cours');
const Presence = require('../models/Presence');
const Cohorte = require('../models/Cohorte');
const Notification = require('../models/Notification');
let google;
try {
  google = require('googleapis').google;
} catch (e) {
  // googleapis optional
}

const canManageCours = (req, cours) =>
  req.user.role === 'admin' || String(cours.formateur) === String(req.user._id);

// Créer un cours (formateur ou admin)
exports.createCours = async (req, res, next) => {
  try {
    const cours = await Cours.create({
      ...req.body,
      formateur: req.body.formateur || req.user._id,
      tenantId: req.tenantId
    });
    res.status(201).json(cours);
  } catch (error) {
    next(error);
  }
};

// Récupérer tous les cours d'une cohorte
exports.getCoursByCohorte = async (req, res, next) => {
  try {
    const { cohorteId } = req.params;
    const cours = await Cours.find({ cohorte: cohorteId, tenantId: req.tenantId })
      .populate('formateur', 'nom prenom')
      .sort({ dateDebut: 1 });
    res.json(cours);
  } catch (error) {
    next(error);
  }
};

// Émarger un étudiant à un cours
exports.emarger = async (req, res, next) => {
  try {
    const { coursId } = req.params;
    const etudiantId = req.user._id; // l'étudiant lui-même
    // Vérifier que l'étudiant appartient bien à la cohorte
    const cours = await Cours.findOne({ _id: coursId, tenantId: req.tenantId }).populate('cohorte');
    const isInCohorte = cours?.cohorte?.etudiants?.some((id) => String(id) === String(etudiantId));
    if (!cours || !isInCohorte) {
      return res.status(403).json({ message: 'Vous ne faites pas partie de ce cours' });
    }
    // Double validation : on enregistre la présence
    const presence = await Presence.findOneAndUpdate(
      { cours: coursId, etudiant: etudiantId },
      {
        $setOnInsert: { tenantId: req.tenantId, heureDebut: new Date() },
        $set: { valideEtudiant: true, statut: 'présent' }
      },
      { upsert: true, new: true }
    );
    await Cours.updateOne(
      { _id: coursId, tenantId: req.tenantId },
      { $addToSet: { emargementEtudiant: etudiantId } }
    );
    res.json(presence);
  } catch (error) {
    next(error);
  }
};

// Validation formateur de l'émargement
exports.validerEmargement = async (req, res, next) => {
  try {
    const { coursId } = req.params;
    const cours = await Cours.findOne({ _id: coursId, tenantId: req.tenantId });
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    if (!canManageCours(req, cours)) {
      return res.status(403).json({ message: 'Seul le formateur assigné peut valider' });
    }
    cours.emargementFormateur = true;
    await cours.save();
    // Mettre à jour toutes les présences validées
    await Presence.updateMany(
      { cours: coursId, valideEtudiant: true },
      { valideFormateur: true, dateValidation: new Date() }
    );
    res.json({ message: 'Émargement validé' });
  } catch (error) {
    next(error);
  }
};

exports.lancerCours = async (req, res, next) => {
  try {
    const cours = await Cours.findOne({ _id: req.params.coursId, tenantId: req.tenantId });
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    if (!canManageCours(req, cours)) {
      return res.status(403).json({ message: 'Seul le formateur assigné peut lancer ce cours' });
    }

    // set basic status
    cours.statut = 'en_cours';
    cours.demarreLe = new Date();

    // Attempt to generate a Google Meet link if service account is configured
    try {
      let meetLink = cours.lienVisio;
      const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const calendarId = process.env.GOOGLE_CALENDAR_ID;

      if (!meetLink) {
        if (google && saJson && calendarId) {
          try {
            const serviceAccount = JSON.parse(saJson);
            const jwtClient = new google.auth.JWT(
              serviceAccount.client_email,
              null,
              serviceAccount.private_key,
              ['https://www.googleapis.com/auth/calendar']
            );
            await jwtClient.authorize();
            const calendar = google.calendar({ version: 'v3', auth: jwtClient });
            const start = new Date();
            const end = new Date(start.getTime() + (60 * 60 * 1000));
            const event = {
              summary: cours.titre || 'Session CFA',
              description: cours.description || '',
              start: { dateTime: start.toISOString() },
              end: { dateTime: end.toISOString() },
              conferenceData: { createRequest: { requestId: `meet-${cours._id}-${Date.now()}` } }
            };
            const created = await calendar.events.insert({ calendarId, resource: event, conferenceDataVersion: 1 });
            meetLink = created.data?.hangoutLink || created.data?.conferenceData?.entryPoints?.[0]?.uri;
          } catch (err) {
            console.error('Google Calendar Meet creation failed', err.message || err);
          }
        }

        // Fallback to Jitsi Meet public instance if no Google Meet
        if (!meetLink) {
          const safe = encodeURIComponent(`${cours._id}-${Date.now()}`);
          meetLink = `https://meet.jit.si/${safe}`;
        }

        cours.lienVisio = meetLink;
      }
    } catch (err) {
      console.error('Erreur génération lien visio', err);
    }

    await cours.save();

    // Notify students of the cohort that the session is live and provide the link
    try {
      if (cours.cohorte) {
        const coh = await Cohorte.findById(cours.cohorte).lean();
        if (coh && Array.isArray(coh.etudiants) && coh.etudiants.length > 0) {
          const notifications = coh.etudiants.map((studId) => ({
            destinataire: studId,
            tenantId: req.tenantId,
            titre: `Cours en direct: ${cours.titre}`,
            message: `La session "${cours.titre}" vient de démarrer. Rejoindre: ${cours.lienVisio}`,
            type: 'cours',
            lien: `/cours/${cours._id}`
          }));
          await Notification.insertMany(notifications);

          // Emit real-time socket event to cohort room and cours room
          try {
            const io = require('../socket/io').getIo();
            if (io) {
              io.to(`cohorte_${cours.cohorte}`).emit('cours-live-start', {
                coursId: cours._id,
                titre: cours.titre,
                lien: cours.lienVisio
              });
              io.to(`cours_${cours._id}`).emit('cours-live-start', {
                coursId: cours._id,
                titre: cours.titre,
                lien: cours.lienVisio
              });
            }
          } catch (err) {
            console.error('Erreur emission socket cours-live-start', err);
          }
        }
      }
    } catch (err) {
      console.error('Erreur notification étudiants', err);
    }

    res.json(cours);
  } catch (error) {
    next(error);
  }
};

exports.terminerCours = async (req, res, next) => {
  try {
    const cours = await Cours.findOne({ _id: req.params.coursId, tenantId: req.tenantId });
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    if (!canManageCours(req, cours)) {
      return res.status(403).json({ message: 'Seul le formateur assigné peut terminer ce cours' });
    }

    cours.statut = 'terminé';
    cours.termineLe = new Date();
    if (req.body.replayUrl) cours.replayUrl = req.body.replayUrl;
    await cours.save();

    const fin = new Date();
    const presences = await Presence.find({ cours: cours._id, tenantId: req.tenantId, heureFin: { $exists: false } });
    if (presences.length > 0) {
      await Presence.bulkWrite(presences.map((presence) => ({
        updateOne: {
          filter: { _id: presence._id },
          update: {
            heureFin: fin,
            dureeMinutes: presence.heureDebut
              ? Math.max(0, Math.round((fin.getTime() - presence.heureDebut.getTime()) / 60000))
              : 0
          }
        }
      })));
    }

    res.json(cours);
  } catch (error) {
    next(error);
  }
};

// Publier/mettre à jour le lien replay d'un cours (sans terminer)
exports.publishReplay = async (req, res, next) => {
  try {
    const cours = await Cours.findOne({ _id: req.params.coursId, tenantId: req.tenantId });
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    if (!canManageCours(req, cours)) {
      return res.status(403).json({ message: 'Seul le formateur assigné peut publier le replay' });
    }

    const { replayUrl } = req.body;
    if (!replayUrl || !replayUrl.trim()) {
      return res.status(400).json({ message: 'Le lien replay est requis' });
    }

    cours.replayUrl = replayUrl.trim();
    await cours.save();

    res.json({ message: 'Replay publié avec succès', cours });
  } catch (error) {
    next(error);
  }
};
