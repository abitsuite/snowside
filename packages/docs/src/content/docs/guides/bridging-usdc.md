---
title: Bridging USDC
description: Transfer USDC between Avalanche C-Chain and Snowside via ICM
---

import { Steps } from '@astrojs/starlight/components';

Snowside is connected to Avalanche's C-Chain via the Interchain Messaging (ICM)
protocol. This allows you to bridge USDC trust-minimizingly — no third-party
custodian, no wrapped tokens, just native Avalanche messaging.

## Prerequisites

- USDC balance on Avalanche's C-Chain
- A Web3 wallet (MetaMask, Rabby, etc.) connected to C-Chain
- The Snowside network added to your wallet (Chain ID 73, RPC URL
  https://rpc.snowside.network/ext/bc/snowside/rpc, Symbol BTC)

## Bridging USDC to Snowside

<Steps>
  <Item title="Open the ICM Teleporter">
    Navigate to the Snowside bridge interface at https://bridge.snowside.network
    and connect your wallet to C-Chain.
  </Item>
  <Item title="Enter the amount">
    Specify how much USDC you want to bridge to Snowside. The interface shows
    the estimated fee (paid in AVAX on C-Chain) and the expected arrival time.
  </Item>
  <Item title="Approve and send">
    Click Bridge. Your wallet will ask for two transactions: an Approve
    transaction (allows the ICM teleporter contract to move your USDC), and a
    Send transaction (locks USDC on C-Chain and sends the ICM message to Snowside).
  </Item>
  <Item title="Receive on Snowside">
    After Avalanche finality (1–3 seconds), your USDC is minted on Snowside.
    Switch your wallet to the Snowside network to see your balance.
  </Item>
</Steps>

## Bridging USDC back to C-Chain

The reverse process is identical:

1. Connect your wallet to Snowside
2. Enter the amount of USDC to bridge back
3. Submit the burn transaction (gas paid in BTC)
4. USDC is unlocked on C-Chain after finality

## How the bridge works

The ICM bridge is not a third-party bridge. It uses Avalanche's native Interchain
Messaging protocol:

1. USDC is locked in the ICM teleporter contract on C-Chain
2. The ICM protocol sends a message to Snowside's validator set
3. Snowside validators verify the message and mint equivalent USDC
4. The reverse process burns USDC on Snowside and unlocks it on C-Chain

No third party ever custodies the funds. The bridge's security is inherited from
Avalanche consensus itself.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| USDC not arriving | Wait 10 seconds for finality. Check the explorer for the ICM message. |
| Wrong network | Ensure wallet is on C-Chain (Chain ID 43114) for sending, Snowside (Chain ID 73) for receiving. |
| Insufficient gas for approval | You need AVAX on C-Chain for the approval and send transactions. |
