import ssl from '@vitejs/plugin-basic-ssl'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'

import Unocss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/',

  plugins: [
    legacy({
      targets: ['Chrome 63'],
      modernPolyfills: true
    }),

    vue(),
    ssl() as any,
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

  preview: {
    port: 5173
  },

  optimizeDeps: {
    exclude: ['@shiguredo/rnnoise-wasm', '@ffmpeg/ffmpeg', '@ffmpeg/util']
  }
}))
