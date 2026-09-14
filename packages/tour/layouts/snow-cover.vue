<!-- packages/tour/layouts/snow-cover.vue -->
<template>
  <div class="snow-cover-root">
    <!-- Aurora gradient backdrop -->
    <div class="snow-aurora" />
    <!-- Faint snow-dust speckles (pure CSS, no images) -->
    <div class="snow-dust" aria-hidden="true" />
    <div class="snow-cover-inner">
      <div class="accent-line" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.snow-cover-root {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 50% 0%, #0b2356 0%, transparent 60%),
    radial-gradient(90% 70% at 85% 110%, #1143a3 0%, transparent 55%),
    linear-gradient(180deg, #050b16 0%, #0a1224 100%);
}
.snow-aurora {
  position: absolute;
  inset: -20% -20% auto -20%;
  height: 70%;
  background:
    radial-gradient(40% 60% at 30% 40%, rgba(90, 157, 255, 0.22), transparent 70%),
    radial-gradient(35% 55% at 75% 30%, rgba(232, 65, 66, 0.10), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}
.snow-dust {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.8), transparent 60%),
    radial-gradient(1px 1px at 28% 62%, rgba(255,255,255,0.6), transparent 60%),
    radial-gradient(1.5px 1.5px at 47% 12%, rgba(207,230,255,0.7), transparent 60%),
    radial-gradient(1px 1px at 63% 78%, rgba(255,255,255,0.5), transparent 60%),
    radial-gradient(1px 1px at 78% 33%, rgba(255,255,255,0.7), transparent 60%),
    radial-gradient(1.5px 1.5px at 88% 70%, rgba(207,230,255,0.5), transparent 60%),
    radial-gradient(1px 1px at 38% 88%, rgba(255,255,255,0.4), transparent 60%),
    radial-gradient(1px 1px at 8% 78%, rgba(255,255,255,0.5), transparent 60%);
}
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
</style>
