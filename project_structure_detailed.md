Structure complète détaillée — projet CFA_PROJET (imprimable)

But: fournir une vue complète, lisible et commentée du projet en respectant les conventions demandées (usage de `etudiant`/`formateur`, pas `eleve`/`professeur`, etc.).

1) Racine du workspace

./
├── ACTION_PLAN.md                ← plan d'actions
├── README.md                     ← description générale, premiers pas
├── QUICK_START.md                ← démarrage rapide
├── SETUP_GUIDE.md                ← guide d'installation détaillé
├── DEPLOYMENT_GUIDE.md           ← instructions de déploiement
├── PROMPT_CREATION_LIVRE.md      ← prompt maître pour génération du livre
├── DATABASE_STRUCTURE_MONGODB_ATLAS.md ← schéma collections MongoDB (exemples/seed)
├── mongo-atlas-seed-cfa-digital.js ← script seed pour MongoDB Atlas
├── verify-project.js             ← vérifications automatiques du repo
├── check-config.js               ← checks environnement/dev
├── scripts.sh                    ← utilitaires shell cross-platform
├── scripts/                       ← scripts transverses
│   └── seed.js                   ← script de seed/fixtures
├── book.md                       ← vue imprimable (générée)
└── project_structure_detailed.md ← (ce fichier)

2) Backend — `backend/`

backend/
├── package.json                  ← scripts: dev, start, test, lint
├── tsconfig.json                 ← si TS utilisé
├── app.js                        ← configuration Express (middlewares globaux)
├── server.js                     ← point d'entrée de production
├── testServer.js                 ← point d'entrée pour tests
├── config/
│   ├── db.js                     ← mongoose.connect (MongoDB Atlas)
│   ├── cors.js
│   ├── cloudinary.js
│   └── mailer.js
├── controllers/                  ← un controller par ressource
│   ├── authController.js
│   ├── cfaController.js
│   ├── cohorteController.js
│   ├── coursController.js
│   ├── devoirController.js
│   ├── etudiantController.js
│   ├── formateurController.js
│   └── noteController.js
├── routes/                       ← routeurs express (associent controllers)
│   ├── auth.routes.js
│   ├── etudiant.routes.js
│   ├── formateur.routes.js
│   ├── cours.routes.js
│   ├── devoir.routes.js
│   ├── document.routes.js
│   ├── note.routes.js
│   ├── presence.routes.js
│   ├── notification.routes.js
│   ├── message.routes.js
│   └── admin.routes.js
├── middleware/
│   ├── authMiddleware.js         ← verifyJWT, extrait user
│   ├── roleMiddleware.js         ← requireRole(...)
│   ├── tenantMiddleware.js       ← injecte tenantId à la requête
│   └── auditLogger.js            ← journalisation Qualiopi (userId, action, ip, timestamp)
├── models/                       ← schémas Mongoose (naming: `User`, `Cohorte`, ...)
│   ├── User.js                   ← role: etudiant | formateur | admin | superadmin
│   ├── CFA.js
│   ├── Cohorte.js                ← etudiants[] formateurs[]
│   ├── Cours.js                  ← formateur_id
│   ├── Presence.js               ← etudiant_id
│   ├── Devoir.js
│   ├── Rendu.js                  ← etudiant_id
│   ├── Note.js                   ← etudiant_id + formateur_id
│   ├── Bulletin.js               ← etudiant_id
│   ├── Document.js
│   ├── Notification.js
│   ├── Message.js
│   ├── Candidature.js
│   └── AuditLog.js               ← Qualiopi: userId, action, ressource, ip, timestamp
├── utils/
│   ├── generatePDF.js            ← Puppeteer templates → PDF
│   ├── sendMail.js               ← nodemailer wrappers
│   ├── calcMoyenne.js
│   └── storage.js                ← abstraction provider (S3/Cloudinary)
├── socket/
│   └── socketHandler.js          ← Socket.io (présence, notifications, chat)
├── scripts/
│   ├── create-monthly-cohorts.js
│   └── simulate-socket-join.js
├── tests/
│   └── presence.socket.test.js
└── .env.example                   ← variables d'environnement requises

Notes backend
- Conventions de noms: utiliser `etudiant` / `formateur` partout dans les routes, modèles et services.
- Sécurité: `password` uniquement hashé (bcrypt), `refreshToken` stocké en hash.
- Multi-tenant: toutes les collections possèdent `tenantId`.

3) Frontend — `cfa_digital/` (React + Vite)

