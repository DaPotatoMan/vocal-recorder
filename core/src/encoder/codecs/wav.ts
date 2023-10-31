import { getAudioBuffer, getBlobAudioBuffer } from '../../shared'
import type { Encoder } from '../types'
import { useShineEncoder } from './mp3.shine'

interface Options {
  isFloat: boolean // floating point or 16-bit integer
  numChannels: number
  sampleRate: number // 48000
}

// Returns Uint8Array of WAV bytes
export function getWavBytes(buffer: ArrayBuffer, options: Options) {
  const type = options.isFloat ? Float32Array : Uint16Array
  const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT

  const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }))
  const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength)

  // prepend header, then add pcmBytes
  wavBytes.set(headerBytes, 0)
  wavBytes.set(new Uint8Array(buffer), headerBytes.length)

  return wavBytes
}

// adapted from https://gist.github.com/also/900023
// returns Uint8Array of WAV header bytes
function getWavHeader(options: Options & { numFrames: number }) {
  const numFrames = options.numFrames
  const numChannels = options.numChannels || 2
  const sampleRate = options.sampleRate || 44100
  const bytesPerSample = options.isFloat ? 4 : 2
  const format = options.isFloat ? 3 : 1

  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = numFrames * blockAlign

  const buffer = new ArrayBuffer(44)
  const dv = new DataView(buffer)

  let p = 0

  function writeString(s: string) {
    for (let i = 0; i < s.length; i++)
      dv.setUint8(p + i, s.charCodeAt(i))

    p += s.length
  }

  function writeUint32(d: number) {
    dv.setUint32(p, d, true)
    p += 4
  }

  function writeUint16(d: number) {
    dv.setUint16(p, d, true)
    p += 2
  }

  writeString('RIFF') // ChunkID
  writeUint32(dataSize + 36) // ChunkSize
  writeString('WAVE') // Format
  writeString('fmt ') // Subchunk1ID
  writeUint32(16) // Subchunk1Size
  writeUint16(format) // AudioFormat https://i.stack.imgur.com/BuSmb.png
  writeUint16(numChannels) // NumChannels
  writeUint32(sampleRate) // SampleRate
  writeUint32(byteRate) // ByteRate
  writeUint16(blockAlign) // BlockAlign
  writeUint16(bytesPerSample * 8) // BitsPerSample
  writeString('data') // Subchunk2ID
  writeUint32(dataSize) // Subchunk2Size

  return new Uint8Array(buffer)
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
