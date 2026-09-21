---
# packages/tour/slides.md
theme: none
title: Bitcoin Security at Avalanche Speed
titleTemplate: '%s'
info: |
  Bitcoin Security at Avalanche Speed
  The eCash Sidechain on Avalanche. Native ECX gas, USDC bridging.
highlighter: shiki
mdc: true
fonts:
  sans: Inter
  mono: JetBrains Mono
lineNumbers: false
colorSchema: dark
favicon: /favicon.svg
# Custom styles auto-loaded by Slidev from styles/index.css
# (Slidev discovers styles/index.{ts,js,css} or styles.css/style.css at root)
# Simple Analytics + OG meta injected post-build by scripts/inject-head.mjs
# (Slidev's `head:` frontmatter renders client-side only, not in initial HTML.)
layout: snow-cover
class: text-center
---

<div class="cover-kicker">SNOWSIDE — TOUR</div>

<!-- On-screen banner: the simple web OG poster -->
<img src="/cover-banner.png" alt="Bitcoin Security at Avalanche Speed" class="cover-banner" />

<h1 class="cover-tagline">Bitcoin Security at Avalanche Speed</h1>
<p class="cover-subtitle">The eCash Sidechain on Avalanche. Native ECX gas. Instant USDC bridging.</p>

---
layout: snow-default
---

## What Is Snowside?

A dedicated Avalanche Layer-1 blockchain built to host Paul Sztorc's upcoming eCash hard-fork. It runs as a clean EVM sidechain where the **native gas token is ECX** — no new tokens, no pre-mine, just eCash security via blind merged mining.

<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">

<div class="snow-card">
  <div class="snow-card-kicker">01 — Gas</div>
  <h3>Native ECX gas</h3>
  <p>Fees paid in ECX via BIP-301 blind merged mining.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">02 — Finality</div>
  <h3>Sub-second finality</h3>
  <p>Avalanche Snowman consensus settles in under a second.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">03 — Bridge</div>
  <h3>USDC bridging</h3>
  <p>Native Interchain Messaging from the Avalanche C-Chain.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">04 — EVM</div>
  <h3>Full EVM</h3>
  <p>Remix, Hardhat, Foundry work out-of-the-box.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">05 — Validation</div>
  <h3>Community-run validators</h3>
  <p>Community-operated validator set with low operational cost.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">06 — Token</div>
  <h3>No token. No ICO.</h3>
  <p>Infrastructure, not an investment vehicle.</p>
</div>

</div>

---
layout: snow-default
---

## Two Native Assets, Zero Friction

Bridging eCash and stablecoin economies in one network.

<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">

<div class="snow-card">
  <div class="snow-card-kicker">Asset 01</div>
  <h3>⚡ Native ECX Gas</h3>
  <p>Transaction fees paid in real ECX via blind merged mining. No new token, no pre-mine, no inflation.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">Asset 02</div>
  <h3>🌉 USDC Bridging</h3>
  <p>Avalanche Interchain Messaging (ICM) bridges USDC from the C-Chain natively. Stable liquidity from day one.</p>
</div>

</div>

<p class="text-center mt-8 text-slate-400 text-sm">
  <strong class="text-snow-300">No competing token.</strong> Just ECX for gas and USDC for liquidity.
</p>

---
layout: snow-default
---

## How It Works

Four layers of technology, one cohesive sidechain.

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-sm">

<div class="snow-card">
  <div class="snow-card-kicker">01</div>
  <h3>BMM</h3>
  <p>eCash miners commit to Snowside blocks without running them. They earn ECX fees while securing the chain with existing hash power.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">02</div>
  <h3>Avalanche L1</h3>
  <p>A dedicated validator set runs Snowside with sub-second finality. Validators are community-operated.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">03</div>
  <h3>ECX Gas Flow</h3>
  <p>Users pay gas in ECX. Miners collect fees through BMM commitments. The loop closes entirely within eCash.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">04</div>
  <h3>ICM USDC Bridge</h3>
  <p>Avalanche ICM trustlessly bridges USDC from the C-Chain — no third-party bridges, no wrapped assets.</p>
</div>

</div>

---
layout: snow-default
---

## Why Avalanche Is the Perfect Substrate

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 text-sm">

<div class="snow-card">
  <div class="snow-card-kicker">01</div>
  <h3>Sovereign validation</h3>
  <p>Snowside runs its own validators, ensuring dedicated throughput for eCash operations.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">02</div>
  <h3>Native interoperability</h3>
  <p>Avalanche ICM allows trust-less bridging of USDC from the C-Chain without third-party bridges.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">03</div>
  <h3>Low operational cost</h3>
  <p>Avalanche9000's subscription model makes community-run validation cheap and feasible.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">04</div>
  <h3>Tooling maturity</h3>
  <p>Full EVM compatibility — Remix, Hardhat, The Graph, Foundry all work out-of-the-box.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">05</div>
  <h3>Proven L1 track record</h3>
  <p>Multiple Avalanche L1s are already live in production. The infrastructure is battle-tested.</p>
</div>

</div>

---
layout: snow-default
---

## Agentic Payments

