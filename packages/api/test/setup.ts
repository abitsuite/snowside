// packages/api/test/setup.ts
// Shared test setup: in-memory D1 + env bindings
import { createInMemoryD1 } from './d1-mock'

export const TEST_TOKEN = 'test-fed-token'

export function makeEnv(db?: D1Database): { DB: D1Database; FEDERATION_TOKEN: string } {
  return {
    DB: db ?? createInMemoryD1(),
    FEDERATION_TOKEN: TEST_TOKEN,
  }
}

export async function applySchema(db: D1Database): Promise<void> {
  const schema = `
CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY, network TEXT NOT NULL, snowside_address TEXT NOT NULL,
  ecash_address TEXT, amount_sats INTEGER, amount_ecx INTEGER,
  status TEXT NOT NULL DEFAULT 'pending', ecash_tx_hash TEXT, mint_tx_hash TEXT,
  created_at INTEGER NOT NULL, confirmed_at INTEGER, minted_at INTEGER,
  derivation_index INTEGER
);
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY, network TEXT NOT NULL, snowside_address TEXT NOT NULL,
  ecash_address TEXT NOT NULL, amount_ecx INTEGER, amount_sats INTEGER,
  burn_tx_hash TEXT, ecash_tx_hash TEXT, status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL, completed_at INTEGER
);
CREATE TABLE IF NOT EXISTS meta ( key TEXT PRIMARY KEY, value TEXT NOT NULL );
`
  for (const stmt of schema.split(';').map(s => s.trim()).filter(Boolean)) {
    await db.prepare(stmt).run()
  }
}
