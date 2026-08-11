# ── Builder stage: type-check TypeScript ────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable pnpm

COPY package.json ./

RUN pnpm install --no-frozen-lockfile --config.onlyBuiltDependencies='["esbuild"]'

COPY tsconfig.json ./
COPY src ./src

RUN pnpm exec tsc --noEmit

# ── Runtime stage: production deps + tsx ────────────────────────
FROM node:22-slim AS runtime

WORKDIR /app

RUN corepack enable pnpm

COPY package.json ./

RUN pnpm install --prod --no-frozen-lockfile --config.onlyBuiltDependencies='["esbuild"]'

COPY src ./src
COPY tsconfig.json ./

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