cfa_digital/
├── package.json
├── vite.config.js
├── tsconfig.json (si TS)
├── index.html
├── start-dev.js
├── start.js
├── kill-port.js
├── eslint.config.js
├── postcss.config.js
├── tailwind.config.js
├── public/
│   └── (assets statiques)
├── src/
│   ├── main.jsx                  ← point d'entrée React
│   ├── App.jsx                   ← routes React Router v6
│   ├── App.css
│   ├── index.css
│   ├── assets/                   ← images, fonts, logos
│   ├── components/
│   │   ├── Navbar.jsx            ← navigation horizontale
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx    ← garde JWT + rôle
│   │   ├── NotifDropdown.jsx     ← cloche + notifications live via Socket.io
│   │   └── ui/                   ← Button, Card, Badge, Modal, Spinner
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.jsx
│   │   │   ├── FormationsPage.jsx
│   │   │   ├── FormationDetailPage.jsx
│   │   │   ├── AdmissionsPage.jsx
│   │   │   ├── EtudiantsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── etudiant/
│   │   │   ├── EtudiantDashboard.jsx
│   │   │   ├── EtudiantAgenda.jsx
│   │   │   ├── EtudiantCours.jsx
│   │   │   ├── EtudiantDevoirs.jsx
│   │   │   ├── EtudiantDocuments.jsx
│   │   │   ├── EtudiantNotes.jsx
│   │   │   ├── EtudiantMessages.jsx
│   │   │   └── EtudiantProfil.jsx
│   │   ├── formateur/
│   │   │   ├── FormateurDashboard.jsx
│   │   │   ├── FormateurClasses.jsx
│   │   │   ├── FormateurDevoirs.jsx
│   │   │   ├── FormateurNotes.jsx
│   │   │   └── FormateurMessages.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminEtudiants.jsx
│   │       ├── AdminFormateurs.jsx
│   │       ├── AdminCohortes.jsx
│   │       ├── AdminPlanning.jsx
│   │       ├── AdminFinances.jsx
│   │       ├── AdminCandidatures.jsx
│   │       └── AdminRapports.jsx
│   ├── context/
│   │   ├── AuthContext.jsx       ← JWT + user connecté
│   │   └── NotifContext.jsx      ← notifications Socket.io
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useSocket.js
│   ├── services/
│   │   ├── api.js                ← axios instance + interceptors (refresh token)
│   │   ├── authService.js
│   │   ├── etudiantService.js
│   │   ├── formateurService.js
│   │   ├── coursService.js
│   │   └── devoirService.js
│   └── styles-fallback.css
└── README.md                      ← notes front spécifiques

Notes frontend
- Patterns: composants fonctionnels + hooks (useState/useEffect/useContext).
- Form validation: React Hook Form + Yup recommandé pour `Login`, `ResetPassword`, formulaires admin.
- Socket.io usage: notifications et présence en temps réel via `useSocket` et `NotifContext`.

4) Structure MongoDB / Collections (extrait et complet recommandé)

Collections principales (voir `DATABASE_STRUCTURE_MONGODB_ATLAS.md` pour détails):
- cfas
- users
- candidatures
- cohortes
- cours
- presences
- devoirs
- rendus
- notes
- bulletins
- documents
- messages
- notifications
- auditlogs

Collections additionnelles recommandées:
- formations, modules, ressources_pedagogiques, progressions
- entreprises, contrats_apprentissage, financements, factures, paiements
- abonnements_saas, tickets_support, incidents
- evaluations_qualite, indicateurs_qualiopi, reclamations
- sessions_auth, signatures, webhooks

Règles DB essentielles
- Tous les documents métiers incluent `tenantId`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- Suppressions logiques (`isDeleted`, `deletedAt`, `deletedBy`).
- Indexs par `tenantId` pour performance SaaS.

5) Outils dev & config

- `.env.example` (racine ou `backend/`) ← lister variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SMTP_*`, `CLOUDINARY_*`, `STRIPE_*`.
- VS Code: recommander `eslint`, `prettier`, `vscode-icons`, `ms-azuretools.vscode-docker`, `dbaeumer.vscode-eslint`.
- Docker: `docker-compose.yml` (non présent) recommandé pour dev: services `mongo`, `mongo-express` (optionnel), `backend`, `frontend`.

6) CI / CD et tests

- `backend/tests/` contient tests d'intégration/unitaires (ex: `presence.socket.test.js`).
- Recommander scripts npm: `lint`, `test`, `format`, `build`, `start`, `dev`.
- CI pipeline: GitHub Actions (workflow: install, lint, test, build, deploy).

7) Bonnes pratiques et conventions

- Ne pas utiliser `eleve` / `professeur` — utiliser `etudiant` / `formateur`.
- Chaque route API vérifie `tenantId` via `tenantMiddleware`.
- Auth: tokens courts (JWT) + refresh token hashed en DB.
- Audit: toute action sensible déclenche `auditLogger` (Qualiopi).
- Seed: `mongo-atlas-seed-cfa-digital.js` et `scripts/seed.js` contiennent données de démarrage.

8) Où trouver rapidement
- Auth & sécurité: `backend/controllers/authController.js`, `backend/middleware/authMiddleware.js`
- Modèles: `backend/models/User.js`, `backend/models/Cohorte.js`
- Seed DB: `mongo-atlas-seed-cfa-digital.js`, `scripts/seed.js`
- Front entry: `cfa_digital/src/main.jsx`, `cfa_digital/src/App.jsx`
- WebSockets: `backend/socket/socketHandler.js`, `cfa_digital/src/hooks/useSocket.js`

---
Fin de `project_structure_detailed.md`.

Si vous voulez, je peux maintenant :
- générer `book_detailed.md` avec extraits de code et liens précis vers fichiers;
- créer un `docker-compose.yml` dev minimal pour backend + mongo;
- extraire et afficher le contenu d'un fichier précis (indiquez le chemin).
