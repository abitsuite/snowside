# Snowside Handoff — 2026-07-17 (Session 4, Final Update)

## Purpose
Snowside is an Avalanche L1 sidechain project requesting eCash Drivechain ID #88. The monorepo at `/Workspace/abitsuite/snowside` includes a landing page (`snowside.network`), a pitch page (`pitch.snowside.network`), and a docs site (`docs.snowside.network`).

## Monorepo structure

    snowside/
    ├── AGENTS.md
    ├── package.json          # pnpm workspace root
    ├── pnpm-workspace.yaml   # packages: ['packages/*']
    ├── .gitignore
    ├── docs/                 # Session handoffs + meta docs
    │   └── HANDOFF.md
    └── packages/
        ├── web/  # Astro static — Landing + Whitepaper + /validators (snowside.network)
        ├── pitch/ # Astro static — Pitch page (pitch.snowside.network) — noindex,nofollow
        └── docs/ # Astro Starlight — Technical docs (docs.snowside.network)

## Session 4 summary — 2026-07-17

### Task 1: Nav button + Whitepaper link cleanup
- Changed Nav button from "Read the Proposal" (`href="#proposal"`) to "Read the Whitepaper" (`href="/whitepaper"`)
- Removed redundant "Whitepaper" text link from Nav
- Also fixed Hero button: "Read the Proposal" → "Read the Whitepaper"

### Task 2: Team section improvements
- Changed heading from "Who builds Snowside" to "Who is building Snowside"
- Added retro9000 SVG logo badge (red triangle "A" + white "retro9000" text on dark badge, linked to grant tweet)
- Removed false claim: "NodΞRunr is open source and already used by multiple Avalanche L1 teams"
- Removed false claim: "Direct support from Paul Sztorc (informal collaboration)"
- Removed "Current status: Applying for a Team1 Mini Grant" paragraph
- Removed redundant "Avalanche Foundation Grant Recipient" badge (retro9000 logo already conveys this)

### Task 3: Roadmap fix
- Month 3: "at least 3 community validators" → "5 trusted community validators"

### Task 4: CTA section update
- "Run a Validator" button linked to new `/validators` page
- Discord link updated to `https://discord.gg/jVytngEWt`
- Removed "Read our Team1 Proposal" button
- Removed pitch deck link (zero links to pitch.snowside.network from web)

### Task 5: /validators page (new)
- Created `packages/web/src/pages/validators.astro`
- Full validator onboarding page with alternating dark/light sections
- Content adapted from existing `packages/docs/src/content/docs/guides/running-a-validator.md`
- Sections: What is a validator, Prerequisites, 5-step NodΞRunr deployment (install, select template, configure, deploy, verify), Monitoring, Stopping/removing, References, CTA
- Page-specific CTA with Discord + Back to Home buttons

### Task 6: Footer reorganization
- Moved Whitepaper from "Sections" to "Resources"
- Added Validators page to "Resources"
- Reordered Resources: Documentation first, GitHub second
- Updated GitHub link from `github.com/nyusternie/layer1run` to `github.com/abitsuite/snowside`
- Added Discord as first link under "Contact"

### Task 7: Hero title increase
- "Snowside" title: text-4xl → text-5xl (mobile), md:text-6xl → md:text-7xl (desktop)
- Subtitle "The eCash Sidechain on Avalanche" unchanged at text-4xl/md:text-6xl

### Task 8: Multi-page Nav link fix
- Nav hash links changed from `#about` → `/#about`, `#tech` → `/#tech`, `#roadmap` → `/#roadmap`, `#contact` → `/#contact`
- Logo link changed from `href="#"` to `href="/"`
- Footer already used `/#` prefixes — no change needed
- Fixed the bug where clicking Nav links on /validators resulted in `/validators#about` instead of `/#about`

### Task 9: Pitch noindex
- Added `<meta name="robots" content="noindex, nofollow">` to `packages/pitch/src/layouts/Base.astro`
- Prevents search engine and AI indexing of the pitch page
- Combined with zero links from web → pitch page is only reachable via direct URL

