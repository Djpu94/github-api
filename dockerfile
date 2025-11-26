
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY src/ ./src/
COPY test/ ./test/
COPY nest-cli.json ./

RUN npm run build:prod

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main"]