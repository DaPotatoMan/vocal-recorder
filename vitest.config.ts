import type { Browser, LaunchOptions } from 'playwright'
import { defineConfig } from 'vitest/config'

interface BrowserProviderOptions {
  launch?: LaunchOptions
  page?: Parameters<Browser['newPage']>[0]
}

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
      name: 'chromium',
      provider: 'playwright',
      providerOptions: {
        launch: {
          devtools: true,
          args: ['--use-fake-ui-for-media-stream']
        },

        page: {
          permissions: ['microphone']
        }
      } satisfies BrowserProviderOptions
    }
  }
})
