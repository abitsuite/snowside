# Snowside Handoff — 2026-08-10 (Session 6, Testnet Deployment)

## Purpose
Snowside is an Avalanche L1 sidechain project requesting eCash Drivechain ID #88. The monorepo at `/Workspace/abitsuite/snowside` includes a landing page (`snowside.network`), a pitch page (`pitch.snowside.network`), and a docs site (`docs.snowside.network`), alongside the L1 execution layer (`go/subnet-evm`), BMM bidder (`rust/bmm-bidder`), and core contracts (`contracts/`).

## Monorepo structure

    snowside/
    ├── AGENTS.md
    ├── package.json          # pnpm workspace root
    ├── pnpm-workspace.yaml   # packages: ['packages/*']
    ├── .gitignore
    ├── docs/                 # Session handoffs + meta docs
    │   ├── HANDOFF.md
    │   └── TESTNET-DEPLOYMENT.md
    ├── packages/
    │   ├── web/  # Astro static — Landing + Whitepaper v0.3 + /validators (snowside.network)
    │   ├── pitch/ # Astro static — Pitch page (pitch.snowside.network) — noindex,nofollow
    │   └── docs/ # Astro Starlight — Technical docs (docs.snowside.network)
    ├── go/
    │   └── subnet-evm/ # Subnet-EVM fork with BMM coordination precompile (Go)
    ├── rust/
    │   └── bmm-bidder/ # BMM bidder and settlement monitor (Rust)
    └── contracts/ # Solidity smart contracts (Foundry)

## Session 6 summary — 2026-08-10

### Task 1: Testnet Infrastructure Setup
- VPS provisioned at rpc.snowside.network with Ubuntu 24.04.
- Avalanche-CLI installed and operational.
- Nginx reverse proxy configured to route /testnet, /mainnet, /signet to local Avalanche RPC endpoints.
- Cloudflare DNS configured for rpc.snowside.network pointing to VPS IP.
- Resolved AvalancheGo "invalid host specified" 403 error by overriding `Host` header to `127.0.0.1` in Nginx proxy config.
- Resolved HTTP/2 compatibility by adding `http2` to Nginx `listen 443` directives.

### Task 2: SnowsideTestnet L1 Deployment
- Deployed Snowside Testnet (Chain ID: 33160 / 0x8188) to local network via `avalanche blockchain deploy SnowsideTestnet --local`.
- Blockchain ID: `2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe`
- Subnet ID: `wNWS35thzJy9fGaxtVfPwFKEt2RU2r9fMGA7c5A9XqqSvBCVj`
- VM ID: `dk9HWWWW1YGFGWfkXjDB6qaRh9UFjLAdahZS9qAyXKn5x1GnH`
- RPC Endpoint (local): `http://127.0.0.1:9656/ext/bc/2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe/rpc`
- RPC Endpoint (public): `https://rpc.snowside.network/testnet`
- Token Symbol: `ECX` (Token Name: ECX Token)
- Consensus: Proof of Authority (PoA)
- ICM Messenger Address: `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`
- ICM Registry Address: `0xB8e71012d3F55D9EbbFf74376dE180702c1D8A6F`
- PoA Validator Manager: `0x0C0DEbA5E0000000000000000000000000000000`
- Validator Transparent Proxy: `0x0Feedc0de0000000000000000000000000000000`
- Funded account (ewoq): `0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC` (1,000,000 ECX)
- Primary nodes: NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg (port 9650), NodeID-MFrZFVCXPv5iCn6M9K6XduxGTYp891xXZ (port 9652)
- L1 node: NodeID-MZ51J52kjmn9T67Fyd2JyTvpQ8vNzAMZ4 (port 9656)
- Relayer not deployed (sidecar subnet "snowside" does not exist — non-critical for L1 operations).

### Task 3: Remaining Network Specs
- Mainnet spec created locally (Chain ID: 32904 / 0x8088) — not yet deployed.
- Signet spec created locally (Chain ID: 33352 / 0x8288) — not yet deployed.
- Nginx /mainnet and /signet routes currently point to old Blockchain ID (placeholder).

## Build status — all packages pass

| Package | Status |
|---------|--------|
| packages/web | ✅ |
| packages/pitch | ✅ |
| packages/docs | ✅ |
| go/subnet-evm | ✅ (using ./scripts/build.sh) |
| rust/bmm-bidder | ✅ |
| contracts | ✅ |

