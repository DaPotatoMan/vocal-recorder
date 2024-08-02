import type { AudioBlob, SerializedAudioBlob } from '../factories'
import { StreamUtil } from '../shared'

export const Codecs = {
  mp3: {
    name: 'mp3',
    mimeType: 'audio/mpeg',
    extension: 'mp3'
  },

  /** `MP4A` encoded audio in `m4a` container */
  mp4a: {
    name: 'mp4a',
    mimeType: 'audio/mp4',
    extension: 'm4a'
  },

  /** `OPUS` encoded audio in `webm` container */
  opus: {
    name: 'opus',
    mimeType: 'audio/webm;codecs=opus',
    extension: 'webm'
  },

  /** `unknown` encoded audio in `webm` container */
  unknown: {
    name: 'unknown-webm',
    mimeType: 'audio/webm',
    extension: 'webm'
  }
} as const

export type AudioCodecType = keyof typeof Codecs
export type AudioCodec = typeof Codecs[AudioCodecType]

/** Returns codec for given blob */
export function getBlobCodec(blob: Blob | File) {
  for (const key in Codecs) {
    const codec = Codecs[key as keyof typeof Codecs]

    // Match mimetype
    if (blob.type.includes(codec.mimeType))
      return codec

    // Match extension if no mimetype is found
    if (!blob.type && blob instanceof File && blob.name.endsWith(codec.extension))
      return codec
  }

  return Codecs.unknown
}

export interface Encoder {
  encode: (blob: Blob) => void
  stop: () => Promise<AudioBlob> | AudioBlob
  dispose: () => void
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

    update(stream: MediaStream) {
      this.sampleRate = StreamUtil.getSettings(stream).sampleRate || this.sampleRate
    }

    /** Codec used by MediaRecorder for recording blob chunks */
    readonly sourceCodec = Object
      .values(Codecs)
      .find(codec => globalThis?.MediaRecorder?.isTypeSupported(codec.mimeType)) // MediaRecorder.isTypeSupported is not supported in older Safari
      ?? Codecs.unknown
  }
}

export namespace Worker {
  // eslint-disable-next-line no-restricted-syntax
  export const enum Event {
    INIT = 'init',
    STOP = 'stop',

    /** When worker is ready */
    READY = 'ready',

    /** Passed from main thread to worker. ArrayBuffer is blob data from `blob.arrayBuffer()` */
    ENCODE = 'encode',

    /** Sent from worker to main thread */
    RESULT = 'result'
  }

  export interface Data {
    [Event.INIT]: Encoder.Config & object
    [Event.STOP]: void
    [Event.ENCODE]: Blob

    [Event.READY]: void
    [Event.RESULT]: SerializedAudioBlob
  }

  export interface EventMap<T extends Event = Event> {
    type: T
    data: Data[T]
  }
}
