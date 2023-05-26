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

export class Duration extends Number {
  /** Value in milliseconds */
  #value = Number(this)

  /** Duration in milli seconds */
  seconds = this.#value / 1000

  /** Duration in minutes */
  minutes = this.seconds / 60

  /** Duration in hours */
  hours = this.seconds / 3600
}

export function getAveragePeaks(peaks: number[], samples = 64) {
  const blockSize = Math.floor(peaks.length / samples) // the number of samples in each subdivision
  const filteredData = []

  for (let i = 0; i < samples; i++) {
    const blockStart = blockSize * i // the location of the first sample in the block
    let sum = 0
    for (let j = 0; j < blockSize; j++)
      sum = sum + Math.abs(peaks[blockStart + j]) // find the sum of all the samples in the block

    filteredData.push(sum / blockSize) // divide the sum by the block size to get the average
  }

  // Normalizes the audio data to make a cleaner illustration
  const maxPeak = Math.max(...filteredData)

  // Return raw data if fully silent
  if (maxPeak <= 0.0001)
    return filteredData

  const multiplier = maxPeak ** -1
  return filteredData.map(n => n * multiplier * 100)
}
