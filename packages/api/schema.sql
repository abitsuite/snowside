CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  network TEXT NOT NULL,
  snowside_address TEXT NOT NULL,
  ecash_address TEXT,
  amount_xec INTEGER,
  amount_ecx INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  ecash_tx_hash TEXT,
  mint_tx_hash TEXT,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  minted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_deposits_snowside ON deposits(snowside_address);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);

CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  network TEXT NOT NULL,
  snowside_address TEXT NOT NULL,
  ecash_address TEXT NOT NULL,
  amount_ecx INTEGER,
  amount_xec INTEGER,
  burn_tx_hash TEXT,
  ecash_tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_snowside ON withdrawals(snowside_address);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
