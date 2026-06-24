// mongo-atlas-seed-cfa-digital.js
// A executer dans MongoDB Atlas > Collections > Open mongosh, ou avec:
// mongosh "MONGODB_ATLAS_URI" mongo-atlas-seed-cfa-digital.js
//
// Base cible: cfa_digital
// Mot de passe de tous les comptes demo: CfaDemo2026!

use("cfa_digital");

const now = new Date();
const tenantId = ObjectId("665000000000000000000001");
const formationId = ObjectId("665000000000000000000101");
const moduleIntroId = ObjectId("665000000000000000000201");
const moduleApiId = ObjectId("665000000000000000000202");
const cohorteId = ObjectId("665000000000000000000301");
const entrepriseId = ObjectId("665000000000000000000401");
const contratId = ObjectId("665000000000000000000501");
const coursId = ObjectId("665000000000000000000601");
const devoirId = ObjectId("665000000000000000000701");
const documentId = ObjectId("665000000000000000000801");
const factureId = ObjectId("665000000000000000000901");
const quizId = ObjectId("665000000000000000001001");
const ressourceId = ObjectId("665000000000000000001101");

const users = {
  superadmin: ObjectId("665000000000000000001201"),
  admin: ObjectId("665000000000000000001202"),
  formateur: ObjectId("665000000000000000001203"),
  etudiant: ObjectId("665000000000000000001204"),
  tuteur: ObjectId("665000000000000000001205"),
  entreprise: ObjectId("665000000000000000001206"),
};

const passwordHash = "$2b$12$1HWOoYO8RZDFapH77BHuleOeTwLD8jlarweAkzl.C6kt1BHioTQvC";

// Nettoyage uniquement des donnees demo. Ne supprime pas les autres CFA.
[
  "abonnements_saas",
  "auditlogs",
  "bulletins",
  "candidatures",
  "cohortes",
  "contrats_apprentissage",
  "cours",
  "devoirs",
  "documents",
  "entreprises",
  "evaluations_qualite",
  "factures",
  "financements",
  "formations",
  "incidents",
  "indicateurs_qualiopi",
  "messages",
  "modules",
  "notes",
  "notifications",
  "paiements",
  "presences",
  "progressions",
  "quiz",
  "quiz_attempts",
  "reclamations",
  "rendus",
  "ressources_pedagogiques",
  "sessions_auth",
  "signatures",
  "tickets_support",
  "users",
].forEach((collectionName) => {
  db.getCollection(collectionName).deleteMany({ tenantId });
});
db.cfas.deleteOne({ _id: tenantId });
db.webhooks.deleteMany({ provider: "demo-cfa-digital" });

// Index principaux pour performance, unicite et SaaS multi-tenant.
db.cfas.createIndex({ siret: 1 }, { unique: true });
db.cfas.createIndex({ slug: 1 }, { unique: true });
db.users.createIndex({ tenantId: 1, email: 1 }, { unique: true });
db.users.createIndex({ tenantId: 1, telephone: 1 }, {
  unique: true,
  partialFilterExpression: { telephone: { $exists: true, $type: "string" } },
});
db.users.createIndex({ tenantId: 1, role: 1, isActive: 1 });
db.users.createIndex({ tenantId: 1, cohorte: 1 });
db.formations.createIndex({ tenantId: 1, slug: 1 }, { unique: true });
db.modules.createIndex({ tenantId: 1, formationId: 1, ordre: 1 });
db.cohortes.createIndex({ tenantId: 1, nom: 1 }, { unique: true });
db.cours.createIndex({ tenantId: 1, cohorte: 1, dateDebut: 1 });
db.devoirs.createIndex({ tenantId: 1, cohorte: 1, dateLimite: 1 });
db.rendus.createIndex({ tenantId: 1, devoir: 1, etudiant: 1 }, { unique: true });
db.presences.createIndex({ tenantId: 1, cours: 1, etudiant: 1 }, { unique: true });
db.notes.createIndex({ tenantId: 1, etudiant: 1, periode: 1 });
db.documents.createIndex({ tenantId: 1, type: 1, archive: 1 });
db.messages.createIndex({ tenantId: 1, cohorte: 1, createdAt: -1 });
db.notifications.createIndex({ tenantId: 1, destinataire: 1, lu: 1, createdAt: -1 });
db.auditlogs.createIndex({ tenantId: 1, createdAt: -1 });
db.entreprises.createIndex({ tenantId: 1, siret: 1 }, { unique: true });
db.factures.createIndex({ tenantId: 1, numero: 1 }, { unique: true });
db.sessions_auth.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.webhooks.createIndex({ provider: 1, eventId: 1 }, { unique: true });

