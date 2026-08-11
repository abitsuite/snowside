import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fromHono, extendZodWithOpenApi, OpenAPIRoute, type OpenAPIRouteSchema } from 'chanfana';
import { z } from 'zod';

extendZodWithOpenApi(z);

const ESPLORA_URLS: Record<string, string> = {
  mainnet: 'https://esplora.mainnet.drivechain.dev',
  testnet: 'https://esplora.drynet4.drivechain.dev',
  signet: 'https://esplora.signet.drivechain.info',
};

type Bindings = { DB: D1Database; FEDERATION_TOKEN: string };

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', cors());

const openapi = fromHono(app, {
  docs_url: '/v1',
  openapi_url: '/v1/openapi.json',
});

/**
 * Helper: create an OpenAPIRoute subclass inline.
 * chanfana 2.x requires OpenAPIRoute classes for schema registration.
 */
function route(
  schema: OpenAPIRouteSchema,
  handler: (c: any, data: any) => Promise<any>,
) {
  return class extends OpenAPIRoute {
    schema = schema;
    async handle(c: any): Promise<any> {
      const data = await this.getValidatedData();
      return handler(c, data);
    }
  };
}

// ── Shared Zod schemas ──────────────────────────────────────────

const DepositSchema = z.object({
  id: z.string(),
  network: z.string(),
  snowside_address: z.string(),
  ecash_address: z.string().nullable(),
  derivation_index: z.number().nullable(),
  status: z.string(),
  amount_xec: z.number().nullable(),
  amount_ecx: z.number().nullable(),
  ecash_tx_hash: z.string().nullable(),
  mint_tx_hash: z.string().nullable(),
  created_at: z.number(),
  confirmed_at: z.number().nullable(),
  minted_at: z.number().nullable(),
});

const WithdrawalSchema = z.object({
  id: z.string(),
  network: z.string(),
  snowside_address: z.string(),
  ecash_address: z.string(),
  amount_ecx: z.string().nullable(),
  amount_xec: z.number().nullable(),
  burn_tx_hash: z.string().nullable(),
  ecash_tx_hash: z.string().nullable(),
  status: z.string(),
  created_at: z.number(),
  completed_at: z.number().nullable(),
});

const ErrorSchema = z.object({ error: z.string() });

// ── GET /v1/status ──────────────────────────────────────────────

