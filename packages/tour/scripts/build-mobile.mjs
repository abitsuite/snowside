// packages/tour/scripts/build-mobile.mjs
//
// Generates the RESPONSIVE tour page at /mobile/ (dist/mobile/index.html).
//
// WHY THIS EXISTS
// ---------------
// Slidev (any version, including 53) renders every slide on a FIXED 980x552
// canvas and scales that canvas uniformly with
//   scale = Math.min(viewportW / 980, viewportH / 552)
// (verified in @slidev/client SlideContainer.vue). On a 390x844 phone that
// scale is ~0.398, so a 16.8px paragraph paints at ~6.7px on screen. That is
// a property of the framework's presentation model, not a CSS bug, so it
// cannot be fixed by media queries. This page is the mobile answer: real
// reflowing HTML/CSS that uses the SAME content source as the deck.
//
// CONTENT SOURCE OF TRUTH
// -----------------------
// content.mjs. Both this page and the Slidev deck read from it, so a copy
// change made once cannot drift between the two displays.
//
// OUTPUT
// ------
// dist/mobile/index.html — fully static, no framework runtime, no JS required
// to read. A small inline script adds the "open the deck" affordance only.
//
// Usage: node scripts/build-mobile.mjs (run after `slidev build`)
// Invoked automatically via the `build` npm script.

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  cover,
  whatIsSnowside,
  twoAssets,
  howItWorks,
  whyAvalanche,
  agenticPayments,
  comparison,
  risks,
  roadmap,
  opportunities,
  faqs,
  connect,
  BRAND_TITLE,
  BRAND_TAGLINE,
  PAGE_TITLE,
  PAGE_DESCRIPTION,
} from '../content.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '..', 'dist')

const ORIGIN = 'https://tour.snowside.network'
const OG_IMAGE = `${ORIGIN}/cover-banner.png`

/* ------------------------------------------------------------------ *
 * Tiny helpers. `esc` guards attribute/text injection; content is ours,
 * but escaping keeps this generator safe if copy ever includes markup.
 * ------------------------------------------------------------------ */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Card bodies may legitimately contain <em> (x402 slide). Allow that one tag
// through while escaping everything else.
const escKeepEm = (s) =>
  esc(s).replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>')

