FROM node:22-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copier tout le code source
COPY . .

# Générer le client Prisma avec le chemin correct
RUN npx prisma generate --schema=./src/prisma/schema.prisma

EXPOSE 3001

# Utiliser le chemin correct pour schema.prisma dans la commande de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./src/prisma/schema.prisma && npm run dev"]
