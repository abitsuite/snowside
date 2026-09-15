# Snowside

[![Snowside — Interactive Tour](https://snowside.network/og-image-v2.png)](https://tour.snowside.network)

[![CI Suite](https://github.com/abitsuite/snowside/actions/workflows/guardian.yml/badge.svg?branch=master)](https://github.com/abitsuite/snowside/actions/workflows/guardian.yml)
[![Codecov](https://codecov.io/gh/abitsuite/snowside/branch/master/graph/badge.svg?token=CODECOV_TOKEN)](https://codecov.io/gh/abitsuite/snowside)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?logo=cloudflarepages&logoColor=white)](https://pages.cloudflare.com)

## What is Snowside?

Snowside is a dedicated Avalanche Layer-1 blockchain built for the eCash.com
hard-fork. It runs as a clean EVM sidechain where the native gas token is ECX —
no new tokens, no pre-mine, just eCash.com security via Blind Merged Mining
(BIP-301) on a Drivechain.

**[▶ Take a Tour →](https://tour.snowside.network)** — a guided, visual walkthrough of how Snowside works end to end.

## Key Features

- **Native ECX gas** — transaction fees paid in ECX via Blind Merged Mining (BIP-301)
- **Drivechain-native** — BIP-300/301 hash-rate escrows are first-class, not bolted on
- **Sub-second finality** — Avalanche Snowman consensus
- **USDC bridging** — native Interchain Messaging (ICM) from C-Chain
- **Full EVM compatibility** — Remix, Hardhat, Foundry work out-of-the-box
- **Operational automation** — [NodΞRunr](https://layer1.run) handles deployment & monitoring
- **No token. No ICO.** — infrastructure, not an investment vehicle

## Deployed Endpoints

All packages are deployed to Cloudflare Pages / Workers by the
[Guardian CI Suite](.github/workflows/guardian.yml) on every push to `master`.

| Package | URL | Description |
|---------|-----|-------------|
| `packages/web` | [snowside.network](https://snowside.network) | Main website (Astro) |
| `packages/pitch` | [pitch.snowside.network](https://pitch.snowside.network) | Grant pitch page (Astro, `noindex`) |
| `packages/canvas` | [canvas.snowside.network](https://canvas.snowside.network) | Lean Canvas viewer (Astro) |
| `packages/docs` | [docs.snowside.network](https://docs.snowside.network) | Technical documentation (Astro + Starlight) |
| `packages/explorer` | [explorer.snowside.network](https://explorer.snowside.network) | EVM block explorer (Astro + Pages Functions) |
| `packages/bridge` | [bridge.snowside.network](https://bridge.snowside.network) | BIP-300/301 bridge UI (Astro) |
| `packages/tour` | [tour.snowside.network](https://tour.snowside.network) | Interactive tour slideshow (Slidev) |
| `packages/api` | [snowside.network/v1](https://snowside.network/v1) | OpenAPI + Esplora proxy (Cloudflare Worker, Hono + Chanfana) |

### Network RPC Endpoints (Avalanche L1)

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Mainnet | 32904 (0x8088) | `https://rpc.snowside.network/mainnet` |
| Testnet | 33160 (0x8188) | `https://rpc.snowside.network/testnet` |
| Signet  | 33416 (0x8288) | `https://rpc.snowside.network/signet` |

## Documentation

- 📄 [Whitepaper (v0.4)](https://snowside.network/whitepaper.pdf) — 15-section technical paper (PDF, jsPDF-generated)
- 🌐 [Website](https://snowside.network) — landing page, value proposition, roadmap
- 📋 [Pitch Page](https://pitch.snowside.network) — grant pitch (`noindex, nofollow`)
- 🖼️ [Lean Canvas](https://canvas.snowside.network) — one-page business model canvas (PNG viewer + PDF download)
- 📚 [Technical Docs](https://docs.snowside.network) — architecture, BMM, gas model, ICM bridge, security model
- 🎬 [Interactive Tour](https://tour.snowside.network) — 12-slide walkthrough (Slidev)
- 🔍 [Block Explorer](https://explorer.snowside.network) — mainnet / testnet / signet
- 🌉 [Bridge](https://bridge.snowside.network) — deposits & withdrawals
- 🔌 [API (OpenAPI)](https://snowside.network/v1) — Swagger UI + spec at `/v1/openapi.json`
- 🔗 [Wallet Setup](https://docs.snowside.network/guides/connect-wallet/) — MetaMask/Rabby connection guide
- 📡 [Validator Onboarding](https://snowside.network/validators) — NodΞRunr deployment guide

## Repository Structure

The Snowside monorepo uses language-specific top-level directories:

```
packages/          — JavaScript/TypeScript (pnpm workspace)
  web/             — Main website (Astro)
  pitch/           — Grant pitch page (Astro, noindex)
  canvas/          — Lean Canvas viewer (Astro static)
  docs/            — Documentation site (Astro + Starlight)
  explorer/        — EVM block explorer (Astro + CF Pages Functions)
  bridge/          — Bridge UI (Astro + Tailwind v4)
  api/             — Cloudflare Worker (Hono + Chanfana OpenAPI)
  tour/            — Interactive slideshow (Slidev + UnoCSS)
  federation/      — Custodial federation service (Node.js + viem)

go/                — Go packages
  subnet-evm/      — Subnet-EVM fork with BMM coordination precompile

rust/              — Rust packages
  bmm-bidder/      — BMM bidder and settlement monitor

contracts/         — Solidity smart contracts (Foundry)
  src/interfaces/  — Solidity interfaces for precompiles
  src/peg/          — ECX peg contract (deposits/withdrawals)
  src/fees/         — Contract fee distribution
  test/             — Foundry tests
  script/           — Deployment scripts

genesis/           — L1 genesis JSON files (patched per network)

docs/              — Documentation and handoff notes (HANDOFF.md)
```

## CI/CD

The [Guardian CI Suite](.github/workflows/guardian.yml) runs on every push/PR
to `master`. Each package has its own labeled build job (quality gate) and a
deploy job that gates on the build — deploys run only on merged `master`
commits (PRs build but never deploy). All 7 Cloudflare Pages packages are
disconnected from CF Pages git integration, so **this workflow is the sole
deploy path**.

Coverage reporting is configured via [Codecov](codecov.yml) with
`informational: true` status (never fails CI on coverage drops). Test suites
are being added incrementally — the API Worker has the first suite
(`packages/api/test/`); coverage uploads will slot into the existing build
jobs as each package gains tests.

### Required GitHub Secrets

| Secret | Used by |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | All 8 deploy jobs (`Pages:Edit` + `Workers Scripts:Edit`) |
| `CLOUDFLARE_ACCOUNT_ID` | All 8 deploy jobs |
| `CODECOV_TOKEN` | Coverage upload steps (active once tests exist per package) |

## Build

| Package | Build Command |
|---------|-------------|
| web | `cd packages/web && pnpm build` |
| pitch | `cd packages/pitch && pnpm build` |
| canvas | `cd packages/canvas && pnpm build` |
| docs | `cd packages/docs && pnpm build` |
| explorer | `cd packages/explorer && pnpm build` |
| bridge | `cd packages/bridge && pnpm build` |
| tour | `cd packages/tour && pnpm build` |
| api | `cd packages/api && pnpm run deploy --dry-run` |
| subnet-evm | `cd go/subnet-evm && ./scripts/build.sh` |
| bmm-bidder | `cd rust/bmm-bidder && cargo build` |
| contracts | `cd contracts && forge build` |
| root (web→pitch→canvas) | `pnpm run build` |

## Status

**Active development.** Mainnet L1 infrastructure in progress; ICTT (USDC
bridging) is the next milestone.

## Links

- Website: [snowside.network](https://snowside.network)
- Docs: [docs.snowside.network](https://docs.snowside.network)
- Explorer: [explorer.snowside.network](https://explorer.snowside.network)
- Bridge: [bridge.snowside.network](https://bridge.snowside.network)
- Tour: [tour.snowside.network](https://tour.snowside.network)
- API: [snowside.network/v1](https://snowside.network/v1)
- NodΞRunr (operational tooling): [layer1.run](https://layer1.run)
- GitHub: [abitsuite/snowside](https://github.com/abitsuite/snowside)
- X / Twitter: [@0xShomari](https://x.com/0xShomari)
- Discord: [discord.gg/jVytngEWt](https://discord.gg/jVytngEWt)
- Email: [shomari@abitsuite.com](mailto:shomari@abitsuite.com)

## License

Released under the [MIT License](LICENSE). Snowside is open source —
free to use, modify, and distribute. No token, no ICO, no warranty.

<img src="https://snowside.network/favicon.svg" alt="Snowside" width="64" height="64" />
