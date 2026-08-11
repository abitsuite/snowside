# Snowside – Agent Instructions

## Monorepo structure
- `packages/web` – Astro static site (landing page + whitepaper + /validators), deployed to Cloudflare Pages via `master`
- `packages/pitch` – Astro static site (pitch.snowside.network), separate Cloudflare Pages project. **noindex, nofollow** — no links from web to pitch.
- `packages/docs` – Astro Starlight technical documentation (docs.snowside.network)
- `packages/explorer` – EVM block explorer (Astro static site + Cloudflare Pages Functions). Contains Header (network switcher, search), Footer, Etherscan-style stats cards. Subdomains: `explorer.snowside.network` (mainnet), `explorer-testnet.snowside.network`, `explorer-signet.snowside.network`.
- `packages/bridge` – Astro static site for BIP-300/301 deposits and withdrawals. Subdomain: `bridge.snowside.network`.
- `packages/api` – Cloudflare Worker (Hono + Chanfana) serving OpenAPI at `/v1` and proxying to Drynet 4 Esplora.
- `go/subnet-evm` – Subnet-EVM fork with BMM coordination precompile (Go)
- `rust/bmm-bidder` – BMM bidder and settlement monitor (Rust)
- `contracts/` – Solidity smart contracts (Foundry)

## Repository Structure

The Snowside monorepo uses language-specific top-level directories:

packages/     — JavaScript/TypeScript (pnpm workspace)
  web/ Main website (Astro)
  pitch/ Grant pitch page (Astro)
  docs/ Documentation site (Astro + Starlight)
  explorer/ EVM block explorer (Astro static + CF Pages Functions)
  bridge/ Bridge UI (Astro + Tailwind v4)
  api/ Cloudflare Worker (Hono + Chanfana OpenAPI)

go/ — Go packages
  subnet-evm/   Subnet-EVM fork with BMM coordination precompile

rust/ — Rust packages
  bmm-bidder/   BMM bidder and settlement monitor

contracts/    — Solidity smart contracts (Foundry)
  src/
    interfaces/   Solidity interfaces for precompiles
    peg/ BTC peg contract (deposits/withdrawals)
    fees/ Contract Fee distribution
  test/ Foundry tests
  script/ Deployment scripts

docs/ — Documentation and handoff notes

## Core workflow rules
**Push to production often.** After every meaningful change, build, commit from the repo root, and push to `master`.
Never leave uncommitted work sitting locally at the end of a session.

## CRITICAL: TERMINAL HEREDOC DISCIPLINE
**NEVER** make the user ask for CLI commands. **ALWAYS** output commands in a single terminal-ready code block.
**CRITICAL:** If markdown content inside a heredoc contains triple backticks, they will conflict with the outer code block. Use 4-space indented code blocks instead of fenced code blocks inside heredoc content.
**CRITICAL:** Multi-line paste blocks frequently garble in terminals. Use single-line commands or heredocs with `'EOF'` delimiters. Always verify with `wc -l` and `tail -n 15` after heredoc writes.

## Build & deploy
- Web build:     cd packages/web && pnpm build   # Astro static, output dist/
- Pitch build:   cd packages/pitch && pnpm build # Astro static, output dist/
- Docs build:    cd packages/docs && pnpm build  # Astro Starlight, output dist/
- Explorer build: cd packages/explorer && pnpm build # Astro static, output dist/
- Bridge build:  cd packages/bridge && pnpm build # Astro static, output dist/
- Root build:    pnpm run build                  # runs web then pitch
- Dev web:       pnpm run dev:web
- Dev pitch:     pnpm run dev:pitch
- Dev docs:      pnpm --filter packages-docs run dev
- Dev explorer:  pnpm --filter packages-explorer run dev
- Production URLs: https://snowside.network (web), https://pitch.snowside.network (pitch), https://docs.snowside.network (docs), https://explorer.snowside.network (explorer mainnet)

