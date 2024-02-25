import { MediaRecorder } from 'extendable-media-recorder'
import { type Encoder, useEncoder } from '../encoder'
import { DeferredPromise, type EventBus, StreamUtil } from '../shared'
import type { AudioBlob } from '.'

const log = console.debug.bind(null, '[Recorder]')

export class Recorder extends MediaRecorder {
  #result = new DeferredPromise<AudioBlob>()

  async #encodeChunk(chunk: Blob) {
    if (chunk.size === 0) return log('0 byte chunk skipped')

    log(`encoding chunk -> ${chunk.size}`)

    this.encoder.encode(chunk)

    if (this.state === 'inactive')
      this.#result.resolve(await this.encoder.stop())
  }

  static async create(stream: MediaStream, config: Encoder.Config, emitter: EventBus) {
    return new Recorder(stream, config, emitter, await useEncoder(config))
  }

  constructor(stream: MediaStream, private config: Encoder.Config, emitter: EventBus, public encoder: Encoder) {
    log('config', config)

    super(stream, {
      mimeType: config.sourceCodec.mimeType,
      audioBitsPerSecond: config.audioBitsPerSecond
    })

    super.addEventListener('dataavailable', event => this.#encodeChunk(event.data))

    // Delegate events
    const events = ['start', 'stop', 'pause', 'resume'] as const

    events.forEach(event => super.addEventListener(event, () => {
      emitter.emit(event)
      log(event)
    }))
  }

  override start() {
    // Record in chunks if codec is OPUS webm
    const interval = this.config.sourceCodec.name === 'opus' ? 3000 : undefined
    super.start(interval)
  }

  override stop() {
    super.stop()
    StreamUtil.dispose(this.stream)
    return this.#result
  }
}
