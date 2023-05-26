import type { Duration } from './utils'

interface AudioBlobOptions extends BlobPropertyBag {
  duration: Duration
  peaks?: number[]
}

export class AudioBlob extends Blob {
  readonly duration!: Duration
  peaks: number[] = []

  constructor(blobParts: BlobPart[], options: AudioBlobOptions) {
    super(blobParts, options)

    this.duration = options.duration
    this.peaks = options.peaks ?? []
  }
}

export function blobEncoder() {
  let encoder: typeof import('fix-webm-duration').default | undefined

  (async () => {
    encoder = MediaRecorder.isTypeSupported?.('audio/webm')
      ? await import('fix-webm-duration').then(i => i.default)
      : undefined
  })()

  return (chunks: BlobPart[], duration: number, type: string) => {
    const rawBlob = new Blob(chunks, { type })

    if (chunks.length <= 0)
      throw new Error('There are no chunk data available')

    if (!type.includes('webm')) {
      console.warn('File type is not webm. Encoding skipped.')
      return rawBlob
    }

    // Fix webm duration metadata
    return new Promise<Blob>((resolve) => {
      if (!encoder) {
        console.warn('fix-webm-duration module not loaded')
        return rawBlob
      }

      encoder(rawBlob, duration, resolve)
    })
  }
}