### Task 10: Simple Analytics
- Added Simple Analytics to all 3 packages (web, pitch, docs)
- Web & Pitch: `<script is:inline async defer src="https://scripts.simpleanalyticscdn.com/latest.js">` + `<noscript>` image in `Base.astro` `<head>`
- Docs: `head` array in `astro.config.mjs` Starlight config with script + noscript tag objects
- Standard embed — no site ID required, auto-detects domain

### Task 11: AGENTS.md + HANDOFF.md update
- Added Analytics, Pages, Footer structure, Pitch isolation sections to AGENTS.md
- Updated file inventory and session history in HANDOFF.md

### Build status — all packages pass

| Package | Status | Pages |
|---------|--------|-------|
| packages/web | ✅ | index.html, whitepaper/index.html, whitepaper.pdf, validators/index.html |
| packages/pitch | ✅ | index.html |
| packages/docs | ✅ | 13 pages: index + 6 architecture + 3 guides + 2 reference + 404 |

## Next session: Whitepaper edits

The user's stated next focus is **whitepaper edits**. The whitepaper source lives in:
- `packages/web/src/data/whitepaper/content.ts` — all section text
- `packages/web/src/data/whitepaper/types.ts` — types (Figure, Section, etc.)
- `packages/web/src/data/whitepaper/meta.ts` — metadata
- `packages/web/src/data/whitepaper/figures/` — 6 vector figure definitions
- `packages/web/src/pages/whitepaper.pdf.ts` — jsPDF rendering endpoint
- `packages/web/src/pages/whitepaper.astro` — viewer page (`/whitepaper`)
- `packages/web/src/fonts/NotoSans-*.ttf` — embedded fonts

Before editing, request the latest `content.ts` and `whitepaper.pdf.ts` sources.

## Outstanding tasks

### Image placeholders (still need real images)
- `Hero.astro` — commented-out hero illustration placeholder
- `WhyAvalanche.astro` — 6th card is a dashed-border placeholder for architecture diagram
- `NodeRunr.astro` — surface-1 card placeholder for NodΞRunr dashboard / terminal screenshot

### Cloudflare Pages deployment
- **packages/web**: Verify CF build passes
- **packages/pitch**: Create CF Pages project, build command `npm run build`, output `dist/`, root `packages/pitch`
- **packages/docs**: Create CF Pages project, build command `npm run build`, output `dist/`, root `packages/docs`

### Pitch page dark theme alignment
- The pitch page section backgrounds have not been audited for the same dark/light alternation pattern applied to web in session 3.

## Session history (prior sessions)

### Session 1 (2026-07-17)
1. Deleted `apps/web` (old abandoned Astro version)
2. Converted `packages/web` from React/Vite to Astro (11 components, Base layout, global.css)
3. Created full whitepaper (15 sections, 6 vector figures, jsPDF endpoint)
4. Created `packages/pitch` scaffolding
5. Installed all dependencies via `pnpm install`
6. Fixed unterminated string in `content.ts` line 117

### Session 2 (2026-07-17)
1. Fixed git: node_modules committed accidentally (added .gitignore, git rm --cached, amended commit)
2. Fixed @tailwindcss/vite incompatibility (switched to @tailwindcss/postcss in web + pitch)
3. Added pnpm.onlyBuiltDependencies to root package.json (esbuild, sharp)
4. Created pitch page (10 sections, FAQ accordion)
5. Removed PDF.js demo file
6. Replaced Starlight template with real Snowside documentation (12 pages)
7. Fixed Starlight social icon (x → x.com) and index.mdx → index.md

### Session 3 (2026-07-17)
1. Fixed docs index.md import issue (Starlight auto-injects components)
2. Landing page contrast overhaul + Footer rewrite (14 files)
3. OG image generation prompt provided
4. Dual-snowman 88 favicon deployed to all 3 packages
5. OG image cache-bust (og-image-v2.png)
6. retro9000 grant link added across 3 packages

