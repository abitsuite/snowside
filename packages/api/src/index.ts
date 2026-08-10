// packages/api/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fromHono, extendZodWithOpenApi } from 'chanfana';
import { z } from 'zod';

extendZodWithOpenApi(z);

export interface Env {}

// To migrate to our own Esplora, update this URL to the VPS endpoint.
const ESPLORA_URL = 'https://esplora.drynet4.drivechain.dev';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors());

// Setup OpenAPI router using Chanfana
// The docs will be served from the root /v1 path directly.
const openapi = fromHono(app, {
  docs_url: '/v1',
  openapi_url: '/v1/openapi.json',
});

// OpenAPI documented endpoint
openapi.get(
  '/v1/status',
  {
    responses: {
      200: {
        description: 'API Status',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string(),
              network: z.string(),
              esplora_proxy: z.string(),
            }),
          },
        },
      },
    },
  },
  (c) => {
    return c.json({
      status: 'ok',
      network: 'drynet4',
      esplora_proxy: ESPLORA_URL,
    });
  }
);

// Raw proxy route for Esplora fallback (direct passthrough)
app.all('/v1/*', async (c) => {
  const url = new URL(c.req.url);
  
  // Remove the /v1 prefix before forwarding to the target Esplora API
  const path = url.pathname.replace('/v1', '');
  const targetUrl = new URL(ESPLORA_URL + path + url.search);

  const modifiedRequest = new Request(targetUrl, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body,
    redirect: 'manual',
  });

  try {
    const response = await fetch(modifiedRequest);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from Esplora' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

export default app;
