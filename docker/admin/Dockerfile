# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from admin directory
COPY admin/package*.json ./admin/
WORKDIR /app/admin
RUN npm ci

# Copy source code from admin directory
COPY admin/ ./

# Build arguments
ARG NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── Stage 2: Production image ────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy built application
COPY --from=builder /app/admin/.next/standalone ./
COPY --from=builder /app/admin/.next/static ./.next/static

EXPOSE 3001

# App is built with basePath '/admin', so root returns 404 — probe /admin instead.
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/admin || exit 1

CMD ["node", "server.js"]