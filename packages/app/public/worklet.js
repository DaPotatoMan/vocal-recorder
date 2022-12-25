/**
 * ! Chrome has a bug that creates memory leaks when disposing AudioWorklets
 */

registerProcessor('mp3-encoder', class extends AudioWorkletProcessor {
  alive = true

  constructor() {
    super()

    this.port.onmessage = (e) => {
      if (e.data === 'stop') this.alive = false
    }
  }

  process(inputs) {
    const samples = inputs[0][0]
    this.port.postMessage(samples)

    return this.alive
  }
})
