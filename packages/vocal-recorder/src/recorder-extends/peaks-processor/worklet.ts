import { getAveragePeaks } from './utils'

class Analyser extends AudioWorkletProcessor {
  alive = false
  started = false
  peaks: number[] = []

  pcmData: Float32Array[] = []

  constructor() {
    super()

    this.port.onmessage = (e) => {
      if (e.data === 'start') this.started = this.alive = true
      if (e.data === 'stop') {
        this.alive = false
        this.port.postMessage({
          event: 'result',
          data: getAveragePeaks(this.peaks, 64)
        })
      }
    }
  }

  process(inputs: Float32Array[][], _outputs: Float32Array[][], _parameters: Record<string, Float32Array>) {
    if (!this.started) return true

    const input = inputs[0][0]

    this.port.postMessage({
      event: 'pcm-data',
      data: input
    })

    if (!input) throw new Error('Null input data was provided')

    this.pcmData.push(input)
    this.resolvePeak(input)

    return this.alive
  }

  resolvePeak(data: Float32Array) {
    let max = 0

    for (let i = 0; i < data.length; i++) {
      const value = Math.abs(data[i])
      if (value > max) max = value
    }

    this.peaks.push(max)
  }
}

registerProcessor('peaks-analyser-processor', Analyser)
