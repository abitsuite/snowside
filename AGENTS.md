# Snowside – Agent Instructions

## Monorepo structure
- `packages/web` – Astro static site (landing page + whitepaper + /validators), deployed to Cloudflare Pages via `master`
- `packages/pitch` – Astro static site (pitch.snowside.network), separate Cloudflare Pages project. **noindex, nofollow** — no links from web to pitch.
- `packages/docs` – Astro Starlight technical documentation (docs.snowside.network)
- `packages/explorer` – EVM block explorer (to be added)
- `go/subnet-evm` – Subnet-EVM fork with BMM coordination precompile (Go)
- `rust/bmm-bidder` – BMM bidder and settlement monitor (Rust)
- `contracts/` – Solidity smart contracts (Foundry)

## Repository Structure (Updated August 2026)

The Snowside monorepo uses language-specific top-level directories:

packages/     — JavaScript/TypeScript (pnpm workspace)
  web/ Main website (Astro)
  pitch/ Grant pitch page (Astro)
  docs/ Documentation site (Astro + Starlight)
  explorer/ EVM block explorer (to be added)

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

## Build & deploy
- Web build:     cd packages/web && pnpm build   # Astro static, output dist/
- Pitch build:   cd packages/pitch && pnpm build # Astro static, output dist/
- Docs build:    cd packages/docs && pnpm build  # Astro Starlight, output dist/
- Root build:    pnpm run build                  # runs web then pitch
- Dev web:       pnpm run dev:web
- Dev pitch:     pnpm run dev:pitch
- Dev docs:      pnpm --filter packages-docs run dev
- Production URLs: https://snowside.network (web), https://pitch.snowside.network (pitch), https://docs.snowside.network (docs)

## Avalanche L1 Network Infrastructure
- **VPS:** rpc.snowside.network (Ubuntu 24.04, Nginx reverse proxy)
- **Nginx Config:** /etc/nginx/sites-available/default on VPS
- **Cloudflare DNS:** rpc.snowside.network -> VPS IP
- **Deployment Tool:** Avalanche-CLI (requires letters only for blockchain names, no hyphens/underscores)

### Deployed L1s (Local Network on VPS)
1. **SnowsideMainnet** (Chain ID: 32904 / 0x8088)
   - Blockchain ID: 2sDVEVpwW8aNwgY1RMGzmFVXdJ1vyE1qWg3YBK8pGX8iy9iLtJ
   - Subnet ID: 2951oZXRAym6ThvANrFSCWbiSgh3mrgD5gJkACZbpnoic6Zczf
   - Local RPC: http://127.0.0.1:9654/ext/bc/2sDVEVpwW8aNwgY1RMGzmFVXdJ1vyE1qWg3YBK8pGX8iy9iLtJ/rpc
   - Public RPC: https://rpc.snowside.network/mainnet
2. **SnowsideTestnet** (Chain ID: 33160 / 0x8188)
   - Blockchain ID: 2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe
   - Subnet ID: wNWS35thzJy9fGaxtVfPwFKEt2RU2r9fMGA7c5A9XqqSvBCVj
   - Local RPC: http://127.0.0.1:9656/ext/bc/2PS8J5q5f4PXnwEsxLafFnPuFowprdaZ8EWuZpTF3hyi6SqLhe/rpc
   - Public RPC: https://rpc.snowside.network/testnet
3. **SnowsideSignet** (Chain ID: 33352 / 0x8288)
   - Blockchain ID: 2pwzxirqRyWrgegTjMyLH2s5RhSb8xNkSYt5y4KhLXyAzZ7PMc
   - Subnet ID: yeEMHr6rnkSvbgoZSc1BxaiMEnVFev4jkMDEmCZvpbZoeeosp
   - Local RPC: http://127.0.0.1:9658/ext/bc/2pwzxirqRyWrgegTjMyLH2s5RhSb8xNkSYt5y4KhLXyAzZ7PMc/rpc
   - Public RPC: https://rpc.snowside.network/signet

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

