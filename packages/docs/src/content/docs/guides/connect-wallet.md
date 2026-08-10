---
title: Connect a Web3 Wallet
description: Connect MetaMask or Rabby to Snowside Mainnet, Testnet, and Signet.
---

Snowside operates three Avalanche L1 networks. Use the details below to connect your Web3 wallet to each network manually or via CLI.

## Network Details

### Snowside Mainnet

| Parameter | Value |
| :--- | :--- |
| Network Name | Snowside Mainnet |
| RPC URL | `https://rpc.snowside.network/mainnet` |
| Chain ID | `32904` \| `0x8088` |
| Currency Symbol | `ECX` |
| Block Explorer URL | `https://explorer.snowside.network` |

### Snowside Testnet

| Parameter | Value |
| :--- | :--- |
| Network Name | Snowside Testnet |
| RPC URL | `https://rpc.snowside.network/testnet` |
| Chain ID | `33160` \| `0x8188` |
| Currency Symbol | `ECX` |
| Block Explorer URL | `https://explorer.snowside.network` |

### Snowside Signet

| Parameter | Value |
| :--- | :--- |
| Network Name | Snowside Signet |
| RPC URL | `https://rpc.snowside.network/signet` |
| Chain ID | `33352` \| `0x8288` |
| Currency Symbol | `ECX` |
| Block Explorer URL | `https://explorer.snowside.network` |

## Manual Wallet Configuration

### Rabby Wallet

1. Open the Rabby extension.
2. Click the network dropdown in the top left.
3. Click **Add Network**.
4. Enter the details from the table above for the network you want to add.
5. Click **Save**.

### MetaMask

1. Open the MetaMask extension.
2. Click the network selector at the top.
3. Click **Add Network**.
4. Click **Add a network manually**.
5. Enter the details from the table above.
6. Click **Save**.

## CLI Configuration (cast)

You can add these networks to your Foundry `cast` configuration using the commands below.

    cast chain-id --rpc-url https://rpc.snowside.network/mainnet
    cast chain-id --rpc-url https://rpc.snowside.network/testnet
    cast chain-id --rpc-url https://rpc.snowside.network/signet
