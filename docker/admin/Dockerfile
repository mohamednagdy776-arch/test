# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# glibc shim so the Next.js musl SWC binary loads on alpine.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files from admin directory
COPY admin/package*.json ./admin/
WORKDIR /app/admin
# The committed admin/package-lock.json lacks installable @next/swc-* package
# nodes, so `npm ci` won't install the Linux SWC binary. Drop the stale lockfile
# and let npm resolve fresh so swc-linux-x64-musl actually lands in node_modules
# (a fast, local compile — no per-build SWC download).
RUN rm -f package-lock.json && npm install --no-audit --no-fund

# Copy source code from admin directory
COPY admin/ ./

# Build arguments
ARG NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Skip Next's lockfile "patcher". It looks up @next/swc at next's own version
# (14.2.35), but the swc binaries publish at 14.2.33, so the lookup hits
# undefined and crash-loops with "Cannot read properties of undefined (reading
# 'os')" on every build. The flag is Next's official escape hatch; swc is already
# installed above, so the patch is pure (broken) overhead.
ENV NEXT_IGNORE_INCORRECT_LOCKFILE=1

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