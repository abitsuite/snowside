---
title: ECX Gas Model
description: Why ECX is the only gas token — no new token, no pre-mine, no governance games
---

Base Fees and Priority Fees on Snowside are always paid in ECX. Contract Fees (optional, opt-in by contract owner) may be denominated in ECX or USDC. There is no alternative gas token,
no new minted token, and no pre-mine. The only assets on Snowside are ECX (for gas)
and USDC (bridged from C-Chain via ICM).

## Why ECX Gas Matters

Using ECX as the native gas token preserves Bitcoin's economic model. Users are not
forced to acquire a new, speculative token to interact with the chain. They use
ECX — eCash's native cryptocurrency, secured by Bitcoin-class proof-of-work — for all
transactions.

This design choice has several implications:

- **No token launch, ICO, or pre-mine** — Snowside is infrastructure, not an
  investment vehicle
- **No governance token** — protocol parameters are set by validators and the
  community
- **Bitcoin holders can use Snowside** without exposure to new token risk
- **The gas market is denominated** in a Bitcoin-secured digital asset

## Acquiring ECX for Gas

Users acquire ECX for gas through two mechanisms:

### Blind Merged Mining

ECX flows between eCash and Snowside via the BMM peg mechanism. Block producers
pay ECX to miners for commitments; users pay ECX to producers for transaction
inclusion. The closed loop keeps ECX on the sidechain.

### Bridges

Users can bridge value from other chains to obtain ECX on Snowside. The ICM bridge
provides a trust-minimized path from Avalanche's C-Chain. Third-party bridges may
also support ECX deposits.

## Preserving Bitcoin's Economic Model

Because ECX is the only gas token, Bitcoin's economic incentives flow directly into
Snowside. eCash miners who secure Snowside via BMM are paid in ECX. Users who transact on
Snowside pay in ECX. The economic loop is entirely Bitcoin-native — no competing
incentive structures, no token dilution, no governance games.

## Comparison to Other Chains

| Chain | Gas Token | New Token? |
|-------|----------|------------|
| Snowside | ECX | No |
| Ethereum | ETH | N/A |
| EthSide (retired) | BTC | No |
| Avalanche C-Chain | AVAX | N/A |

Snowside is the only EVM chain that uses ECX natively for gas. Snowside
improves on the retired EthSide (which used BTC) by adding Avalanche consensus, ICM
bridging, and NodΞRunr automation.