openapi.get(
  '/v1/status',
  route(
    {
      summary: 'API status',
      tags: ['System'],
      responses: {
        200: {
          description: 'API is healthy',
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
    async () => ({
      status: 'ok',
      esplora_proxy: ESPLORA_URLS.testnet,
    }),
  ),
);

// ── GET /v1/bridge/status ───────────────────────────────────────

openapi.get(
  '/v1/bridge/status',
  route(
    {
      summary: 'Bridge federation status',
      tags: ['Bridge'],
      responses: {
        200: {
          description: 'Bridge status including federation heartbeat',
          content: {
            'application/json': {
              schema: z.object({
                status: z.string(),
                federation_online: z.boolean(),
                last_checkin: z.number().nullable(),
              }),
            },
          },
        },
      },
    },
    async (c) => {
      try {
        const row = await c.env.DB.prepare(
          'SELECT value FROM meta WHERE key = ?',
        )
          .bind('fed_last_checkin')
          .first();
        const lastCheckin = row ? Number(row.value) : null;
        const online =
          lastCheckin !== null && Date.now() - lastCheckin < 60000;
        return {
          status: 'ok',
          federation_online: online,
          last_checkin: lastCheckin,
        };
      } catch {
        return {
          status: 'ok',
          federation_online: false,
          last_checkin: null,
        };
      }
    },
  ),
);

// ── POST /v1/bridge/deposit ─────────────────────────────────────

openapi.post(
  '/v1/bridge/deposit',
  route(
    {
      summary: 'Create a deposit request',
      tags: ['Bridge'],
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                snowsideAddress: z.string(),
                network: z.enum(['mainnet', 'testnet', 'signet']),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Deposit created',
          content: {
            'application/json': {
              schema: z.object({
                id: z.string(),
                status: z.string(),
              }),
            },
          },
        },
        400: {
          description: 'Missing fields',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c, data) => {
      const { snowsideAddress, network } = data.body;
      if (!snowsideAddress || !network)
        return c.json({ error: 'Missing fields' }, 400);
      const id = crypto.randomUUID();
      await c.env.DB.prepare(
        'INSERT INTO deposits (id, network, snowside_address, status, created_at) VALUES (?, ?, ?, ?, ?)',
      )
        .bind(id, network, snowsideAddress, 'pending', Date.now())
        .run();
      return { id, status: 'pending' };
    },
  ),
);

// ── GET /v1/bridge/deposit/{id} ─────────────────────────────────

openapi.get(
  '/v1/bridge/deposit/:id',
  route(
    {
      summary: 'Get deposit by ID',
      tags: ['Bridge'],
      request: {
        params: z.object({ id: z.string() }),
      },
      responses: {
        200: {
          description: 'Deposit details',
          content: { 'application/json': { schema: DepositSchema } },
        },
        404: {
          description: 'Not found',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c, data) => {
      const row = await c.env.DB.prepare('SELECT * FROM deposits WHERE id = ?')
        .bind(data.params.id)
        .first();
      return row ? row : c.json({ error: 'Not found' }, 404);
    },
  ),
);

// ── GET /v1/bridge/deposits/{address} ───────────────────────────

openapi.get(
  '/v1/bridge/deposits/:address',
  route(
    {
      summary: 'List deposits by Snowside address',
      tags: ['Bridge'],
      request: {
        params: z.object({ address: z.string() }),
      },
      responses: {
        200: {
          description: 'Array of deposits',
          content: {
            'application/json': {
              schema: z.array(DepositSchema),
            },
          },
        },
      },
    },
    async (c, data) => {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM deposits WHERE snowside_address = ? ORDER BY created_at DESC',
      )
        .bind(data.params.address)
        .all();
      return results;
    },
  ),
);

// ── POST /v1/bridge/withdraw ────────────────────────────────────

openapi.post(
  '/v1/bridge/withdraw',
  route(
    {
      summary: 'Create a withdrawal request',
      tags: ['Bridge'],
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                snowsideAddress: z.string(),
                ecashAddress: z.string(),
                amountEcx: z.string(),
                network: z.enum(['mainnet', 'testnet', 'signet']),
                burnTxHash: z.string().optional(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Withdrawal created',
          content: {
            'application/json': {
              schema: z.object({
                id: z.string(),
                status: z.string(),
              }),
            },
          },
        },
        400: {
          description: 'Missing fields',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c, data) => {
      const { snowsideAddress, ecashAddress, amountEcx, network, burnTxHash } =
        data.body;
      if (!snowsideAddress || !ecashAddress || !amountEcx || !network)
        return c.json({ error: 'Missing fields' }, 400);
      const id = crypto.randomUUID();
      await c.env.DB.prepare(
        'INSERT INTO withdrawals (id, network, snowside_address, ecash_address, amount_ecx, burn_tx_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
        .bind(
          id,
          network,
          snowsideAddress,
          ecashAddress,
          amountEcx,
          burnTxHash || null,
          'pending',
          Date.now(),
        )
        .run();
      return { id, status: 'pending' };
    },
  ),
);

// ── GET /v1/bridge/withdrawals/{address} ────────────────────────

openapi.get(
  '/v1/bridge/withdrawals/:address',
  route(
    {
      summary: 'List withdrawals by Snowside address',
      tags: ['Bridge'],
      request: {
        params: z.object({ address: z.string() }),
      },
      responses: {
        200: {
          description: 'Array of withdrawals',
          content: {
            'application/json': {
              schema: z.array(WithdrawalSchema),
            },
          },
        },
      },
    },
    async (c, data) => {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM withdrawals WHERE snowside_address = ? ORDER BY created_at DESC',
      )
        .bind(data.params.address)
        .all();
      return results;
    },
  ),
);

// ── Federation auth middleware ───────────────────────────────────

app.use('/v1/fed/*', async (c, next) => {
  const token = c.env.FEDERATION_TOKEN || 'dev-secret';
  if (c.req.header('Authorization') !== `Bearer ${token}`)
    return c.json({ error: 'Unauthorized' }, 401);
  await next();
});

// ── POST /v1/fed/checkin ────────────────────────────────────────

openapi.post(
  '/v1/fed/checkin',
  route(
    {
      summary: 'Federation heartbeat check-in',
      tags: ['Federation'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Check-in acknowledged',
          content: {
            'application/json': {
              schema: z.object({ status: z.string() }),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c) => {
      await c.env.DB.prepare(
        'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      )
        .bind('fed_last_checkin', Date.now().toString())
        .run();
      return { status: 'ok' };
    },
  ),
);

// ── GET /v1/fed/deposits/pending ────────────────────────────────

openapi.get(
  '/v1/fed/deposits/pending',
  route(
    {
      summary: 'List pending and confirmed deposits for federation processing',
      tags: ['Federation'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Array of pending deposits',
          content: {
            'application/json': {
              schema: z.array(DepositSchema),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c) => {
      const { results } = await c.env.DB.prepare(
        "SELECT * FROM deposits WHERE status IN ('pending', 'confirmed') ORDER BY created_at ASC",
      ).all();
      return results;
    },
  ),
);

// ── PATCH /v1/fed/deposit/{id} ──────────────────────────────────

openapi.patch(
  '/v1/fed/deposit/:id',
  route(
    {
      summary: 'Update deposit status (federation only)',
      tags: ['Federation'],
      security: [{ BearerAuth: [] }],
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            'application/json': {
              schema: z.object({
                ecash_address: z.string().optional(),
                derivation_index: z.number().optional(),
                amount_xec: z.number().optional(),
                amount_ecx: z.number().optional(),
                ecash_tx_hash: z.string().optional(),
                mint_tx_hash: z.string().optional(),
                status: z.string().optional(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Deposit updated',
          content: {
            'application/json': {
              schema: z.object({ status: z.string() }),
            },
          },
        },
        400: {
          description: 'No valid fields',
          content: { 'application/json': { schema: ErrorSchema } },
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c, data) => {
      const body = data.body;
      const allowed = [
        'ecash_address',
        'derivation_index',
        'amount_xec',
        'amount_ecx',
        'ecash_tx_hash',
        'mint_tx_hash',
        'status',
      ];
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
      if (updates.length === 0)
        return c.json({ error: 'No valid fields' }, 400);
      values.push(data.params.id);
      await c.env.DB.prepare(
        `UPDATE deposits SET ${updates.join(', ')} WHERE id = ?`,
      )
        .bind(...values)
        .run();
      return { status: 'ok' };
    },
  ),
);

// ── GET /v1/fed/deposits/funded ─────────────────────────────────

openapi.get(
  '/v1/fed/deposits/funded',
  route(
    {
      summary: 'List funded deposits (confirmed/minted with UTXOs) for withdrawal processing',
      tags: ['Federation'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Array of funded deposits',
          content: {
            'application/json': {
              schema: z.array(DepositSchema),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c) => {
      const { results } = await c.env.DB.prepare(
        "SELECT * FROM deposits WHERE amount_xec IS NOT NULL AND ecash_address IS NOT NULL AND derivation_index IS NOT NULL ORDER BY created_at ASC",
      ).all();
      return results;
    },
  ),
);

// ── GET /v1/fed/withdrawals/pending ─────────────────────────────

openapi.get(
  '/v1/fed/withdrawals/pending',
  route(
    {
      summary: 'List pending withdrawals for federation processing',
      tags: ['Federation'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Array of pending withdrawals',
          content: {
            'application/json': {
              schema: z.array(WithdrawalSchema),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c) => {
      const { results } = await c.env.DB.prepare(
        "SELECT * FROM withdrawals WHERE status = 'pending' ORDER BY created_at ASC",
      ).all();
      return results;
    },
  ),
);

// ── PATCH /v1/fed/withdraw/{id} ─────────────────────────────────

openapi.patch(
  '/v1/fed/withdraw/:id',
  route(
    {
      summary: 'Update withdrawal status (federation only)',
      tags: ['Federation'],
      security: [{ BearerAuth: [] }],
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            'application/json': {
              schema: z.object({
                amount_xec: z.number().optional(),
                ecash_tx_hash: z.string().optional(),
                status: z.string().optional(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Withdrawal updated',
          content: {
            'application/json': {
              schema: z.object({ status: z.string() }),
            },
          },
        },
        400: {
          description: 'No valid fields',
          content: { 'application/json': { schema: ErrorSchema } },
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    },
    async (c, data) => {
      const body = data.body;
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
      if (updates.length === 0)
        return c.json({ error: 'No valid fields' }, 400);
      values.push(data.params.id);
      await c.env.DB.prepare(
        `UPDATE withdrawals SET ${updates.join(', ')} WHERE id = ?`,
      )
        .bind(...values)
        .run();
      return { status: 'ok' };
    },
  ),
);

// ── Esplora proxy (catch-all, must be last) ─────────────────────
// Supports per-network routing via /v1/esplora/{network}/*
// Falls back to testnet Esplora for backward compatibility.

app.all('/v1/*', async (c) => {
  const url = new URL(c.req.url);
  let path = url.pathname.replace('/v1', '');

  // Network-aware Esplora proxy: /v1/esplora/{network}/...
  let esploraBase = ESPLORA_URLS.testnet;
  const esploraMatch = path.match(/^\/esplora\/(\w+)(\/.*)?$/);
  if (esploraMatch) {
    const network = esploraMatch[1];
    esploraBase = ESPLORA_URLS[network] || ESPLORA_URLS.testnet;
    path = esploraMatch[2] || '/';
  }

  const target = new URL(esploraBase + path + url.search);
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
    return new Response(resp.body, {
      status: resp.status,
      headers,
    });
  } catch {
    return c.json({ error: 'Esplora fetch failed' }, 502);
  }
});

export default app;
