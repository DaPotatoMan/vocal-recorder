class Analyser extends AudioWorkletProcessor {
  peaks: number[] = []
  alive = true

  constructor() {
    super()
    this.port.onmessage = e => this.onMessage(e)
  }

  onMessage(e: MessageEvent<'start' | 'stop'>) {
    const event = e.data

    if (event === 'stop') {
      this.port.postMessage({ event: 'result', data: this.peaks })
      this.peaks = []
      this.alive = false
    }
  }

  process(inputs: Float32Array[][], _outputs: any, _params: any) {
    if (!this.alive) return false

    const input = inputs[0][0]

    if (!input) throw new Error('Null input data was provided')

    this.peaks.push(Math.max(...input) * 100) // ? Log audio peak
    this.port.postMessage({ event: 'pcm-data', data: input }, [input.buffer]) // ? Send PCM data to encoder

    return true
  }
}

registerProcessor('vocal-recorder/worklet', Analyser)
