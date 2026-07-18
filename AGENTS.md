# Snowside – Agent Instructions

## Monorepo structure
- `packages/web` – Astro static site (landing page + whitepaper), deployed to Cloudflare Pages via `master`
- `packages/pitch` – Astro static site (pitch.snowside.network), separate Cloudflare Pages project
- `packages/docs` – Astro Starlight technical documentation (docs.snowside.network)
- `packages/l1` – (future) Avalanche L1 code

## Core workflow rules
**Push to production often.** After every meaningful change, build, commit from the repo root, and push to `master`.
Never leave uncommitted work sitting locally at the end of a session.

## Build & deploy
- Web build: `cd packages/web && npm run build` (Astro static, output `dist/`)
- Pitch build: `cd packages/pitch && npm run build` (Astro static, output `dist/`)
- Docs build: `cd packages/docs && npm run build` (Astro Starlight, output `dist/`)
- Root build (all): `pnpm run build` (runs web then pitch)
- Dev web: `pnpm run dev:web`
- Dev pitch: `pnpm run dev:pitch`
- Dev docs: `pnpm --filter packages-docs run dev`
- Production URLs: https://snowside.network (web), https://pitch.snowside.network (pitch), https://docs.snowside.network (docs)

## File conventions
- All source files must include a comment at the file's path relative to the monorepo root (e.g., `// packages/web/src/components/Hero.astro`).
- Packages use `pnpm` with workspace filtering. Never use `npm` inside packages — always `pnpm`.
- `package-lock.json` must NOT exist in any package. Delete it if found. Only `pnpm-lock.yaml` at root.

## Tailwind CSS v4 with Astro
- **CRITICAL:** Use `@tailwindcss/postcss` (NOT `@tailwindcss/vite`). The Vite plugin has a rolldown incompatibility (`Missing field tsconfigPaths`) that breaks on Cloudflare Pages build servers even when it passes locally.
- Each Astro package needs a `postcss.config.mjs` with:
  `export default { plugins: { '@tailwindcss/postcss': {} } };`
- Remove the `tailwindcss()` Vite plugin from `astro.config.mjs` — PostCSS is auto-detected by Vite.
- Keep `@import 'tailwindcss'` and `@theme` blocks in `global.css` — the PostCSS plugin processes them identically.

## Starlight (packages/docs)
- **CRITICAL:** In `.md` files, Starlight auto-injects ALL components (`Steps`, `Card`, `CardGrid`, `Item`, `Tabs`, `LinkCard`, etc.). Do NOT add `import` statements — they render as literal text on the page. This was a real bug in `index.md` that displayed the import line to users.
- Use `.md` files (NOT `.mdx`) for pages that use `<Steps>` with `<Item>`. `Item` is NOT exported from `@astrojs/starlight/components`, so you cannot import it explicitly in `.mdx`.
- Starlight social icons: use `"x.com"` (not `"x"`) for X/Twitter. Check valid icon names in the error message if unsure.
- Build output: `dist/` with one `index.html` per page + Pagefind search index + sitemap.

## Cloudflare Pages deployment
- `pnpm.onlyBuiltDependencies` must include `["esbuild", "sharp"]` in root `package.json` — otherwise pnpm 10 ignores their build scripts and CF builds fail.
- `.gitignore` must exclude: `node_modules/`, `dist/`, `.astro/`, `.env*` (except `.env.example`).
- Never commit `node_modules/` — if accidentally committed, run `git rm -r --cached node_modules`, add `.gitignore`, and amend the unpushed commit.

## Whitepaper
- PDF generated at build time via `packages/web/src/pages/whitepaper.pdf.ts` (Astro static endpoint using jsPDF).
- Content lives in `packages/web/src/data/whitepaper/content.ts`.
- Figures are vector `Figure` objects in `packages/web/src/data/whitepaper/figures/` (modeled on RISCy pattern).
- Fonts (`NotoSans-Regular/Bold/Italic.ttf`) in `packages/web/src/fonts/`.
- Viewer page at `/whitepaper` embeds the PDF via `<iframe src="/whitepaper.pdf">`.
- PDF.js is at `packages/web/public/pdfjs/` for any custom viewer needs.
- Demo PDF (`compressed.tracemonkey-pldi-09.pdf`) was removed — do not re-add it.

