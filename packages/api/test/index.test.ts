// packages/api/test/index.test.ts
// Snowside API Worker — first test suite.
// Covers all public + federation endpoints against an in-memory D1 mock.
//
// Run:  pnpm --filter packages-api test
// Coverage: pnpm --filter packages-api test -- --coverage --coverage.reporter=lcov
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/index'
import { makeEnv, applySchema, TEST_TOKEN } from './setup'

function req(path: string, init?: RequestInit): Request {
  const url = new URL(path, 'http://localhost')
  return new Request(url, init)
}

async function call(path: string, init?: RequestInit & { env?: any }) {
  const env = init?.env ?? makeEnv()
  await applySchema(env.DB)
  const res = await app.fetch(req(path, init), env)
  return { res, json: await res.json() }
}

// ── GET /v1/status ───────────────────────────────────────
describe('GET /v1/status', () => {
  it('returns ok status', async () => {
    const { res, json } = await call('/v1/status')
    expect(res.status).toBe(200)
    expect(json.status).toBe('ok')
    expect(json.esplora_proxy).toContain('drivechain.dev')
  })
})

// ── GET /v1/bridge/status ────────────────────────────────
describe('GET /v1/bridge/status', () => {
  it('returns ok with no federation when no check-in exists', async () => {
    const { res, json } = await call('/v1/bridge/status')
    expect(res.status).toBe(200)
    expect(json.status).toBe('ok')
    expect(json.federation_online).toBe(false)
    expect(json.last_checkin).toBeNull()
  })

  it('reports online after federation check-in', async () => {
    const env = makeEnv()
    await applySchema(env.DB)
    await app.fetch(req('/v1/fed/checkin', { method: 'POST', headers: { Authorization: `Bearer ${TEST_TOKEN}` } }), env)
    const res = await app.fetch(req('/v1/bridge/status'), env)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.federation_online).toBe(true)
    expect(typeof json.last_checkin).toBe('number')
  })
})

// ── POST /v1/bridge/deposit ──────────────────────────────
describe('POST /v1/bridge/deposit', () => {
  it('creates a deposit with valid fields', async () => {
    const { res, json } = await call('/v1/bridge/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snowsideAddress: '0xabc123', network: 'testnet' }),
    })
    expect(res.status).toBe(200)
    expect(json.status).toBe('pending')
    expect(typeof json.id).toBe('string')
  })

  it('rejects missing fields with 400', async () => {
    const { res } = await call('/v1/bridge/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network: 'testnet' }),
    })
    // chanfana returns a validation error body (format varies); status is the contract
    expect(res.status).toBe(400)
  })

  it('rejects invalid network enum', async () => {
    const { res } = await call('/v1/bridge/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snowsideAddress: '0xabc', network: 'fakenet' }),
    })
    // chanfana/OpenAPI route returns 400 for enum validation failure
    expect(res.status).toBe(400)
  })
})

// ── GET /v1/bridge/deposit/:id ───────────────────────────
describe('GET /v1/bridge/deposit/:id', () => {
  it('returns 404 for non-existent deposit', async () => {
    const { res, json } = await call('/v1/bridge/deposit/nonexistent')
    expect(res.status).toBe(404)
    expect(json.error).toBe('Not found')
  })

  it('returns a created deposit by id', async () => {
    const env = makeEnv()
    await applySchema(env.DB)
    const createRes = await app.fetch(
      req('/v1/bridge/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snowsideAddress: '0xdef456', network: 'mainnet' }),
      }),
      env,
    )
    const created = await createRes.json()
    const res = await app.fetch(req(`/v1/bridge/deposit/${created.id}`), env)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.id).toBe(created.id)
    expect(json.snowside_address).toBe('0xdef456')
    expect(json.network).toBe('mainnet')
    expect(json.status).toBe('pending')
  })
})

