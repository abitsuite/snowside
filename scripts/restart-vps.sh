#!/usr/bin/env bash
# Snowside VPS restart script — restarts all 3 Avalanche L1 networks
# WITHOUT resetting any chain data. Run after any VPS reboot/outage.
#
# Usage: ./scripts/restart-vps.sh
#
# How it works:
#   1. Starts the default Avalanche local network (bootstrap nodes 9650/9652)
#   2. Manually starts each subnet node using its preserved flags.json
#      (chainData/ directories are reused, so balances/history are preserved)
#   3. Restarts the federation Docker container
#
# DO NOT run "avalanche network clean" — it deletes all chain data.
# DO NOT run "avalanche blockchain deploy" again — it creates new blockchain IDs.

set -euo pipefail

AVALANCHEGO=/root/.avalanche-cli/bin/avalanchego/avalanchego-v1.14.0/avalanchego

MAINNET_NODE=/root/.avalanche-cli/local/SnowsideMainnet-local-node-local-network/NodeID-ASyd3wedgSc7NPmUUyf9F9jUwjdErnzZ5
TESTNET_NODE=/root/.avalanche-cli/local/SnowsideTestnet-local-node-local-network/NodeID-Kps7HG1oA1kWGn2WSu6mhPhZifuWwfmvp
SIGNET_NODE=/root/.avalanche-cli/local/SnowsideSignet-local-node-local-network/NodeID-JqZRtq73ejnvUY9sFGsBAuw6ajKrr69y6

echo "=== 1. Stopping any stale processes ==="
pkill -f "avalanchego.*Snowside.*local-node" 2>/dev/null || true
sleep 2

echo "=== 2. Starting default network (bootstrap nodes) ==="
avalanche network start
sleep 10

echo "=== 3. Starting subnet nodes (preserving chainData) ==="
nohup "$AVALANCHEGO" --config-file "$MAINNET_NODE/flags.json" \
  > "$MAINNET_NODE/stdout.log" 2>&1 &
echo "  Mainnet node started (PID: $!, port 9656)"

nohup "$AVALANCHEGO" --config-file "$TESTNET_NODE/flags.json" \
  > "$TESTNET_NODE/stdout.log" 2>&1 &
echo "  Testnet node started (PID: $!, port 9658)"

nohup "$AVALANCHEGO" --config-file "$SIGNET_NODE/flags.json" \
  > "$SIGNET_NODE/stdout.log" 2>&1 &
echo "  Signet node started (PID: $!, port 9654)"

echo "=== 4. Waiting for nodes to boot ==="
sleep 15

echo "=== 5. Verifying RPCs ==="
for net in mainnet testnet signet; do
  result=$(curl -s -X POST "https://rpc.snowside.network/$net" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}')
  echo "  $net: $result"
done

echo "=== 6. Restarting federation container ==="
cd /root/snowside/packages/federation
docker compose restart

echo ""
echo "=== Restart complete ==="
echo "  Logs: docker logs -f snowside-federation"
