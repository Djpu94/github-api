# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src/ ./src/
COPY test/ ./test/
COPY nest-cli.json ./

# Construir la aplicación
RUN npm run build:prod

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar la aplicación construida
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["node", "dist/main"]