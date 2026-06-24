# ✅ Checklist - Démarrage CFA Digital en 5 minutes

## 📋 Avant de Commencer

- [ ] Node.js v16+ installé: `node --version`
- [ ] npm installé: `npm --version`
- [ ] MongoDB accessible (Atlas ou local)
- [ ] Deux terminaux prêts (l'un pour backend, l'autre pour frontend)

---

## 🔧 Backend - Terminal 1

### Étape 1: Aller dans le dossier
```bash
cd backend
```
- [ ] Vous êtes maintenant dans `backend/`

### Étape 2: Installer les dépendances
```bash
npm install
```
- [ ] Les packages s'installent (peut prendre 1-2 minutes)
- [ ] Pas d'erreurs rouges graves

### Étape 3: Créer `.env` s'il manque
```bash
cp .env.exemple .env
```
- [ ] Fichier `backend/.env` créé ou existe

### Étape 4: Configurer `.env` (crucial!)
**Édite** `backend/.env` et change:

```diff
- CLIENT_URL=http://localhost:5176
+ CLIENT_URL=http://localhost:5173,http://localhost:5176

- MONGO_URI=mongodb+srv://TAHIANA:tah123tah@...
+ MONGO_URI=mongodb+srv://VOTRE_USER:VOTRE_PASS@cluster.mongodb.net/cfa_digital
```

- [ ] `CLIENT_URL` inclut `5173`
- [ ] `MONGO_URI` a vos credentials valides
- [ ] JWT secrets configurés

### Étape 5: Démarrer le backend
```bash
npm run dev
```

**Tu dois voir:**
```
✓ 🚀 Serveur LMS CFA démarré sur le port 5000
✓ DB connectée ✅ ou équivalent
✓ Pas d'erreurs rouges
```

- [ ] Backend tourne sans erreur

---

## 🎨 Frontend - Terminal 2 (NOUVEAU TERMINAL)

### Étape 1: Aller dans le dossier
```bash
cd cfa_digital
```
- [ ] Vous êtes maintenant dans `cfa_digital/`

### Étape 2: Installer les dépendances
```bash
npm install
```
- [ ] Les packages s'installent

### Étape 3: Créer `.env.local`
```bash
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_API_DEBUG=true
VITE_SOCKET_URL=http://localhost:5000
EOF
```
- [ ] Fichier `.env.local` créé

### Étape 4: Démarrer le frontend
```bash
npm run dev
```

**Tu dois voir:**
```diff
✓ VITE v... ready in ... ms
✓ ➜  Local:   http://localhost:5173/
✓ ➜  press h to show help
```

- [ ] Frontend tourne sur port 5173

---

## 🌐 Navigateur

### Étape 1: Ouvrir l'application
Ouvre ton navigateur et va à:
```
http://localhost:5173
```

### Étape 2: Vérifier l'interface
**Tu dois voir:**
```
✓ Barre de navigation ("CFA Digital")
✓ Contenu de la page d'accueil
✓ Boutons "Formations", "Admissions", "Connexion"
✓ Footer avec copyright
```

- [ ] Page charge correctement
- [ ] Pas d'écran blanc

### Étape 3: Vérifier le diagnostic
Regarde en **bas à droite** de l'écran:

```
✅ Version verte (vert):
   ✅ API Connected
   http://localhost:5000/api

❌ Version rouge (rouge):
   ⚠️ Cannot connect to API
   [Message d'erreur détaillé]
```

- [ ] DiagnosticPanel visible
- [ ] API Connected = ✅ VERT

### Étape 4: Vérifier la console
Ouvre la console (F12 → Console):

**Tu NE dois PAS voir:**
```
❌ GET http://localhost:5000/api/... (erreur rouge)
❌ CORS policy blocked
❌ Module not found
```

**Tu DOIS voir:**
```
✓ (optionnel) 🔧 [API Config] Base URL: http://localhost:5000/api
✓ (optionnel) 📤 [API Request] GET /auth/refresh
✓ (optionnel) 📥 [API Response] 200 /auth/refresh
```

- [ ] Pas d'erreurs rouges
- [ ] Pas d'erreurs CORS
- [ ] Console clean

---

## 🧪 Tests Rapides

### Test 1: Cliquer sur "Formations"
```
http://localhost:5173/formations
```
- [ ] Page charge

### Test 2: Cliquer sur "Admissions"
```
http://localhost:5173/admissions
```
- [ ] Page charge

### Test 3: Cliquer sur "Connexion"
```
http://localhost:5173/connexion
```
- [ ] Page de login affichée
- [ ] Formulaire visible

---