// Inline **bold** in the prose leads.
const inline = (s) =>
  escKeepEm(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

/* ------------------------------------------------------------------ *
 * Section renderers
 * ------------------------------------------------------------------ */
function cardsSection(section, cols) {
  const lead = section.lead
    ? `<p class="lead">${inline(section.lead)}</p>`
    : ''
  const cards = section.cards
    .map(
      (c) => `        <article class="card">
          <div class="kicker">${esc(c.kicker)}</div>
          <h3>${esc(c.title)}</h3>
          <p>${escKeepEm(c.body)}</p>
        </article>`
    )
    .join('\n')
  return `      <section>
        <h2>${esc(section.heading)}</h2>
${lead ? '        ' + lead + '\n' : ''}        <div class="grid ${cols}">
${cards}
        </div>
      </section>`
}

function comparisonSection() {
  const head = comparison.columns
    .map(
      (c, i) =>
        `            <th${i === 1 ? ' class="hl"' : ''}>${esc(c)}</th>`
    )
    .join('\n')
  const body = comparison.rows
    .map(
      (r) => `          <tr>
            <th scope="row">${esc(r.feature)}</th>
            <td class="hl">${esc(r.snowside)}</td>
            <td>${esc(r.lightning)}</td>
            <td>${esc(r.base)}</td>
          </tr>`
    )
    .join('\n')
  return `      <section>
        <h2>${esc(comparison.heading)}</h2>
        <p class="lead">${esc(comparison.lead)}</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
${head}
              </tr>
            </thead>
            <tbody>
${body}
            </tbody>
          </table>
        </div>
      </section>`
}

function risksSection() {
  const items = risks.items
    .map(
      (r) => `        <article class="risk">
          <div class="risk-head"><span class="tag tag-risk">RISK</span><span class="risk-name">${esc(r.risk)}</span></div>
          <div class="risk-body"><span class="tag tag-fix">FIX</span><p>${escKeepEm(r.mitigation)}</p></div>
        </article>`
    )
    .join('\n')
  return `      <section>
        <h2>${esc(risks.heading)}</h2>
        <div class="grid one">
${items}
        </div>
      </section>`
}

function roadmapSection() {
  const items = roadmap.phases
    .map(
      (p, i) => `        <li class="phase">
          <div class="phase-num">${i + 1}</div>
          <div class="phase-body">
            <h3>${esc(p.month)}</h3>
            <p>${escKeepEm(p.milestone)}</p>
          </div>
        </li>`
    )
    .join('\n')
  return `      <section>
        <h2>${esc(roadmap.heading)}</h2>
        <ol class="phases">
${items}
        </ol>
      </section>`
}

function opportunitiesSection() {
  const items = opportunities.cards
    .map(
      (c) => `        <article class="card">
          <div class="kicker">Revenue Stream</div>
          <h3>${esc(c.title)}</h3>
          <div class="apy">${esc(c.apy)}</div>
          <p>${escKeepEm(c.note)}</p>
        </article>`
    )
    .join('\n')
  return `      <section>
        <h2>${esc(opportunities.heading)}</h2>
        <p class="lead">${esc(opportunities.lead)}</p>
        <div class="grid one">
${items}
        </div>
        <p class="footnote">${esc(opportunities.footnote)}</p>
      </section>`
}

function faqsSection() {
  const items = faqs.items
    .map(
      (f) => `        <details class="faq">
          <summary>${esc(f.q)}</summary>
          <p>${escKeepEm(f.a)}</p>
        </details>`
    )
    .join('\n')
  return `      <section>
        <h2>${esc(faqs.heading)}</h2>
        <div class="faqs">
${items}
        </div>
      </section>`
}

function connectSection() {
  const links = connect.links
    .map(
      (l) =>
        `          <a class="btn" href="${esc(l.href)}"><span aria-hidden="true">${l.icon}</span> ${esc(l.label)}</a>`
    )
    .join('\n')
  const footer = connect.footer.map((l) => esc(l)).join('<br />\n        ')
  return `      <section class="connect">
        <h2>${esc(connect.heading)}</h2>
        <p class="lead">${esc(connect.lead)}</p>
        <div class="buttons">
${links}
        </div>
        <p class="connect-footer">
        ${footer}
        </p>
      </section>`
}

/* ------------------------------------------------------------------ *
 * Page assembly
 * ------------------------------------------------------------------ */
const toc = [
  ['what-is-snowside', whatIsSnowside.heading],
  ['two-native-assets', twoAssets.heading],
  ['how-it-works', howItWorks.heading],
  ['why-avalanche', whyAvalanche.heading],
  ['agentic-payments', agenticPayments.heading],
  ['how-it-compares', comparison.heading],
  ['risks', risks.heading],
  ['roadmap', roadmap.heading],
  ['opportunities', opportunities.heading],
  ['faq', faqs.heading],
  ['connect', connect.heading],
]
const tocHtml = toc
  .map(([id, label]) => `      <a href="#${id}">${esc(label)}</a>`)
  .join('\n')

const sections = [
  cardsSection(whatIsSnowside, 'two').replace('<section>', '<section id="what-is-snowside">'),
  cardsSection(twoAssets, 'two').replace('<section>', '<section id="two-native-assets">'),
  cardsSection(howItWorks, 'two').replace('<section>', '<section id="how-it-works">'),
  cardsSection(whyAvalanche, 'two').replace('<section>', '<section id="why-avalanche">'),
  cardsSection(agenticPayments, 'two').replace('<section>', '<section id="agentic-payments">'),
  comparisonSection().replace('<section>', '<section id="how-it-compares">'),
  risksSection().replace('<section>', '<section id="risks">'),
  roadmapSection().replace('<section>', '<section id="roadmap">'),
  opportunitiesSection().replace('<section>', '<section id="opportunities">'),
  faqsSection().replace('<section>', '<section id="faq">'),
  connectSection().replace('<section class="connect">', '<section class="connect" id="connect">'),
].join('\n\n')

const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(PAGE_TITLE)}</title>
  <meta name="description" content="${esc(PAGE_DESCRIPTION)}" />
  <link rel="canonical" href="${ORIGIN}/mobile/" />
  <link rel="icon" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" />

  <meta property="og:title" content="${esc(PAGE_TITLE)}" />
  <meta property="og:site_name" content="${esc(BRAND_TITLE)}" />
  <meta property="og:description" content="${esc(PAGE_DESCRIPTION)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${ORIGIN}/mobile/" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:secure_url" content="${OG_IMAGE}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(PAGE_TITLE)}" />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@0xShomari" />
  <meta name="twitter:creator" content="@0xShomari" />
  <meta name="twitter:title" content="${esc(PAGE_TITLE)}" />
  <meta name="twitter:description" content="${esc(PAGE_DESCRIPTION)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <meta name="twitter:image:alt" content="${esc(PAGE_TITLE)}" />

  <!-- Simple Analytics -->
  <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
  <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>

  <style>
    /* Mobile-first: no fixed canvas, no scaling. Text is real CSS px. */
    :root {
      --bg-0:#0a0f1a; --bg-1:#0f172a; --bg-2:#131c2e;
      --snow-300:#cbd5e1; --snow-400:#94a3b8;
      --aval-400:#7dd3fc; --aval-500:#38bdf8; --aval-600:#0ea5e9;
      --line:rgba(255,255,255,.10);
    }
    *,*::before,*::after{box-sizing:border-box}
    html{-webkit-text-size-adjust:100%}
    body{
      margin:0; background:linear-gradient(180deg,var(--bg-0),var(--bg-1) 55%,var(--bg-0));
      color:#e2e8f0; font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;
      font-size:17px; line-height:1.65;
    }
    .wordmark{
      position:fixed; top:0; left:0; right:0; z-index:20;
      display:flex; align-items:center; justify-content:space-between; gap:.75rem;
      padding:.6rem .9rem;
      background:rgba(10,15,26,.82); backdrop-filter:blur(10px);
      border-bottom:1px solid var(--line);
      font-family:'JetBrains Mono',ui-monospace,monospace;
    }
    .wordmark .brand{font-size:.72rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--snow-300)}
    .wordmark a{color:var(--aval-400);text-decoration:none;font-size:.72rem;letter-spacing:.08em}
    main{max-width:46rem;margin:0 auto;padding:4.5rem 1.1rem 3rem}
    header.cover{text-align:center;padding:1rem 0 1.5rem}
    .cover-kicker{
      font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:.34em;
      text-transform:uppercase;color:var(--aval-400);margin-bottom:1rem;
    }
    header.cover img{width:100%;height:auto;border-radius:.9rem;border:1px solid var(--line);display:block}
    h1{font-size:1.95rem;line-height:1.2;margin:1.25rem 0 .6rem;font-weight:800;color:#fff}
    .cover-sub{color:var(--snow-400);margin:0}
    section{margin:2.75rem 0;scroll-margin-top:4.25rem}
    h2{font-size:1.42rem;line-height:1.25;margin:0 0 .75rem;font-weight:750;color:#fff}
    h3{font-size:1rem;margin:0 0 .4rem;font-weight:700;color:#fff}
    p{margin:0 0 .8rem}
    .lead{color:var(--snow-400)}
    .grid{display:grid;gap:.85rem}
    .card{
      background:var(--bg-2);border:1px solid var(--line);border-radius:.8rem;
      padding:1rem;min-width:0;
    }
    .card p{margin:0;color:var(--snow-400);font-size:.95rem}
    .kicker{
      font-family:'JetBrains Mono',monospace;font-size:.66rem;letter-spacing:.16em;
      text-transform:uppercase;color:var(--aval-400);margin-bottom:.45rem;
    }
    .apy{
      font-family:'JetBrains Mono',monospace;font-size:.8rem;color:var(--aval-400);
      margin:.35rem 0 .55rem;
    }
    .footnote{color:var(--snow-400);font-size:.9rem;text-align:center;margin-top:1rem}
    .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line);border-radius:.8rem}
    table{border-collapse:collapse;width:100%;min-width:34rem;font-size:.88rem}
    th,td{padding:.65rem .7rem;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
    thead th{
      font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.08em;
      text-transform:uppercase;color:var(--snow-400);background:var(--bg-2);
      position:sticky;top:0;
    }
    tbody th{font-weight:600;color:var(--snow-300)}
    tbody td{color:var(--snow-400)}
    .hl{color:var(--aval-400)!important;font-weight:600}
    tbody tr:last-child th,tbody tr:last-child td{border-bottom:0}
    .risk{background:var(--bg-2);border:1px solid var(--line);border-radius:.8rem;padding:1rem}
    .risk-head{display:flex;align-items:flex-start;gap:.6rem;flex-wrap:wrap}
    .risk-name{font-weight:700;color:#fff}
    .risk-body{display:flex;gap:.6rem;margin-top:.7rem;align-items:flex-start}
    .risk-body p{margin:0;color:var(--snow-400);font-size:.94rem}
    .tag{
      font-family:'JetBrains Mono',monospace;font-size:.64rem;font-weight:700;
      padding:.12rem .42rem;border-radius:.3rem;flex:none;margin-top:.15rem;
    }
    .tag-risk{background:rgba(56,189,248,.12);color:var(--aval-400)}
    .tag-fix{background:rgba(148,163,184,.14);color:var(--snow-300)}
    .phases{list-style:none;margin:0;padding:0}
    .phase{display:flex;gap:.85rem;padding-bottom:1.25rem}
    .phase:last-child{padding-bottom:0}
    .phase-num{
      flex:none;width:2.1rem;height:2.1rem;border-radius:999px;background:var(--aval-600);
      color:#fff;font-family:'JetBrains Mono',monospace;font-size:.78rem;font-weight:700;
      display:flex;align-items:center;justify-content:center;
    }
    .phase-body p{margin:.15rem 0 0;color:var(--snow-400);font-size:.94rem}
    .faqs{display:grid;gap:.6rem}
    .faq{background:var(--bg-2);border:1px solid var(--line);border-radius:.8rem;padding:.85rem 1rem}
    .faq summary{cursor:pointer;font-weight:700;color:#fff;list-style:none;display:flex;justify-content:space-between;gap:.75rem}
    .faq summary::-webkit-details-marker{display:none}
    .faq summary::after{content:'+';color:var(--aval-400);font-family:'JetBrains Mono',monospace}
    .faq[open] summary::after{content:'\\2212'}
    .faq p{margin:.6rem 0 0;color:var(--snow-400);font-size:.94rem}
    .connect{text-align:center}
    .buttons{display:grid;gap:.6rem;margin-top:1.25rem}
    .btn{
      display:block;padding:.85rem 1rem;border-radius:.7rem;text-decoration:none;
      background:var(--bg-2);border:1px solid var(--line);color:#e2e8f0;
      font-weight:600;font-size:.95rem;
    }
    .btn:active{background:#1a2438}
    .connect-footer{color:var(--snow-400);font-size:.82rem;margin-top:1.5rem}
    nav.toc{
      background:var(--bg-2);border:1px solid var(--line);border-radius:.8rem;
      padding:.9rem 1rem;margin:1.75rem 0 0;
    }
    nav.toc h2{font-size:.7rem;font-family:'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--snow-400);margin:0 0 .6rem}
    nav.toc a{display:block;padding:.3rem 0;color:var(--aval-400);text-decoration:none;font-size:.92rem}
    .deck-cta{
      display:block;text-align:center;margin:1.25rem 0 0;padding:.85rem 1rem;
      border-radius:.7rem;background:var(--aval-600);color:#04121f;font-weight:700;
      text-decoration:none;font-size:.95rem;
    }
    @media (min-width:34rem){ .grid.two{grid-template-columns:1fr 1fr} }
    @media (min-width:44rem){
      body{font-size:17.5px}
      h1{font-size:2.3rem}
      main{max-width:52rem;padding-left:1.5rem;padding-right:1.5rem}
    }
  </style>
</head>
<body>
  <div class="wordmark">
    <span class="brand">${esc(BRAND_TITLE)}</span>
    <a href="/" id="deck-link">View the deck &rarr;</a>
  </div>

  <main>
    <header class="cover">
      <div class="cover-kicker">${esc(cover.kicker)}</div>
      <img src="${esc(cover.banner)}" alt="${esc(cover.bannerAlt)}" />
      <h1>${esc(BRAND_TAGLINE)}</h1>
      <p class="cover-sub">${esc(cover.subtitle)}</p>
      <a class="deck-cta" href="/">Open the interactive deck</a>
    </header>

    <nav class="toc">
      <h2>On this page</h2>
${tocHtml}
    </nav>

${sections}
  </main>

  <script>
    // The wordmark link and CTA say "deck". Slidev owns /, so a plain link
    // already works; this only backfills the URL when the page is opened
    // directly so the affordance is never a dead end.
    (function () {
      var a = document.getElementById('deck-link')
      if (a && !a.getAttribute('href')) a.setAttribute('href', '/')
    })()
  </script>
</body>
</html>
`

const outDir = resolve(distDir, 'mobile')
mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'index.html'), html, 'utf8')
console.log(`[build-mobile] wrote ${resolve(outDir, 'index.html')}`)
