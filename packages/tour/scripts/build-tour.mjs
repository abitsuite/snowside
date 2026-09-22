// packages/tour/scripts/build-tour.mjs
//
// Builds the ENTIRE Snowside Tour as a dependency-free static site.
// Run directly: node scripts/build-tour.mjs   (also the `build` npm script)
//
// WHAT IT PRODUCES
// ----------------
//   dist/index.html         the deck      — desktop + tablet
//   dist/mobile/index.html  the mobile    — phones (reflowing slideshow)
//   dist/404.html           SPA fallback for Cloudflare Pages
//   dist/_redirects         SPA fallback rule
//   dist/assets/*           CSS + JS + fonts are copied in
//
// WHY THIS REPLACED SLIDEV
// ------------------------
// The tour used @slidev/cli. The deck used essentially NONE of Slidev's
// features: zero code fences, zero v-click, zero math, zero transitions, and
// a single HTML comment for notes. Everything visually distinctive — the snow
// background, cards, cover, connect grid — was already bespoke CSS.
//
// Slidev charged ~936 KB of assets (145 KB JS + 101 KB CSS) for slide
// splitting, keyboard nav and a progress bar, and its rendering model is a
// FIXED 980x552 canvas scaled uniformly:
//     scale = Math.min(viewW / 980, viewH / 552)      (@slidev/client SlideContainer)
// so on a 390x844 phone a 16.8px paragraph paints at ~6.7px. That cannot be
// fixed with media queries, because media queries see the real viewport while
// the canvas is scaled. Slidev has no reflow mode.
//
// Rebuilding custom gives a genuinely responsive mobile slideshow, one content
// source, and no framework runtime. The deck visuals are preserved by lifting
// the CSS values verbatim out of the old built stylesheet (assets/tour.css).
//
// Both displays come from ONE slide list (slides.mjs), so they cannot drift.

