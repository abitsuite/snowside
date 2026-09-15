<!-- packages/tour/components/ComparisonTable.vue -->
<!-- Source: packages/pitch/src/pages/index.astro `comparison` array (verified) -->
<script setup lang="ts">
const rows = [
  { feature: 'Consensus mechanism', snowside: 'Avalanche PoS + BMM', lightning: 'Off-chain channels', base: 'Ethereum PoS' },
  { feature: 'Finality time', snowside: '< 1 second', lightning: 'Instant (payment)', base: '~ 2 seconds' },
  { feature: 'Gas token', snowside: 'ECX', lightning: 'BTC', base: 'ETH' },
  { feature: 'Smart contracts', snowside: 'Full EVM', lightning: 'Limited (scripts)', base: 'Full EVM' },
  { feature: 'Stablecoin support', snowside: 'Native USDC via ICM', lightning: 'None', base: 'Native USDC' },
  { feature: 'Node operation', snowside: 'Community-run', lightning: 'Manual', base: 'Manual' },
  { feature: 'Maintenance burden', snowside: 'Low', lightning: 'Medium', base: 'Medium' },
  { feature: 'Validator sovereignty', snowside: 'Dedicated set', lightning: 'N/A', base: 'Shared with Ethereum' },
]
</script>

<template>
  <div class="overflow-x-auto mt-6">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-white/10">
          <th class="py-3 pr-4 font-mono font-semibold text-slate-400">Feature</th>
          <th class="py-3 pr-4 font-mono font-semibold text-snow-300">Snowside</th>
          <th class="py-3 pr-4 font-mono font-semibold text-slate-400">Lightning</th>
          <th class="py-3 font-mono font-semibold text-slate-400">Base</th>
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
          <td class="py-3 pr-4 text-slate-400">{{ row.lightning }}</td>
          <td class="py-3 text-slate-400">{{ row.base }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>