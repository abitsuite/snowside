-- Snowside Bridge API — D1 schema
-- Matches the live D1 database (snowside-bridge) exactly

CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  network TEXT NOT NULL,
  snowside_address TEXT NOT NULL,
  ecash_address TEXT,
  amount_sats INTEGER,
  amount_ecx INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  ecash_tx_hash TEXT,
  mint_tx_hash TEXT,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  minted_at INTEGER,
  derivation_index INTEGER
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  network TEXT NOT NULL,
  snowside_address TEXT NOT NULL,
  ecash_address TEXT NOT NULL,
  amount_ecx INTEGER,
  amount_sats INTEGER,
  burn_tx_hash TEXT,
  ecash_tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
