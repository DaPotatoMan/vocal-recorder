import { Buffer } from 'buffer'
import { OpusDecoder } from 'opus-decoder'
import { Decoder as WebmDecoder } from 'ts-ebml'
import { useShineEncoder } from './shine'
import type { Encoder } from './core'

window.Buffer = Buffer

export async function useEncoder(config: Encoder.Config) {
  const shine = await useShineEncoder(config)
  const webmDecoder = new WebmDecoder()
  const decoder = new OpusDecoder({
    channels: 1,
    streamCount: 1,
    coupledStreamCount: 0,
    channelMappingTable: [0]
  })

  async function decodeWEBM(blob: Blob) {
    const buffer = await blob.arrayBuffer()

    const frames: Uint8Array[] = []

    webmDecoder.decode(buffer).forEach((element) => {
      if (element.type === 'b' && element.name === 'SimpleBlock') {
        // skip first 4 block header bits
        frames.push((element.data as Uint8Array).slice(4))
      }
    })

    const decoded = decoder.decodeFrames(frames)
    console.log(decoded)
    return decoded
  }

  async function encode(blob: Blob) {
    const frames = await decodeWEBM(blob)
    shine.encode(frames.channelData[0])
  }

  function stop() {
    return shine.stop()
  }

  return { encode, stop }
}
