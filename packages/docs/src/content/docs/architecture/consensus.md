---
title: Avalanche Consensus
description: Snowman consensus — deterministic finality in sub-second time
---

Snowside validators run Avalanche's Snowman consensus protocol. Snowman is the
linear-chain variant of the Avalanche Consensus Protocol, designed for blockchains
that require a total ordering of transactions.

## Key Properties

- **Deterministic finality** — once a block is accepted, it is final. No
  probabilistic waiting, no chance of reorganization.
- **Sub-second confirmation** — transactions typically finalize in 1–3 seconds.
- **Validator-set sovereignty** — Snowside validators are independent of C-Chain
  or any other Avalanche subnet.
- **Permissionless participation** — anyone staking AVAX with the Primary Network
  can validate.

## How Snowman Works

Snowman uses a metastable consensus mechanism based on repeated subsampling among
validators. Each validator queries a random subset of peers for their preference on
the next block, updates its own preference based on the majority response, and
repeats. After sufficient rounds, all honest validators converge on the same block
with probability 1.

Unlike proof-of-work, where blocks can always be orphaned by a longer chain, Snowman
finality is irreversible once achieved. This eliminates the "wait for N confirmations"
pattern of Bitcoin and Ethereum.

## Validator Requirements

Anyone can run a Snowside validator. The requirements are minimal:

- A server (VPS) with basic specifications
- AVAX for the Avalanche Primary Network stake
- The NodeRunr Snowside template (free, open-source)

No special hardware, no complex setup, no approval process. NodeRunr handles
deployment, monitoring, and updates automatically.

See the [Running a Validator guide](/guides/running-a-validator) for step-by-step
instructions.

## References

- [Avalanche Consensus Protocol (whitepaper)](https://arxiv.org/abs/1906.08936)
- [Avalanche9000 Documentation](https://docs.avax.network/)
