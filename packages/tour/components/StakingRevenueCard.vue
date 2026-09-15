<!-- packages/tour/components/StakingRevenueCard.vue -->
<script setup lang="ts">
defineProps<{ title: string; apy: string; note: string }>()
</script>

<template>
  <div class="snow-card snow-revenue-card">
    <div class="snow-card-kicker">Revenue Stream</div>
    <h3>{{ title }}</h3>
    <div class="snow-revenue-apy">{{ apy }}</div>
    <p>{{ note }}</p>
  </div>
</template>