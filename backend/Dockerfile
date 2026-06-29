FROM node:18-alpine

# Répertoire de travail
WORKDIR /usr/src/app

# Copier les manifestes en premier pour profiter du cache Docker
COPY package.json package-lock.json* ./

# Installer uniquement les dépendances de production pour Render
RUN npm ci --omit=dev --silent

# Copier le reste du projet
COPY . .

# Exposer le port configuré par Render via PORT
EXPOSE 5000

# Commande par défaut pour la production
CMD ["npm", "start"]
