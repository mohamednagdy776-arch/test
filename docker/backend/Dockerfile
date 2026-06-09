# Tayyibt Backend Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (node-gyp)
RUN apk add --no-cache python3 make g++ gcc musl-dev libc6-compat

# Copy package files from backend directory
COPY backend/package*.json ./backend/
WORKDIR /app/backend

# Ensure native modules are built from source for correct architecture
ENV npm_config_build_from_source=true
RUN npm install --legacy-peer-deps

# Copy source code from backend directory
COPY backend/ ./

RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed to run
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]