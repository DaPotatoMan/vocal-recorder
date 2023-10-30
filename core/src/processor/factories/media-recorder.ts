import { MediaRecorder } from 'extendable-media-recorder'
import { type Encoder, useEncoder } from '../encoder/core'
import { DeferredPromise, type EventBus, StreamUtil } from '../../shared'

const log = console.debug.bind('[Recorder]')

export class Recorder extends MediaRecorder {
  #promise = new DeferredPromise<Blob>()
  #chunks: BlobPart[] = []

  #resolveBlob() {
    log('blob resolved')

    const blob = this.encoder.stop()
    this.#promise.resolve(blob)
  }

  async #encodeChunk(chunk: Blob) {
    // Skip empty chunks
    if (chunk.size === 0) return log('skipped 0 byte chunk')

    log(`encoding chunk -> ${chunk.size}`)

    this.#chunks.push(chunk)
    await this.encoder.encode(chunk, this.#chunks.length === 1)

    if (this.state === 'inactive') this.#resolveBlob()
  }

  static async create(stream: MediaStream, config: Encoder.Config, emitter: EventBus) {
    const encoder = await useEncoder(config)
    return new Recorder(stream, config, encoder, emitter)
  }

  constructor(private stream: MediaStream, private config: Encoder.Config, private encoder: Encoder, emitter: EventBus) {
    log('config', config)

    super(stream, {
      mimeType: config.sourceMimeType,
      audioBitsPerSecond: config.audioBitsPerSecond
    })

    super.addEventListener('dataavailable', event => this.#encodeChunk(event.data))

    // Delegate events
    const events = ['start', 'stop', 'pause'] as const
    events.forEach(event => super.addEventListener(event, () => emitter.emit(event)))
  }

  stop() {
    super.stop()
    StreamUtil.dispose(this.stream)

    return this.#promise
  }
}

// export class ReusableRecorder implements Pick<Recorder, 'start' | 'stop' | 'resume' | 'pause' | 'mimeType' | 'state'> {
//   #internal!: Recorder

//   get mimeType() {
//     return this.#internal.mimeType
//   }

//   get state() {
//     return this.#internal.state
//   }

//   init() {
//     this.#internal?.stop()
//     this.#internal = new Recorder()
//   }

//   pause() {
//     this.#internal.pause()
//   }

//   resume() {
//     this.#internal.resume()
//   }

//   start() {
//     this.#internal.start()
//   }

//   stop() {
//     return this.#internal.stop()
//   }
// }
