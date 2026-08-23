# Snowside Handoff — 2026-08-23 (Session 18, Lean Canvas + OG Posters)

## Session 18 summary — 2026-08-23

### Primary Task: Publish Lean Canvas to canvas.snowside.network + wire OG posters

Two deliverables: (1) a new Cloudflare Pages site `canvas.snowside.network` for the
Snowside Lean Canvas (PNG view + PDF download), and (2) OpenGraph posters for both
the new canvas site and the existing pitch site.

### Decisions
- **Format:** Astro static page rendering the high-res Lean Canvas PNG inline
  (instant view, responsive) + PDF & PNG download links. PDF kept for vector-quality
  download; PNG served for instant viewing.
- **OG poster format:** 1200×630 (Project Lead's standard OG format; 1.91:1 —
  note: NOT 16:9, this is the Facebook/Meta `og:image` standard).
- **Hosting:** Cloudflare Pages project `snowside-canvas` (mirrors `snowside-pitch`),
  separate from the API Worker (`snowside-api`).
- **ImageMagick** used to resize both posters from 2048×1152 → 1200×630
  (fill + center-crop via `-resize 1200x630^ -gravity center -extent 1200x630`).

### New Package: packages/canvas
- `astro.config.mjs` — site `https://canvas.snowside.network`, static output.
- `package.json` — `@snowside/canvas`, deps: astro 7.2.0, tailwindcss 4.3.2,
  @tailwindcss/postcss 4.3.3, wrangler 4.120.0 (devDep). Scripts: dev/build/preview/lint/deploy.
- `postcss.config.mjs` — @tailwindcss/postcss (NOT vite plugin).
- `tsconfig.json` — astro/strict.
- `wrangler.toml` — Pages config (name `snowside-canvas`, pages_build_output_dir `dist`).
- `src/layouts/Base.astro` — full OG + Twitter meta, OG image
  `/snowside-lean-canvas-poster.png` (1200×630), Simple Analytics, no noindex.
- `src/components/Nav.astro` — fixed nav, "Download PDF" button.
- `src/components/Footer.astro` — links to main site, whitepaper, docs, GitHub, PDF.
- `src/pages/index.astro` — hero + full-res Lean Canvas PNG (4724×2233) inline +
  download buttons (PDF, PNG, whitepaper).
- `src/styles/global.css` — `@import 'tailwindcss/index.css'` (ENOENT fix applied
  from day one), Snowside theme palette.
- `public/favicon.svg` — copied from pitch (identical snowmen-88 design).
- `public/snowside-lean-canvas.png` — 4724×2233, full canvas (720K).
- `public/snowside-lean-canvas.pdf` — 1 page, 512K (from ~/Downloads).
- `public/snowside-lean-canvas-poster.png` — 1200×630 OG poster (832K).

### Pitch OG Fix (packages/pitch)
- `public/snowside-pitch-poster.png` — 1200×630 OG poster (908K, from ~/Downloads).
- `src/layouts/Base.astro`:
  - image default `/og-image-v2.png` → `/snowside-pitch-poster.png`
    (the `/og-image-v2.png` file never existed in pitch/public — OG was broken).
  - og:image dimensions 1200×630 → 2048×1152 → 1200×630 (corrected to actual).
  - Descriptive og/twitter image alt text added.
- `src/styles/global.css` — `@import 'tailwindcss'` → `'tailwindcss/index.css'`
  (pre-existing ENOENT build break, now fixed; pitch build passes).

### Root package.json
- Added `build:canvas` and `dev:canvas` scripts.
- `build` now runs web → pitch → canvas.

### Cloudflare Deployment (aBitSuite account, ID 2cdd50405dc13f86476f4d03e1ad1282)
- **Pages project `snowside-canvas` created** via `wrangler pages project create`.
- **Custom domain `canvas.snowside.network`** registered on the project via
  Cloudflare API (POST /accounts/.../pages/projects/snowside-canvas/domains).
  - Domain id: 76a4b99f-9f27-4f37-a29c-f3f18aa0f17c
  - zone_tag: bfaf301d3c139d78abfb585895c4a8f4
  - Project Lead added the DNS CNAME (canvas → snowside-canvas.pages.dev, proxied)
    via dashboard — wrangler OAuth token lacked DNS:Edit scope.
  - Status: **active** (certificate + validation both active).
