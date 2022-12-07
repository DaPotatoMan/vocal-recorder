import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  assetsInclude: ['public/vmsg.wasm'],

  build: {
    lib: {
      name: 'BAR',
      fileName: 'index',
      formats: ['es', 'cjs', 'umd'],
      entry: resolve(__dirname, 'src/index.ts')
    }
  },

  test: {
    globals: true
  }
})
