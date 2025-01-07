import type { Encoder } from '.'
import { createEncoder, type WasmMediaEncoder } from 'wasm-media-encoders/esnext'
import wasm from 'wasm-media-encoders/wasm/mp3?url'
import { RuntimeError } from '../shared'
import { useExpandedBuffer } from './worker.shine'

export class LameEncoder {
  isDone = false
  chunks = useExpandedBuffer()

  #encoder?: WasmMediaEncoder<'audio/mpeg'>

  get encoder() {
    if (!this.#encoder)
      throw new RuntimeError('ENCODER_SHINE_NOT_INIT')

    return this.#encoder
  }

  async init(config: Encoder.Config) {
    const encoder = await createEncoder('audio/mpeg', wasm)

    encoder.configure({
      sampleRate: config.sampleRate,
      channels: config.channels,
      vbrQuality: 0
    })

    this.#encoder = encoder

    console.debug('LameEncoder: initialized', config)
  }

  dispose() {
    this.#encoder = undefined
    this.isDone = false
    this.chunks.reset()
  }

  encode(data: Float32Array) {
    if (this.isDone)
      return

    this.chunks.append(
      this.encoder.encode([data])
    )
  }

  stop() {
    this.isDone = true
    this.chunks.append(this.encoder.finalize())
    return new Blob([this.chunks.getBuffer()], { type: 'audio/mpeg' })
  }
}
