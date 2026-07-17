---
title: Running a Validator
description: Deploy a Snowside validator using NodeRunr in under a minute
---

import { Steps } from '@astrojs/starlight/components';

Running a Snowside validator with NodeRunr takes under a minute. NodeRunr handles
deployment, monitoring, updates, and communication automatically — no manual config
file editing, no SSH gymnastics, no babysitting.

## Prerequisites

- A server (VPS) with at least 4 CPU cores, 8 GB RAM, and 200 GB SSD
- Ubuntu 22.04 or later (NodeRunr also supports Debian 12+)
- AVAX for the Avalanche Primary Network stake
- SSH access to the server

## Step-by-step deployment

<Steps>
  <Item title="Install NodeRunr">
    Connect to your server via SSH and run the NodeRunr installer:`curl -fsSL https://docs.layer1.run/install.sh | bash`. This installs the NodeRunr daemon and its dependencies.
  </Item>
  <Item title="Select the Snowside template">
    Once NodeRunr is installed, list available templates and select Snowside:`noderunr templates list` then`noderunr templates select snowside`. NodeRunr downloads the latest Snowside L1 configuration, including genesis parameters, precompile settings, and validator keys.
  </Item>
  <Item title="Configure your validator">
    Set your validator name and stake address:`noderunr config set --name "my-validator" --stake-address 0xYourAVAXAddress`. NodeRunr generates the validator's node ID, BLS keys, and TLS certificates automatically.
  </Item>
  <Item title="Deploy">
    Start the validator with a single command:`noderunr deploy`. NodeRunr installs the Avalanche node, configures it for the Snowside subnet, registers the validator with the Primary Network, and begins block production.
  </Item>
  <Item title="Verify">
    Check that your validator is online and producing blocks:`noderunr status`. You should see a green active indicator and a block height increasing. If any issues arise, NodeRunr's encrypted alert system notifies you automatically.
  </Item>
</Steps>

## Monitoring

NodeRunr continuously monitors your validator's health:

- Block production rate
- Peer connections
- Disk usage, memory, CPU
- Uptime and response time

When an update is available, NodeRunr can apply it automatically with zero
downtime. Alerts are sent via encrypted channels (Telegram, Discord, or email) if
intervention is required.

## Stopping or removing a validator

To stop your validator temporarily:`noderunr stop`

To remove your validator and unstake:`noderunr undeploy`

Your AVAX stake will be returned after the unstaking period (typically 14 days on
Avalanche).

## References

- [NodeRunr Documentation](https://docs.layer1.run)
- [NodeRunr GitHub](https://github.com/abitsuite/noderunr)
- [Avalanche9000 Validator Guide](https://docs.avax.network/)
