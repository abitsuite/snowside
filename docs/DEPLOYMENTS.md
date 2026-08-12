# Snowside Network Deployments

## Current Deployment (2026-08-12)

| Network   | Chain ID | Blockchain ID                          | API Port | RPC URL                              |
|-----------|----------|----------------------------------------|----------|--------------------------------------|
| Mainnet   | 32904    | 5ox6qUHAswB18Je6riq69xUToXQ3wQu4H4uXSPE1xeVF38KDb | 9656 | https://rpc.snowside.network/mainnet  |
| Testnet   | 33160    | 22Y9NRt9rdnh5qVMEeod9XLE9cJytvpqg4p82ac72tAu6t9fKL | 9658 | https://rpc.snowside.network/testnet  |
| Signet    | 33416    | 2MYRvevRa4YSoQfdgHtn2kbjUvNRZsE29cj8rPZ2okCCDFgBwF | 9654 | https://rpc.snowside.network/signet   |

## Notes
- All networks have NativeMinter precompile enabled (EWOQ as admin)
- Blockchain IDs change on every fresh deployment (avalanche network clean + deploy)
- Genesis files in genesis/ are the source of truth for precompile config
- EWOQ address: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
- EWOQ private key: 0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
- ICM Messenger: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf (all networks)
- ICM Registry: 0xB8e71012d3F55D9EbbFf74376dE180702c1D8A6F (all networks)
