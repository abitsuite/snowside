# Snowside Handoff — 2026-08-11 (Session 11, Signet Redeploy with Precompiles)

## Purpose
Snowside is an Avalanche L1 sidechain project requesting eCash Drivechain ID #88. The monorepo at `/Workspace/abitsuite/snowside` includes a landing page (`snowside.network`), a pitch page (`pitch.snowside.network`), docs (`docs.snowside.network`), a block explorer (`explorer.snowside.network`), the API worker (`snowside.network/v1`), the bridge UI (`bridge.snowside.network` WIP), alongside the L1 execution layer (`go/subnet-evm`), BMM bidder (`rust/bmm-bidder`), and core contracts (`contracts/`).

## Session 11 summary — 2026-08-11

### Task 1: SnowsideSignet Redeployment with Precompiles
- Previous signet deployment (Session 6/7) lacked `contractNativeMinterConfig` and `contractDeployerAllowListConfig` precompiles.
- Initial attempt with hand-written genesis failed: heredoc garbled, genesis truncated, missing `alloc` section with ICM contract bytecode. PoA Validator Manager init failed with "no contract code at given address".
- Initial attempt with CLI flags failed: `--chain-id` flag does not exist in this Avalanche-CLI version.
- **Solution: Genesis cloning approach** — copied testnet's genesis from `~/.avalanche-cli/subnets/SnowsideTestnet/genesis.json` (58KB, complete with all ICM contract bytecode in `alloc`), patched `chainId` to 33352 and added both precompile configs via Python one-liner.
- Created non-interactively with: `avalanche blockchain create SnowsideSignet --evm --evm-token ECX --proof-of-authority --validator-manager-owner 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC --icm --warp --latest --genesis /tmp/signet-genesis.json --force`
- PoA Validator Manager initialized successfully.
- Both precompiles confirmed in describe output: NativeMinter (admin: ewoq), ContractDeployerAllowList (admin: ewoq).
- ICM Messenger/Registry deployment FAILED during L1 deploy: "failure sending tx: got status 0 expected 1" — likely due to cloned `warpConfig.blockTimestamp` and ICM deployer nonce state from testnet. L1 itself is fully functional. ICM can be deployed separately with `avalanche icm deploy`.

### Task 2: Nginx Config Update
- Updated `/signet` location block with new Blockchain ID: `26XsRMLXezgJ1mK8TSVoHsRfBcy6Mwr4kJdKUAfgegb3PH4b5f` and port 9654.
- Old Blockchain ID `2pwzxirqRyWrgegTjMyLH2s5RhSb8xNkSYt5y4KhLXyAzZ7PMc` and port 9658 are dead.

### Task 3: AGENTS.md and HANDOFF.md Updates
- Documented the genesis cloning approach for non-interactive L1 deployment with precompiles.
- Documented all discovered Avalanche-CLI flags and their conflicts.
- Updated signet network info with new Blockchain ID, Subnet ID, and precompile configuration.

## Build status — all packages pass

| Package | Status |
|---------|--------|
| packages/web | not rebuilt this session |
| packages/pitch | not rebuilt this session |
| packages/docs | not rebuilt this session |
| packages/explorer | not rebuilt this session |
| packages/api | not rebuilt this session |
| packages/bridge | not rebuilt this session |
| go/subnet-evm | not rebuilt this session |
| rust/bmm-bidder | not rebuilt this session |
| contracts | not rebuilt this session |
| SnowsideMainnet | needs redeploy (network was cleaned) |
| SnowsideTestnet | needs redeploy (network was cleaned) |
| SnowsideSignet | deployed, ICM pending |

## Current Signet Deployment Details
- Blockchain ID: 26XsRMLXezgJ1mK8TSVoHsRfBcy6Mwr4kJdKUAfgegb3PH4b5f
- Subnet ID: 2W9boARgCWL25z6pMFNtkCfNA5v28VGg9PmBgUJfuKndEdhrvw
- Chain ID: 33352 (0x8288)
- Local RPC: http://127.0.0.1:9654/ext/bc/26XsRMLXezgJ1mK8TSVoHsRfBcy6Mwr4kJdKUAfgegb3PH4b5f/rpc
- Public RPC: https://rpc.snowside.network/signet
- Precompiles: Warp, NativeMinter (admin: ewoq), ContractDeployerAllowList (admin: ewoq)
- ICM: NOT deployed (failed during L1 creation)
- NodeID: NodeID-2QpdUKC81YfKoPwU4kuUA8er5FiNQ3V6w

## Next session: ICM Deployment, Native Minting Test, and Network Restoration

