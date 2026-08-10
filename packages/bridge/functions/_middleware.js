// packages/bridge/functions/_middleware.js
export async function onRequest(context) {
  const { request, next, params } = context;
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';

  // Check if we are on a subdomain (e.g., bridge-testnet.snowside.network)
  const isTestnet = hostname.startsWith('bridge-testnet.');
  const isSignet = hostname.startsWith('bridge-signet.');
  
  if (isTestnet || isSignet) {
    const networkPrefix = isTestnet ? 'testnet' : 'signet';
    
    // We need to rewrite the URL to serve the static files generated under /[network]/index.html
    // But we only do this if the path isn't already prefixed (to avoid loops)
    const path = url.pathname;
    
    if (!path.startsWith(`/${networkPrefix}`)) {
      // Construct new URL with prefix
      const newUrl = new URL(request.url);
      newUrl.pathname = `/${networkPrefix}${path}`;
      
      // Create a new request with the modified URL
      const newRequest = new Request(newUrl, request);
      
      // Call next with the modified request
      return await next(newRequest);
    }
  }

  // Default: proceed with original request
  return await next();
}
