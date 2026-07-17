// packages/web/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://snowside.network',
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
