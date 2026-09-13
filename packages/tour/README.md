# @snowside/tour

Interactive slideshow tour of Snowside, deployed to **`tour.snowside.network`**.

Built with [Slidev](https://sli.dev) (Vite + Vue 3 + Markdown) + UnoCSS. The deck
is the single source of truth: `slides.md` (11 slides).

## Quick start

```bash
pnpm install --filter @snowside/tour
pnpm --filter @snowside/tour dev   # opens at http://localhost:3030
```

## Scripts

| Command | Action |
|---|---|
| `pnpm dev` | Slidev dev server (hot reload, presenter mode) |
| `pnpm build` | Static SPA build → `dist/` + head injection (analytics, OG, favicon) |
| `pnpm export` | PDF export (for grant/AMA offline use) |
| `pnpm preview` | Preview the production build locally |

## How head injection works

Slidev generates `index.html` and `404.html` at build time. Its `head:` frontmatter
renders **client-side** (Vue runtime), which is unreliable for analytics scripts
and crawler-read meta. `scripts/inject-head.mjs` runs after `slidev build` and
injects into the static HTML:

- Simple Analytics (`<script>` + `<noscript>`)
- Open Graph + Twitter/X card meta (1200×630 poster)
- Local favicon (`/favicon.svg`, overriding Slidev's CDN default)
- SPA fallback (`_redirects` → `/* /index.html 200`)

The `favicon:` frontmatter field sets the favicon in initial HTML (verified).
Title is also normalized by the inject script.

## Layouts & components

- `layouts/snow-cover.vue` — title slide
- `layouts/snow-default.vue` — standard content (shows title + page numbers)
- `layouts/snow-section.vue` — section dividers
- `layouts/snow-connect.vue` — closing "Connect with Us"
- `components/ComparisonTable.vue` — Snowside vs EthSide vs Lightning
- `components/RoadmapTimeline.vue` — Month 1–4 + Ongoing
- `components/RiskMitigation.vue` — RISK / FIX grid
- `components/StakingRevenueCard.vue` — revenue stream cards

## Content provenance

All slide text is grounded in `packages/pitch/src/pages/index.astro` (the verified
pitch page): `whyAvalanche`, `comparison`, `risks`, `roadmap`, and `faqs` arrays.
Slide 9 (Opportunities) and slide 11 (Connect with Us) are new.

## Deployment

Cloudflare Pages project: **`snowside-tour`**.

```bash
pnpm --filter @snowside/tour build
pnpm exec wrangler pages deploy packages/tour/dist \
  --project-name snowside-tour --branch master --commit-dirty=true
```

Custom domain: `tour.snowside.network` (CNAME to the Pages project).

## Navigation (built into Slidev)

| Input | Action |
|---|---|
| `→` / `Space` / `Page Down` / Click | Next |
| `←` / `Page Up` | Previous |
| Mouse wheel / trackpad | Navigate |
| `Home` / `End` | First / last |
| `O` | Overview grid |
| `P` | Presenter mode |
| `F` | Fullscreen |
