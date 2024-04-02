import { Shine, StereoMode } from '@toots/shine.js'
import { Encoder } from '../types'
import { Logger, useExpandedBuffer } from '../../shared'

export async function useShineEncoder(config = new Encoder.Config()) {
  await Shine.initialized
  Logger.log('shine-encoder: initialized')

  const shine = new Shine({
    samplerate: config.sampleRate,
    bitrate: config.bitRate,
    channels: config.channels,
    stereoMode: StereoMode.MONO
  })

  const chunks = useExpandedBuffer(Uint8Array)
  let isDone = false

  function encode(data: Float32Array) {
    if (isDone)
      return

    chunks.append(shine.encode([data]))
  }

  function stop() {
    isDone = true
    chunks.append(shine.close())

    const blob = new Blob([chunks.getBuffer()], { type: 'audio/mpeg' })

    return blob
  }

  return { encode, stop }
}
