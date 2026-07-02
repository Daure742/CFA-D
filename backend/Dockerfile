FROM node:18-alpine

# Répertoire de travail
WORKDIR /usr/src/app

# Définit le mode production et le port par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Copier les manifestes en premier pour profiter du cache Docker
COPY package*.json ./

# Installer uniquement les dépendances de production pour Render
RUN npm ci --omit=dev --silent

# Copier le reste du projet
COPY . .

# Exposer le port local par défaut pour documentation
EXPOSE 5000

# Commande par défaut pour la production
CMD ["node", "server.js"]
