import { AudioPeaks } from './peaks'

export { AudioPeaks }

export class Duration extends Number {
  constructor(ms: number) { super(ms) }
  get seconds() { return this.valueOf() / 1000 }
  get minutes() { return this.seconds / 60 }
  get hours() { return this.seconds / 3600 }
}

export class AudioBlob extends Blob {
  constructor(public readonly blob: Blob, public readonly duration: Duration, public readonly peaks: AudioPeaks) {
    super([blob], { type: blob.type })
    Object.freeze(this)
  }

  toSerialized() {
    return {
      blob: this.blob,
      duration: this.duration.valueOf(),
      peaks: Array.from<number>(this.peaks)
    }
  }

  /**
   * @param duration in milliseconds
   */
  static fromRaw(blob: Blob, duration: number, peaksArgs: ConstructorParameters<typeof AudioPeaks>) {
    return new AudioBlob(blob, new Duration(duration), new AudioPeaks(...peaksArgs))
  }
}
