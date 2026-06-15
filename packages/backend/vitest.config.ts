import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 60000,
    reporters: ['verbose'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
        ...configDefaults.exclude, 
        '**/Microtest/**',
    ],
  },
})
