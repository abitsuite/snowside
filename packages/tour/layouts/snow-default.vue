<!-- packages/tour/layouts/snow-default.vue -->
<template>
  <div class="relative w-full h-full slide-canvas">
    <div class="absolute top-6 left-14 text-xs font-mono text-slate-500">
      {{ $slidev.configs.title }}
    </div>
    <div class="px-14 pt-16 pb-10 h-full">
      <slot />
    </div>
    <div class="absolute bottom-4 right-8 text-xs font-mono text-slate-600">
      {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
    </div>
  </div>
</template>
