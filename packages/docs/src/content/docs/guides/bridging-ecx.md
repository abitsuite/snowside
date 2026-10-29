---
title: Bridging ECX (eCash Peg)
description: Deposit eCash ECX to Snowside and withdraw back — custodial MVP (Phase 1 of the BIP-300/301 rollout).
---

Snowside's bridge moves ECX between the eCash L1 and Snowside L2 at a strict **1:1 peg**.

- 1 satoshi (L1, 8 decimals) = 10<sup>10</sup> wei (Snowside, 18 decimals)
- 1 ECX on eCash = 1 ECX on Snowside

:::caution[Custodial MVP — Phase 1]
The live bridge is **custodial**: a federation service holds the L1 keys, watches for deposits, and mints/burns on Snowside via the NativeMinter precompile. This is Phase 1 of a phased rollout to the full **BIP-300/301 trustless peg** (miner-voted withdrawals, sidechain slot 88). Phases 2–4 replace custody with the enforcer + hashrate escrow. Trust assumption today: the federation operator.
:::

## Networks

| Bridge leg | L1 network | Address format | Confirmations required |
|---|---|---|---|
| `mainnet` | eCash Mainnet (post-fork chain) | `bc1q…` (P2WPKH) | **3** (~30 min) |
| `testnet` | eCash Betanet | `bc1q…` (P2WPKH) | **1** (~10 min) |
| `signet` | Bitcoin Signet | `tb1q…` | **1** |

- Every deposit receives a **unique, single-purpose address** (HD-derived per request). Do not reuse an address across deposit requests.
- **Mainnet deposits are gated by the fork height (973,728).** Before the eCash fork, the mainnet esplora serves the shared BTC chain; the federation will observe but never mint against pre-fork UTXOs. BTC sent to a mainnet deposit address pre-fork becomes ECX at the fork and is then processed normally.
- Snowside ECX is only ever minted **after** the L1 transaction reaches the confirmation count above, and only for the exact observed amount — 1:1 backing by construction.

## Deposits (eCash → Snowside)

<Steps>

1. Open the bridge UI at [bridge.snowside.network](https://bridge.snowside.network), pick your network, and enter the **Snowside address** that should receive the minted ECX (your EVM address on the matching Snowside L1).

2. The UI creates a deposit request and shows a **QR code + address** (`bc1q…`/`tb1q…`).

3. Send ECX (or signet sBTC) to that address from any eCash wallet.

4. The federation polls the L1 esplora every 10 seconds. When the transaction reaches the required confirmations, the deposit is marked `confirmed`, then the exact amount is minted to your Snowside address via `NativeMinter.mintNativeCoin` and the deposit is marked `minted` with the L2 mint transaction hash.

</Steps>

Track a deposit programmatically:

```bash
curl -s https://snowside.network/v1/bridge/deposit/<deposit-id>
# status flow: pending -> confirmed -> minted
```

## Withdrawals (Snowside → eCash)

<Steps>

1. In the bridge UI, switch to the **Withdraw** tab and enter your destination L1 address (`bc1q…` for eCash mainnet/betanet).

2. Burn the ECX on Snowside (the UI sends the burn transaction from your connected wallet) and submit the burn transaction hash.

3. The federation verifies the burn on the L2, builds an L1 transaction spending from funded deposit UTXOs, signs it (P2WPKH, `SIGHASH_ALL`), and broadcasts it.

4. The withdrawal is marked `completed` with the L1 transaction hash. Minimum withdrawal: **1,000 satoshis** (dust limit 546 sats + 1,000-sat flat network fee).

</Steps>

Withdrawal requests **expire after 15 minutes** if no valid burn is detected (auto-failed) — submit the burn promptly after creating the request.

### Replay protection

All withdrawal transactions set a network-specific `nLockTime` (marker just below 500,000,000) with non-final sequences, per the eCash replay-protection convention:

| Network | nLockTime |
|---|---|
| eCash Mainnet | 499,999,998 |
| eCash Betanet | 499,999,999 |
| Bitcoin Signet | 0 (none needed — separate chain) |

A withdrawal signed for one eCash network is invalid on the other after the fork.

## API surface

All bridge endpoints are public; federation-facing endpoints use bearer auth. See the OpenAPI UI at [snowside.network/v1](https://snowside.network/v1).

| Endpoint | Purpose |
|---|---|
| `POST /v1/bridge/deposit` | Create a deposit request |
| `GET /v1/bridge/deposit/{id}` | Deposit status |
| `GET /v1/bridge/deposits/{address}` | History for a Snowside address |
| `POST /v1/bridge/withdraw` | Submit a withdrawal |
| `GET /v1/bridge/withdrawals/{address}` | Withdrawal history |
| `GET /v1/bridge/status` | Federation online status + last check-in |

## Custodial MVP trust model (read before mainnet use)

- The federation holds the L1 wallet keys (HD mnemonic, encrypted at rest on the Snowside infra host) and an L2 minter key with **mint-only** role (granted via `NativeMinter.setEnabled` by the chain authority; the authority retains sole admin).
- Deposit minting is fully automatic and amount-exact. **Burn verification is operator-supervised** in the MVP: the federation checks the burn transaction exists on the L2 before paying out (full input parsing is a known follow-up).
- Supply integrity: the genesis pre-mine (1,001,200 ECX per chain) is a recognized liability that will be **collateralized 1:1 by real ECX at sidechain slot-88 registration** (post-fork M1/M2). Every post-genesis mint is 1:1-backed by an observed L1 deposit.
- Roadmap to trustlessness: Phase 2 enforcer + slot registration on the post-fork network, Phase 3/4 rollout, ending with miner-voted M6 withdrawals (~13,150 ACKs over ~6 months) and no federation keys.
</content>
