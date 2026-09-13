<!-- packages/tour/components/ComparisonTable.vue -->
<!-- Source: packages/pitch/src/pages/index.astro `comparison` array (verified) -->
<script setup lang="ts">
const rows = [
  { feature: 'Consensus mechanism', snowside: 'Avalanche PoS + BMM', ethside: 'Bitcoin BMM only', lightning: 'Off-chain channels' },
  { feature: 'Finality time', snowside: '< 1 second', ethside: '~ 10 minutes', lightning: 'Instant (payment)' },
  { feature: 'Gas token', snowside: 'BTC', ethside: 'BTC', lightning: 'BTC' },
  { feature: 'Smart contracts', snowside: 'Full EVM', ethside: 'Full EVM', lightning: 'Limited (scripts)' },
  { feature: 'Stablecoin support', snowside: 'Native USDC via ICM', ethside: 'Manual bridging', lightning: 'None' },
  { feature: 'Node operation', snowside: 'Automated (NodΞRunr)', ethside: 'Manual', lightning: 'Manual' },
  { feature: 'Maintenance burden', snowside: 'Low', ethside: 'High (retired)', lightning: 'Medium' },
  { feature: 'Validator sovereignty', snowside: 'Dedicated set', ethside: 'Shared with BTC', lightning: 'N/A' },
]
</script>

<template>
  <div class="overflow-x-auto mt-6">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-white/10">
          <th class="py-3 pr-4 font-mono font-semibold text-slate-400">Feature</th>
          <th class="py-3 pr-4 font-mono font-semibold text-aval-500">Snowside</th>
          <th class="py-3 pr-4 font-mono font-semibold text-slate-500">EthSide</th>
          <th class="py-3 font-mono font-semibold text-slate-500">Lightning</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows"
          :key="row.feature"
          :class="i % 2 === 0 ? 'border-b border-white/5 bg-white/5' : 'border-b border-white/5'"
        >
          <td class="py-3 pr-4 font-medium text-slate-300">{{ row.feature }}</td>
          <td class="py-3 pr-4 font-semibold text-snow-300">{{ row.snowside }}</td>
          <td class="py-3 pr-4 text-slate-500">{{ row.ethside }}</td>
          <td class="py-3 text-slate-500">{{ row.lightning }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
