# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias primero (aprovecha cache de Docker)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente
COPY src/ ./src/

EXPOSE 5000

CMD ["node", "src/server.js"]
