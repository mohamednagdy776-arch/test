# Tayyibt Backend Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ gcc musl-dev libc6-compat

COPY backend/package*.json ./backend/
WORKDIR /app/backend

ENV npm_config_build_from_source=true
RUN npm install --legacy-peer-deps

COPY backend/ ./

RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

RUN mkdir -p /app/uploads/avatars /app/uploads/covers

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
