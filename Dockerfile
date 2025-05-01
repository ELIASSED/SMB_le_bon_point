# Étape 1 : Image de base pour le build
FROM node:20-alpine AS base

# Installer les dépendances nécessaires pour Puppeteer
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Définir les variables d'environnement pour Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Étape 2 : Installer les dépendances
WORKDIR /app
COPY package.json package-lock.json* prisma ./
RUN npm ci

# Étape 3 : Copier le code source
COPY . .

# Étape 4 : Générer le client Prisma et construire l'application
RUN npx prisma generate
RUN npm run build

# Étape 5 : Image finale pour l'exécution
FROM node:20-alpine AS runner
WORKDIR /app

# Installer Chromium pour l'exécution
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Copier les fichiers nécessaires
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public
COPY --from=base /app/src ./src
COPY --from=base /app/next.config.js ./next.config.js
COPY --from=base /app/prisma ./prisma

# Variables d'environnement pour la production
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PORT=3000

# Exposer le port
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]