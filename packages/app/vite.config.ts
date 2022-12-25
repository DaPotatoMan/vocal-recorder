import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })] as any,

  build: {
    lib: {
      name: 'Recorder',
      fileName: 'index',
      formats: ['es', 'cjs'],
      entry: resolve(__dirname, 'src/index.ts')
    }
  },

  test: {
    globals: true
  }
})