## Avalanche L1 Network Infrastructure
- **VPS:** rpc.snowside.network (Ubuntu 24.04, Nginx reverse proxy)
- **Nginx Config:** /etc/nginx/sites-available/default on VPS
- **Cloudflare DNS:** rpc.snowside.network -> VPS IP
- **Deployment Tool:** Avalanche-CLI (requires letters only for blockchain names, no hyphens/underscores)
- **Avalanche-CLI Version:** Supports flags: --evm, --evm-chain-id, --evm-token, --proof-of-authority, --validator-manager-owner, --icm, --warp, --latest, --genesis, --force, --test-defaults, --production-defaults

### Precompile Addresses (Confirmed from subnet-evm source)

| Precompile | Address | Config Key |
|-----------|---------|------------|
| ContractDeployerAllowList | 0x0200000000000000000000000000000000000000 | contractDeployerAllowListConfig |
| NativeMinter | 0x0200000000000000000000000000000000000001 | contractNativeMinterConfig |
| TxAllowList | 0x0200000000000000000000000000000000000002 | txAllowListConfig |
| FeeManager | 0x0200000000000000000000000000000000000003 | feeManagerConfig |
| RewardManager | 0x0200000000000000000000000000000000000004 | rewardManagerConfig |

**Source files:**
- NativeMinter: subnet-evm/precompile/contracts/nativeminter/module.go
- DeployerAllowList: subnet-evm/precompile/contracts/deployerallowlist/module.go

**AllowList roles:** 0x00 = none, 0x01 = enabled, 0x02 = admin, 0x03 = manager

### Non-Interactive L1 Deployment with Precompiles

To deploy an L1 non-interactively with custom precompiles (NativeMinter, ContractDeployerAllowList), use the **genesis cloning approach**:

1. Export the genesis from an existing, working L1 (e.g., testnet):
   cp ~/.avalanche-cli/subnets/SnowsideTestnet/genesis.json /tmp/base-genesis.json

2. Patch the genesis with Python (change chainId, add precompile configs):
   python3 -c 'import json; g=json.load(open("/tmp/base-genesis.json")); g["config"]["chainId"]=33352; g["config"]["contractNativeMinterConfig"]={"blockTimestamp":0,"adminAddresses":["0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"]}; g["config"]["contractDeployerAllowListConfig"]={"blockTimestamp":0,"adminAddresses":["0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"]}; json.dump(g,open("/tmp/new-genesis.json","w"),indent=4); print("done")'

3. Create the blockchain non-interactively:
   avalanche blockchain create SnowsideSignet --evm --evm-token ECX --proof-of-authority --validator-manager-owner 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC --icm --warp --latest --genesis /tmp/new-genesis.json --force

4. Deploy locally:
   avalanche blockchain deploy SnowsideSignet --local

**CRITICAL:** The --genesis flag conflicts with --evm-chain-id. The chain ID must be baked into the genesis JSON, not passed as a CLI flag.
**CRITICAL:** The --genesis flag also conflicts with --evm-defaults, --production-defaults, --test-defaults.
**NOTE:** ICM Messenger/Registry contracts may fail to deploy during `blockchain deploy` when using a cloned genesis. The L1, PoA, and precompiles will still work. Deploy ICM separately with `avalanche icm deploy`.
**NOTE:** `blockchain deploy` flags: `-e` (use ewoq key for local/devnet), NO `--force` flag (only `blockchain create` has it). Each L1 gets its own local Avalanche node on a separate port (mainnet: 9656, testnet: 9658, signet: 9654).
**NOTE:** The deploy command prompts for ICM Registry addresses of other L1s (cross-chain config). Can Ctrl+C to skip — L1 deployment is already complete. Relayer deployment can also be skipped.
**NOTE:** Genesis files are stored at ~/.avalanche-cli/subnets/<BlockchainName>/genesis.json (NOT chain.json, which is only the chain config metadata).

### Interacting with Precompiles via cast

Read allowlist status:
   cast calldata "readAllowList(address)" 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
   # Then eth_call to the precompile address with that calldata

Mint native tokens:
   cast send --rpc-url $RPC --private-key $PK 0x0200000000000000000000000000000000000001 "mintNativeCoin(address,uint256)" <recipient> $(cast to-wei 1000)

Deploy contract (if on DeployerAllowList):
   cast send --rpc-url $RPC --private-key $PK --create 0x60006000f3
   # 0x60006000f3 = minimal bytecode that returns 0 bytes (creates empty contract)

