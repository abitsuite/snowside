<!-- packages/tour/components/RoadmapTimeline.vue -->
<!-- Roadmap phases (verified): Devnet → Alphanet → Betanet → Mainnet → Ongoing -->
<script setup lang="ts">
const milestones = [
  { month: 'Devnet', milestone: 'Internal development network. Genesis configuration, precompile integration, and BMM coordination precompile validation against the Subnet-EVM fork.' },
  { month: 'Alphanet', milestone: 'Federated federation bootstrapping. eCash Alphanet BIP-300/301 deposit and withdrawal flow validation; NativeMinter and DeployerAllowList precompiles live.' },
  { month: 'Betanet', milestone: 'Public testnet with community validators. Security audit of peg smart contracts; ICM USDC bridge integration with the Avalanche C-Chain; block explorer deployment.' },
  { month: 'Mainnet', milestone: 'Mainnet launch with community validators; public RPC endpoints; developer documentation released; first eCash dApp deployments.' },
  { month: 'Ongoing', milestone: 'Validator growth, protocol maintenance, ecosystem development. Continuous BMM adoption and USDC liquidity expansion.' },
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