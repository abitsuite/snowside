// packages/explorer/functions/_middleware.js
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = context.request.headers.get('host') || '';
  const path = url.pathname;

  // Route explorer-testnet.snowside.network -> /testnet/...
  if (host.startsWith('explorer-testnet')) {
    // Exclude assets (files with extensions) and paths that already have the prefix
    if (!path.startsWith('/testnet') && !path.includes('.')) {
      url.pathname = '/testnet' + path;
      return context.env.ASSETS.fetch(url);
    }
  }

  // Route explorer-signet.snowside.network -> /signet/...
  if (host.startsWith('explorer-signet')) {
    if (!path.startsWith('/signet') && !path.includes('.')) {
      url.pathname = '/signet' + path;
      return context.env.ASSETS.fetch(url);
    }
  }

  // Default routing for mainnet and direct path access
  return context.next();
}
