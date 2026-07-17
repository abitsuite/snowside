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
- All source files must include a comment at the very top with the file's path relative to the monorepo root (e.g., `// packages/web/src/components/Hero.astro`).
- Packages use `pnpm` with workspace filtering. Never use `npm` inside packages — always `pnpm`.
- `package-lock.json` must NOT exist in any package. Delete it if found. Only `pnpm-lock.yaml` at root.

## Tailwind CSS v4 with Astro
- **CRITICAL:** Use `@tailwindcss/postcss` (NOT `@tailwindcss/vite`). The Vite plugin has a rolldown incompatibility (`Missing field tsconfigPaths`) that breaks on Cloudflare Pages build servers even when it passes locally.
- Each Astro package needs a `postcss.config.mjs` with:
  `export default { plugins: { '@tailwindcss/postcss': {} } };`
- Remove the `tailwindcss()` Vite plugin from `astro.config.mjs` — PostCSS is auto-detected by Vite.
- Keep `@import 'tailwindcss'` and `@theme` blocks in `global.css` — the PostCSS plugin processes them identically.

## Starlight (packages/docs)
- **CRITICAL:** Use `.md` files (NOT `.mdx`) for pages that use `<Steps>` with `<Item>`. Starlight auto-injects the `Item` component for `.md` files but NOT for `.mdx` files. `Item` is also NOT exported from `@astrojs/starlight/components`, so you cannot import it explicitly in `.mdx`.
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
