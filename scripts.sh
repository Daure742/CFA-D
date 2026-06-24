##!/bin/bash
# CFA Digital - Commandes Utiles pour Développement

# ============================================================
# 🚀 DÉMARRAGE RAPIDE
# ============================================================

# Démarrer backend seulement
backend-dev() {
  cd backend
  npm run dev
}

# Démarrer frontend seulement
frontend-dev() {
  cd cfa_digital
  npm run dev
}

# Démarrer les deux (backend en background)
start-all() {
  echo "Démarrage backend..."
  cd backend && npm run dev &
  PID=$!
  sleep 3
  echo ""
  echo "Démarrage frontend..."
  cd ../cfa_digital && npm run dev
  echo ""
  echo "Press Ctrl+C to stop all"
  wait $PID
}

# ============================================================
# 🔍 DIAGNOSTIC
# ============================================================

# Vérifier la configuration
check() {
  node check-config.js
}

# Tester l'API
test-api() {
  echo "Test API backend..."
  curl http://localhost:5000/api/health
  echo ""
}

# Vérifier MongoDB
test-db() {
  echo "Test MongoDB connection..."
  mongosh mongodb+srv://TAHIANA:tah123tah@cluster0.65ddwsk.mongodb.net/cfa_digital?retryWrites=true
}

# Afficher logs frontend
logs-frontend() {
  npm --prefix cfa_digital run dev 2>&1 | tail -50
}

# Afficher logs backend
logs-backend() {
  npm --prefix backend run dev 2>&1 | tail -50
}

# ============================================================
# 🧹 NETTOYAGE
# ============================================================

# Reset complet (installer tout de zéro)
reset-all() {
  echo "Nettoyage..."
  rm -rf node_modules backend/node_modules cfa_digital/node_modules
  rm -rf **/package-lock.json
  
  echo "Réinstallation..."
  npm install
  cd backend && npm install && cd ..
  cd cfa_digital && npm install && cd ..
  
  echo "✅ Reset complet terminé"
}

# Vider cache npm
clean-cache() {
  npm cache clean --force
  echo "✅ Cache npm nettoyé"
}

# ============================================================
# 🔧 UTILITAIRES
# ============================================================

# Créer fichier .env.local frontend s'il manque
create-env-frontend() {
  if [ ! -f cfa_digital/.env.local ]; then
    cat > cfa_digital/.env.local << EOF
VITE_API_URL=http://localhost:5000/api
VITE_API_DEBUG=true
VITE_SOCKET_URL=http://localhost:5000
EOF
    echo "✅ cfa_digital/.env.local créé"
  else
    echo "⚠️  cfa_digital/.env.local existe déjà"
  fi
}

# Créer fichier .env backend s'il manque
create-env-backend() {
  if [ ! -f backend/.env ]; then
    cp backend/.env.exemple backend/.env
    echo "✅ backend/.env créé depuis .env.exemple"
    echo "   ⚠️  À ÉDITER: MONGO_URI, JWT_SECRETS"
  else
    echo "⚠️  backend/.env existe déjà"
  fi
}

# Build frontend
build-frontend() {
  cd cfa_digital
  npm run build
  cd ..
  echo "✅ Build frontend terminé (dossier: dist/)"
}

# Build backend (copier en production)
build-backend() {
  echo "Backend n'a pas besoin de build (Node.js)"
  echo "Copie simplement le dossier 'backend/' en prod"
}

# ============================================================
# 📊 INFOS
# ============================================================

# Afficher infos système
system-info() {
  echo "✓ Node.js version:"
  node --version
  echo ""
  echo "✓ npm version:"
  npm --version
  echo ""
  echo "✓ Git version:"
  git --version
  echo ""
  echo "✓ OS:"
  uname -a
}

# Afficher les ports utilisés
check-ports() {
  echo "Ports en utilisation:"
  netstat -tuln | grep LISTEN | grep -E "5000|5173"
  echo ""
  echo "Backend (5000) en cours?"
  curl -s http://localhost:5000/api/health && echo "✅ Oui" || echo "❌ Non"
  echo ""
  echo "Frontend (5173) en cours?"
  curl -s http://localhost:5173 && echo "✅ Oui" || echo "❌ Non"
}

# ============================================================
# 📚 AIDE
# ============================================================

help() {
  cat << EOF
🎓 CFA Digital - Commandes Utiles

DÉMARRAGE:
  backend-dev        Démarrer backend seulement
  frontend-dev       Démarrer frontend seulement
  start-all          Démarrer backend + frontend ensemble
  check              Vérifier la configuration

DIAGNOSTIC:
  test-api           Tester la connexion à l'API
  test-db            Tester la connexion MongoDB
  check-ports        Vérifier les ports actifs
  system-info        Infos système (Node, npm, OS)

CONFIGURATION:
  create-env-backend Créer .env backend
  create-env-frontend Créer .env.local frontend

NETTOYAGE:
  reset-all          Reset complet (npm install tout)
  clean-cache        Vider le cache npm

BUILD:
  build-frontend     Builder le frontend (prod)
  build-backend      Info build backend

AUTRES:
  logs-frontend      Afficher logs frontend
  logs-backend       Afficher logs backend
  help               Afficher cette aide

EXEMPLES:
  ./scripts.sh start-all
  ./scripts.sh test-api
  ./scripts.sh check
  ./scripts.sh reset-all

📚 DOCUMENTATION:
  - README.md                    Présentation générale
  - SETUP_GUIDE.md              Configuration détaillée
  - TROUBLESHOOT.md             Dépannage complet
  - AMELIORATIONS_APPORTEES.md  Résumé des améliorations

EOF
}

# ============================================================
# MAIN
# ============================================================

# Si pas d'argument, afficher aide
if [ $# -eq 0 ]; then
  help
else
  # Exécuter la fonction passée en argument
  "$@"
fi
