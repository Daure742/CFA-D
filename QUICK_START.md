# 🎓 CFA Digital Platform - Guide de Démarrage Rapide

## 📋 Vue d'Ensemble

CFA Digital est une plateforme complète de gestion des formations en alternance, incluant:
- 🎯 **Admissions** - Candidatures en ligne
- 👥 **Gestion Étudiants** - Tableaux de bord personnalisés
- 📚 **Suivi Pédagogique** - Notes, devoirs, cours, messages
- 👨‍🏫 **Espace Formateurs** - Gestion des classes et évaluations
- ⚙️ **Administration** - Dashboards et rapports

---

## 🚀 Démarrage en 5 Minutes

### 1. Vérifier les Prérequis
```bash
# Node.js (version 16+)
node -v

# npm
npm -v
```

### 2. Démarrer le Backend
```bash
cd backend
npm install
npm run dev
```

**Attendu:** 
```
🚀 Serveur LMS CFA démarré sur le port 5000
✅ MongoDB connecté
```

### 3. Démarrer le Frontend (Nouveau Terminal)
```bash
cd cfa_digital
npm install
npm run dev
```

**Attendu:**
```
✅ Local: http://localhost:5173
```

### 4. Ouvrir dans le Navigateur
- Aller à: **http://localhost:5173/**
- Vous devez voir la page d'accueil avec le logo "CFA Digital"

---

## 📖 Architecture

```
CFA_PROJET/
├── backend/                  # 🔧 API Node.js + Express
│   ├── config/              # Configurations (DB, Mail, Cloudinary)
│   ├── controllers/         # Logique métier
│   ├── models/              # Modèles MongoDB
│   ├── routes/              # Endpoints API
│   ├── middleware/          # Auth, Roles, Audit
│   ├── socket/              # Notifications temps réel
│   └── .env                 # Variables d'environnement
│
└── cfa_digital/             # ⚛️ Interface React
    ├── src/
    │   ├── pages/          # Pages/routes
    │   ├── components/     # Composants réutilisables
    │   ├── hooks/          # Hooks personnalisés
    │   ├── context/        # Context API (Auth, Notifications)
    │   ├── services/       # API client, authentification
    │   └── main.jsx        # Point d'entrée
    ├── .env.local          # Variables frontend
    └── vite.config.js      # Configuration build
```

---

## 🛠️ Commandes Principales

### Backend
```bash
cd backend

# Développement avec hot reload
npm run dev

# Production
npm start

# Vérifier la syntaxe
npm run check
```

### Frontend
```bash
cd cfa_digital

# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

---

## 🔐 Variables d'Environnement

### Backend (.env)
```env
# Port du serveur
PORT=5000

# Environnement
NODE_ENV=development

# URLs clients autorisées (CORS)
CLIENT_URL=http://localhost:5173,http://localhost:5176

# MongoDB
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/cfa_digital

# JWT Secrets
JWT_ACCESS_SECRET=votre_secret_access_long_et_complexe
JWT_REFRESH_SECRET=votre_secret_refresh_long_et_complexe

# Durées JWT
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe

# Cloudinary (optionnel)
CLOUDINARY_NAME=votre_cloud_name
CLOUDINARY_KEY=votre_key
CLOUDINARY_SECRET=votre_secret
```

### Frontend (.env.local)
```env
# URL API
VITE_API_URL=http://localhost:5000/api

# URL Socket.io
VITE_SOCKET_URL=http://localhost:5000

