// packages/tour/uno.config.ts
import { defineConfig, presetWind, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    presetAttributify(),
    presetIcons({ scale: 1.2 }),
  ],
  theme: {
    colors: {
      snow: {
        50: '#f5f9ff',    100: '#e8f2ff', 200: '#cfe6ff',
        300: '#9fc8ff',   400: '#5a9dff', 500: '#2f7bff',
        600: '#1659d6',   700: '#1143a3', 800: '#0f3380',
        900: '#0b2356',
      },
      aval: {
        400: '#e84142', 500: '#d62828', 600: '#b81d1d',
        700: '#9a1414',
      },
      ink: {
        700: '#111c33', 800: '#0a1224', 900: '#050b16',
      },
    },
  },
  shortcuts: {
    'slide-canvas': 'w-full h-full bg-ink-900 text-slate-100 font-sans',
    'accent-line': 'border-b-2 border-snow-400 w-12 mb-4',
    'lead': 'text-lg text-slate-300',
    'tag': 'inline-block bg-snow-500/15 text-snow-300 rounded-full px-3 py-1 text-xs font-mono',
  },
})