## Next session: Continue L1 Development

The Testnet is live and accessible at https://rpc.snowside.network/testnet.
Next steps include:
1. BMM coordination precompile implementation in go/subnet-evm/
2. BMM bidder RPC implementation in rust/bmm-bidder/
3. Smart contract implementation in contracts/
4. Deploy Mainnet and Signet specs to local network
5. Deploy relayer once subnet naming is resolved

## Outstanding tasks

### Subnet-EVM precompile implementation (go/subnet-evm/)
- Study the existing precompile architecture in Subnet-EVM
- Implement the BMM coordination precompile in Go
- Add precompile registration in the chain configuration
- Write unit tests for the precompile

### BMM bidder implementation (rust/bmm-bidder/)
- Implement eCash RPC client
- Implement Snowside RPC client (eth_call for precompile reads)
- Implement BMM Request transaction construction
- Implement settlement monitoring loop
- Implement configuration loading

### Smart contract implementation (contracts/)
- Implement Peg contract (deposit claiming, withdrawal initiation)
- Implement FeeDistribution contract
- Write comprehensive Foundry tests

### Network deployment
- Deploy Mainnet spec (32904) to local network
- Deploy Signet spec (33352) to local network
- Update Nginx routes for /mainnet and /signet with correct Blockchain IDs
- Deploy relayer using `avalanche interchain relayer deploy`

### Image placeholders (still need real images)
- Hero.astro — commented-out hero illustration placeholder
- WhyAvalanche.astro — 6th card is a dashed-border placeholder for architecture diagram
- NodeRunr.astro — surface-1 card placeholder for NodΞRunr dashboard / terminal screenshot

### Open Whitepaper Questions (from v0.3 plan, items 21-23)
- Contract Fee: Optional or required? (Currently says "required on EVM calls")
- Vesting Schedule: Still intended? (50% → 80% over 18 months)
- Validator Distribution: 50% equal / 50% proportional still intended? Sybil mitigation plan?

## Key learnings (all sessions)
1. **@tailwindcss/vite** breaks on Cloudflare's rolldown-vite — always use **@tailwindcss/postcss**
2. **Starlight auto-injects ALL components** in `.md` files — never add import statements
3. **Starlight Item** component is auto-injected for `.md` only, not `.mdx`
4. **pnpm 10** ignores build scripts for native deps unless approved in `pnpm.onlyBuiltDependencies`
5. **Heredoc + triple backticks** conflict — use 4-space indented code blocks or unique delimiters
6. **Never commit node_modules** — verify `.gitignore` before first `git add -A`
7. **Favicon dark backdrop required** — white snowmen on transparent SVG vanish in light browser themes
8. **Two snowmen = "88"** — stacked-circle silhouette naturally reads as "88" for Drivechain ID branding
9. **Landing page contrast** — alternate dark/light sections; use theme tokens, not raw gray-*
10. **OG images** — generate externally via AI agent; 1200×630 PNG; use versioned filenames for cache-busting
11. **Static multi-page hash links** — `#about` resolves to current page; must use `/#about` for cross-page navigation
12. **Astro `<script is:inline>`** — required for external analytics scripts; without it Astro bundles/processes the tag
13. **Pitch isolation** — `noindex,nofollow` meta + zero inbound links from web = unreachable to crawlers
14. **Simple Analytics** — standard embed works across Astro layouts and Starlight head config without modification
15. **Snowball vs Snowman** — "Snowball" is the broader protocol family; "Snowman" is the linear-chain variant used by Avalanche L1s. Always use "Snowman" for Snowside's consensus.
16. **eCash vs Bitcoin** — Snowside is secured by eCash's PoW, not Bitcoin's directly. Always refer to "eCash miners" and "eCash L1" unless discussing Bitcoin's broader economic model.
17. **Terminal heredocs garble** — Multi-file pastes frequently corrupt in the terminal. ALWAYS run `wc -l <file>` and `tail -n 15 <file>` to verify files were written correctly before assuming a failure.
18. **PDF cache vs HTML cache** — Cloudflare may serve stale HTML for `/whitepaper/` while `/whitepaper.pdf` updates. Cache purge may be required after whitepaper version bumps.
19. **Mutable Aggregates** — BMM settlement allows proposers to grow their Merkle root payload during pending settlement. No timeout releases fees without successful settlement.
20. **Two-phase roadmap** — Phase 3 (AVAX phase-out) was removed from the whitepaper as speculative. The roadmap is now a two-phase model: Phase 1 (Permissioned) and Phase 2 (Permissionless with AVAX + BTC).
21. **Go Versioning** — Subnet-EVM requires Go 1.21+. Ubuntu 22.04 ships with an older Go version; manual installation of Go 1.23.12 was required.
22. **Subnet-EVM Build Tool** — The upstream Subnet-EVM repo no longer ships a `Makefile`. Build using `./scripts/build.sh` or `task build`.
23. **AvalancheGo Host Header Security** — AvalancheGo rejects requests where the `Host` header does not match local addresses (DNS rebinding protection). When proxying via Nginx, override `proxy_set_header Host 127.0.0.1` to bypass this security check.
24. **Avalanche-CLI Naming Convention** — Blockchain specs must use letters only (no hyphens, underscores, numbers). Use PascalCase or camelCase for unique names (e.g., SnowsideTestnet, not snowside-testnet).

