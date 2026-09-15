<!-- packages/tour/layouts/snow-section.vue -->
<template>
  <div class="snow-bg">
    <div class="snow-section-inner">
      <div class="accent-line" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.snow-section-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  padding: 4rem 3.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
@media (max-width: 768px) {
  .snow-section-inner {
    padding: 3rem 1.25rem 2.5rem;
  }
}
</style>