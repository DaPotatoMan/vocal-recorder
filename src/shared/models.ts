import { AudioPeaks, getAudioInfo } from './peaks'

/** Duration in milliseconds */
export class Duration extends Number {
  get seconds() { return this.valueOf() / 1000 }
  get minutes() { return this.seconds / 60 }
  get hours() { return this.seconds / 3600 }

  toJSON = () => this.valueOf()
}

export class AudioBlob extends Blob {
  constructor(
    public blob: Blob,
    public duration: Duration,
    public peaks: AudioPeaks
  ) {
    super([blob], { type: blob.type })
    Object.freeze(this)
  }

  /** Returns filename with proper extension of codec */
  getFilename = (name: string) => `${name}.mp3` as const

  toJSON() {
    return {
      blob: this.blob,
      duration: this.duration.valueOf(),
      peaks: Array.from<number>(this.peaks)
    }
  }

  static fromJSON(json: AudioBlob.Serialized) {
    return new AudioBlob(json.blob, new Duration(json.duration), new AudioPeaks(json.peaks))
  }

  /** Create AudioBlob from {@link Blob} or {@link ArrayBuffer} */
  static async parse(input: Blob | ArrayBuffer) {
    const { peaks, duration } = await getAudioInfo(input)
    const blob = input instanceof Blob ? input : new Blob([input], { type: 'audio/mpeg' })

    return new AudioBlob(blob, new Duration(duration), new AudioPeaks(peaks))
  }
}

export namespace AudioBlob {
  export type Serialized = ReturnType<AudioBlob['toJSON']>
}
