import { RecorderError } from './error'
import { getGlobalThis } from './utils'

export class StreamUtil {
  static async get(options?: MediaTrackConstraints) {
    const ctx: any = navigator.mediaDevices || navigator || {}
    const getMedia: MediaDevices['getUserMedia'] = (ctx.getUserMedia || ctx.getUserMedia
      || ctx.webkitGetUserMedia || ctx.mozGetUserMedia || ctx.msGetUserMedia)

    if (!getMedia)
      throw new RecorderError('NO_GETUSERMEDIA')

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
  const ctx = getGlobalThis()
  const Ref = ctx.AudioContext || ctx.webkitAudioContext

  if (!Ref)
    throw new RecorderError('NO_AUDIO_CONTEXT')

  return new Ref(options)
}

export function getOfflineAudioContext(options: OfflineAudioContextOptions) {
  try {
    return new OfflineAudioContext(options)
  }
  catch {
    return new AudioContext(options)
  }
}

export async function getAudioBuffer(buffer: ArrayBuffer, config: OfflineAudioContextOptions = {
  numberOfChannels: 1,
  sampleRate: 44100,
  length: 44100
}) {
  return getOfflineAudioContext(config).decodeAudioData(buffer)
}

// Converts the Blob data to AudioBuffer
export async function getBlobAudioBuffer(blob: Blob) {
  return getAudioBuffer(await blob.arrayBuffer())
}

export function isWEBMSupported() {
  try {
    const { MediaRecorder } = getGlobalThis()

    return MediaRecorder
      ? MediaRecorder.isTypeSupported('audio/webm')
      : false
  }
  catch (error) {
    return false
  }
}
