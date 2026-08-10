# Snowside Handoff — 2026-08-10 (Session 7, Mainnet Deployment & Infrastructure)

## Purpose
Snowside is an Avalanche L1 sidechain project requesting eCash Drivechain ID #88. The monorepo at `/Workspace/abitsuite/snowside` includes a landing page (`snowside.network`), a pitch page (`pitch.snowside.network`), and a docs site (`docs.snowside.network`), alongside the L1 execution layer (`go/subnet-evm`), BMM bidder (`rust/bmm-bidder`), and core contracts (`contracts/`).

## Session 7 summary — 2026-08-10

### Task 1: L1 Network Infrastructure Finalization
- VPS provisioned at `rpc.snowside.network` with Ubuntu 24.04.
- Avalanche-CLI installed and operational.
- Nginx reverse proxy configured to route /mainnet, /testnet, /signet to local Avalanche RPC endpoints.
- Cloudflare DNS configured for `rpc.snowside.network` pointing to VPS IP.
- Resolved AvalancheGo "invalid host specified" 403 error by overriding `Host` header to `127.0.0.1` in Nginx proxy config.
- Resolved HTTP/2 compatibility by adding `http2` to Nginx `listen 443` directives.
- Removed leftover `snowside` blockchain from local network configuration.

### Task 2: SnowsideMainnet & SnowsideSignet Deployment
- Deployed SnowsideMainnet (Chain ID: 32904 / 0x8088) to local network via `avalanche blockchain deploy SnowsideMainnet --local`.
- Deployed SnowsideSignet (Chain ID: 33352 / 0x8288) to local network via `avalanche blockchain deploy SnowsideSignet --local`.
- Updated Nginx configuration to route all 3 L1s to public endpoints.
- Verified all 3 public RPC endpoints return correct Chain IDs:
  - https://rpc.snowside.network/mainnet -> 0x8088
  - https://rpc.snowside.network/testnet -> 0x8188
  - https://rpc.snowside.network/signet -> 0x8288
- Rabby wallet configured for all 3 networks (Snowside, Snowside Testnet, Snowside Signet) using ECX as currency.

### Deployed L1 Details (Local Network on VPS)
1. **SnowsideMainnet** (Chain ID: 32904 / 0x8088)
   - Blockchain ID: `2sDVEVpwW8aNwgY1RMGzmFVXdJ1vyE1qWg3YBK8pGX8iy9iLtJ`
   - Subnet ID: `2951oZXRAym6ThvANrFSCWbiSgh3mrgD5gJkACZbpnoic6Zczf`
   - VM ID: `dk9HWWWW1YGB5mZX48ABvu8fq2YTqdByWP7XjL2HnvkNGa5nr`
   - Local RPC: `http://127.0.0.1:9654/ext/bc/2sDVEVpwW8aNwgY1RMGzmFVXdJ1vyE1qWg3YBK8pGX8iy9iLtJ/rpc`
   - Public RPC: `https://rpc.snowside.network/mainnet`
   - L1 Node: `NodeID-JR735wUJ3AAgwB9upf4A78866d6PR6Ptg` (port 9654)

2. **SnowsideTestnet** (Chain ID: 33160 / 0x8188)
   - Blockchain ID: `2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe`
   - Subnet ID: `wNWS35thzJy9fGaxtVfPwFKEt2RU2r9fMGA7c5A9XqqSvBCVj`
   - VM ID: `dk9HWWWW1YGFGWfkXjDB6qaRh9UFjLAdahZS9qAyXKn5x1GnH`
   - Local RPC: `http://127.0.0.1:9656/ext/bc/2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe/rpc`
   - Public RPC: `https://rpc.snowside.network/testnet`
   - L1 Node: `NodeID-MZ51J52kjmn9T67Fyd2JyTvpQ8vNzAMZ4` (port 9656)

3. **SnowsideSignet** (Chain ID: 33352 / 0x8288)
   - Blockchain ID: `2pwzxirqRyWrgegTjMyLH2s5RhSb8xNkSYt5y4KhLXyAzZ7PMc`
   - Subnet ID: `yeEMHr6rnkSvbgoZSc1BxaiMEnVFev4jkMDEmCZvpbZoeeosp`
   - VM ID: `dk9HWWWW1YGEgSsvioryhvwYAqsUitMXq2Ksyahzve3tUapgX`
   - Local RPC: `http://127.0.0.1:9658/ext/bc/2pwzxirqRyWrgegTjMyLH2s5RhSb8xNkSYt5y4KhLXyAzZ7PMc/rpc`
   - Public RPC: `https://rpc.snowside.network/signet`
   - L1 Node: `NodeID-AVuaGGPRCL9xNg3QEY2A8m1UiHGdBXcAY` (port 9658)

