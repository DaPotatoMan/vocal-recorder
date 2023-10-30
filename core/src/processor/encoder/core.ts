import { useEncoder as useWebmEncoder } from './webm'

export interface Encoder {
  encode(blob: Blob, hasHeaders: boolean): void
  stop(): Blob
}

export namespace Encoder {
  type BitRate = 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 112 | 128 | 160 | 192 | 224 | 256 | 320

  export class Config {
    constructor(
      public sampleRate = 48000,
      public bitRate: BitRate = 128,
      public channels: 1 | 2 = 1
    ) { }

    get audioBitsPerSecond() {
      return this.bitRate * 1000
    }

    /** Recording mimeType */
    get sourceMimeType() {
      const types = {
        opusWEBM: 'audio/webm;codecs=opus',
        mp3: 'audio/mp4'
      } as const

      const check = MediaRecorder.isTypeSupported

      try {
        if (check(types.opusWEBM)) return types.opusWEBM
        if (check(types.mp3)) return types.mp3
      }
      catch { }
    }
  }
}

export function useBaseEncoder() {
  console.log('[Recorder]', 'using base encoder')

  const chunks: Blob[] = []

  return {
    encode(blob: Blob) {
      chunks.push(blob)
    },

    stop: () => new Blob(chunks, { type: chunks[0].type })
  }
}

export async function useEncoder(config: Encoder.Config) {
  try {
    const webmMimeType = 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported(webmMimeType)) return useWebmEncoder(config)
  }

  catch { }

  return useBaseEncoder()
}
