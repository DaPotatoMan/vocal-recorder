import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true
    })
  ],

  build: {
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      name: 'VocalRecorder',
      fileName: 'index'
    }
  },

  experimental: {
    renderBuiltUrl(filename) {
      return `./${filename}`
    }
  }
})