### Shared L1 Configuration (all 3 networks)
- Token Name: ECX Token
- Token Symbol: ECX
- Consensus: Proof of Authority (PoA)
- ICM Messenger Address: `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`
- ICM Registry Address: `0xB8e71012d3F55D9EbbFf74376dE180702c1D8A6F`
- PoA Validator Manager: `0x0C0DEbA5E0000000000000000000000000000000`
- Validator Transparent Proxy: `0x0Feedc0de0000000000000000000000000000000`
- Funded account (ewoq): `0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC` (1,000,000 ECX)
  - Private Key: `56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027`
- Primary Nodes:
  - `NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg` (port 9650)
  - `NodeID-MFrZFVCXPv5iCn6M9K6XduxGTYp891xXZ` (port 9652)
- Relayer not deployed (non-critical for L1 operations)

### Nginx Configuration (/etc/nginx/sites-available/default)
    server {
        listen 80;
        listen [::]:80;
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
    
        server_name rpc.snowside.network;
    
        ssl_certificate      /etc/nginx/ssl/server.crt;
        ssl_certificate_key /etc/nginx/ssl/server.key;
    
        access_log /dev/null;
        error_log /root/error_log;
    
        root /var/www/html;
        index index.html index.htm;
    
        location / {
            try_files $uri $uri/ /index.html;
        }
    
        # Snowside Mainnet (ChainID: 32904)
        location /mainnet {
            proxy_pass http://127.0.0.1:9654/ext/bc/2sDVEVpwW8aNwgY1RMGzmFVXdJ1vyE1qWg3YBK8pGX8iy9iLtJ/rpc;
            proxy_set_header Host 127.0.0.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    
        # Snowside Testnet (ChainID: 33160)
        location /testnet {
            proxy_pass http://127.0.0.1:9656/ext/bc/2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe/rpc;
            proxy_set_header Host 127.0.0.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    
        # Snowside Signet (ChainID: 33352)
        location /signet {
            proxy_pass http://127.0.0.1:9658/ext/bc/2pwzxirqRyWrgegTjMyLH2s5RhSb8xNkSYt5y4KhLXyAzZ7PMc/rpc;
            proxy_set_header Host 127.0.0.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

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
    │   ├── web/  # Astro static — Landing + Whitepaper v0.3 + /validators
    │   ├── pitch/ # Astro static — Pitch page — noindex,nofollow
    │   ├── docs/ # Astro Starlight — Technical docs
    │   └── explorer/ # EVM block explorer (TO BE ADDED NEXT SESSION)
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
| go/subnet-evm | ✅ (using ./scripts/build.sh) |
| rust/bmm-bidder | ✅ |
| contracts | ✅ |
| L1 Networks (Mainnet, Testnet, Signet) | ✅ |

## Next session: Block Explorer + Documentation Update

1. Add `packages/explorer` — deploy an EVM block explorer for the Snowside networks.
2. Update `packages/docs` with all network details gathered this session (RPC endpoints, Chain IDs, contract addresses, token info, wallet connection guide).
3. Continue L1 development (precompile implementation, BMM bidder RPC, smart contracts).

## Outstanding tasks

### Documentation update (packages/docs)
- Add network connection guide (RPC URLs, Chain IDs, token symbol, MetaMask/Rabby config)
- Add contract addresses reference (ICM Messenger, ICM Registry, Validator Manager)
- Add validator setup guide (PoA configuration, local node deployment)
- Update infrastructure page with VPS/Nginx/Cloudflare details

### Block Explorer (packages/explorer)
- Research EVM block explorer options (Blockscout, Otterscan, etc.)
- Deploy explorer for Snowside networks
- Configure explorer to connect to local RPC endpoints

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

### Local testing network
- Deploy contracts to SnowsideMainnet/Testnet/Signet
- Test BMM coordination end-to-end

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
25. **Never make the user ask for CLI commands** — ALWAYS output commands in a single terminal-ready code block. NEVER make the user ask.
26. **Heredoc + Triple Backticks** — If markdown content inside a heredoc contains triple backticks, they will conflict with the outer code block. Use 4-space indented code blocks instead.

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

### VPS Infrastructure (rpc.snowside.network)
    /etc/nginx/sites-available/default
    # Contains reverse proxy config for /mainnet, /testnet, /signet
    # See "Nginx Configuration" section above for full config

---
*Generated at end of Session 7. Next session: Block Explorer deployment + Documentation update with network details. Maintained per AGENTS.md.*
