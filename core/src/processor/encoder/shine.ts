import { Shine, StereoMode } from '@toots/shine.js'
import { Logger } from '../../shared'

export async function useShineEncoder(context: AudioContext) {
  await Shine.initialized
  Logger.log('shine-encoder: initialized')

  const shine = new Shine({
    samplerate: context.sampleRate,
    bitrate: 128,
    channels: 1,
    stereoMode: StereoMode.MONO
  })

  const chunks: Uint8Array[] = []
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
    return new Blob(chunks, { type: 'audio/mpeg' })
  }

  return Object.freeze({ encode, stop })
}