## Analytics — Simple Analytics
- All 3 packages (web, pitch, docs) have Simple Analytics installed.
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
- Keep `@import 'tailwindcss'` and `@theme` blocks in `global.css` — the PostCSS plugin processes them identically.

## Starlight (packages/docs)
- **CRITICAL:** In `.md` files, Starlight auto-injects ALL components (`Steps`, `Card`, `CardGrid`, `Item`, `Tabs`, `LinkCard`, etc.). Do NOT add `import` statements — they render as literal text on the page.
- Use `.md` files (NOT `.mdx`) for pages that use `<Steps>` with `<Item>`. `Item` is NOT exported from `@astrojs/starlight/components`, so you cannot import it explicitly in `.mdx`.
- Starlight social icons: use `"x.com"` (not `"x"`) for X/Twitter. Check valid icon names in the error message if unsure.
- Build output: `dist/` with one `index.html` per page + Pagefind search index + sitemap.
- The `head` array in `astro.config.mjs` accepts `{ tag, attrs, content? }` objects for injecting `<head>` tags without modifying layout files.

## Cloudflare Pages deployment
- `pnpm.onlyBuiltDependencies` must include `["esbuild", "sharp"]` in root `package.json` — otherwise pnpm 10 ignores their build scripts and CF builds fail.
- `.gitignore` must exclude: `node_modules/`, `dist/`, `.astro/`, `.env*` (except `.env.example`).
- Never commit `node_modules/` — if accidentally committed, run `git rm -r --cached node_modules`, add `.gitignore`, and amend the unpushed commit.

## Whitepaper
- **Current version: v0.3** (meta.ts `WHITEPAPER_VERSION = '0.3'`)
- PDF generated at build time via `packages/web/src/pages/whitepaper.pdf.ts` (Astro static endpoint using jsPDF).
- Content lives in `packages/web/src/data/whitepaper/content.ts` (15 sections, auto-numbered at render time).
- Figures are vector `Figure` objects in `packages/web/src/data/whitepaper/figures/` — **9 figures** (modeled on RISCy pattern):
  - `architecture-diagram.ts` — System architecture (Section 3)
  - `bmm-flow.ts` — BMM flow: eCash miners ↔ Settlement Proposers (Section 4)
  - `gas-flow.ts` — BTC gas flow: Users → Producers → Miners (Section 5)
  - `fee-model.ts` — Three-part fee model with vesting schedule (Section 5) **v0.2**
  - `role-separation.ts` — Validators vs Settlement Proposers (Section 4) **v0.2**
  - `icm-bridge.ts` — ICM USDC bridge (Section 6)
  - `consensus-layers.ts` — Three-tier confirmation model (Section 8)
  - `validator-economics.ts` — Validator cost/revenue balance (Section 9)
  - `permissionless-roadmap.ts` — Three-phase validation roadmap (Section 12) **v0.2**
- Fonts (`NotoSans-Regular/Bold/Italic.ttf`) in `packages/web/src/fonts/`.
- Viewer page at `/whitepaper` embeds the PDF via `<iframe src="/whitepaper.pdf">`.
- PDF.js is at `packages/web/public/pdfjs/` for any custom viewer needs.
- **Consensus terminology (v0.3):** Use "Snowman consensus" when referring to the linear-chain variant. "Snowball" is the broader protocol family.
- **eCash Terminology (v0.3):** Use "eCash" (not Bitcoin) when referring to miners, hashrate, L1 security source. Snowside is secured by eCash's SHA-256d PoW.
- **Settlement Model (v0.3):** Classified as "rollup-style settlement". Includes new architecture subsections for Merkle Root Aggregation, Settlement Failure / Mutable Aggregates, Fee Escrow Mechanism, BMM Coordination Precompile, Fast Withdrawal Service, BIP300 Operation Support, Sidechain Independence.
- **Roadmap (v0.3):** Reduced to a two-phase model (Phase 1: Permissioned, Phase 2: Permissionless with AVAX + BTC). Phase 3 / AVAX phase-out removed as speculative.

