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
