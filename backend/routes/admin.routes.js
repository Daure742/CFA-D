const router = require('express').Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const User = require('../models/User');
const Candidature = require('../models/Candidature');
const Cohorte = require('../models/Cohorte');
const Cours = require('../models/Cours');
const Notification = require('../models/Notification');
const Schedule = require('../models/Schedule');

router.use(authMiddleware, tenantMiddleware, roleMiddleware('admin', 'superadmin'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const [etudiants, formateurs, candidatures, cohortes] = await Promise.all([
      User.countDocuments({ tenantId: req.tenantId, role: 'etudiant' }),
      User.countDocuments({ tenantId: req.tenantId, role: 'formateur' }),
      Candidature.countDocuments({ tenantId: req.tenantId }),
      Cohorte.countDocuments({ tenantId: req.tenantId }),
    ]);

    res.json({ etudiants, formateurs, candidatures, cohortes });
  } catch (error) {
    next(error);
  }
});

router.get('/users/summary', async (req, res, next) => {
  try {
    const { role = 'etudiant', sessionId } = req.query;
    const query = { tenantId: req.tenantId, role, isDeleted: { $ne: true } };

    if (sessionId) {
      query.cohorte = sessionId;
    }

    const [inscrits, actifs, aVerifier] = await Promise.all([
      User.countDocuments(query),
      User.countDocuments({ ...query, status: 'active', isActive: true }),
      User.countDocuments({ ...query, status: 'pending' })
    ]);

    res.json({ inscrits, actifs, aVerifier });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { role = 'etudiant', status, sessionId, search, formation } = req.query;
    const query = { tenantId: req.tenantId, role, isDeleted: { $ne: true } };

    if (status === 'active') {
      query.status = 'active';
      query.isActive = true;
    } else if (status === 'pending') {
      query.status = 'pending';
    }

    if (sessionId) {
      query.cohorte = sessionId;
    }

    if (formation) {
      query.formationChoisie = formation;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ nom: regex }, { prenom: regex }, { email: regex }];
    }

    const users = await User.find(query)
      .select('nom prenom email role formationChoisie cohorte status isActive createdAt')
      .populate('cohorte', 'nom')
      .sort({ createdAt: -1 });

    res.json(users.map((user) => ({
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      formation: user.formationChoisie,
      cohorte: user.cohorte ? { id: user.cohorte._id, nom: user.cohorte.nom } : null,
      status: user.status,
      isActive: user.isActive,
      createdAt: user.createdAt
    })));
  } catch (error) {
    next(error);
  }
});

// Admin: block a user (prevent login/access to student area)
router.patch('/users/:userId/block', async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, tenantId: req.tenantId, role: 'etudiant', isDeleted: { $ne: true } },
      { isActive: false, status: 'blocked' },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    res.json({ message: 'Utilisateur bloqué', userId: user._id });
  } catch (error) {
    next(error);
  }
});

// Admin: unblock a user
router.patch('/users/:userId/unblock', async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, tenantId: req.tenantId, role: 'etudiant', isDeleted: { $ne: true } },
      { isActive: true, status: 'active' },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    res.json({ message: 'Utilisateur débloqué', userId: user._id });
  } catch (error) {
    next(error);
  }
});

// Admin: soft-delete a user (remove access and mark deleted)
router.delete('/users/:userId', async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, tenantId: req.tenantId, isDeleted: { $ne: true } },
      { isActive: false, isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable ou déjà supprimé' });

    res.json({ message: 'Utilisateur supprimé', userId: user._id });
  } catch (error) {
    next(error);
  }
});

router.get('/candidatures/summary', async (req, res, next) => {
  try {
    const { formation, sessionId } = req.query;
    const query = { tenantId: req.tenantId };

    if (formation) {
      query.formation = formation;
    }

    if (sessionId) {
      const session = await Cohorte.findOne({ _id: sessionId, tenantId: req.tenantId });
      if (session) {
        query.formation = session.formation;
      }
    }

    const [nouvelles, aCompleter, validees] = await Promise.all([
      Candidature.countDocuments({ ...query, statut: 'nouvelle' }),
      Candidature.countDocuments({ ...query, statut: 'en_revision' }),
      Candidature.countDocuments({ ...query, statut: 'acceptee' })
    ]);

    res.json({ nouvelles, aCompleter, validees });
  } catch (error) {
    next(error);
  }
});

