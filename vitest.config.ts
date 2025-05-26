import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': __dirname
    }
  },

  test: {
    globals: true,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],

    coverage: {
      enabled: true,
      include: ['src/**'],
      reportsDirectory: 'tests/.coverage'
    },

    browser: {
      // headless: true,
      enabled: true,
      provider: 'playwright',

      instances: [
        {
          browser: 'chromium',

          launch: {
            devtools: true,
            args: ['--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required']
          },

          context: {
            permissions: ['microphone']
          }
        }
      ]
    }
  }
})
