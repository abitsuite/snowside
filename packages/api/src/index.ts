import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fromHono, extendZodWithOpenApi } from 'chanfana';
import { z } from 'zod';

extendZodWithOpenApi(z);

const ESPLORA_URL = 'https://esplora.drynet4.drivechain.dev';

const app = new Hono<{
  Bindings: { DB: D1Database; FEDERATION_TOKEN: string };
}>();

app.use('*', cors());

const openapi = fromHono(app, {
  docs_url: '/v1',
  openapi_url: '/v1/openapi.json',
});

// --- Status ---
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
              esplora_proxy: z.string(),
            }),
          },
        },
      },
    },
  },
  (c) => c.json({ status: 'ok', esplora_proxy: ESPLORA_URL })
);

app.get('/v1/bridge/status', async (c) => {
  try {
    const row = await c.env.DB.prepare('SELECT value FROM meta WHERE key = ?')
      .bind('fed_last_checkin')
      .first<{ value: string }>();
    const lastCheckin = row ? Number(row.value) : null;
    const online = lastCheckin !== null && Date.now() - lastCheckin < 60000;
    return c.json({ status: 'ok', federation_online: online, last_checkin: lastCheckin });
  } catch {
    return c.json({ status: 'ok', federation_online: false, last_checkin: null });
  }
});

// --- Deposit endpoints ---
app.post('/v1/bridge/deposit', async (c) => {
  const { snowsideAddress, network } = await c.req.json<{
    snowsideAddress: string;
    network: string;
  }>();
  if (!snowsideAddress || !network) return c.json({ error: 'Missing fields' }, 400);
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO deposits (id, network, snowside_address, status, created_at) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(id, network, snowsideAddress, 'pending', Date.now())
    .run();
  return c.json({ id, status: 'pending' });
});

app.get('/v1/bridge/deposit/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM deposits WHERE id = ?')
    .bind(c.req.param('id'))
    .first();
  return row ? c.json(row) : c.json({ error: 'Not found' }, 404);
});

app.get('/v1/bridge/deposits/:address', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM deposits WHERE snowside_address = ? ORDER BY created_at DESC'
  )
    .bind(c.req.param('address'))
    .all();
  return c.json(results);
});

// --- Withdraw endpoints ---
app.post('/v1/bridge/withdraw', async (c) => {
  const body = await c.req.json<{
    snowsideAddress: string;
    ecashAddress: string;
    amountEcx: string;
    network: string;
    burnTxHash?: string;
  }>();
  if (!body.snowsideAddress || !body.ecashAddress || !body.amountEcx || !body.network)
    return c.json({ error: 'Missing fields' }, 400);
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO withdrawals (id, network, snowside_address, ecash_address, amount_ecx, burn_tx_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(id, body.network, body.snowsideAddress, body.ecashAddress, body.amountEcx, body.burnTxHash || null, 'pending', Date.now())
    .run();
  return c.json({ id, status: 'pending' });
});

app.get('/v1/bridge/withdrawals/:address', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM withdrawals WHERE snowside_address = ? ORDER BY created_at DESC'
  )
    .bind(c.req.param('address'))
    .all();
  return c.json(results);
});

// --- Federation endpoints (auth required) ---
app.use('/v1/fed/*', async (c, next) => {
  const token = c.env.FEDERATION_TOKEN || 'dev-secret';
  if (c.req.header('Authorization') !== `Bearer ${token}`)
    return c.json({ error: 'Unauthorized' }, 401);
  await next();
});

app.post('/v1/fed/checkin', async (c) => {
  await c.env.DB.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)')
    .bind('fed_last_checkin', Date.now().toString())
    .run();
  return c.json({ status: 'ok' });
});

app.get('/v1/fed/deposits/pending', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM deposits WHERE status = 'pending' ORDER BY created_at ASC"
  ).all();
  return c.json(results);
});

app.patch('/v1/fed/deposit/:id', async (c) => {
  const body = await c.req.json<Record<string, any>>();
  const allowed = ['ecash_address', 'amount_xec', 'amount_ecx', 'ecash_tx_hash', 'mint_tx_hash', 'status'];
  const updates: string[] = [];
  const values: any[] = [];
  for (const [key, val] of Object.entries(body)) {
    if (allowed.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(val);
    }
  }
  if (body.status === 'confirmed') {
    updates.push('confirmed_at = ?');
    values.push(Date.now());
  }
  if (body.status === 'minted') {
    updates.push('minted_at = ?');
    values.push(Date.now());
  }
  if (updates.length === 0) return c.json({ error: 'No valid fields' }, 400);
  values.push(c.req.param('id'));
  await c.env.DB.prepare(`UPDATE deposits SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
  return c.json({ status: 'ok' });
});

app.get('/v1/fed/withdrawals/pending', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM withdrawals WHERE status = 'pending' ORDER BY created_at ASC"
  ).all();
  return c.json(results);
});

app.patch('/v1/fed/withdraw/:id', async (c) => {
  const body = await c.req.json<Record<string, any>>();
  const allowed = ['amount_xec', 'ecash_tx_hash', 'status'];
  const updates: string[] = [];
  const values: any[] = [];
  for (const [key, val] of Object.entries(body)) {
    if (allowed.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(val);
    }
  }
  if (body.status === 'completed') {
    updates.push('completed_at = ?');
    values.push(Date.now());
  }
  if (updates.length === 0) return c.json({ error: 'No valid fields' }, 400);
  values.push(c.req.param('id'));
  await c.env.DB.prepare(`UPDATE withdrawals SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
  return c.json({ status: 'ok' });
});

// --- Esplora proxy (catch-all, must be last) ---
app.all('/v1/*', async (c) => {
  const url = new URL(c.req.url);
  const path = url.pathname.replace('/v1', '');
  const target = new URL(ESPLORA_URL + path + url.search);
  try {
    const resp = await fetch(target, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body,
      redirect: 'manual',
    });
    const headers = new Headers(resp.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return new Response(resp.body, { status: resp.status, headers });
  } catch {
    return c.json({ error: 'Esplora fetch failed' }, 502);
  }
});

export default app;
