<!-- packages/tour/layouts/snow-cover.vue -->
<template>
  <div class="snow-cover-root snow-bg">
    <div class="snow-cover-inner">
      <div class="accent-line" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.snow-cover-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1080px;
  padding: 0 3.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
@media (max-width: 768px) {
  .snow-cover-inner {
    padding: 0 1.25rem;
  }
}
</style>