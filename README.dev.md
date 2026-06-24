README.dev.md — Lancer l'environnement de développement

Objectif : démarrer rapidement le backend + MongoDB local (ou MongoDB Atlas si disponible) en development.

Pré-requis
- Docker & Docker Compose installés
- Node.js et npm (pour lancer le frontend localement)
- Git (pour cloner le repo)

Étapes préparatoires
1. Copier les exemples d'env :

```powershell
# PowerShell (Windows)
copy .env.example .env
copy cfa_digital\.env.example cfa_digital\.env
```

2. (Optionnel) remplir `./.env` et `cfa_digital/.env` avec vos secrets (JWT, SMTP, CLOUDINARY, STRIPE, etc.).

Utilisation principale — Docker Compose

- Par défaut le `docker-compose.yml` démarre une instance MongoDB locale (`mongo`) et le service `backend`.
- Si vous voulez utiliser MongoDB Atlas (ou un autre serveur distant), exportez la variable `MONGO_URI` avant de lancer docker-compose.

PowerShell (Windows) — utilisation recommandée :

```powershell
# Option 1 — utiliser MongoDB Atlas (remplacez par votre URI)
$env:MONGO_URI = "mongodb+srv://user:pass@cluster0.mongodb.net/cfa_digital?retryWrites=true&w=majority"

# Construire et démarrer en premier plan (logs visibles)
docker-compose up --build

# Ou démarrer en arrière-plan (détaché)
docker-compose up --build -d

# Voir logs backend
docker-compose logs -f backend

# Arrêter et supprimer conteneurs/volumes (dev)
docker-compose down -v
```

Bash / WSL :

```bash
# Option Atlas
export MONGO_URI="mongodb+srv://user:pass@cluster0.mongodb.net/cfa_digital?retryWrites=true&w=majority"

docker-compose up --build
# ou détaché
# docker-compose up --build -d

docker-compose logs -f backend

docker-compose down -v
```

Notes utiles
- Si `MONGO_URI` n'est pas défini, le backend utilisera l'instance `mongo` fournie par le compose (`mongodb://mongo:27017/cfa_digital`).
- L'interface `mongo-express` est exposée sur `http://localhost:8081` (utile en dev).
- Le backend écoute sur le port `5000` (config `PORT` / `.env`).

Lancer le frontend localement

Le `docker-compose.yml` actuel ne containerise pas le frontend. Pour le développer localement :

```powershell
cd cfa_digital
npm install
npm run dev
```

Vérifications rapides
- Ouvrez `http://localhost:5173` (Vite) pour le frontend si lancé localement.
- Testez l'API : `curl http://localhost:5000/api/health` ou accédez aux endpoints (`/api/auth`, `/api/users`, `/api/cohortes`).

Dépannage
- Si le backend échoue à se connecter à Mongo, vérifiez :
  - que `MONGO_URI` est correct (si Atlas)
  - que le container `mongo` est sain (`docker ps` / `docker-compose logs mongo`)
- Pour forcer rebuild complet : `docker-compose build --no-cache` puis `docker-compose up --build`.

Sécurité
- Ne commitez jamais vos vrais secrets. Utilisez `.env` local non versionné.

Support
- Si vous voulez, je peux :
  - ajouter un service `frontend` au `docker-compose` (containeriser Vite),
  - générer des scripts PowerShell pour automatiser l'initialisation (install + up),
  - préparer un `Makefile` cross-platform.