### Deployed L1s (Local Network on VPS)
1. **SnowsideMainnet** (Chain ID: 32904 / 0x8088) — DEPLOYED & VERIFIED Session 12
   - Blockchain ID: 2WGjPQF6YcV3KN19d5x21Cj8VAvxrakA72Ke7RHtZJpQBJBkdV
   - Subnet ID: No8zvE8ZFDQhY8t5u2qTLjprzCqab4cYoVfTjskkZMzM34jXZ
   - Local RPC: http://127.0.0.1:9656/ext/bc/2WGjPQF6YcV3KN19d5x21Cj8VAvxrakA72Ke7RHtZJpQBJBkdV/rpc
   - Public RPC: https://rpc.snowside.network/mainnet
   - NodeID: NodeID-PGEHenyijV18FoaRZrJqveJWac7oqWorU
   - Port: 9656
   - Precompiles: Warp only
   - ICM Status: Deployed (Messenger: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf, Registry: 0xB8e71012d3F55D9EbbFf74376dE180702c1D8A6F)
   - Relayer: Not deployed (skipped, can deploy with `avalanche interchain relayer deploy`)

2. **SnowsideTestnet** (Chain ID: 33160 / 0x8188) — DEPLOYED & VERIFIED Session 12
   - Blockchain ID: 2A45por6NN5o17NwKFTHTjyKhJobL8UPd92Sbi4ffaMfohRXRA
   - Subnet ID: KByfMHbZ8ZfTbKegC16HMkVjS8gj2SGQNVmUNC8kSCikQQK5w
   - Local RPC: http://127.0.0.1:9658/ext/bc/2A45por6NN5o17NwKFTHTjyKhJobL8UPd92Sbi4ffaMfohRXRA/rpc
   - Public RPC: https://rpc.snowside.network/testnet
   - NodeID: NodeID-MFYa9TTeDp7JNAEwavG5JVuY3ZorMSixe
   - Port: 9658
   - Precompiles: Warp only
   - ICM Status: Deployed (Messenger: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf, Registry: 0xB8e71012d3F55D9EbbFf74376dE180702c1D8A6F)
   - Relayer: Not deployed (skipped)

3. **SnowsideSignet** (Chain ID: 33352 / 0x8248) — DEPLOYED & VERIFIED Session 11
   - Blockchain ID: 26XsRMLXezgJ1mK8TSVoHsRfBcy6Mwr4kJdKUAfgegb3PH4b5f
   - Subnet ID: 2W9boARgCWL25z6pMFNtkCfNA5v28VGg9PmBgUJfuKndEdhrvw
   - Local RPC: http://127.0.0.1:9654/ext/bc/26XsRMLXezgJ1mK8TSVoHsRfBcy6Mwr4kJdKUAfgegb3PH4b5f/rpc
   - Public RPC: https://rpc.snowside.network/signet
   - NodeID: NodeID-2QpdUKC81YfKoPwU4kuUA8er5FiNQ3V6w
   - Precompiles: Warp, NativeMinter (admin: ewoq), ContractDeployerAllowList (admin: ewoq)
   - ICM Status: NOT deployed (deploy failed during L1 creation due to cloned genesis; deploy separately with `avalanche icm deploy`)
   - Genesis: Cloned from SnowsideTestnet, patched with chainId 33352 + two precompile configs
   - Verified: NativeMinter minting works, DeployerAllowList blocks non-allowlisted deploys

### L1 Shared Configuration
- Token Name: ECX Token
- Token Symbol: ECX
- Consensus: Proof of Authority (PoA)
- ICM Messenger Address: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf
- ICM Registry Address: 0xB8e71012d3F55D9EbbFf74376dE180702c1D8A6F
- PoA Validator Manager: 0x0C0DEbA5E0000000000000000000000000000000
- Validator Transparent Proxy: 0x0Feedc0de0000000000000000000000000000000
- Funded account (ewoq): 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC (1,000,000 ECX)
  - Private Key: 56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
