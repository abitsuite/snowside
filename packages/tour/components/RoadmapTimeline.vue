<!-- packages/tour/components/RoadmapTimeline.vue -->
<!-- Data lives in packages/tour/content.mjs (shared by deck + responsive page).
     Roadmap phases (verified): Devnet → Alphanet → Betanet → Mainnet → Ongoing -->
<script setup lang="ts">
import { roadmap } from '../content.mjs'

const milestones = roadmap.phases
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