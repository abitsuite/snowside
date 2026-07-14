# Snowside Handoff – 2026‑07‑14

## Repository state
- pnpm monorepo initialized with `apps/web` (Astro + Tailwind).
- Astro site scaffolded using the `basics` template (static mode, no Cloudflare adapter).
- Tailwind CSS integrated and configured.
- Root `build` script added: `pnpm build` (which runs `pnpm --filter web run build`).
- Git remote set to `git@github.com:abitsuite/snowside.git` (master branch).
- `AGENTS.md` created with project rules and file conventions.

## What’s next
1. Populate the landing page content based on the Snowside Project Page handoff document (headlines, sections, CTAs).
2. Add proper components: hero, feature grid, team section, etc.
3. Set up Cloudflare Pages deployment from the `master` branch.
4. Push the initial commit to GitHub once local structure is ready.

## Notes
- All source files should include path headers as defined in AGENTS.md.
- Static assets will be placed in `apps/web/public/`.
