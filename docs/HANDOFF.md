# Snowside Handoff — 2026-08-10 (Session 8, Docs Update & Explorer MVP)

## Purpose
Snowside is an Avalanche L1 sidechain project requesting eCash Drivechain ID #88. The monorepo at `/Workspace/abitsuite/snowside` includes a landing page (`snowside.network`), a pitch page (`pitch.snowside.network`), docs (`docs.snowside.network`), and a block explorer (`explorer.snowside.network`), alongside the L1 execution layer (`go/subnet-evm`), BMM bidder (`rust/bmm-bidder`), and core contracts (`contracts/`).

## Session 8 summary — 2026-08-10

### Task 1: Documentation Update (Connect Web3 Wallet)
- Added `guides/connect-wallet.md` to `packages/docs`.
- Included Mainnet, Testnet, and Signet details (RPC URLs, Chain IDs in Decimal/Hex, Currency Symbol).
- Added Block Explorer URLs (subdomain-specific).
- Fixed Markdown table syntax (escaped `|` as `\|` to prevent column breaks).
- Added page to Starlight sidebar via `astro.config.mjs`.

### Task 2: Package Upgrades & pnpm Fixes
- Upgraded Astro to `7.2.0` across `packages/web`, `packages/pitch`, `packages/docs`, `packages/explorer`.
- Fixed pnpm v10 warning by moving `onlyBuiltDependencies` from root `package.json` to `pnpm-workspace.yaml`.
- **CRITICAL FIX:** Synced `pnpm-lock.yaml` and pushed it. Cloudflare `--frozen-lockfile` was failing because previous commits updated `package.json` but left the lockfile stale. `pnpm-lock.yaml` MUST be committed with dependency changes.

### Task 3: Block Explorer MVP (`packages/explorer`)
- Scaffolded lightweight Astro static site for block exploration.
- Implemented multi-network support using Astro dynamic routes (`src/pages/[network]/index.astro`).
- Architecture: Separate subdomains (`explorer.snowside.network`, `explorer-testnet.snowside.network`, `explorer-signet.snowside.network`).
- Added `functions/_middleware.js` to handle subdomain routing via Cloudflare Pages Functions. The middleware intercepts subdomains and rewrites root `/` to the correct static path (`/testnet/`, `/signet/`).
- Copied favicon and OG image into `packages/explorer/public`.
- Updated root `index.astro` to render Mainnet directly at `/` (removed the 301 redirect to `/mainnet/`).
- Updated navigation links to point directly to the subdomains.
- Temporarily used raw CSS instead of Tailwind due to a Tailwind v4 `ENOENT` build error during scaffolding.

## Monorepo structure

    snowside/
    ├── AGENTS.md
    ├── package.json          # pnpm workspace root
    ├── pnpm-workspace.yaml   # packages: ['packages/*'], onlyBuiltDependencies: [esbuild, sharp]
    ├── .gitignore
    ├── docs/                 # Session handoffs + meta docs
    │   ├── HANDOFF.md
    │   └── TESTNET-DEPLOYMENT.md
    ├── packages/
    │   ├── web/  # Astro static — Landing + Whitepaper v0.3 + /validators
    │   ├── pitch/ # Astro static — Pitch page — noindex,nofollow
    │   ├── docs/ # Astro Starlight — Technical docs + Wallet Guide
    │   └── explorer/ # Astro static — Block explorer MVP + CF Pages Functions
    ├── go/
    │   └── subnet-evm/ # Subnet-EVM fork with BMM coordination precompile (Go)
    ├── rust/
    │   └── bmm-bidder/ # BMM bidder and settlement monitor (Rust)
    └── contracts/ # Solidity smart contracts (Foundry)

## Build status — all packages pass

| Package | Status |
|---------|--------|
| packages/web | ✅ |
| packages/pitch | ✅ |
| packages/docs | ✅ |
| packages/explorer | ✅ |
| go/subnet-evm | ✅ (using ./scripts/build.sh) |
| rust/bmm-bidder | ✅ |
| contracts | ✅ |
| L1 Networks (Mainnet, Testnet, Signet) | ✅ |

## Next session: Explorer UI Overhaul

**NEXT-YOU:** Focus exclusively on updating the UI for `packages/explorer`.
1. **Header/Footer:** Create a shared layout with a Header and Footer matching the `snowside.network` brand (use `packages/web/src/layouts/Base.astro` and Footer/Nav components as reference).
2. **Navigation:** Add standard block explorer navigation (Blocks, Transactions, Addresses).
3. **Search Feature:** Implement a basic search bar that can resolve Block Numbers, Tx Hashes, and Address via EVM RPC (can be static JS fetch to the RPC endpoint).
4. **Tailwind Migration:** Migrate `packages/explorer/src/styles/global.css` back to Tailwind v4 (`@import 'tailwindcss'`) and fix the PostCSS `ENOENT` issue if it persists.
5. **Action Required on Cloudflare (User):** Ensure `explorer-testnet` and `explorer-signet` CNAMEs are added and bound to the Cloudflare Pages project so the `_middleware.js` subdomain routing works in production.

