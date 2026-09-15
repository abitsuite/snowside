<!-- packages/tour/layouts/snow-default.vue -->
<template>
  <div class="snow-bg">
    <div class="relative z-10 w-full h-full snow-default-inner">
      <div class="snow-page-label">
        {{ $slidev.configs.title }}
      </div>
      <div class="snow-default-content">
        <slot />
      </div>
      <div class="snow-page-number">
        {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.snow-default-inner {
  position: relative;
}
.snow-page-label {
  position: absolute;
  top: 1.5rem;
  left: 3.5rem;
  font-size: 0.75rem;
  font-family: JetBrains Mono, ui-monospace, monospace;
  color: #64748b;
}
.snow-default-content {
  padding: 4rem 3.5rem 2.5rem;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.snow-page-number {
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  font-size: 0.75rem;
  font-family: JetBrains Mono, ui-monospace, monospace;
  color: #475569;
}
@media (max-width: 768px) {
  .snow-page-label {
    left: 1.25rem;
    top: 1rem;
  }
  .snow-default-content {
    padding: 3rem 1.25rem 2.5rem;
  }
  .snow-page-number {
    right: 1rem;
    bottom: 0.75rem;
  }
}
</style>