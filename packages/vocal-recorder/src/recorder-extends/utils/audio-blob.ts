import type { Duration } from './duration'

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
