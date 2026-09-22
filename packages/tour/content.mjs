// packages/tour/content.mjs
//
// SINGLE SOURCE OF TRUTH for Snowside Tour content.
//
// Consumed by slides.mjs (the slide model), which in turn feeds
// scripts/build-tour.mjs (the renderer). Both tour layouts — the desktop +
// tablet deck and the phone slideshow — are generated from the same slide
// list, so a copy change made here cannot drift between them.
//
// It is deliberately NOT consumed by packages/pitch. The pitch page owns its
// own copy of the comparison/roadmap/risk data; sharing is scoped to the two
// tour layouts only, per project direction.
//
// Provenance: text was moved verbatim out of the former slides.md deck (12
// slides) and out of that deck's Vue components (ComparisonTable.vue,
// RiskMitigation.vue, RoadmapTimeline.vue). The comparison + roadmap arrays in
// turn trace back to packages/pitch/src/pages/index.astro (`comparison`,
// `roadmap`), which the tour components already cited. When updating tour copy,
// edit THIS file.

/* ------------------------------------------------------------------ *
 * Slide 1 — cover
 * ------------------------------------------------------------------ */
export const cover = {
  kicker: 'SNOWSIDE TOUR',
  banner: '/cover-banner.png',
  bannerAlt: 'Bitcoin Security at Avalanche Speed',
  tagline: 'Bitcoin Security<br />at Avalanche Speed',
  subtitle:
    'The eCash Sidechain on Avalanche<br />Native ECX Gas \u2022 Native USDC Liquidity',
}

/* ------------------------------------------------------------------ *
 * Slide 2 — What Is Snowside?
 * ------------------------------------------------------------------ */
export const whatIsSnowside = {
  heading: 'What Is Snowside?',
  lead:
    'A dedicated Avalanche Layer-1 blockchain built to host Paul Sztorc\u2019s upcoming eCash hard-fork. It runs as a clean EVM sidechain where the **native gas token is ECX** \u2014 no new tokens, no pre-mine, just eCash security via blind merged mining.',
  cards: [
    {
      kicker: '01 \u2014 Gas',
      title: 'Native ECX gas',
      body: 'Fees paid in ECX via BIP-301 blind merged mining.',
    },
    {
      kicker: '02 \u2014 Finality',
      title: 'Sub-second finality',
      body: 'Avalanche Snowman consensus settles in under a second.',
    },
    {
      kicker: '03 \u2014 Bridge',
      title: 'USDC bridging',
      body: 'Native Interchain Messaging from the Avalanche C-Chain.',
    },
    {
      kicker: '04 \u2014 EVM',
      title: 'Full EVM',
      body: 'Remix, Hardhat, Foundry work out-of-the-box.',
    },
    {
      kicker: '05 \u2014 Validation',
      title: 'Community-run validators',
      body: 'Community-operated validator set with low operational cost.',
    },
    {
      kicker: '06 \u2014 Token',
      title: 'No token. No ICO.',
      body: 'Infrastructure, not an investment vehicle.',
    },
  ],
}

/* ------------------------------------------------------------------ *
 * Slide 3 — Two Native Assets, Zero Friction
 * ------------------------------------------------------------------ */
export const twoAssets = {
  heading: 'Two Native Assets, Zero Friction',
  lead: 'Bridging eCash and stablecoin economies in one network.',
  cards: [
    {
      kicker: 'Asset 01',
      title: '\u26a1 Native ECX Gas',
      body:
        'Transaction fees paid in real ECX via blind merged mining. No new token, no pre-mine, no inflation.',
    },
    {
      kicker: 'Asset 02',
      title: '\ud83c\udf09 USDC Bridging',
      body:
        'Avalanche Interchain Messaging (ICM) bridges USDC from the C-Chain natively. Stable liquidity from day one.',
    },
  ],
  footnoteStrong: 'No competing token.',
  footnoteRest: ' Just ECX for gas and USDC for liquidity.',
}

/* ------------------------------------------------------------------ *
 * Slide 4 — How It Works
 * ------------------------------------------------------------------ */
