---
# packages/tour/slides.md
theme: none
title: Snowside — Tour
info: |
  Snowside — The eCash Sidechain on Avalanche.
  Native BTC gas, USDC bridging, NodΞRunr automation.
class: slide-canvas
highlighter: shiki
mdc: true
fonts:
  sans: Inter
  mono: JetBrains Mono
lineNumbers: false
colorSchema: dark
favicon: /favicon.svg
# Simple Analytics + OG meta injected post-build by scripts/inject-head.mjs
# (Slidev's `head:` frontmatter renders client-side only, not in initial HTML.)
---

---
layout: snow-cover
class: text-center
---

# Snowside

The eCash Sidechain on Avalanche

<p class="lead">Native BTC gas. Instant USDC bridging. Bitcoin-security, Avalanche speed.</p>

<div class="flex gap-4 justify-center mt-8">
  <span class="tag">Avalanche L1</span>
  <span class="tag">Bitcoin Sidechain</span>
  <span class="tag">No Token</span>
</div>

---

## What is Snowside?

A dedicated Avalanche Layer-1 blockchain built to host Paul Sztorc's upcoming eCash hard-fork. It runs as a clean EVM sidechain where the **native gas token is BTC** — no new tokens, no pre-mine, just Bitcoin security via blind merged mining.

<div class="grid grid-cols-2 gap-6 mt-8">

- **Native BTC gas** — fees paid in BTC via BIP-301 blind merged mining
- **Sub-second finality** — Avalanche Snowball consensus
- **USDC bridging** — native Interchain Messaging from C-Chain
- **Full EVM** — Remix, Hardhat, Foundry work out-of-the-box
- **Automated validation** — powered by NodΞRunr
- **No token. No ICO.** — infrastructure, not an investment vehicle

</div>

---
layout: snow-default
---

## Two native assets, zero friction

Bridging Bitcoin and stablecoin economies in one network.

<div class="grid grid-cols-2 gap-8 mt-10">

<div class="bg-white/5 border border-snow-500/20 rounded-xl p-8">

### ⚡ Native BTC Gas

Transaction fees paid in real Bitcoin via blind merged mining. No new token, no pre-mine, no inflation.

</div>

<div class="bg-white/5 border border-aval-500/20 rounded-xl p-8">

### 🌉 USDC Bridging

Avalanche Interchain Messaging (ICM) bridges USDC from the C-Chain natively. Stable liquidity from day one.

</div>

</div>

<p class="text-center mt-8 text-slate-400 text-sm">
  <strong class="text-snow-300">No competing token.</strong> Just BTC for gas and USDC for liquidity.
</p>

---
layout: snow-default
---

## How it works

Five layers of technology, one cohesive sidechain.

<div class="grid grid-cols-5 gap-4 mt-8 text-sm">

<div class="bg-ink-800 border border-white/5 rounded-lg p-4">

**01 — BMM**
Bitcoin miners commit to Snowside blocks without running them. They earn BTC fees while securing the chain with existing hash power.

</div>

<div class="bg-ink-800 border border-white/5 rounded-lg p-4">

**02 — Avalanche L1**
A dedicated validator set runs Snowside with sub-second finality. Validators are community-operated via NodΞRunr.

</div>

<div class="bg-ink-800 border border-white/5 rounded-lg p-4">

**03 — BTC Gas Flow**
Users pay gas in BTC. Miners collect fees through BMM commitments. The loop closes entirely within Bitcoin.

</div>

<div class="bg-ink-800 border border-white/5 rounded-lg p-4">

**04 — ICM USDC Bridge**
Avalanche ICM trustlessly bridges USDC from the C-Chain — no third-party bridges, no wrapped assets.

</div>

<div class="bg-ink-800 border border-white/5 rounded-lg p-4">

**05 — NodΞRunr**
Validators deploy, monitor, and update via NodΞRunr — the open-source daemon that won a $10k retro9000 grant.

</div>

</div>

---
layout: snow-default
---

## Why Avalanche is the perfect substrate

<div class="grid grid-cols-3 gap-6 mt-8 text-sm">

<div class="bg-white/5 border border-white/5 rounded-lg p-6">