router.get('/candidatures', async (req, res, next) => {
  try {
    const { statut, formation, search, sessionId } = req.query;
    const query = { tenantId: req.tenantId };

    if (statut) {
      query.statut = statut;
    }

    if (formation) {
      query.formation = formation;
    }

    if (sessionId) {
      const session = await Cohorte.findOne({ _id: sessionId, tenantId: req.tenantId });
      if (session) {
        query.formation = session.formation;
      }
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ nom: regex }, { prenom: regex }, { email: regex }];
    }

    const candidatures = await Candidature.find(query).sort('-createdAt');
    res.json(candidatures);
  } catch (error) {
    next(error);
  }
});

router.get('/formateurs', async (req, res, next) => {
  try {
    const { formation } = req.query;

    const baseQuery = { tenantId: req.tenantId, role: 'formateur', isActive: true };
    const formateurs = await User.find(baseQuery)
      .select('nom prenom email matieres cohorte isOnLeave')
      .sort({ nom: 1, prenom: 1 });

    // Build mapping of formateur -> sessions assigned by Superadmin
    const cohortesQuery = { tenantId: req.tenantId, isActive: true, isDeleted: false };
    if (formation) cohortesQuery.formation = formation;
    const cohortes = await Cohorte.find(cohortesQuery).select('_id formateurs');

    const formateurSessionMap = {};
    const cohorteIds = cohortes.map((c) => c._id);
    cohortes.forEach((c) => {
      const cohorteId = String(c._id);
      (c.formateurs || []).forEach((formateurId) => {
        const key = String(formateurId);
        if (!formateurSessionMap[key]) formateurSessionMap[key] = new Set();
        formateurSessionMap[key].add(cohorteId);
      });
    });

    const enriched = formateurs.map((f) => {
      const sessionIds = Array.from(
        new Set([
          ...(formateurSessionMap[String(f._id)] ? Array.from(formateurSessionMap[String(f._id)]) : []),
          ...(f.cohorte && cohorteIds.some((id) => String(id) === String(f.cohorte)) ? [String(f.cohorte)] : [])
        ])
      );

      return {
        _id: f._id,
        id: f._id,
        nom: f.nom,
        prenom: f.prenom,
        email: f.email,
        matieres: f.matieres,
        cohorte: f.cohorte,
        isOnLeave: f.isOnLeave,
        sessionIds,
        cours: []
      };
    });

    if (formation) {
      const teachersForFormation = enriched.filter((f) => f.sessionIds.length > 0);

      if (teachersForFormation.length > 0) {
        const coursList = await Cours.find({
          tenantId: req.tenantId,
          cohorte: { $in: cohorteIds },
          formateur: { $in: teachersForFormation.map((f) => f._id) }
        }).select('titre formateur');

        const coursesByFormateur = {};
        coursList.forEach((c) => {
          const key = String(c.formateur);
          coursesByFormateur[key] = coursesByFormateur[key] || [];
          if (c.titre && !coursesByFormateur[key].includes(c.titre)) coursesByFormateur[key].push(c.titre);
        });

        return res.json(
          teachersForFormation.map((f) => ({
            ...f,
            cours: coursesByFormateur[String(f._id)] || []
          }))
        );
      }

      return res.json(teachersForFormation);
    }

    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

// Superadmin-only: toggle congé/repos for a formateur
router.patch('/formateurs/:id/conge', roleMiddleware('superadmin'), async (req, res, next) => {
  try {
    const { isOnLeave } = req.body;
    const formateur = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, role: 'formateur' },
      { isOnLeave: !!isOnLeave },
      { new: true }
    );

    if (!formateur) return res.status(404).json({ message: 'Formateur introuvable' });

    res.json({ message: 'Statut congé mis à jour', userId: formateur._id, isOnLeave: formateur.isOnLeave });
  } catch (error) {
    next(error);
  }
});

// Superadmin-only: reset a formateur password and return a temporary password (for copy/paste by superadmin) or set a custom one
router.post('/formateurs/:id/reset-password', roleMiddleware('superadmin'), async (req, res, next) => {
  try {
    const { motDePasse } = req.body;
    const formateur = await User.findOne({ _id: req.params.id, tenantId: req.tenantId, role: 'formateur' });
    if (!formateur) return res.status(404).json({ message: 'Formateur introuvable' });

    let finalPassword = motDePasse;

    if (!finalPassword) {
      // generate a temporary password (10 chars)
      const generateTempPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
        let out = '';
        for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
        return out;
      };
      finalPassword = generateTempPassword();
    }

    formateur.motDePasse = finalPassword;
    await formateur.save();

    res.json({ message: 'Mot de passe réinitialisé', tempPassword: finalPassword, isCustom: !!motDePasse });
  } catch (error) {
    next(error);
  }
});