# Debug mode
VITE_API_DEBUG=true
```

---

## 📊 Fonctionnalités Principales

### Page d'Accueil
✅ Présentation de la plateforme
✅ Statistiques clés
✅ Appel à l'action (Formations, Candidatures)
✅ FAQ interactive
✅ Lien vers espace étudiant

### Espace Étudiant (`/etudiant`)
✅ Tableau de bord personnel
✅ Agenda et emploi du temps
✅ Liste des cours
✅ Devoirs à rendre
✅ Consultation des notes
✅ Documents centralisés
✅ Messagerie interne
✅ Profil et paramètres

### Espace Formateur (`/formateur`)
✅ Tableau de bord
✅ Gestion des classes
✅ Publication des devoirs
✅ Saisie des notes
✅ Messagerie avec étudiants

### Espace Admin (`/admin`)
✅ Vue d'ensemble
✅ Gestion des étudiants
✅ Gestion des formateurs
✅ Configuration des cohortes
✅ Planning et calendrier
✅ Suivi financier
✅ Gestion des candidatures
✅ Rapports et analytiques

---

## 🔗 Routes Principales

| Route | Description | Accès |
|-------|-------------|-------|
| `/` | Page d'accueil | Public |
| `/formations` | Catalogue des formations | Public |
| `/admissions` | Formulaire de candidature | Public |
| `/connexion` | Authentification | Public |
| `/etudiant` | Espace étudiant | Authentifié (Étudiant) |
| `/formateur` | Espace formateur | Authentifié (Formateur) |
| `/admin` | Administration | Authentifié (Admin) |

---

## 🔧 Dépannage

### Le frontend affiche une interface vide
1. Ouvrir la console (`F12`)
2. Chercher les erreurs rouges
3. Vérifier que le backend tourne sur le port 5000
4. Vérifier la variable `VITE_API_URL` dans `.env.local`
5. Exécuter: `npm install && npm run dev`

### Le backend n'accepte pas les requêtes du frontend
1. Vérifier que `CLIENT_URL` dans `.env` contient `http://localhost:5173`
2. Vérifier que CORS est activé dans `app.js`
3. Relancer le backend: `npm run dev`

### MongoDB ne se connecte pas
1. Vérifier la chaîne `MONGO_URI` dans `.env`
2. Vérifier que user/password sont corrects
3. Vérifier la connexion internet
4. Tester manuellement: `mongodb+srv://user:pass@cluster...`

### Socket.io ne se connecte pas (pas de notifications)
1. Vérifier que `VITE_SOCKET_URL` est configuré
2. Vérifier que le backend accepte les connexions Socket
3. Ouvrir l'onglet `Network` dans DevTools et chercher `ws://`

---

## 📈 Scripts de Vérification

### Vérifier la configuration du projet
```bash
node verify-project.js
```

Cela affichera:
- ✅ Tous les fichiers essentiels
- ✅ Configuration d'environnement
- ✅ Dépendances requises
- 📊 Santé globale du projet

---

## 🌐 Déploiement

### Backend (Exemple: Heroku)
```bash
cd backend
git push heroku main
```

### Frontend (Exemple: Vercel)
```bash
cd cfa_digital
npm run build
# Déployer le dossier 'dist'
```

---

## 📚 Documentation API

Retrouvez dans le dossier `backend/`:
- `routes/` - Endpoints disponibles
- `controllers/` - Logique des requêtes
- `models/` - Structure des données

Exemple d'endpoint:
```
POST /api/auth/login
Body: { email, password, tenantId }
Response: { accessToken, user }
```

---

## 🤝 Support

### Problèmes Courants
Voir le fichier [TROUBLESHOOT.md](./TROUBLESHOOT.md) pour les solutions détaillées.

### Guide Complet  
Voir le fichier [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) pour les instructions complètes.

---

## 📝 Checklist de Démarrage

- [ ] **Backend démarré** - Port 5000 ✅
- [ ] **Frontend démarré** - Port 5173 ✅
- [ ] **Interface visible** - Voir la homepage ✅
- [ ] **API connectée** - Diagnostic Panel vert ✅
- [ ] **Navigation fonctionne** - Essayer les liens ✅
- [ ] **Console propre** - Pas d'erreurs rouges ✅

---

## 🎉 Bravo!

Votre plateforme CFA Digital est maintenant fonctionnelle! Le projet inclut:

✨ **Frontend complet** avec React + React Router + TailwindCSS
✨ **Backend scalable** avec Node.js + Express + MongoDB
✨ **Authentification robuste** avec JWT
✨ **Base de données moderne** avec Mongoose
✨ **Notifications temps réel** avec Socket.io
✨ **Gestion multi-tenant** pour plusieurs CFA
✨ **Audit logging** pour la traçabilité
✨ **Interface responsive** adaptée mobile/desktop

---

**📞 Besoin d'aide?** Consultez les fichiers de documentation ou vérifiez la console du navigateur pour les messages d'erreur détaillés.

**🎊 Bonne chance avec CFA Digital!**
