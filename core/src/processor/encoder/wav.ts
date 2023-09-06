export function mergeFloat32Arrays(arrays: Float32Array[]): Float32Array {
  // Calculate the total length of the merged array
  let totalLength = 0
  for (const array of arrays)
    totalLength += array.length

  // Create a new Float32Array with the total length
  const mergedArray = new Float32Array(totalLength)

  // Copy data from input arrays to the merged array
  let offset = 0
  for (const array of arrays) {
    mergedArray.set(array, offset)
    offset += array.length
  }

  return mergedArray
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++)
    view.setUint8(offset + i, str.charCodeAt(i))
}

export function toWAV(source: Float32Array, sampleRate: number, numChannels: number): Blob {
  const numFrames = source.length
  const dataLength = numFrames * numChannels * 2 // 16-bit (2 bytes) per sample

  // Create a WAV header
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  // RIFF identifier
  writeString(view, 0, 'RIFF')

  // File length
  view.setUint32(4, 36 + dataLength, true)

  // RIFF type
  writeString(view, 8, 'WAVE')

  // Format chunk identifier
  writeString(view, 12, 'fmt ')

  // Format chunk length
  view.setUint32(16, 16, true)

  // Sample format (PCM)
  view.setUint16(20, 1, true)

  // Number of channels
  view.setUint16(22, numChannels, true)

  // Sample rate
  view.setUint32(24, sampleRate, true)

  // Byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * 2, true)

  // Block align (channels * bytes per sample)
  view.setUint16(32, numChannels * 2, true)

  // Bits per sample
  view.setUint16(34, 16, true)

  // Data chunk identifier
  writeString(view, 36, 'data')

  // Data chunk length
  view.setUint32(40, dataLength, true)

  // Convert and append audio data to the buffer
  let offset = 44
  for (let i = 0; i < numFrames; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = source[i] * 32767 // Convert to 16-bit PCM
      view.setInt16(offset, sample, true)
      offset += 2
    }
  }

  // Create a Blob from the buffer
  return new Blob([view], { type: 'audio/wav' })
}
