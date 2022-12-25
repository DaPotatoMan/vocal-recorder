import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

import { version } from '../../package.json'
import manifest from './public/package.json'

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true }) as any,

    // Update package.json version
    {
      buildStart() {
        const pkgPath = 'public/package.json'
        manifest.version = version
        writeFileSync(pkgPath, JSON.stringify(manifest, null, 2))
      }
    }
  ],

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
