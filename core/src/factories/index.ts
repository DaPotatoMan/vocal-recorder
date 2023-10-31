import type { AudioCodec } from '../encoder'
import { AudioPeaks } from './peaks'

export { AudioPeaks }

export class Duration extends Number {
  constructor(ms: number) { super(ms) }
  get seconds() { return this.valueOf() / 1000 }
  get minutes() { return this.seconds / 60 }
  get hours() { return this.seconds / 3600 }
}

export class AudioBlob extends Blob {
  constructor(
    public blob: Blob,
    public duration: Duration,
    public peaks: AudioPeaks,
    public codec: AudioCodec
  ) {
    super([blob], { type: blob.type })
    Object.freeze(this)
  }

  toSerialized() {
    return {
      blob: this.blob,
      duration: this.duration.valueOf(),
      peaks: Array.from<number>(this.peaks),
      codec: this.codec
    }
  }

  /** Returns filename with proper extension of codec */
  getFilename = (name: string) => `${name}.${this.codec.extension}` as const

  /**
   * @param duration in milliseconds
   */
  static fromRaw(blob: Blob, duration: number, peaksArgs: ConstructorParameters<typeof AudioPeaks>, codec: AudioCodec) {
    return new AudioBlob(blob, new Duration(duration), new AudioPeaks(...peaksArgs), codec)
  }
}

export type SerializedAudioBlob = ReturnType<AudioBlob['toSerialized']>
