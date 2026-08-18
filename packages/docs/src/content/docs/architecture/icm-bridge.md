---
title: ICM Bridge
description: Trust-minimized USDC bridging from Avalanche's C-Chain via Interchain Messaging
---

A native, trust-minimized bridge connects Snowside to Avalanche's C-Chain via
Interchain Messaging (ICM). This allows USDC holders on C-Chain to transfer their
stablecoins directly to Snowside without relying on third-party custodians or
wrapped token representations.

## Native ICM Bridge

Avalanche's Interchain Messaging protocol enables communication between Avalanche
subnets and the primary network. The ICM bridge provides:

- **Trust-minimized** — No third-party custodian holds the bridged assets
- **Native** — Built into the Avalanche protocol, not a bolt-on bridge
- **Fast** — Transfers confirm in Avalanche finality time (seconds)
- **Bidirectional** — USDC can flow in both directions

## How It Works

1. User locks USDC in the ICM teleporter contract on the C-Chain
2. The ICM protocol sends a message to Snowside's validator set
3. Snowside validators verify the message and mint an equivalent USDC balance
4. User receives native USDC on Snowside

The reverse process burns USDC on Snowside and unlocks it on the C-Chain. At no
point does a third party custody the funds — the bridge's security is inherited
from Avalanche consensus itself.

## DeFi-Ready from Day One

By bridging USDC from C-Chain at mainnet launch, Snowside provides immediate access
to the world's most recognized stablecoin. This makes Snowside useful for DeFi
applications from day one — lending, borrowing, trading, and payments can all use
USDC without waiting for a separate bridge deployment or liquidity bootstrapping.

Additionally, when contract owners denominate Contract Fees in USDC, the Contract Owner vested USDC share auto-bridges back to C-Chain by default. Of the Treasury's captured USDC: the Foundation's retained portion (10% of Treasury gross capture) remains on Snowside under Foundation management; the Validators' portion (85% of Treasury gross capture at default configuration) is auto-bridged to C-Chain via ICM and distributed to validators as USDC on C-Chain, proportional to bonded BTC; and the Settlement Proposers' portion (5% of Treasury gross capture at default configuration) is similarly bridged to C-Chain if the proposer designates a C-Chain address, or remains on Snowside at the proposer's discretion. This creates a circular value flow: USDC enters Snowside for application use, application usage generates USDC Contract Fees, and those fees flow back to C-Chain for the contract owner, validators, and proposers.

## References

- [Avalanche Interchain Messaging (ICM)](https://docs.avax.network/)
- [USDC by Circle](https://www.circle.com/en/usdc)