## Key file inventory

### packages/web (Astro)
    packages/web/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/
    │   ├── favicon.svg              # dual-snowman 88
    │   ├── icons.svg
    │   ├── og-image-v2.png          # 1200×630, generated externally
    │   └── pdfjs/
    └── src/
        ├── styles/global.css        # body bg surface-0
        ├── layouts/Base.astro       # OG image: /og-image-v2.png, Simple Analytics
        ├── pages/
        │   ├── index.astro          # landing page
        │   ├── whitepaper.astro      # PDF viewer
        │   ├── whitepaper.pdf.ts     # jsPDF endpoint
        │   └── validators.astro      # NEW: validator onboarding page
        ├── components/
        │   ├── Nav.astro            # /# hash links, /whitepaper button
        │   ├── Hero.astro           # title text-5xl/7xl, button says "Read the Whitepaper"
        │   ├── About.astro
        │   ├── WhyAvalanche.astro
        │   ├── ValueProposition.astro
        │   ├── NodeRunr.astro
        │   ├── ECash.astro
        │   ├── Team.astro           # retro9000 SVG logo, no false claims, no grant application
        │   ├── Roadmap.astro        # 5 trusted community validators
        │   ├── CTA.astro           # /validators + Discord, no pitch link, no Team1 button
        │   └── Footer.astro         # Discord in Contact, Docs+GitHub first in Resources
        ├── data/whitepaper/
        │   ├── types.ts
        │   ├── meta.ts
        │   ├── content.ts           # ← next session focus
        │   └── figures/
        └── fonts/

### packages/pitch (Astro)
    packages/pitch/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/favicon.svg           # dual-snowman 88
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro       # noindex,nofollow + Simple Analytics
        ├── components/
        │   ├── Nav.astro
        │   └── Footer.astro
        └── pages/
            └── index.astro          # pitch page

### packages/docs (Astro Starlight)
    packages/docs/
    ├── astro.config.mjs             # head: Simple Analytics script + noscript
    ├── package.json
    ├── tsconfig.json
    ├── public/favicon.svg           # dual-snowman 88
    └── src/
        ├── content.config.ts
        └── content/docs/
            ├── index.md
            ├── architecture/         # 6 pages
            ├── guides/              # 3 pages
            └── reference/            # 2 pages

## Key learnings (all sessions)
1. **@tailwindcss/vite** breaks on Cloudflare's rolldown-vite — always use **@tailwindcss/postcss**
2. **Starlight auto-injects ALL components** in `.md` files — never add import statements
3. **Starlight Item** component is auto-injected for `.md` only, not `.mdx`
4. **pnpm 10** ignores build scripts for native deps unless approved in `pnpm.onlyBuiltDependencies`
5. **Heredoc + triple backticks** conflict — use 4-space indented code blocks or unique delimiters
6. **Never commit node_modules** — verify `.gitignore` before first `git add -A`
7. **Favicon dark backdrop required** — white snowmen on transparent SVG vanish in light browser themes
8. **Two snowmen = "88"** — stacked-circle silhouette naturally reads as "88" for Drivechain ID branding
9. **Landing page contrast** — alternate dark/light sections; use theme tokens, not raw gray-*
10. **OG images** — generate externally via AI agent; 1200×630 PNG; use versioned filenames for cache-busting
11. **Static multi-page hash links** — `#about` resolves to current page; must use `/#about` for cross-page navigation
12. **Astro `<script is:inline>`** — required for external analytics scripts; without it Astro bundles/processes the tag
13. **Pitch isolation** — `noindex,nofollow` meta + zero inbound links from web = unreachable to crawlers
14. **Simple Analytics** — standard embed works across Astro layouts and Starlight head config without modification

---
*Generated at end of 2026-07-17 Session 4. Next session: Whitepaper edits. Maintained per AGENTS.md.*
