# ── Builder: compile TypeScript ─────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

# Enable pnpm via corepack (built into Node 22, no global install needed)
RUN corepack enable pnpm

# Copy package.json first (enables Docker layer caching)
COPY package.json ./

# pnpm is much faster than npm (parallel downloads, content-addressable store)
RUN pnpm install --no-frozen-lockfile

COPY tsconfig.json ./
COPY src/ src/

# Compile TypeScript
RUN pnpm exec tsc

# ── Runtime: production only ────────────────────────────────────
FROM node:22-slim
WORKDIR /app

RUN corepack enable pnpm

COPY package.json ./
RUN pnpm install --prod --no-frozen-lockfile

# Copy compiled output from builder
COPY --from=builder /app/dist/ dist/

CMD ["node", "dist/index.js"]