db.cfas.insertOne({
  _id: tenantId,
  nom: "CFA Digital Demo",
  slug: "cfa-digital-demo",
  raisonSociale: "CFA Digital Demo SAS",
  siret: "12345678901234",
  numeroUai: "0750001A",
  nda: "11750000075",
  email: "contact@cfa-demo.fr",
  telephone: "+33123456789",
  siteWeb: "https://cfa-demo.fr",
  logo: "https://dummyimage.com/256x256/4f46e5/ffffff&text=CFA",
  adresse: {
    ligne1: "10 rue de la Formation",
    codePostal: "75001",
    ville: "Paris",
    pays: "France",
  },
  representantLegal: {
    nom: "Martin",
    prenom: "Claire",
    email: "direction@cfa-demo.fr",
    telephone: "+33123456780",
  },
  parametres: {
    modeInscription: "surValidation",
    delaiAnnulationCours: 24,
    nbMaxEtudiantsParCohorte: 30,
    timezone: "Europe/Paris",
    langue: "fr",
    signatureElectronique: true,
    modulesActifs: [
      "cours",
      "devoirs",
      "presences",
      "documents",
      "messages",
      "notes",
      "qualiopi",
      "entreprises",
      "facturation",
    ],
  },
  qualiopi: {
    certifie: true,
    numeroCertificat: "QUALIOPI-DEMO-2026",
    organismeCertificateur: "Organisme certificateur demo",
    dateDebut: ISODate("2026-01-01T00:00:00Z"),
    dateFin: ISODate("2028-12-31T23:59:59Z"),
  },
  abonnement: {
    plan: "enterprise",
    statut: "active",
    limites: { users: 5000, stockageGo: 500, cohortes: 200 },
    dateDebut: ISODate("2026-01-01T00:00:00Z"),
  },
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

db.formations.insertOne({
  _id: formationId,
  tenantId,
  titre: "Developpeur Web et Web Mobile",
  slug: "developpeur-web-web-mobile",
  codeRNCP: "RNCP37674",
  niveau: "Bac+2",
  dureeHeures: 700,
  description: "Parcours professionnalisant pour concevoir, developper et deployer des applications web.",
  objectifs: ["Developper une interface web", "Construire une API", "Deployer une application"],
  prerequis: ["Bases numeriques", "Motivation pour le developpement"],
  publicCible: ["Apprentis", "Adultes en reconversion"],
  competencesVisees: ["Frontend React", "Backend Node.js", "Base de donnees MongoDB"],
  prix: { montant: 8500, devise: "EUR" },
  certification: { type: "RNCP", code: "RNCP37674" },
  modalitesEvaluation: ["Devoirs", "Projets", "Quiz", "Soutenance"],
  isPublished: true,
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

db.modules.insertMany([
  {
    _id: moduleIntroId,
    tenantId,
    formationId,
    titre: "Fondamentaux web",
    ordre: 1,
    description: "HTML, CSS, JavaScript, accessibilite et bonnes pratiques.",
    dureeHeures: 120,
    competences: ["HTML", "CSS", "JavaScript"],
    objectifs: ["Structurer une page", "Styliser une interface", "Manipuler le DOM"],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: moduleApiId,
    tenantId,
    formationId,
    titre: "Backend API et donnees",
    ordre: 2,
    description: "Node.js, Express, MongoDB, securite API.",
    dureeHeures: 160,
    competences: ["Node.js", "Express", "MongoDB", "JWT"],
    objectifs: ["Creer une API", "Securiser une route", "Modeliser les donnees"],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]);

db.entreprises.insertOne({
  _id: entrepriseId,
  tenantId,
  raisonSociale: "Entreprise Demo Tech",
  siret: "98765432109876",
  secteur: "Numerique",
  adresse: {
    ligne1: "20 avenue des Apprentis",
    codePostal: "69002",
    ville: "Lyon",
    pays: "France",
  },
  contactPrincipal: {
    nom: "Bernard",
    prenom: "Luc",
    email: "contact@entreprise-demo.fr",
    telephone: "+33411111111",
  },
  tuteurs: [users.tuteur],
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

db.users.insertMany([
  {
    _id: users.superadmin,
    tenantId,
    nom: "Plateforme",
    prenom: "Superadmin",
    email: "superadmin@cfa-demo.fr",
    telephone: "+33600000001",
    motDePasse: passwordHash,
    role: "superadmin",
    permissions: ["platform:manage", "tenants:manage", "billing:manage", "security:audit"],
    isActive: true,
    emailVerified: true,
    telephoneVerified: true,
    preferences: { email: true, sms: false, inApp: true },
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: users.admin,
    tenantId,
    nom: "Admin",
    prenom: "Principal",
    email: "admin@cfa-demo.fr",
    telephone: "+33600000002",
    motDePasse: passwordHash,
    role: "admin",
    permissions: ["cfa:manage", "users:manage", "planning:manage", "reports:read"],
    isActive: true,
    emailVerified: true,
    telephoneVerified: true,
    preferences: { email: true, sms: false, inApp: true },
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: users.formateur,
    tenantId,
    nom: "Durand",
    prenom: "Sophie",
    email: "formateur@cfa-demo.fr",
    telephone: "+33600000003",
    motDePasse: passwordHash,
    role: "formateur",
    matieres: ["JavaScript", "Node.js", "MongoDB"],
    specialites: ["Developpement web", "API"],
    isActive: true,
    emailVerified: true,
    telephoneVerified: true,
    preferences: { email: true, sms: false, inApp: true },
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: users.etudiant,
    tenantId,
    nom: "Leroy",
    prenom: "Nadia",
    email: "etudiant@cfa-demo.fr",
    telephone: "+33600000004",
    motDePasse: passwordHash,
    role: "etudiant",
    formationChoisie: "Developpeur Web et Web Mobile",
    cohorte: cohorteId,
    entrepriseId,
    tuteurId: users.tuteur,
    isActive: true,
    emailVerified: true,
    telephoneVerified: true,
    preferences: { email: true, sms: false, inApp: true },
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: users.tuteur,
    tenantId,
    nom: "Moreau",
    prenom: "Thomas",
    email: "tuteur@cfa-demo.fr",
    telephone: "+33600000005",
    motDePasse: passwordHash,
    role: "tuteur",
    entrepriseId,
    apprentis: [users.etudiant],
    isActive: true,
    emailVerified: true,
    telephoneVerified: true,
    preferences: { email: true, sms: false, inApp: true },
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: users.entreprise,
    tenantId,
    nom: "Demo",
    prenom: "Entreprise",
    email: "entreprise@cfa-demo.fr",
    telephone: "+33600000006",
    motDePasse: passwordHash,
    role: "entreprise",
    entrepriseId,
    permissions: ["contracts:read", "billing:read", "tutors:manage"],
    isActive: true,
    emailVerified: true,
    telephoneVerified: true,
    preferences: { email: true, sms: false, inApp: true },
    createdAt: now,
    updatedAt: now,
  },
]);

db.cohortes.insertOne({
  _id: cohorteId,
  tenantId,
  nom: "DWWM - Septembre 2026",
  code: "DWWM-2026-09",
  formationId,
  formation: "Developpeur Web et Web Mobile",
  annee: 2026,
  dateDebut: ISODate("2026-09-01T08:00:00Z"),
  dateFin: ISODate("2027-06-30T17:00:00Z"),
  capacite: 30,
  statut: "ouverte",
  planningPublie: true,
  planningPublieLe: now,
  planningPubliePar: users.admin,
  etudiants: [users.etudiant],
  formateurs: [users.formateur],
  referentAdministratif: users.admin,
  objectifs: ["Obtenir la certification", "Realiser un projet professionnel"],
  modalite: "hybride",
  rythme: "3 semaines entreprise / 1 semaine CFA",
  isActive: true,
  isDeleted: false,
  createdAt: now,
  updatedAt: now,
});

db.cours.insertOne({
  _id: coursId,
  tenantId,
  cohorte: cohorteId,
  formateur: users.formateur,
  titre: "Introduction a l'API LMS",
  description: "Creation d'une route API securisee avec Express et JWT.",
  matiere: "Node.js",
  moduleId: moduleApiId,
  dateDebut: ISODate("2026-09-08T08:00:00Z"),
  dateFin: ISODate("2026-09-08T11:00:00Z"),
  dureeMinutes: 180,
  modalite: "distanciel",
  lienVisio: "https://meet.example.com/cfa-demo-api",
  visibleEtudiant: true,
  publieLe: now,
  publiePar: users.admin,
  statut: "planifie",
  replayUrl: null,
  ressources: [ressourceId],
  objectifsPedagogiques: ["Comprendre une route REST", "Proteger une route avec JWT"],
  emargementFormateur: false,
  emargementEtudiant: [],
  createdAt: now,
  updatedAt: now,
});

db.ressources_pedagogiques.insertOne({
  _id: ressourceId,
  tenantId,
  formationId,
  moduleId: moduleApiId,
  coursId,
  titre: "Support API Express",
  type: "pdf",
  url: "https://example.com/demo/support-api-express.pdf",
  dureeMinutes: 30,
  ordre: 1,
  visible: true,
  suiviObligatoire: true,
  createdBy: users.formateur,
  createdAt: now,
  updatedAt: now,
});

db.progressions.insertOne({
  tenantId,
  etudiant: users.etudiant,
  formationId,
  moduleId: moduleApiId,
  ressourceId,
  statut: "en_cours",
  progressionPourcentage: 45,
  tempsPasseSecondes: 1800,
  startedAt: now,
  lastActivityAt: now,
  createdAt: now,
  updatedAt: now,
});

db.devoirs.insertOne({
  _id: devoirId,
  tenantId,
  cohorte: cohorteId,
  formateur: users.formateur,
  titre: "Creer une route API securisee",
  description: "Livrer un endpoint Express protege par JWT avec validation des entrees.",
  matiere: "Node.js",
  moduleId: moduleApiId,
  datePublication: now,
  dateLimite: ISODate("2026-09-15T21:59:00Z"),
  fichiers: [{ url: "https://example.com/demo/devoir-api.pdf", nom: "Sujet devoir API.pdf" }],
  bareme: "Qualite API 8 pts, securite 6 pts, validation 4 pts, lisibilite 2 pts",
  coefficient: 2,
  statut: "actif",
  autoriserRetard: true,
  penaliteRetard: 2,
  createdAt: now,
  updatedAt: now,
});

db.rendus.insertOne({
  tenantId,
  devoir: devoirId,
  etudiant: users.etudiant,
  fichiers: [{ url: "https://example.com/demo/rendu-nadia-api.zip", nom: "rendu-api.zip" }],
  commentaire: "Premiere version livree avec README.",
  dateRendu: ISODate("2026-09-14T18:20:00Z"),
  note: 16,
  commentaireCorrection: "Bon travail, securite a renforcer sur certains retours d'erreur.",
  corrigePar: users.formateur,
  dateCorrection: ISODate("2026-09-16T10:00:00Z"),
  statut: "corrige",
  createdAt: now,
  updatedAt: now,
});

db.presences.insertOne({
  tenantId,
  cours: coursId,
  etudiant: users.etudiant,
  heureDebut: ISODate("2026-09-08T08:02:00Z"),
  heureFin: ISODate("2026-09-08T10:58:00Z"),
  dureeMinutes: 176,
  statut: "present",
  valideEtudiant: true,
  valideFormateur: true,
  signatureEtudiant: { signedAt: ISODate("2026-09-08T08:03:00Z"), hashPreuve: "demo-signature-etudiant" },
  signatureFormateur: { signedAt: ISODate("2026-09-08T11:00:00Z"), hashPreuve: "demo-signature-formateur" },
  ipEtudiant: "127.0.0.1",
  userAgent: "Demo Browser",
  dateValidation: ISODate("2026-09-08T11:00:00Z"),
  createdAt: now,
  updatedAt: now,
});

db.notes.insertOne({
  tenantId,
  etudiant: users.etudiant,
  formateur: users.formateur,
  cohorte: cohorteId,
  matiere: "Node.js",
  moduleId: moduleApiId,
  evaluationId: devoirId,
  valeur: 16,
  coefficient: 2,
  bareme: 20,
  periode: "1er semestre",
  commentaire: "Tres bonne progression.",
  dateEvaluation: ISODate("2026-09-16T10:00:00Z"),
  publiee: true,
  publieeLe: ISODate("2026-09-16T12:00:00Z"),
  createdAt: now,
  updatedAt: now,
});

db.bulletins.insertOne({
  tenantId,
  etudiant: users.etudiant,
  cohorte: cohorteId,
  periode: "1er semestre",
  moyennes: [{ matiere: "Node.js", moyenne: 16, coefficient: 2, appreciation: "Tres bon niveau" }],
  moyenneGenerale: 16,
  absences: 0,
  retards: 0,
  appreciationGenerale: "Apprenant serieux et regulier.",
  decision: "en_cours",
  fichierPDF: "https://example.com/demo/bulletin-s1.pdf",
  hashPDF: "demo-hash-bulletin-s1",
  generePar: users.admin,
  dateGeneration: now,
  createdAt: now,
  updatedAt: now,
});

db.documents.insertOne({
  _id: documentId,
  tenantId,
  nom: "Reglement interieur CFA Digital Demo",
  type: "reglement",
  categorie: "qualiopi",
  description: "Document obligatoire a accepter avant entree en formation.",
  url: "https://example.com/demo/reglement-interieur.pdf",
  storageProvider: "cloudinary",
  publicId: "demo/reglement-interieur",
  version: 1,
  hash: "demo-hash-reglement",
  taille: 245000,
  mimeType: "application/pdf",
  destinataire: "tous",
  acceptationRequise: true,
  acceptations: [{
    etudiant: users.etudiant,
    dateAcceptation: now,
    ip: "127.0.0.1",
  }],
  confidentiel: false,
  archive: false,
  createdAt: now,
  updatedAt: now,
});

db.messages.insertMany([
  {
    tenantId,
    expediteur: users.formateur,
    cohorte: cohorteId,
    contenu: "Bienvenue dans la cohorte DWWM. Le planning est publie.",
    type: "classe",
    lu: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    tenantId,
    expediteur: users.tuteur,
    destinataire: users.admin,
    contenu: "Merci de me confirmer les prochaines etapes du contrat.",
    type: "prive",
    lu: false,
    createdAt: now,
    updatedAt: now,
  },
]);

db.notifications.insertMany([
  {
    tenantId,
    destinataire: users.etudiant,
    titre: "Planning publie",
    message: "Votre planning de formation est disponible.",
    type: "cours",
    canal: "in_app",
    lien: "/etudiant/agenda",
    lu: false,
    priorite: "normale",
    createdAt: now,
    updatedAt: now,
  },
  {
    tenantId,
    destinataire: users.tuteur,
    titre: "Apprenti rattache",
    message: "Nadia Leroy est rattachee a votre suivi tutorat.",
    type: "administratif",
    canal: "in_app",
    lien: "/tuteur",
    lu: false,
    priorite: "normale",
    createdAt: now,
    updatedAt: now,
  },
]);

db.contrats_apprentissage.insertOne({
  _id: contratId,
  tenantId,
  etudiant: users.etudiant,
  entrepriseId,
  tuteurId: users.tuteur,
  cohorte: cohorteId,
  typeContrat: "apprentissage",
  dateDebut: ISODate("2026-09-01T00:00:00Z"),
  dateFin: ISODate("2027-06-30T23:59:59Z"),
  rythmeAlternance: "3 semaines entreprise / 1 semaine CFA",
  statut: "actif",
  documents: [{ nom: "CERFA demo", url: "https://example.com/demo/cerfa.pdf" }],
  opco: { nom: "OPCO Demo", numeroDossier: "OPCO-2026-0001" },
  createdAt: now,
  updatedAt: now,
});

db.financements.insertOne({
  tenantId,
  etudiant: users.etudiant,
  entrepriseId,
  contratId,
  financeur: "OPCO",
  opco: "OPCO Demo",
  montantTotal: 8500,
  montantPrisEnCharge: 8500,
  statut: "accorde",
  echeances: [
    { date: ISODate("2026-10-01T00:00:00Z"), montant: 4250, statut: "a_facturer" },
    { date: ISODate("2027-03-01T00:00:00Z"), montant: 4250, statut: "a_facturer" },
  ],
  documents: [{ nom: "Accord prise en charge", url: "https://example.com/demo/accord-opco.pdf" }],
  createdAt: now,
  updatedAt: now,
});

db.factures.insertOne({
  _id: factureId,
  tenantId,
  numero: "FAC-2026-0001",
  clientType: "entreprise",
  clientId: entrepriseId,
  lignes: [{ libelle: "Formation DWWM - echeance 1", quantite: 1, prixHT: 4250, tva: 0 }],
  totalHT: 4250,
  tva: 0,
  totalTTC: 4250,
  statut: "emise",
  dateEmission: ISODate("2026-10-01T00:00:00Z"),
  dateEcheance: ISODate("2026-10-31T00:00:00Z"),
  fichierPDF: "https://example.com/demo/fac-2026-0001.pdf",
  createdAt: now,
  updatedAt: now,
});

db.paiements.insertOne({
  tenantId,
  factureId,
  provider: "virement",
  providerPaymentId: "VIR-DEMO-0001",
  montant: 4250,
  devise: "EUR",
  statut: "en_attente",
  metadata: { reference: "FAC-2026-0001" },
  createdAt: now,
  updatedAt: now,
});

db.quiz.insertOne({
  _id: quizId,
  tenantId,
  formationId,
  moduleId: moduleApiId,
  titre: "Quiz securite API",
  questions: [
    {
      type: "qcm",
      intitule: "Quel mecanisme permet d'authentifier une requete API ?",
      choix: ["JWT", "CSS", "HTML"],
      bonneReponse: "JWT",
      points: 5,
    },
  ],
  scoreMinimal: 70,
  tempsLimiteMinutes: 20,
  tentativesMax: 3,
  visible: true,
  createdAt: now,
  updatedAt: now,
});

db.quiz_attempts.insertOne({
  tenantId,
  quizId,
  etudiant: users.etudiant,
  reponses: [{ questionIndex: 0, reponse: "JWT", correct: true }],
  score: 100,
  reussi: true,
  startedAt: now,
  submittedAt: now,
  durationSeconds: 180,
  createdAt: now,
  updatedAt: now,
});

db.evaluations_qualite.insertOne({
  tenantId,
  cohorte: cohorteId,
  formationId,
  etudiant: users.etudiant,
  type: "entree",
  questions: [
    { question: "Les objectifs sont-ils clairs ?", note: 5 },
    { question: "L'accompagnement est-il satisfaisant ?", note: 5 },
  ],
  scoreGlobal: 5,
  commentaires: "Demarrage clair et professionnel.",
  submittedAt: now,
  createdAt: now,
  updatedAt: now,
});

db.indicateurs_qualiopi.insertOne({
  tenantId,
  formationId,
  cohorte: cohorteId,
  periode: "2026-S1",
  tauxPresence: 98,
  tauxReussite: 92,
  tauxSatisfaction: 95,
  tauxAbandon: 1,
  tauxInsertion: null,
  source: "demo",
  calculeAt: now,
  createdAt: now,
  updatedAt: now,
});

db.reclamations.insertOne({
  tenantId,
  userId: users.etudiant,
  categorie: "pedagogique",
  description: "Demande de precision sur les criteres de correction.",
  statut: "ouverte",
  priorite: "normale",
  actionsCorrectives: [],
  createdAt: now,
  updatedAt: now,
});

db.signatures.insertMany([
  {
    tenantId,
    userId: users.etudiant,
    documentId,
    ressource: "Document",
    ressourceId: documentId,
    providerSignatureId: "demo-signature-document-etudiant",
    ip: "127.0.0.1",
    userAgent: "Demo Browser",
    signedAt: now,
    hashPreuve: "demo-hash-signature-document",
    createdAt: now,
    updatedAt: now,
  },
  {
    tenantId,
    userId: users.tuteur,
    ressource: "ContratApprentissage",
    ressourceId: contratId,
    providerSignatureId: "demo-signature-contrat-tuteur",
    ip: "127.0.0.1",
    userAgent: "Demo Browser",
    signedAt: now,
    hashPreuve: "demo-hash-signature-contrat",
    createdAt: now,
    updatedAt: now,
  },
]);

db.abonnements_saas.insertOne({
  tenantId,
  plan: "enterprise",
  statut: "active",
  limites: { users: 5000, stockageGo: 500, cohortes: 200 },
  prixMensuel: 799,
  dateDebut: ISODate("2026-01-01T00:00:00Z"),
  stripeCustomerId: "cus_demo_cfa",
  stripeSubscriptionId: "sub_demo_cfa",
  createdAt: now,
  updatedAt: now,
});

db.tickets_support.insertOne({
  tenantId,
  createdBy: users.admin,
  assignedTo: users.superadmin,
  sujet: "Verification environnement demo",
  description: "Controle du bon fonctionnement de la plateforme LMS CFA.",
  priorite: "normale",
  statut: "ouvert",
  messages: [{ auteur: users.admin, contenu: "Merci de verifier la configuration Atlas.", createdAt: now }],
  piecesJointes: [],
  createdAt: now,
  updatedAt: now,
});

db.auditlogs.insertMany([
  {
    tenantId,
    userId: users.superadmin,
    action: "SEED_DATABASE",
    ressource: "Database",
    ressourceId: tenantId,
    ip: "127.0.0.1",
    niveau: "info",
    details: { script: "mongo-atlas-seed-cfa-digital.js" },
    createdAt: now,
    updatedAt: now,
  },
  {
    tenantId,
    userId: users.admin,
    action: "PLANNING_PUBLIE",
    ressource: "Cohorte",
    ressourceId: cohorteId,
    ip: "127.0.0.1",
    niveau: "info",
    details: { cohorte: "DWWM - Septembre 2026" },
    createdAt: now,
    updatedAt: now,
  },
]);

db.webhooks.insertOne({
  provider: "demo-cfa-digital",
  eventId: "evt_demo_seed_001",
  type: "seed.completed",
  payload: { tenantId: tenantId.toString(), createdAt: now },
  processed: true,
  processedAt: now,
  createdAt: now,
});

print("Seed CFA Digital termine.");
print("tenantId a utiliser sur la page de connexion: " + tenantId.toString());
print("Mot de passe commun: CfaDemo2026!");
print("Comptes:");
print("superadmin@cfa-demo.fr -> /superadmin");
print("admin@cfa-demo.fr -> /admin");
print("formateur@cfa-demo.fr -> /formateur");
print("etudiant@cfa-demo.fr -> /etudiant");
print("tuteur@cfa-demo.fr -> /tuteur");
print("entreprise@cfa-demo.fr -> /entreprise");
