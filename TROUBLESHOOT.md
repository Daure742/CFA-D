# 🔧 CFA Digital - Guidecomplet de Dépannage

## Table des Matières
1. [Écran vide au démarrage](#écran-vide-au-démarrage)
2. [Erreurs CORS](#erreurs-cors)
3. [Problèmes de connexion](#problèmes-de-connexion)
4. [Problèmes de base de données](#problèmes-de-base-de-données)
5. [Problèmes de variables d'environnement](#problèmes-de-variables-denvironnement)
6. [Problèmes de performance](#problèmes-de-performance)

---

## Écran vide au démarrage

### Symptômes
- Page blanche après `npm run dev`
- Aucune erreur visible
- Connexion OK (200 en Network)

### Diagnostic
1. **Ouvre la console du développeur** (F12)
2. **Cherche la DiagnosticPanel** en bas à droite
3. **Regarde l'onglet Network** pour les appels API

### Solutions

#### Solution 1: Backend ne tourne pas
```bash
# Vérifie que le backend tourne
curl http://localhost:5000/api/health

# Si erreur, démarre le backend:
cd backend
npm run dev
```

#### Solution 2: Mauvaise URL API
**Vérifie** `.env.local` dans `cfa_digital/`:
```env
VITE_API_URL=http://localhost:5000/api  ✅
VITE_API_URL=http://5000/api            ❌ (manque localhost)
VITE_API_URL=http://localhost:3000/api  ❌ (mauvais port)
```

#### Solution 3: CORS bloquée
Message d'erreur en console:
```
Access to XMLHttpRequest blocked by CORS policy
```
**Corrige** `backend/.env`:
```env
CLIENT_URL=http://localhost:5173,http://localhost:5176
```

#### Solution 4: MongoDB non accessible
Message d'erreur en console backend:
```
Failed to connect to MongoDB
```
```bash
# Vérifie la connexion MongoDB
mongosh mongodb+srv://user:pass@cluster.mongodb.net/cfa_digital
```

---

## Erreurs CORS

### Erreur Complète
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### Cause
Le backend refuse les requêtes du frontend.

### Fix Temporaire (développement)
```javascript
// Dans backend/app.js
app.use(cors({
  origin: true,  // ⚠️ À JAMAIS en production!
  credentials: true
}));
```

### Fix Correct
**Édite** `backend/.env`:
```env
CLIENT_URL=http://localhost:5173,http://localhost:5176
```
#Redémarre le backend

---

## Problèmes de connexion

### Symptôme 1: "Email ou mot de passe incorrect"
```bash
# Vérifie que l'utilisateur existe en base
mongosh
use cfa_digital
db.users.find({ email: "test@example.com" })
```

### Symptôme 2: "Token manquant"
```javascript
// Vérifie en console du navigateur:
console.log(localStorage.getItem('authToken'))
```

### Symptôme 3: Session non restaurée au refresh
1. Ferme tous les onglets
2. Supprime les cookies (DevTools → Application → Cookies)
3. Efface localStorage: `localStorage.clear()`
4. Redémarre: `npm run dev`

---

## Problèmes de base de données

### Impossible de se connecter à MongoDB
```
MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

#### Si Mongo local (Docker)
```bash
# Démarre MongoDB en Docker
docker run -d -p 27017:27017 --name mongo mongo:latest

# Teste la connexion
mongosh mongodb://localhost:27017
```

#### Si MongoDB Atlas
1. Copie ta chaîne de connexion depuis Atlas
2. **Mets à jour** `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cfa_digital?retryWrites=true&w=majority
```
3. **Vérifie que:**
   - `username:password` sont entre `<>`
   - Le cluster existe
   - Ton IP est whitelistée (0.0.0.0/0 pour dev)

### Collections manquantes
```bash
# Crée les indexes/collections:
mongosh
use cfa_digital

# Crée une collection
db.users.insertOne({ email: "test@example.com" })
db.users.deleteOne({ email: "test@example.com" })
```

---

## Problèmes de variables d'environnement

### Fichier `.env` du backend

**Location:** `backend/.env`

**Échec de chargement:**
```javascript
// En backend/app.js
console.log('PORT:', process.env.PORT);  // undefined?
```

**Fix:**
```bash
cd backend
# Vérifie que le fichier existe:
cat .env

# S'il manque:
cp .env.exemple .env

# Redémarre:
npm run dev
```

### Fichier `.env.local` du frontend

**Location:** `cfa_digital/.env.local`

**Variables non chargées:**
```javascript
// En DevTools console
console.log(import.meta.env.VITE_API_URL);  // undefined?
```

**Fix:**
```bash
cd cfa_digital

# Crée le fichier:
cat > .env.local << EOF
VITE_API_URL=http://localhost:5000/api
VITE_API_DEBUG=true
EOF

# Stoppe et relance:
# Ctrl+C puis npm run dev
```

### `VITE_` prefix obligatoire
```env
VITE_API_URL=...    ✅ Accessible en client
API_URL=...         ❌ Pas accessible (pas de VITE_ prefix)
```

---

## Problèmes de performance

### Page lente au chargement
1. **Ouvre DevTools → Network**
2. **Cherche les requêtes lentes** (rouges/orange)
3. **Cherche les gros fichiers** (size colonne)

### Solution: Désactiver le debug Mode
```env
VITE_API_DEBUG=false  # Au lieu de true
```

### Trop de requêtes API?
```javascript
// Exemple dans un useEffect
useEffect(() => {
  loadData();  // Appelé à chaque render!
}, []);  // ✅ Dépendances vides = une seule fois
```

### Mémoire/CPU élevée
```bash
# Vérifie Node.js
node --version  # v16+ recommandé
npm --version   # NPM 8+

# Vide les caches
npm cache clean --force
rm -rf node_modules
npm install
```

---

## Checkliste de Dépannage

### ✅ Avant de demander de l'aide

- [ ] Backend tourne: `curl http://localhost:5000/api/health`
- [ ] Frontend tourne: `http://localhost:5173` charge
- [ ] `.env` backend existe avec `CLIENT_URL`
- [ ] `.env.local` frontend existe avec `VITE_API_URL`
- [ ] Console navigateur (F12) = pas d'erreurs rouges
- [ ] DiagnosticPanel montre **✅ API Connected**
- [ ] `mongosh` se connecte à MongoDB
- [ ] Node.js v16+: `node --version`

### 📋 Commandes de Reset Complet

```bash
# 1. Stop les serveurs (Ctrl+C)

# 2. Reset complet
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf cfa_digital/node_modules cfa_digital/package-lock.json

# 3. Réinstalle
npm install
cd backend && npm install && cd ..
cd cfa_digital && npm install && cd ..

# 4. Relance
cd backend && npm run dev &
cd cfa_digital && npm run dev

# 5. Ouvre http://localhost:5173
```

---

## Logs Utiles

### Backend
```bash
cd backend && npm run dev

# Tu dois voir:
# 🚀 Serveur LMS CFA démarré sur le port 5000
# DB connectée ✅
```

### Frontend
```bash
cd cfa_digital && npm run dev

# Tu dois voir:
# VITE v... ready in ... ms
# ➜  Local:   http://localhost:5173/
```

### Console Navigateur (F12 → Console)
- Pas d'erreurs rouges
- DiagnosticPanel: ✅ API Connected
- Messages: `[API] Base URL: http://localhost:5000/api`

---

## Escalade

Si rien ne fonctionne:

1. **Fournis ces infos:**
   ```bash
   # Terminal backend:
   npm run dev 2>&1 | head -20
   
   # Terminal frontend:
   npm run dev 2>&1 | head -20
   
   # Console navigateur (F12):
   console.log(import.meta.env)
   ```

2. **Envoie les logs** des 3 points ci-dessus

3. **Note:**
   - Système d'exploitation (Windows/Mac/Linux)
   - Version Node.js (`node --version`)
   - Erreurs exactes en rouge