### Sovereign validation
Snowside runs its own validators, ensuring dedicated throughput for eCash operations.

</div>

<div class="bg-white/5 border border-white/5 rounded-lg p-6">

### Native interoperability
Avalanche ICM allows trust-less bridging of USDC from the C-Chain without third-party bridges.

</div>

<div class="bg-white/5 border border-white/5 rounded-lg p-6">

### Low operational cost
Avalanche9000's subscription model makes community-run validation cheap and feasible.

</div>

<div class="bg-white/5 border border-white/5 rounded-lg p-6">

### Tooling maturity
Full EVM compatibility — Remix, Hardhat, The Graph, Foundry all work out-of-the-box.

</div>

<div class="bg-white/5 border border-white/5 rounded-lg p-6">

### Proven L1 track record
Multiple Avalanche L1s are already live in production. The infrastructure is battle-tested.

</div>

</div>

---
layout: snow-default
---

## How Snowside compares

Snowside vs. EthSide (Paul's retired chain) vs. Lightning Network

<ComparisonTable />

---
layout: snow-default
---

## Risks & mitigations

<RiskMitigation />

---
layout: snow-default
---

## From testnet to mainnet

<RoadmapTimeline />

---
layout: snow-default
---

## Opportunities

Revenue streams and yield for participants in the Snowside network.

<div class="grid grid-cols-3 gap-6 mt-10">

<StakingRevenueCard
  title="Validator Staking"
  apy="BTC gas fees"
  note="Run a Snowside validator via NodΞRunr and earn a share of every transaction's BTC gas. Sovereign PoS with sub-second finality means consistent, predictable revenue."
/>

<StakingRevenueCard
  title="Miner BMM Yield"
  apy="Sidechain fees"
  note="Bitcoin miners commit to Snowside blocks through Blind Merged Mining — earn BTC fees from the sidechain with zero additional hashing cost. Pure incremental revenue on existing hash power."
/>

<StakingRevenueCard
  title="USDC Liquidity Provision"
  apy="Bridge fees + yield"
  note="Provide USDC liquidity via the ICM bridge from Avalanche C-Chain. Enable stablecoin commerce on Snowside and capture bridging fees plus DeFi yield opportunities."
/>

</div>

<p class="text-center mt-8 text-sm text-slate-400">
  Three ways to earn. Zero new tokens. All revenue denominated in <span class="text-snow-300 font-mono">BTC</span> or <span class="text-snow-300 font-mono">USDC</span>.
</p>

---
layout: snow-default
---

## Frequently asked questions

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">

**What is Snowside?**
An Avalanche L1 for Paul Sztorc's eCash hard-fork. BTC gas, USDC bridge, NodΞRunr automation.

**Is there a token?**
No. No token, no pre-mine, no ICO, no airdrop. The network runs on BTC and USDC only.

**How does BTC gas work?**
Bitcoin miners commit to Snowside blocks via BMM. Users pay gas in BTC. Miners earn the fees.

**How is USDC bridged?**
Trustlessly from Avalanche C-Chain via Interchain Messaging — a native Avalanche protocol, not a third-party bridge.

**How do I run a validator?**
Deploy via NodΞRunr — one-click setup, 24/7 monitoring, automatic updates.

**When does mainnet launch?**
Targeted for Month 3 of the roadmap, following Fuji testnet and security audits.

</div>

---
layout: snow-connect
---

# Connect with Us

<p class="lead">Open source. No token. Powered by Avalanche. Supported by the Bitcoin sidechain community.</p>

<div class="grid grid-cols-2 gap-6 mt-10 max-w-2xl mx-auto">

[📘 Read the Whitepaper](https://snowside.network/whitepaper.pdf)

[💻 View on GitHub](https://github.com/abitsuite/snowside)

[🐦 Follow on X](https://x.com/0xShomari)

[💬 Join our Discord](https://discord.gg/jVytngEWt)

[🌐 Visit snowside.network](https://snowside.network)

[🏃 Run a Validator](https://layer1.run)

</div>

<p class="mt-12 text-xs text-slate-500">
  Snowside is an independent open-source project. Not affiliated with or endorsed by the Avalanche Foundation beyond the retro9000 grant for NodΞRunr.
</p>
