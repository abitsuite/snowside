<!-- packages/tour/global-bottom.vue -->
<!-- Global layer: rendered on EVERY slide of the deck (Slidev discovers
     `global-bottom.vue` at the project root — see @slidev/cli/dist/cli.js:64
     and chunk-YP37OZJY.js:558 which resolve ["global-bottom.vue",
     "GlobalBottom.vue"]). This puts the official "Snowside Tour" wordmark on
     every page of the deck so the title is always visible, not only in the
     browser tab / meta tags. Kept intentionally subtle and low-contrast so it
     does not compete with slide content; the cover slide shows it at full
     strength via its own cover-kicker. -->
<template>
  <div class="tour-wordmark" aria-hidden="true">
    <span class="tour-wordmark-dot" />
    Snowside Tour
  </div>
</template>

<style scoped>
.tour-wordmark {
  position: absolute;
  right: 1.5rem;
  bottom: 1rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: JetBrains Mono, ui-monospace, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(159, 200, 255, 0.45); /* snow-300, dimmed */
  pointer-events: none;
  user-select: none;
}
.tour-wordmark-dot {
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 9999px;
  background: #5a9dff; /* snow-400 */
  box-shadow: 0 0 6px 1px rgba(90, 157, 255, 0.6);
}
</style>