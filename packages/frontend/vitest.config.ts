import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',

    watch: false,
    forceExit: true,
    testTimeout: 10000,

    clearMocks: true,
    restoreMocks: true,

    coverage: {
        provider: 'v8',
        thresholds: {
            statements: 100,
            branches:   30.01,
            functions:  10.01,
            lines:      4.01,
        },
    },
  }
})
