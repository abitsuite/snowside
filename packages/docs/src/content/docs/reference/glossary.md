---
title: Glossary
description: Key terms used throughout the Snowside documentation
---

## Avalanche L1

A sovereign Layer-1 blockchain built on Avalanche's consensus infrastructure.
Each L1 has its own validator set, gas token, and execution environment. Snowside
is an Avalanche L1.

## BMM (Blind Merged Mining)

Defined in BIP-301. A mechanism where Bitcoin miners secure a sidechain by
including compact block header commitments in their coinbase transactions —
without running the sidechain itself. "Blind" means miners do not validate or
understand the sidechain's internals.

## BIP-300 / BIP-301

Bitcoin Improvement Proposals for Drivechains (BIP-300, hashrate escrows) and
Blind Merged Mining (BIP-301). Together they enable Bitcoin-secured sidechains.
Paul Sztorc's eCash hard-fork activates these proposals.

## Chain ID

A unique numeric identifier for an EVM chain. Snowside's Chain ID is 73.

## Consensus

The mechanism by which validators agree on the next block. Snowside uses
Avalanche's Snowman consensus — a metastable, subsampling-based protocol with
deterministic finality.

## Deterministic Finality

Once a block is accepted by the validator set, it is final and cannot be
reverted. Contrasted with probabilistic finality (Bitcoin, Ethereum PoW) where
blocks can always be orphaned by a longer chain.

## Drivechain

A Bitcoin sidechain design by Paul Sztorc where Bitcoin miners custody the
pegged funds via hashrate escrows (BIP-300). Users move BTC between Bitcoin and
the sidechain via special withdrawal transactions that miners must approve.

## eCash

Paul Sztorc's specification for an electronic cash system built as a Bitcoin
sidechain. Snowside is built to host the eCash implementation.

## EVM (Ethereum Virtual Machine)

The execution environment for smart contracts on Ethereum-compatible chains.
Snowside runs a full EVM — all Ethereum tools (Foundry, Hardhat, Remix, ethers.js)
work without modification.

## EthSide

Paul Sztorc's previous EVM sidechain, now retired. Discontinued because
standalone chain management was too time-consuming for a single maintainer.
Snowside is the successor — fixing EthSide's operational problems with
NodeRunr automation and Avalanche infrastructure.

## Gas

The fee paid for transaction execution on an EVM chain. On Snowside, gas is
paid in BTC — not a new token.

## ICM (Interchain Messaging)

Avalanche's native protocol for communication between subnets and the primary
network. Snowside uses ICM to bridge USDC from the C-Chain trust-minimizingly.

## NodeRunr

An open-source daemon created by 0xShomari that automates Avalanche L1 node
deployment, monitoring, and updates. Won a $10,000 retro9000 grant from the
Avalanche Foundation. Repository: https://github.com/abitsuite/noderunr

## Precompile

A custom smart contract built into the EVM at the consensus level. Snowside
uses precompiles for eCash-specific logic, configured via NodeRunr's precompile
concierge feature.

## Snowman

The linear-chain variant of the Avalanche Consensus Protocol. Used by Snowside
validators. Provides sub-second deterministic finality.

## Sovereign Validator Set

A validator set that is independent of other chains. Snowside has its own
validators — they do not share with or depend on C-Chain or any other subnet.

## Teleporter

The ICM contract that locks assets on the source chain and sends a message to
the destination chain to mint equivalent assets. Used for USDC bridging between
C-Chain and Snowside.

## USDC

A USD-pegged stablecoin issued by Circle. On Snowside, USDC is bridged from
Avalanche's C-Chain via ICM — no wrapped representation, native settlement.
