# Snowside – AI & Contributor Instructions

## Project context
Snowside is an Avalanche L1 sidechain for Paul Sztorc’s eCash hard‑fork. This monorepo contains:
- `apps/web` – Astro‑based landing page (static, Tailwind CSS)
- Future: `apps/docs`, `packages/l1`, etc.

## Tech stack & constraints
- **Package manager:** pnpm (workspace defined in `pnpm-workspace.yaml`)
- **Web framework:** Astro (static output, no SSR)
- **Styling:** Tailwind CSS (via `@astrojs/tailwind` integration)
- **No server‑side adapters** – the site is a pure static build; do not add `@astrojs/cloudflare` or similar without discussion.
- **Build command:** `pnpm --filter web run build` (or `pnpm build` from root)
- **Deployment:** Cloudflare Pages (connected to `master` branch)

## File conventions
1. **Path headers** – every source file (exceptions: `README.md`, configuration files that break with comments, and generated content) must begin with a comment containing the file’s relative path from the monorepo root.
   - Example Astro: `---\n// apps/web/src/pages/index.astro\n---`
   - Example JS: `// apps/web/src/config.js`
   - Use the appropriate comment syntax for the file type.
2. **Components** – place reusable Astro components in `apps/web/src/components/`.
3. **Layouts** – use `apps/web/src/layouts/` for page shells.
4. **Static assets** – images, fonts, etc. go in `apps/web/public/`.

## Workflow & rules
- Before adding new directories or packages, discuss first to keep the workspace intentional.
- Never modify `pnpm-workspace.yaml` without explicit approval.
- **Session handoff** – at the end of every development session, update `docs/HANDOFF.md` (or create it if missing). This document must reflect the current state of the project, including any newly created files, decisions, and next steps. Always include the date.
- After completing a change, run `pnpm build` (or `pnpm --filter web run build`) to verify the static site compiles without errors.

## Credits
The initial repository structure was set up on 2026‑07‑14.