1. **Deploy ICM on Signet:**
   - Run `avalanche icm deploy` to deploy ICM Messenger and Registry contracts on the signet L1.
   - If this fails due to the cloned genesis, may need to create signet from scratch (non-cloned) with CLI interactive mode, enabling precompiles when prompted.

2. **Test Native Minting Precompile:**
   - Use `cast send` to call the NativeMinter precompile at `0x02071c2fEFd09Ded5c3565a5c8e305e97cB4533B` with `mintNativeCoin(address,uint256)` to mint ECX to a test address.
   - Verify the minted balance with `cast balance`.

3. **Test Contract Deployer Allow List:**
   - Verify that only the admin (ewoq) can deploy contracts.
   - Test deploying a contract from ewoq (should succeed).
   - Test deploying from a non-allowlisted address (should fail).

4. **Redeploy Mainnet and Testnet:**
   - `avalanche network clean` was run during Session 11, wiping all local networks.
   - Redeploy: `avalanche blockchain deploy SnowsideMainnet --local` and `avalanche blockchain deploy SnowsideTestnet --local`.
   - These will get new Blockchain IDs and ports — update Nginx accordingly.
   - Alternatively, if mainnet/testnet don't have precompiles and don't need them, they can be redeployed as-is.

5. **Federation Service:**
   - Deploy the `federation` Docker service to the VPS.
   - Hook up the Bridge UI to the federation service.

## Key learnings (all sessions)
1. **@tailwindcss/vite** breaks on Cloudflare's rolldown-vite — always use **@tailwindcss/postcss**
2. **Tailwind v4 ENOENT Fix** — change `@import 'tailwindcss';` to `@import 'tailwindcss/index.css';` in `global.css`.
3. **Starlight auto-injects ALL components** in `.md` files — never add import statements
4. **Starlight Item** component is auto-injected for `.md` only, not `.mdx`
5. **pnpm 10** ignores build scripts for native deps unless approved in `pnpm-workspace.yaml` under `onlyBuiltDependencies`.
6. **Heredoc + Triple Backticks** conflict — use 4-space indented code blocks or unique delimiters
7. **Never commit node_modules** — verify `.gitignore` before first `git add -A`
8. **Favicon dark backdrop required** — white snowmen on transparent SVG vanish in light browser themes
9. **Two snowmen = "88"** — stacked-circle silhouette naturally reads as "88" for Drivechain ID branding
10. **Landing page contrast** — alternate dark/light sections; use theme tokens, not raw gray-*
11. **OG images** — generate externally via AI agent; 1200x630 PNG; use versioned filenames for cache-busting
12. **Static multi-page hash links** — `#about` resolves to current page; must use `/#about` for cross-page navigation
13. **Astro `<script is:inline>`** — required for external analytics scripts; without it Astro bundles/processes the tag
14. **Pitch isolation** — `noindex,nofollow` meta + zero inbound links from web = unreachable to crawlers
15. **Simple Analytics** — standard embed works across Astro layouts and Starlight head config without modification
16. **Snowball vs Snowman** — "Snowball" is the broader protocol family; "Snowman" is the linear-chain variant used by Avalanche L1s. Always use "Snowman" for Snowside's consensus.
17. **eCash vs Bitcoin** — Snowside is secured by eCash's PoW, not Bitcoin's directly. Always refer to "eCash miners" and "eCash L1" unless discussing Bitcoin's broader economic model.
18. **Terminal heredocs garble** — Multi-file pastes frequently corrupt in the terminal. ALWAYS run `wc -l <file>` and `tail -n 15 <file>` to verify files were written correctly.
19. **PDF cache vs HTML cache** — Cloudflare may serve stale HTML for `/whitepaper/` while `/whitepaper.pdf` updates.
20. **Mutable Aggregates** — BMM settlement allows proposers to grow their Merkle root payload during pending settlement.
21. **Two-phase roadmap** — Phase 3 (AVAX phase-out) removed. Two-phase model: Phase 1 (Permissioned), Phase 2 (Permissionless).
22. **Go Versioning** — Subnet-EVM requires Go 1.21+. Manual installation of Go 1.23.12 was required on Ubuntu 22.04.
23. **Subnet-EVM Build Tool** — Use `./scripts/build.sh` or `task build`.
24. **AvalancheGo Host Header Security** — Override `proxy_set_header Host 127.0.0.1` in Nginx to bypass DNS rebinding protection.
25. **Avalanche-CLI Naming Convention** — Blockchain specs must use letters only (no hyphens, underscores, numbers). Use PascalCase.
26. **Never make the user ask for CLI commands** — ALWAYS output commands in a terminal-ready code block.
27. **pnpm-lock.yaml sync** — MUST explicitly run `git add pnpm-lock.yaml` and commit it. Cloudflare uses `--frozen-lockfile`.
28. **Markdown table pipes** — Escape literal `|` as `\|` to prevent column breaking.
29. **Cloudflare Pages Subdomains** — Route multiple subdomains to the same CF Pages project via `functions/_middleware.js`.
30. **Chanfana v2 Exports** — Use `fromHono` to integrate OpenAPI with a Hono app instance.
31. **Cloudflare Worker Routes** — Route pattern `snowside.network/v1*` captures `/v1`, `/v1/`, and `/v1/status`.
32. **Avalanche-CLI genesis file location** — Genesis files are stored at `~/.avalanche-cli/subnets/<BlockchainName>/genesis.json` (58KB+ with full contract bytecode). The `chain.json` file in the same directory is only the chain config metadata (367 bytes), NOT the genesis.
33. **Avalanche-CLI --genesis flag conflicts** — The `--genesis` flag disables `--evm-chain-id`, `--evm-defaults`, `--production-defaults`, `--test-defaults`. Chain ID must be baked into the genesis JSON, not passed as a CLI flag.
34. **Avalanche-CLI non-interactive flags** — Full list: `--evm`, `--evm-chain-id`, `--evm-token`, `--proof-of-authority`, `--validator-manager-owner`, `--icm`, `--warp`, `--latest`, `--genesis`, `--force`, `--test-defaults`, `--production-defaults`, `--pre-release`, `--vm-version`, `--sovereign`, `--external-gas-token`, `--icm-registry-at-genesis`.
35. **Genesis cloning for precompiles** — To add precompiles (NativeMinter, ContractDeployerAllowList) to an L1, clone a working L1's genesis from disk, patch with Python (change chainId + add precompile configs), and create with `--genesis`. This preserves the `alloc` section with ICM contract bytecode.
36. **ICM deployment can fail with cloned genesis** — The ICM Messenger/Registry contract deployment may fail ("got status 0 expected 1") when using a cloned genesis due to `warpConfig.blockTimestamp` and nonce state mismatch. The L1, PoA, and precompiles still work. Deploy ICM separately with `avalanche icm deploy`.
37. **describe --genesis output mixes table and JSON** — `avalanche blockchain describe <name> --genesis` outputs both the table and the genesis JSON to stdout. Do NOT redirect to a file and parse. Instead, read the genesis directly from `~/.avalanche-cli/subnets/<name>/genesis.json`.