// ── GET /v1/bridge/deposits/:address ─────────────────────
describe('GET /v1/bridge/deposits/:address', () => {
  it('returns empty array when no deposits exist', async () => {
    const { res, json } = await call('/v1/bridge/deposits/0xempty')
    expect(res.status).toBe(200)
    expect(Array.isArray(json)).toBe(true)
    expect(json).toHaveLength(0)
  })

  it('returns deposits for an address', async () => {
    const env = makeEnv()
    await applySchema(env.DB)
    await app.fetch(
      req('/v1/bridge/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snowsideAddress: '0xaddr1', network: 'signet' }),
      }),
      env,
    )
    const res = await app.fetch(req('/v1/bridge/deposits/0xaddr1'), env)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toHaveLength(1)
    expect(json[0].snowside_address).toBe('0xaddr1')
    expect(json[0].network).toBe('signet')
  })
})

// ── POST /v1/bridge/withdraw ──────────────────────────────
describe('POST /v1/bridge/withdraw', () => {
  it('creates a withdrawal with valid fields', async () => {
    const { res, json } = await call('/v1/bridge/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snowsideAddress: '0xabc',
        ecashAddress: 'ecash:qxyz',
        amountEcx: '1000',
        network: 'testnet',
      }),
    })
    expect(res.status).toBe(200)
    expect(json.status).toBe('pending')
    expect(typeof json.id).toBe('string')
  })

  it('rejects missing fields with 400', async () => {
    const { res } = await call('/v1/bridge/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snowsideAddress: '0xabc' }),
    })
    // chanfana returns a validation error body (format varies); status is the contract
    expect(res.status).toBe(400)
  })
})

// ── GET /v1/bridge/withdrawals/:address ───────────────────
describe('GET /v1/bridge/withdrawals/:address', () => {
  it('returns empty array when no withdrawals exist', async () => {
    const { res, json } = await call('/v1/bridge/withdrawals/0xempty')
    expect(res.status).toBe(200)
    expect(Array.isArray(json)).toBe(true)
    expect(json).toHaveLength(0)
  })

  it('returns withdrawals for an address', async () => {
    const env = makeEnv()
    await applySchema(env.DB)
    await app.fetch(
      req('/v1/bridge/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snowsideAddress: '0xwaddr',
          ecashAddress: 'ecash:qabc',
          amountEcx: '500',
          network: 'mainnet',
        }),
      }),
      env,
    )
    const res = await app.fetch(req('/v1/bridge/withdrawals/0xwaddr'), env)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toHaveLength(1)
    expect(json[0].snowside_address).toBe('0xwaddr')
    expect(json[0].amount_ecx).toBe('500')
  })
})

