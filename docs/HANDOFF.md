# Snowside Handoff – 2026-07-17 (Session 2)

## Purpose
Snowside is an Avalanche L1 sidechain project. The monorepo at `/Workspace/abitsuite/snowside` includes a landing page (`snowside.network`), a pitch page (`pitch.snowside.network`), and a docs site (`docs.snowside.network`).

## Monorepo structure

    snowside/
    ├── AGENTS.md
    ├── package.json          # pnpm workspace root
    ├── pnpm-workspace.yaml   # packages: ['packages/*']
    ├── .gitignore
    ├── docs/                 # Session handoffs + meta docs
    │   └── HANDOFF.md
    └── packages/
        ├── web/  # Astro static — Landing page + Whitepaper (snowside.network)
        ├── pitch/ # Astro static — Pitch page (pitch.snowside.network)
        └── docs/ # Astro Starlight — Technical docs (docs.snowside.network)

## Session summary — 2026-07-17 (Sessions 1 + 2)

### Session 1 (earlier today)
1. Deleted `apps/web` (old abandoned Astro version)
2. Converted `packages/web` from React/Vite to Astro (11 components, Base layout, global.css)
3. Created full whitepaper (15 sections, 6 vector figures, jsPDF endpoint)
4. Created `packages/pitch` scaffolding (Base, Nav, Footer, global.css)
5. Installed all dependencies via `pnpm install`
6. Fixed unterminated string in `content.ts` line 117

### Session 2 (this session)
1. **Fixed git: node_modules committed accidentally**
   - Created `.gitignore` (node_modules/, dist/, .astro/, .env*, .DS_Store, editor files)
   - `git rm -r --cached` for root + packages/pitch node_modules
   - `git rm -r --cached` for .astro generated dirs
   - Amended unpushed commit (clean history, no node_modules)
2. **Fixed @tailwindcss/vite incompatibility**
   - Error: `Missing field tsconfigPaths on BindingViteResolvePluginConfig.resolveOptions`
   - Root cause: @tailwindcss/vite 4.3.x incompatible with rolldown-vite (Vite 8, Astro 6/7)
   - Fix: replaced @tailwindcss/vite with @tailwindcss/postcss in web + pitch
   - Added postcss.config.mjs to both packages
   - Removed tailwind Vite plugin from astro.config.mjs (PostCSS auto-detected)
3. **Added pnpm.onlyBuiltDependencies to root package.json**
   - Approves esbuild + sharp build scripts for Cloudflare Pages
   - Without this, pnpm 10 ignores native dep builds and CF fails
4. **Created pitch page** (`packages/pitch/src/pages/index.astro`)
   - 10 sections: Hero, Overview, How It Works, Why Avalanche, Comparison, Risks, Roadmap, Team, FAQ, CTA
   - FAQ uses native `<details>/<summary>` accordion (no JS needed)
   - Links to whitepaper PDF at snowside.network/whitepaper.pdf
   - Builds successfully: 36KB index.html
5. **Removed PDF.js demo file**
   - Deleted `packages/web/public/pdfjs/web/compressed.tracemonkey-pldi-09.pdf`
6. **Replaced Starlight template with real Snowside documentation**
   - Deleted: guides/example.md, reference/example.md, houston.webp, package-lock.json
   - Updated astro.config.mjs: title "Snowside Docs", site URL, social (github + x.com), full sidebar
   - Created 12 documentation pages:
     - index.md: Overview with CardGrid + Steps
     - architecture/overview.md, bmm.md, consensus.md, gas-model.md, icm-bridge.md, security-model.md
     - guides/running-a-validator.md, deploying-contracts.md, bridging-usdc.md
     - reference/glossary.md, configuration.md
   - All content based on the Snowside whitepaper
7. **Fixed Starlight issues**
   - Social icon: `"x"` → `"x.com"` (valid Starlight option)
   - index.mdx → index.md (Starlight auto-injects Item component for .md only, not .mdx)

### Build status — all three packages pass locally

