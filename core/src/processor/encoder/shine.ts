import { Shine, StereoMode } from '@toots/shine.js'
import { Logger } from '../../shared'
import { Encoder } from './core'

export async function useShineEncoder(config = new Encoder.Config()) {
  await Shine.initialized
  Logger.log('shine-encoder: initialized')

  const shine = new Shine({
    samplerate: config.sampleRate,
    bitrate: config.bitRate,
    channels: config.channels,
    stereoMode: StereoMode.MONO
  })

  let chunks: Uint8Array[] = []
  let isDone = false

  function encode(data: Float32Array) {
    if (isDone) return

    chunks.push(
      shine.encode([data])
    )
  }

  function stop() {
    isDone = true
    chunks.push(shine.close())
    const blob = new Blob(chunks, { type: 'audio/mpeg' })

    // Flush
    chunks = []

    return blob
  }

  return Object.freeze({ encode, stop })
}
