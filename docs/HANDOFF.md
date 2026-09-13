# Snowside Handoff — 2026-09-13 (Session 21, Tour Deploy + Guardian CI)

## Session 21 summary — 2026-09-13

### 1. packages/tour (Slidev) — SCAFFOLDED, BUILT, DEPLOYED, CI-automated
- Slidev 0.49.29 + UnoCSS (`presetWind`) interactive 11-slide deck at `tour.snowside.network`.
- Cloudflare Pages project `snowside-tour` created; custom domain `tour.snowside.network` live (user created CNAME manually — API token lacks `Zone:DNS:Edit`).
- Post-build head injection (`scripts/inject-head.mjs`) for Simple Analytics + OG/Twitter meta + favicon + SPA `_redirects`. Empirically verified that Slidev v0.49.29 `seoMeta:` AND `head:` headmatter render client-side only (via unhead/Vue runtime) — neither appears in built static `index.html`; post-build injection is the ONLY reliable path for crawler-visible meta.
- **Rendering bug (first slide blank, overview chrome floating top-right):** root causes verified against built CSS —
  1. `.slidev-page` had `width:100%` but NO height (theme:none ships no theme CSS setting it) → `h-full` layouts resolved to 0-height invisible slides.
  2. `styles/snow.css` was NEVER LOADED — the `style:` headmatter field is stored as a config string, not processed as a CSS import. Slidev's styles virtual module (`chunk-YP37OZJY.js`) auto-discovers only: `styles/index.{ts,js,css}`, `styles.css`, `style.css`. Renamed `snow.css` → `styles/index.css` (auto-discovered path).
  3. UnoCSS `@apply` with custom shortcuts (e.g. `@apply slide-canvas`) does not expand in the build pipeline → `.slidev-layout` base rule silently dropped. Converted all `@apply` to plain CSS with literal values.
  - Fix commit `d26914c6`: verified `.slidev-page{height:100%}` + `.slidev-layout h1{font-size:3rem...}` now present in built CSS.
  - **NOTE:** user reports blank slide persists even after hard refresh + cache clear. Static HTML/CSS/JS confirmed correct on Cloudflare edge. Suspect remaining client-side rendering bug in the height chain between `#app` and `.slidev-page` — a missing intermediate container needing `height:100%`. DEBUGGING DEFERRED per user priority shift to CI.

