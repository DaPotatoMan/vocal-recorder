import { Shine, StereoMode } from '@toots/shine.js'
import { DeferredPromise, Logger } from './shared'
import { useLameEncoder } from './processor/encoder/lame'
import EncoderWorker from './encoder.worker?worker'
import { getWavBytes } from './wav'

// Converts the Blob data to AudioBuffer
export async function getAudioBuffer(blobData: Blob) {
  let blob = blobData

  if (!(blob instanceof Blob)) blob = new Blob([blobData])

  const url = URL.createObjectURL(blob)

  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioContext = new OfflineAudioContext({
    numberOfChannels: 1,
    sampleRate: 44100,
    length: 44100
  })

  return await audioContext.decodeAudioData(arrayBuffer)
}

export async function getAudioBufferBase(arrayBuffer: ArrayBuffer) {
  const audioContext = new OfflineAudioContext({
    numberOfChannels: 1,
    sampleRate: 44100,
    length: 44100
  })

  return await audioContext.decodeAudioData(arrayBuffer)
}

export async function useShineEncoder() {
  await Shine.initialized
  Logger.log('shine-encoder: initialized')

  const shine = new Shine({
    samplerate: 48000,
    bitrate: 128,
    channels: 1,
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

export async function convertToMP3(blob: Blob) {
  console.time('encoder loaded')
  const encoder = await useShineEncoder()
  console.timeEnd('encoder loaded')

  console.time('Buffer generated')
  const buffer = await getAudioBuffer(blob)
  console.timeEnd('Buffer generated')

  console.time('Encoded audio blob')
  encoder.encode(buffer.getChannelData(0))
  const result = encoder.stop()
  console.timeEnd('Encoded audio blob')

  return result
}

export async function encodeToMP3(blob: Blob) {
  const promise = new DeferredPromise<Blob>()
  const worker = new EncoderWorker()

  worker.onmessage = (ev) => {
    if (ev.data.type === 'result') {
      console.timeEnd('Encoded audio blob')
      promise.resolve(ev.data.data)
      worker.terminate()
    }
  }

  console.time('Buffer generated')

  const buffer = await getAudioBuffer(blob)
  const data = buffer.getChannelData(0)
  console.timeEnd('Buffer generated')

  console.time('Encoded audio blob')
  worker.postMessage({ type: 'encode', data }, [data.buffer])

  return promise
}

export function downloadFile(blob: Blob, name = 'rec.mp3') {
  const url = URL.createObjectURL(blob)

  const a = document.body.appendChild(document.createElement('a'))
  a.download = name
  a.href = url
  a.click()

  URL.revokeObjectURL(url)
}

export async function useEncoder() {
  const encoder = await useShineEncoder()

  async function encode(blob: Blob) {
    const data = await encodeWAV(blob)
    encoder.encode(data)
  }

  function stop() {
    const result = encoder.stop()
    downloadFile(result)
    return result
  }

  return { encode, stop }
}

export async function encodeWAV(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const wavBytes = await getWavBytes(buffer, {
    isFloat: false,
    numChannels: 1,
    sampleRate: 48000
  })

  const wavAudio = await getAudioBufferBase(wavBytes.buffer)
  return wavAudio.getChannelData(0)
}
