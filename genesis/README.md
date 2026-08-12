# Snowside Genesis Files — Source of Truth

## Overview

These genesis files are the canonical source of truth for all Snowside Avalanche L1 deployments. They must be used when deploying or redeploying any network.

## Directory Structure

    genesis/
      signet/
        genesis.json           # Local node genesis (used by avalanchego)
        genesis.subnet.json    # Subnet-level genesis (used by avalanche-cli)
      testnet/
        genesis.json
        genesis.subnet.json
      mainnet/
        genesis.json
        genesis.subnet.json

## Precompiles

All networks must have the NativeMinter precompile configured:

- Address: 0x0200000000000000000000000000000000000001
- Purpose: Mints native ECX tokens to deposit addresses
- Admin: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC (EWOQ)
- Function: mintNativeCoin(address,uint256) — selector 0x4f5aaaba
- Config key: contractNativeMinterConfig

WARNING: If this precompile is NOT in the genesis, mint transactions will "succeed" (status 0x1) but emit no logs and mint nothing. The EVM treats calls to unactivated precompile addresses as calls to empty addresses. Always verify the genesis includes contractNativeMinterConfig before deploying.

## Deploying with Custom Genesis

1. Copy the genesis to the avalanche-cli subnet directory:

       cp genesis/signet/genesis.subnet.json /root/.avalanche-cli/subnets/SnowsideSignet/genesis.json

2. Deploy the network:

       avalanche blockchain deploy SnowsideSignet --local --avalanchego-version latest

3. Verify NativeMinter is working after deployment:

       curl -s -X POST https://rpc.snowside.network/signet \
         -H "Content-Type: application/json" \
         -d '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x0200000000000000000000000000000000000001","data":"0xab6f7e5a0000000000000000000000008db97c7cece249c2b98bdc0226cc4c2a57bf52fc"},"latest"],"id":1}'

   Should return 0x...02 (role 2 = admin).

## NEVER generate genesis files from scratch

Always start from these files. The Avalanche CLI default genesis does NOT include NativeMinter. If you redeploy without these files, mints will silently fail.