### 2. GitHub Actions guardian workflow — DEPLOYED, ALL JOBS GREEN
- Workflow file: `.github/workflows/guardian.yml` (commit `397eb7b2`). Model follows sidecoin `guardian.yml` reference.
- **8 build jobs** (quality gates, labeled in Actions sidebar): `build-{web,pitch,canvas,docs,explorer,bridge,tour,api}`. Each installs `--frozen-lockfile`, builds. API build uses `wrangler deploy --dry-run` (compile check, no upload). No test suites yet — build success IS the gate.
- **8 deploy jobs** gating on their build job, `if: push && master`, `environment: production-*` with live URL: `deploy-{web,pitch,canvas,docs,explorer,bridge,tour,api}`.
- All 7 Cloudflare Pages packages were disconnected from CF Pages git integration by the user — **this workflow is now the SOLE deploy path** for all of them. The API Worker deploys via `wrangler deploy`.
- First run (`34753414848`): all 16 jobs green. `build-canvas` failed once on a transient corepack/undici `assert(!this.paused)` network hiccup during pnpm tarball download (Node 24 network bug); `gh run rerun --failed` → green.
- Secrets used: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CODECOV_TOKEN` (all set by user).

### 3. Codecov configuration
- `codecov.yml` at repo root: `informational: true` status (never fails CI on coverage drops), `flag_management` default rules for per-package flags, `ignore` rules for static assets / dist / .astro / node_modules.
- No coverage uploads yet (no tests). When tests are added, slot `codecov-action@v5` upload step into the relevant `build-*` job following the sidecoin pattern.

### 4. Cloudflare auth + credentials persistence
- API token `cfut_Gvyh4...` (hello@abitsuite.com, account `2cdd50405dc13f86476f4d03e1ad1282`) verified via `wrangler whoami`. Token lacks `Zone:DNS:Edit` scope — DNS CNAME records must be created manually in the Cloudflare dashboard.
- Credentials persisted at `~/.cloudflare.env` on host (chmod 600, sourced from `.bashrc` + `.profile`) and at `/home/abitsuite/.cloudflare.env` on aBitSuite VM.
- `wrangler 4.120.0` installed as root `devDependencies` (commit `b878638b`); CI uses `npx wrangler` (pnpm hoists from root devDeps).

### 5. aBitSuite VM SSH/NAT reconfiguration
- VirtualBox headless VM `aBitSuite`: NIC switched bridged → NAT; port forward `2224→22` (matches APECS=2222, Sansbank=2223).
- `openssh-server` installed + running on VM; host `~/.ssh/id_rsa.pub` installed to `/home/abitsuite/.ssh/authorized_keys`.
- SSH config alias `abitsuite-vm` (HostName 127.0.0.1, Port 2224, User abitsuite, IdentityFile ~/.ssh/id_rsa) added to host `~/.ssh/config`.

### 6. Slidev SKILL doc verified
- Official Slidev SKILL.md (190 lines) at https://github.com/slidevjs/slidev/blob/main/skills/slidev/SKILL.md + 6 reference files read. Key finding: `seoMeta:` headmatter is presented as canonical OG/Twitter method but empirically renders client-side only in v0.49.29. `favicon:` frontmatter DOES render in static HTML.

---

## Session 20 summary — 2026-09-10 (Avalanche Node Incident + Restart-Proofing)

### 1. Incident: unattended-upgrades wiped out mainnet C-chain sync progress (AGAIN)
Timeline (all from `avalanche` VPS logs / journal, 170.75.160.146):
- Sep 4 15:10 UTC — Mainnet C-chain state sync COMPLETED; block execution began, reached 511,935 / 645,761 (79.3%)
- Sep 8 12:32:47 — FATAL crash: `duplicate metrics collector registration attempted` (X Chain handler, avalanchego-internal bug, NOT OOM). systemd auto-restarted 12:33:17 (NRestarts=1). Node entered mandatory post-state-sync snapshot wipe (`Deleting state snapshot leftovers`, kind=storage)
- Sep 8→9 — wipe ran 25h6m, deleted 1,052,960,000 entries, last entry Sep 9 16:48:47
- Sep 10 06:04:49 — `apt-daily-upgrade.service` started; 06:05:03 unattended-upgrades began upgrading 23 packages INCLUDING glibc (`libc6`)
- Sep 10 06:05:27 — systemd reexec; 06:05:29 needrestart sent SIGTERM to BOTH avalanchego units (graceful, exitCode 0); 06:07:00 SIGKILL; 06:07:02 auto-restart
- Sep 10 06:12:13 — `starting state sync` FROM SCRATCH. The interrupted wipe voided the entire completed state sync.

### 2. Root-cause facts (verified this session)
- **avalanchego v1.14.2 state sync is ATOMIC — no resume.** The sync-completed marker is only durable after the post-sync wipe finishes. Restart during state sync OR wipe = full restart from zero. Log proof: `triesRemaining=2,277,705` after restart (original Aug 28 count: 2,452,072).
- The killer was **needrestart** (installed, v3.11), triggered by unattended-upgrades' glibc upgrade — NOT a human, NOT a panic (the journal goroutine dump was shutdown noise).
- No mainnet C-chain snapshot exists to restore from (backups cover Snowside L1s only; LunaNode copy plan was post-bootstrap).

### 3. Prevention applied — Project Lead approved BOTH (`avalanche` VPS only)
1. `/etc/needrestart/conf.d/avalanchego.conf` → `$nrconf{override_rc}{q(^avalanchego)} = 0;` — needrestart can NEVER restart any `avalanchego*` unit (even on manual apt runs).
2. `/etc/apt/apt.conf.d/20auto-upgrades` → both `"0"` — unattended-upgrades fully disabled. Backup: `20auto-upgrades.bak-20260910`.
3. Verified: `Unattended-Upgrade::Automatic-Reboot` already false (default).
- AGENTS.md now carries the full **ZERO-RESTART RULE** section (HARD RULES 1–4) — read it before touching this box.

### 4. Snowside VPS exposure — checked, safe
- 5 avalanchego procs run via avalanche-cli, NO systemd units → needrestart cannot restart them.
- Auto-reboot off. Unattended-upgrades deliberately LEFT ON (public-facing; worst case = seconds-long nginx/docker blip, not a sync wipe).

### 5. Current node status (Sep 10 ~21:34 UTC)
- All chains `isBootstrapped: false`.
- C-chain: re-running state sync, `triesRemaining=2,272,484`, node-reported ETA ~60h (oscillates; first pass of this phase took ~7 days). After state sync, the wipe will run AGAIN (last pass: 25h+) — **ZERO-RESTART window; any restart = full reset again.** Flag loudly when C.log shows `Deleting state snapshot leftovers`.
- X-chain: finished post-restart work Sep 10 06:12, waiting on C.
- Disk `/mnt/avax-data`: 783G/984G used (84%), 151G free — regrowing during state sync; watch item.
- Both node processes healthy (uptime ~15.5h at check time).

### Known issues / next steps
1. Monitor C-chain state sync → wipe window → `isBootstrapped: true` (Project Lead's top priority; ICTT blocked on this).
2. On bootstrap: validator fee budget decision → node funding → genesis patch (new authority `0x895fEE1F9F364805d21d56add85fa6E2608d1c11`, mnemonic-derived at `m/44'/60'/88'/0/0`) → `avalanche blockchain create/deploy SnowsideMainnet --mainnet` → ICM → USDC ICTT.
3. Post-bootstrap: two-pass rsync copy of mainnet db to second LunaNode-account VPS (EXCLUDE `staking/`).
4. Peg-in broadcast (13.37 ECX, slot 88) still awaiting Project Lead's 4 answers (broadcast path, policy fallback, L2 destination confirm, crediting method).
5. AGENTS.md stale-ID cleanup pass (Session 19 note) still pending: live blockchain IDs are in Session 19 section below.
6. Restore drill not yet performed; old `avax-sync` VPS (170.75.170.236) teardown pending; bchplease manual decommission pending.
7. Optional: R2 off-box backups; gpg-encrypt backups before MEGA/R2 (HD_MNEMONIC also controls chain authority now); multisig admin migration before Phase 2.

