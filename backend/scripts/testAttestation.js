require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Cohorte = require('../models/Cohorte');
const Cours = require('../models/Cours');
const Presence = require('../models/Presence');
const attestationController = require('../controllers/attestationController');

(async function main() {
  try {
    await connectDB();
    console.log('DB connected, preparing test data...');

    const tenantId = new mongoose.Types.ObjectId();

    // Create cohort
    const cohorte = await Cohorte.create({
      nom: 'Test Cohorte Attestation',
      formation: 'Dev Web',
      annee: 2026,
      dateDebut: new Date('2026-01-01T09:00:00Z'),
      dateFin: new Date('2026-06-01T17:00:00Z'),
      tenantId
    });

    // Create 10 cours of 4 hours each (240 minutes)
    const coursDocs = [];
    for (let i = 0; i < 10; i++) {
      const start = new Date(Date.UTC(2026, 0, 1 + i, 9, 0, 0));
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
      const c = await Cours.create({
        titre: `Séance test ${i + 1}`,
        dateDebut: start,
        dateFin: end,
        formateur: new mongoose.Types.ObjectId(),
        cohorte: cohorte._id,
        tenantId,
        statut: 'terminé'
      });
      coursDocs.push(c);
    }

    // Create a student
    const student = await User.create({
      nom: 'Sample',
      prenom: 'Etudiant',
      email: `student.attest.${Date.now()}@example.com`,
      motDePasse: 'Password123!',
      role: 'etudiant',
      tenantId,
      cohorte: cohorte._id
    });

    // Create an admin to receive alerts (test only)
    const adminUser = await User.create({
      nom: 'Admin',
      prenom: 'Test',
      email: `admin.attest.${Date.now()}@example.com`,
      motDePasse: 'AdminPass123!',
      role: 'admin',
      tenantId
    });

    // Create presences: mark first 6 as present (6 * 4h = 24h => 24h), rest absent
    const presences = [];
    for (let i = 0; i < coursDocs.length; i++) {
      const statut = i < 6 ? 'présent' : 'absent';
      const dureeMinutes = 4 * 60;
      const p = await Presence.create({
        cours: coursDocs[i]._id,
        etudiant: student._id,
        tenantId,
        heureDebut: coursDocs[i].dateDebut,
        heureFin: coursDocs[i].dateFin,
        dureeMinutes,
        statut,
        valideFormateur: statut === 'présent'
      });
      presences.push(p);
    }

    // Prepare mock req/res for controller
    const req = {
      params: { etudiantId: student._id.toString() },
      user: { role: 'admin', _id: new mongoose.Types.ObjectId() },
      tenantId,
      query: {}
    };

    const res = {
      _status: 200,
      status(code) { this._status = code; return this; },
      json(payload) { console.log('\n=== ATTESTATION CONTROLLER OUTPUT ===\n', JSON.stringify(payload, null, 2)); return payload; }
    };

    // Call controller
    await attestationController.getAttestationStatus(req, res);

    // Simulate admin decision: accept continuation
    const decisionReq = {
      params: { etudiantId: student._id.toString() },
      user: { role: 'admin', _id: adminUser._id },
      tenantId,
      body: { allowContinue: true, comment: 'Test: autorisé' }
    };
    const decisionRes = {
      _status: 200,
      status(code) { this._status = code; return this; },
      json(payload) { console.log('\n=== ADMIN DECISION OUTPUT ===\n', JSON.stringify(payload, null, 2)); return payload; }
    };
    await attestationController.postAdminDecision(decisionReq, decisionRes);

    // Cleanup created test data
    console.log('Cleaning up test data...');
    await Promise.all([
      Presence.deleteMany({ etudiant: student._id }),
      Cours.deleteMany({ cohorte: cohorte._id }),
      Cohorte.deleteOne({ _id: cohorte._id }),
      User.deleteOne({ _id: student._id }),
      User.deleteOne({ _id: adminUser._id })
    ]);

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();