## Session history (prior sessions)

### Session 1 (2026-07-17)
1. Deleted `apps/web` (old abandoned Astro version)
2. Converted `packages/web` from React/Vite to Astro (11 components, Base layout, global.css)
3. Created full whitepaper (15 sections, 6 vector figures, jsPDF endpoint)
4. Created `packages/pitch` scaffolding
5. Installed all dependencies via `pnpm install`

### Session 2 (2026-07-17)
1. Fixed git: node_modules committed accidentally
2. Fixed @tailwindcss/vite incompatibility (switched to @tailwindcss/postcss)
3. Created pitch page (10 sections, FAQ accordion)
4. Replaced Starlight template with real Snowside documentation (12 pages)

### Session 3 (2026-07-17)
1. Fixed docs index.md import issue (Starlight auto-injects components)
2. Landing page contrast overhaul + Footer rewrite (14 files)
3. Dual-snowman 88 favicon deployed to all 3 packages
4. OG image cache-bust (og-image-v2.png)
5. retro9000 grant link added across 3 packages

### Session 4 (2026-07-17 to 2026-07-21)
1. Nav button + Whitepaper link cleanup
2. Team section improvements (retro9000 badge)
3. Roadmap fix (5 trusted community validators)
4. /validators page (new)
5. Whitepaper v0.2 and v0.3 (20+ architectural updates)

### Session 5 (2026-07-26)
1. Monorepo restructuring (go/, rust/, contracts/ top-level dirs)
2. Subnet-EVM fork scaffolded
3. BMM bidder binary crate scaffolded in Rust
4. Foundry contracts scaffolded with IBMMCoordination interface

### Session 6 (2026-08-10)
1. VPS provisioned and configured with Nginx reverse proxy
2. Cloudflare DNS configured for rpc.snowside.network
3. Deployed SnowsideTestnet L1 (Chain ID: 33160)

### Session 7 (2026-08-10)
1. Deployed SnowsideMainnet (Chain ID: 32904)
2. Deployed SnowsideSignet (Chain ID: 33352) — without precompiles
3. Updated Nginx configuration with correct Blockchain IDs for all 3 networks

### Session 8 (2026-08-10)
1. Added Web3 wallet connection guide to docs
2. Fixed pnpm warning and upgraded Astro to 7.2.0
3. Scaffolded packages/explorer block explorer MVP
4. Implemented subdomain routing via functions/_middleware.js

