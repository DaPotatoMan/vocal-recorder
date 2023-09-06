function expandArray(source: number[], newSize: number): number[] {
  const originalSize = source.length
  const step = (originalSize - 1) / (newSize - 1) // Calculate the step size

  const newArray: number[] = []

  for (let i = 0; i < newSize; i++) {
    const index = i * step
    const lowerIndex = Math.floor(index)
    const upperIndex = Math.ceil(index)

    if (lowerIndex === upperIndex) {
      // The index is on an existing peak, just copy the value
      newArray.push(source[lowerIndex])
    }
    else {
      // Perform linear interpolation between neighboring peaks
      const interpolationFactor = index - lowerIndex
      const lowerValue = source[lowerIndex]
      const upperValue = source[upperIndex]
      const interpolatedValue = lowerValue + (upperValue - lowerValue) * interpolationFactor
      newArray.push(interpolatedValue)
    }
  }

  return newArray
}

function getArrayInRange(source: number[], toMin: number, toMax: number): number[] {
  const min = Math.min(...source)
  const max = Math.max(...source)
  const range = max - min

  // Calculate the normalized value for each element in the array
  return source.map((num) => {
    // Avoid division by zero and handle edge cases
    if (range === 0)
      return toMin + (toMax - toMin) / 2 // Return the midpoint of the custom range

    // normalized value
    return toMin + ((num - min) / range) * (toMax - toMin)
  })
}

function getArrayAverage(source: number[], samples = 64) {
  // Normalize props
  samples = Math.floor(samples)

  const blockSize = Math.floor(source.length / samples)
  const filteredData = []

  let sum = 0

  for (let i = 0; i < samples; i++) {
    const blockStart = blockSize * i // the location of the first sample in the block

    for (let j = 0; j < blockSize; j++)
      sum += Math.abs(source[blockStart + j]) // find the sum of all the samples in the block

    filteredData.push(sum / blockSize) // divide the sum by the block size to get the average
    sum = 0
  }

  // Normalizes the audio data to make a cleaner illustration
  const maxPeak = Math.max(...filteredData)

  // Return raw data if fully silent
  if (maxPeak <= 0.0001)
    return filteredData

  const multiplier = maxPeak ** -1
  return filteredData.map(n => n * multiplier * 100)
}

export class AudioPeaks extends Array {
  constructor(source: number[], public readonly samples = 100, public readonly rangeMin = 0, public readonly rangeMax = 100) {
    source ||= []

    // Expand data if required
    if (samples > source.length)
      source = expandArray(source, samples)

    source = getArrayAverage(source, samples)
    source = getArrayInRange(source, rangeMin, rangeMax)

    super(...source)
  }

  clone(samples = this.samples, rangeMin = this.rangeMin, rangeMax = this.rangeMax) {
    return new AudioPeaks(this, samples, rangeMin, rangeMax)
  }

  getAverage(samples = this.samples) {
    return getArrayAverage(this, samples)
  }

  getToRange(min: number, max: number) {
    return getArrayInRange(this, min, max)
  }
}
