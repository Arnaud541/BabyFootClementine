FROM node:22-slim

RUN apt-get update && apt-get install -y bash

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copier tout le code source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]