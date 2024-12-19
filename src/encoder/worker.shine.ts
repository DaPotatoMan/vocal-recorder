import type { Encoder } from '.'
import { Shine, StereoMode } from '@toots/shine.js'

function useExpandedBuffer(initialSize = 1024 * 1024) {
  let outBuffer = new Uint8Array(initialSize)
  let offset = 0

  function append(data: Uint8Array) {
    if (data.length + offset > outBuffer.length) {
      console.debug('(useExpandedBuffer) resizing buffer size')

      const newBuffer = new Uint8Array(data.length + offset)
      newBuffer.set(outBuffer)
      outBuffer = newBuffer
    }

    outBuffer.set(data, offset)
    offset += data.length
  }

  function getBuffer() {
    return new Uint8Array(outBuffer.buffer, 0, offset)
  }

  function reset() {
    outBuffer = new Uint8Array(initialSize)
    offset = 0
  }

  return { append, getBuffer, reset }
}

export class ShineEncoder {
  shine?: Shine
  chunks = useExpandedBuffer()
  isDone = false

  async init(config: Encoder.Config) {
    await Shine.initialized

    console.log('Got shine config ', config)

    this.shine = new Shine({
      samplerate: config.sampleRate,
      bitrate: config.bitRate,
      channels: config.channels,
      stereoMode: StereoMode.MONO
    })
  }

  dispose() {
    this.shine = undefined
    this.isDone = false
    this.chunks.reset()
  }

  encode(data: Float32Array) {
    if (!this.shine)
      throw new Error('Shine encoder not initialized')

    if (this.isDone)
      return

    this.chunks.append(this.shine.encode([data]))
  }

  stop() {
    if (!this.shine)
      throw new Error('Shine encoder not initialized')

    this.isDone = true
    this.chunks.append(this.shine.close())

    return new Blob([this.chunks.getBuffer()], { type: 'audio/mpeg' })
  }
}
