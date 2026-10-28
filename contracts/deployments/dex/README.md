# contracts/deployments/dex/ — Uniswap V2 DEX Deployment (Session 29 PM, 2026-10-28)

Deployed for the eCash Farm liquidity-pool launch (`ecashfarm.com/liquidity`).
Live on **both** public L1s. Full address record: `addresses.json`.
Consumer handoff doc: `docs/HANDOFF-SNOWSIDE-RESPONSE.md` in the eCash Farm repo.

## Contents
- `src/WECX.sol` — WETH9 (Dapphub, GPL) with name/symbol changed to Wrapped ECX / WECX. solc 0.5.17, optimizer OFF.
- `src/MockERC20.sol` — minimal ERC-20, owner-gated mint (solc 0.8.24, optimizer 200 runs). Backs MockUSDC / MockBTCb.
- `artifacts/` — build outputs. Factory/Router02 are the **canonical npm builds** (`@uniswap/v2-core@1.0.1`, `@uniswap/v2-periphery@1.1.0-beta.0`); WECX/MockERC20 are local forge builds.
- `deploy-dex.sh` — the exact script used (runs on the `snowside` box; needs `cast` in `~/.foundry/bin`).

## Redeploy procedure (new chain)
1. Copy this directory to the deploy host.
2. `deploy-dex.sh <this-dir> <rpc-url> <pk-file> <LABEL>` — deploys all five contracts in order
   (WECX → Factory → Router02 → MockUSDC → MockBTCb), prints addresses + blocks, verifies wiring.

## Facts
- Deployer (both nets): `0xA5B6ac71129e9E5904a5C021728dBaBA61454B54` (on-box key
  `~/.avalanche-cli/key/cli-teleporter-deployer.pk`).
- Factory `feeToSetter` = authority `0xE5104794FB44D45b0f821d77a685A17ee2E35b9C`; `feeTo` unset (protocol fee OFF).
- Pair `init_code_hash` = canonical `0x96e8ac...845f` (verified) — standard V2 pair-math applies.
- Mock supplies (per network): 10,000,000 USDC + 100,000 BTC.b held by the deployer pending
  eCash Farm's federation treasury address.
- **Mocks are placeholders** — replace with real ICTT USDC / BTC.b when the ICM token bridge ships.
