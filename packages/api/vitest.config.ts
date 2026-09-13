// packages/api/vitest.config.ts
// Vitest config for the Snowside API Worker tests.
// Uses the node pool (not @cloudflare/vitest-pool-workers) because the
// tests use an in-memory D1 mock and call app.fetch() directly — no real
// Workers runtime needed. This keeps the test deps minimal and avoids the
// vitest@5 / pool-workers peer-dep conflict (pool-workers 0.22 wants vitest ^4).
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
  },
})