---

## Session 19 summary — 2026-09-02

### 1. Snowside stack migrated bchplease → new VPS `snowside`
- New VPS: `ubuntu@snowside` / `root@snowside` (172.81.181.52, 4 vCPU / 7.8GB / 67GB, Ubuntu 24.04)
- bchplease is fully shut down (all services stopped+disabled, incl. bitcoind/drynet4) — server left running, Project Lead decommissions manually
- All 5 avalanchego nodes (2 bootstrap :9650/:9652 + 3 L1 :9656/:9658/:9654), nginx, snowside-federation Docker live on snowside
- DNS `rpc.snowside.network` cut over; federation healthy (`federation_online: true`)
- **Live blockchain IDs (AGENTS.md ones are STALE — networks redeployed Aug 19):**
  - Mainnet: `5ox6qUHAswB18Je6riq69xUToXQ3wQu4H4uXSPE1xeVF38KDb` (chain 32904/0x8088)
  - Testnet: `22Y9NRt9rdnh5qVMEeod9XLE9cJytvpqg4p82ac72tAu6t9fKL` (chain 33160/0x8188)
  - Signet:  `2MYRvevRa4YSoQfdgHtn2kbjUvNRZsE29cj8rPZ2okCCDFgBwF` (chain 33416/0x8288)

