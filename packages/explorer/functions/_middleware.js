// packages/explorer/functions/_middleware.js
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = context.request.headers.get('host') || '';

  // Route explorer-testnet.snowside.network -> /testnet/index.html
  if (host.startsWith('explorer-testnet')) {
    if (url.pathname === '/' || url.pathname === '/index.html') {
      url.pathname = '/testnet/';
      return context.env.ASSETS.fetch(url);
    }
  }

  // Route explorer-signet.snowside.network -> /signet/index.html
  if (host.startsWith('explorer-signet')) {
    if (url.pathname === '/' || url.pathname === '/index.html') {
      url.pathname = '/signet/';
      return context.env.ASSETS.fetch(url);
    }
  }

  // Default routing for mainnet and direct path access
  return context.next();
}
