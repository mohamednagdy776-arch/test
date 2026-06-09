# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install dependencies needed for Next.js SWC
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files from web directory
COPY web/package*.json ./web/
WORKDIR /app/web
RUN npm ci

# Copy source code from web directory
COPY web/ ./

# Build arguments - defaults will be overridden by docker-compose build args
ARG NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
ARG NEXT_PUBLIC_WS_URL=http://localhost:3003
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN npm run build

# ── Stage 2: Production image ────────────────────────────────────
FROM node:20-alpine AS runner

# Install dependencies needed for runtime
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built application
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000 || exit 1

CMD ["node", "server.js"]