book: Description imprimable de l'arborescence du projet "CFA_PROJET"

Introduction

Ce document fournit une vue imprimable et commentée de l'arborescence du projet « CFA_PROJET ». Il est destiné à donner en un coup d'œil la structure, le rôle des dossiers et fichiers principaux, et des indications rapides pour se repérer (où trouver le frontend, le backend, les scripts utiles, etc.).

Résumé rapide

- Projet racine: contient guides, scripts généraux et deux applications principales : `backend/` (API Node.js/Express) et `cfa_digital/` (frontend React + Vite).
- Base de données: usage principal MongoDB (scripts de seed et documentation inclus).

Arborescence et explications (dossier → rôle + fichiers clés)

Racine (./)
- ACTION_PLAN.md : plan d'actions projet.
- README.md : présentation générale du projet (lire en premier).
- QUICK_START.md, SETUP_GUIDE.md, DEPLOYMENT_GUIDE.md : guides d'installation et déploiement.
- mongo-atlas-seed-cfa-digital.js : script de seed pour MongoDB Atlas.
- verify-project.js, check-config.js : outils de vérification du projet.
- PROMPT_CREATION_LIVRE.md : prompt maître créé pour générer le livre/manuel.

Conseil : commencez par `README.md` puis `QUICK_START.md` pour lancer rapidement l'environnement local.

Dossier `backend/` — API et logique serveur
- Rôle : contient l'API REST en Node.js/Express, modèles Mongoose (ou équivalents), contrôleurs, routes, middlewares, utilitaires et scripts backend.
- Fichiers principaux :
  - `app.js` : configuration principale d'Express (middleware, routes globales).
  - `server.js` / `testServer.js` : points d'entrée pour lancer le serveur.
  - `package.json` : dépendances et scripts (ex: `npm run dev`).
  - `tsconfig.json` : configuration TypeScript si utilisée.
- Sous-dossiers :
  - `config/` : configurations (DB, CORS, mailer, cloudinary). Ex. `backend/config/db.js` gère la connexion Mongo.
  - `controllers/` : logique métier exposée par les routes (ex. `authController.js`, `etudiantController.js`).
  - `routes/` : déclaration des routes express (ex. `auth.routes.js` associe endpoints d'authentification aux contrôleurs).
  - `middleware/` : middlewares transverses (authentification JWT dans `authMiddleware.js`, gestion des rôles, logging d'audit).
  - `models/` : schémas et modèles de données (ex. `User.js`, `Cohorte.js`, `Presence.js`).
  - `utils/` : utilitaires (envoi d'e-mails, génération de PDF, stockage).
  - `scripts/` : scripts d'automatisation liés au backend (ex. création mensuelle de cohortes).
  - `socket/` : gestion WebSocket / Socket.io (`socketHandler.js`).
  - `tests/` : tests unitaires ou d'intégration (ex. `presence.socket.test.js`).

Conseils pratiques backend :
- Vérifiez `backend/package.json` pour les scripts (dev, start, test).
- Pour local DB dev, utilisez `mongo-atlas-seed-cfa-digital.js` ou `scripts/seed.js`.

Dossier `cfa_digital/` — Frontend React
- Rôle : application frontend (Vite + React) qui constitue l'interface utilisateur.
- Fichiers principaux :
  - `package.json` : scripts front (start, build), dépendances.
  - `index.html`, `src/main.jsx` : point d'entrée Vite/React.
  - `src/App.jsx` : composant racine.
  - `src/components/` : composants UI réutilisables.
  - `src/context/` : providers React Context (auth, tenant, etc.).
  - `vite.config.js`, `tsconfig.json` : configuration de build/dev.
- Fichiers utilitaires : `start-dev.js`, `start.js`, `kill-port.js`.
- Configs et aides : `eslint.config.js`, `postcss.config.js`, `tailwind.config.js`.

Conseils pratiques frontend :
- Pour lancer en dev : `cd cfa_digital && npm install && npm run dev` (consulter `QUICK_COMMANDS.md`).
- Cherchez l'intégration des appels API vers `/api/*` dans les hooks ou services réseau (ex. `src/services` si présent).

Dossier `scripts/` (racine)
- Contient utilitaires de seed et scripts transverses : `scripts/seed.js`.
- Usage : scripts automatiques à lancer ponctuellement (seed DB, migrations simples).

Fichiers de documentation et guides
- `CHECKLIST.md`, `VERIFICATION_COMPLETE.md`, `VERIFICATION_MODULES_PEDAGOGIQUES.md` : listes de contrôle et vérifications pour la livraison.
- `DEPLOYMENT_GUIDE.md` : instructions pour déployer (cloud ou Docker).
- `SETUP_GUIDE.md`, `QUICK_START.md` : démarrage local détaillé.

Exemples d'endroits clés pour trouver des fonctionnalités spécifiques
- Authentification / JWT : cherchez `backend/controllers/authController.js` et `backend/middleware/authMiddleware.js`.
- Modèles utilisateurs, rôles et permissions : `backend/models/User.js` et `backend/middleware/roleMiddleware.js`.
- WebSockets (présence, notifications) : `backend/socket/socketHandler.js` et `backend/tests/presence.socket.test.js`.
- Seed / données de demo : `mongo-atlas-seed-cfa-digital.js` et `scripts/seed.js`.
- Frontend : composant d'auth/login probable dans `cfa_digital/src/components/`.

Checklist rapide pour exploration
1. Lire `README.md` puis `QUICK_START.md`.
2. Installer dépendances backend et frontend :

```bash
# PowerShell / CMD (Windows)
cd backend
npm install
cd ../cfa_digital
npm install
```

3. Lancer DB (local ou docker / Atlas) — voir `DEPLOYMENT_GUIDE.md`.
4. Lancer backend : `cd backend && npm run dev`.
5. Lancer frontend : `cd cfa_digital && npm run dev`.
6. Tester endpoints essentiels : `/api/auth`, `/api/users`, `/api/cohortes`.

Notes sur contribution et modifications
- Ne modifiez pas les scripts de seed en production sans revue (ils peuvent réinitialiser des données).
- Respectez les middlewares d'auth et de tenant lors de l'ajout de routes.

Annexes utiles à imprimer
- Carte rapide : Backend (api) ↔ Frontend (UI) ↔ MongoDB (données).
- Emplacements des configurations sensibles : `backend/config/db.js`, `backend/config/mailer.js`, variables d'environnement (.env attendu mais non listé explicitement).

Fermeture

Ce `book.md` est conçu pour être imprimé ou exporté en PDF comme guide d'architecture et d'orientation dans le dépôt. Si vous souhaitez une version plus détaillée (par dossier, avec extraits de code et liens directs vers fichiers), je peux générer `book_detailed.md` contenant extraits et exemples prêts à copier.
