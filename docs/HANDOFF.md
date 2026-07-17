# Snowside Handoff – 2026-07-17

## Purpose
Snowside is an Avalanche L1 sidechain project. The monorepo at `/Workspace/abitsuite/snowside` includes a landing page (`snowside.network`), a pitch page (`pitch.snowside.network`), and a docs site (`docs.snowside.network`).

## Monorepo structure
    snowside/
    ├── AGENTS.md
    ├── package.json          # pnpm workspace root
    ├── pnpm-workspace.yaml   # packages: ['packages/*']
    ├── docs/                 # Session handoffs + meta docs
    └── packages/
        ├── web/  # Astro static — Landing page + Whitepaper (snowside.network)
        ├── pitch/ # Astro static — Pitch page (pitch.snowside.network)
        └── docs/ # Astro Starlight — Technical docs (docs.snowside.network)

## Session summary — 2026-07-17

### What was done
1. **Deleted `apps/web`** — old abandoned Astro version, removed entirely.
2. **Converted `packages/web` from React/Vite to Astro**:
   - Removed all `.jsx` components, `main.jsx`, `App.jsx`, `index.css`, `vite.config.js`
   - Created `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css` (Tailwind v4 theme with Snowside colors)
   - Created `src/layouts/Base.astro` (SEO meta, OG tags, fonts)
   - Converted all 11 React components to `.astro`:
     Nav, Hero, About, WhyAvalanche, ValueProposition, NodeRunr, ECash, Team, Roadmap, CTA, Footer
   - Created `src/pages/index.astro` (composes all components with Base layout)
   - Updated `package.json` (removed React deps, added Astro + jspdf)
   - Updated root `package.json` with workspace build scripts
   - Updated `pnpm-workspace.yaml` to include `packages/*`
   - Nav and Hero now link to `/whitepaper` instead of `#proposal`
   - Team component updated for 0xShomari (X: https://x.com/0xShomari, Email: shomari@abitsuite.com)
   - Footer updated with X/Twitter and correct GitHub link
3. **Created full whitepaper** (modeled on RISCy whitepaper pattern):
   - `src/data/whitepaper/types.ts` — Figure interface, Block type, WhitepaperSection
   - `src/data/whitepaper/meta.ts` — version 0.1, author 0xShomari
   - `src/data/whitepaper/content.ts` — 15 sections of full technical whitepaper content
   - 6 vector figures in `src/data/whitepaper/figures/`:
     - `architecture-diagram.ts` (Bitcoin -> BMM -> Snowside -> ICM -> C-Chain)
     - `bmm-flow.ts` (miner commitment + fee flow)
     - `consensus-layers.ts` (three-tier confirmation)
     - `icm-bridge.ts` (USDC bridge via ICM)
     - `gas-flow.ts` (BTC gas flow, no new token)
     - `validator-economics.ts` (cost vs revenue)
   - `src/pages/whitepaper.pdf.ts` — PDF generation endpoint (jsPDF, build-time static)
   - `src/pages/whitepaper.astro` — viewer page with download button + iframe embed
   - NotoSans fonts copied from RISCy to `src/fonts/`
4. **Created `packages/pitch` scaffolding**:
   - `package.json`, `astro.config.mjs`, `tsconfig.json`
   - `src/styles/global.css` (Snowside snow/aval/btc/usdc theme)
   - `src/layouts/Base.astro` (SEO, OG, fonts)
   - `src/components/Nav.astro` (pitch nav links)
   - `src/components/Footer.astro` (pitch footer with 3 columns)
   - `public/favicon.svg`
5. **Installed dependencies** via `pnpm install` (all workspace packages)

### Build status
- **`packages/web` build FAILED** — unterminated string literal in `content.ts` line 117.
- **FIXED** — line 117 patched with `sed` to close the string literal.
- **Re-test needed** — `pnpm run build:web` must be re-run to verify the fix.
- **`packages/pitch` not yet built** — needs `index.astro` page first.

## Outstanding tasks — next session

### Priority 1: Verify web build
- Run `pnpm run build:web` to confirm `packages/web` builds cleanly after the content.ts fix
- Check that `dist/whitepaper.pdf` is generated at build time
- Check that `dist/whitepaper/index.html` is generated

### Priority 2: Create pitch page
- Create `packages/pitch/src/pages/index.astro` with all 10 sections from the pitch plan:
  1. Hero (badge, headline, 2 CTAs)
  2. Overview (3-column feature grid + naming rationale callout)
  3. How It Works (5-step technical architecture + diagram placeholder)
  4. Why Avalanche (6 feature cards)
  5. Comparison (responsive table with checkmarks)
  6. Risks and Mitigations (2-column cards)
  7. Roadmap (timeline)
  8. Team (0xShomari only, with contact links)
  9. FAQ (accordion-style, 10 Q and As)
  10. CTA (3 buttons + support statement)
- Import Nav, Footer, Base from pitch's own components
- Pitch page should link to `https://snowside.network/whitepaper.pdf` for the whitepaper
- Run `pnpm run build:pitch` after creating index.astro

### Priority 3: Deploy
- `packages/web`: Update Cloudflare Pages build command from `npm run build` (Vite) to `npm run build` (Astro) — same command, different framework. Output dir is still `dist/`.
- `packages/pitch`: Create new Cloudflare Pages project pointing to `packages/pitch`, build command `npm run build`, output `dist/`. DNS: `pitch.snowside.network` -> Cloudflare Pages.
- `packages/docs`: Add `site: 'https://docs.snowside.network'` to astro.config.mjs (still has the sitemap warning from prior session).

### Priority 4: Commit and push
- All changes are uncommitted. Commit with a clear message and push to `master`.

### Priority 5: Content cleanup
- Remove `packages/web/public/pdfjs/web/compressed.tracemonkey-pldi-09.pdf` (PDF.js demo file)
- Replace example docs content in `packages/docs` (still has Starlight template content)
- Wire up dead links in web Footer (Discord, etc.)

## Key file inventory

### packages/web (Astro)
    packages/web/
    ├── astro.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/
    │   ├── favicon.svg
    │   ├── icons.svg
    │   ├── og-image.png
    │   └── pdfjs/
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro
        ├── pages/
        │   ├── index.astro           # landing page
        │   ├── whitepaper.astro      # viewer page
        │   └── whitepaper.pdf.ts     # PDF generator endpoint
        ├── components/
        │   ├── Nav.astro
        │   ├── Hero.astro
        │   ├── About.astro
        │   ├── WhyAvalanche.astro
        │   ├── ValueProposition.astro
        │   ├── NodeRunr.astro
        │   ├── ECash.astro
        │   ├── Team.astro
        │   ├── Roadmap.astro
        │   ├── CTA.astro
        │   └── Footer.astro
        ├── data/whitepaper/
        │   ├── types.ts
        │   ├── meta.ts
        │   ├── content.ts
        │   └── figures/
        │       ├── architecture-diagram.ts
        │       ├── bmm-flow.ts
        │       ├── consensus-layers.ts
        │       ├── icm-bridge.ts
        │       ├── gas-flow.ts
        │       └── validator-economics.ts
        └── fonts/
            ├── NotoSans-Regular.ttf
            ├── NotoSans-Bold.ttf
            └── NotoSans-Italic.ttf

### packages/pitch (Astro)
    packages/pitch/
    ├── astro.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/favicon.svg
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro
        ├── components/
        │   ├── Nav.astro
        │   └── Footer.astro
        └── pages/           # EMPTY — needs index.astro

## RISCy reference
- Located at `/Workspace/kndodao/riscy/apps/web`
- Pattern source for: Figure type, PDF generation, whitepaper.astro viewer, Base.astro layout
- Any new figures should follow the same vector drawing pattern (jsPDF points, color tuples)

---
*Generated at the end of the 17 July 2026 session. Maintained per AGENTS.md.*
