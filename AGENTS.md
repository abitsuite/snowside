# Snowside – Agent Instructions

## Monorepo structure
- `packages/web` – React + Vite + Tailwind landing page (deployed to Cloudflare Pages via `master`)
- `packages/docs` – (future) technical documentation
- `packages/l1` – (future) Avalanche L1 code

## Core workflow rule
**Push to production often.** After every meaningful change (e.g., a new section, a style fix, a dark‑mode update), build the project locally, commit from the repo root, and push to `master`. Cloudflare Pages will automatically deploy the latest commit.  
Never leave uncommitted work sitting locally at the end of a session.

## Build & deploy
- Web app build command: `cd packages/web && npm run build`
- Production URL: https://snowside.network

## File conventions
- All source files should include a comment at the very top with the file’s path relative to the monorepo root (e.g., `// packages/web/src/components/Hero.jsx`).

## Handoff
- At the end of each session, update `docs/HANDOFF.md` with the current state of the project and next steps.