// ── Federation auth ───────────────────────────────────────
describe('Federation auth middleware', () => {
  it('rejects requests without Bearer token with 401', async () => {
    const { res, json } = await call('/v1/fed/checkin', { method: 'POST' })
    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('rejects wrong token with 401', async () => {
    const { res } = await call('/v1/fed/checkin', {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong-token' },
    })
    expect(res.status).toBe(401)
  })

  it('accepts correct Bearer token', async () => {
    const { res, json } = await call('/v1/fed/checkin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
    })
    expect(res.status).toBe(200)
    expect(json.status).toBe('ok')
  })
})

// ── Federation deposit lifecycle ──────────────────────────
describe('Federation deposit lifecycle', () => {
  it('lists pending deposits, updates status, lists funded', async () => {
    const env = makeEnv()
    await applySchema(env.DB)
    // create a deposit
    const createRes = await app.fetch(
      req('/v1/bridge/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snowsideAddress: '0xlifecycle', network: 'testnet' }),
      }),
      env,
    )
    const { id } = await createRes.json()

    // fed: list pending
    const pendingRes = await app.fetch(
      req('/v1/fed/deposits/pending', { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }),
      env,
    )
    const pending = await pendingRes.json()
    expect(pendingRes.status).toBe(200)
    expect(pending).toHaveLength(1)
    expect(pending[0].id).toBe(id)

    // fed: patch deposit — add ecash address + confirm
    const patchRes = await app.fetch(
      req(`/v1/fed/deposit/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TEST_TOKEN}` },
        body: JSON.stringify({
          ecash_address: 'ecash:qfunded',
          derivation_index: 5,
          amount_sats: 50000,
          amount_ecx: 50000,
          status: 'confirmed',
        }),
      }),
      env,
    )
    expect(patchRes.status).toBe(200)
    const patchJson = await patchRes.json()
    expect(patchJson.status).toBe('ok')

    // fed: list funded (has amount_sats + ecash_address + derivation_index)
    const fundedRes = await app.fetch(
      req('/v1/fed/deposits/funded', { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }),
      env,
    )
    const funded = await fundedRes.json()
    expect(fundedRes.status).toBe(200)
    expect(funded).toHaveLength(1)
    expect(funded[0].ecash_address).toBe('ecash:qfunded')
    expect(funded[0].derivation_index).toBe(5)
    expect(funded[0].status).toBe('confirmed')
    expect(funded[0].confirmed_at).toBeTruthy()
  })

  it('rejects PATCH with no valid fields', async () => {
    const { res, json } = await call('/v1/fed/deposit/someid', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TEST_TOKEN}` },
      body: JSON.stringify({ invalid_field: 'x' }),
    })
    expect(res.status).toBe(400)
    expect(json.error).toBe('No valid fields')
  })
})

// ── Federation withdrawal lifecycle ───────────────────────
describe('Federation withdrawal lifecycle', () => {
  it('lists pending withdrawals, updates to completed', async () => {
    const env = makeEnv()
    await applySchema(env.DB)
    // create withdrawal
    const createRes = await app.fetch(
      req('/v1/bridge/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snowsideAddress: '0xwlife',
          ecashAddress: 'ecash:qlife',
          amountEcx: '250',
          network: 'signet',
        }),
      }),
      env,
    )
    const { id } = await createRes.json()

    // fed: list pending
    const pendingRes = await app.fetch(
      req('/v1/fed/withdrawals/pending', { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }),
      env,
    )
    const pending = await pendingRes.json()
    expect(pendingRes.status).toBe(200)
    expect(pending).toHaveLength(1)
    expect(pending[0].id).toBe(id)

    // fed: patch withdrawal — complete it
    const patchRes = await app.fetch(
      req(`/v1/fed/withdraw/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TEST_TOKEN}` },
        body: JSON.stringify({
          amount_sats: 250,
          ecash_tx_hash: 'deadbeef',
          status: 'completed',
        }),
      }),
      env,
    )
    expect(patchRes.status).toBe(200)

    // fed: list pending — should be empty now
    const pending2Res = await app.fetch(
      req('/v1/fed/withdrawals/pending', { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }),
      env,
    )
    const pending2 = await pending2Res.json()
    expect(pending2Res.status).toBe(200)
    expect(pending2).toHaveLength(0)
  })

  it('rejects withdrawal PATCH with no valid fields', async () => {
    const { res, json } = await call('/v1/fed/withdraw/someid', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TEST_TOKEN}` },
      body: JSON.stringify({ invalid_field: 'x' }),
    })
    expect(res.status).toBe(400)
    expect(json.error).toBe('No valid fields')
  })
})

// ── Esplora proxy (catch-all) ────────────────────────────
describe('Esplora proxy catch-all', () => {
  // The catch-all proxies to a real Esplora URL. This is an integration test
  // that depends on external network. In CI the upstream may be unreachable.
  // We race the fetch against a 3s timer; if it hangs, we skip (not fail).
  it('executes the proxy path (200 or 502, or skip on timeout)', async () => {
    const env = makeEnv()
    await applySchema(env.DB)
    const fetchPromise = app.fetch(req('/v1/esplora/testnet/blocks'), env)
    const timeoutPromise = new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), 3000),
    )
    const result = await Promise.race([fetchPromise, timeoutPromise])
    if (result === 'timeout') return // skip: network-restricted CI
    const res = result as Response
    expect([200, 502]).toContain(res.status)
  })
})
