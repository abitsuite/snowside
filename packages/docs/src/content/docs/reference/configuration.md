---
title: Configuration
description: NodeRunr and Snowside validator configuration reference
---

This page documents the configuration options for Snowside validators managed
through NodeRunr.

## NodeRunr configuration

NodeRunr stores its configuration in `~/.noderunr/config.toml`. Most settings are
set automatically when you run `noderunr config set`, but they can also be edited
manually.

### Validator settings

| Setting | Default | Description |
|---------|---------|-------------|
| name | required | Validator display name shown in the explorer |
| stake-address | required | AVAX address holding the Primary Network stake |
| node-dir | /opt/avalanche | Installation directory for the Avalanche node |
| log-level | info | Logging verbosity: debug, info, warn, error |
| auto-update | true | Apply node updates automatically with zero downtime |
| auto-restart | true | Restart the node if it crashes |

### Network settings

| Setting | Default | Description |
|---------|---------|-------------|
| network | mainnet | Target network: mainnet or testnet |
| rpc-port | 9650 | Port for the Avalanche node's RPC server |
| p2p-port | 9651 | Port for P2P communication |
| http-host | 0.0.0.0 | Bind address for the HTTP server |

### Monitoring settings

| Setting | Default | Description |
|---------|---------|-------------|
| enable-monitoring | true | Enable 24/7 health checks |
| check-interval | 15 | Seconds between health checks |
| alert-channels | [] | List of alert channels: telegram, discord, email |
| alert-endpoint | "" | Webhook URL for alert delivery |

## Snowside L1 parameters

These parameters define the Snowside subnet. They are set in the NodeRunr
Snowside template and should not normally be changed.

### Genesis parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| chain-id | 73 | EVM chain ID |
| gas-token | BTC | Native gas token symbol |
| gas-limit | 15,000,000 | Block gas limit |
| block-time | 2 | Target block time in seconds |
| epoch-duration | 3600 | Epoch duration in seconds |

### Precompile configuration

Snowside uses custom precompiles for eCash-specific logic. These are configured
in the template's `precompiles.json` file:

    {
      "address": "0x0000000000000000000000000000000000000100",
      "type": "ecash-processor",
      "enabled": true
    }

Each precompile has a fixed address in the range `0x0100` - `0x01FF`. Disabled
precompiles remain in the config but are skipped during execution.

## Environment variables

NodeRunr reads the following environment variables. They override settings in
`config.toml`:

| Variable | Description |
|----------|-------------|
| NODERUNR_HOME | NodeRunr data directory (default: ~/.noderunr) |
| NODERUNR_LOG_LEVEL | Override log level |
| NODERUNR_ALERT_TOKEN | Auth token for alert channels |
| AVALANCHE_STAKE_KEY | BLS stake key (auto-generated if absent) |

## References

- [NodeRunr Documentation](https://docs.layer1.run)
- [Avalanche9000 Documentation](https://docs.avax.network/)
- [Avalanche Node Config Reference](https://docs.avax.network/nodes/configure/avalanchego-config-flags)
