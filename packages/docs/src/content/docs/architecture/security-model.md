---
title: Security Model
description: Three-tier confirmation — instant, confirmed, and Bitcoin-settled
---

Snowside's consensus and security model combines two layers: Avalanche's Snowman
consensus for fast, deterministic finality, and Blind Merged Mining for
Bitcoin-anchored settlement. Together, they provide a three-tier confirmation model
that lets users choose the trust level appropriate to their use case.

## Layer 1: Avalanche Snowman Consensus

Snowside validators run Avalanche's Snowman consensus protocol. Snowman is the
linear-chain variant of the Avalanche Consensus Protocol, designed for blockchains
that require a total ordering of transactions.

Key properties:

- **Deterministic finality** — once a block is accepted, it is final
- **Sub-second confirmation** — transactions typically finalize in 1–3 seconds
- **Validator-set sovereignty** — Snowside validators are independent of C-Chain
- **Permissionless participation** — anyone staking AVAX can validate

## Layer 2: BMM Settlement to Bitcoin

While Snowman consensus provides fast finality among Snowside validators, BMM
anchoring to Bitcoin provides the ultimate security guarantee. Every Snowside
block (or batches of blocks) is anchored to Bitcoin via a BMM commitment.

Reverting Snowside's settled history requires attacking Bitcoin's hashrate —
economically irrational for any attacker.

## Three-Tier Confirmation

| Tier | Time | Security Level | Use Case |
|------|------|---------------|----------|
| Instant | 1–3 seconds | Avalanche Snowman consensus | Payments, dApp interactions |
| Confirmed | ~10 minutes | Multiple validator rounds | Medium-value transactions |
| Settled | ~60 minutes | Bitcoin-anchored via BMM | High-value settlements |

Users and applications choose the tier that matches their requirements. Payment
applications can accept Instant confirmation, while high-value settlements may wait
for Settled confirmation.

## Comparison with Alternatives

### vs Ethereum L2/Rollups

Ethereum L2s require wrapping BTC to use it as gas. They share a sequencer with
other L2s, have multi-minute confirmation times, and offer no custom precompiles.
Snowside provides native BTC gas, sovereign validators, sub-second finality, and
custom precompiles.

### vs Avalanche C-Chain

The C-Chain uses AVAX for gas and shares validators with all C-Chain users.
Snowside has its own validator set, uses BTC for gas, and can implement custom
precompiles for eCash-specific logic.

### vs Standalone Chain

A standalone chain could theoretically implement BTC gas and custom precompiles,
but it would lack Avalanche's ICM bridge for USDC, require expensive manual
validator operations, and miss the operational automation provided by NodeRunr.
