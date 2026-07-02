// controllers/authController.js - Authentification (login, refresh, forgot pwd)
const jwt = require('jsonwebtoken');
// Ensure a usable crypto implementation is referenced locally (prefer require)
let cryptoLib;
try {
  cryptoLib = require('crypto');
} catch (e) {
  cryptoLib = (typeof globalThis !== 'undefined' && globalThis.crypto) || (typeof global !== 'undefined' && global.crypto) || null;
}
const mongoose = require('mongoose');
const User = require('../models/User');
const CFA = require('../models/CFA');
const Cohorte = require('../models/Cohorte');
const Candidature = require('../models/Candidature');
const transporter = require('../config/mailer');
const { sendSms } = require('../config/sms');

const DEFAULT_CAPACITY = 50;
const MONTHS_FR = [
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre'
];

const getCurrentMonthLabel = (date = new Date()) => `${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;

const getMonthBounds = (date = new Date()) => ({
  start: new Date(date.getFullYear(), date.getMonth(), 1),
  end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
});

const getDefaultTenant = async (tenantId) => {
  if (tenantId) {
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      const error = new Error('tenantId invalide');
      error.statusCode = 400;
      throw error;
    }

    const cfa = await CFA.findById(tenantId);
    if (!cfa || !cfa.isActive) {
      const error = new Error('CFA introuvable ou inactif');
      error.statusCode = 404;
      throw error;
    }
    return cfa;
  }

  const configuredTenantId = process.env.DEFAULT_TENANT_ID?.trim();
  if (configuredTenantId) {
    if (!mongoose.Types.ObjectId.isValid(configuredTenantId)) {
      const error = new Error('DEFAULT_TENANT_ID invalide');
      error.statusCode = 500;
      throw error;
    }

    const configuredCfa = await CFA.findById(configuredTenantId);
    if (configuredCfa?.isActive) return configuredCfa;
  }

  const existingCfa = await CFA.findOne({ isActive: true }).sort({ createdAt: 1 });
  if (existingCfa) return existingCfa;

  return CFA.create({
    nom: process.env.DEFAULT_CFA_NAME || 'CFA Principal',
    siret: process.env.DEFAULT_CFA_SIRET || '00000000000000',
    email: process.env.DEFAULT_CFA_EMAIL || 'contact@cfa.local',
    telephone: process.env.DEFAULT_CFA_PHONE || '',
    adresse: process.env.DEFAULT_CFA_ADDRESS || '',
    parametres: {
      modeInscription: 'ouverte',
      nbMaxEtudiantsParCohorte: Number(process.env.DEFAULT_COHORTE_CAPACITY || DEFAULT_CAPACITY),
      modulesActifs: ['cours', 'devoirs', 'presences', 'documents', 'messages', 'notes']
    },
    isActive: true
  });
};

const ensureMonthlyOpenCohorte = async ({ tenantId, formation }) => {
  const cfa = await CFA.findById(tenantId);
  const now = new Date();
  const { start: dateDebut, end: dateFin } = getMonthBounds(now);
  const nom = `${getCurrentMonthLabel(now)} - ${formation}`;
  const capacite = cfa?.parametres?.nbMaxEtudiantsParCohorte || Number(process.env.DEFAULT_COHORTE_CAPACITY || DEFAULT_CAPACITY);

  await Cohorte.updateMany(
    {
      tenantId,
      formation,
      isDeleted: { $ne: true },
      statut: { $in: ['brouillon', 'ouverte'] },
      dateDebut: { $lt: dateDebut }
    },
    {
      $set: {
        statut: 'terminee',
        isActive: false
      }
    }
  );

  let cohorte = await Cohorte.findOne({
    tenantId,
    formation,
    nom,
    isActive: true,
    isDeleted: { $ne: true }
  });

  if (!cohorte) {
    cohorte = await Cohorte.create({
      nom,
      formation,
      annee: now.getFullYear(),
      dateDebut,
      dateFin,
      capacite,
      statut: 'ouverte',
      tenantId,
      isActive: true
    });
  } else if (cohorte.statut === 'brouillon') {
    cohorte.statut = 'ouverte';
    await cohorte.save();
  }

  return cohorte;
};

const closePastMonthlyCohortes = async ({ tenantId }) => {
  const { start } = getMonthBounds();

  await Cohorte.updateMany(
    {
      tenantId,
      isDeleted: { $ne: true },
      statut: { $in: ['brouillon', 'ouverte'] },
      dateDebut: { $lt: start }
    },
    {
      $set: {
        statut: 'terminee',
        isActive: false
      }
    }
  );
};

// Générer tokens JWT
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRE });
};
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });
};

// Inscription (réservée aux administrateurs en interne, ou via candidature)
exports.register = async (req, res, next) => {
  try {
    const { nom, prenom, email, motDePasse, tenantId, formation, sessionId } = req.body;
    const role = 'etudiant';

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être renseignés' });
    }

    const cfa = await getDefaultTenant(tenantId);
    const resolvedTenantId = cfa._id;
    await closePastMonthlyCohortes({ tenantId: resolvedTenantId });

    // Vérification unicité email + tenant
    const existant = await User.findOne({ email: String(email).toLowerCase().trim(), tenantId: resolvedTenantId });
    if (existant) return res.status(409).json({ message: 'Cet email est déjà utilisé dans ce CFA' });

    let cohorte = null;

    if (role === 'etudiant') {
      if (!formation) {
        return res.status(400).json({ message: 'La formation est obligatoire pour un étudiant' });
      }

      if (sessionId) {
        const { start: monthStart, end: monthEnd } = getMonthBounds();
        cohorte = await Cohorte.findOne({
          _id: sessionId,
          tenantId: resolvedTenantId,
          formation,
          isActive: true,
          dateDebut: { $gte: monthStart, $lte: monthEnd },
          $or: [{ statut: { $in: ['ouverte', 'brouillon'] } }, { statut: { $exists: false } }]
        });

        if (!cohorte) {
          return res.status(404).json({ message: 'Session de formation introuvable, fermee ou hors mois courant' });
        }
      } else {
        cohorte = await ensureMonthlyOpenCohorte({ tenantId: resolvedTenantId, formation });
      }
      // Do not early-return here; let downstream logic add to waitlist after user creation
    }

    const user = await User.create({
      nom,
      prenom,
      email,
      motDePasse,
      role,
      tenantId: resolvedTenantId,
      formationChoisie: role === 'etudiant' ? formation : undefined,
      cohorte: cohorte?._id
    });

    if (cohorte) {
      const capacite = cohorte.capacite || 50;
      // If capacity reached, add applicant to waitlist instead of enrolling
      if (cohorte.etudiants.length >= capacite) {
        // avoid duplicate waitlist entries
        const already = cohorte.waitlist?.some((w) => String(w.email) === String(email) || String(w.etudiant) === String(user._id));
        if (!already) {
          cohorte.waitlist = cohorte.waitlist || [];
          cohorte.waitlist.push({ etudiant: user._id, nom: user.nom, prenom: user.prenom, email: user.email });
          // mark complete if not already
          cohorte.statut = 'complete';
          await cohorte.save();
        }
        // mark user as pending on waitlist
        user.status = 'pending';
        await user.save();
        return res.status(201).json({ message: 'Session complète. Votre inscription est enregistrée sur la liste d attente.', user: { id: user._id, status: user.status } });
      }

      cohorte.etudiants.addToSet(user._id);
      cohorte.capacite = capacite;
      if (cohorte.etudiants.length >= capacite) {
        cohorte.statut = 'complete';
      }
      await cohorte.save();

      await Candidature.findOneAndUpdate(
        { tenantId: resolvedTenantId, email: user.email },
        {
          $setOnInsert: {
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            formation,
            tenantId: resolvedTenantId
          },
          $set: {
            statut: 'acceptee',
            commentaireAdmin: `Inscription automatique reussie dans la session ${cohorte.nom}`
          }
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      message: `Compte créé avec succès. Session attribuée : ${cohorte?.nom || 'non applicable'}`,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        formationChoisie: user.formationChoisie,
        cohorte: user.cohorte,
        sessionNom: cohorte?.nom
      }
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

exports.getSessionsOuvertes = async (req, res, next) => {
  try {
    const { tenantId, formation } = req.query;

    const cfa = await getDefaultTenant(tenantId);
    const resolvedTenantId = cfa._id;
    await closePastMonthlyCohortes({ tenantId: resolvedTenantId });

    if (formation) {
      await ensureMonthlyOpenCohorte({ tenantId: resolvedTenantId, formation });
    }

    const { start: monthStart, end: monthEnd } = getMonthBounds();

    const query = {
      tenantId: resolvedTenantId,
      isActive: true,
      dateDebut: { $gte: monthStart, $lte: monthEnd },
      $or: [{ statut: { $in: ['ouverte', 'brouillon'] } }, { statut: { $exists: false } }]
    };

    if (formation) {
      query.formation = formation;
    }

    const sessions = await Cohorte.find(query)
      .select('nom formation annee dateDebut dateFin capacite statut planningPublie etudiants')
      .sort({ dateDebut: 1, nom: 1 });

    res.json(
      sessions
        .map((session) => ({
          id: session._id,
          nom: session.nom,
          formation: session.formation,
          annee: session.annee,
          dateDebut: session.dateDebut,
          dateFin: session.dateFin,
          capacite: session.capacite || 50,
          inscrits: session.etudiants.length,
          placesRestantes: Math.max((session.capacite || 50) - session.etudiants.length, 0),
          planningPublie: session.planningPublie
        }))
        .filter((session) => session.placesRestantes > 0)
    );
  } catch (error) {
    next(error);
  }
};

// Connexion
exports.login = async (req, res, next) => {
  try {
    const { email, motDePasse, tenantId } = req.body;
    const cfa = await getDefaultTenant(tenantId);
    const user = await User.findOne({ email: String(email).toLowerCase().trim(), tenantId: cfa._id });
    if (!user || !(await user.comparePassword(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Stocker le refresh token en base
    user.refreshToken = refreshToken;
    await user.save();

    // Envoyer le refresh token dans un cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        formationChoisie: user.formationChoisie,
        cohorte: user.cohorte,
        matieres: user.matieres || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// Rafraîchir le token
exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token manquant' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token invalide' });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        formationChoisie: user.formationChoisie,
        cohorte: user.cohorte,
        matieres: user.matieres || []
      }
    });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token invalide ou expiré' });
  }
};

// Déconnexion
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    next(error);
  }
};

// Mot de passe oublié
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email' });

    const token = (cryptoLib && cryptoLib.randomBytes ? cryptoLib.randomBytes(20).toString('hex') : require('crypto').randomBytes(20).toString('hex'));
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reinitialiser-motdepasse/${token}`;
    await transporter.sendMail({
      from: '"CFA Digital" <noreply@cfa.digital>',
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Bonjour ${user.prenom},</p><p>Cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe.</p>`
    });

    res.json({ message: 'Email de réinitialisation envoyé' });
  } catch (error) {
    next(error);
  }
};

// Envoyer un code de verification (email ou SMS) pour changement de mot de passe
exports.sendVerificationCode = async (req, res, next) => {
  try {
    const { email, telephone } = req.body;
    let user = null;
    if (email) user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user && telephone) user = await User.findOne({ telephone: String(telephone).trim() });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    user.passwordChangeCode = code;
    user.passwordChangeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    if (telephone) {
      // Try SMS
      try {
        await sendSms(telephone, `Code de verification CFA Digital: ${code}`);
      } catch (err) {
        console.error('SMS send error', err);
      }
    }

    if (email) {
      const html = `<p>Bonjour ${user.prenom},</p><p>Votre code de verification: <strong>${code}</strong>. Il expire dans 10 minutes.</p>`;
      try {
        await transporter.sendMail({ from: '"CFA Digital" <noreply@cfa.digital>', to: user.email, subject: 'Code de verification', html });
      } catch (err) {
        console.error('Email send error', err);
      }
    }

    res.json({ message: 'Code de verification envoyé (si le contact est associé au compte)' });
  } catch (error) {
    next(error);
  }
};

// Réinitialisation mot de passe
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, nouveauMotDePasse } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Token invalide ou expiré' });

    user.motDePasse = nouveauMotDePasse;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    next(error);
  }
};

// Changer le mot de passe depuis le profil (auth required) en validant le code
exports.changePasswordAuthenticated = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { telephone, code, nouveauMotDePasse } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // match by telephone if provided, otherwise fallback to user record
    if (telephone && String(user.telephone).trim() !== String(telephone).trim()) {
      return res.status(400).json({ message: 'Le numéro fourni ne correspond pas au compte' });
    }

    if (!user.passwordChangeCode || !user.passwordChangeExpires) return res.status(400).json({ message: 'Aucun code actif. Demandez un nouveau code.' });
    if (user.passwordChangeExpires < Date.now()) return res.status(400).json({ message: 'Le code a expiré' });
    if (String(user.passwordChangeCode) !== String(code)) return res.status(400).json({ message: 'Code invalide' });

    user.motDePasse = nouveauMotDePasse;
    user.passwordChangeCode = undefined;
    user.passwordChangeExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour les préférences de notification de l'utilisateur connecté
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { notificationPreferences } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    user.notificationPreferences = Object.assign({}, user.notificationPreferences || {}, notificationPreferences || {});
    await user.save();
    res.json({ message: 'Préférences mises à jour', notificationPreferences: user.notificationPreferences });
  } catch (error) {
    next(error);
  }
};