Snowside's low-fee ECX gas and native USDC bridging make it ideal for autonomous, machine-to-machine payments.

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 text-sm">

<div class="snow-card">
  <div class="snow-card-kicker">Protocol</div>
  <h3>x402</h3>
  <p>An open payment protocol built on the HTTP 402 <em>Payment Required</em> status code. Agents pay per-request, natively over HTTP — no gateways, no intermediaries.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">Settlement</div>
  <h3>USDC, low fees</h3>
  <p>Stablecoin settlement via native ICM USDC. Sub-cent transaction fees and no price volatility — predictable per-call economics for agents.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">Autonomy</div>
  <h3>Machines pay machines</h3>
  <p>Autonomous AI agents discover, negotiate, and pay for services without human-in-the-loop approvals or custodial wallets.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">Finality</div>
  <h3>Instant settlement</h3>
  <p>Sub-second Avalanche finality means a payment is confirmed before the response is served — no waiting on block confirmations.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">Composability</div>
  <h3>Full EVM</h3>
  <p>x402 payment flows compose with any EVM contract — escrows, streaming, programmable spend policies — all on one chain.</p>
</div>

<div class="snow-card">
  <div class="snow-card-kicker">No token tax</div>
  <h3>ECX, not a toll token</h3>
  <p>Gas is paid in ECX. No protocol token skim on every agent transaction — just the eCash security fee.</p>
</div>

</div>

---
layout: snow-default
---

## How Snowside Compares

Snowside vs. Lightning Network vs. Base

<ComparisonTable />

---
layout: snow-default
---

## Risks & Mitigations

<RiskMitigation />

---
layout: snow-default
---

## From Devnet to Mainnet and Beyond...

<RoadmapTimeline />

---
layout: snow-default
---

## Opportunities

Revenue streams and yield for participants in the Snowside network.

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">

<StakingRevenueCard
  title="Validator Staking"
  apy="ECX gas fees"
  note="Run a Snowside validator and earn a share of every transaction's ECX gas. Sovereign PoS with sub-second finality means consistent, predictable revenue."
/>

<StakingRevenueCard
  title="Miner BMM Yield"
  apy="Sidechain fees"
  note="eCash miners commit to Snowside blocks through Blind Merged Mining — earn ECX fees from the sidechain with zero additional hashing cost. Pure incremental revenue on existing hash power."
/>

<StakingRevenueCard
  title="USDC Liquidity Provision"
  apy="Bridge fees + yield"
  note="Provide USDC liquidity via the ICM bridge from Avalanche C-Chain. Enable stablecoin commerce on Snowside and capture bridging fees plus DeFi yield opportunities."
/>

</div>

<p class="text-center mt-8 text-sm text-slate-400">
  Three ways to earn. Zero new tokens. All revenue denominated in <span class="text-snow-300 font-mono">ECX</span> or <span class="text-snow-300 font-mono">USDC</span>.
</p>

---
layout: snow-default
---

## Frequently Asked Questions

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-sm">

<div class="snow-card">
  <h3>What is Snowside?</h3>
  <p>An Avalanche L1 for Paul Sztorc's eCash hard-fork. ECX gas, USDC bridge, community-run validators.</p>
</div>

<div class="snow-card">
  <h3>Is there a token?</h3>
  <p>No. No token, no pre-mine, no ICO, no airdrop. The network runs on ECX and USDC only.</p>
</div>

<div class="snow-card">
  <h3>How does ECX gas work?</h3>
  <p>eCash miners commit to Snowside blocks via BMM. Users pay gas in ECX. Miners earn the fees.</p>
</div>

<div class="snow-card">
  <h3>How is USDC bridged?</h3>
  <p>Trustlessly from Avalanche C-Chain via Interchain Messaging — a native Avalanche protocol, not a third-party bridge.</p>
</div>

<div class="snow-card">
  <h3>How do I run a validator?</h3>
  <p>Deploy via NodΞRunr — one-click setup, 24/7 monitoring, automatic updates.</p>
</div>

<div class="snow-card">
  <h3>When does mainnet launch?</h3>
  <p>Targeted for the Mainnet phase of the roadmap, following Betanet and security audits.</p>
</div>

</div>

---
layout: snow-connect
---

# Connect with Us

<p class="lead">Open source. No token. Powered by Avalanche. Supported by the eCash sidechain community.</p>

<div class="connect-grid">

<a class="snow-btn" href="https://snowside.network/whitepaper.pdf">📘 Read the Whitepaper</a>
<a class="snow-btn" href="https://github.com/abitsuite/snowside">💻 View on GitHub</a>
<a class="snow-btn" href="https://x.com/0xShomari">🐦 Follow on X</a>
<a class="snow-btn" href="https://discord.gg/jVytngEWt">💬 Join our Discord</a>
<a class="snow-btn" href="https://snowside.network">🌐 Visit snowside.network</a>
<a class="snow-btn" href="https://layer1.run">🏃 Run a Validator</a>

</div>

<p class="connect-footer">
  Snowside is an independent open-source project.<br />
  Not affiliated with or endorsed by the Avalanche Foundation.<br />
  Powered by Avalanche. Secured by eCash. Open to all.
</p>
