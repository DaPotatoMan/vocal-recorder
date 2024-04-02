import { AudioBlob } from '../../factories'
import { getAudioBufferPeaks } from '../../factories/peaks'
import { getBlobAudioBuffer } from '../../shared'
import type { Encoder } from '../types'

/**
 * Encoder used to encode unknown audio blobs. On Safari it's mp4a (aac),
 * other platforms maybe webm with vorbis or other audio codec.
 */
export function useBaseEncoder(config: Encoder.Config): Encoder {
  let chunks: Blob[] = []

  function dispose() {
    chunks = []
  }

  async function stop() {
    const blob = new Blob(chunks, { type: chunks[0].type })
    const buffer = await getBlobAudioBuffer(blob)
    const peaks = await getAudioBufferPeaks(buffer, 100)

    dispose()
    return AudioBlob.fromRaw(blob, buffer.duration * 1000, [peaks, 100], config.sourceCodec)
  }

  return {
    encode(blob: Blob) {
      chunks.push(blob)
    },

    stop,
    dispose
  }
}
