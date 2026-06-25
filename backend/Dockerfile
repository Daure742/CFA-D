FROM node:18-alpine

# Répertoire de travail
WORKDIR /usr/src/app

# Copier les manifestes en premier pour profiter du cache Docker
COPY package.json package-lock.json* ./

# Installer les dépendances (dev incl.) pour pouvoir utiliser npm run dev
RUN npm ci

# Copier le reste du projet
COPY . .

# Port exposé (aligné sur backend PORT=5000)
EXPOSE 5000

# Commande par défaut (utilisée par le docker-compose dev)
CMD ["npm", "start"]
