import { RecorderError } from './error'

export class StreamUtil {
  static async get(options?: MediaTrackConstraints) {
    const ctx: any = navigator.mediaDevices || navigator || {}
    const getMedia: MediaDevices['getUserMedia'] = (ctx.getUserMedia || ctx.getUserMedia
      || ctx.webkitGetUserMedia || ctx.mozGetUserMedia || ctx.msGetUserMedia)

    if (!getMedia) throw new RecorderError('NO_GETUSERMEDIA')

    const stream = await getMedia.call(ctx, { audio: options || true, video: false })
    return new MediaStream(stream)
  }

  static isValid(stream: MediaStream) {
    const tracks = stream.getAudioTracks()
    return stream.active && tracks.length > 0 && tracks.some(track => track.enabled)
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
  const ctx = globalThis
  const Ref = ctx.AudioContext || ctx.webkitAudioContext

  if (!Ref) throw new RecorderError('NO_AUDIO_CONTEXT')

  return new Ref(options)
}
