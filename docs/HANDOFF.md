# Snowside Handoff — 2026-08-17 (Session 16, Whitepaper v0.4 Refactor)

## Session 16 summary — 2026-08-17

### Primary Task: Whitepaper v0.3 → v0.4 Refactor
Refactored the Snowside whitepaper to correct the fee model, add Treasury/Foundation architecture, and update economic incentives.

### Files Modified (13 files, +200/-74 lines)

**Whitepaper core:**
- `packages/web/src/data/whitepaper/meta.ts` — Version 0.3 → 0.4, date updated to August 2026
- `packages/web/src/data/whitepaper/content.ts` — All section text changes + 4 new subsections
- `packages/web/src/data/whitepaper/figures/fee-model.ts` — Diagram: Contract Fee opt-in, Owner+Treasury vesting, Treasury distribution
- `packages/web/src/data/whitepaper/figures/role-separation.ts` — Settlement Proposers: Treasury-compensated (not Base Fees)
- `packages/web/src/data/whitepaper/figures/validator-economics.ts` — Revenue: Treasury distribution (85% proportional)
- `packages/web/src/data/whitepaper/figures/icm-bridge.ts` — Added reverse USDC flow arrow

**Docs site:**
- `packages/docs/src/content/docs/architecture/bmm.md` — Economic incentives text updated
- `packages/docs/src/content/docs/architecture/gas-model.md` — Fee model text updated
- `packages/docs/src/content/docs/architecture/icm-bridge.md` — Reverse USDC flow note added
- `packages/docs/src/content/docs/index.md` — Index updated
- `packages/docs/src/content/docs/reference/glossary.md` — Added Treasury, Foundation, USDC auto-bridging terms

**Config/docs:**
- `packages/web/src/styles/global.css` — Tailwind ENOENT fix applied (`tailwindcss/index.css`)
- `AGENTS.md` — Version v0.4, fee model description, refactoring notes, session startup instructions

### Key Model Changes (v0.4)

1. **Contract Fees: Optional/Opt-in** — No longer required on all EVM calls. Contract owners choose to opt in.
2. **USDC Denomination** — Contract owners may denominate fees in BTC or USDC. USDC fees auto-bridge to C-Chain by default (batch mode available as config option).
3. **Snowside Treasury** — Replaces "validator portion" of Contract Fees. Treasury captures the portion previously split among validators.
4. **Treasury Distribution:**
   - Foundation: 10% retained (gross)
   - Settlement Proposers: 5% of net (configurable via governance, mechanism TBD)
   - Validators: 85% of net (100% proportional to bonded BTC, no equal distribution)
5. **Settlement Proposers** — Compensated from Treasury, NOT Base Fees. 100% of Base Fees go to eCash miners via BMM.
6. **Contract Owner Vesting** — Unchanged: 50% → 80% over 18 months.
7. **New Sections Added:**
   - 4.11: Fallback Settlement by Snowside Foundation
   - 5.7: USDC Contract Fee Bridging
   - 5.8: The Snowside Foundation
   - 5.9: Avalanche Ecosystem Value Flow

### Build Status
- **Web build:** ✅ PASSES (exit 0, 3 pages built including PDF)
- **PDF generation:** ✅ PASSES (whitepaper.pdf generates successfully)
- **Docs build:** Not tested this session — recommended to test before deploy

### Issues Encountered & Resolved
1. **PDF generation error** (`Cannot read properties of undefined (reading 'replace')`) — Caused by new sections 5.7–5.9 being inserted outside Section 5's paragraphs array. Fixed by moving them inside the array.
2. **Tailwind ENOENT** — `global.css` had `@import 'tailwindcss'` instead of `@import 'tailwindcss/index.css'`. Fixed per AGENTS.md documented fix.
3. **Text issues** — "entirely Bitcoin-native" → "predominantly Bitcoin-native" (Section 5.6). Typo "enerating" → "generating" (Section 5.9).

### Known Issues
1. **Governance mechanism TBD** — The specific governance mechanism for adjusting Settlement Proposer and Validator distribution percentages is not yet finalized. Noted in whitepaper Sections 5.5 and 5.8.
2. **Docs build untested** — The docs site changes have not been build-tested. Run `cd packages/docs && pnpm build` before deploying.
3. **Explorer stale block height** — Pre-existing issue from Session 7. Signet explorer queries old Blockchain ID.

### Next Steps
1. **Test docs build:** `cd packages/docs && pnpm build`
2. **Review PDF output:** Open `packages/web/dist/whitepaper.pdf` and verify all new sections render correctly with proper numbering (5.7, 5.8, 5.9, new 4.11)
3. **Commit and push:** `git add -A && git commit -m "whitepaper v0.4: Treasury model, USDC bridging, Foundation architecture" && git push origin master`
4. **Verify deploy:** Check https://snowside.network/whitepaper after Cloudflare Pages build completes
5. **Consider condensing AGENTS.md** — File is ~370 lines. L1 deployment details, Nginx config, Bridge API endpoints, and BIP-300/301 reference could be moved to separate docs to reduce context window usage in future sessions.

### Previous Session
Session 15 (2026-08-11): Custodial Bridge MVP complete. Federation service running on VPS. Withdrawal implementation with @scure/btc-signer. See git log for details.
