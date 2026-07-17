---
title: Architecture Overview
description: The three-layer design of Snowside — EVM execution, Snowman consensus, BMM settlement
---

Snowside is an EVM-compatible Layer-1 blockchain running on Avalanche's consensus
infrastructure. It combines three layers: an EVM execution environment, Avalanche's
Snowman consensus protocol for fast finality, and Blind Merged Mining for
Bitcoin-anchored settlement security.

## EVM Execution Layer

Snowside runs a standard EVM execution environment. All existing Ethereum developer
tools — Remix, Hardhat, Foundry, The Graph, viem, ethers.js — work without
modification. Smart contracts written in Solidity or Vyper deploy identically to
how they would on any other EVM chain.

The EVM is augmented with custom precompiles for eCash-specific logic, configurable
via NodeRunr's precompile concierge feature. This allows eCash protocol rules to be
enforced at the consensus level rather than through external smart contracts.

## Avalanche Consensus (Snowman)

Snowside validators use Avalanche's Snowman consensus — the linear-chain variant of
the Avalanche Consensus Protocol. Snowman provides deterministic finality: once a
block is accepted by the validator set, it is final and cannot be reverted.

Key properties:

- **Sub-second finality** — transactions confirm in approximately 1–3 seconds
- **Sovereign validator set** — independent of C-Chain or any other Avalanche subnet
- **Permissionless participation** — anyone meeting the stake requirement can validate
- **Custom throughput** — Snowside sets its own block size and gas limits

## Blind Merged Mining Settlement

While Avalanche consensus provides fast, deterministic finality, ultimate settlement
security comes from Bitcoin via Blind Merged Mining (BIP-301). Snowside block
producers submit compact header commitments to Bitcoin miners, who include them in
coinbase transactions. This creates a cryptographic link between Bitcoin's
proof-of-work and Snowside's activity.

This two-layer security model provides a three-tier confirmation architecture:

| Tier | Time | Security |
|------|------|----------|
| Instant | 1–3 seconds | Avalanche Snowman consensus |
| Confirmed | ~10 minutes | Avalanche + multiple validator rounds |
| Settled | ~60 minutes | Bitcoin-anchored via BMM |

Users and applications choose the tier that matches their requirements: payment
applications can accept Instant confirmation, while high-value settlements may wait
for Settled confirmation.

## Next steps

- [Blind Merged Mining](/architecture/bmm) — how Bitcoin miners secure Snowside
- [Avalanche Consensus](/architecture/consensus) — Snowman protocol deep dive
- [BTC Gas Model](/architecture/gas-model) — why BTC is the only gas token
