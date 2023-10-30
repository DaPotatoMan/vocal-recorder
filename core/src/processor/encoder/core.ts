import { getAudioBuffer, getBlobAudioBuffer } from '../../shared'
import { useShineEncoder } from './shine'
import { getWavBytes } from './wav'

export interface Encoder {
  encode(blob: Blob, hasHeaders: boolean): void
  stop(): Blob
}

export namespace Encoder {
  export class Config {
    constructor(
      public sampleRate = 48000,
      public bitRate = 128,
      public channels = 1
    ) {}

    get audioBitsPerSecond() {
      return this.bitRate * 1000
    }
  }
}

export async function useEncoder(config: Encoder.Config): Promise<Encoder> {
  const encoder = await useShineEncoder()

  /** Takes a WAV blob, appends proper WAV header and returns AudioBuffer for that WAV Blob */
  async function getWAVBuffer(blob: Blob) {
    const buffer = await blob.arrayBuffer()
    const wavBytes = await getWavBytes(buffer, {
      isFloat: false,
      numChannels: config.channels,
      sampleRate: config.sampleRate
    })

    return getAudioBuffer(wavBytes.buffer)
  }

  async function encode(blob: Blob, hasHeaders = false) {
    const buffer = hasHeaders ? await getBlobAudioBuffer(blob) : await getWAVBuffer(blob)
    const data = buffer.getChannelData(0)

    encoder.encode(data)
  }

  function stop() {
    return encoder.stop()
  }

  return { encode, stop }
}
