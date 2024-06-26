import type { Browser, LaunchOptions } from 'playwright'
import { defineWorkspace } from 'vitest/config'

interface BrowserProviderOptions {
  launch?: LaunchOptions
  page?: Parameters<Browser['newPage']>[0]
}

export default defineWorkspace([
  // Normal tests
  {
    test: {
      globals: true,
      include: ['src/**/*.test.ts']
    }
  },

  // Browser tests
  {
    test: {
      globals: true,
      include: ['tests/browser/**/*.test.ts'],

      browser: {
        enabled: true,
        // headless: true,
        name: 'chromium',
        provider: 'playwright',
        providerOptions: {
          launch: {
            devtools: true
          },

          page: {
            permissions: ['microphone']
          }
        } satisfies BrowserProviderOptions
      }
    }
  }
])