## Favicon
- All three packages (`web`, `pitch`, `docs`) use the same SVG favicon at `public/favicon.svg`.
- Design: two snowmen side-by-side forming a literal "88" silhouette (Drivechain ID #88).
  - Left snowman: Bitcoin-orange scarf (#f7931a), carrot nose pointing right.
  - Right snowman: ice-blue scarf (#a0d0f0), carrot nose pointing left (they face each other).
  - Dark rounded-square backdrop (#0a0f1a, rx=14) — required so white snowmen are visible in light browser themes.
  - 3 faint ambient snow dots (invisible at 16×16, visible at larger sizes — correct degradation).
- If updating the favicon, update all three files and keep the SVG bodies identical (only the path-comment line 1 differs).

## OG image
- `packages/web/public/og-image-v2.png` — 1200×630px, referenced in `Base.astro` OG/Twitter meta tags.
- Generated externally via a generative AI agent (not in-repo). The prompt lives in commit history and session handoffs.
- Design: "Snowside" title (white with ice-blue frost glow), "eCash Drivechain ID 88" badge ("ID 88" in Bitcoin orange), two snowmen side-by-side, dark navy background with light snowfall.
- **Cache-busting:** When replacing the OG image, use a versioned filename (e.g., `og-image-v2.png`) to force social platforms (Facebook, X, LinkedIn) to re-scrape instead of serving a cached copy. Update the `image` prop default in `Base.astro` to match the new filename.
- To regenerate: craft a prompt for an external image generator, produce a 1200×630 PNG, save with an incremented version number, update `Base.astro`'s `image` default.

## retro9000 grant link
- The Avalanche Foundation retro9000 grant announcement tweet is at: `https://x.com/AvalancheFDN/status/1932484367324229635?s=20`
- This URL is linked in three places:
  - `packages/pitch/src/pages/index.astro` — Team section: paragraph text, list item, and badge (was `<span>`, now `<a>`)
  - `packages/web/src/components/Team.astro` — list item and badge (was `<span>`, now `<a>`)
  - `packages/docs/src/content/docs/reference/glossary.md` — NodeRunr entry markdown link

## Landing page contrast pattern (packages/web)
The landing page alternates dark and light sections for visual rhythm. The established pattern:

| Section | Background | Text | Cards |
|---------|-----------|------|-------|
| Nav | surface-0/90 (blur) | white/slate-300 | — |
| Hero | surface-0→1 gradient | white/snow-400 | — |
| About | surface-1 (dark) | slate-300/snow-400 | — |
| WhyAvalanche | snow-50 (light) | slate-900 | surface-1 (dark cards) |
| ValueProposition | surface-0 (dark) | white/slate-300 | surface-2 badges |
| NodeRunr | snow-50 (light) | slate-900 | surface-1 placeholder |
| ECash | surface-1 (dark) | slate-300/snow-400 | — |
| Team | snow-50 (light) | slate-900/slate-700 | surface-1 badges |
| Roadmap | surface-0 (dark) | white/slate-200/snow-400 | — |
| CTA | snow-50 (light) | slate-900 | surface-1 buttons |
| Footer | surface-0 (dark) | slate-400/slate-500 | — |

- Use theme tokens (`surface-0/1/2/3`, `snow-50/100/.../700`, `aval-600/700`, `btc`, `usdc`) from `global.css` — NOT raw Tailwind `gray-*` colors.
- Dark sections: `bg-surface-0` or `bg-surface-1`, text `text-slate-200/300`, headings `text-white`, accents `text-snow-400`.
- Light sections: `bg-snow-50`, text `text-slate-700`, headings `text-slate-900`, accents `text-aval-600`.
- Image placeholders: `border-2 border-dashed border-snow-300` with `bg-surface-1` (dark card on light section) or `bg-white/50`.
- `global.css` body has `background-color: var(--color-surface-0)` to prevent white flash before content renders.
- The `index.astro` wrapper is `bg-surface-0 text-slate-200` (dark base); each section overrides its own background.

## Heredoc discipline
When writing files via terminal heredocs (`cat > file << 'EOF'`):
- Use a unique delimiter like `'EOFLOWN'` instead of `'EOF'` to avoid conflicts with file content.
- Send ONE file at a time if the file is large (>80 lines), or 2-3 small files with `wc -l` verification at the end.
- ALWAYS run `wc -l <file>` after writing to verify the line count matches expectation.
- If a multi-file heredoc paste gets garbled in the terminal, fall back to single-file pastes.
- **CRITICAL:** If markdown content inside a heredoc contains triple backticks (```), they will conflict with the outer markdown code block. Use 4-space indented code blocks instead of fenced code blocks inside heredoc content. Alternatively, use quadruple backticks (````bash) for the outer code block.
- Use `cat >> file << 'EOF'` (append) for large files split across pastes; strip the closing 3 lines first with `head -n -3`.

## Handoff
- At the end of each session, update `docs/HANDOFF.md` with the current state and next steps.
- Include: what was done, what remains, build status, and any known errors.
