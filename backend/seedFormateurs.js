const mongoose = require('mongoose');
const User = require('./models/User');
const CFA = require('./models/CFA');
const connectDB = require('./config/db');
require('dotenv').config();

const formateurs = [
  { prenom: 'Rakoto', nom: 'M.', matieres: ['HTML5', 'Structure Web', 'Projet HTML'] },
  { prenom: 'Hanta', nom: 'Mme', matieres: ['CSS3', 'Responsive Design', 'Projet CSS'] },
  { prenom: 'Andry', nom: 'M.', matieres: ['JavaScript Fondamental', 'Exercices JavaScript'] },
  { prenom: 'Solo', nom: 'M.', matieres: ['Node.js', 'Express', 'API REST', 'Virtualisation', 'Projet Administration'] },
  { prenom: 'Rabe', nom: 'M.', matieres: ['MongoDB', 'Projet Full Stack'] },
  { prenom: 'Ando', nom: 'M.', matieres: ['Introduction Linux', 'Commandes Linux', 'Bureautique', 'Coaching'] },
  { prenom: 'Jean', nom: 'M.', matieres: ['Gestion des Utilisateurs', 'Services Réseau'] },
  { prenom: 'Nomena', nom: 'M.', matieres: ['Réseaux Informatiques', 'Configuration Routeur'] },
  { prenom: 'Fara', nom: 'Mme', matieres: ['Sécurité Système', 'Pare-feu & Sécurité', 'Remise à Niveau Informatique', 'Accompagnement Individualisé'] },
  { prenom: 'Sarah', nom: 'Mme', matieres: ['Communication Professionnelle', 'Étude de Cas', 'Recherche d\'Emploi', 'CV & Lettre de Motivation'] },
  { prenom: 'Clara', nom: 'Mme', matieres: ['Accueil Client', 'Mise en Situation'] },
  { prenom: 'David', nom: 'M.', matieres: ['Gestion des Réclamations', 'CRM', 'Développement Personnel', 'Préparation Entretien'] },
  { prenom: 'Alain', nom: 'M.', matieres: ['Techniques de Vente', 'Gestion Commerciale'] },
  { prenom: 'Julie', nom: 'Mme', matieres: ['Fidélisation Client', 'Projet Relation Client'] }
];

async function seed() {
  try {
    await connectDB();
    
    // Obtenir le premier CFA (tenantId)
    const cfa = await CFA.findOne();
    if (!cfa) {
      console.log('Aucun CFA trouvé, impossible d associer les formateurs.');
      process.exit(1);
    }
    
    for (const f of formateurs) {
      const email = `${f.prenom.toLowerCase()}@cfa-demo.fr`;
      const exists = await User.findOne({ email });
      if (!exists) {
        await User.create({
          nom: f.nom,
          prenom: f.prenom,
          email,
          motDePasse: 'CfaDemo2026!',
          role: 'formateur',
          tenantId: cfa._id,
          matieres: f.matieres,
          isActive: true
        });
        console.log(`Formateur ${f.prenom} ${f.nom} créé (${email})`);
      } else {
        console.log(`Formateur ${f.prenom} existe déjà`);
      }
    }
    console.log('Seeding terminé.');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
