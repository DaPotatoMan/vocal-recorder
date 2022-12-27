import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ssl from '@vitejs/plugin-basic-ssl'

import Unocss from 'unocss/vite'
import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/vocal-recorder/' : '/',

  plugins: [
    vue(),
    // ssl(),
    Unocss({
      presets: [
        presetUno(),
        presetAttributify()
      ],

      transformers: [
        transformerDirectives()
      ]
    })
  ],

  build: {
    assetsInlineLimit: 0
  }
}))
