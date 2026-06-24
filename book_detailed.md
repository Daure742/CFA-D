book_detailed.md — Vue détaillée avec extraits et liens vers fichiers

But: fournir extraits utiles (<=30 lignes) et un lien vers le fichier source pour référence.

1) Backend — Authentification

- Fichier : [backend/controllers/authController.js](backend/controllers/authController.js#L1-L30)
  - Rôle : logique d'inscription, login, refresh et gestion des tokens.
  - Extrait (début du fichier) :

```javascript
// controllers/authController.js - Authentification (login, refresh, forgot pwd)
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const CFA = require('../models/CFA');
const Cohorte = require('../models/Cohorte');
const transporter = require('../config/mailer');

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
    const { nom, prenom, email, motDePasse, role = 'etudiant', tenantId, formation, sessionId } = req.body;
    if (!nom || !prenom || !email || !motDePasse || !tenantId) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être renseignés' });
    }
```

Explication : montre génération des tokens et début du flux d'inscription (vérifications tenant, rôle, unicité).

2) Backend — Middleware JWT

- Fichier : [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js#L1-L20)
  - Rôle : vérification du JWT access token et injection `req.user` + `req.tenantId`.
  - Extrait :

```javascript
// middleware/authMiddleware.js - Vérification du JWT access token
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant, accès non autorisé' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-motDePasse');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Utilisateur non trouvé ou désactivé' });
    }
    req.user = user;
    req.tenantId = user.tenantId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = authMiddleware;
```

3) Backend — Modèle `User`

- Fichier : [backend/models/User.js](backend/models/User.js#L1-L30)
  - Rôle : schéma utilisateur, rôles et méthodes d'auth.
  - Extrait (démarrage du schéma + pre-save) :

```javascript
// models/User.js - Utilisateur de la plateforme (ÉTUDIANT, FORMATEUR, ADMIN)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    motDePasse: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'formateur', 'etudiant', 'tuteur', 'entreprise'],
      default: 'etudiant'
    },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
```

Explication : le modèle définit les rôles attendus (`etudiant`, `formateur`, etc.), les index et la méthode `comparePassword`.

4) Backend — Routes d'auth

- Fichier : [backend/routes/auth.routes.js](backend/routes/auth.routes.js#L1-L20)
  - Rôle : endpoints exposés pour l'auth (login, register, refresh, logout, reset password).
  - Extrait :

```javascript
const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register); // admin seulement en pratique
router.get('/sessions-ouvertes', authController.getSessionsOuvertes);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
```

5) Backend — Connexion MongoDB

- Fichier : [backend/config/db.js](backend/config/db.js#L1-L40)
  - Rôle : connexion à MongoDB Atlas avec fallback local et gestion d'erreurs.
  - Extrait :

```javascript
// config/db.js - Connexion à MongoDB Atlas
const mongoose = require('mongoose');

const getMongoUri = () => {
  const configuredUri = process.env.MONGO_URI?.trim();
  if (configuredUri) {
    return configuredUri;
  }

  const fallbackUri = 'mongodb://127.0.0.1:27017/cfa_digital';
  console.warn('⚠️ MONGO_URI non configuré. Utilisation du serveur MongoDB local :', fallbackUri);
  return fallbackUri;
};

const connectDB = async () => {
  mongoose.set('strictQuery', false);
  const mongoUri = getMongoUri();

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    if (mongoUri.startsWith('mongodb+srv://')) {
```

6) Backend — Socket handler (extraits)

- Fichier : [backend/socket/socketHandler.js](backend/socket/socketHandler.js#L1-L40)
  - Rôle : auth socket, rooms cohorte/cours, auto-emargement.
  - Extrait :

```javascript
// socket/socketHandler.js - Gestion des événements temps réel
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Nouvelle connexion socket :', socket.id);

    // Authentification socket via token
    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) throw new Error();
        socket.user = user;
        // Rejoindre la salle de sa cohorte si étudiant
        if (user.role === 'etudiant' && user.cohorte) {
          socket.join(`cohorte_${user.cohorte}`);
        }
        socket.emit('authenticated', { success: true });
      } catch (err) {
        socket.emit('authenticated', { success: false });
      }
    });
```

Explication : le handler montre l'approche pour la présence et la diffusion de messages de classe.

7) Frontend — Entrée et routes

- Fichier : [cfa_digital/src/App.jsx](cfa_digital/src/App.jsx#L1-L30)
  - Rôle : déclaration des routes publiques et protégées (`ProtectedRoute`) et structure globale.
  - Extrait :

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages publiques
import HomePage from './pages/public/HomePage';
import FormationsPage from './pages/public/FormationsPage';
import FormationDetailPage from './pages/public/FormationDetailPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import EtudiantsPage from './pages/public/EtudiantsPage';
import LoginPage from './pages/public/LoginPage';

export default function App() {
  useEffect(() => {
    // Debug logging pour s'assurer que l'App s'est bien montée
    console.log('✅ [App] Composant App rendu avec succès');
```

- Fichier : [cfa_digital/src/main.jsx](cfa_digital/src/main.jsx#L1-L40)
  - Rôle : point d'entrée, providers `AuthProvider`, `NotifProvider`, `Toaster`.
  - Extrait :

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import DiagnosticPanel from './components/DiagnosticPanel';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotifProvider>
            <App />
```

8) Frontend — Composant `Navbar`

- Fichier : [cfa_digital/src/components/Navbar.jsx](cfa_digital/src/components/Navbar.jsx#L1-L30)
  - Rôle : navigation horizontale, menu responsive, accès selon rôle.
  - Extrait :

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotifDropdown from './NotifDropdown';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const workspaceLinks = {
    superadmin: { to: '/superadmin', label: 'Superadmin' },
    admin: { to: '/admin', label: 'Administration' },
    formateur: { to: '/formateur', label: 'Espace formateur' },
```

9) Seeds / données demo

- Fichier : [mongo-atlas-seed-cfa-digital.js](mongo-atlas-seed-cfa-digital.js#L1-L30)
  - Rôle : script complet de seed pour MongoDB Atlas (données demo, indexes).
  - Extrait :

```javascript
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
```

10) Fichiers vides / exemples suggérés

- `cfa_digital/src/hooks/useSocket.js` (existant mais vide) — fichier disponible mais sans contenu. Je fournis ci‑dessous un "exemple suggéré" (ne modifie pas le projet) :

```javascript
// SUGGESTION (ne pas appliquer automatiquement) — hook useSocket minimal
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function useSocket(token) {
  const socketRef = useRef(null);
  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || '/', { auth: { token } });
    socket.emit('authenticate', token);
    socketRef.current = socket;
    return () => socket.disconnect();
  }, [token]);
  return socketRef;
}
```

- `scripts/seed.js` (existant mais vide) — prévu pour seed local; utiliser `mongo-atlas-seed-cfa-digital.js` ou compléter `scripts/seed.js` selon besoin.

---

Fin de `book_detailed.md`.

Remarque finale : tous les liens ci‑dessus renvoient à des fichiers existants dans le dépôt; les extraits fournis sont limités à 30 lignes pour lecture rapide. Si vous souhaitez que j'extraie d'autres fichiers (controllers, modèles, components spécifiques) ou que je produise `book_detailed.pdf`, dites lesquels et j'ajoute la suite.