## Session history (prior sessions)

### Session 1 (2026-07-17)
1. Deleted `apps/web` (old abandoned Astro version)
2. Converted `packages/web` from React/Vite to Astro (11 components, Base layout, global.css)
3. Created full whitepaper (15 sections, 6 vector figures, jsPDF endpoint)
4. Created `packages/pitch` scaffolding
5. Installed all dependencies via `pnpm install`
6. Fixed unterminated string in `content.ts` line 117

### Session 2 (2026-07-17)
1. Fixed git: node_modules committed accidentally (added .gitignore, git rm --cached, amended commit)
2. Fixed @tailwindcss/vite incompatibility (switched to @tailwindcss/postcss in web + pitch)
3. Added pnpm.onlyBuiltDependencies to root package.json (esbuild, sharp)
4. Created pitch page (10 sections, FAQ accordion)
5. Removed PDF.js demo file
6. Replaced Starlight template with real Snowside documentation (12 pages)
7. Fixed Starlight social icon (x → x.com) and index.mdx → index.md

### Session 3 (2026-07-17)
1. Fixed docs index.md import issue (Starlight auto-injects components)
2. Landing page contrast overhaul + Footer rewrite (14 files)
3. OG image generation prompt provided
4. Dual-snowman 88 favicon deployed to all 3 packages
5. OG image cache-bust (og-image-v2.png)
6. retro9000 grant link added across 3 packages

