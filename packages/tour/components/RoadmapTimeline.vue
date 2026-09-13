<!-- packages/tour/components/RoadmapTimeline.vue -->
<!-- Source: packages/pitch/src/pages/index.astro `roadmap` array (verified) -->
<script setup lang="ts">
const milestones = [
  { month: 'Month 1', milestone: 'Fuji testnet launch with NodΞRunr template; automated validator setup; initial BMM integration testing' },
  { month: 'Month 2', milestone: 'Security audit of eCash smart contracts; ICM USDC bridge integration with C-Chain; block explorer deployment' },
  { month: 'Month 3', milestone: 'Mainnet launch with at least 3 community validators; public RPC endpoints; developer documentation released' },
  { month: 'Month 4', milestone: 'Community AMA with Paul Sztorc; validator onboarding program; first eCash dApp deployments' },
  { month: 'Ongoing', milestone: 'Validator growth, protocol maintenance via NodΞRunr, ecosystem development grant program' },
]
</script>

<template>
  <div class="mt-8">
    <div
      v-for="(r, i) in milestones"
      :key="r.month"
      class="flex gap-6 pb-8 last:pb-0"
    >
      <div class="flex flex-col items-center">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aval-600 font-mono text-xs font-bold text-white">
          {{ i + 1 }}
        </div>
        <div v-if="i < milestones.length - 1" class="mt-2 w-px flex-1 bg-white/10" />
      </div>
      <div class="pb-2">
        <h3 class="font-mono text-sm font-bold text-snow-300">{{ r.month }}</h3>
        <p class="mt-1 text-sm leading-relaxed text-slate-400">{{ r.milestone }}</p>
      </div>
    </div>
  </div>
</template>
