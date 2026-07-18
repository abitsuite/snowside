# Snowside Handoff — 2026-07-17 (Session 3, Final Update)

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
        ├── web/  # Astro static — Landing page + Whitepaper (snowside.network)
        ├── pitch/ # Astro static — Pitch page (pitch.snowside.network)
        └── docs/ # Astro Starlight — Technical docs (docs.snowside.network)

## Session 3 summary — 2026-07-17

### Task 1: Fix docs index.md import issue
- **Problem:** `packages/docs/src/content/docs/index.md` had `import { Steps, Card, CardGrid } from '@astrojs/starlight/components';` between the frontmatter and body text. Starlight auto-injects all components in `.md` files, so the import rendered as literal text on the page.
- **Fix:** Removed the import line. No other changes to the file.

### Task 2: Landing page contrast overhaul + Footer rewrite
The landing page was mostly white with gray text — low contrast and visually flat. Applied a dark/light alternating section pattern across all 11 components (commit `c3f15f21`, 14 files, +209/-93):

1. `global.css` — body `background-color: var(--color-surface-0)`
2. `index.astro` — wrapper `bg-surface-0 text-slate-200`
3. `Nav.astro` — dark surface-0/90 transparent/blur
4. `Hero.astro` — dark gradient, grid pattern, radial glow
5. `About.astro` — dark (surface-1), slate-300 text
6. `WhyAvalanche.astro` — light (snow-50), dark surface-1 cards, 6th card = image placeholder
7. `ValueProposition.astro` — dark (surface-0), added `id="value"`, BTC/USDC badge row
8. `NodeRunr.astro` — light (snow-50), surface-1 image placeholder card
9. `ECash.astro` — dark (surface-1), slate-300 text
10. `Team.astro` — light (snow-50), surface-1 badges
11. `Roadmap.astro` — dark (surface-0) — **fixed the user's primary complaint about too-light text**
12. `CTA.astro` — light (snow-50), surface-1 dark buttons
13. `Footer.astro` — complete rewrite to pitch-style 3-column layout
14. `index.md` — import line removed (Task 1)

### Task 3: OG image generation prompt
- Provided 3 unique prompts for an external generative AI agent to produce a 1200×630 OG banner.
- Core design: "Snowside" title (white, ice-blue frost glow), "eCash Drivechain ID 88" badge (orange "ID 88"), two snowmen side-by-side, dark navy background with light snowfall.
- User generated the image externally and confirmed it looks great.