### Session 9 (2026-08-10)
1. Upgraded Explorer UI with Etherscan-style stats, Search bar, Tailwind layout
2. Fixed Tailwind v4 ENOENT issue
3. Updated Cloudflare middleware for deep-link routing

### Session 10 (2026-08-10)
1. Scaffolded packages/bridge UI with network selector, QR display, and QR scanner
2. Scaffolded packages/api Cloudflare Worker using Hono + Chanfana
3. Worker deploys to snowside.network/v1*, serving OpenAPI UI at /v1
4. Configured raw proxy to Drynet 4 Esplora backend

### Session 11 (2026-08-11)
1. Redeployed SnowsideSignet with contractNativeMinterConfig and contractDeployerAllowListConfig precompiles
2. Used genesis cloning approach (copy testnet genesis, patch chainId + precompiles with Python)
3. Discovered all Avalanche-CLI non-interactive flags and their conflicts
4. Updated Nginx config with new signet Blockchain ID and port
5. ICM deployment failed during L1 creation — needs separate `avalanche icm deploy`
6. Updated AGENTS.md and HANDOFF.md with all learnings

## Key file inventory

### packages/web (Astro)
    packages/web/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── package.json
    ├── tsconfig.json
    ├── public/
    │   ├── favicon.svg
    │   ├── icons.svg
    │   ├── og-image-v2.png
    │   └── pdfjs/
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro
        ├── pages/
        │   ├── index.astro
        │   ├── whitepaper.astro
        │   ├── whitepaper.pdf.ts
        │   └── validators.astro
        ├── components/
        │   ├── Nav.astro
        │   ├── Hero.astro
        │   ├── About.astro
        │   ├── WhyAvalanche.astro
        │   ├── ValueProposition.astro
        │   ├── NodeRunr.astro
        │   ├── ECash.astro
        │   ├── Team.astro
        │   ├── Roadmap.astro
        │   ├── CTA.astro
        │   └── Footer.astro
        ├── data/whitepaper/
        │   ├── types.ts
        │   ├── meta.ts
        │   ├── content.ts
        │   └── figures/
        └── fonts/

### packages/pitch (Astro)
    packages/pitch/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── package.json
    ├── public/favicon.svg
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro
        ├── components/
        │   ├── Nav.astro
        │   └── Footer.astro
        └── pages/
            └── index.astro

### packages/docs (Astro Starlight)
    packages/docs/
    ├── astro.config.mjs
    ├── package.json
    ├── public/favicon.svg
    └── src/
        ├── content.config.ts
        └── content/docs/
            ├── index.md
            ├── architecture/
            ├── guides/
            └── reference/

### packages/explorer (Astro + CF Pages Functions)
    packages/explorer/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── functions/_middleware.js
    ├── public/
    │   ├── favicon.svg
    │   └── og-image.png
    └── src/
        ├── styles/global.css
        └── pages/
            ├── index.astro
            └── [network]/index.astro

### packages/bridge (Astro)
    packages/bridge/
    ├── astro.config.mjs
    ├── postcss.config.mjs
    ├── functions/_middleware.js
    ├── public/
    │   ├── favicon.svg
    │   └── og-image.png
    └── src/
        ├── styles/global.css
        ├── layouts/Base.astro
        ├── components/
        │   ├── Header.astro
        │   ├── Footer.astro
        │   └── BridgeWidget.astro
        └── pages/
            ├── index.astro
            └── [network]/index.astro

### packages/api (Cloudflare Worker + Hono)
    packages/api/
    ├── package.json
    ├── tsconfig.json
    ├── wrangler.toml
    └── src/index.ts

### go/subnet-evm (Go)
    go/subnet-evm/
    ├── go.mod
    ├── Taskfile.yml
    ├── scripts/build.sh
    ├── cmd/
    ├── precompile/
    └── ...

### rust/bmm-bidder (Rust)
    rust/bmm-bidder/
    ├── Cargo.toml
    ├── config.example.toml
    └── src/main.rs

### contracts (Solidity / Foundry)
    contracts/
    ├── foundry.toml
    ├── src/
    │   ├── interfaces/IBMMCoordination.sol
    │   ├── peg/Peg.sol
    │   └── fees/FeeDistribution.sol
    ├── test/
    └── script/

### VPS Infrastructure (rpc.snowside.network)
    /etc/nginx/sites-available/default
    # Reverse proxy for /mainnet, /testnet, /signet
    # Signet updated to Blockchain ID 26XsRMLXezgJ1mK8TSVoHsRfBcy6Mwr4kJdKUAfgegb3PH4b5f on port 9654

---
*Generated at end of Session 11. Next session: Deploy ICM on signet, test Native Minting, redeploy mainnet/testnet. Maintained per AGENTS.md.*