export const howItWorks = {
  heading: 'How It Works',
  lead: 'Four layers of technology, one cohesive sidechain.',
  cards: [
    {
      kicker: '01',
      title: 'BMM',
      body:
        'eCash miners commit to Snowside blocks without running them. They earn ECX fees while securing the chain with existing hash power.',
    },
    {
      kicker: '02',
      title: 'Avalanche L1',
      body:
        'A dedicated validator set runs Snowside with sub-second finality. Validators are community-operated.',
    },
    {
      kicker: '03',
      title: 'ECX Gas Flow',
      body:
        'Users pay gas in ECX. Miners collect fees through BMM commitments. The loop closes entirely within eCash.',
    },
    {
      kicker: '04',
      title: 'ICM USDC Bridge',
      body:
        'Avalanche ICM trustlessly bridges USDC from the C-Chain \u2014 no third-party bridges, no wrapped assets.',
    },
  ],
}

/* ------------------------------------------------------------------ *
 * Slide 5 — Why Avalanche Is the Perfect Substrate
 * ------------------------------------------------------------------ */
export const whyAvalanche = {
  heading: 'Why Avalanche Is the Perfect Substrate',
  lead: '',
  cards: [
    {
      kicker: '01',
      title: 'Sovereign validation',
      body:
        'Snowside runs its own validators, ensuring dedicated throughput for eCash operations.',
    },
    {
      kicker: '02',
      title: 'Native interoperability',
      body:
        'Avalanche ICM allows trust-less bridging of USDC from the C-Chain without third-party bridges.',
    },
    {
      kicker: '03',
      title: 'Low operational cost',
      body:
        'Avalanche9000\u2019s subscription model makes community-run validation cheap and feasible.',
    },
    {
      kicker: '04',
      title: 'Tooling maturity',
      body:
        'Full EVM compatibility \u2014 Remix, Hardhat, The Graph, Foundry all work out-of-the-box.',
    },
    {
      kicker: '05',
      title: 'Proven L1 track record',
      body:
        'Multiple Avalanche L1s are already live in production. The infrastructure is battle-tested.',
    },
  ],
}

/* ------------------------------------------------------------------ *
 * Slide 6 — Agentic Payments
 * ------------------------------------------------------------------ */
export const agenticPayments = {
  heading: 'Agentic Payments',
  lead:
    'Snowside\u2019s low-fee ECX gas and native USDC bridging make it ideal for autonomous, machine-to-machine payments.',
  cards: [
    {
      kicker: 'Protocol',
      title: 'x402',
      body:
        'An open payment protocol built on the HTTP 402 <em>Payment Required</em> status code. Agents pay per-request, natively over HTTP \u2014 no gateways, no intermediaries.',
    },
    {
      kicker: 'Settlement',
      title: 'USDC, low fees',
      body:
        'Stablecoin settlement via native ICM USDC. Sub-cent transaction fees and no price volatility \u2014 predictable per-call economics for agents.',
    },
    {
      kicker: 'Autonomy',
      title: 'Machines pay machines',
      body:
        'Autonomous AI agents discover, negotiate, and pay for services without human-in-the-loop approvals or custodial wallets.',
    },
    {
      kicker: 'Finality',
      title: 'Instant settlement',
      body:
        'Sub-second Avalanche finality means a payment is confirmed before the response is served \u2014 no waiting on block confirmations.',
    },
    {
      kicker: 'Composability',
      title: 'Full EVM',
      body:
        'x402 payment flows compose with any EVM contract \u2014 escrows, streaming, programmable spend policies \u2014 all on one chain.',
    },
    {
      kicker: 'No token tax',
      title: 'ECX, not a toll token',
      body:
        'Gas is paid in ECX. No protocol token skim on every agent transaction \u2014 just the eCash security fee.',
    },
  ],
}

/* ------------------------------------------------------------------ *
 * Slide 7 — How Snowside Compares
 * ------------------------------------------------------------------ */
