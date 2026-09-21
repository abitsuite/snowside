// packages/tour/functions/_middleware.js
// SPA fallback middleware for Cloudflare Pages.
//
// The tour is a single-page application: the client runtime rewrites the URL
// hash (#1, #2, ...) as you move between slides, and legacy slide paths
// (/1, /2, ...) may still be in the wild. When a user refreshes or directly
// loads a deep link, the server must return index.html (200) so the runtime
// can render the requested slide.
//
// Cloudflare Pages `_redirects` (`/* /index.html 200`) is the standard way to
// do this, but it is NOT reliably processed for direct-upload (ad_hoc)
// deployments via `wrangler pages deploy` — the file gets served as a static
// asset instead of being read as a redirect rules config. This Pages
// Functions middleware is the reliable alternative: it intercepts every
// request and, for non-asset paths that don't resolve to a static file,
// returns index.html.
//
// NOTE: there is no separate mobile page. dist/index.html serves every
// viewport — the layout (fixed canvas vs. reflowing slideshow) is selected
// from the viewport scale by an inline boot script before first paint. An
// old /mobile link therefore just falls through to the SPA fallback below
// and loads the tour normally, which is the desired behaviour.
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
  // so the client-side runtime can handle the route.
  const response = await context.next()
  if (response.status === 404) {
    // Rewrite to index.html and re-fetch from the asset binding
    url.pathname = '/index.html'
    return context.env.ASSETS.fetch(url)
  }
  return response
}