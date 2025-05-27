import { DeferredPromise, getAudioBuffer, getAudioMetadata } from '../shared'

export namespace Transcoder {
  export interface EncodeInput {
    channels: 1 | 2
    bitRate: number
    sampleRate: number
    data: Float32Array
  }

  function chunking(data: Float32Array, length: number) {
    const result = []

    for (let i = 0; i < data.length; i += length) {
      result.push(data.subarray(i, i + length))
    }
    return result
  }

  function encodeInput(input: EncodeInput) {
    const result = new DeferredPromise<ArrayBuffer>()

    const worker = new Worker(
      new URL('./worker.ts', import.meta.url),
      { name: 'Vocal Converter Encoder', type: 'module' }
    )

    worker.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        result.resolve(event.data)
        worker.terminate()
      }
    }

    worker.postMessage(input)

    return result
  }

  /**
   * Converts audio blob to mp3
   * The given audio format must be supported by the browser AudioContext.
   * For example, chrome doesn't support m4a audio decoding.
   */
  export async function toMP3(input: Blob, {
    sampleRate = 48000,
    onProgress = (_progress: number) => { }
  } = {}) {
    const [buffer, metadata] = await Promise.all([
      getAudioBuffer(input, {
        sampleRate,
        length: sampleRate,
        numberOfChannels: 1
      }),

      getAudioMetadata(input)
    ])

    function encode(data: Float32Array) {
      return encodeInput({ data, sampleRate, bitRate: metadata.bitRate, channels: 1 })
    }

    /** Split by every 30s */
    const chunkLength = sampleRate * 60
    const sourceChunks = chunking(buffer.getChannelData(0), chunkLength)
    const splitSourceChunks = sourceChunks.map(data => chunking(data, data.length / 4))

    const totalChunkLength = splitSourceChunks.reduce((total, list) => total + list.length, 0)
    let encodedLength = 0

    const encodedChunks: ArrayBuffer[] = []

    console.log('Encoding Chunks', {
      chunkLength,
      totalChunkLength,
      singleChunkSize: splitSourceChunks[0][0].length
    })

    for (const chunks of splitSourceChunks) {
      const result = await Promise.all(
        chunks.map(data =>
          encode(data).finally(() => onProgress(++encodedLength / totalChunkLength))
        )
      )

      encodedChunks.push(...result)
    }

    // Merge all chunks
    const blob = new Blob(encodedChunks, { type: 'audio/mpeg' })

    return { blob, metadata }
  }
}