export const comparison = {
  heading: 'How Snowside Compares',
  lead: 'Snowside vs. Lightning Network vs. Base',
  columns: ['Feature', 'Snowside', 'Lightning', 'Base'],
  rows: [
    {
      feature: 'Consensus mechanism',
      snowside: 'Avalanche PoS + BMM',
      lightning: 'Off-chain channels',
      base: 'Ethereum PoS',
    },
    {
      feature: 'Finality time',
      snowside: '< 1 second',
      lightning: 'Instant (payment)',
      base: '~ 2 seconds',
    },
    { feature: 'Gas token', snowside: 'ECX', lightning: 'BTC', base: 'ETH' },
    {
      feature: 'Smart contracts',
      snowside: 'Full EVM',
      lightning: 'Limited (scripts)',
      base: 'Full EVM',
    },
    {
      feature: 'Stablecoin support',
      snowside: 'Native USDC via ICM',
      lightning: 'None',
      base: 'Native USDC',
    },
    {
      feature: 'Node operation',
      snowside: 'Community-run',
      lightning: 'Manual',
      base: 'Manual',
    },
    {
      feature: 'Maintenance burden',
      snowside: 'Low',
      lightning: 'Medium',
      base: 'Medium',
    },
    {
      feature: 'Validator sovereignty',
      snowside: 'Dedicated set',
      lightning: 'N/A',
      base: 'Shared with Ethereum',
    },
  ],
}

/* ------------------------------------------------------------------ *
 * Slide 8 — Risks & Mitigations
 *
 * NOTE: the authoritative copy is the 6-risk list below, moved verbatim out
 * of the former components/RiskMitigation.vue. A different 5-item list
 * previously existed in slides.md prose and is superseded.
 * ------------------------------------------------------------------ */
export const risks = {
  heading: 'Risks & Mitigations',
  lead: '',
  items: [
    {
      risk: 'Low initial validator count',
      mitigation:
        'Launch with community validators. Low operational cost via Avalanche9000 reduces technical barriers to participation. Validator incentives funded by ECX gas fees.',
    },
    {
      risk: 'BMM adoption by miners',
      mitigation:
        'BMM fees are denominated in ECX. Miners earn real revenue with zero additional hashing cost. The economic incentive is straightforward and self-sustaining.',
    },
    {
      risk: 'USDC bridge security',
      mitigation:
        'ICM is a native Avalanche protocol, not a third-party bridge. It uses the full security of the Avalanche consensus \u2014 the same mechanism securing billions in TVL on the C-Chain.',
    },
    {
      risk: 'eCash specification changes',
      mitigation:
        'Direct coordination with Paul Sztorc ensures the L1 configuration tracks the eCash spec. Smart contracts are upgradeable during the initial testnet phase.',
    },
    {
      risk: 'Long-term maintainability',
      mitigation:
        'EthSide was retired because manual operation was unsustainable. Community-run validators and low operational cost eliminate the maintenance burden that killed the predecessor.',
    },
    {
      risk: 'Regulatory uncertainty',
      mitigation:
        'Snowside uses existing, established assets (ECX, USDC) \u2014 no new token issuance. The chain is fully open source and community-operated.',
    },
  ],
}

/* ------------------------------------------------------------------ *
 * Slide 9 — Roadmap
 *
 * NOTE: the authoritative copy is the 5-phase list below, moved verbatim out
 * of the former components/RoadmapTimeline.vue, whose own source comment
 * records the provenance: "Devnet → Alphanet → Betanet → Mainnet → Ongoing".
 * ------------------------------------------------------------------ */
export const roadmap = {
  heading: 'From Devnet to Mainnet and Beyond...',
  lead: '',
  phases: [
    {
      month: 'Devnet',
      milestone:
        'Internal development network. Genesis configuration, precompile integration, and BMM coordination precompile validation against the Subnet-EVM fork.',
    },
    {
      month: 'Alphanet',
      milestone:
        'Federated federation bootstrapping. eCash Alphanet BIP-300/301 deposit and withdrawal flow validation; NativeMinter and DeployerAllowList precompiles live.',
    },
    {
      month: 'Betanet',
      milestone:
        'Public testnet with community validators. Security audit of peg smart contracts; ICM USDC bridge integration with the Avalanche C-Chain; block explorer deployment.',
    },
    {
      month: 'Mainnet',
      milestone:
        'Mainnet launch with community validators; public RPC endpoints; developer documentation released; first eCash dApp deployments.',
    },
    {
      month: 'Ongoing',
      milestone:
        'Validator growth, protocol maintenance, ecosystem development. Continuous BMM adoption and USDC liquidity expansion.',
    },
  ],
}

