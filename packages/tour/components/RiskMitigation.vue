<!-- packages/tour/components/RiskMitigation.vue -->
<!-- Data lives in packages/tour/content.mjs (shared by deck + responsive page).
     Source: packages/pitch/src/pages/index.astro `risks` array (verified). -->
<script setup lang="ts">
import { risks as risksData } from '../content.mjs'

const risks = risksData.items
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
    <div
      v-for="r in risks"
      :key="r.risk"
      class="snow-card"
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