## Favicon
- All three packages (`web`, `pitch`, `docs`) use the same SVG favicon at `public/favicon.svg`.
- Design: two snowmen side-by-side forming a literal "88" silhouette (Drivechain ID #88).
- Dark rounded-square backdrop (#0a0f1a, rx=14) — required so white snowmen are visible in light browser themes.
- If updating the favicon, update all three files and keep the SVG bodies identical (only the path-comment line 1 differs).

## OG image
- `packages/web/public/og-image-v2.png` — 1200×630px. Both `packages/web` and `packages/pitch` `Base.astro` files reference `image = '/og-image-v2.png'`.
- Generated externally via a generative AI agent. The prompt lives in commit history and session handoffs.
- **Cache-busting:** When replacing the OG image, use a versioned filename (e.g., `og-image-v3.png`) to force social platforms to re-scrape. Update `Base.astro`'s `image` default to match.

## retro9000 grant link
- The Avalanche Foundation retro9000 grant announcement tweet: `https://x.com/AvalancheFDN/status/1932484367324229635?s=20`
- Linked in:
  - `packages/web/src/components/Team.astro` — SVG logo badge (red triangle "A" + white "retro9000" text on dark badge) + "grant from the Avalanche Foundation" text
  - `packages/docs/src/content/docs/reference/glossary.md` — NodeRunr entry markdown link
  - `packages/pitch/src/pages/index.astro` — Team section badges and links

## Pitch page isolation
- `packages/pitch/src/layouts/Base.astro` has `<meta name="robots" content="noindex, nofollow">` to prevent search engine and AI indexing.
- **Zero links to `pitch.snowside.network` from the web package.** The pitch page is only reachable via a direct URL.
- Simple Analytics still tracks visits to the pitch domain.

## Landing page contrast pattern (packages/web)
The landing page alternates dark and light sections for visual rhythm. The established pattern:

| Section | Background | Text | Cards |
|---------|-----------|------|-------|
| Nav | surface-0/90 (blur) | white/slate-300 | — |
| Hero | surface-0→1 gradient | white/snow-400 | — |
| About | surface-1 (dark) | slate-300/snow-400 | — |
| WhyAvalanche | snow-50 (light) | slate-900 | surface-1 (dark cards) |
| ValueProposition | surface-0 (dark) | white/slate-300 | surface-2 badges |
| NodeRunr | snow-50 (light) | slate-900 | surface-1 placeholder |
| ECash | surface-1 (dark) | slate-300/snow-400 | — |
| Team | snow-50 (light) | slate-900/slate-700 | surface-1 badges |
| Roadmap | surface-0 (dark) | white/slate-200/snow-400 | — |
| CTA | snow-50 (light) | slate-900 | surface-1 buttons |
| Footer | surface-0 (dark) | slate-400/slate-500 | — |

- Use theme tokens (`surface-0/1/2/3`, `snow-50/100/.../700`, `aval-600/700`, `btc`, `usdc`) from `global.css` — NOT raw Tailwind `gray-*` colors.
- Dark sections: `bg-surface-0` or `bg-surface-1`, text `text-slate-200/300`, headings `text-white`, accents `text-snow-400`.
- Light sections: `bg-snow-50`, text `text-slate-700`, headings `text-slate-900`, accents `text-aval-600`.
- `global.css` body has `background-color: var(--color-surface-0)` to prevent white flash before content renders.
- The `index.astro` wrapper is `bg-surface-0 text-slate-200` (dark base); each section overrides its own background.

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
| subnet-evm | cd go/subnet-evm && ./scripts/build.sh |
| bmm-bidder | cd rust/bmm-bidder && cargo build |
| contracts | cd contracts && forge build |
