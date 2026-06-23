# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# glibc shim so the Next.js musl SWC binary loads on alpine.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files from admin directory
COPY admin/package*.json ./admin/
WORKDIR /app/admin
# NOTE: the committed admin/package-lock.json is broken — it references the
# @next/swc-* binaries only in next's optionalDependencies but has no installable
# package nodes for them (web/ has them). npm trusts the lockfile, so neither
# `npm ci` nor `npm install` ever installs @next/swc-linux-x64-musl. Next then
# crash-loops its lockfile patcher (TypeError reading 'os') and re-downloads SWC
# on every build. Dropping the stale lockfile forces a fresh resolve that installs
# the correct musl SWC for alpine. Restore `npm ci` once the committed lockfile is
# regenerated with the swc package nodes.
RUN rm -f package-lock.json && npm install --no-audit --no-fund

# Copy source code from admin directory
COPY admin/ ./

# Build arguments
ARG NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── Stage 2: Production image ────────────────────────────────────
FROM node:20-alpine AS runner

# Runtime glibc shim for the Next.js standalone server.
RUN apk add --no-cache libc6-compat

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