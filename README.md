# 🎓 CFA Digital Platform

Plateforme complète de gestion CFA pour les admissions, formations, suivi pédagogique et communications.

---

## 🚀 Démarrage Rapide (5 minutes)

### ✅ Prérequis
- Node.js v16+
- npm
- MongoDB (Atlas ou local)

### 1️⃣ Backend
```bash
cd backend
npm install
cp .env.exemple .env
npm run dev
```
✓ Attend: `🚀 Serveur LMS CFA démarré sur le port 5000`

### 2️⃣ Frontend (nouveau terminal)
```bash
cd cfa_digital
npm install
npm run dev
```
✓ Ouvre: `http://localhost:5173`

### 3️⃣ Vérifier
- [ ] Page charge (Navbar + contenu)
- [ ] DiagnosticPanel en bas-droit = ✅ vert
- [ ] Console (F12) sans erreurs rouges

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Configuration détaillée backend + frontend |
| **[AMELIORATIONS_APPORTEES.md](./AMELIORATIONS_APPORTEES.md)** | Résumé des améliorations pour écran fonctionnel |
| **[TROUBLESHOOT.md](./TROUBLESHOOT.md)** | Dépannage complet (CORS, DB, erreurs) |
| **[cfa_digital/README.md](./cfa_digital/README.md)** | Docs frontend React + Vite |
| **[backend/.env.exemple](./backend/.env.exemple)** | Variables d'env requises |

---

## 🔧 Configuration Requise

### Backend `.env`
**Fichier:** `backend/.env`
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173,http://localhost:5176
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/cfa_digital
JWT_ACCESS_SECRET=une_cle_longue_et_aleatoire
JWT_REFRESH_SECRET=une_autre_cle_longue
```

### Frontend `.env.local`
**Fichier:** `cfa_digital/.env.local`
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_DEBUG=true
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🛠️ Problème: Écran Vide?

Vous avez `npm run dev` mais l'écran est blanc?

### Checklist Rapide
1. **DiagnosticPanel** en bas-droit
   - ✅ Vert = OK
   - ❌ Rouge = lire le message

2. **Console (F12)**
   ```
   Cherche les erreurs rouges
   ```

3. **Backend tourne?**
   ```bash
   curl http://localhost:5000/api/health
   ```

4. **Variables d'env?**
   ```bash
   # Backend
   cat backend/.env | grep CLIENT_URL
   # Doit inclure: http://localhost:5173

   # Frontend
   cat cfa_digital/.env.local | grep VITE_API_URL
   # Doit avoir: http://localhost:5000/api
   ```

**👉 [Guide Complet: TROUBLESHOOT.md](./TROUBLESHOOT.md)**

---

## 📂 Architecture

```
CFA_PROJET/
├── backend/                    # API Express + Node.js
│  ├── .env                    # Variables (configure là)
│  ├── server.js               # Point d'entrée
│  ├── app.js                  # Config Express
│  ├── config/                 # DB, mail, cloudinary
│  ├── routes/                 # API endpoints
│  ├── controllers/            # Logique métier
│  ├── models/                 # Schémas MongoDB
│  └── package.json
│
├── cfa_digital/               # Frontend React
│  ├── .env.local             # Variables (crée-le)
│  ├── src/
│  │  ├── main.jsx            # Point d'entrée React
│  │  ├── App.jsx             # Routage principal
│  │  ├── components/         # Composants réutilisables
│  │  ├── pages/              # Pages par rôle (admin, etudiant, formateur)
│  │  ├── services/           # Calls API
│  │  ├── context/            # État global (Auth, Notifications)
│  │  └── hooks/              # Custom hooks
│  └── package.json
│
├── SETUP_GUIDE.md             # 👈 Lire pour configuration complète
├── AMELIORATIONS_APPORTEES.md # 👈 Détails des fixes appliqués
└── TROUBLESHOOT.md            # 👈 Dépannage en cas de problème
```

---

## 👥 Rôles Utilisateur

| Rôle | Accès | Fonctionnalités |
|------|-------|-----------------|
| **Public** | `/` | Voir formations, candidater |
| **Étudiant** | `/etudiant/*` | Cours, notes, devoirs, documents |
| **Formateur** | `/formateur/*` | Gérer devoirs, notes, planning |
| **Admin** | `/admin/*` | Gestion cohortes, utilisateurs, finances |

---

## ✨ Nouveautés - Interfaceofonctionnelle

Les améliorations apportées rendent la plateforme **prête à l'usage professionnel:**

### ✅ Diagnostic en Temps Réel
- **DiagnosticPanel** affiche l'état de l'API
- Logs détaillés en mode debug
- Messages d'erreur clairs

### ✅ Gestion des Erreurs Robuste
- **ErrorBoundary** capture les crashes React
- Pages d'erreur au lieu d'écran blanc
- Checkliste de dépannage intégrée

### ✅ Configuration Simplifiée
- `check-config.js` vérifie la setup
- Guide de démarrage détaillé
- Variables d'env bien documentées

### ✅ Documentation Complète
- Setup, dépannage, architecture
- Exemples de code
- FAQs intégrées

---

## 🆘 Besoin d'aide?

### Problèmes Courants

**Écran blanc au démarrage**
→ [Voir TROUBLESHOOT.md - Écran vide](./TROUBLESHOOT.md#écran-vide-au-démarrage)

**Erreur CORS**
→ [Voir TROUBLESHOOT.md - CORS](./TROUBLESHOOT.md#erreurs-cors)

**MongoDB ne se connecte pas**
→ [Voir TROUBLESHOOT.md - Base de données](./TROUBLESHOOT.md#problèmes-de-base-de-données)

**Variables d'env non chargées**
→ [Voir TROUBLESHOOT.md - Env](./TROUBLESHOOT.md#problèmes-de-variables-denvironnement)

### Commande de Reset Total

Si tout est cassé:
```bash
#!/bin/bash
# Reset complet
rm -rf node_modules backend/node_modules cfa_digital/node_modules
rm -rf **/package-lock.json

# Réinstalle
npm install
cd backend && npm install && cd ..
cd cfa_digital && npm install && cd ..

# Relance
cd backend && npm run dev &
cd cfa_digital && npm run dev
```

---

## 🔗 Liens Utiles

- **[Express.js Docs](https://expressjs.com/)**
- **[React 19 Docs](https://react.dev)**
- **[Vite Docs](https://vite.dev)**
- **[Tailwind CSS](https://tailwindcss.com)**
- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
- **[Socket.io Docs](https://socket.io/docs/)**

---

## 📊 Status Actuel

✅ **Plateforme Fonctionnelle et Professionnelle**
✅ **Interface Utilisateur Affichée Normalement**
✅ **Diagnostic API en Temps Réel**
✅ **Gestion des Erreurs Robuste**
✅ **Documentation Complète**

---

**Prêt? → [SETUP_GUIDE.md](./SETUP_GUIDE.md) pour démarrer! 🚀**