### 2. Base moved /root/ → /home/ubuntu/ (Project Lead requirement)
- Everything lives under `/home/ubuntu/`: `.avalanche-cli/`, `snowside/`, `bin/`, `genesis/`, `backups/`, `docs/`
- All avalanchego processes run as user `ubuntu` (NOT root)
- `/root/` is clean. All flags.json / config.json / network.env / systemd unit rewritten
- Gotcha: `avalanche network start` resolves base dir from `$HOME` — must run as `sudo -u ubuntu -H`

### 3. Daily HOT backup system (zero-downtime)
- Script: `/home/ubuntu/snowside/scripts/backup-snowside.sh`
- Timer: `snowside-backup.timer` — daily 03:00 UTC (`systemctl list-timers snowside-backup.timer`)
- Output: `/home/ubuntu/backups/snowside-YYYYMMDD-HHMMSS.tar.zst` + `.sha256` (~30 MB, from ~400 MB)
- Tier 1 only: chain state (`local/`, current `runs/`), `subnets/`, `key/`, federation `.env`, scripts, genesis, nginx+ssl, systemd unit. Binaries excluded (re-downloadable).
- HOT = crash-consistent (Pebble/LevelDB WAL replay on restore, same as power-loss recovery). Nodes NEVER stop.
- **Two-pass rsync:** pass 1 bulk, pass 2 delta-only (excludes `*.log`) — shrinks the compaction race window from minutes to seconds.
- Integrity: `zstd -t --long=31` + sha256 per snapshot. Retention: last 7 local copies.
- Restore runbook: `/home/ubuntu/backups/RESTORE.md`
- Download latest snapshot locally: see `/home/ubuntu/backups/DOWNLOAD-LATEST.txt`

### ⚠️ NOTE FOR FUTURE SESSION: Cloudflare R2 backup storage
Project Lead wants backups pushed off-box to **Cloudflare R2** (currently manual scp → MEGA).
Suggested implementation when picked up:
1. Create R2 bucket (e.g. `snowside-backups`) in the aBitSuite CF account (ID `2cdd50405dc13f86476f4d03e1ad1282`) + R2 API token (S3-compatible creds)
2. Install `rclone` on snowside VPS, configure an `r2:` remote (S3 endpoint `https://<account-id>.r2.cloudflarestorage.com`)
3. Add an upload step at the end of `backup-snowside.sh` (or a systemd `ExecStartPost=`) — e.g. `rclone copyto $ARCHIVE r2:snowside-backups/`
4. Use R2 lifecycle rules for retention (keep local 7, keep R2 e.g. 30)
5. Keep the MEGA manual flow as fallback until R2 is verified end-to-end

