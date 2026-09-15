<!-- packages/tour/layouts/snow-connect.vue -->
<template>
  <div class="snow-connect-root snow-bg">
    <div class="snow-connect-inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.snow-connect-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 2.5rem 3.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
@media (max-width: 768px) {
  .snow-connect-inner {
    padding: 1.5rem 1.25rem;
    justify-content: flex-start;
  }
}
</style>