## 🎯 Résultat Final

Si tout est ✅:

```
✅ Backend tourne sur port 5000
✅ Frontend tourne sur port 5173
✅ Navigateur affiche l'interface
✅ DiagnosticPanel: API Connected (vert)
✅ Console: pas d'erreurs rouges
✅ Pages se chargent correctement
✅ Plateforme FONCTIONNELLE ✨
```

---

## ⚠️ Si Quelque Chose ne Va Pas

### Symptôme: Écran Blanc
```bash
# 1. Regarde DiagnosticPanel en bas-droit
# 2. Ouvre F12 console pour erreurs rouges
# 3. Vérifie backend tourne: curl http://localhost:5000/api/health
# 4. Vérifie .env et .env.local configurés
# 5. Lis: TROUBLESHOOT.md
```

### Symptôme: Erreur CORS
```
Access to XMLHttpRequest blocked by CORS policy

Solution:
1. Arrête backend (Ctrl+C en Terminal 1)
2. Édite backend/.env
   CLIENT_URL=http://localhost:5173,http://localhost:5176
3. Redémarre: npm run dev
```

### Symptôme: "Cannot Connect to MongoDB"
```
Solution:
1. Vérifie MONGO_URI dans backend/.env
2. S'assure que ta IP est whitelistée (MongoDB Atlas)
3. Teste: mongosh "ta_connection_string"
```

### Symptôme: Port Déjà Utilisé
```
Port 5000 already in use

Solution:
1. backend/.env: PORT=5001 (ou autre)
2. cfa_digital/.env.local: VITE_API_URL=http://localhost:5001/api
3. Redémarre
```

---

## 📞 Besoin de Dépannage?

Lire dans cet ordre:

1. **TROUBLESHOOT.md** - Guide complet de dépannage
2. **SETUP_GUIDE.md** - Configuration détaillée
3. **AMELIORATIONS_APPORTEES.md** - Ce avec quoi vous travaillez
4. **README.md** - Aperçu du projet

---

## 🚀 Prochaines Étapes

Après le démarrage réussi:

1. **Tester la connexion**
   - Allez sur `/connexion`
   - Essayez un login (demandez un compte de test)

2. **Explorer l'interface**
   - Cliquez sur tous les menus
   - Testez les pages publiques

3. **Monitoring**
   - Observez les logs de terminal (backend + frontend)
   - Regarde la console du navigateur (F12)

4. **Développement**
   - Modifiez un fichier `.jsx`
   - Le frontend reload automatiquement (HMR)

---

## 📊 Vue d'Ensemble

```
Votre Ordinateur:

Terminal 1:                 Terminal 2:                Navigateur:
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Backend (Node)   │       │ Frontend (Vite)  │       │ http://5173      │
│ Port 5000        │──────→│ Port 5173        │───────│ Interface UI     │
│ npm run dev      │       │ npm run dev      │       │ DiagnosticPanel  │
│ ✅ Tourne        │       │ ✅ Tourne        │       │ ✅ Affichée      │
│ 🗄️  MongoDB      │       │ 📦 React         │       │ 🌐 Responsive   │
│ 🔐 Auth          │       │ 🚀 Vite HMR      │       │ ✨ Moderne      │
└──────────────────┘       └──────────────────┘       └──────────────────┘
        ↓                           ↓
   Backend API            Calls API → Backend
   /api/health            /auth/refresh
   /api/cohortes          /cohortes
   /api/...               /...
```

---

## ✅ Checklist Finale

```
AVANT DÉMARRAGE:
☐ Terminaux prêts
☐ Node.js installé
☐ MongoDB accessibility testé

BACKEND:
☐ cd backend
☐ npm install
☐ Fichier .env existe
☐ CLIENT_URL configuré avec 5173
☐ MONGO_URI configuré
☐ npm run dev tourne sans erreur

FRONTEND:
☐ Nouveau terminal
☐ cd cfa_digital
☐ npm install
☐ Fichier .env.local créé
☐ npm run dev tourne

NAVIGATEUR:
☐ http://localhost:5173 charge
☐ Interface visible (pas blanc)
☐ DiagnosticPanel: API Connected ✅
☐ F12 Console: pas d'erreurs rouges

TESTS:
☐ Cliquer sur "Formations" → OK
☐ Cliquer sur "Connexion" → Login page
☐ Vérifier console → clean

🎉 PLATEFORME FONCTIONNELLE ET PROFESSIONNELLE!
```

---

**Prêt? → Commencez par la Checklist ci-dessus! 🚀**

*Besoin d'aide? → Consultez TROUBLESHOOT.md*