### Known issues / next steps
- Mainnet C-chain on `avalanche` VPS (170.75.160.146) still finishing storage-trie state sync (was 26,272/2,452,072 remaining at 07:02 UTC Sep 2) — then ~250K block execution → bootstrapped → ICTT unblocked (Project Lead's top priority)
- AGENTS.md still contains stale blockchain IDs + stale bchplease references — needs a cleanup pass
- Restore drill (boot a snapshot on alt ports) not yet performed
- Old `avax-sync` VPS (170.75.170.236) teardown still pending

---

## Session 18 summary — 2026-08-23

### Primary Task: Publish Lean Canvas to canvas.snowside.network + wire OG posters

Two deliverables: (1) a new Cloudflare Pages site `canvas.snowside.network` for the
Snowside Lean Canvas (PNG view + PDF download), and (2) OpenGraph posters for both
the new canvas site and the existing pitch site.

### Decisions
- **Format:** Astro static page rendering the high-res Lean Canvas PNG inline
  (instant view, responsive) + PDF & PNG download links. PDF kept for vector-quality
  download; PNG served for instant viewing.
- **OG poster format:** 1200×630 (Project Lead's standard OG format; 1.91:1 —
  note: NOT 16:9, this is the Facebook/Meta `og:image` standard).
- **Hosting:** Cloudflare Pages project `snowside-canvas` (mirrors `snowside-pitch`),
  separate from the API Worker (`snowside-api`).
- **ImageMagick** used to resize both posters from 2048×1152 → 1200×630
  (fill + center-crop via `-resize 1200x630^ -gravity center -extent 1200x630`).

### New Package: packages/canvas
- `astro.config.mjs` — site `https://canvas.snowside.network`, static output.
- `package.json` — `@snowside/canvas`, deps: astro 7.2.0, tailwindcss 4.3.2,
  @tailwindcss/postcss 4.3.3, wrangler 4.120.0 (devDep). Scripts: dev/build/preview/lint/deploy.
- `postcss.config.mjs` — @tailwindcss/postcss (NOT vite plugin).
- `tsconfig.json` — astro/strict.
- `wrangler.toml` — Pages config (name `snowside-canvas`, pages_build_output_dir `dist`).
- `src/layouts/Base.astro` — full OG + Twitter meta, OG image
  `/snowside-lean-canvas-poster.png` (1200×630), Simple Analytics, no noindex.
- `src/components/Nav.astro` — fixed nav, "Download PDF" button.
- `src/components/Footer.astro` — links to main site, whitepaper, docs, GitHub, PDF.
- `src/pages/index.astro` — hero + full-res Lean Canvas PNG (4724×2233) inline +
  download buttons (PDF, PNG, whitepaper).
- `src/styles/global.css` — `@import 'tailwindcss/index.css'` (ENOENT fix applied
  from day one), Snowside theme palette.
- `public/favicon.svg` — copied from pitch (identical snowmen-88 design).
- `public/snowside-lean-canvas.png` — 4724×2233, full canvas (720K).
- `public/snowside-lean-canvas.pdf` — 1 page, 512K (from ~/Downloads).
- `public/snowside-lean-canvas-poster.png` — 1200×630 OG poster (832K).

### Pitch OG Fix (packages/pitch)
- `public/snowside-pitch-poster.png` — 1200×630 OG poster (908K, from ~/Downloads).
- `src/layouts/Base.astro`:
  - image default `/og-image-v2.png` → `/snowside-pitch-poster.png`
    (the `/og-image-v2.png` file never existed in pitch/public — OG was broken).
  - og:image dimensions 1200×630 → 2048×1152 → 1200×630 (corrected to actual).
  - Descriptive og/twitter image alt text added.
- `src/styles/global.css` — `@import 'tailwindcss'` → `'tailwindcss/index.css'`
  (pre-existing ENOENT build break, now fixed; pitch build passes).

### Root package.json
- Added `build:canvas` and `dev:canvas` scripts.
- `build` now runs web → pitch → canvas.

### Cloudflare Deployment (aBitSuite account, ID 2cdd50405dc13f86476f4d03e1ad1282)
- **Pages project `snowside-canvas` created** via `wrangler pages project create`.
- **Custom domain `canvas.snowside.network`** registered on the project via
  Cloudflare API (POST /accounts/.../pages/projects/snowside-canvas/domains).
  - Domain id: 76a4b99f-9f27-4f37-a29c-f3f18aa0f17c
  - zone_tag: bfaf301d3c139d78abfb585895c4a8f4
  - Project Lead added the DNS CNAME (canvas → snowside-canvas.pages.dev, proxied)
    via dashboard — wrangler OAuth token lacked DNS:Edit scope.
  - Status: **active** (certificate + validation both active).
- **DNS CNAME created by Project Lead** (not via API; `wrangler login` token lacked
  DNS:Edit scope — `wrangler login` consent screen would need "Edit Cloudflare DNS"
  checked to do this programmatically in future).
- **Deployments:**
  - canvas → https://snowside-canvas.pages.dev (HTTP 200) + https://canvas.snowside.network (active)
  - pitch → https://snowside-pitch.pages.dev + https://pitch.snowside.network
- **Cache purge:** Ran `POST /accounts/.../pages/projects/{project}/deployments/purge_cache`
  for both projects after poster resize, so crawlers immediately fetch 1200×630.

### Verification (via Cloudflare edge IP 172.67.184.230 — local resolver lagged)
- canvas.snowside.network: custom domain **active** (certificate + validation both active)
- canvas HTML: og:image → https://canvas.snowside.network/snowside-lean-canvas-poster.png
- canvas poster: 1200×630 PNG (GIMP-corrected, 950336 bytes) ✅
- canvas OG meta: width 1200, height 630 ✅
- canvas PDF: application/pdf, 512403 bytes ✅
- pitch.snowside.network poster: 1200×630 PNG (GIMP-corrected, 1032326 bytes) ✅
- pitch OG meta: width 1200, height 630 ✅

### Poster Crop Fix (end of session)
- The first ImageMagick resize (2048×1152 → 1200×630 via `-resize 1200x630^ -gravity center -extent 1200x630`) cropped off the bottom text on both posters.
- Project Lead re-exported both posters in GIMP with correct framing (1200×630, bottom text intact).
- Re-copied from `~/Downloads/snowside-lean-canvas-poster.png` (950336 bytes) and `~/Downloads/snowside-pitch-poster.png` (1032326 bytes) into `packages/canvas/public/` and `packages/pitch/public/` respectively.
- Rebuilt, redeployed, cache-purged, verified live. **Lesson:** for posters with text near edges, prefer manual framing in GIMP over ImageMagick center-crop.

### Commits (3 pushed to master)
1. `41afa496` — feat(canvas): add canvas.snowside.network Lean Canvas site + pitch OG poster
2. `3dbb0d91` — fix(og): resize posters to 1200x630 (standard OG format)
3. `81032a0f` — fix(og): replace cropped posters with GIMP-corrected versions (1200x630)

### Build Status
- **Canvas build:** ✅ PASSES (1 page, ~600ms)
- **Pitch build:** ✅ PASSES (1 page, ~700ms) — was broken (ENOENT tailwindcss import), now fixed
- **Root build (web → pitch → canvas):** ✅ all pass
- **Cloudflare Pages:** ✅ both deployed, cache purged, custom domains active

### Known Issue: wrangler OAuth scopes
- `wrangler login` token (stored at ~/.config/.wrangler/config/default.toml, email
  hello@abitsuite.com) lacks DNS:Edit scope. Could not create the `canvas` CNAME
  via API (code 10000 "Authentication error" on /zones/.../dns_records).
- Workaround: Project Lead added the CNAME via dashboard.
- Future fix: re-run `wrangler login` and ensure "Edit Cloudflare DNS" scope is
  checked on the consent screen, OR create a Cloudflare API Token with DNS:Edit
  and set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID env vars.

### Files Modified/Created This Session
- `packages/canvas/` — new package (10 files: config, layout, components, page, styles, public assets)
- `packages/pitch/src/layouts/Base.astro` — OG image + dimensions + alts
- `packages/pitch/src/styles/global.css` — tailwindcss ENOENT fix
- `packages/pitch/public/snowside-pitch-poster.png` — new OG poster (GIMP-corrected)
- `package.json` — canvas build/dev scripts
- `pnpm-lock.yaml` — updated (wrangler + canvas deps)
- `AGENTS.md` — documented packages/canvas, canvas.snowside.network, Pages projects list, wrangler OAuth DNS:Edit scope limitation, cache-purge API
- `docs/HANDOFF.md` — this file

### Next Steps
1. **Visually verify OG posters** by pasting https://canvas.snowside.network and
   https://pitch.snowside.network into a social card preview tool
   (e.g. https://socialsharepreview.com or platform debugger) to confirm the
   1200×630 GIMP-corrected posters render as `summary_large_image` cards with no
   text cut off.
2. **Verify canvas.snowside.network** in a browser — confirm the Lean Canvas PNG
   renders crisply and the PDF/PNG download links work.
3. **Optional:** Add a link to `canvas.snowside.network` from the main web package
   (packages/web) footer/nav — currently no link exists web → canvas (canvas is
   indexable, unlike pitch, so a link may be desirable).
4. **Optional:** Re-run `wrangler login` with "Edit Cloudflare DNS" scope checked
   so future subdomain DNS records can be created via API without dashboard
   workarounds.

### Previous Session
Session 17 (2026-08-18): Whitepaper v0.4 final corrections (missing font glyphs
U+2212/U+2192). See git log for details.
