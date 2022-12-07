/// <reference types="./env" />

export class AudioCTX extends (window.AudioContext || window.webkitAudioContext) {
  constructor(options?: AudioContextOptions) {
    super(options)
  }
}

export function getStream(options?: MediaTrackConstraints) {
  const ctx: any = navigator.mediaDevices || navigator || {}
  const getMedia: MediaDevices['getUserMedia'] = (ctx.getUserMedia || ctx.getUserMedia
    || ctx.webkitGetUserMedia || ctx.mozGetUserMedia || ctx.msGetUserMedia)

  if (!getMedia) throw new Error('getUserMedia is not supported in this device.')

  return getMedia.call(ctx, { audio: options || true, video: false })
}

export function disposeStream(stream?: MediaStream) {
  if (!stream) return false

  stream.getTracks().forEach((track) => {
    track.stop()
    stream.removeTrack(track)
  })

  return stream.active
}
