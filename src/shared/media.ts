import { RuntimeError } from './core'
import { getWindow } from './utils'

export class StreamUtil {
  static async get(options?: MediaTrackConstraints) {
    const ctx: any = navigator.mediaDevices || navigator || {}
    const getMedia: MediaDevices['getUserMedia'] = (ctx.getUserMedia || ctx.getUserMedia
      || ctx.webkitGetUserMedia || ctx.mozGetUserMedia || ctx.msGetUserMedia)

    if (!getMedia)
      throw new RuntimeError('GETUSERMEDIA_UNSUPPORTED')

    const stream = await getMedia.call(ctx, { audio: options || true, video: false })
    return new MediaStream(stream)
  }

  static getSettings(stream: MediaStream) {
    return stream.getAudioTracks()[0].getSettings()
  }

  static isValid(stream: MediaStream) {
    const tracks = stream.getAudioTracks()
    return stream.active && tracks.length > 0 && tracks.some(e => e.enabled)
  }

  static dispose(stream: MediaStream) {
    stream.getTracks().forEach((entry) => {
      entry.stop()
      stream.removeTrack(entry)
    })

    return stream.active
  }
}

export function getAudioContext(options?: AudioContextOptions) {
  try {
    const window = getWindow()
    return new (window.AudioContext || window.webkitAudioContext)(options)
  }
  catch (error) {
    throw new RuntimeError('AUDIO_CONTEXT_UNSUPPORTED', error)
  }
}

export function getOfflineAudioContext(options: OfflineAudioContextOptions) {
  try {
    return new OfflineAudioContext(options)
  }
  catch {
    return getAudioContext(options)
  }
}

/** Converts Blob to ArrayBuffer */
export function blobToBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (blob instanceof Blob && blob.arrayBuffer)
    return blob.arrayBuffer()

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })
}

/** Converts Blob or ArrayBuffer to AudioBuffer using a OfflineAudioContext if supported */
export async function getAudioBuffer(buffer: Blob | ArrayBuffer, config: OfflineAudioContextOptions = {
  numberOfChannels: 1,
  sampleRate: 48000,
  length: 48000
}): Promise<AudioBuffer> {
  const input = buffer instanceof Blob
    ? await blobToBuffer(buffer)

    // Clone buffer to prevent mutation
    : buffer.slice(0)

  return new Promise((resolve, reject) =>
    getOfflineAudioContext(config).decodeAudioData(input, resolve, reject)
  )
}
