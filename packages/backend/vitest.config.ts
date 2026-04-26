import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['verbose'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
        ...configDefaults.exclude, 
        '**/Microtest/**',
    ],
  },
})
