<!-- packages/tour/components/StakingRevenueCard.vue -->
<script setup lang="ts">
defineProps<{ title: string; apy: string; note: string }>()
</script>

<template>
  <div class="flex-1 bg-white/5 border border-snow-500/20 rounded-xl p-6 hover:border-snow-400/40 transition-colors">
    <div class="text-xs font-mono text-snow-400 mb-2">REVENUE STREAM</div>
    <h3 class="text-xl font-semibold text-white mb-3">{{ title }}</h3>
    <div class="text-3xl font-bold text-snow-300 font-mono mb-2">{{ apy }}</div>
    <p class="text-sm text-slate-400 leading-relaxed">{{ note }}</p>
  </div>
</template>