- **DNS CNAME created by Project Lead** (not via API; `wrangler login` token lacked
  DNS:Edit scope — `wrangler login` consent screen would need "Edit Cloudflare DNS"
  checked to do this programmatically in future).
- **Deployments:**
  - canvas → https://snowside-canvas.pages.dev (HTTP 200) + https://canvas.snowside.network (active)
  - pitch → https://snowside-pitch.pages.dev + https://pitch.snowside.network
- **Cache purge:** Ran `POST /accounts/.../pages/projects/{project}/deployments/purge_cache`
  for both projects after poster resize, so crawlers immediately fetch 1200×630.

### Verification (via Cloudflare edge IP 172.67.184.230 — local resolver lagged)
- canvas.snowside.network HTML: og:image → https://canvas.snowside.network/snowside-lean-canvas-poster.png
- canvas poster: 1200×630 PNG ✅
- canvas OG meta: width 1200, height 630 ✅
- canvas PDF: application/pdf, 512403 bytes ✅
- pitch.snowside.network poster: 1200×630 PNG ✅
- pitch OG meta: width 1200, height 630 ✅

### Commits (2 pushed to master)
1. `41afa496` — feat(canvas): add canvas.snowside.network Lean Canvas site + pitch OG poster
2. `3dbb0d91` — fix(og): resize posters to 1200x630 (standard OG format)

### Build Status
- **Canvas build:** ✅ PASSES (1 page, ~600ms)
- **Pitch build:** ✅ PASSES (1 page, ~700ms) — was broken (ENOENT tailwindcss import), now fixed
- **Root build (web → pitch → canvas):** ✅ all pass
- **Cloudflare Pages:** ✅ both deployed, cache purged, custom domains active

### Known Issue: wrangler OAuth scopes
- `wrangler login` token (stored at ~/.config/.wrangler/config/default.toml, email
  hello@abitsuite.com) lacks DNS:Edit scope. Could not create the `canvas` CNAME
  via API (code 10000 "Authentication error" on /zones/.../dns_records).
- Workaround: Project Lead added the CNAME via dashboard.
- Future fix: re-run `wrangler login` and ensure "Edit Cloudflare DNS" scope is
  checked on the consent screen, OR create a Cloudflare API Token with DNS:Edit
  and set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID env vars.

### Files Modified/Created This Session
- `packages/canvas/` — new package (10 files: config, layout, components, page, styles, public assets)
- `packages/pitch/src/layouts/Base.astro` — OG image + dimensions + alts
- `packages/pitch/src/styles/global.css` — tailwindcss ENOENT fix
- `packages/pitch/public/snowside-pitch-poster.png` — new OG poster
- `package.json` — canvas build/dev scripts
- `pnpm-lock.yaml` — updated (wrangler + canvas deps)
- `docs/HANDOFF.md` — this file

### Next Steps
1. **Visually verify OG posters** by pasting https://canvas.snowside.network and
   https://pitch.snowside.network into the social platform's card preview tool
   (e.g. https://socialsharepreview.com or platform debugger) to confirm the
   1200×630 posters render as `summary_large_image` cards.
2. **Verify canvas.snowside.network** in a browser — confirm the Lean Canvas PNG
   renders crisply and the PDF/PNG download links work.
3. **Add link to canvas site** from the main web package (packages/web) footer/nav
   if desired — currently no link exists from web → canvas (similar to pitch
   isolation, but canvas is indexable so a link may be wanted).
4. **Update AGENTS.md** to document the new `packages/canvas` package and the
   `canvas.snowside.network` subdomain in the repo structure section.

### Previous Session
Session 17 (2026-08-18): Whitepaper v0.4 final corrections (missing font glyphs
U+2212/U+2192). See git log for details.
