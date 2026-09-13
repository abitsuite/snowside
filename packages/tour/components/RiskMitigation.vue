<!-- packages/tour/components/RiskMitigation.vue -->
<!-- Source: packages/pitch/src/pages/index.astro `risks` array (verified) -->
<script setup lang="ts">
const risks = [
  {
    risk: 'Low initial validator count',
    mitigation: 'Launch with at least 3 community validators. NodΞRunr reduces technical barriers to participation. Validator incentives funded by BTC gas fees.',
  },
  {
    risk: 'BMM adoption by miners',
    mitigation: 'BMM fees are denominated in BTC. Miners earn real revenue with zero additional hashing cost. The economic incentive is straightforward and self-sustaining.',
  },
  {
    risk: 'USDC bridge security',
    mitigation: 'ICM is a native Avalanche protocol, not a third-party bridge. It uses the full security of the Avalanche consensus — the same mechanism securing billions in TVL on the C-Chain.',
  },
  {
    risk: 'eCash specification changes',
    mitigation: 'Direct coordination with Paul Sztorc ensures the L1 configuration tracks the eCash spec. Smart contracts are upgradeable during the initial testnet phase.',
  },
  {
    risk: 'Long-term maintainability',
    mitigation: "EthSide was retired because manual operation was unsustainable. NodΞRunr's automation eliminates the maintenance burden that killed the predecessor.",
  },
  {
    risk: 'Regulatory uncertainty',
    mitigation: 'Snowside uses existing, established assets (BTC, USDC) — no new token issuance. The chain is fully open source and community-operated.',
  },
]
</script>

<template>
  <div class="grid grid-cols-2 gap-4 mt-6 text-sm">
    <div
      v-for="r in risks"
      :key="r.risk"
      class="bg-white/5 rounded-lg p-4"
    >
      <div class="flex items-start gap-3">
        <span class="mt-0.5 inline-block rounded bg-aval-500/10 px-2 py-0.5 text-xs font-mono font-bold text-aval-400">RISK</span>
        <p class="flex-1 text-sm font-semibold text-white">{{ r.risk }}</p>
      </div>
      <div class="mt-4 flex items-start gap-3">
        <span class="mt-0.5 inline-block rounded bg-snow-500/10 px-2 py-0.5 text-xs font-mono font-bold text-snow-300">FIX</span>
        <p class="flex-1 text-sm leading-relaxed text-slate-400">{{ r.mitigation }}</p>
      </div>
    </div>
  </div>
</template>