- ICM Deployer: 0x18cD02DB3100cb4382B61329aA2a8cBe4A24B40f (funded with 600 ECX + 1000 minted = ~1590 ECX)
- ICM c-chain Registry: 0x17aB05351fC94a1a67Bf3f56DdbB941aE6c63E25
- Validator Messages Lib: 0x9C00629cE712B0255b17A4a657171Acd15720B8C
- Validator Proxy Admin: 0xa0AffE1234567890ABcDef1234567890ABCdEF34
- Primary Nodes: NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg (port 9650), NodeID-MFrZFVCXPv5iCn6M9K6XduxGTYp891xXZ (port 9652)

### Nginx Reverse Proxy Configuration (/etc/nginx/sites-available/default)
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

        # Snowside Mainnet (ChainID: 32904) — Updated Session 12
        location /mainnet {
            proxy_pass http://127.0.0.1:9656/ext/bc/2WGjPQF6YcV3KN19d5x21Cj8VAvxrakA72Ke7RHtZJpQBJBkdV/rpc;
            proxy_set_header Host 127.0.0.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Snowside Testnet (ChainID: 33160) — Updated Session 12
        location /testnet {
            proxy_pass http://127.0.0.1:9658/ext/bc/2A45por6NN5o17NwKFTHTjyKhJobL8UPd92Sbi4ffaMfohRXRA/rpc;
            proxy_set_header Host 127.0.0.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Snowside Signet (ChainID: 33352) — Updated Session 11
        location /signet {
            proxy_pass http://127.0.0.1:9654/ext/bc/26XsRMLXezgJ1mK8TSVoHsRfBcy6Mwr4kJdKUAfgegb3PH4b5f/rpc;
            proxy_set_header Host 127.0.0.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

### Block Explorer Issue (Session 11)
The signet block explorer (explorer-signet.snowside.network) was showing stale block height (build-time fetch in Astro frontmatter).
**FIX (Session 12):** Rewrote explorer pages to use client-side `<script>` fetching with 15s auto-refresh. Block height now updates in real-time.
**Root cause:** Astro frontmatter `await getNetworkData()` runs at build time, freezing the block number at whatever it was when the static site was generated.

## File conventions
- All source files must include a comment at the file's path relative to the monorepo root (e.g., `// packages/web/src/components/Hero.astro`).
- Packages use `pnpm` with workspace filtering. Never use `npm` inside packages — always `pnpm`.
- `package-lock.json` must NOT exist in any package. Delete it if found. Only `pnpm-lock.yaml` at root.
- **Nav hash links** must use `/#` prefix (e.g., `href="/#about"`, not `href="#about"`) so they work from any page, not just the homepage. This is a static multi-page site, not a SPA.
- **Footer hash links** already follow this convention (`/#about`, `/#tech`, `/#value`, `/#roadmap`).

## Pages (packages/web)
- `/` — Landing page (index.astro): Nav, Hero, About, WhyAvalanche, ValueProposition, NodeRunr, ECash, Team, Roadmap, CTA, Footer
- `/whitepaper` — Whitepaper viewer page (whitepaper.astro) embedding `/whitepaper.pdf`
- `/whitepaper.pdf` — Static PDF endpoint generated by `src/pages/whitepaper.pdf.ts` (jsPDF)
- `/validators` — Validator onboarding page (validators.astro): hero, prerequisites, 5-step NodΞRunr deployment, monitoring, stopping/unstaking, references, CTA

## Pages (packages/docs)
- `/` — Introduction
- `/architecture/*` — Overview, BMM, Consensus, Gas Model, ICM Bridge, Security Model
- `/guides/connect-wallet` — Web3 wallet connection guide (MetaMask/Rabby) with RPC URLs, Chain IDs (Hex format escaped `\|`), and Explorer URLs for Mainnet, Testnet, Signet.
- `/guides/*` — Running a Validator, Deploying Contracts, Bridging USDC
- `/reference/*` — Glossary, Configuration

## Pages (packages/explorer)
- `/` — Mainnet explorer (renders directly at root)
- `/[network]/index.astro` — Dynamic routes for `/mainnet`, `/testnet`, `/signet`
- `functions/_middleware.js` — Cloudflare Pages Functions middleware. Intercepts subdomains (`explorer-testnet`, `explorer-signet`) and rewrites root `/` and deep links (e.g. `/tx/0x...`) to their respective static paths (`/testnet/`, `/signet/`) without URL redirects.
- Layout: `src/layouts/Base.astro`. Components: `Header.astro` (larger favicon, network switcher, dynamic title), `Search.astro` (handles Block/Tx/Address routing), `Footer.astro` (Avalanche & eCash links).
- Index UI: Etherscan-style stats grid (Latest Block, Gas Price, Chain ID, RPC URL).
- **KNOWN ISSUE:** Network config has stale Blockchain IDs from Session 7. Signet shows block 7 instead of 11+ because it is querying the old (dead) Blockchain ID.

## Pages (packages/bridge)
- `/` — Bridge main page with network selector and QR code display/scanner
- `/[network]/index.astro` — Dynamic routes for `/mainnet`, `/testnet`, `/signet`
- `functions/_middleware.js` — Cloudflare Pages Functions middleware for subdomain routing

## Analytics — Simple Analytics
- All 4 packages (web, pitch, docs, explorer) have Simple Analytics installed or available.
- Standard embed — no site ID needed, auto-detects domain.
- Script URL: `https://scripts.simpleanalyticscdn.com/latest.js`
- NoScript image: `https://queue.simpleanalyticscdn.com/noscript.gif`
- **Web & Pitch:** `<script is:inline async defer ...>` + `<noscript><img ...>` in `Base.astro` `<head>`. The `is:inline` directive is required so Astro does not bundle the external script.
- **Docs (Starlight):** `head` array in `astro.config.mjs` with `{ tag: 'script', attrs: { ... } }` and `{ tag: 'noscript', content: '...' }` entries. Starlight renders these as-is (no bundling).

## Tailwind CSS v4 with Astro
- **CRITICAL:** Use `@tailwindcss/postcss` (NOT `@tailwindcss/vite`). The Vite plugin has a rolldown incompatibility (`Missing field tsconfigPaths`) that breaks on Cloudflare Pages build servers even when it passes locally.
- Each Astro package needs a `postcss.config.mjs` with:
  `export default { plugins: { '@tailwindcss/postcss': {} } };`
- Remove the `tailwindcss()` Vite plugin from `astro.config.mjs` — PostCSS is auto-detected by Vite.
- **CRITICAL FIX (ENOENT):** In `global.css`, use `@import 'tailwindcss/index.css';` instead of `@import 'tailwindcss';`. Vite/Rolldown's native CSS parser sometimes fails to resolve the package import before the PostCSS plugin runs, causing `ENOENT: no such file or directory, open '.../tailwindcss'`.
- Keep `@theme` blocks in `global.css` — the PostCSS plugin processes them identically.

## Starlight (packages/docs)
- **CRITICAL:** In `.md` files, Starlight auto-injects ALL components (`Steps`, `Card`, `CardGrid`, `Item`, `Tabs`, `LinkCard`, etc.). Do NOT add `import` statements — they render as literal text on the page.
- Use `.md` files (NOT `.mdx`) for pages that use `<Steps>` with `<Item>`. `Item` is NOT exported from `@astrojs/starlight/components`, so you cannot import it explicitly in `.mdx`.
- Starlight social icons: use `"x.com"` (not `"x"`) for X/Twitter. Check valid icon names in the error message if unsure.
- Build output: `dist/` with one `index.html` per page + Pagefind search index + sitemap.
- The `head` array in `astro.config.mjs` accepts `{ tag, attrs, content? }` objects for injecting `<head>` tags without modifying layout files.

## Cloudflare Pages deployment
- **CRITICAL (pnpm 10+):** `pnpm.onlyBuiltDependencies` must be in `pnpm-workspace.yaml` at the root, NOT in `package.json`. pnpm 10 ignores the `package.json` field.
- **CRITICAL:** When changing dependencies (e.g., upgrading Astro), you MUST explicitly `git add pnpm-lock.yaml` and commit it. Cloudflare uses `--frozen-lockfile` and will fail with `ERR_PNPM_OUTDATED_LOCKFILE` if the lockfile doesn't match `package.json`.
- `.gitignore` must exclude: `node_modules/`, `dist/`, `.astro/`, `.env*` (except `.env.example`).
- Never commit `node_modules/` — if accidentally committed, run `git rm -r --cached node_modules`, add `.gitignore`, and amend the unpushed commit.

## Whitepaper
- **Current version: v0.3** (meta.ts `WHITEPAPER_VERSION = '0.3'`)
- PDF generated at build time via `packages/web/src/pages/whitepaper.pdf.ts` (Astro static endpoint using jsPDF).
- Content lives in `packages/web/src/data/whitepaper/content.ts` (15 sections, auto-numbered at render time).
- Figures are vector `Figure` objects in `packages/web/src/data/whitepaper/figures/` — **9 figures**.
- Fonts (`NotoSans-Regular/Bold/Italic.ttf`) in `packages/web/src/fonts/`.
- Viewer page at `/whitepaper` embeds the PDF via `<iframe src="/whitepaper.pdf">`.
- PDF.js is at `packages/web/public/pdfjs/` for any custom viewer needs.
- **Consensus terminology (v0.3):** Use "Snowman consensus" when referring to the linear-chain variant. "Snowball" is the broader protocol family.
- **eCash Terminology (v0.3):** Use "eCash" (not Bitcoin) when referring to miners, hashrate, L1 security source. Snowside is secured by eCash's SHA-256d PoW.
- **Settlement Model (v0.3):** Classified as "rollup-style settlement".
- **Roadmap (v0.3):** Two-phase model (Phase 1: Permissioned, Phase 2: Permissionless with AVAX + BTC).

## Favicon
- All four packages (`web`, `pitch`, `docs`, `explorer`) use the same SVG favicon at `public/favicon.svg`.
- Design: two snowmen side-by-side forming a literal "88" silhouette (Drivechain ID #88).
- Dark rounded-square backdrop (#0a0f1a, rx=14) — required so white snowmen are visible in light browser themes.
- If updating the favicon, update all four files and keep the SVG bodies identical.

## OG image
- `packages/web/public/og-image-v2.png` — 1200x630px.
- `packages/explorer` uses a copy at `packages/explorer/public/og-image.png`.
- **Cache-busting:** When replacing the OG image, use a versioned filename (e.g., `og-image-v3.png`).

## retro9000 grant link
- The Avalanche Foundation retro9000 grant announcement tweet: `https://x.com/AvalancheFDN/status/1932484367324229635?s=20`

## Pitch page isolation
- `packages/pitch/src/layouts/Base.astro` has `<meta name="robots" content="noindex, nofollow">`.
- **Zero links to `pitch.snowside.network` from the web package.**

## Landing page contrast pattern (packages/web)
The landing page alternates dark and light sections for visual rhythm.

| Section | Background | Text | Cards |
|---------|-----------|------|-------|
| Nav | surface-0/90 (blur) | white/slate-300 | — |
| Hero | surface-0->1 gradient | white/snow-400 | — |
| About | surface-1 (dark) | slate-300/snow-400 | — |
| WhyAvalanche | snow-50 (light) | slate-900 | surface-1 (dark cards) |
| ValueProposition | surface-0 (dark) | white/slate-300 | surface-2 badges |
| NodeRunr | snow-50 (light) | slate-900 | surface-1 placeholder |
| ECash | surface-1 (dark) | slate-300/snow-400 | — |
| Team | snow-50 (light) | slate-900/slate-700 | surface-1 badges |
| Roadmap | surface-0 (dark) | white/slate-200/snow-400 | — |
| CTA | snow-50 (light) | slate-900 | surface-1 buttons |
| Footer | surface-0 (dark) | slate-400/slate-500 | — |

## Footer structure (packages/web)
- **Sections:** About (`/#about`), Technology (`/#tech`), Value Proposition (`/#value`), Roadmap (`/#roadmap`)
- **Resources:** Documentation (docs.snowside.network), GitHub (github.com/abitsuite/snowside), Whitepaper (`/whitepaper`), Validators (`/validators`), NodΞRunr (layer1.run), Avalanche (avax.network)
- **Contact:** Discord (discord.gg/jVytngEWt), X / Twitter (x.com/0xShomari), Email (shomari@abitsuite.com)

## Handoff
- At the end of each session, update `docs/HANDOFF.md` with the current state and next steps.
- Include: what was done, what remains, build status, and any known errors.

### Tooling by Language

| Language | Tool | Workspace Config |
|----------|--------|------------------------------------|
| JS/TS | pnpm | pnpm-workspace.yaml (packages/*) |
| Go | go | go/subnet-evm/go.mod |
| Rust | cargo | rust/bmm-bidder/Cargo.toml |
| Solidity | Foundry | contracts/foundry.toml |

### Build Commands by Package

| Package | Build Command |
|------------|---------------------------------------|
| web | cd packages/web && pnpm build |
| pitch | cd packages/pitch && pnpm build |
| docs | cd packages/docs && pnpm build |
| explorer | cd packages/explorer && pnpm build |
| bridge | cd packages/bridge && pnpm build |
| subnet-evm | cd go/subnet-evm && ./scripts/build.sh |
| bmm-bidder | cd rust/bmm-bidder && cargo build |
| contracts | cd contracts && forge build |

## API Package (packages/api)
- **Stack:** Cloudflare Worker (`snowside-api`), Hono, Chanfana (OpenAPI), Zod.
- **Deployment:** `wrangler deploy` -> `snowside.network/v1*`.
- **OpenAPI UI:** Served directly at `/v1` (Swagger UI). Spec at `/v1/openapi.json`.
- **Backend Proxy:** Catch-all proxy forwards requests to Drynet 4 Esplora (`https://esplora.drynet4.drivechain.dev (testnet)`).

## Bridge Package (packages/bridge)
- **Stack:** Astro static site + Tailwind v4 (`@tailwindcss/postcss`).
- **Features:** Network selector dropdown (Mainnet/Testnet/Signet), HTML5 QR code scanner (`html5-qrcode`), QR code display for deposits.
- **Subdomains:** No subdomains used for networks; network selection is handled in-session.

## Terminal heredocs
- ALWAYS run `wc -l <file>` and `tail -n 15 <file>` after a heredoc to verify correctness. Multi-file pastes garble frequently, but the content is fine.
- Use `'EOF'` (single-quoted) delimiters to prevent shell expansion inside heredocs.
- For Python one-liners, use single quotes outside and double quotes inside: `python3 -c '...'`

## Bridge (Custodial MVP — TEMPORARY)

**⚠️ CRITICAL:** The current bridge is a **custodial/federated model**, NOT the full BIP-300/301 trustless peg. This is a temporary implementation that will be replaced with full BIP-300/301 integration in phases:
1. **Phase 1 (Current):** Custodial federation — federation holds keys, generates deposit addresses, mints ECX manually
2. **Phase 2:** Register Snowside as sidechain slot on eCash Signet (M1/M2), deploy bip300301_enforcer, switch to enforcer gRPC for deposit addresses and validation
3. **Phase 3:** Register on eCash Drynet/Testnet
4. **Phase 4:** Register on eCash Mainnet — full trustless peg with miner-voted withdrawals

### Current Architecture (Custodial MVP)
- **Federation service** (`packages/federation`): Node.js service, holds HD wallet (stubbed), generates deposit addresses, monitors Esplora for deposits, mints ECX on Snowside via NativeMinter precompile (0x0200...0001)
- **API** (`packages/api`): Cloudflare Worker with D1 database, REST endpoints for bridge UI + federation auth endpoints
- **Bridge UI** (`packages/bridge`): Astro static site on Cloudflare Pages, client-side fetch to API, QR codes, deposit/withdraw tabs, transaction history
- **D1 Database**: `snowside-bridge` (ID: 202053ef-9607-481d-9b73-185734164ea4)

### Future Architecture (Full BIP-300/301)
- **bip300301_enforcer** (Rust, on VPS): Watches eCash L1 via ZMQ, validates M5 deposits and M6 withdrawals, exposes gRPC at localhost:50051 — NOT YET RUNNING
- **Federation service** (Node.js + viem, Docker on VPS bchplease): Polls API for pending deposits, derives HD wallet addresses (bip32 + ecashaddrjs + bitcoinjs-lib), checks Esplora per-network, mints ECX via NativeMinter precompile, 10s poll interval
- **VPS**: bchplease (root@bchplease, Ubuntu 24.04, Docker 29.7.2)
- **Federation Docker**: `docker compose up -d --build` in /root/snowside/packages/federation
- Federation connects to enforcer gRPC instead of polling Esplora
- Deposits use enforcer `WalletService/CreateNewAddress` (proper P2SH with sidechain commitment)
- Withdrawals use M3/M4/M6 bundle process (13,150 ACKs over 26,300 blocks ≈ 6 months at 10-min block time)
- Bridge UI shows withdrawal voting progress (ACK count, blocks remaining)
- **NOT YET IMPLEMENTED** — enforcer not running, Snowside not registered as sidechain slot

### API Bridge Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /v1/bridge/status | Public | Federation online status |
| POST | /v1/bridge/deposit | Public | Create deposit request |
| GET | /v1/bridge/deposit/:id | Public | Get deposit status |
| GET | /v1/bridge/deposits/:address | Public | List deposits for address |
| POST | /v1/bridge/withdraw | Public | Submit withdrawal request |
| GET | /v1/bridge/withdrawals/:address | Public | List withdrawals |
| POST | /v1/fed/checkin | Bearer token | Federation heartbeat |
| GET | /v1/fed/deposits/pending | Bearer token | Get pending deposits |
| PATCH | /v1/fed/deposit/:id | Bearer token | Update deposit status |
| GET | /v1/fed/withdrawals/pending | Bearer token | Get pending withdrawals |
| PATCH | /v1/fed/withdraw/:id | Bearer token | Update withdrawal status |
| ALL | /v1/* | Public | Esplora proxy (catch-all) |

### D1 Schema
- `meta`: key/value table (federation check-in timestamps)
- `deposits`: id, network, snowside_address, ecash_address, amount_xec, amount_ecx, status, ecash_tx_hash, mint_tx_hash, timestamps
- `withdrawals`: id, network, snowside_address, ecash_address, amount_ecx, amount_xec, burn_tx_hash, ecash_tx_hash, status, timestamps
- **Future BIP-300 fields needed**: sidechain_slot, bundle_hash, ack_count, blocks_remaining, ctip_txid, ctip_vout

### BIP-300/301 Reference (for future upgrade)
- **BIP-300**: Hashrate Escrows — deposits/withdrawals via miner voting, OP_DRIVECHAIN opcode
- **BIP-301**: Blind Merged Mining — miners secure sidechain without running sidechain nodes
- **M5 (Deposit)**: L1 tx spending CTIP, creating new CTIP with more coins, includes destination L2 address
- **M6 (Withdrawal)**: L1 tx paying out from CTIP, requires 13,150 miner ACKs over 26,300 blocks
- **CTIP**: Single UTXO per sidechain holding all pegged coins (no UTXO bloat)
- **Sidechain slots**: Up to 256, each with own CTIP, proposed via M1, activated via M2
- **drynet4 block time**: 10 minutes (same as Bitcoin) → withdrawal period ≈ 6 months
- **bip300301_enforcer**: Rust app (github.com/LayerTwo-Labs/bip300301_enforcer), gRPC API, watches L1 via ZMQ
- **Enforcer RPCs**: ValidatorService/GetSidechains, GetChainInfo, GetChainTip; WalletService/CreateNewAddress, CreateSidechainProposal
- **Esplora**: https://esplora.drynet4.drivechain.dev (testnet) (eCash block explorer API, proxied via /v1/*)

### Deployment Status (End of Session 13)
- ✅ D1 database created (snowside-bridge)
- ✅ API code written (bridge + federation endpoints + Esplora proxy)
- ✅ Federation service skeleton written (monitoring + minting logic)
- ✅ Bridge UI updated (API integration, QR codes, status polling, history)
- ✅ D1 schema file written (packages/api/schema.sql)
- ✅ wrangler.toml updated with D1 binding (DB)
- ✅ D1 schema applied (meta, deposits, withdrawals tables)
- ✅ FEDERATION_TOKEN secret set on Cloudflare Worker
- ✅ API deployed to snowside.network/v1* (Cloudflare Worker)
- ✅ Bridge UI deployed to Cloudflare Pages (snowside-bridge project)
- ✅ Federation service running on VPS (bchplease) in Docker container
- ✅ "Connect Wallet" (Rabby/EIP-1193) implemented in bridge UI
