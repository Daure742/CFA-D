# 📋 Commandes Utiles - CFA Digital

Fichier: `scripts.sh` (Bash/Shell)

## 🚀 Démarrage

### Démarrer Backend Seulement
```bash
./scripts.sh backend-dev
# ou
cd backend && npm run dev
```

### Démarrer Frontend Seulement
```bash
./scripts.sh frontend-dev
# ou
cd cfa_digital && npm run dev
```

### Démarrer Backend + Frontend
```bash
./scripts.sh start-all
# Démarre le backend en background, puis le frontend
# Les deux fonctionnent en même temps ✅
```

---

## 🔍 Diagnostic & Test

### Vérifier Configuration
```bash
./scripts.sh check
# Vérifie:
# - Fichiers .env existent
# - Variables d'env configurées
# - NODE_ENV, PORT, MONGO_URI
```

### Tester API
```bash
./scripts.sh test-api
# Appelle: http://localhost:5000/api/health
# Si ✅: Backend répond correctement
# Si ❌: Backend non démarré ou erreur
```

### Tester MongoDB
```bash
./scripts.sh test-db
# Connecte directement à MongoDB
# Permet de vérifier credentials
```

### Vérifier les Ports
```bash
./scripts.sh check-ports
# Affiche:
# - Ports en écoute
# - Si port 5000 (backend) répond
# - Si port 5173 (frontend) répond
```

### Infos Système
```bash
./scripts.sh system-info
# Affiche:
# - Version Node.js
# - Version npm
# - Version Git
# - OS et architecture
```

---

## ⚙️ Configuration

### Créer .env Backend
```bash
./scripts.sh create-env-backend
# Copie depuis .env.exemple
# ⚠️ À éditer: MONGO_URI, JWT_SECRETS
```

### Créer .env.local Frontend
```bash
./scripts.sh create-env-frontend
# Crée avec les valeurs par défaut:
# VITE_API_URL=http://localhost:5000/api
# VITE_API_DEBUG=true
# VITE_SOCKET_URL=http://localhost:5000
```

---

## 🧹 Nettoyage & Reset

### Reset Complet
```bash
./scripts.sh reset-all
# 1. Supprime tous les node_modules
# 2. Supprime tous les package-lock.json
# 3. Réinstalle tout (npm install)
# 
# À utiliser si:
# - Dépendances corrompues
# - Après merge git problématique
# - Erreurs "Module not found"
```

### Nettoyer Cache npm
```bash
./scripts.sh clean-cache
# Supprime le cache npm
# Peut aider avec les installations
```

---

## 📊 Logs

### Logs Frontend
```bash
./scripts.sh logs-frontend
# Affiche les 50 dernières lignes des logs frontend
```

### Logs Backend
```bash
./scripts.sh logs-backend
# Affiche les 50 dernières lignes des logs backend
```

---

## 🔨 Build & Production

### Builder Frontend
```bash
./scripts.sh build-frontend
# Crée le dossier: cfa_digital/dist/
# Prêt pour déployer en prod
```

### Info Build Backend
```bash
./scripts.sh build-backend
# Backend n'a pas besoin de build
# Déploie juste le dossier 'backend/' en prod
```

---

## 📚 Aide

Affiche toutes les commandes disponibles:
```bash
./scripts.sh
# ou
./scripts.sh help
```

---

## 🖥️ Exemples d'Utilisation Courants

### Première Utilisation
```bash
# 1. Vérifier config
./scripts.sh check

# 2. Créer fichiers .env
./scripts.sh create-env-backend
./scripts.sh create-env-frontend

# 3. Démarrer tout
./scripts.sh start-all

# 4. Ouvrir navigateur
# http://localhost:5173
```

### Après un Git Pull (Nouvelles Dépendances)
```bash
# Reset et réinstalle
./scripts.sh reset-all

# Redémarre
./scripts.sh start-all
```

### Déboguer des Erreurs
```bash
# 1. Vérifier la config
./scripts.sh check

# 2. Tester l'API
./scripts.sh test-api

# 3. Vérifier les ports
./scripts.sh check-ports

# 4. Afficher les logs
./scripts.sh logs-backend
./scripts.sh logs-frontend

# 5. Lire: TROUBLESHOOT.md
```

### Reset Total en Cas de Problème
```bash
# 1. Arrêter les serveurs (Ctrl+C)
# 2. Reset complet
./scripts.sh reset-all

# 3. Créer les fichiers .env
./scripts.sh create-env-backend
./scripts.sh create-env-frontend

# 4. Redémarrer
./scripts.sh start-all
```

---

## ⚠️ Notes Important

### Sur Windows
- Utilise **PowerShell** ou **WSL** (Windows Subsystem for Linux)
- Ou remplace `./scripts.sh` par directement les commandes `cd` et `npm`

### Sur macOS/Linux
- Le fichier est exécutable avec: `chmod +x scripts.sh`
- Puis utiliser: `./scripts.sh commande`

### Fichiers de Configuration Créés

Après exécution, vérifiez:
- `backend/.env` - Variables backend (CLIENT_URL, MONGO_URI, JWT_SECRETS)
- `cfa_digital/.env.local` - Variables frontend (VITE_API_URL, VITE_API_DEBUG)

---

## 💡 Conseils

**Avant chaque démarrage:**
```bash
./scripts.sh check-ports
# S'assurer que 5000 et 5173 sont libres
```

**Si le port 5000 est déjà utilisé:**
```bash
# Changer PORT dans backend/.env
PORT=5001

# Puis mettre à jour frontend .env.local
VITE_API_URL=http://localhost:5001/api
```

**Pour une première utilisation propre:**
```bash
./scripts.sh reset-all && \
./scripts.sh create-env-backend && \
./scripts.sh create-env-frontend && \
./scripts.sh start-all
```

---

## 📞 Besoin d'Aide?

Si une commande ne fonctionne pas:

1. Lire: **TROUBLESHOOT.md**
2. Lancer: `./scripts.sh check`
3. Lancer: `./scripts.sh test-api`
4. Lancer: `./scripts.sh logs-backend` et `./scripts.sh logs-frontend`
5. Vérifier les fichiers `.env` et `.env.local`

✅ **Status:** Plateforme Fonctionnelle et Prête!
