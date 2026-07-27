# Snowside Handoff — 2026-07-26 (Session 5, Final Update)

## Purpose
Snowside is an Avalanche L1 sidechain project requesting eCash Drivechain ID #88. The monorepo at `/Workspace/abitsuite/snowside` includes a landing page (`snowside.network`), a pitch page (`pitch.snowside.network`), and a docs site (`docs.snowside.network`), alongside the L1 execution layer (`go/subnet-evm`), BMM bidder (`rust/bmm-bidder`), and core contracts (`contracts/`).

## Monorepo structure

    snowside/
    ├── AGENTS.md
    ├── package.json          # pnpm workspace root
    ├── pnpm-workspace.yaml   # packages: ['packages/*']
    ├── .gitignore
    ├── docs/                 # Session handoffs + meta docs
    │   └── HANDOFF.md
    ├── packages/
    │   ├── web/  # Astro static — Landing + Whitepaper v0.3 + /validators (snowside.network)
    │   ├── pitch/ # Astro static — Pitch page (pitch.snowside.network) — noindex,nofollow
    │   └── docs/ # Astro Starlight — Technical docs (docs.snowside.network)
    ├── go/
    │   └── subnet-evm/ # Subnet-EVM fork with BMM coordination precompile (Go)
    ├── rust/
    │   └── bmm-bidder/ # BMM bidder and settlement monitor (Rust)
    └── contracts/ # Solidity smart contracts (Foundry)

## Session 5 summary — 2026-07-26

### Task 1: Monorepo Restructuring & Scaffolding
- System prerequisites verified: Go upgraded from 1.17.12 to 1.23.12, Rust 1.90.0, Node 24.14.0, Foundry 1.7.1.
- Go upgraded to 1.23.12 due to Subnet-EVM requirements.
- Created top-level directories: `go/`, `rust/`, `contracts/`.
- Scafflolded `go/subnet-evm/` from `ava-labs/subnet-evm` (commit hash recorded in `.upstream-commit`).
- Scafflolded `rust/bmm-bidder/` as a binary crate, added CLI skeleton (`run`, `status`, `submit`), dependencies (`reqwest`, `tokio`, `clap`), and example config.
- Scafflolded `contracts/` with Foundry. Added `IBMMCoordination.sol` interface, placeholder `Peg.sol` and `FeeDistribution.sol`, configured `foundry.toml`.
- Updated `.gitignore` to exclude Rust `target/`, Go `build/`, Foundry `out/`, `cache/`, and `lib/`.
- Committed initial scaffolding (rust + contracts) to `master`.
- Fixed missing `go/subnet-evm/` directory (initial script omitted `mkdir -p go/subnet-evm`, which was corrected in a follow-up command).
- Added `go/subnet-evm/README.md`.
- Determined `go/subnet-evm` uses `Taskfile.yml` and `./scripts/build.sh` instead of a `Makefile` for builds.

### Build status — all packages pass

| Package | Status |
|---------|--------|
| packages/web | ✅ |
| packages/pitch | ✅ |
| packages/docs | ✅ |
| go/subnet-evm | ✅ (using ./scripts/build.sh) |
| rust/bmm-bidder | ✅ |
| contracts | ✅ |

## Next session: New Session — Continue L1 Development

The context window will be cleared. The next session begins with implementation of the BMM coordination precompile in `go/subnet-evm/` and expanding the `rust/bmm-bidder` RPC capabilities.

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

### Local testing network
- Set up a local Avalanche network with the modified Subnet-EVM
- Deploy contracts
- Test BMM coordination end-to-end

### Image placeholders (still need real images)
- `Hero.astro` — commented-out hero illustration placeholder
- `WhyAvalanche.astro` — 6th card is a dashed-border placeholder for architecture diagram
- `NodeRunr.astro` — surface-1 card placeholder for NodΞRunr dashboard / terminal screenshot

### Open Whitepaper Questions (from v0.3 plan, items 21-23)
- Contract Fee: Optional or required? (Currently says "required on EVM calls")
- Vesting Schedule: Still intended? (50% → 80% over 18 months)
- Validator Distribution: 50% equal / 50% proportional still intended? Sybil mitigation plan?

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
    │   └── build.sh                 # Build script (replaces Makefile)
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

---
*Generated at end of Session 5. Next session: New context window — Continue L1 Development. Maintained per AGENTS.md.*
