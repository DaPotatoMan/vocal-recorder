import { Shine, StereoMode } from '@toots/shine.js'
import type { Encoder } from '.'

function useExpandedBuffer<T extends Uint8ArrayConstructor | Float32ArrayConstructor>(Ref: T, initialSize = 1024 * 1024) {
  let outBuffer = new Ref(initialSize)
  let offset = 0

  function append(data: InstanceType<T>) {
    if (data.length + offset > outBuffer.length) {
      console.debug('(useExpandedBuffer) resizing buffer size')

      const newBuffer = new Ref(data.length + offset)
      newBuffer.set(outBuffer)
      outBuffer = newBuffer
    }

    outBuffer.set(data, offset)
    offset += data.length
  }

  function getBuffer() {
    return new Ref(outBuffer.buffer, 0, offset) as InstanceType<T>
  }

  return { append, getBuffer }
}

export class ShineEncoder {
  shine?: Shine
  chunks = useExpandedBuffer(Uint8Array)
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
    this.chunks = useExpandedBuffer(Uint8Array)
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
