// packages/tour/functions/_middleware.js
// SPA fallback middleware for Cloudflare Pages.
//
// Slidev is a single-page application: client-side routing changes the URL
// to /1, /2, etc. for each slide. When a user refreshes or directly loads a
// deep link, the server must return index.html (200) so the Vue router can
// render the correct slide.
//
// Cloudflare Pages `_redirects` file (`/* /index.html 200`) is the standard
// way to do this, but it is NOT reliably processed for direct-upload (ad_hoc)
// deployments via `wrangler pages deploy` — the file gets served as a static
// asset (404 HTML) instead of being read as a redirect rules config. This
// Pages Functions middleware is the reliable alternative: it intercepts
// every request and, for non-asset paths that don't resolve to a static file,
// returns index.html.
//
// NOTE on /mobile: the responsive tour page is emitted by
// scripts/build-mobile.mjs as a REAL static file at dist/mobile/index.html.
// It must therefore be served directly and never rewritten to the Slidev
// index.html. That works with the rule below because the static asset lookup
// below (context.next()) finds the file and returns 200, so the 404 branch is
// not taken. This is load-bearing: do not add /mobile to any rewrite list.
export async function onRequest(context) {
  const url = new URL(context.request.url)
  const path = url.pathname

  // Skip requests for static assets (files with extensions). These are
  // served directly by the Pages asset pipeline.
  if (path.includes('.')) {
    return context.next()
  }

  // For all other paths (SPA routes like /1, /2, /about), try the next
  // handler (static asset lookup). If that 404s, fall back to index.html
  // so the client-side router can handle the route.
  const response = await context.next()
  if (response.status === 404) {
    // Rewrite to index.html and re-fetch from the asset binding
    url.pathname = '/index.html'
    return context.env.ASSETS.fetch(url)
  }
  return response
}
