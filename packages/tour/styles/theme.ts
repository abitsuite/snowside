// packages/tour/styles/theme.ts
// Snow theme accent colors and font variables — consumed by uno.config.ts
export const snowTheme = {
  colors: {
    snow: {
      50: '#f5f9ff', 100: '#e8f2ff', 200: '#cfe6ff',
      300: '#9fc8ff', 400: '#5a9dff', 500: '#2f7bff',
      600: '#1659d6', 700: '#1143a3', 800: '#0f3380', 900: '#0b2356',
    },
    aval: { 400: '#e84142', 500: '#d62828', 600: '#b81d1d', 700: '#9a1414' },
    ink:  { 700: '#111c33', 800: '#0a1224', 900: '#050b16' },
  },
  fonts: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    mono: 'JetBrains Mono, ui-monospace, monospace',
  },
} as const
