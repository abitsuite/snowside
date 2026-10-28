# Snowside Handoff — 2026-10-28 (Session 29 — SNOWSIDE MAINNET LAUNCHED: SnowsideMainnet LIVE on Avalanche Mainnet + SnowsideTestnet LIVE on Fuji; both public RPCs cut over)

## Session 29 (PM) — 2026-10-28: 🎉 SNOWSIDEMAINNET DEPLOYED TO AVALANCHE MAINNET — MAINNET LAUNCH COMPLETE

**Project Lead funded the deployer key with 5 AVAX; full deployment executed in one run. Snowside's mainnet is LIVE.**

### Final on-chain state (all verified on Avalanche Mainnet via our own mainnet node)
- **Subnet ID:** `252afdxnKNWTVgpjLfCY9KrAs4rBU7DwFaPoS1LQ4BCw1TTAXL`
- **Blockchain ID:** `ZLcxUyuZxVshKtyhK7ZnaUJRCyS6cvb7CPHXWryjjsMCWa63f` · EVM chainId **32904 (0x8088)** (preserved — federation config stays valid)
- **ConvertSubnetToL1Tx:** `bGeRpNwhCBVUn584FTjyMUsaS5baQkTfgwxnH9DEKYcRRPP8Y` (fee: 0.000036992 AVAX — post-Etna dynamic fees; NO static 1 AVAX subnet fee any more)
- **Validator:** `NodeID-HhtdACE7m9XfiRgQHb2dGchvW8WYMod1V` (the snowside box's mainnet node itself; weight 100; ValidationID `2YE3hLXtMXQroz9WkHxGWUYFa9RLdwrAB26o59BWxwHKqCAYQM`; 3 AVAX bootstrap balance ≈ 2+ months of the ~1.33 AVAX/mo continuous L1 validator fee — **top up before exhaustion**)
- **PoA Validator Manager INITIALIZED** ✅ — proxy `0x0Feedc0de0000000000000000000000000000000`
- VMID `dk9HWWWW1YGB5mZX48ABvu8fq2YTqdByWP7XjL2HnvkNGa5nr` (= ids.FromString("SnowsideMainnet"), verified by base58 decode); subnet-evm v1.15.1 plugin staged at `/home/ubuntu/avax-data/mainnet/plugins/dk9HWWWW...` (sha256 42f68125..., byte-identical to the Fuji testnet's plugin)
- Genesis: canonical repo `genesis.mainnet.json` (authority `0xE5104794...`, no ewoq)
- Deployer key `snowside-mainnet-deployer`: C `0x0D0ce1b68dFA781620F344abE9Bd1e4BB3723C2b` / P `P-avax1c6lwxjmjvja364mct3e4auprjjan52ys8dqyz2`; **remaining: 1.8998 AVAX on P + 0.0999 on C** (total spent ≈ 3.0002 AVAX of the 5)
- **Public RPC CUT OVER:** nginx `/mainnet` on the snowside box → `http://127.0.0.1:9650/ext/bc/ZLcxUyu.../rpc` (mainnet node, same box — no rpc-proxy needed). Verified publicly: `eth_chainId` = 0x8088, `net_version` = 32904. `/testnet` unchanged (0x8188, Fuji-backed).
- Node config: `--track-subnets 252afdxn...` added to `avalanchego-mainnet.service` (daemon-reload + restart executed with approval; node fully synced → no state-sync exposure; primary network re-bootstrapped in ~2 min, node added to the L1 validator set, health passing)
- **Local mainnet L1 instance (`XUW2TN...`, port 9656) RETIRED** as public backend (nginx no longer references it). The shared local 5-node avalanche-cli network stays up ONLY for local signet (`SSM5SA.../9654`). Full teardown deferred until signet migrates.

### New mainnet-only blockers solved (full details in AGENTS.md gotcha #6)
1. **`avax.getAtomicTxStatus` removed in avalanchego v1.15** → `avalanche key transfer` C→P dies after the export, stranding 4.9 AVAX in atomic memory. **FIX: wrote `/tmp/avalanche-cli-src/importhelper/main.go`** (Go helper using the CLI module's wallet SDK) — issued P-chain ImportTx `2ptzUR6whuYDWJ4KUSA5ZMmGLswXpKsMEu716eqU1nk3bevxUE`, funds landed.
2. **blst SIGILL on LunaNode vCPUs** — FIX: `CGO_CFLAGS="-O -D__BLST_PORTABLE__"`. Go 1.24.9 tarball at `/home/ubuntu/go-sdk`.
3. **Interactive prompts in non-TTY:** `--bootstrap-endpoints http://127.0.0.1:9650` skips the local-machine-validator prompt (else the CLI would spin up a throwaway local node as the L1 validator!); other prompts answered via `printf '\\033[B\n' | script -qec "avalanche ..." /dev/null`.
4. **`--change-owner-address` must be P-chain bech32** (`P-avax1...`), not hex.
5. **Deploy crashed after subnet+chain creation** → patched sidecar with real IDs → `blockchain convert --mainnet --verify-input=false --bootstrap-filepath ... --validator-manager-address 0x0Feedc0de... --validator-manager-blockchain-id ZLcxUyu...` ✅.
6. **Second signature-aggregator v0.6.0 instance for mainnet:** config `/home/ubuntu/sigagg-mainnet-config.json` (api-port **9294**, metrics 9295, tracked 252afdxn..., peer 127.0.0.1:9651), log `sigagg-mainnet.log`, verified `Connected` on both primary net + L1 subnet. Peer field is `"ip"` not `"address"`. Fuji instance (9194) still running alongside.

### Session 29 PM addendum — Signet made permanent + ICM deployed on both public L1s

**Project Lead decisions executed:** (A) keep SnowsideSignet as a LOCAL L1 **indefinitely** (no public Avalanche signet exists; $0 marginal cost on the snowside box); (B) deploy ICM Messenger/Registry on both public L1s.

**A. Signet persistence (DONE):**
- `avalanche-local-network.service` — systemd unit (enabled) that starts the avalanche-cli local network at boot via `/home/ubuntu/snowside/scripts/start-local-network.sh` (idempotent: health-checks signet RPC for chainId 0x8288, no-ops when healthy — `avalanche network start` errors if the network is already running). Tested: active (exited), SUCCESS.
- Backup scope: local-network chain state was ALREADY covered (`backup-snowside.sh` copies the current run dir + `local/` + `localNetworks.json`). Added the previously-missing pieces: `rpc.snowside.network` nginx file (the script only had the stale `default`), both sigagg configs, all systemd units (avalanchego-mainnet, avalanchego-fuji, avalanche-local-network, snowside-backup.*), and the importhelper tool (`/tmp` is volatile). Test backup verified: 30M archive, all new items present.
- **SCRIPT BUG FOUND + FIXED:** the starter script initially used the stale pre-Session-28 signet blockchain ID (`SSM5SAcB8...`) from a handoff summary; live chain is `SSM5SAKaoXPpMmHmYvKYMdsKQya4JBYKj6Z13163Ka7dh34MK` (repo AGENTS.md was already correct).
- **ARCHITECTURE FACT (corrects an earlier note):** there is NO socat rpc-proxy on the snowside box. Both boxes sit on the same LunaNode private LAN `172.16.0.0/20` (snowside=172.16.0.3, fuji=172.16.0.6); nginx `/testnet` proxies straight to the fuji box's API over the LAN. Fully boot-persistent (avalanchego-fuji.service on the fuji box). NOTE: the fuji box's API port 9650 is reachable on the LAN interface — consider ufw-restricting it to the LAN subnet.

**B. ICM deploys (DONE, bytecode-verified on both chains):**
- SnowsideTestnet (Fuji): Messenger `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`, Registry `0xb44A78D552BD05410eE57e24Fdb6c4E8DeC098f1`
- SnowsideMainnet (Mainnet): Messenger `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`, Registry `0xf95e4182c0a0F42a3d997ea66117585160187ea7`
- Command pattern: `avalanche icm deploy --blockchain <Name> --fuji/--mainnet --endpoint <api> --rpc-url <chainRPC> --genesis-key` — the CLI funds the deploy from the genesis-allocated ICM deployer key `0x18cD02DB3100cb4382B61329aA2a8cBe4A24B40f` (600 ECX alloc; CLI stores it as `cli-teleporter-deployer.pk`). Registry addresses differ per network (deployer nonce); Messenger is canonical everywhere.
- Genesis alloc note: funded accounts on the public L1s are authority `0xE5104794...` (1M ECX), ICM deployer `0x18cD02...` (600 ECX), and `0xA5B6ac71129e9E5904a5C021728dBaBA61454B54` (60 ECX — likely `cli-awm-relayer.pk`; unverified).

### Next steps (priority order)
1. ~~ICM Messenger/Registry deploys on BOTH public L1s~~ **DONE Session 29 PM**
2. Federation pre-launch fixes + go-live (chain IDs already correct at index.ts:51-53 — verify against live chains)
3. BIP-300/301 phase planning; ICM → USDC ICTT
4. ~~Retire local signet~~ **CANCELLED — signet is permanent local infra** (Session 29 PM decision); the shared local 5-node network stays up permanently under `avalanche-local-network.service`. Optional cleanup: untrack the retired local mainnet chain (`XUW2TN...`) from the local network.
5. Add validator-balance monitoring alert (<0.5 AVAX) for the mainnet L1 validator fee (burn: ~512 nAVAX/s ≈ 1.33 AVAX/mo at floor price; top up via `avalanche validator increaseBalance`)
6. Deferred: R2 off-box backups, snowside-sync-old termination, key-rotation decision

---

## Session 29 (AM) — 2026-10-28: SnowsideTestnet deployed to Fuji + public RPC cutover + local testnet retired

**Agenda items executed: (1) public RPC cutover ✅, (2) local testnet retired ✅, (3) docs updated ✅, (4) Mainnet deployment → COMPLETED same-day PM (see above).**

### Fuji deployment completed (from Session 28's local-only state)
- **Subnet ID:** `pm4MzUMND7UwYgpxrh5W3N4nMLH2oTABv2MzDMJcR22LTX2Ac` · **Blockchain ID:** `2QBczAGdbEM1AUraueoHea5LqDkB8oxyQfJbzq4oSNBrCyXTd1` · EVM chainId **33160** (unchanged — federation chain-ID config stays valid)
- ConvertSubnetToL1Tx: `LypNksbLMm1hUm9X4dQodLfKRbEGtsNouMbk4KK4gxWGsXeri` (Fuji P-chain)
- Validator: `NodeID-CpGgARD7bidReR7bPCr7k23aSBtq8Q2eA` (snowside-fuji box; weight 100; ValidationID `mX4WLw3qHj1BWGcs3iCnhEjggxwRUYBDGJAK41C1qnbU48VUE`); unit has `--track-subnets pm4Mz...`; chain bootstrapped, blocks advancing
- **PoA Validator Manager INITIALIZED** (`avalanche contract initValidatorManager` ✅) — proxy `0x0Feedc0de0000000000000000000000000000000`
- Deployer key `snowside-fuji-deployer` = `0xA2B7D20E2E3F759512A5625AE858DdBF8b2A728B`; genesis = canonical repo testnet genesis (authority `0xE5104794...`, no ewoq)

### Root-cause trilogy for `failed to connect to a threshold of stake` (full detail in AGENTS.md → "Public-network L1 deployment")
1. **avalanchego min-version law:** v1.15.1 nodes enforce `MinimumCompatibleVersion=1.15.0` on handshake (`peer.go shouldDisconnect()`); CLI-pinned signature-aggregator **v0.5.3** embeds a **1.14.0** client → silently disconnected → aggregator never reached our only validator. FIX: manually run **signature-aggregator v0.6.0** (connects cleanly; verified `"Connected"` on primary + subnet).
2. **CLI wipes aggregator config** (`tracked-subnet-ids`/`manually-tracked-peers` emptied on every run) → manual config `/home/ubuntu/sigagg-config.json` on the snowside box (api 9194 / metrics 9195; binary `/home/ubuntu/sigagg-v060/signature-aggregator`; log `/home/ubuntu/sigagg-manual.log`).
3. **`--signature-aggregator-endpoint` needs the FULL path**: `http://127.0.0.1:9194/aggregate-signatures` (`init_validator_manager.go:264`).
- Also: `blockchain deploy --fuji` dies at the interactive VMC prompt → sidecar patch + `blockchain convert --fuji --verify-input=false` (procedure in AGENTS.md).

### Public RPC cutover (rpc.snowside.network/testnet)
- Fuji box API binds 127.0.0.1 only and the box sits behind 1:1 NAT (private addr 172.16.0.6) → **`rpc-proxy.service`** (socat `172.16.0.6:9650` → `127.0.0.1:9650`, systemd, enabled). ufw: `9650/tcp` allowed from **172.16.0.3 only** (snowside box private IP — same /20 LunaNode fabric, traffic never leaves the DC).
- snowside box nginx `/etc/nginx/sites-available/rpc.snowside.network`: `/testnet` → `http://172.16.0.6:9650/ext/bc/2QBcz.../rpc`; `nginx -t` + reload; **VERIFIED PUBLICLY: `https://rpc.snowside.network/testnet` → eth_chainId 0x8188, blockNumber advancing.** /mainnet and /signet untouched (still local L1s).

### Local testnet retired
- nginx no longer serves local chain `9Z7YJq...`. **The shared 5-node local network keeps running** (local mainnet XUW2TN/9656 + signet SSM5SA/9654 still depend on it) — per-chain teardown impossible; full cleanup deferred until those cut over.

### Mainnet deployment (IN PROGRESS)
- Same flow + gotchas as Fuji (all documented). Gate: **mainnet deployer key needs AVAX funding** (Project Lead action).

### Next steps
1. Fund mainnet deployer key → run the Mainnet deploy (create→convert→track→init VMC) → cut over rpc.snowside.network/mainnet → retire local mainnet+signet network.
2. ICM Messenger/Registry on Fuji-backed testnet; federation wiring; docs/HANDOFF for Snowside Lodge backend URLs.

---

# Previous: 2026-10-26 (Session 28 PM — ALL THREE L1s REDEPLOYED + rpc.snowside.network LIVE w/ LE TLS; desktop app has live backends)

## ⏭️ NEXT SESSION AGENDA (Project Lead directive, end of Session 27)
**Federation + BIP-300 bridging.** Work queue:
1. Monitor Fuji sync to completion (snowside-fuji, started Oct 25 ~10:07 UTC, 2 vCPU — expect days; verify NRestarts=0)
2. L1 redeploys from genesis — authority `0xE5104794FB44D45b0f821d77a685A17ee2E35b9C`, NO ewoq; check Avalanche-CLI > v1.9.6 first (v1.15.x compatibility unverified)
3. Federation pre-launch fixes (inventoried Session 26): parameterize chain IDs (`packages/federation/src/index.ts:51-53`, old IDs dead) · rename `EWOQ_PRIVATE_KEY`→`MINTER_PRIVATE_KEY` · strip/gate `test-mint.ts` · generate new HD_MNEMONIC offline (Project Lead holds) + wire `.env` template
4. Federation go-live on snowside (image `snowside-federation:latest` already staged, 530MB)
5. BIP-300/301 phase planning (bip300301_enforcer, sidechain slot registration on eCash)
6. DNS repoint `rpc.snowside.network` → 172.81.178.61 + nginx + certbot
7. ICM → USDC ICTT → validator economics
**Deferred:** R2 off-box backups · `snowside-sync-old` (172.81.181.52, old account) termination · key-rotation decision (chat-transmitted key) · 13.37 ECX peg-in revisit · dependabot vulns (19).

---

## Session 28 (PM) — 2026-10-26: L1 redeploys COMPLETE + rpc.snowside.network live + genesis canonicalized

**Agenda items (2) and (6) DONE.** All three L1s redeployed from canonical repo genesis and verified end-to-end; public RPC live with Let's Encrypt TLS.

### Genesis canonicalization (commit `1c617c21`)
- ewoq (`0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC`) removed from ALL 6 canonical genesis files (3 occurrences in each genesis.subnet.json, 2 in each genesis.json); replaced with authority `0xE5104794FB44D45b0f821d77a685A17ee2E35b9C` (checksum-validated via viem). Chain IDs preserved: mainnet 32904 / testnet 33160 / signet 33416. README verification command updated.
- **README selector fix (PM):** correct `readAllowList(address)` selector is `0xeb54dae1` (was documented as 0xab6f7e5a — wrong; precompile errors "invalid function selector").

### L1 redeploy (avalanche-cli v1.9.6, avalanchego v1.14.0 + subnet-evm v0.8.0, all on snowside box)
| L1 | ChainID | Blockchain ID | L1 node API port |
|---|---|---|---|
| SnowsideMainnet | 32904 ✓ | XUW2TNsFmyKDEubBG6e4TfeZo33e5dzogg8kBpzXH8zcWWrwZ | 9656 |
| SnowsideTestnet | 33160 ✓ | 9Z7YJqinePVfUG9or3twu6aHYxfymqJNsmcJ8iW6pC2JVAkZV | 9658 |
| SnowsideSignet | 33416 ✓ | SSM5SAKaoXPpMmHmYvKYMdsKQya4JBYKj6Z13163Ka7dh34MK | 9654 |
- Verified per chain: `eth_chainId` correct + `readAllowList(authority)` = 0x02 (admin) + authority balance = 1,000,000 ECX. ICM Messenger 0x253b2784... + Registry 0xf95e4182c0a0F42a3d997ea66117585160187ea7 deployed on all three + local C-chain; Relayer deployed. NOTE: ContractDeployerAllowList precompile NOT present on any chain (canonical genesis deploy — Session 11's signet-only DeployerAllowList came from the old clone-patch flow; re-add only if deploy gating is wanted).
- **TWO PERMANENT BOX MODS** (full details in `snowside:/home/ubuntu/snowside/RESTORE.md` + AGENTS.md): (1) avalanchego port shim wrapper at `~/.avalanche-cli/bin/avalanchego/avalanchego-v1.14.0/avalanchego` rewrites CLI bootstrap ports 9650-9653 → 9660-9663 (mainnet Avalanche node owns 9650/9651 — without the shim, `--local` deploys FATAL on bind); (2) `~/bin/avalanche` binary-patched: string `http://127.0.0.1:9650` → `http://127.0.0.1:9660` (orig at `avalanche.orig`) — the CLI hardcodes the local endpoint to 9650 and would otherwise talk to the REAL mainnet node (balance precheck failure). Re-apply both if CLI/avalanchego versions change.
- CLI deploy quirks: `blockchain deploy --local` needs `-e` (ewoq P-chain key for local ops; L1 ownership is authority) + `--http-port/--staking-port` for the dedicated L1 node. Deploys are sequential (CLI lock). ICM cross-chain config prompt did NOT hang the deploy this run (exited cleanly on its own).

### rpc.snowside.network (nginx + certbot)
- `/etc/nginx/sites-available/rpc.snowside.network` (symlinked, sites-enabled): locations /mainnet /testnet /signet → the three L1 RPCs. certbot `--nginx` installed + LE cert issued (expires ~2027-01-24), 80→443 redirect.
- **Verified end-to-end:** `https://rpc.snowside.network/{mainnet,testnet,signet}` → correct chain IDs; **Worker proxy `https://snowside.network/mainnet` → 0x8088 (32904) LIVE**. DNS `rpc` A → 172.81.178.61, **orange-cloud flip DONE + verified (PM):** CF edge cert (Google Trust Services WE1), `server: cloudflare` + cf-ray, all 3 chains 200, no redirect loop (SSL mode is Full or better). Origin LE cert valid → keep mode at **Full (strict)**.
- **aBitSuite VirtualBox VM SHUT DOWN (PM, Project Lead approved)** — was only up for Cloudflare deploys (holds the working `CLOUDFLARE_API_TOKEN` at `~/.cloudflare.env`; restart it headless via `VBoxManage startvm aBitSuite --type headless` + `ssh abitsuite-vm` if CF API access is needed again).
- Explorer package needs NO changes (queries URL paths, chain IDs preserved). Desktop app needs NO changes (Worker URLs + runtime chain detect).

### Remaining
- Federation go-live (agenda 3-4): chain IDs in `packages/federation/src/index.ts:51-53` are now CORRECT again (32904/33160/33416); still needs EWOQ_PRIVATE_KEY rename + test-mint.ts gate + new HD_MNEMONIC + image rebuild/re-stage if changed, then `docker compose up -d`.
- BIP-300/301 planning (agenda 5), ICM→USDC ICTT (agenda 7), Fuji sync monitoring (agenda 1).
- Desktop app live smoke test (`pnpm tauri dev`) — backends are now live, so this is unblocked.
- Optional: R2 backups reinstatement (deferred), systemd units for the 3 L1 nodes (currently CLI-managed local network; survives via `avalanche network start` after reboot — automating is future work).

---

## Session 28 — 2026-10-26: Tauri desktop client (Track 1) built for mainnet launch

**Decision (Project Lead):** two tracks — **Track 1 (this session): ship a standalone Snowside Tauri v2 desktop app before mainnet launch end of week.** Track 2 (upstream BitWindow integration for slot 88) deferred until after Track 1 ships. Slot 88 mainnet activation is real/near-term: M1 already submitted to Alphanet AND Betanet. Snowside's "lite client" model = thin client against **hosted backends at `https://snowside.network/[mainnet|testnet]`** (NOT a traditional local light node) — architecturally matches the upstream `solana` external-node precedent (`chains_config.json` `"external": true`, orchestrator keeps no wallet/binary for it; see drivechain-frontends `sidechain/solana/client.go`, BMM-only `BMMNode` impl).

**Built in `packages/desktop` (Tauri v2 + React 19 + Vite 7 + Tailwind 4):** sail_ui/BitWindow-style UX cloned in React — TopNav icon+label tabs: **Overview** (wallet summary, chain stats grid mirroring explorer cards, federation status), **Wallet** (create/import key, receive QR, send w/ legacy gasPrice), **Bridge** (Deposit w/ address-assignment polling + QR / Withdraw w/ zero-address burn + submit / History — against verified Worker contracts in `packages/api/src/index.ts`), **Network** (3-network probes + switching), **Console** (log + raw JSON-RPC), **Settings** (theme, editable RPC/API endpoints, wallet danger zone). Deps added: `viem@^2.21`, `qrcode.react@^4.2`. All RPC via `@tauri-apps/plugin-http` (CORS-free in webview, native-fetch fallback in browser dev); chain ID auto-detected per endpoint for signing (survives L1 redeploys with new chain IDs). Rust: `tauri-plugin-http` registered; capabilities = `http:allow-fetch*` (verified in `gen/schemas/acl-manifests.json` — plugin has NO `default` set); window 1100x760, title Snowside; favicon copied from web. Both `pnpm build` (tsc+vite) and `cargo check` PASS.

**Known gaps / follow-ups (pre-launch):** (1) RPC routes DONE (Session 28): Worker proxies `snowside.network/{mainnet,testnet,signet}` → `rpc.snowside.network/*` (`packages/api/src/index.ts` RPC_UPSTREAMS + 3 new wrangler.toml route patterns; 22/22 tests pass, dry-run bundle OK). **DEPLOYED Session 28:** Version `eb0d2e01-1341-4693-b9e6-c34b6cf34e87`, all 4 routes live (`/v1*` + `/mainnet*` `/testnet*` `/signet*`). Verified: `/v1/bridge/status` 200, homepage 200, `/mainnet` → Worker → upstream 522 (rpc.snowside.network origin dark — **DNS repoint DONE Session 28: `rpc` A → 172.81.178.61, DNS-only/grey; orange-cloud re-enable blocked until nginx rpc server block + certbot cert land on the VPS (both pending L1 redeploys); box currently serves port 80 only, no certs, no rpc block**). **Credentials: `~/.cloudflare.env` on the local VirtualBox `aBitSuite` VM (ssh alias `abitsuite-vm`, 127.0.0.1:2224) holds a WORKING `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (aBitSuite acct). The wrangler OAuth tokens on BOTH the dev box and that VM are dead (`invalid_grant` on refresh).** VM was started headless for this and left running. Upstream `rpc.snowside.network` currently dead (curl HTTP 000 — DNS repoint + nginx + certbot still pending from Session 27 agenda; proxy returns 502 until then); (2) private key in plaintext localStorage (MVP — OS keychain hardening TODO, mirror of custodial-MVP posture); (3) no updater yet (`@tauri-apps/plugin-updater` + appcast parity with BitWindow/Thunder auto_updater); (4) chain IDs in `networks.ts` are hints only (32904/33160/33416 all DEAD post-data-loss — runtime auto-detect covers signing, hints used for display fallback); (5) wallet stores ONE key (no HD/multi-account yet); (6) desktop app NOT yet smoke-tested against a live RPC (`pnpm tauri dev` requires a display); (7) withdrawal amount formatting in History assumes ECX decimal string from API.

**Track 2 prep notes (for later):** BitWindow mirror updated to `b40181d99` (was 1,387 behind): `sail_ui` RPC layer moved to new top-level `sidechain_core` package; `chains_config.json` now v27 w/ new entries `drivechaind`, `bbc` (slot 1), `freebank` (slot 130), `solana` (slot 8, external); new `docs/remote-enforcer.md` (sidechain daemons against remote `--mainchain-grpc-url`); BitWindow tabs now Overview/Wallet/Sidechains/**Mining**/Learn/Console/Chat/Settings.

---

## Session 27 — 2026-10-25 (PM): dedicated Fuji box provisioned + syncing

**Decision (Project Lead):** Fuji is REQUIRED permanently (Betanet = official/unofficial testnet for testing). Chose **c.2 ($40/mo — 2 vCPU / 9G / 193G SSD)** over c.4 ($80): disk was the only hard gate (Fuji db ~56G + OS → m.4 35G and m.8 70G both dead; c.2's 200G fits with re-sync headroom). Total infra: **$200/mo** ($160 c.8 + $40 c.2) — still under the old $219.

- **snowside-fuji = 170.75.160.200** (recycled snowside-sync IP; stale host key removed from known_hosts). Ubuntu 26.04.1, specs verified (2 vCPU / 9G / 193G).
- **Provisioned:** packages updated/upgraded (pre-avalanchego, the sanctioned window) · **fio-VERIFIED 1,424 fsync-durable IOPS** (SSD-class, STORAGE LAW compliant) · ZERO-RESTART hardening (needrestart override `/etc/needrestart/conf.d/avalanchego.conf` + unattended-upgrades disabled `/etc/apt/apt.conf.d/20auto-upgrades`) · avalanchego **v1.15.1** in `/home/ubuntu/bin/` · C chain config state-sync+pruning+hashdb · systemd unit enabled · ufw (22, 9651 tcp+udp).
- **Node live:** started 10:07 UTC, `active`, NRestarts=0, **NodeID-CpGgARD7bidReR7bPCr7k23aSBtq8Q2eA** (new identity — old NodeID-8W5LU retired with the wiped db). Fresh full sync from zero on 2 vCPU — expect days; no ETA promises.
- **Old Fuji remnants on snowside:** unit file remains but disabled (harmless); vdc db wiped with the volume.

---

# Previous: 2026-10-25 (AM)

## Session 27 — 2026-10-25 (AM): mainnet db moved back to SSD, block-storage volume eliminated

**Cost decision executed (Project Lead approved):** with the post-compaction db at 385G and 479G free on the c.8 SSD, the db no longer needed block storage. Moved back, volume detached, fstab cleaned.

- **Move:** node stopped 01:53 UTC (approved stop/start) → rsync 385G vdc→`/home/ubuntu/avax-data/mainnet/` in 1h55m @ ~57MB/s → dry-run verify (`rsync -aHni --delete`, zero diffs) → unit repointed (`--data-dir=/home/ubuntu/avax-data/mainnet`) → started 03:57 UTC → caught up 7,576 blocks in ~7 min → **P/X/C all bootstrapped True, 582 peers, NRestarts=0**
- **Volume eliminated:** vdc contents wiped (mainnet-node 385G redundant + fuji-node 56G slated-for-repair + legacy 55G) → unmounted → fstab entry removed (backup at `/etc/fstab.bak-pre-vdc-removal`). **USER ACTION: delete the 1000GB volume in the LunaNode panel** → cost drops $219/mo → **$160/mo**
- **Backup target relocated:** `backup-snowside.sh` `BACKUP_DIR` now `/home/ubuntu/backups` (SSD)
- **Final disk state:** root SSD 389G used / **96G free** (below the 100G sync-era guideline — acceptable post-sync: db is pruning-bounded; see caveat below)
- **⚠️ Caveat (recorded):** a future from-scratch mainnet re-sync on the bare SSD would run razor-thin (sync peak was ~440–450G). If that day comes: re-attach a volume or burst-rent storage BEFORE starting the sync.
- **Fuji:** unchanged — stopped/disabled, full wipe + re-sync pending. Burst c.4 rental when needed (approved pattern) instead of a permanent second box.

---

# Previous: 2026-10-25 (MAINNET BOOTSTRAP COMPLETE)

## 🎉 MAINNET BOOTSTRAP COMPLETE — 2026-10-23 18:01 UTC

**The rebuild's gating milestone is DONE.** After 3+ weeks and 5 disk-full crash-resets, the mainnet node finished state sync on vdc with **zero restarts** (NRestarts=0 across the entire 4.6-day run) and is now live in consensus:

- **Timeline:** state sync started Oct 19 02:05 → pre-sync wipe done 03:23 (1h18m) → account trie done 05:05 → commit/flush ~8.5h → storage tries (2.4M) done Oct 23 ~10:00 (~24,400 tries/h sustained) → block execution 394,910 blocks in 7h24m (finished 17:30) → **consensus started 18:01:41 UTC** (lastAcceptedHeight 98,355,925)
- **Verified Oct 25 01:38 UTC:** `isBootstrapped` P/X/C **all True**, 597 peers, C-chain RPC serving at tip (`eth_blockNumber` = 0x5de9778 = 98,355,064), NRestarts=0
- **Post-compaction db size: 385G** (was 431G+ pre-sync; compaction pruned ~110G off vdc usage). Root SSD has 479G free → **the pruned db now fits on the SSD with ~94G headroom** — the post-bootstrap placement decision is now actionable (move back to SSD = tight but possible, vs. resize plan vs. stay on vdc)
- **This unblocks:** Fuji repair (wipe db+chainData → re-sync, or own box) · DNS repoint + nginx + certbot · L1 redeploys from genesis (authority 0xE5104794...) · ICM → USDC ICTT → federation go-live

---

# Previous: Session 26 — 2026-10-19 (Mainnet db → vdc + Federation Groundwork)

## Session 26 summary — 2026-10-19

### ⚠️ Disk-full crash-loop: 4 more crashes (NRestarts 1→5) — root cause: 484G SSD physically too small
- Crash timeline (all identical: `FATAL node/node.go:1482 low on disk space`; LevelDB closed cleanly each time, no corruption): Oct 13 23:51 · Oct 14 23:00 · Oct 17 08:47 · Oct 17 17:04 · Oct 18 02:31 (all UTC).
- **Every crash reset C's in-flight state sync to zero** (atomicity rule). C was ~3h45m from done at crash #1 and inside the final account-trie phase (ETA ~1–22m) around the later ones — days of progress repeatedly lost.
- Measured Oct 18: mainnet db alone = **430G and still growing** on the 484G root SSD; C's final trie burst + post-sync wipe churn pushes the fs to 0 bytes. The Oct-14 Fuji→vdc move (freed 55G) and the Oct-15 legacy-db wipe (freed 246G) each only bought ~1–2.5 days before the next crash.

### Option A executed (Oct 15): legacy mainnet db wiped from vdc
- Deleted `/mnt/backups/legacy-pre-migration-2026-10-12/mainnet/db` (246G); `plugins/` (63M) + `staking/` (16K) preserved on vdc. The pre-migration fallback's role was expired.
- Controlled stop for this op: `systemctl stop` timed out → SIGKILL (C reset again — counted above).
- **New hazards (both hit):** (a) rsync under `nohup … &` still died of broken pipe — the generator wrote progress to the dead SSH stdout; use `setsid … > log 2>&1 < /dev/null &`. (b) A partial copy silently filled the root SSD to ENOSPC; the "73G free" df reported during that window was phantom deleted-but-open space held by the SIGKILL'd process — real free was ~0. After the final mainnet restart, df agreed with du (412G real).

### MAINNET DB MOVED TO VDC (Oct 19, Project-Lead-approved: "ONLY option is to move back to vdc")
- rsync `/home/ubuntu/avax-data/mainnet/` → `/mnt/backups/mainnet-node/`: 431G in ~2.2h (~52MB/s avg; vdc bulk-write is fine — it's fsync that's slow). **Verified 1:1** via dry-run `rsync -aHni --delete` → 0 diffs.
- Unit edited: `--data-dir=/mnt/backups/mainnet-node` (chainData + logs stay on SSD at `/home/ubuntu/avax-local/mainnet/`), daemon-reload, source deleted → **root SSD 479G free (2% used)**.
- Node live Oct 19 01:59 UTC: 574 peers, health passing, NodeID-HhtdACE7 preserved. P ✅, X ✅ (finished executing Oct 16 01:26; re-executed only 64 blocks after the move). **C restarted state sync from scratch** (atomicity): accepted state summary 02:05, block-synced to height 97,927,168, entered pre-sync wipe 02:05:28.
- **STORAGE LAW exception #2 (mainnet itself, Project-Lead-approved):** the db cannot fit on the 484G SSD during state sync, so mainnet now runs on 16-fsync-IOPS vdc — slow-but-completes over fast-and-crash-loops. **POST-BOOTSTRAP DECISION REQUIRED:** move the (post-sync, pruned, smaller) db back to SSD or resize the plan — a consensus validator on 62ms/fsync storage will fall behind tip.
- vdc layout now: `mainnet-node/` (431G LIVE), `fuji-node/` (56G, stopped), `legacy-pre-migration-2026-10-12/` (55G fuji + mainnet plugins/staking only). 410G free → C has no disk ceiling for the rest of the sync.
- Backup script verified safe: it tars `~/.avalanche-cli` + federation secrets + scripts + genesis + nginx + systemd only — NOT the node dbs, so no backup-of-db-onto-own-volume loop.

### Fuji corruption (Oct 15) — STOPPED & DISABLED pending post-mainnet repair
- Root cause: Oct 15 19:20 `systemctl restart avalanchego-fuji` (done to release phantom space) ran while the root SSD was at ENOSPC → Fuji C-chain blockdb unrecoverable corruption ("index header claims to have more data than is actually on disk").
- First repair attempt (deleting C chainData `yH8D7…`, 955M) made it worse: db↔chainData mismatch — `missing execution results for asynchronous block: block 59516332 … no blocks written yet` (db on vdc remembers last-executed block; fresh chainData has no results).
- **Fuji stopped + disabled Oct 19** (it was crash-looping, serving nothing, and stealing the same 16 vdc IOPS mainnet C needs). **Repair queued AFTER mainnet bootstrap:** full wipe of `/mnt/backups/fuji-node/db` + `/home/ubuntu/avax-local/fuji/chainData` → fresh re-sync; OR move Fuji to its own box (Project Lead: "we may have to move Fuji to its own box after the sync is completed"). Unit is DISABLED — re-enable explicitly at repair time.

### Federation groundwork (packages/federation) — DONE
- Code survived in git intact (5 src files, 1,274 lines); `tsc --noEmit` passes.
- Docker image pre-built on snowside: `snowside-federation:latest` (530MB, node 22.23.3 runs); source staged at `/home/ubuntu/federation/`. One `docker compose up` away once L1s exist.
- Secrets inventory: `HD_MNEMONIC` (MUST regenerate — old one lost in the data-loss event), `EWOQ_PRIVATE_KEY` = NativeMinter admin key (on mainnet = `0xE5104794FB44D45b0f821d77a685A17ee2E35b9C`, Project-Lead-held), `FEDERATION_TOKEN` ✅ already on Cloudflare Worker, `*_RPC` placeholders until L1 redeploy, `*_ESPLORA` testnet/signet hard-coded (mainnet empty).
- **Stale hard-codes to fix post-redeploy:** chain IDs 32904/33160/33416 at `src/index.ts:51-53` (dead chains — new L1s get new IDs); `EWOQ_PRIVATE_KEY` env name is a mainnet hazard (rename → `MINTER_PRIVATE_KEY`); `src/test-mint.ts:5` contains a hard-coded dev private key — strip from the production image.

### Sync status at handoff (Oct 19 ~02:15 UTC)
- P ✅ · X ✅ · **C 🔄 restarted Oct 19 02:05 UTC on vdc** (pre-sync wipe → ~2.5M-trie fetch → post-sync wipe → execution). No ETA predictions; prior full trie attempts on SSD ran ~30h+ and vdc will be slower — but there is no longer a disk ceiling that can crash it. Historical pre-sync wipes on SSD took ~2–2.4h.
- Root SSD 479G free; vdc 410G free; RAM 3G/39G; 574 peers.

### Known issues / next steps
- [ ] Monitor C's state sync on vdc to completion (wipe → tries → wipe → execution). No more disk-full risk; only slowness risk.
- [ ] POST-BOOTSTRAP: decide mainnet db placement (back to SSD if it fits post-pruning, or larger plan) — validator cannot stay on 16-IOPS storage long-term.
- [ ] POST-BOOTSTRAP: repair Fuji (wipe `/mnt/backups/fuji-node/db` + chainData, re-sync) OR move Fuji to its own box (Project Lead decision). Unit currently DISABLED.
- [ ] Post-redeploy federation fixes: chain IDs (`index.ts:51-53`), `EWOQ_PRIVATE_KEY` rename, strip `test-mint.ts` key from prod image; regenerate `HD_MNEMONIC`.
- [ ] Project Lead: terminate `snowside-sync-old` (172.81.181.52, old acct).
- [ ] FUTURE TO-DO (deferred): R2 off-box backups — rclone installed, needs credentials.
- [ ] When bootstrapped: L1 redeploys (check for avalanche-CLI > v1.9.6 first), nginx `rpc.snowside.network` + certbot, federation live, DNS repoint.

---

# Snowside Handoff — 2026-10-12 (Session 25, Storage Root Cause + Production Consolidation)

## Session 25 summary — 2026-10-12

### ⚠️ ROOT CAUSE OF ALL SYNC SLOWNESS — block storage fsync latency (fio-VERIFIED)
- **LunaNode 1TB block storage (vdc) = 16 fsync-durable write IOPS** (~62ms/fsync). Measured with `fio --rw=randwrite --bs=4k --fdatasync=1` — the access pattern LevelDB batch commits actually use.
- **My Session-24 benchmark ("8,600 IOPS @ 120µs") was WRONG**: it measured buffered/page-cache writes, not durable writes. Lesson: **NEVER trust a storage class for avalanchego without an fdatasync benchmark.**
- Everything slow traces to this: X-chain executing ~6k ops/h (~27-day ETA), C trie crawl, the old box's 25h+ wipe, the Sep-10 incident's cost. Consensus = fsync per block forever → **a validator can NEVER run on this storage** (falls behind tip permanently).
- Local SSDs measured: snowside-sync vda = **841** fsync-IOPS; snowside c.8 SSD = **1,345** fsync-IOPS (52–84x the block storage).

### snowside resized m.16 → c.8 (Project Lead, panel)
- **Now: 8 vCPU / 39 GiB / 500G local SSD** (484G usable root). $160/mo. Chosen over s.32 ($200, 32G/12vCPU) and m.64 ($200, 65G/8vCPU): RAM is the binding constraint for mainnet consensus + 3 L1 validators + federation + nginx; 40G is the sweet spot; execution is single-thread-bound so extra cores are waste.

### MIGRATION EXECUTED — everything consolidated onto `snowside` (172.81.178.61)
- Mainnet stopped on snowside-sync (Project-Lead-approved: **C state-sync progress sacrificed** — it restarted fresh on snowside; X progress persisted and resumed; P was already parked-done).
- Transfer: LAN rsync (172.16.0.17 → 172.16.0.3, ~0.5ms), 4 parallel streams ≈ **52MB/s aggregate** (single stream capped ~30MB/s). Mainnet 246G (132,402 files) + Fuji 55G (28,819 files). **Both verified 1:1 via dry-run rsync (0 diffs).**
- Temp key `tmp-migrate-delete-me` used for box-to-box SSH — **REMOVE from snowside authorized_keys after vdc move completes.**
- Mainnet live on snowside: NodeID-HhtdACE7 preserved, 556 peers immediately, X resumed at 3.83M ops remaining (node ETA improved **649h → ~18h**), C state sync restarted (fast SSD now), P re-parked after executing the 225-block delta in <1s.
- **Fuji chainData lesson (SAE/ACP-194):** execution results live under `--chain-data-dir`, NOT `--data-dir`. First Fuji boot on snowside FATAL'd (`missing execution results for asynchronous block`) until the 25M chainData was copied from snowside-sync's vda. Fuji now live: all chains bootstrapped, NodeID-8W5LU preserved.
- **Paths on snowside:** mainnet `--data-dir=/home/ubuntu/avax-data/mainnet`, chainData+logs `/home/ubuntu/avax-local/mainnet/`; fuji `--data-dir=/home/ubuntu/avax-data/fuji` (ports 9652/9653, ufw 9653 added). Both units ENABLED (Restart=always).
- **vdc (1TB) demoted to backup tier**: unmounted from snowside-sync, fstab cleaned; Project Lead detaches → attaches to snowside → mount as `/mnt/backups` (UUID `a3d3e0f3-a7a2-4f8a-906f-d1bbe3972d17`; still holds the pre-migration db copies — mount READ-ONLY first, verify, THEN wipe/repurpose). Backup script target moves from `/home/ubuntu/backups` → `/mnt/backups` after mount.
- **snowside-sync (170.75.160.200): TERMINATED by Project Lead** (nothing of value left; inventoried).

### ⚠️ Disk-full incident + resolution (Oct 13–14)
- **Oct 13 23:51 UTC:** root SSD filled to 0 bytes → avalanchego-mainnet self-protected (`FATAL low on disk space` at the 3% floor, config `requiredAvailableDiskSpacePercentage=3`), db closed cleanly (no corruption), systemd restarted it 31s later (NRestarts=1). Cause: X execution writes + C wipe/LevelDB compaction churn burned 174G→0 in ~32h.
- **Cost:** C was **3h45m from completing state sync** (`triesRemaining: 341,181`) — atomicity rule reset it to zero; pre-sync wipe + full 2.52M-trie re-fetch running again. X lost nothing (ops persist across restarts).
- **Fix (Oct 14, Project-Lead-approved):** Fuji db (55G) moved root SSD → `/mnt/backups/fuji-node` on vdc (verified 1:1, 29,147 files, dry-run exit 0; unit `--data-dir` edited; re-bootstrapped P/X/C True in ~3 min). Root free: 109G → **163G**. **TEMPORARY storage-law exception: Fuji lives on 16-fsync-IOPS vdc until mainnet finishes, then moves back to SSD.** Fuji = testnet, non-critical; mainnet db integrity dominated the trade.
- **New lessons:** (a) `pgrep -f` + `kill` in a loop self-matches the invoking shell's own command line (contains the pattern) → killed my own SSH session — same hazard class as `pkill -f`; use exact PIDs and keep the pattern out of the killing command's own cmdline. (b) Long remote copies: launch with `nohup … &` (or tmux) — an SSH client timeout does NOT reliably kill the remote process (it survived here), and duplicate rsyncs to one destination are redundant but non-corrupting (atomic temp+rename).

### Known issues / next steps
- [x] vdc attached to snowside → mounted `/mnt/backups` (fstab UUID entry, `rw,noatime,nofail`; write-tested). Backup script target moved `/home/ubuntu/backups` → `/mnt/backups`. Pre-migration db copies preserved at `/mnt/backups/legacy-pre-migration-2026-10-12/` (301G) — delete once R2 backups verified live
- [ ] **Move Fuji db back to root SSD after mainnet bootstrap completes** (reverse of the Oct 14 emergency move)
- [x] `tmp-migrate-delete-me` key destroyed both ends (authorized_keys = admin key only); snowside-sync units disabled, temp artifacts removed — **DECLARED SAFE TO TERMINATE (Session 25)**
- [x] Project Lead terminated `snowside-sync` (170.75.160.200) — Session 25
- [ ] Project Lead: terminate `snowside-sync-old` (172.81.181.52, old acct)
- [ ] **FUTURE TO-DO (deferred by Project Lead, Session 25):** R2 off-box backups — rclone installed on snowside, needs credentials / `rclone config`. Until then the only backup tier is local `/mnt/backups` (vdc) — same-risk-box caveat stands
- [ ] Monitor on snowside: X execution (node ETA ~18h at move time) + C state sync (fresh, fast SSD)
- [ ] When bootstrapped: L1 redeploys (check for avalanche-CLI > v1.9.6 first), nginx `rpc.snowside.network` + certbot, federation rebuild, DNS repoint
- [x] AGENTS.md: updated hardware specs (c.8), STORAGE LAW, Helicon chainData gotcha, snowside-sync retired

---

# Snowside Handoff — 2026-10-08 (Session 24, Account Migration)

## Session 24 summary — 2026-10-08

### LunaNode account migration (old acct → new `abitsuite` acct)
- New SSH key: `~/.ssh/lunanode_abitsuite_key` (ed25519, Project-Lead-held; registered in the new account's key panel). Old account keys: `lunanode_apecs_key`.
- **`snowside-sync` migration COMPLETE (old → new account):**
  - OLD: 172.81.181.52 (`snowside-sync-old`) — stopped cleanly, fully inventoried (nothing of value left: no docker/crons/users/other data), temp migration key removed both sides. **SAFE TO TERMINATE** (Project Lead action).
  - NEW: 170.75.160.200 (`snowside-sync`) — 8 vCPU / 62 GiB / 500G vda + 1TB vdc (ext4, UUID `a3d3e0f3-a7a2-4f8a-906f-d1bbe3972d17`, `/mnt/avax-data`). Armored (needrestart + unattended-upgrades OFF), ufw (22/9651).
  - Transfer: rsync pull (temp ed25519 key, deleted after). 52G `/mnt/avax-data/mainnet/` (db + staking keys + subnet-evm v1.15.1 plugin), `/home/ubuntu/bin/avalanchego` v1.15.1, chainData/C/config.json. Verification pass: **0 differing files**.
  - New systemd unit with `--public-ip=170.75.160.200`; enabled + running, NRestarts=0.
  - **NodeID-HhtdACE7m9XfiRgQHb2dGchvW8WYMod1V PRESERVED** (staking keys traveled with the data).
  - **P-chain IBD resumed with ZERO lost progress**: 12.4M/25.6M executed (48%) → remaining 13.2M blocks, node ETA ~11h. (LevelDB compacted the copied db first — 52→39→51G oscillation is normal.)
- **`snowside` (L1 host) on the NEW account: CREATED & PROVISIONED.** 172.81.178.61 — 6 vCPU / 15 GiB / 125G vda (OS+software only; db arrives later via volume detach/attach from snowside-sync — same account, works). Old-account `snowside` (170.75.160.146) verified blank, safe to terminate.
  - Installed: docker 29.8.2 (hello-world verified), nginx 1.28.3 (enabled), avalanche-CLI v1.9.6 + avalanchego v1.15.1 (`/home/ubuntu/bin/`), rclone v1.60.1
  - Staged: subnet-evm v1.15.1 plugin (`/home/ubuntu/staging/plugins/`), chain config (state-sync+pruning+hashdb), dirs (`snowside/scripts`, `backups`, `genesis`, `avax-local`)
  - systemd: `avalanchego-mainnet.service` with `--public-ip=172.81.178.61`, data-dir `/mnt/avax-data/mainnet` — installed but **NOT enabled** (starts only after volume lands)
  - Backup system restored from local /tmp copies: `backup-snowside.sh` + `RESTORE.md` in `/home/ubuntu/snowside/`, daily 03:00 UTC timer **ENABLED** (failures expected/harmless until `~/.avalanche-cli` exists). **rclone → R2 NOT configured — needs Project Lead credentials.**
  - Runbook on box: `/home/ubuntu/MIGRATION.md` (volume detach/attach procedure)

- **Fuji testnet ADDED to snowside-sync (Session 24, Project Lead request):** second avalanchego instance `avalanchego-fuji.service` — ports 9652/9653, db `/mnt/avax-data/fuji/db`, logs `/home/ubuntu/avax-local/fuji/`, same chain config (state-sync+pruning+hashdb). Fresh NodeID-8W5LUpuegyhRTvhmVwWeNMeXPq55mTS26. Enabled + running. NOTE: Fuji db lives on the same 1TB vdc → it detaches/migrates WITH mainnet; decide at migration time whether to rsync Fuji separately or re-sync on `snowside`.
- `snowside-old` (170.75.160.146) **terminated by Project Lead** — old account fully decommissioned.

- **Mainnet bootstrap mechanics — SOURCE-VERIFIED (v1.15.1 `snow/engine/snowman/bootstrap/bootstrapper.go:666-752`):** after a chain executes its blocks, it (a) restarts bootstrapping at DEBUG log level (invisible in chain logs — explains P's ~92h silent gap; EXPECTED, not a stall), then (b) marks itself done on the **subnet-wide BootstrapTracker** and waits — **no chain starts consensus until ALL chains (P/X/C) finish** (verified: P.log has 0 "waiting for the remaining chains" lines because it took the DEBUG-logged restart path). **Consequences:** P parked-done since Oct 8 12:23; C will NOT serve RPC when its state sync finishes — it waits for X; **X is the pacing item**: DAG chains have NO state sync, execution is single-threaded (box load 2.4/8 cores — CPU headroom irrelevant), measured ~6,000 ops/h (147,757/4,141,251 as of Oct 12 05:21), node-reported ETA ~664h (~27-28 days). NO restart helps X; a restart would nuke C's trie sync. Migration/cutover/L1 redeploy all gated on X.

### Known issues / next steps
- [x] Project Lead terminated `snowside-old` (170.75.160.146)
- [ ] Project Lead: terminate `snowside-sync-old` (172.81.181.52) — inventoried clean
- [ ] Project Lead: provide R2 credentials (or run `rclone config` on snowside) — the ONLY missing backup piece
- [ ] Monitor IBD on `snowside-sync` (170.75.160.200)
- [ ] When IBD completes: follow `/home/ubuntu/MIGRATION.md` (detach volume → attach to snowside → enable node → L1 redeploys → nginx → federation)
- [ ] DNS: repoint `rpc.snowside.network` → 172.81.178.61 at cutover

---

# Snowside Handoff — 2026-10-07 (Session 23, Infrastructure Data Loss + Rebuild)

## Session 23 summary — 2026-10-07

### 1. Infrastructure data-loss event (Oct 2026)
A hosting provider data failure destroyed BOTH VPSes and everything on them:
- `avalanche` (170.75.160.146): mainnet C-chain state-sync progress (2.26M tries in), Fuji db, CLI v1.9.6 install, staking + BLS keys (NodeID-Kf5bbEanWq9TsyoBXqnJzvc8Dn6mu5haS)
- `snowside` (172.81.181.52): all 3 L1 chains + 5 nodes, nginx, snowside-federation container, ALL on-box backup snapshots
- **No off-box backups existed** (R2 had been deferred). Lesson is now permanent policy: **OFF-BOX BACKUPS FROM DAY ONE on every host, no deferrals.**
- Also lost: HD_MNEMONIC (→ authority `0x895fEE1F...` unrecoverable; federation wallet funds unrecoverable), ICM deployer key (→ Registry `0xB8e7...A6F` not reproducible), awm-relayer key.
- Survives: everything in git (AGENTS.md/HANDOFF), all Cloudflare assets (D1 bridge DB, API worker, all Pages sites), and the Project Lead-held private key for the NEW authority: **`0xE5104794FB44D45b0f821d77a685A17ee2E35b9C`**.

### 2. `snowside-sync` (172.81.181.52) — dedicated IBD box, CONFIGURED & RUNNING
- 8 vCPU / 62 GiB RAM / 500G vda + 1TB vdc — both NVMe-class (measured ~7,200–8,600 4K-randwrite IOPS @ ~120µs; the old box managed ~600 IOPS @ 5.5ms+ — the sync bottleneck is removed)
- ⚠️ **CRITICAL: v1.14.2 was tried first and could NOT connect (0 peers, 30 min).** The **Helicon network upgrade activated on Mainnet Sep 22, 2026** (v1.15.0 release notes: "All Mainnet nodes must upgrade before 11 AM ET, September 22nd 2026") — v1.14.2 is permanently incompatible. **v1.15.1 ("Helicon.1 — Improved Snapshot Performance") installed instead** (rpcchainvm 46), plus subnet-evm v1.15.1 plugin at `/mnt/avax-data/mainnet/plugins/srEXiWaHuhNyGwPUi444Tu47ZEDwxTWrbQiuD7FmgSAQ6X7Dy`.
- Chain config: `{"state-sync-enabled": true, "pruning-enabled": true, "state-scheme": "hashdb"}` — hashdb set explicitly because post-Helicon firewood cannot state-sync (FATAL). Post-Helicon state-sync rules (official): restart mid-sync = restart from beginning; disabling state sync after partial sync = unrecoverable FATAL → db wipe.
- systemd `avalanchego-mainnet.service` (`Restart=always`), db on vdc, logs/chainData on vda. Fresh NodeID: `NodeID-HhtdACE7m9XfiRgQHb2dGchvW8WYMod1V`. Armored: needrestart override + unattended-upgrades OFF + ufw (22, 9651 only).
- Status at 14:16 UTC: **355 peers connected**, network health passing, P-chain fetching blocks (465k/25.6M, node ETA ~2h), C-chain state sync follows automatically. NRestarts=0.
- Role: **IBD ONLY** → retire after the synced db volume is transferred to `snowside` (detach/attach — no rsync needed; NodeID + staking keys ride the volume; new unit on `snowside` uses `--public-ip=170.75.160.146`)

### 3. NEW `snowside` (170.75.160.146) — reviewed, DISK MISMATCH ❌
- 6 vCPU / 15 GiB / **125 GB local only** / Ubuntu 24.04.5 LTS / fast disk (~8,500 IOPS @ 115µs) / clean (nothing installed)
- **125 GB cannot hold the mainnet db (~300–400 GiB pruned)** — needs a 1TB volume attached (or reprovision) before the db migration can happen
- unattended-upgrades ARMED on this box — Session-20 armoring must be applied BEFORE any avalanchego runs here
- IP note: the provider reassigned 170.75.160.146 (the old `avalanche` IP) to this box. `rpc.snowside.network` DNS still points at 172.81.181.52 (`snowside-sync`) — Project Lead repoints on request

### 4. Rebuild plan (agreed)
1. IBD on `snowside-sync` (running v1.15.1) → monitor P → X → C state sync
2. Configure new `snowside` at migration time (armoring FIRST, then avalanchego **v1.15.1** + CLI + nginx — v1.14.2 is dead on mainnet). NOTE: Avalanche-CLI v1.9.6 compatibility with avalanchego v1.15.x networks is UNVERIFIED — check for a newer CLI release before L1 redeployment
3. **VOLUME-TRANSFER migration (supersedes rsync):** after the sync FULLY completes (isBootstrapped true + post-sync wipe finished — never during a wipe window), cleanly stop the node, unmount, DETACH the 1TB vdc from `snowside-sync` and ATTACH it to `snowside`. The db travels on the disk (UUID `a83114af-e5f2-435b-8a83-1b7efd9e903d`, ext4, `/mnt/avax-data/mainnet/` incl. staking/keys — NodeID-HhtdACE7... travels with it). New systemd unit on `snowside` must use `--public-ip=170.75.160.146`. Downtime = minutes.
4. Redeploy the 3 L1s from genesis (all parameters documented in AGENTS.md; NEW blockchain IDs; NEW authority `0xE5104794...`; NO ewoq anywhere)
5. nginx + federation rebuild + R2 backups day one → DNS repoint → retire `snowside-sync`
6. Peg-in (13.37 ECX, slot 88) revisits AFTER L1s exist — chain 32904 is gone, and destination `0x27a9b30D...` was on it

### Known issues / next steps
- [ ] 1TB volume for new `snowside` (Project Lead)
- [ ] Armoring pending on new `snowside` (do at config time, before avalanchego)
- [ ] Monitor IBD on `snowside-sync`
- [ ] R2 off-box backups from day one (mandatory, no deferral)
- [ ] L1 genesis reconstruction from AGENTS.md parameters at redeploy time

---

# Session 22 archive — 2026-09-21 (Tour Rebuilt Without Slidev)

## Session 22 summary — 2026-09-21

### 1. packages/tour — SLIDEV REMOVED ENTIRELY (commit `efbce7fe`)

**Result:** `tour.snowside.network` now serves a zero-dependency static build. Slidev, Vite, Vue and UnoCSS are gone from the lockfile (verified: `grep -c slidev pnpm-lock.yaml` = 0, `unocss` = 0, `vue@` = 0). CI run `35586580971` — all 16 jobs success, `deploy-tour` live.

**Why the rewrite:** Slidev scales a fixed 980×552 canvas via a single transform (`Math.min(w/980, h/552)`) and offers **no reflow mode**. A 16.8px paragraph therefore painted at ~6.7px on a 390×844 phone. Media queries cannot correct this because they evaluate against the real viewport, not the scaled canvas. The deck also used none of Slidev's features — 0 code fences, 0 `v-click`, 0 math, 0 transitions — while shipping ~936KB of framework assets for slide-splitting and keyboard nav.

**Architecture (one document, two layouts):**

| Mode | Applies when | Behaviour |
|---|---|---|
| deck | desktop, tablet, phone **landscape** | fixed 980×552 canvas, scaled uniformly, Slidev look preserved |
| phone | phone **portrait** | reflowing, one slide per screen, horizontal swipe |

**Breakpoint is scale-based, not width-based.** The switch fires when `s = min(vw/980, vh/552) < 0.65` (≈637px wide or 359px tall). Measured: phone portrait 0.367–0.439 (reflow); phone landscape 0.707–0.779 (deck); tablet 0.784–1.045 (deck); desktop 1.304–1.957 (deck). This deliberately keeps **every** tablet — including iPad mini portrait at 0.784 — on the deck, per the requirement to preserve the Slidev look on tablet. The threshold is asserted in three places that must stay in sync: `assets/tour.css`, `assets/tour.js` (`MOBILE_SCALE`), and the inline boot script in `scripts/build-tour.mjs` (runs before first paint to prevent FOUC on phones).

**New files:**
- `packages/tour/slides.mjs` — slide model (12 slides; kinds `cover`/`default`/`connect`)
- `packages/tour/scripts/build-tour.mjs` — renderer → `dist/index.html`, `dist/404.html`, `dist/_redirects`
- `packages/tour/scripts/serve.mjs` — local preview with production-parity routing
- `packages/tour/assets/tour.css` — full stylesheet, 17 sections, 128 rules
- `packages/tour/assets/tour.js` — vanilla runtime: keyboard, swipe, tap, dots, deep links, mode switching

**Deleted:** `slides.md`, `layouts/`, `components/`, `styles/`, `uno.config.ts`, `scripts/inject-head.mjs`, `scripts/build-mobile.mjs`, `dist/mobile/`, and all Slidev/Vue/UnoCSS deps.

**`/mobile` REMOVED.** No separate page, no banner, no redirect. The old URL now falls through the SPA fallback and loads the tour normally (verified: `GET /mobile` returns a body byte-identical to `GET /`).

**Parity bugs found and fixed during the rewrite** (each verified against the still-deployed Slidev bundle `index-BdbVGs5m.css`, not assumed):
1. **Cover cascade regression.** The original rules were scoped `.snow-cover-root .cover-tagline` (specificity 0-2-0). Written bare as `.cover-tagline` (0-1-0) they **lose** to `.snow-bg h1` (0-1-1), which would have painted the tagline at 3rem with h1 margins. Restored `.snow-cover-root` scoping on `.cover-kicker/.cover-banner/.cover-tagline/.cover-subtitle`.
2. **Connect-lead cascade regression.** Same class: `.snow-connect-root .connect-lead` scoping restored.
3. **`.slide-lead` deliberately left unstyled.** In the original build `.snow-bg p` (0-1-1) overrode the UnoCSS `.lead` shortcut (0-1-0), so these intros rendered at 1rem. Adding a rule would have diverged from the build being replaced. Documented in-file.
4. **Nav-button/page-number collision** (the bug reported in the previous session) — controls are centred at the bottom, `.slide-number` keeps bottom-right unobstructed.
5. **Duplicate `.deck-controls` rule removed** — it set `left`+`right`+`width` together, over-constraining the box against the `translateX(-50%)` centring.
6. **Dots were `aria-hidden` but interactive** → now real `<button>`s with labels and keyboard focus; hidden via `display:none` on the deck so they leave the tab order there.
7. **Tap-to-advance was advertised but inert** on phones (`onClick` returned early in mobile mode) → implemented.
8. **Tab title was being rewritten** on load, clobbering the brand title. The runtime no longer touches `document.title`.

**Preserved behaviours:** ~28KB HTML (was ~936KB of framework assets), Simple Analytics, OG/Twitter meta (1200×630 poster), favicon, deep links, `prefers-reduced-motion`, focus rings, and a `<noscript>` fallback that stacks all 12 slides into one scrollable page. `@media print` (980×552 per slide) replaces `slidev export`.

**Verification (no browser available in this environment):** build clean; all JS parses (`node --check`); CSS braces balanced, 128 rules, 0 malformed declarations; all 51 classes used in the HTML are styled; 12 slides / 12 dot buttons / 12 `snow-bg`; `404.html` and `_redirects` emitted; mode predicate checked against 12 device profiles (all match intent); live checks confirm the Slidev CSS bundle is no longer referenced (`grep -c index-BdbVGs5m` = 0) and `/`, `/5`, `/mobile` all return 200.

**Note — hono bump retained.** `packages/api` hono `4.5.0 → 4.13.8` was originally introduced to unblock Slidev. It is **kept**, because reverting was re-tested and `hono@4.5.0` carries a **HIGH** advisory (`npm audit`: 43 listed vulnerabilities). The bump is security-driven, independent of Slidev.

---

## Session 21 summary — 2026-09-13 (Tour Deploy + Guardian CI)

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
