import { OpusDecoder } from 'opus-decoder'
import { Decoder as WebmDecoder } from 'ts-ebml'

/** Convert WEBM (OPUS audio) to audio buffer */
export function useOPUSDecoder(sampleRate: number) {
  const webmDecoder = new WebmDecoder()
  const decoder = new OpusDecoder({
    // @ts-expect-error un-typed issue
    sampleRate,

    channels: 1,
    streamCount: 1,
    coupledStreamCount: 0,
    channelMappingTable: [0]
  })

  async function decode(blob: Blob) {
    const buffer = await blob.arrayBuffer()
    const frames: Uint8Array[] = []

    webmDecoder.decode(buffer).forEach((element) => {
      if (element.type === 'b' && element.name === 'SimpleBlock')
        frames.push((element.data as Uint8Array).slice(4)) // ? skip first 4 block header bits
    })

    return decoder.decodeFrames(frames)
  }

  return { decode, free: decoder.free }
}
