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
- Root build (both): `pnpm run build` (runs web then pitch)
- Dev web: `pnpm run dev:web`
- Dev pitch: `pnpm run dev:pitch`
- Production URLs: https://snowside.network (web), https://pitch.snowside.network (pitch)

## File conventions
- All source files must include a comment at the very top with the file's path relative to the monorepo root (e.g., `// packages/web/src/components/Hero.astro`).
- Packages use `pnpm` with workspace filtering.

## Whitepaper
- PDF generated at build time via `packages/web/src/pages/whitepaper.pdf.ts` (Astro static endpoint).
- Content lives in `packages/web/src/data/whitepaper/content.ts`.
- Figures are vector `Figure` objects in `packages/web/src/data/whitepaper/figures/` (modeled on RISCy pattern).
- Fonts (`NotoSans-Regular/Bold/Italic.ttf`) in `packages/web/src/fonts/`.
- Viewer page at `/whitepaper` embeds the PDF via `<iframe src="/whitepaper.pdf">`.
- PDF.js is at `packages/web/public/pdfjs/` for any custom viewer needs.

## Heredoc discipline
When writing files via terminal heredocs (`cat > file << 'EOF'`):
- Send ONE file at a time if the file is large (>80 lines), or 2-3 small files with `wc -l` verification at the end.
- ALWAYS run `wc -l <file>` after writing to verify the line count matches expectation.
- If a multi-file heredoc paste gets garbled in the terminal, fall back to single-file pastes.
- Use `cat >> file << 'EOF'` (append) for large files split across pastes; strip the closing 3 lines first with `head -n -3`.

## Handoff
- At the end of each session, update `docs/HANDOFF.md` with the current state and next steps.
- Include: what was done, what remains, build status, and any known errors.