import { writeFileSync, mkdirSync, readFileSync, cpSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { slides, totalSlides } from '../slides.mjs'
import {
  comparison,
  risks,
  roadmap,
  PAGE_TITLE,
  PAGE_DESCRIPTION,
} from '../content.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const distDir = resolve(rootDir, 'dist')
const assetsDir = resolve(rootDir, 'assets')
const publicDir = resolve(rootDir, 'public')

const ORIGIN = 'https://tour.snowside.network'
const OG_IMAGE = `${ORIGIN}/cover-banner.png`

/* ------------------------------------------------------------------ *
 * Escaping / inline formatting
 * ------------------------------------------------------------------ */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Card bodies may legitimately carry <em> (the x402 slide). Allow that one tag
// through; everything else is escaped.
const escKeepEm = (s) =>
  esc(s).replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>')

// The cover subtitle may carry an explicit <br />, so the second half of the
// line sits on its own row instead of wrapping wherever the canvas happens to
// run out of width ("The eCash Sidechain on Avalanche." / "Native ECX Gas ...").
// Two forms are accepted: a literal <br />, and a bare newline, so the copy
// reads naturally in content.mjs.
const escKeepBr = (s) =>
  esc(s)
    .replace(/&lt;br\s*\/?&gt;/g, '<br />')
    .replace(/\n/g, '<br />')

// Inline **bold** in prose leads.
const inline = (s) =>
  escKeepEm(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

// Lowercase, hyphenated slug used for the <section> id and deep links.
const slug = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* ------------------------------------------------------------------ *
 * Block renderers — one per `type` in slides.mjs
 * ------------------------------------------------------------------ */
function renderCards(block) {
  // 4-up grids sit inside the 980px canvas; Slidev used tighter text there.
  const compact = block.cols >= 4 || block.cards.length > 4
  const gridClass = 'grid' + (compact ? ' compact' : '') + (block.cols >= 4 ? ' tight' : '')
  const cards = block.cards
    .map(
      (c) => `          <article class="snow-card">
            <div class="snow-card-kicker">${esc(c.kicker)}</div>
            <h3>${esc(c.title)}</h3>
            <p>${escKeepEm(c.body)}</p>
          </article>`
    )
    .join('\n')
  return `        <div class="${gridClass}" data-cols="${block.cols}">
${cards}
        </div>`
}

function renderNote(block) {
  const strong = block.strong
    ? `<strong>${inline(block.strong)}</strong>`
    : ''
  const rest = block.rest ? inline(block.rest) : ''
  return `        <p class="snow-note">${strong}${rest}</p>`
}

function renderComparison() {
  const head = comparison.columns
    .map(
      (c, i) => `              <th${i === 1 ? ' class="hl"' : ''}>${esc(c)}</th>`
    )
    .join('\n')
  const rows = comparison.rows
    .map(
      (r) => `            <tr>
              <th scope="row">${esc(r.feature)}</th>
              <td class="hl">${esc(r.snowside)}</td>
              <td>${esc(r.lightning)}</td>
              <td>${esc(r.base)}</td>
            </tr>`
    )
    .join('\n')
  return `        <div class="table-wrap">
          <table>
            <thead>
              <tr>
${head}
              </tr>
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>`
}

function renderRisks() {
  const items = risks.items
    .map(
      (r) => `          <article class="snow-card">
            <div class="risk-head"><span class="tag tag-risk">RISK</span><p class="risk-name">${esc(r.risk)}</p></div>
            <div class="risk-body"><span class="tag tag-fix">FIX</span><p>${escKeepEm(r.mitigation)}</p></div>
          </article>`
    )
    .join('\n')
  return `        <div class="grid" data-cols="2">
${items}
        </div>`
}

function renderRoadmap() {
  const phases = roadmap.phases
  const items = phases
    .map(
      (p, i) => `          <li class="phase">
            <div class="phase-rail">
              <div class="phase-num">${i + 1}</div>
${i < phases.length - 1 ? '              <div class="phase-line"></div>\n' : ''}            </div>
            <div class="phase-body">
              <h3>${esc(p.month)}</h3>
              <p>${escKeepEm(p.milestone)}</p>
            </div>
          </li>`
    )
    .join('\n')
  return `        <ol class="phases">
${items}
        </ol>`
}

function renderRevenue(block) {
  const cards = block.cards
    .map(
      (c) => `          <article class="snow-card">
            <div class="snow-card-kicker">Revenue Stream</div>
            <h3>${esc(c.title)}</h3>
            <div class="snow-revenue-apy">${esc(c.apy)}</div>
            <p>${escKeepEm(c.note)}</p>
          </article>`
    )
    .join('\n')
  return `        <div class="grid" data-cols="3">
${cards}
        </div>`
}

function renderFaqs(block) {
  const items = block.items
    .map(
      (f) => `          <article class="snow-card">
            <h3>${esc(f.q)}</h3>
            <p>${escKeepEm(f.a)}</p>
          </article>`
    )
    .join('\n')
  return `        <div class="faq-grid">
${items}
        </div>`
}

function renderBlock(block) {
  switch (block.type) {
    case 'cards': return renderCards(block)
    case 'note': return renderNote(block)
    case 'comparison': return renderComparison()
    case 'risks': return renderRisks()
    case 'roadmap': return renderRoadmap()
    case 'revenue': return renderRevenue(block)
    case 'faqs': return renderFaqs(block)
    default: throw new Error('build-tour: unknown block type: ' + block.type)
  }
}

/* ------------------------------------------------------------------ *
 * Slide renderers
 * ------------------------------------------------------------------ */
function renderSlide(slide, i) {
  const num = i + 1
  const label = slide.label || slide.heading || ''
  // Slide 1 is marked active in the MARKUP (not just by JS) so the deck shows
  // content even if the runtime script is slow, blocked, or fails to load.
  const active = i === 0 ? ' active' : ''
  const attrs = `data-index="${i}" data-label="${esc(label)}" id="slide-${slug(slide.id)}"`

  if (slide.kind === 'cover') {
    return `      <section class="slide${active}" ${attrs} aria-label="${esc(label)}">
        <div class="snow-bg">
          <div class="cover-inner snow-cover-root">
            <div class="cover-kicker">${esc(slide.kicker)}</div>
            <img src="${esc(slide.banner)}" alt="${esc(slide.bannerAlt)}" class="cover-banner" />
            <h1 class="cover-tagline">${escKeepBr(slide.tagline)}</h1>
            <p class="cover-subtitle">${escKeepBr(slide.subtitle)}</p>
          </div>
        </div>
      </section>`
  }

  if (slide.kind === 'connect') {
    const links = slide.links
      .map((l) => `            <a class="snow-btn" href="${esc(l.href)}">${esc(l.icon)} ${esc(l.label)}</a>`)
      .join('\n')
    const footer = slide.footer.map((l) => esc(l)).join('<br />\n            ')
    return `      <section class="slide${active}" ${attrs} aria-label="${esc(label)}">
        <div class="snow-bg">
          <div class="connect-inner snow-connect-root">
            <h1>${esc(slide.heading)}</h1>
            <p class="connect-lead">${esc(slide.lead)}</p>
            <div class="connect-grid">
${links}
            </div>
            <p class="connect-footer">
            ${footer}
            </p>
          </div>
        </div>
      </section>`
  }

  // default
  const lead = slide.lead ? `          <p class="slide-lead">${inline(slide.lead)}</p>\n` : ''
  const blocks = slide.blocks.map((b) => renderBlock(b)).join('\n')
  return `      <section class="slide${active}" ${attrs} aria-label="${esc(label)}">
        <div class="snow-bg">
          <div class="slide-label">Snowside Tour</div>
          <div class="slide-content">
            <h2>${esc(slide.heading)}</h2>
${lead}${blocks}
          </div>
          <div class="slide-number">${num} / ${totalSlides}</div>
        </div>
      </section>`
}

/* ------------------------------------------------------------------ *
 * Document shell
 * ------------------------------------------------------------------ */
const slidesHtml = slides.map((s, i) => renderSlide(s, i)).join('\n')

// Real <button>s: the rail is clickable on phones, so it must be reachable by
// keyboard and announced by screen readers. It is hidden with display:none on
// the deck (see .dots), which also removes it from the tab order there.
const dotsHtml = slides
  .map((s, i) => `        <button type="button" class="dot${i === 0 ? ' active' : ''}" data-dot="${i}" aria-label="Go to slide ${i + 1}${s.label ? ': ' + esc(s.label) : ''}"></button>`)
  .join('\n')

/* ------------------------------------------------------------------ *
 * Content-hashed asset names
 * ------------------------------------------------------------------ *
 * Cloudflare Pages serves /assets/* with `cache-control: public,
 * max-age=14400, must-revalidate`. Under a fixed filename that means a
 * browser which already has tour.css keeps the OLD stylesheet for up to four
 * hours after a deploy — a stale rule silently overrides the new one and the
 * page looks like the change was never made.
 *
 * Hashing the filename sidesteps the whole class of bug: a changed file gets a
 * new URL, so it cannot be served from any cache, while an unchanged file keeps
 * its URL and stays cached. The hash is the first 8 hex characters of the
 * file's SHA-256, which is plenty for a two-file bundle.
 */
const assetHash = (file) =>
  createHash('sha256').update(readFileSync(resolve(assetsDir, file))).digest('hex').slice(0, 8)

const cssHref = `/assets/tour.${assetHash('tour.css')}.css`
const jsSrc = `/assets/tour.${assetHash('tour.js')}.js`

const head = `  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(PAGE_TITLE)}</title>
  <meta name="description" content="${esc(PAGE_DESCRIPTION)}" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

  <!-- Fonts: same families the previous build loaded from Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;700;800&family=JetBrains+Mono:wght@200;400;600;700&display=swap" type="text/css" />

  <link rel="stylesheet" href="${cssHref}" />

  <!-- Mode boot: runs BEFORE first paint so a reflowing phone never flashes the
       deck (and a tablet or desktop never flashes the reflow layout). Kept
       inline and tiny on purpose. Threshold must match assets/tour.js
       (MOBILE_SCALE) and the documented value in assets/tour.css. -->
  <script>
    (function () {
      var w = window.innerWidth, h = window.innerHeight
      var scale = Math.min(w / 980, h / 552)
      var mode = scale < 0.60 ? 'mobile' : 'deck'
      document.documentElement.setAttribute('data-mode', mode)
      if (mode === 'deck') {
        document.documentElement.style.setProperty('--scale', String(scale))
      }
    })()
  </script>

  <!-- Simple Analytics -->
  <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
  <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>

  <!-- Open Graph -->
  <meta property="og:title" content="${esc(PAGE_TITLE)}" />
  <meta property="og:site_name" content="Snowside Tour" />
  <meta property="og:description" content="${esc(PAGE_DESCRIPTION)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${ORIGIN}/" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:secure_url" content="${OG_IMAGE}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(PAGE_TITLE)}" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@0xShomari" />
  <meta name="twitter:creator" content="@0xShomari" />
  <meta name="twitter:title" content="${esc(PAGE_TITLE)}" />
  <meta name="twitter:description" content="${esc(PAGE_DESCRIPTION)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <meta name="twitter:image:alt" content="${esc(PAGE_TITLE)}" />`

const body = `  <div class="progress" role="progressbar" aria-label="Tour progress"></div>

  <div class="mobile-bar">
    <div class="mobile-wordmark">Snowside Tour</div>
    <div class="mobile-counter">1 / ${totalSlides}</div>
  </div>

  <div class="viewport" role="region" aria-roledescription="carousel" aria-label="Snowside Tour slides">
    <div class="stage">
${slidesHtml}
    </div>
  </div>

  <div class="dots" role="group" aria-label="Slide navigation">
${dotsHtml}
  </div>

  <!-- Phone hint: swiping is not self-evident on a first visit. Fades out on
       first successful interaction (see assets/tour.js). -->
  <div class="swipe-hint" aria-hidden="true">Swipe or tap &rarr;</div>

  <div class="deck-controls">
    <button type="button" data-nav="prev" aria-label="Previous slide">&#8592;</button>
    <button type="button" data-nav="next" aria-label="Next slide">&#8594;</button>
  </div>

  <p class="visually-hidden">Use the arrow keys, Page Up and Page Down, Home and End, or swipe
  to move between the ${totalSlides} slides. Press F to toggle full screen.</p>

  <!-- Without JS the deck cannot advance, so show every slide as a long page
       instead of a single frozen frame. -->
  <noscript>
    <style>
      html, body { overflow: auto !important; }
      .viewport { position: static !important; overflow: visible !important; }
      .stage { position: static !important; transform: none !important; width: auto !important; height: auto !important; }
      .slide { display: block !important; position: relative !important; inset: auto !important; height: auto !important; min-height: 552px; margin-bottom: 1rem; }
      .slide-content, .connect-inner { height: auto !important; overflow: visible !important; }
      .progress, .deck-controls, .dots, .mobile-bar { display: none !important; }
    </style>
  </noscript>

  <script src="${jsSrc}"></script>`

const html = `<!DOCTYPE html>
<html lang="en" data-mode="deck">
<head>
${head}
</head>
<body data-mode="deck">
${body}
</body>
</html>
`

/* ------------------------------------------------------------------ *
 * Emit
 * ------------------------------------------------------------------ */
mkdirSync(distDir, { recursive: true })
mkdirSync(resolve(distDir, 'assets'), { recursive: true })

// CSS + JS, written under content-hashed names (see assetHash above).
writeFileSync(
  resolve(distDir, cssHref.replace('/assets/', 'assets/')),
  readFileSync(resolve(assetsDir, 'tour.css'))
)
writeFileSync(
  resolve(distDir, jsSrc.replace('/assets/', 'assets/')),
  readFileSync(resolve(assetsDir, 'tour.js'))
)

// Legacy unhashed copies.
// index.html is served max-age=0, must-revalidate, so it is always fresh — but
// a browser holding a pre-upgrade copy still asks for /assets/tour.css by its
// old name. Without these the request 404s and the page renders unstyled.
// They are rewritten on every build, so they cannot serve stale CSS to an
// existing HTML that still points at them.
writeFileSync(resolve(distDir, 'assets', 'tour.css'), readFileSync(resolve(assetsDir, 'tour.css')))
writeFileSync(resolve(distDir, 'assets', 'tour.js'), readFileSync(resolve(assetsDir, 'tour.js')))

// public/ (favicon, cover banner, poster) -> dist/
if (existsSync(publicDir)) {
  cpSync(publicDir, distDir, { recursive: true })
}

// ONE document. There is no separate mobile page any more: the layout is
// chosen from the viewport by the inline boot script, before first paint.
writeFileSync(resolve(distDir, 'index.html'), html, 'utf8')

// SPA fallback: Cloudflare Pages serves 404.html for unknown paths. The
// functions/_middleware.js rewrites extensionless miss to /index.html.
writeFileSync(resolve(distDir, '404.html'), html, 'utf8')
writeFileSync(resolve(distDir, '_redirects'), '/*    /index.html   200\n', 'utf8')

console.log(`[build-tour] wrote dist/index.html (${slides.length} slides; layout switches on viewport scale)`)
console.log(`[build-tour] assets: ${cssHref} + ${jsSrc}`)
console.log(`[build-tour] wrote dist/404.html + dist/_redirects`)
