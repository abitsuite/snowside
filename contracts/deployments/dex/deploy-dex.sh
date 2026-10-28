#!/usr/bin/env bash
# /tmp/dex-deploy/kit/deploy-dex.sh — deploys WECX, UniswapV2Factory, Router02, MockUSDC, MockBTCb
# usage: deploy-dex.sh <kit-dir> <rpc-url> <pk-file> <label>
set -euo pipefail
KIT=$1; RPC=$2; PKFILE=$3; LABEL=$4
PK=$(tr -d '[:space:]' < "$PKFILE")
export PATH="$HOME/.foundry/bin:$PATH"

AUTHORITY=0xE5104794FB44D45b0f821d77a685A17ee2E35b9C   # feeToSetter
DEPLOYER=$(cast wallet address --private-key "$PK")
echo "[$LABEL] deployer: $DEPLOYER"
echo "[$LABEL] balance:  $(cast balance --rpc-url "$RPC" "$DEPLOYER")"

deploy() { # <label> <binfile> [sig args...]
  local name=$1 bin=$2; shift 2
  local code; code=$(tr -d '[:space:]' < "$KIT/$bin")
  local out addr block
  if [ $# -gt 0 ]; then
    out=$(cast send --json --legacy --gas-price 30gwei --rpc-url "$RPC" --private-key "$PK" --create "$code" "$@")
  else
    out=$(cast send --json --legacy --gas-price 30gwei --rpc-url "$RPC" --private-key "$PK" --create "$code")
  fi
  addr=$(echo "$out" | python3 -c "import json,sys; print(json.load(sys.stdin)['contractAddress'])")
  block=$(echo "$out" | python3 -c "import json,sys; print(int(json.load(sys.stdin)['blockNumber'],16))")
  echo "$name $addr $block"
}

WECX=$(deploy WECX wecx.bin)
echo "[$LABEL] -> $WECX"
WECX_ADDR=$(echo "$WECX" | cut -d' ' -f2)

FACTORY=$(deploy Factory factory.bin "constructor(address)" "$AUTHORITY")
echo "[$LABEL] -> $FACTORY"
FACTORY_ADDR=$(echo "$FACTORY" | cut -d' ' -f2)

ROUTER=$(deploy Router02 router.bin "constructor(address,address)" "$FACTORY_ADDR" "$WECX_ADDR")
echo "[$LABEL] -> $ROUTER"

# MockUSDC: 10,000,000 * 10^6 initial to deployer; MockBTCb: 100,000 * 10^8
USDC=$(deploy MockUSDC mock.bin "constructor(string,string,uint8,uint256,address)" "USD Coin" "USDC" 6 10000000000000 "$DEPLOYER")
echo "[$LABEL] -> $USDC"
BTCB=$(deploy MockBTCb mock.bin "constructor(string,string,uint8,uint256,address)" "BTC.b" "BTC.b" 8 1000000000000 "$DEPLOYER")
echo "[$LABEL] -> $BTCB"

# --- verify wiring ---
USDC_ADDR=$(echo "$USDC" | cut -d' ' -f2)
BTCB_ADDR=$(echo "$BTCB" | cut -d' ' -f2)
ROUTER_ADDR=$(echo "$ROUTER" | cut -d' ' -f2)
echo "[$LABEL] verify factory.feeToSetter: $(cast call --rpc-url "$RPC" "$FACTORY_ADDR" 'feeToSetter()(address)')"
echo "[$LABEL] verify router.factory:      $(cast call --rpc-url "$RPC" "$ROUTER_ADDR" 'factory()(address)')"
echo "[$LABEL] verify router.WETH:         $(cast call --rpc-url "$RPC" "$ROUTER_ADDR" 'WETH()(address)')"
echo "[$LABEL] verify wecx.symbol:         $(cast call --rpc-url "$RPC" "$WECX_ADDR" 'symbol()(string)')"
echo "[$LABEL] verify wecx.decimals:       $(cast call --rpc-url "$RPC" "$WECX_ADDR" 'decimals()(uint8)')"
echo "[$LABEL] verify usdc.symbol/dec:     $(cast call --rpc-url "$RPC" "$USDC_ADDR" 'symbol()(string)') / $(cast call --rpc-url "$RPC" "$USDC_ADDR" 'decimals()(uint8)')"
echo "[$LABEL] verify btcb.symbol/dec:     $(cast call --rpc-url "$RPC" "$BTCB_ADDR" 'symbol()(string)') / $(cast call --rpc-url "$RPC" "$BTCB_ADDR" 'decimals()(uint8)')"
echo "[$LABEL] SUMMARY WECX=$WECX_ADDR FACTORY=$FACTORY_ADDR ROUTER=$ROUTER_ADDR USDC=$USDC_ADDR BTCB=$BTCB_ADDR"
