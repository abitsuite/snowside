# Snowside Handoff – 2026-07-14

## Purpose
Snowside is an Avalanche L1 sidechain project with a public landing page (`snowside.network`) and a docs site (`docs.snowside.network`). This handoff documents the state of the monorepo at the end of the 14 July 2026 session.

## Monorepo structure
    snowside/
    ├── AGENTS.md
    ├── packages/
    │   ├── web/  # React + Vite + Tailwind – Landing page
    │   └── docs/ # Astro Starlight – Technical documentation
    └── docs/     # Session handoffs + meta docs

## packages/web – Landing page
- **Framework:** React (Vite) with Tailwind CSS v4
- **Deployment:** Cloudflare Pages connected to `master`, building `packages/web` with `npm run build`, output `dist`
- **URL:** https://snowside.network
- **Components:**
  - `Nav`, `Hero`, `About`, `WhyAvalanche`, `ValueProposition`, `NodeRunr`, `ECash`, `Team`, `Roadmap`, `CTA`, `Footer`
- **Dark mode:** enabled via Tailwind’s default `prefers-color-scheme` media query. No toggle implemented yet; all sections have `dark:` variants.
- **Build command:** `cd packages/web && npm run build`
- **To run locally:** `cd packages/web && npm run dev`

## packages/docs – Documentation site
- **Framework:** Astro (static) with the Starlight theme
- **Deployment:** (separate Cloudflare Pages project) connected to same repo, building `packages/docs` with `npm run build`, output `dist`
- **URL:** https://docs.snowside.network
- **Current content:** landing page (`src/content/docs/index.mdx`) with placeholder topics; example guides still present from the Starlight template and should be replaced with real Snowside documentation.
- **Build command:** `cd packages/docs && npm run build`
- **To run locally:** `cd packages/docs && npm run dev`
- **Known issue:** the Astro config does not include `site`; the sitemap warns. Add `site: 'https://docs.snowside.network'` to `astro.config.mjs`.

## AGENTS.md
Established rules:
1. Push to production after every meaningful change.
2. All source files must include a path header comment (e.g., `// packages/web/src/components/Hero.jsx`).
3. At the end of each session, update `docs/HANDOFF.md`.
4. Monorepo structure: `packages/web`, `packages/docs`, future `packages/l1`.

## Outstanding tasks
- **Clean up old `apps/web/` directory** – it contains the abandoned Astro version and can be deleted.
- **Replace example docs content** – remove `guides/example.md`, `reference/example.md` and write real eCash/NodeRunr documentation.
- **Add social proof** – the landing page could benefit from a Paul Sztorc quote or Avalanche Foundation badge.
- **Fix sitemap warning** – add `site` to `packages/docs/astro.config.mjs`.
- **Wire up dead links** – “Run a Validator”, “Join our Discord” still link to `#`.

## Next session
- Work on the **whitepaper** (likely a new `packages/whitepaper` or a dedicated content page in docs).
- Continue fleshing out docs content.

---
*Generated automatically at the end of the 14 July 2026 session. Maintained per AGENTS.md.*