| Package | Status | Output |
|---------|--------|--------|
| packages/web | ✅ | 3 pages: index.html (14K), whitepaper/index.html (5K), whitepaper.pdf (398K) |
| packages/pitch | ✅ | 1 page: index.html (36K) |
| packages/docs | ✅ | 13 pages: index + 6 architecture + 3 guides + 2 reference + 404. Pagefind search index built. |

### Git status
- All changes committed and pushed to `master`
- Working tree clean
- Branch up to date with origin/master

## Outstanding tasks — next session

### Priority 1: Footer dead links (packages/web)
- The web Footer component has dead links (Discord, etc.) that need to be wired up or removed
- Check `packages/web/src/components/Footer.astro` for all `<a href>` elements
- Either link to real Snowside socials or remove dead links entirely

### Priority 2: Landing page re-styling (packages/web)
- Current landing page is mostly white — needs better contrast
- Add darker section backgrounds or gradient overlays for visual interest
- Add image placeholders for featured benefit sections
  - Hero section could use a background image/gradient
  - ValueProposition section needs visual cards or icons
  - WhyAvalanche section could use illustration placeholders
- Consider adding `og-image.png` as a real branded image (currently a placeholder)

### Priority 3: Cloudflare Pages deployment
- **packages/web**: Verify CF build passes with the postcss fix (should work now)
- **packages/pitch**: Create new CF Pages project, build command `npm run build`, output `dist/`, root `packages/pitch`. DNS: `pitch.snowside.network` → CF Pages
- **packages/docs**: Create new CF Pages project, build command `npm run build`, output `dist/`, root `packages/docs`. DNS: `docs.snowside.network` → CF Pages

### Priority 4: Content improvements
- Replace `packages/web/public/og-image.png` with real branded OG image
- Add real screenshots/diagrams to docs architecture pages
- Verify all cross-links between docs pages work
- Consider adding a "Quick Start" page to docs

## Key file inventory

### packages/web (Astro)
    packages/web/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/
    │   ├── favicon.svg
    │   ├── icons.svg
    │   ├── og-image.png
    │   └── pdfjs/               # (demo PDF removed)
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro
        ├── pages/
        │   ├── index.astro
        │   ├── whitepaper.astro
        │   └── whitepaper.pdf.ts
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
        │   └── Footer.astro       # ← dead links to fix
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
    ├── postcss.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/favicon.svg
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro
        ├── components/
        │   ├── Nav.astro
        │   └── Footer.astro
        └── pages/
            └── index.astro        # 10-section pitch page

### packages/docs (Astro Starlight)
    packages/docs/
    ├── astro.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/favicon.svg
    └── src/
        ├── content.config.ts
        └── content/docs/
            ├── index.md            # Overview (.md not .mdx — Starlight Item injection)
            ├── architecture/
            │   ├── overview.md
            │   ├── bmm.md
            │   ├── consensus.md
            │   ├── gas-model.md
            │   ├── icm-bridge.md
            │   └── security-model.md
            ├── guides/
            │   ├── running-a-validator.md
            │   ├── deploying-contracts.md
            │   └── bridging-usdc.md
            └── reference/
                ├── glossary.md
                └── configuration.md

## RISCy reference
- Located at `/Workspace/kndodao/riscy/apps/web`
- Pattern source for: Figure type, PDF generation, whitepaper.astro viewer, Base.astro layout
- Any new figures should follow the same vector drawing pattern (jsPDF points, color tuples)

## Lessons learned this session
1. **@tailwindcss/vite** breaks on Cloudflare's rolldown-vite — always use **@tailwindcss/postcss** instead
2. **Starlight Item** component is auto-injected for `.md` files only, not `.mdx` — use `.md` for pages with `<Steps>`
3. **pnpm 10** ignores build scripts for native deps (esbuild, sharp) unless approved in `package.json` → `pnpm.onlyBuiltDependencies`
4. **Heredoc + triple backticks** conflict — use 4-space indented code blocks inside heredoc content, or unique delimiters like `EOFLOWN`
5. **Never commit node_modules** — always verify `.gitignore` before first `git add -A`

---
*Generated at the end of the 17 July 2026 Session 2. Maintained per AGENTS.md.*
