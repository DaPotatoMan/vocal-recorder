import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    noExternal: [/(.*)/],
    dts: true,
    clean: true,
    minify: true,
    format: ['esm'],

    plugins: [
      {
        name: 'replace-string',
        renderChunk(code, info) {
          return {
            code: code.replace('mp3.worker.ts', 'mp3.worker.js'),
            info
          }
        }
      }
    ]
  },

  // MP3 Worker
  {
    entry: ['src/encoder/codecs/mp3.worker.ts'],
    noExternal: [/(.*)/],
    dts: true,
    clean: true,
    minify: true,
    format: ['esm']
  }
])
