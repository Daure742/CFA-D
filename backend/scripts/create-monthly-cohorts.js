// scripts/create-monthly-cohorts.js
// Create monthly cohort skeletons for a given CFA and formations.
// Usage: node scripts/create-monthly-cohorts.js [tenantId] [months=6]
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Cohorte = require('../models/Cohorte');
const CFA = require('../models/CFA');

const formations = [
  'Developpement web',
  'Administration systemes',
  'Gestion et relation client',
  'Parcours individualise',
];

const monthsFr = [
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
  'Decembre',
];

async function main() {
  await connectDB();
  const tenantId = process.argv[2];
  const months = Number(process.argv[3] || 6);
  if (!tenantId) {
    console.error('Usage: node scripts/create-monthly-cohorts.js <tenantId> [months]');
    process.exit(1);
  }

  const cfa = await CFA.findById(tenantId);
  if (!cfa) {
    console.error('CFA introuvable', tenantId);
    process.exit(1);
  }

  const results = [];
  const now = new Date();
  for (let i = 0; i < months; i++) {
    const start = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const monthLabel = `${monthsFr[start.getMonth()]} ${start.getFullYear()}`;

    for (const formation of formations) {
      const nom = `${monthLabel} - ${formation}`;
      let coh = await Cohorte.findOne({ tenantId: cfa._id, nom });
      if (!coh) {
        coh = await Cohorte.create({
          nom,
          formation,
          annee: start.getFullYear(),
          dateDebut: start,
          dateFin: end,
          capacite: cfa.parametres?.nbMaxEtudiantsParCohorte || 50,
          statut: 'ouverte',
          tenantId: cfa._id,
        });
        results.push({ created: true, id: coh._id, nom });
      } else {
        results.push({ created: false, id: coh._id, nom });
      }
    }
  }

  console.log('Résultat création cohortes:', results);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
