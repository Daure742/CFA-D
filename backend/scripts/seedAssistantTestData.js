require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const CFA = require('../models/CFA');
const Cohorte = require('../models/Cohorte');
const Cours = require('../models/Cours');
const Devoir = require('../models/Devoir');
const Document = require('../models/Document');

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI (Atlas) is required to run seedAssistantTestData.js');
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: process.env.MONGO_DBNAME || undefined });
}

async function main() {
  await connectDB();
  // create minimal tenant (CFA)
  let cfa = await CFA.findOne();
  if (!cfa) {
    cfa = await CFA.create({ nom: 'CFA Test' });
  }

  // create an admin user
  let admin = await User.findOne({ email: 'assistant.test@cfa.local' });
  if (!admin) {
    admin = await User.create({ email: 'assistant.test@cfa.local', motDePasse: 'test1234', prenom: 'Assistant', nom: 'Test', role: 'formateur', tenantId: cfa._id, isActive: true });
  }

  // create a cohorte
  let coh = await Cohorte.findOne({ tenantId: cfa._id });
  if (!coh) {
    coh = await Cohorte.create({ tenantId: cfa._id, nom: 'Cohorte Test', formation: 'Formation Test', formateurs: [admin._id] });
  }

  // create a course
  let cours = await Cours.findOne({ titre: /Assistant RAG Test/ });
  if (!cours) {
    cours = await Cours.create({ titre: 'Assistant RAG Test - Introduction', description: 'Cours test pour vérifier RAG assistant', contenu: 'Ce cours explique comment fonctionne le RAG et les pipelines d\'indexation.', dateDebut: new Date(), dateFin: new Date(Date.now()+3600000), formateur: admin._id, cohorte: coh._id, tenantId: cfa._id });
  }

  // create a document
  let doc = await Document.findOne({ titre: /RAG Test Document/ });
  if (!doc) {
    doc = await Document.create({ titre: 'RAG Test Document', description: 'Document pour test', contenu: 'Ce document contient des informations importantes sur le fonctionnement du RAG et des assistants pédagogiques.', tenantId: cfa._id, destinataire: 'tous', uploadedBy: admin._id });
  }

  // create a devoir
  let dev = await Devoir.findOne({ titre: /RAG Devoir Test/ });
  if (!dev) {
    dev = await Devoir.create({ titre: 'RAG Devoir Test', consignes: 'Répondre aux questions sur le RAG.', dateRendu: new Date(Date.now()+86400000), tenantId: cfa._id });
  }

  console.log('Seed complete. CFA:', cfa._id.toString());
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(2); });
