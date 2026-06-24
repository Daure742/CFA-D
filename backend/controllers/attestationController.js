const Presence = require('../models/Presence');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Cohorte = require('../models/Cohorte');
const Cours = require('../models/Cours');

// Helper to get minutes for a presence entry
function minutesFromPresence(p) {
  if (typeof p.dureeMinutes === 'number') return p.dureeMinutes;
  if (p.heureDebut && p.heureFin) {
    const start = new Date(p.heureDebut).getTime();
    const end = new Date(p.heureFin).getTime();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      return Math.round((end - start) / 60000);
    }
  }
  // fallback: assume 60 minutes if unknown
  return 60;
}

// Mapping of required hours by target
const REQUIRED_HOURS = {
  attestation: 240,
  dts_years: 2,
  licence_years: 3,
  master_years: 5
};

// Convert years to hours using 5 days/week * 4h/day -> 20h/week -> 1040h/year
function yearsToHours(years) {
  return years * 1040; // 52 * 20
}

exports.getAttestationStatus = async (req, res) => {
  try {
    const { etudiantId } = req.params;
    // allow student to view own status or staff/admin
    if (req.user.role === 'etudiant' && req.user._id.toString() !== etudiantId) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const presences = await Presence.find({ etudiant: etudiantId, tenantId: req.tenantId }).lean();

    // Compute expected minutes based on cohort schedule (sum of Cours durations)
    let expectedMinutes = 0;
    const student = await User.findById(etudiantId).select('cohorte');
    if (student && student.cohorte) {
      const cohorte = await Cohorte.findOne({ _id: student.cohorte, tenantId: req.tenantId }).lean();
      if (cohorte) {
        // Sum durations of cours for this cohort within cohort dates
        const coursList = await Cours.find({ cohorte: cohorte._id, tenantId: req.tenantId }).lean();
        coursList.forEach((c) => {
          if (c.dateDebut && c.dateFin) {
            const start = new Date(c.dateDebut).getTime();
            const end = new Date(c.dateFin).getTime();
            if (!isNaN(start) && !isNaN(end) && end > start) {
              expectedMinutes += Math.round((end - start) / 60000);
            }
          }
        });
        // If no explicit cours found, fallback to cohort duration estimation
        if (expectedMinutes === 0 && cohorte.dateDebut && cohorte.dateFin) {
          const start = new Date(cohorte.dateDebut).getTime();
          const end = new Date(cohorte.dateFin).getTime();
          if (!isNaN(start) && !isNaN(end) && end > start) {
            const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
            // assume 5 days/week * 4h/day => 20h/week => ~2.857h/day (20/7) but better: count weekdays
            // approximate weekdays: totalDays * (5/7)
            const estimatedStudyDays = Math.round(totalDays * (5 / 7));
            expectedMinutes = estimatedStudyDays * 4 * 60; // 4 hours per study day
          }
        }
      }
    }

    let attendedMinutes = 0;
    let absentMinutes = 0;
    presences.forEach((p) => {
      const mins = minutesFromPresence(p);
      if (p.statut === 'présent' || p.statut === 'retard' || p.statut === 'excusé') {
        attendedMinutes += mins;
      } else if (p.statut === 'absent') {
        absentMinutes += mins;
      }
    });

    // Determine required hours
    const target = (req.query.target || 'attestation').toLowerCase();
    let requiredHours = REQUIRED_HOURS.attestation;
    if (target === 'dts') requiredHours = yearsToHours(REQUIRED_HOURS.dts_years);
    if (target === 'licence') requiredHours = yearsToHours(REQUIRED_HOURS.licence_years);
    if (target === 'master') requiredHours = yearsToHours(REQUIRED_HOURS.master_years);

    const attendedHours = attendedMinutes / 60;
    const absentHours = absentMinutes / 60;

    const eligible = attendedHours >= requiredHours;
    const needsAdminReview = absentHours >= 10; // threshold from requirement

    // If needs review, notify admins once (in-app + email)
    let alertSent = false;
    if (needsAdminReview) {
      const admins = await User.find({ tenantId: req.tenantId, role: { $in: ['admin', 'superadmin'] } });
      const student = await User.findById(etudiantId).select('prenom nom email');
      const titre = `Alerte absence: ${student?.prenom || ''} ${student?.nom || ''}`;
      const message = `L'étudiant a cumulé ${absentHours.toFixed(1)} heures d'absence. Veuillez décider de la poursuite de sa formation.`;
      const notifications = admins.map((a) => ({ destinataire: a._id, tenantId: req.tenantId, titre, message, type: 'absence', lien: `/admin/etudiants/${etudiantId}` }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        alertSent = true;

        // Send email alerts to admins (best-effort)
        try {
          const transporter = require('../config/mailer');
          const sendPromises = admins.map((a) => {
            const to = a.email;
            const subject = titre;
            const text = `${message}\n\nConsultez le dossier: ${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/etudiants/${etudiantId}`;
            return transporter.sendMail({ from: process.env.MAIL_FROM || 'no-reply@cfa-digital.local', to, subject, text });
          });
          await Promise.all(sendPromises);
        } catch (emailErr) {
          console.error('Erreur envoi emails alertes admin:', emailErr);
          // do not fail the controller if emails fail
        }
      }
    }

    return res.json({
      attendedMinutes,
      absentMinutes,
      attendedHours,
      absentHours,
      requiredHours,
      expectedMinutes,
      expectedHours: expectedMinutes / 60,
      eligible,
      needsAdminReview,
      alertSent
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors du calcul du statut d attestation' });
  }
};

exports.postAdminDecision = async (req, res) => {
  try {
    const { etudiantId } = req.params;
    const { allowContinue, comment } = req.body;
    const adminUser = req.user;

    const student = await User.findOne({ _id: etudiantId, tenantId: req.tenantId });
    if (!student) return res.status(404).json({ message: 'Étudiant introuvable' });

    // Create audit log
    await AuditLog.create({
      userId: adminUser._id,
      tenantId: req.tenantId,
      action: allowContinue ? 'ABSENCE_ALLOW_CONTINUE' : 'ABSENCE_REJECT_CONTINUE',
      ressource: 'User',
      ressourceId: student._id,
      details: { comment }
    });

    // Notify student
    const notif = new Notification({
      destinataire: student._id,
      tenantId: req.tenantId,
      titre: allowContinue ? 'Décision: poursuite autorisée' : 'Décision: poursuite refusée',
      message: comment || (allowContinue ? 'La continuation de votre formation a été autorisée.' : 'La continuation de votre formation a été refusée.'),
      type: 'administratif',
      lien: '/etudiant/mon-profil'
    });
    await notif.save();

    // Send email to student (best-effort)
    try {
      const transporter = require('../config/mailer');
      const to = student.email;
      const subject = notif.titre;
      const text = `${notif.message}\n\nConsultez votre dossier: ${process.env.CLIENT_URL || 'http://localhost:5173'}/etudiant/mon-profil`;
      await transporter.sendMail({ from: process.env.MAIL_FROM || 'no-reply@cfa-digital.local', to, subject, text });
    } catch (emailErr) {
      console.error('Erreur envoi email décision au étudiant:', emailErr);
    }

    return res.json({ message: 'Décision enregistrée' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l enregistrement de la décision' });
  }
};
