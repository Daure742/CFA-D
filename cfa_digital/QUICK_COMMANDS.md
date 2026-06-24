# 🚀 Commandes Rapides - CFA Digital Frontend

## 🎯 Commandes d'Exécution

### Démarrage Normal
```bash
npm run dev
```

### Démarrage Avec Port Intelligent (Recommandé)
```bash
node start-dev.js
```

### Nettoyage Complet + Redémarrage
```bash
node clean-cache.js
npm install
npm run dev
```

---

## 🛠️ Commandes d'Entretien

### Nettoyer les Caches
```bash
node clean-cache.js
```

### Build pour Production
```bash
npm run build
```

### Preview du Build
```bash
npm run preview
```

### Linting du Code
```bash
npm run lint
```

---

## 🔍 Vérification et Diagnostic

### Afficher Quel Port Est Utilisé (Windows)
```bash
netstat -ano | findstr :5173
netstat -ano | findstr :5000
```

### Afficher Quel Port Est Utilisé (Mac/Linux)
```bash
lsof -i :5173
lsof -i :5000
```

### Tester l'API Backend
```bash
curl http://localhost:5000/api/health
```

### PowerShell (Windows Alternative)
```powershell
Invoke-WebRequest http://localhost:5000/api/health
```

---

## 📋 Troubleshooting Rapide

### Interface Toujours Vide?
1. Nettoyer: `node clean-cache.js`
2. Réinstaller: `npm install`
3. Redémarrer: `npm run dev`
4. Ouvrir: `http://localhost:5173/` dans le navigateur
5. Appuyer sur F12 pour voir les logs

### Port 5173 Occupé?
```bash
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

### Erreur "Port 5173 in use"?
- Le port est occupé, la solution est appliquée maintenant
- `strictPort: true` va afficher une erreur et arrêter
- Tuer le processus ou nettoyer le cache

### Aucun Style Appliqué?
- Vérifier que `index.css` existe et contient `@tailwind`
- Nettoyer le cache: `node clean-cache.js`
- Réinstaller: `npm install`

---

## 📱 Accès à l'Application

### Local Development
- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:5000/api
- **Socket.io:** http://localhost:5000 (WebSocket)

### Tester les Routes
```bash
# Accueil
http://localhost:5173/

# Formations
http://localhost:5173/formations

# Admissions
http://localhost:5173/admissions

# Connexion
http://localhost:5173/connexion
```

---

## 📊 Configuration à Vérifier

### .env.local (Frontend)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_API_DEBUG=true
```

### .env (Backend)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://...
```

---

## 🎨 Structure de Fichiers Clés

```
cfa_digital/
├── index.html                    # Point d'entrée HTML
├── vite.config.js               # Configuration Vite
├── tailwind.config.js           # Configuration Tailwind
├── postcss.config.js            # Configuration PostCSS
├── .env.local                   # Variables d'environnement
├── start-dev.js                 # Script de démarrage intelligent
├── clean-cache.js               # Script de nettoyage
├── EMPTY_INTERFACE_FIX.md       # Guide résolution interface vide
│
├── src/
│   ├── main.jsx                 # Point d'entrée React
│   ├── App.jsx                  # Routeur principal
│   ├── index.css                # Styles Tailwind
│   ├── styles-fallback.css      # Styles de secours
│   ├── pages/                   # Pages de l'application
│   ├── components/              # Composants réutilisables
│   ├── context/                 # Context API
│   └── services/                # Services API
│
└── public/                      # Assets statiques
```

---

## ✨ Astuces Pro

### 1. Développement Plus Rapide
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd cfa_digital
npm run dev

# Terminal 3 - Tester l'API
watch "curl http://localhost:5000/api/health" 1s
```

### 2. Debugger Efficacement
- Garder F12 ouvert pendant développement
- Regarder les logs `[Main]` et `[App]`
- Chercher les onglets Network pour les requêtes API

### 3. Live Reload
- Vite recharge automatiquement quand fichiers changent
- Pas besoin de relancer `npm run dev`
- Exception: changements de `.env.local` (restart nécessaire)

### 4. Production Ready
```bash
npm run build          # Crée le dossier dist/
npm run preview        # Prévisualise le build
# Déployer le dossier dist/ sur un serveur web
```

---

## 🧪 Tests Rapides

### Test API Accessible
```bash
curl -X GET http://localhost:5000/api/health
# Doit retourner: {"status":"ok","service":"cfa-digital-api"}
```

### Test Frontend Charge
```bash
curl http://localhost:5173/
# Doit retourner le HTML avec "CFA Digital"
```

### Test CSS Compile
- Ouvrir http://localhost:5173/
- Faire F12 → Elements
- Chercher les classes `bg-gray-50` avec styles appliqués

---

## 📚 Plus d'Informations

- **Guide Complet:** Voir [EMPTY_INTERFACE_FIX.md](./EMPTY_INTERFACE_FIX.md)
- **Déploiement:** Voir [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
- **Démarrage Rapide:** Voir [../QUICK_START.md](../QUICK_START.md)

---

## 🎊 Résumé Rapide

### Normal Start
```bash
npm run dev
# Ouvrir http://localhost:5173/
```

### Smart Start (Si Port Occupé)
```bash
node start-dev.js
# Ouvrir le port suggéré
```

### Full Reset (Si Tout Casse)
```bash
node clean-cache.js
npm install
npm run dev
# Ouvrir http://localhost:5173/
```

---

**👍 Bon développement avec CFA Digital!**