## Outstanding tasks

### Explorer (`packages/explorer`)
- Migrate to Tailwind v4.
- Add Header, Footer, and Navigation.
- Implement Search functionality (Block/Tx/Address).
- Display basic block/tx lists.

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

### Image placeholders (still need real images)
- Hero.astro — commented-out hero illustration placeholder
- WhyAvalanche.astro — 6th card is a dashed-border placeholder for architecture diagram
- NodeRunr.astro — surface-1 card placeholder for NodΞRunr dashboard / terminal screenshot

## Key learnings (all sessions)
1. **@tailwindcss/vite** breaks on Cloudflare's rolldown-vite — always use **@tailwindcss/postcss**
2. **Starlight auto-injects ALL components** in `.md` files — never add import statements
3. **Starlight Item** component is auto-injected for `.md` only, not `.mdx`
4. **pnpm 10** ignores build scripts for native deps unless approved in `pnpm-workspace.yaml` under `onlyBuiltDependencies`.
5. **Heredoc + Triple Backticks** conflict — use 4-space indented code blocks or unique delimiters
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
25. **Never make the user ask for CLI commands** — ALWAYS output commands in a single terminal-ready code block. NEVER make the user ask.
26. **pnpm-lock.yaml sync** — When changing dependencies (e.g., package.json), you MUST explicitly run `git add pnpm-lock.yaml` and commit it. Cloudflare uses `--frozen-lockfile` and will fail if the lockfile is missing or out of date.
27. **Markdown table pipes** — If a cell needs a literal `|` character, escape it as `\|` to prevent column breaking.
28. **Cloudflare Pages Subdomains** — You can route multiple subdomains to the same Cloudflare Pages project by adding a `functions/_middleware.js` file. The middleware inspects `request.headers.get('host')` and can rewrite the URL to serve different static files (e.g., `/testnet/index.html`) while keeping the subdomain URL intact in the browser.

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

### Session 7 (2026-08-10)
1. Deployed SnowsideMainnet (Chain ID: 32904) to local network
2. Deployed SnowsideSignet (Chain ID: 33352) to local network
3. Updated Nginx configuration with correct Blockchain IDs for all 3 networks
4. Verified all 3 public RPC endpoints return correct Chain IDs
5. Rabby wallet configured for all 3 networks
6. Removed leftover `snowside` blockchain from local network
7. Updated AGENTS.md with network infrastructure details and CLI command discipline rule

### Session 8 (2026-08-10)
1. Added Web3 wallet connection guide to `packages/docs`.
2. Fixed pnpm warning (moved config to `pnpm-workspace.yaml`) and upgraded Astro to 7.2.0.
3. Scaffolded `packages/explorer` block explorer MVP.
4. Implemented subdomain routing via `functions/_middleware.js`.
5. Synced `pnpm-lock.yaml` to fix Cloudflare frozen-lockfile errors.
6. Removed path redirects, implemented subdomain links in Explorer UI.

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
        │   ├── Team.astro           # retro9000 SVG logo, no false claims
        │   ├── Roadmap.astro        # 5 trusted community validators
        │   ├── CTA.astro           # /validators + Discord, no pitch link
        │   └── Footer.astro         # Discord in Contact, Docs+GitHub first in Resources
        ├── data/whitepaper/
        │   ├── types.ts
        │   ├── meta.ts              # WHITEPAPER_VERSION = '0.3'
        │   ├── content.ts           # 481 lines, 15 sections, v0.3
        │   └── figures/
        │       ├── architecture-diagram.ts    # Section 3
        │       ├── bmm-flow.ts                # Section 4
        │       ├── gas-flow.ts                # Section 5
        │       ├── fee-model.ts               # Section 5
        │       ├── role-separation.ts         # Section 4
        │       ├── icm-bridge.ts              # Section 6
        │       ├── consensus-layers.ts        # Section 8
        │       ├── validator-economics.ts     # Section 9
        │       └── permissionless-roadmap.ts  # Section 12
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
            ├── guides/              # 4 pages (running-a-validator, connect-wallet, deploying-contracts, bridging-usdc)
            └── reference/            # 2 pages

### packages/explorer (Astro + CF Pages Functions)
    packages/explorer/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── functions/
    │   └── _middleware.js           # Subdomain routing for explorer-testnet/signet
    ├── public/
    │   ├── favicon.svg
    │   └── og-image.png
    └── src/
        ├── styles/global.css        # Raw CSS (temporarily, Tailwind ENOENT fix pending)
        └── pages/
            ├── index.astro          # Mainnet root
            └── [network]/
                └── index.astro      # Dynamic routes for /mainnet, /testnet, /signet

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

### VPS Infrastructure (rpc.snowside.network)
    /etc/nginx/sites-available/default
    # Contains reverse proxy config for /mainnet, /testnet, /signet
    # See "Nginx Configuration" section above for full config

---
*Generated at end of Session 8. Next session: Explorer UI (Header, Footer, Search). Maintained per AGENTS.md.*