// Superadmin-only: soft-delete a formateur
router.delete('/formateurs/:id', roleMiddleware('superadmin'), async (req, res, next) => {
  try {
    const formateur = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, role: 'formateur', isDeleted: { $ne: true } },
      { isActive: false, isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!formateur) return res.status(404).json({ message: 'Formateur introuvable ou déjà supprimé' });

    res.json({ message: 'Formateur supprimé', userId: formateur._id });
  } catch (error) {
    next(error);
  }
});

router.post('/formateurs', async (req, res, next) => {
  try {
    const { nom, prenom, email, motDePasse, matieres, sessionIds = [] } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Les champs nom, prenom, email et mot de passe sont obligatoires.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail, tenantId: req.tenantId });
    if (existing) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé dans ce CFA.' });
    }

    const matiereArray = Array.isArray(matieres)
      ? matieres.map((item) => String(item).trim()).filter(Boolean)
      : String(matieres || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    const formateur = await User.create({
      nom,
      prenom,
      email: normalizedEmail,
      motDePasse,
      role: 'formateur',
      tenantId: req.tenantId,
      matieres: matiereArray,
      cohorte: Array.isArray(sessionIds) && sessionIds.length === 1 ? sessionIds[0] : undefined
    });

    const validSessionIds = Array.isArray(sessionIds)
      ? Array.from(new Set(sessionIds)).filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    if (validSessionIds.length > 0) {
      await Cohorte.updateMany(
        { _id: { $in: validSessionIds }, tenantId: req.tenantId },
        { $addToSet: { formateurs: formateur._id } }
      );
    }

    res.status(201).json({
      message: 'Formateur créé avec succès.',
      user: {
        id: formateur._id,
        nom: formateur.nom,
        prenom: formateur.prenom,
        email: formateur.email,
        role: formateur.role,
        matieres: formateur.matieres,
        cohorte: formateur.cohorte
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/sessions', async (req, res, next) => {
  try {
    const { formation, mois, annee, statut, status, search } = req.query;
    const query = { tenantId: req.tenantId };
    const expr = [];

    if (status === 'archived') {
      query.isActive = false;
      query.isDeleted = false;
      query.statut = 'archivee';
    } else if (status === 'deleted') {
      query.isDeleted = true;
    } else {
      query.isActive = true;
      query.isDeleted = false;
      if (statut) query.statut = statut;
    }

    if (formation) query.formation = formation;
    if (search) query.nom = { $regex: search, $options: 'i' };
    if (mois) expr.push({ $eq: [{ $month: '$dateDebut' }, Number(mois)] });
    if (annee) expr.push({ $eq: [{ $year: '$dateDebut' }, Number(annee)] });
    if (expr.length === 1) query.$expr = expr[0];
    if (expr.length === 2) query.$expr = { $and: expr };

    const sessions = await Cohorte.find(query)
      .populate('formateurs', 'nom prenom email')
      .sort({ dateDebut: 1, nom: 1 });

    res.json(
      sessions.map((session) => ({
        id: session._id,
        nom: session.nom,
        formation: session.formation,
        annee: session.annee,
        dateDebut: session.dateDebut,
        dateFin: session.dateFin,
        capacite: session.capacite || 50,
        inscrits: session.etudiants.length,
        placesRestantes: Math.max((session.capacite || 50) - session.etudiants.length, 0),
        statut: session.statut || 'ouverte',
        planningPublie: session.planningPublie,
        planningPublieLe: session.planningPublieLe,
        deletedAt: session.deletedAt,
        formateurs: session.formateurs
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post('/sessions', async (req, res, next) => {
  try {
    const { nom, formation, annee, dateDebut, dateFin, capacite = 50, statut = 'ouverte', formateurs } = req.body;

    if (!nom || !formation || !annee) {
      return res.status(400).json({ message: 'Nom, formation et année sont obligatoires' });
    }

    const formateursList = Array.isArray(formateurs)
      ? formateurs
      : formateurs
      ? [formateurs]
      : [];

    const session = await Cohorte.create({
      nom,
      formation,
      annee,
      dateDebut,
      dateFin,
      capacite,
      statut,
      formateurs: formateursList,
      tenantId: req.tenantId
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.patch('/sessions/:sessionId', async (req, res, next) => {
  try {
    const allowedFields = ['nom', 'formation', 'annee', 'dateDebut', 'dateFin', 'capacite', 'statut', 'formateurs'];
    const update = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    if (update.formateurs && !Array.isArray(update.formateurs)) {
      update.formateurs = [update.formateurs];
    }

    const session = await Cohorte.findOneAndUpdate(
      { _id: req.params.sessionId, tenantId: req.tenantId },
      update,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session introuvable' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.patch('/sessions/:sessionId/archive', async (req, res, next) => {
  try {
    const session = await Cohorte.findOneAndUpdate(
      { _id: req.params.sessionId, tenantId: req.tenantId, isActive: true },
      { statut: 'archivee', isActive: false },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session introuvable' });
    }

    res.json({ message: 'Cohorte archivée', sessionId: session._id });
  } catch (error) {
    next(error);
  }
});

router.delete('/sessions/:sessionId', async (req, res, next) => {
  try {
    const session = await Cohorte.findOneAndUpdate(
      { _id: req.params.sessionId, tenantId: req.tenantId, isActive: true, isDeleted: false },
      { isActive: false, isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session introuvable' });
    }

    res.json({ message: 'Cohorte supprimée', sessionId: session._id });
  } catch (error) {
    next(error);
  }
});

router.patch('/sessions/:sessionId/restore', async (req, res, next) => {
  try {
    const session = await Cohorte.findOneAndUpdate(
      {
        _id: req.params.sessionId,
        tenantId: req.tenantId,
        $or: [
          { isDeleted: true },
          { statut: 'archivee', isActive: false }
        ]
      },
      {
        isDeleted: false,
        isActive: true,
        statut: 'ouverte',
        deletedAt: undefined
      },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session introuvable ou non restaurable' });
    }

    res.json({ message: 'Cohorte restaurée', sessionId: session._id });
  } catch (error) {
    next(error);
  }
});

router.get('/planning', async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const query = { tenantId: req.tenantId };

    if (sessionId) {
      query.cohorte = sessionId;
    }

    const cours = await Cours.find(query)
      .populate('cohorte', 'nom formation planningPublie')
      .populate('formateur', 'nom prenom email')
      .sort({ dateDebut: 1 });

    res.json(cours);
  } catch (error) {
    next(error);
  }
});

router.post('/planning', async (req, res, next) => {
  try {
    const {
      titre,
      description,
      matiere,
      dateDebut,
      dateFin,
      lienVisio,
      salle,
      modalite,
      formateur,
      sessionId,
      visibleEtudiant = false
    } = req.body;

    if (!dateDebut || !dateFin || !sessionId) {
      return res.status(400).json({ message: 'Les dates et la session sont obligatoires' });
    }

    const session = await Cohorte.findOne({ _id: sessionId, tenantId: req.tenantId, isActive: true });
    if (!session) {
      return res.status(404).json({ message: 'Session introuvable' });
    }

    const cours = await Cours.create({
      titre: titre || 'Module',
      description,
      matiere,
      dateDebut,
      dateFin,
      lienVisio,
      replayUrl: req.body.replayUrl,
      salle,
      modalite,
      formateur: formateur || undefined,
      cohorte: sessionId,
      visibleEtudiant,
      publieLe: visibleEtudiant ? new Date() : undefined,
      publiePar: visibleEtudiant ? req.user._id : undefined,
      tenantId: req.tenantId
    });

    res.status(201).json(cours);
  } catch (error) {
    next(error);
  }
});

router.patch('/planning/:coursId', async (req, res, next) => {
  try {
    const allowedFields = [
      'titre',
      'description',
      'matiere',
      'dateDebut',
      'dateFin',
      'lienVisio',
      'replayUrl',
      'salle',
      'modalite',
      'formateur',
      'statut',
      'visibleEtudiant'
    ];
    const update = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    if (req.body.visibleEtudiant === true) {
      update.publieLe = new Date();
      update.publiePar = req.user._id;
    }

    const cours = await Cours.findOneAndUpdate(
      { _id: req.params.coursId, tenantId: req.tenantId },
      update,
      { new: true, runValidators: true }
    );

    if (!cours) {
      return res.status(404).json({ message: 'Cours introuvable' });
    }

    res.json(cours);
  } catch (error) {
    next(error);
  }
});

router.post('/planning/publier/:sessionId', async (req, res, next) => {
  try {
    const session = await Cohorte.findOne({ _id: req.params.sessionId, tenantId: req.tenantId });

    if (!session) {
      return res.status(404).json({ message: 'Session introuvable' });
    }

    const publication = {
      visibleEtudiant: true,
      publieLe: new Date(),
      publiePar: req.user._id
    };

    const result = await Cours.updateMany(
      { cohorte: session._id, tenantId: req.tenantId },
      publication
    );

    session.planningPublie = true;
    session.planningPublieLe = publication.publieLe;
    session.planningPubliePar = req.user._id;
    await session.save();

    // Build a Schedule document for this week so the emploi-du-temps can be reused
    try {
      const monday = new Date(publication.publieLe);
      // normalize to Monday 00:00:00
      monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() - monday.getDay() + 1);

      const coursList = await Cours.find({ cohorte: session._id, tenantId: req.tenantId }).populate('formateur', 'nom prenom');

      const slots = coursList.map((c) => {
        const dateDeb = new Date(c.dateDebut);
        const dateFin = new Date(c.dateFin);
        const jourNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const jour = jourNames[dateDeb.getDay()] || 'lundi';

        const pad = (n) => String(n).padStart(2, '0');
        const debut = `${pad(dateDeb.getHours())}:${pad(dateDeb.getMinutes())}`;
        const fin = `${pad(dateFin.getHours())}:${pad(dateFin.getMinutes())}`;

        return {
          jour: jour.charAt(0).toUpperCase() + jour.slice(1),
          debut,
          fin,
          module: c.matiere || c.titre,
          formateur: c.formateur?._id,
          lien: c.lienVisio || c.replayUrl || '',
          coursRef: c._id
        };
      });

      await Schedule.create({
        tenantId: req.tenantId,
        cohorte: session._id,
        weekStart: monday,
        slots,
        published: true,
        publishedBy: req.user._id,
        versionNote: `Auto-created on publish ${publication.publieLe.toISOString()}`
      });
    } catch (err) {
      // don't fail publication if schedule creation fails; log for debugging
      console.error('Failed to create schedule after publish:', err);
    }

    if (session.etudiants.length > 0) {
      await Notification.insertMany(
        session.etudiants.map((etudiant) => ({
          destinataire: etudiant,
          tenantId: req.tenantId,
          titre: 'Planning publié',
          message: `Le planning de la session ${session.nom} est disponible dans votre agenda.`,
          type: 'cours',
          lien: '/etudiant/agenda'
        }))
      );
    }

    res.json({
      message: 'Planning publié dans l’espace étudiant',
      sessionId: session._id,
      coursPublies: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
});
// POST /admin/planning/publier-to - Publier un planning vers plusieurs sessions
router.post('/planning/publier-to', async (req, res, next) => {
  try {
    const { sourceSessionId, targetSessionIds } = req.body;

    if (!sourceSessionId || !targetSessionIds || !Array.isArray(targetSessionIds) || targetSessionIds.length === 0) {
      return res.status(400).json({ message: 'sourceSessionId et targetSessionIds sont obligatoires' });
    }

    // Get source session to validate it exists
    const sourceSession = await Cohorte.findOne({ _id: sourceSessionId, tenantId: req.tenantId });
    if (!sourceSession) {
      return res.status(404).json({ message: 'Session source introuvable' });
    }

    // Get source courses (courses to be copied)
    const sourceCourses = await Cours.find({ cohorte: sourceSessionId, tenantId: req.tenantId }).populate('formateur', 'nom prenom');

    if (sourceCourses.length === 0) {
      return res.status(400).json({ message: 'Aucun cours à publier dans la session source' });
    }

    const normalizedTargetIds = Array.from(new Set(targetSessionIds.map((id) => String(id))));
    let totalCoursesCopied = 0;
    let publishedSessions = 0;

    const publication = {
      visibleEtudiant: true,
      publieLe: new Date(),
      publiePar: req.user._id,
    };

    // For each target session, copy courses or publish in place
    for (const targetSessionId of normalizedTargetIds) {
      const targetSession = await Cohorte.findOne({ _id: targetSessionId, tenantId: req.tenantId });
      if (!targetSession) {
        console.warn(`Target session ${targetSessionId} not found, skipping`);
        continue;
      }

      if (String(targetSessionId) === String(sourceSessionId)) {
        const result = await Cours.updateMany(
          { cohorte: targetSession._id, tenantId: req.tenantId },
          publication
        );
        totalCoursesCopied += result.modifiedCount;
        publishedSessions += 1;
      } else {

      // Copy each source course to target session
      const copiedCourses = [];
      for (const sourceCourse of sourceCourses) {
        const newCourse = new Cours({
          titre: sourceCourse.titre || 'Module',
          description: sourceCourse.description,
          matiere: sourceCourse.matiere,
          dateDebut: sourceCourse.dateDebut,
          dateFin: sourceCourse.dateFin,
          lienVisio: sourceCourse.lienVisio,
          replayUrl: sourceCourse.replayUrl,
          salle: sourceCourse.salle,
          modalite: sourceCourse.modalite,
          formateur: sourceCourse.formateur?._id || sourceCourse.formateur,
          cohorte: targetSessionId,
          visibleEtudiant: true,
          publieLe: new Date(),
          publiePar: req.user._id,
          tenantId: req.tenantId
        });
        copiedCourses.push(newCourse);
      }

      // Bulk insert
      await Cours.insertMany(copiedCourses);
      totalCoursesCopied += copiedCourses.length;

      // Mark target session as published
      targetSession.planningPublie = true;
      targetSession.planningPublieLe = new Date();
      targetSession.planningPubliePar = req.user._id;
      await targetSession.save();
      publishedSessions += 1;

      // Create Schedule document for the target session
      try {
        const monday = new Date();
        monday.setHours(0, 0, 0, 0);
        monday.setDate(monday.getDate() - monday.getDay() + 1);

        const slots = copiedCourses.map((c) => {
          const dateDeb = new Date(c.dateDebut);
          const dateFin = new Date(c.dateFin);
          const jourNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
          const jour = jourNames[dateDeb.getDay()] || 'lundi';

          const pad = (n) => String(n).padStart(2, '0');
          const debut = `${pad(dateDeb.getHours())}:${pad(dateDeb.getMinutes())}`;
          const fin = `${pad(dateFin.getHours())}:${pad(dateFin.getMinutes())}`;

          return {
            jour: jour.charAt(0).toUpperCase() + jour.slice(1),
            debut,
            fin,
            module: c.matiere || c.titre,
            formateur: c.formateur?._id || c.formateur,
            lien: c.lienVisio || c.replayUrl || '',
            coursRef: c._id
          };
        });

        await Schedule.create({
          tenantId: req.tenantId,
          cohorte: targetSessionId,
          weekStart: monday,
          slots,
          published: true,
          publishedBy: req.user._id,
          versionNote: `Published to ${targetSessionIds.length} session(s)`
        });
      } catch (err) {
        console.error('Failed to create schedule for target session:', err);
      }

      // Notify students in target session
      if (targetSession.etudiants.length > 0) {
        await Notification.insertMany(
          targetSession.etudiants.map((etudiant) => ({
            destinataire: etudiant,
            tenantId: req.tenantId,
            titre: 'Planning publié',
            message: `Le planning de la session ${targetSession.nom} a été mis à jour.`,
            type: 'cours',
            lien: '/etudiant/agenda'
          }))
        );
      }
    }
  }

    res.json({
      message: `Planning publié dans ${publishedSessions} session(s)`,
      totalCoursesCopied,
      targetSessionIds: normalizedTargetIds,
      publishedSessions
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
