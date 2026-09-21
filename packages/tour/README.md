# @snowside/tour

Interactive slideshow tour of Snowside, deployed to **`tour.snowside.network`**.

**Zero dependencies.** No Slidev, no Vite, no Vue, no UnoCSS — the whole tour is
a static HTML document, one stylesheet and one small script. The build is a
single Node script.

## Quick start

```bash
pnpm --filter @snowside/tour build   # -> dist/
pnpm --filter @snowside/tour serve   # http://localhost:4321
```

## Scripts

| Command | Action |
|---|---|
| `pnpm build` | Build the static tour → `dist/` |
| `pnpm serve` | Local preview of `dist/` (mirrors production routing) |
| `pnpm deploy` | Build + `wrangler pages deploy` to the `snowside-tour` project |

## One document, two layouts

`dist/index.html` and `dist/mobile/index.html` are **byte-identical** — the same
file served at two paths. The layout is chosen at runtime from the viewport:

| Layout | When | Behaviour |
|---|---|---|
| **deck** | desktop, tablet, phone in landscape | fixed 980×552 canvas scaled uniformly |
| **phone** | phone in portrait | reflowing, one slide per screen, horizontal swipe |

The switch uses the deck's own scale factor, `s = min(vw/980, vh/552)`, and
reflows when `s < 0.65`. Measured values: phone portrait `0.367–0.439` (reflow),
phone landscape `0.707–0.779` (deck), tablet `0.784–1.045` (deck), desktop
`1.304–1.957` (deck). The threshold lives in three places that must stay in
sync — `assets/tour.css`, `assets/tour.js` (`MOBILE_SCALE`) and the inline boot
script in `scripts/build-tour.mjs`.

### Why not Slidev

Slidev's canvas is fixed and scaled by a **single transform** with no reflow
mode, so a 16.8px paragraph paints at ~6.7px on a 390×844 phone. Media queries
cannot fix this: they evaluate against the real viewport while the canvas is
scaled. The deck also used none of Slidev's features (zero code fences, zero
`v-click`, zero math, zero transitions), while paying ~936 KB of assets for
slide splitting and keyboard nav. The rebuilt deck reproduces the original
visuals — the CSS values were lifted verbatim from the old built stylesheet —
and ships ~28 KB of HTML with a 21 KB stylesheet and an 9 KB script.

## Files

| File | Role |
|---|---|
| `content.mjs` | **Single source of truth for all copy.** |
| `slides.mjs` | Slide model — order, layout kind, and which blocks each slide uses. |
| `scripts/build-tour.mjs` | The build. Renders the document, copies assets, writes `_redirects`. |
| `scripts/serve.mjs` | Local static server with the SPA fallback rule. |
| `assets/tour.css` | Complete stylesheet for both layouts. |
| `assets/tour.js` | Client runtime: navigation, swipe, mode switching, deep links. |
| `functions/_middleware.js` | Cloudflare Pages SPA fallback for deep links. |
| `public/` | `favicon.svg`, `cover-banner.png` (OG poster), `snowside-tour-poster.png`. |

Editing copy means editing **`content.mjs` only** — both layouts read from it, so
they cannot drift.

## Navigation

- **Keyboard:** arrows, PageUp/PageDown, Space, Home/End, `F` for full screen
- **Deck:** click left third to go back, the rest to advance; on-screen ← →
- **Phone:** swipe left/right, dot rail, or the top-bar counter
- **Deep links:** `#1` … `#12` (slide 1 is the default)
- Legacy paths (`/2`) still resolve via the SPA fallback.

## Accessibility

Slides are `<section>` elements with `aria-label`s inside a labelled
`aria-roledescription="carousel"` region, keyboard navigation is complete, focus
rings are preserved, and `prefers-reduced-motion` disables transitions. With
JavaScript disabled a `<noscript>` block stacks every slide into one scrollable
page.

## Print / PDF

`@media print` renders one 980×552 page per slide, replacing `slidev export`:

```bash
# Chrome/Chromium headless, or any browser's "Save as PDF"
chrome --headless --print-to-pdf=dist/tour.pdf http://localhost:4321/
```

## Deployment

Cloudflare Pages project: **`snowside-tour`**. Deployed by
`.github/workflows/guardian.yml` (`deploy-tour` job) on every push to `master`.

```bash
cd packages/tour && pnpm run build
pnpm exec wrangler pages deploy dist --project-name snowside-tour --branch master --commit-dirty=true
```

`wrangler pages deploy` is run from this directory so the `functions/` folder is
picked up.

## Content provenance

Slide text originates from `content.mjs`, which was moved verbatim out of the
former `slides.md` deck and its Vue components. The comparison, roadmap and risk
data in turn trace back to `packages/pitch/src/pages/index.astro`. The pitch page
keeps its own copy of that data by design — only the tour's two layouts share
`content.mjs`.
