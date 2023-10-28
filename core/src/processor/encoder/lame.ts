import { createEncoder } from 'wasm-media-encoders/esnext'
import wasm from 'wasm-media-encoders/wasm/mp3?url'
import { Logger } from '../../shared'

export async function useLameEncoder(sampleRate = 44100) {
  const encoder = await createEncoder('audio/mpeg', wasm)
  const config = Object.freeze({
    sampleRate,
    channels: 1,
    vbrQuality: 0
  })

  encoder.configure(config)

  let outBuffer = new Uint8Array(1024 * 1024)
  let offset = 0
  let isDone = false

  function appendData(mp3Data: Uint8Array) {
    if (mp3Data.length + offset > outBuffer.length) {
      Logger.log('(mp3-encoder) resizing buffer size')

      const newBuffer = new Uint8Array(mp3Data.length + offset)
      newBuffer.set(outBuffer)
      outBuffer = newBuffer
    }

    outBuffer.set(mp3Data, offset)
    offset += mp3Data.length
  }

  function encode(data: Float32Array) {
    if (isDone) return

    appendData(
      encoder.encode([data])
    )
  }

  function stop() {
    isDone = true
    appendData(encoder.finalize())

    const buffer = new Uint8Array(outBuffer.buffer, 0, offset)
    const blob = new Blob([buffer], { type: encoder.mimeType })

    // Cleanup
    outBuffer = null as any
    offset = 0

    return blob
  }

  return { config, encode, stop }
}
