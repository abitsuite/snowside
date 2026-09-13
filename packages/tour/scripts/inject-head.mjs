// packages/tour/scripts/inject-head.mjs
// Post-build HTML head injection for Slidev static export.
// Slidev generates index.html + 404.html at build time. Its `head:` frontmatter
// renders client-side (Vue runtime), so scripts/meta that must be in the
// initial HTML (analytics, fonts, OG tags) are injected here instead.
//
// Usage: node scripts/inject-head.mjs (run after `slidev build`)
// Invoked automatically via the `build` npm script.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '..', 'dist')

const ORIGIN = 'https://tour.snowside.network'
const OG_IMAGE = `${ORIGIN}/snowside-tour-poster.png`
const TITLE = 'Snowside — Tour'
const DESCRIPTION = 'Snowside — The eCash Sidechain on Avalanche. Native BTC gas, USDC bridging, NodΞRunr automation. Interactive tour.'

// Head block to inject (placed before the closing </head>)
const headInject = `
  <!-- Simple Analytics -->
  <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"><\/script>
  <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /><\/noscript>

  <!-- Open Graph -->
  <meta property="og:site_name" content="Snowside" />
  <meta property="og:title" content="${TITLE}" />
  <meta property="og:description" content="${DESCRIPTION}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${ORIGIN}/" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:secure_url" content="${OG_IMAGE}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Snowside tour — the eCash sidechain on Avalanche" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@0xShomari" />
  <meta name="twitter:creator" content="@0xShomari" />
  <meta name="twitter:title" content="${TITLE}" />
  <meta name="twitter:description" content="${DESCRIPTION}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <meta name="twitter:image:alt" content="Snowside tour — the eCash sidechain on Avalanche" />
`

// SPA fallback for Cloudflare Pages (Slidev already writes _redirects, but
// 404.html also needs the SPA fallback so deep links resolve).
const redirects = `/*    /index.html   200\n`

function injectInto(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`[inject-head] not found: ${filePath}`)
    return
  }
  let html = readFileSync(filePath, 'utf8')
  // Idempotent: skip if already injected (avoid duplicate on re-runs)
  if (html.includes('<!-- Simple Analytics -->')) {
    console.log(`[inject-head] already injected, skipping: ${filePath}`)
    return
  }
  // Replace the Slidev default favicon (CDN) with local — done via `favicon:`
  // frontmatter, but guard here in case a build regresses it.
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${TITLE}<\/title>`
  )
  // Insert analytics + OG block right before </head>
  html = html.replace('</head>', `${headInject}\n</head>`)
  writeFileSync(filePath, html, 'utf8')
  console.log(`[inject-head] injected into ${filePath}`)
}

// 1. Inject into every HTML file Slidev produced (index.html + 404.html)
injectInto(resolve(distDir, 'index.html'))
injectInto(resolve(distDir, '404.html'))

// 2. Ensure SPA _redirects exists (Slidev writes it, but guarantee presence)
const redirectsPath = resolve(distDir, '_redirects')
writeFileSync(redirectsPath, redirects, 'utf8')
console.log(`[inject-head] wrote ${redirectsPath}`)

console.log('[inject-head] done')