### Session 4 (2026-07-17 to 2026-07-21)
1. Nav button + Whitepaper link cleanup
2. Team section improvements (retro9000 badge, removed false claims)
3. Roadmap fix (5 trusted community validators)
4. CTA section update (Discord, /validators)
5. /validators page (new)
6. Footer reorganization
7. Hero title increase
8. Multi-page Nav link fix (/# prefixes)
9. Pitch noindex
10. Simple Analytics
11. AGENTS.md + HANDOFF.md update (first pass)
12. Whitepaper v0.2 — 6 architectural updates
13. Whitepaper v0.3 — 20 architectural updates (Snowman terminology, Rollup-Style Settlement, BMM precompile details, Two-phase roadmap)

### Session 5 (2026-07-26)
1. Monorepo restructuring (go/, rust/, contracts/ top-level dirs)
2. Subnet-EVM fork scaffolded from ava-labs/subnet-evm
3. BMM bidder binary crate scaffolded in Rust
4. Foundry contracts scaffolded with IBMMCoordination interface
5. Updated build commands to use ./scripts/build.sh for subnet-evm
6. Created docs/TESTNET-DEPLOYMENT.md with Post-Etna hardware requirements

### Session 6 (2026-08-10)
1. VPS provisioned and configured with Nginx reverse proxy
2. Cloudflare DNS configured for rpc.snowside.network
3. Resolved AvalancheGo DNS rebinding protection (Host header override)
4. Resolved Nginx HTTP/2 compatibility
5. Deployed SnowsideTestnet L1 (Chain ID: 33160) to local network
6. Created Mainnet (32904) and Signet (33352) specs — not yet deployed
7. Public RPC endpoint verified: https://rpc.snowside.network/testnet

## Key file inventory

### packages/web (Astro)
    packages/web/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/
    │   ├── favicon.svg              # dual-snowman 88
    │   ├── icons.svg
    │   ├── og-image-v2.png          # 1200×630, generated externally
    │   └── pdfjs/
    └── src/
        ├── styles/global.css        # body bg surface-0
        ├── layouts/Base.astro       # OG image: /og-image-v2.png, Simple Analytics
        ├── pages/
        │   ├── index.astro          # landing page
        │   ├── whitepaper.astro      # PDF viewer
        │   ├── whitepaper.pdf.ts     # jsPDF endpoint (renders v0.3)
        │   └── validators.astro      # validator onboarding page
        ├── components/
        │   ├── Nav.astro            # /# hash links, /whitepaper button
        │   ├── Hero.astro           # title text-5xl/7xl, button says "Read the Whitepaper"
        │   ├── About.astro
        │   ├── WhyAvalanche.astro
        │   ├── ValueProposition.astro
        │   ├── NodeRunr.astro
        │   ├── ECash.astro
        │   ├── Team.astro           # retro9000 SVG logo, no false claims, no grant application
        │   ├── Roadmap.astro        # 5 trusted community validators
        │   ├── CTA.astro           # /validators + Discord, no pitch link, no Team1 button
        │   └── Footer.astro         # Discord in Contact, Docs+GitHub first in Resources
        ├── data/whitepaper/
        │   ├── types.ts
        │   ├── meta.ts              # WHITEPAPER_VERSION = '0.3'
        │   ├── content.ts           # 481 lines, 15 sections, v0.3
        │   └── figures/
        │       ├── architecture-diagram.ts    # Section 3 (v0.3: eCash L1 labels)
        │       ├── bmm-flow.ts                # Section 4 (v0.3: eCash Miners labels)
        │       ├── gas-flow.ts                # Section 5
        │       ├── fee-model.ts               # Section 5 (v0.2)
        │       ├── role-separation.ts         # Section 4 (v0.2)
        │       ├── icm-bridge.ts              # Section 6
        │       ├── consensus-layers.ts        # Section 8 (v0.3: eCash block labels)
        │       ├── validator-economics.ts     # Section 9 (v0.2 economics)
        │       └── permissionless-roadmap.ts  # Section 12 (v0.3: 2-phase model)
        └── fonts/

### packages/pitch (Astro)
    packages/pitch/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/favicon.svg           # dual-snowman 88
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro       # noindex,nofollow + Simple Analytics
        ├── components/
        │   ├── Nav.astro
        │   └── Footer.astro
        └── pages/
            └── index.astro          # pitch page

### packages/docs (Astro Starlight)
    packages/docs/
    ├── astro.config.mjs             # head: Simple Analytics script + noscript
    ├── package.json
    ├── tsconfig.json
    ├── public/favicon.svg           # dual-snowman 88
    └── src/
        ├── content.config.ts
        └── content/docs/
            ├── index.md
            ├── architecture/         # 6 pages
            ├── guides/              # 3 pages
            └── reference/            # 2 pages

### go/subnet-evm (Go)
    go/subnet-evm/
    ├── README.md
    ├── .upstream-commit
    ├── Taskfile.yml
    ├── scripts/
    │   └── build.sh
    ├── go.mod
    ├── go.sum
    ├── cmd/
    ├── contract/
    ├── contracts/
    ├── eth/
    ├── evm/
    ├── genesis/
    ├── plugin/
    └── precompile/

### rust/bmm-bidder (Rust)
    rust/bmm-bidder/
    ├── Cargo.toml
    ├── config.example.toml
    ├── README.md
    └── src/
        └── main.rs                  # CLI skeleton (run, status, submit)

### contracts (Solidity / Foundry)
    contracts/
    ├── foundry.toml
    ├── README.md
    ├── src/
    │   ├── interfaces/
    │   │   └── IBMMCoordination.sol # BMM coordination interface
    │   ├── peg/
    │   │   └── Peg.sol              # BIP300 deposit/withdrawal placeholder
    │   └── fees/
    │       └── FeeDistribution.sol  # Fee split logic placeholder
    ├── test/
    │   └── interfaces/
    │       └── IBMMCoordination.t.sol
    └── script/

### Testnet Deployment
    docs/TESTNET-DEPLOYMENT.md       # Deployment guide with Post-Etna hardware requirements
    # VPS: rpc.snowside.network
    # Chain ID: 33160 (0x8188)
    # Blockchain ID: 2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe
    # RPC: https://rpc.snowside.network/testnet
    # Token: ECX

---
*Generated at end of Session 6. Next session: Continue L1 Development (precompile implementation, BMM bidder RPC, smart contracts). Maintained per AGENTS.md.*
