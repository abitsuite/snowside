# Snowside Testnet & Devnet Deployment Guide

This document outlines the requirements and steps to deploy the Snowside L1
to a local Devnet and the Fuji Testnet using Avalanche-CLI.

## Chain Configuration

- Chain Name: Snowside
- Chain ID (Testnet): 33160 (Hex: 0x8188)
- Chain ID (Mainnet): 32904 (Hex: 0x8088)
- Token Symbol: ECX
- Consensus: Proof of Authority (PoA) or Proof of Stake (PoS) (Select based on current phase)

## Hardware Requirements (Post-Etna Upgrade)

Validators no longer need to validate the primary P-Chain Network to validate their own L1.
The minimum hardware requirements are:

- CPU: 8 cores
- RAM: 16 GB
- Storage: 1 TB NVMe SSD
- Bandwidth: 100 Mbps up/down
- OS: Ubuntu 20.04+ or similar

## Deployment Phases

### Phase 1: Local Devnet

Run a local instance to test the chain parameters without requiring a VPS.

1. Install Avalanche-CLI:
   Follow the instructions at Avalanche Builder Hub (https://build.avax.network/docs/tooling/avalanche-cli).

2. Create the L1 specification:

    avalanche blockchain create snowside

   - When prompted for Chain ID, enter: 33160
   - When prompted for Token Symbol, enter: ECX
   - Select a local test environment configuration.

3. Deploy locally:

    avalanche blockchain deploy snowside

   - Choose Local Network when prompted.

### Phase 2: Fuji Testnet (VPS Required)

To deploy to the Fuji Testnet, provision a VPS matching the hardware requirements above,
install Avalanche-CLI, and execute the deploy command.

1. Fund your deployment key:
   Create a key and fund it with testnet AVAX using the Fuji faucet or Core wallet.

2. Deploy to Fuji:

    avalanche blockchain deploy snowside

   - Choose Fuji when prompted.
   - Select the funded key to pay for transaction fees.
   - Use your local VPS as a bootstrap validator if prompted.

3. Connect to the L1:
   - RPC URL: http://<VPS_IP>:9650/ext/bc/<BlockchainID>/rpc
   - Chain ID: 33160
   - Symbol: ECX
