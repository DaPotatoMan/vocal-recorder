import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ssl from '@vitejs/plugin-basic-ssl'

import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'
import Unocss from 'unocss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/vocal-recorder/' : '/',

  plugins: [
    vue(),
    ssl(),
    Unocss({
      presets: [
        presetUno(),
        presetIcons(),
        presetAttributify()
      ],

      transformers: [
        transformerDirectives()
      ]
    })
  ],

  build: {
    assetsInlineLimit: 0
  },

  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },

  optimizeDeps: {
    exclude: ['@shiguredo/rnnoise-wasm', '@ffmpeg/ffmpeg', '@ffmpeg/util']
  }
}))
