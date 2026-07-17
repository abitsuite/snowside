---
title: Deploying Contracts
description: Deploy Solidity smart contracts to Snowside using Foundry or Hardhat
---

Snowside is fully EVM-compatible. Any contract written in Solidity or Vyper can be
deployed using standard Ethereum tooling — Foundry, Hardhat, Remix, ethers.js, or
viem. The only change required is the RPC endpoint and chain ID.

## Network parameters

| Parameter | Value |
|-----------|-------|
| Chain ID | 73 (eCash mainnet) |
| RPC URL (mainnet) | https://rpc.snowside.network/ext/bc/snowside/rpc |
| RPC URL (testnet) | https://rpc.snowside.network/ext/bc/snowside-test/rpc |
| Gas token | BTC (18 decimals, same as ETH) |
| Explorer | https://explorer.snowside.network |

## Deploying with Foundry

1. Install Foundry: `curl -L https://foundry.paradigm.xyz | bash` then `foundryup`
2. Create a new project: `forge init my-snowside-contracts` then `cd my-snowside-contracts`
3. Write your contract in `src/Contract.sol`
4. Deploy to Snowside testnet: `forge create src/Contract.sol:MyContract --rpc-url https://rpc.snowside.network/ext/bc/snowside-test/rpc --private-key $YOUR_PRIVATE_KEY`

> **Note:** Gas is paid in BTC, but the EVM treats it identically to ETH (18
> decimals). Your wallet needs a BTC balance on Snowside, not AVAX or ETH.

## Deploying with Hardhat

1. Install Hardhat: `npm install --save-dev hardhat` then `npx hardhat init`
2. Add Snowside to your `hardhat.config.js`:

    module.exports = {
      networks: {
        snowside: {
          url: 'https://rpc.snowside.network/ext/bc/snowside/rpc',
          chainId: 73,
          accounts: [process.env.PRIVATE_KEY],
        },
      },
    };

3. Deploy: `npx hardhat run scripts/deploy.js --network snowside`

## Deploying with Remix

1. Open [Remix](https://remix.ethereum.org/)
2. Go to the Deploy and Run Transactions tab
3. Add a custom network: RPC URL `https://rpc.snowside.network/ext/bc/snowside/rpc`, Chain ID `73`
4. Select your contract and click Deploy

## Verifying contracts

Contracts can be verified on the Snowside block explorer using standard
verification tools: `forge verify-contract <ADDRESS> src/Contract.sol:MyContract --verifier blockscout --verifier-url https://explorer.snowside.network/api`