/* ------------------------------------------------------------------ *
 * Slide 10 — Opportunities
 * ------------------------------------------------------------------ */
export const opportunities = {
  heading: 'Opportunities',
  lead: 'Revenue streams and yield for participants in the Snowside network.',
  cards: [
    {
      title: 'Validator Staking',
      apy: 'ECX gas fees',
      note:
        'Run a Snowside validator and earn a share of every transaction\u2019s ECX gas. Sovereign PoS with sub-second finality means consistent, predictable revenue.',
    },
    {
      title: 'Miner BMM Yield',
      apy: 'Sidechain fees',
      note:
        'eCash miners commit to Snowside blocks through Blind Merged Mining \u2014 earn ECX fees from the sidechain with zero additional hashing cost. Pure incremental revenue on existing hash power.',
    },
    {
      title: 'USDC Liquidity Provision',
      apy: 'Bridge fees + yield',
      note:
        'Provide USDC liquidity via the ICM bridge from Avalanche C-Chain. Enable stablecoin commerce on Snowside and capture bridging fees plus DeFi yield opportunities.',
    },
  ],
  footnote: 'Three ways to earn. Zero new tokens. All revenue denominated in ECX or USDC.',
}

/* ------------------------------------------------------------------ *
 * Slide 11 — Frequently Asked Questions
 * ------------------------------------------------------------------ */
export const faqs = {
  heading: 'Frequently Asked Questions',
  lead: '',
  items: [
    {
      q: 'What is Snowside?',
      a: 'An Avalanche L1 for Paul Sztorc\u2019s eCash hard-fork. ECX gas, USDC bridge, community-run validators.',
    },
    {
      q: 'Is there a token?',
      a: 'No. No token, no pre-mine, no ICO, no airdrop. The network runs on ECX and USDC only.',
    },
    {
      q: 'How does ECX gas work?',
      a: 'eCash miners commit to Snowside blocks via BMM. Users pay gas in ECX. Miners earn the fees.',
    },
    {
      q: 'How is USDC bridged?',
      a: 'Trustlessly from Avalanche C-Chain via Interchain Messaging \u2014 a native Avalanche protocol, not a third-party bridge.',
    },
    {
      q: 'How do I run a validator?',
      a: 'Deploy via Nod\u039eRunr \u2014 one-click setup, 24/7 monitoring, automatic updates.',
    },
    {
      q: 'When does mainnet launch?',
      a: 'Targeted for the Mainnet phase of the roadmap, following Betanet and security audits.',
    },
  ],
}

/* ------------------------------------------------------------------ *
 * Slide 12 — Connect with Us
 * ------------------------------------------------------------------ */
export const connect = {
  heading: 'Connect with Us',
  lead:
    'Open source. No token. Powered by Avalanche. Supported by the eCash sidechain community.',
  links: [
    { icon: '\ud83d\udcd8', label: 'Read the Whitepaper', href: 'https://snowside.network/whitepaper.pdf' },
    { icon: '\ud83d\udcbb', label: 'View on GitHub', href: 'https://github.com/abitsuite/snowside' },
    { icon: '\ud83d\udc26', label: 'Follow on X', href: 'https://x.com/0xShomari' },
    { icon: '\ud83d\udcac', label: 'Join our Discord', href: 'https://discord.gg/jVytngEWt' },
    { icon: '\ud83c\udf10', label: 'Visit snowside.network', href: 'https://snowside.network' },
    { icon: '\ud83c\udfc3', label: 'Run a Validator', href: 'https://layer1.run' },
  ],
  footer: [
    'Snowside is an independent open-source project.',
    'Not affiliated with or endorsed by the Avalanche Foundation.',
    'Powered by Avalanche. Secured by eCash. Open to all.',
  ],
}

/* ------------------------------------------------------------------ *
 * Page identity (shared by both layouts)
 * ------------------------------------------------------------------ */
export const BRAND_TITLE = 'Snowside Tour'
export const BRAND_TAGLINE = 'Bitcoin Security at Avalanche Speed'
export const PAGE_TITLE = `${BRAND_TITLE} \u2014 ${BRAND_TAGLINE}`
export const PAGE_DESCRIPTION =
  'The eCash Sidechain on Avalanche. Native ECX Gas \u2022 Native USDC Liquidity.'
