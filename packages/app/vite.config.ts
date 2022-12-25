import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
  assetsInclude: ['public/vmsg.wasm'],

  plugins: [
    dts({ insertTypesEntry: true })
  ] as any,

  build: {
    lib: {
      name: 'VAR',
      fileName: 'index',
      formats: ['es', 'cjs', 'umd'],
      entry: resolve(__dirname, 'src/index.ts')
    }
  },

  test: {
    globals: true
  }
})
