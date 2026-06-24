# CFA Digital - Guide de Démarrage

## Configuration Rapide

### Prérequis
- Node.js v16+ et npm
- MongoDB (Atlas ou local)
- Compte Cloudinary (optionnel, pour les images)

### Backend

1. **Installe les dépendances**
   ```bash
   cd backend
   npm install
   ```

2. **Configure l'environnement**
   ```bash
   cp .env.exemple .env
   ```

3. **Édite le fichier `.env`**
   ```dotenv
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173,http://localhost:5176
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/cfa_digital
   ```

4. **Lance le serveur**
   ```bash
   npm run dev
   ```
   Le backend démarre sur `http://localhost:5000`

### Frontend

1. **Installe les dépendances**
   ```bash
   cd cfa_digital
   npm install
   ```

2. **Crée le fichier `.env.local`**
   ```bash
   cat > .env.local << EOF
   VITE_API_URL=http://localhost:5000/api
   VITE_API_DEBUG=true
   VITE_SOCKET_URL=http://localhost:5000
   EOF
   ```

3. **Lance le serveur de développement**
   ```bash
   npm run dev
   ```
   Le frontend démarre sur `http://localhost:5173`

## Dépannage

### Écran vide au démarrage
1. Vérifie la console du navigateur (F12) pour les erreurs
2. Regarde la **DiagnosticPanel** dans le coin inférieur droit
3. S'assure que le backend tourne sur le port 5000
4. Vérifie que `CLIENT_URL` dans `.env` du backend inclut `http://localhost:5173`

### Erreur CORS
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Mets à jour `CLIENT_URL` dans `backend/.env`:
```dotenv
CLIENT_URL=http://localhost:5173,http://localhost:5176
```

### Erreur de connexion MongoDB
```
Failed to connect to MongoDB
```
**Solution**:
- Vérifie les identifiants dans `MONGO_URI`
- S'assure que ton adresse IP est whitelistée dans MongoDB Atlas
- Teste la connexion: `mongodb+srv://user:pass@cluster.mongodb.net/cfa_digital`

### Les services ne se chargent pas
1. Ouvre les outils de développement (F12)
2. Regarde l'onglet **Network** pour voir les erreurs d'API
3. Vérifie que `VITE_API_URL` dans `.env.local` est correct

## Routes et Accès

### Pages Publiques
- `/` - Accueil
- `/formations` - Catalogue des formations
- `/admissions` - Candidature
- `/connexion` - Connexion

### Connexion avec des utilisateurs de test
ContacteAdmin pour obtenir des comptes de test.

### Espaces Protégés
- `/etudiant` - Espace étudiant (requiert auth)
- `/formateur` - Espace formateur (requiert auth)
- `/admin` - Administration (requiert auth admin)

## Architecture

```
backend/
├── models/          # Schémas MongoDB
├── controllers/     # Logique métier
├── routes/          # Définition des endpoints
├── middleware/      # Auth, CORS, logging
├── config/          # Configuration DB, mail, cloudinary
└── utils/           # Utilitaires (PDF, email)

cfa_digital/
├── src/
│   ├── components/  # Composants réutilisables
│   ├── pages/       # Pages par rôle (admin, etudiant, formateur)
│   ├── services/    # Appels API
│   ├── context/     # Auth, notifications
│   ├── hooks/       # Hooks personnalisés
│   └── main.jsx     # Point d'entrée
└── vite.config.js   # Configuration Vite
```

## Développement

### Linter
```bash
cd cfa_digital
npm run lint    # Vérifie les erreurs ESLint
```

### Build Production
```bash
cd cfa_digital
npm run build   # Génère le dossier dist/
```

## Support

Pour tout problème:
1. Vérifie les logs du backend: `npm run dev` (voir console)
2. Ouvre la console du navigateur (F12)
3. Regarde la DiagnosticPanel en bas à droite
4. Vérifie les fichiers `.env` et `.env.local`
