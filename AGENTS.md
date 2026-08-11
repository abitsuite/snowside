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
1. **SnowsideMainnet** (Chain ID: 32904 / 0x8088) — NEEDS REDEPLOY
   - Blockchain ID: 2sDVEVpwW8aNwgY1RMGzmFVXdJ1vyE1qWg3YBK8pGX8iy9iLtJ (STALE — was cleaned)
   - Subnet ID: 2951oZXRAym6ThvANrFSCWbiSgh3mrgD5gJkACZbpnoic6Zczf (STALE)
   - Public RPC: https://rpc.snowside.network/mainnet (currently 404)
   - Precompiles: Warp only

2. **SnowsideTestnet** (Chain ID: 33160 / 0x8188) — NEEDS REDEPLOY
   - Blockchain ID: 2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe (STALE — was cleaned)
   - Subnet ID: wNWS35thzJy9fGaxtVfPwFKEt2RU2r9fMGA7c5A9XqqSvBCVj (STALE)
   - Public RPC: https://rpc.snowside.network/testnet (currently 502)
   - Precompiles: Warp only

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

        # Snowside Mainnet (ChainID: 32904) — STALE, needs redeploy
        location /mainnet {
            proxy_pass http://127.0.0.1:9654/ext/bc/2sDVEVpwW8aNwgY1RMGzmFVXdJ1vyE1qWg3YBK8pGX8iy9iLtJ/rpc;
            proxy_set_header Host 127.0.0.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Snowside Testnet (ChainID: 33160) — STALE, needs redeploy
        location /testnet {
            proxy_pass http://127.0.0.1:9656/ext/bc/2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe/rpc;
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
The signet block explorer (explorer-signet.snowside.network) shows block height 7 instead of 11+.
This is because the explorer was built with the OLD signet Blockchain ID (2pwzxirq...) and needs to be updated with the NEW Blockchain ID (26XsRMLX...).
The explorer's network config likely has hardcoded Blockchain IDs that need updating for all three networks.
**FIX:** Update packages/explorer network config with new Blockchain IDs, rebuild, and redeploy to Cloudflare Pages.

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
- **Backend Proxy:** Catch-all proxy forwards requests to Drynet 4 Esplora (`https://esplora.drynet4.drivechain.dev`).

## Bridge Package (packages/bridge)
- **Stack:** Astro static site + Tailwind v4 (`@tailwindcss/postcss`).
- **Features:** Network selector dropdown (Mainnet/Testnet/Signet), HTML5 QR code scanner (`html5-qrcode`), QR code display for deposits.
- **Subdomains:** No subdomains used for networks; network selection is handled in-session.

## Terminal heredocs
- ALWAYS run `wc -l <file>` and `tail -n 15 <file>` after a heredoc to verify correctness. Multi-file pastes garble frequently, but the content is fine.
- Use `'EOF'` (single-quoted) delimiters to prevent shell expansion inside heredocs.
- For Python one-liners, use single quotes outside and double quotes inside: `python3 -c '...'`
