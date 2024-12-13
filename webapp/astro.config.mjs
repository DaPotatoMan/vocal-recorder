import solid from '@astrojs/solid-js'
import unocss from '@unocss/astro'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  base: process.env.CI ? '/vocal-recorder': undefined,
  integrations: [
    unocss({ injectReset: true }),
    solid({ devtools: true })
  ]
})
