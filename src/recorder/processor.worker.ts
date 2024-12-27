class PCMProcessor extends AudioWorkletProcessor {
  bufferLength = 4096
  bufferOffset = 0
  sampleBuffer = new Float32Array(this.bufferLength)

  constructor() {
    super()

    this.port.onmessage = (event) => {
      // Return remaining buffer
      if (event.data === 'flush')
        this.sendBuffer()
    }
  }

  sendBuffer() {
    // Resize buffer if smaller than bufferOffset
    if (this.bufferOffset < this.bufferLength) {
      this.sampleBuffer = this.sampleBuffer.slice(0, this.bufferOffset)
    }

    this.port.postMessage(this.sampleBuffer, {
      transfer: [this.sampleBuffer.buffer]
    })

    // Reset the buffer
    this.sampleBuffer = new Float32Array(this.bufferLength)
    this.bufferOffset = 0
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]

    if (input && input.length > 0) {
      const data = input[0]

      // Copy incoming data into the sample buffer
      for (let i = 0; i < data.length; i++) {
        this.sampleBuffer[this.bufferOffset++] = data[i]

        // When the buffer is full, send it to the main thread
        if (this.bufferOffset >= this.bufferLength)
          this.sendBuffer()
      }
    }

    return true
  }
}

registerProcessor('pcm-processor', PCMProcessor)