### Task 4: Dual-snowman 88 favicon
- Created SVG favicon for all three packages: `web`, `pitch`, `docs`.
- Design: two snowmen side-by-side form a literal "88" silhouette (Drivechain ID #88).
- Left snowman: Bitcoin-orange scarf. Right snowman: ice-blue scarf. Noses face each other.
- Dark rounded-square backdrop (#0a0f1a, rx=14) for visibility in light browser themes.
- All three SVG bodies identical (only path-comment line 1 differs).

### Task 5: OG image cache-bust (v2)
- User replaced the OG image with a versioned filename `og-image-v2.png` to break social media platform caches.
- **VERIFY:** `packages/web/src/layouts/Base.astro` has `image = '/og-image.png'` as the default prop. If the file was renamed to `og-image-v2.png`, this default must be updated to `/og-image-v2.png` to point at the new image. If not already done, this is the first command to run next session.

### Task 6: retro9000 grant link across 3 packages
- Added hyperlink to the Avalanche Foundation retro9000 grant announcement tweet (`https://x.com/AvalancheFDN/status/1932484367324229635?s=20`) in three files:
  - `packages/pitch/src/pages/index.astro` — Team section: paragraph inline link, list item inline link, badge changed from `<span>` to `<a>`
  - `packages/web/src/components/Team.astro` — list item inline link, badge changed from `<span>` to `<a>`
  - `packages/docs/src/content/docs/reference/glossary.md` — NodeRunr entry: markdown `[retro9000 grant](...)` link

### Build status — all packages pass

| Package | Status | Output |
|---------|--------|--------|
| packages/web | ✅ | 3 pages: index.html, whitepaper/index.html, whitepaper.pdf |
| packages/pitch | ✅ | 1 page: index.html (36K) |
| packages/docs | ✅ | 13 pages: index + 6 architecture + 3 guides + 2 reference + 404 |

### Git commits this session
- `c3f15f21` — "Landing page contrast overhaul + docs import fix" (14 files, +209/-93)
- Favicon commit — "Replace web + pitch favicons with dual-snowman 88 design"
- Favicon docs commit — "Add dual-snowman 88 favicon to docs (matching web + pitch)"
- OG image — user replaced externally, committed as `og-image-v2.png`
- Retro9000 grant link commit — "Add retro9000 grant award link across pitch, web, and docs"
- AGENTS.md + HANDOFF.md — this update
- All pushed to `origin/master`

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

## Other outstanding tasks

### Verify / quick fixes
- **OG image reference:** Confirm `Base.astro` `image` prop default is `/og-image-v2.png` (not stale `/og-image.png`). If `og-image-v2.png` exists alongside `og-image.png`, update Base.astro to point at the v2 filename.
- **Nav dead link:** `Nav.astro` links "Read the Proposal" to `#proposal` — no section has this ID. Fix: either point to `/whitepaper` or add `id="proposal"` to the CTA section.
- **Footer section links:** Verify `/#roadmap`, `/#value`, `/#tech`, `/#about`, `/#contact` all resolve to existing section IDs (Roadmap ✅ `id="roadmap"`, ValueProposition ✅ `id="value"`, WhyAvalanche ✅ `id="tech"`, About ✅ `id="about"`, CTA ✅ `id="contact"`).

### Replace image placeholders with real images
- `Hero.astro` — commented-out hero illustration placeholder
- `WhyAvalanche.astro` — 6th card is a dashed-border placeholder for architecture diagram
- `NodeRunr.astro` — surface-1 card placeholder for NodΞRunr dashboard / terminal screenshot

### Cloudflare Pages deployment
- **packages/web**: Verify CF build passes with the postcss fix
- **packages/pitch**: Create CF Pages project, build command `npm run build`, output `dist/`, root `packages/pitch`
- **packages/docs**: Create CF Pages project, build command `npm run build`, output `dist/`, root `packages/docs`

### Pitch page dark theme alignment
- The pitch page section backgrounds have not been audited for the same dark/light alternation pattern applied to web this session. If visual consistency between web and pitch is desired, apply the same pattern to pitch components.

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
    │   ├── og-image-v2.png          # 1200×630, generated externally (cache-busted)
    │   └── pdfjs/
    └── src/
        ├── styles/global.css        # body bg surface-0
        ├── layouts/Base.astro       # ← CHECK: image prop default = '/og-image.png' or '/og-image-v2.png'?
        ├── pages/
        │   ├── index.astro          # dark wrapper
        │   ├── whitepaper.astro
        │   └── whitepaper.pdf.ts    # ← next session focus
        ├── components/
        │   ├── Nav.astro            # dark theme; dead link: #proposal
        │   ├── Hero.astro           # dark gradient
        │   ├── About.astro          # dark surface-1
        │   ├── WhyAvalanche.astro   # light snow-50 + dark cards + placeholder
        │   ├── ValueProposition.astro # dark + badges, id="value"
        │   ├── NodeRunr.astro       # light + placeholder
        │   ├── ECash.astro          # dark surface-1
        │   ├── Team.astro           # light + grant link + badge is <a>
        │   ├── Roadmap.astro        # dark surface-0
        │   ├── CTA.astro           # light + dark buttons, id="contact"
        │   └── Footer.astro         # pitch-style 3-column
        ├── data/whitepaper/         # ← next session focus
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
    ├── public/favicon.svg           # dual-snowman 88
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro
        ├── components/
        │   ├── Nav.astro
        │   └── Footer.astro
        └── pages/
            └── index.astro          # 10-section pitch; grant links in Team section

### packages/docs (Astro Starlight)
    packages/docs/
    ├── astro.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/favicon.svg           # dual-snowman 88
    └── src/
        ├── content.config.ts
        └── content/docs/
            ├── index.md             # import line removed
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
                ├── glossary.md      # NodeRunr entry has retro9000 grant link
                └── configuration.md

## RISCy reference
- Located at `/Workspace/kndodao/riscy/apps/web`
- Pattern source for: Figure type, PDF generation, whitepaper.astro viewer, Base.astro layout

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
11. **Social media cache** — renaming the OG image file (e.g., `og-image-v2.png`) forces re-scrape; update `Base.astro` `image` prop to match

---
*Generated at end of 2026-07-17 Session 3. Next session: Whitepaper edits. Maintained per AGENTS.md.*
