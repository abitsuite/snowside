---
title: BTC Gas Model
description: Why BTC is the only gas token — no new token, no pre-mine, no governance games
---

All transaction fees on Snowside are paid in BTC. There is no alternative gas token,
no new minted token, and no pre-mine. The only assets on Snowside are BTC (for gas)
and USDC (bridged from C-Chain via ICM).

## Why BTC Gas Matters

Using BTC as the native gas token preserves Bitcoin's economic model. Users are not
forced to acquire a new, speculative token to interact with the chain. They use
Bitcoin — the most recognized and liquid cryptocurrency — for all transactions.

This design choice has several implications:

- **No token launch, ICO, or pre-mine** — Snowside is infrastructure, not an
  investment vehicle
- **No governance token** — protocol parameters are set by validators and the
  community
- **Bitcoin holders can use Snowside** without exposure to new token risk
- **The gas market is denominated** in the world's most trusted digital asset

## Acquiring BTC for Gas

Users acquire BTC for gas through two mechanisms:

### Blind Merged Mining

BTC flows between Bitcoin and Snowside via the BMM peg mechanism. Block producers
pay BTC to miners for commitments; users pay BTC to producers for transaction
inclusion. The closed loop keeps BTC on the sidechain.

### Bridges

Users can bridge value from other chains to obtain BTC on Snowside. The ICM bridge
provides a trust-minimized path from Avalanche's C-Chain. Third-party bridges may
also support BTC deposits.

## Preserving Bitcoin's Economic Model

Because BTC is the only gas token, Bitcoin's economic incentives flow directly into
Snowside. Miners who secure Snowside via BMM are paid in BTC. Users who transact on
Snowside pay in BTC. The economic loop is entirely Bitcoin-native — no competing
incentive structures, no token dilution, no governance games.

## Comparison to Other Chains

| Chain | Gas Token | New Token? |
|-------|----------|------------|
| Snowside | BTC | No |
| Ethereum | ETH | N/A |
| EthSide (retired) | BTC | No |
| Avalanche C-Chain | AVAX | N/A |

Snowside and EthSide are the only EVM chains that use BTC natively for gas. Snowside
improves on EthSide by adding Avalanche consensus, ICM bridging, and NodeRunr
automation.
