import { AudioBlob, blobEncoder } from './media-blob'
import { Duration, disposeStream, getStream } from './utils'

/**
 * Extend recorder mixin with features such as:
 * - Has internal variable `duration`
 * - Returns `Promise<blob>` when `stop()` is called
 */
class RecorderExportsMixin extends MediaRecorder {
  duration = 0
  #starTime = 0
  #chunks: BlobPart[] = []
  #encode = blobEncoder()

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    super(stream, options)

    this.addEventListener('dataavailable', ev => this.#chunks.push(ev.data))
  }

  override start() {
    this.#starTime = Date.now()
    super.start()
  }

  override stop() {
    return new Promise<AudioBlob>((resolve, reject) => {
      // Listen for final data
      this.addEventListener('dataavailable', async () => {
        const blob = await this.#encode(this.#chunks, this.duration, this.mimeType)
        const result = new AudioBlob([blob], {
          type: this.mimeType,
          duration: new Duration(this.duration)
        })

        resolve(result)
      })

      this.addEventListener('error', reject)

      // Record duration
      this.duration = Date.now() - this.#starTime

      // Stop base recorder
      super.stop()
    })
  }
}

export class StreamRecorder extends RecorderExportsMixin {
  readonly context!: AudioContext
  readonly desination!: MediaStreamAudioDestinationNode
  readonly gainNode!: GainNode
  private streamNode!: MediaStreamAudioSourceNode

  peaks!: RecorderPeaks

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    const context = new AudioContext()
    const desination = context.createMediaStreamDestination()
    const gainNode = context.createGain()
    const streamNode = context.createMediaStreamSource(stream)

    // Assing context nodes connections
    streamNode.connect(gainNode)
    gainNode.connect(desination)

    // Create base recorder
    super(desination.stream, options)

    // Assign vars
    this.context = context
    this.desination = desination
    this.gainNode = gainNode
    this.streamNode = streamNode

    this.peaks = new RecorderPeaks(this)
  }

  private dispose() {
    disposeStream(this.streamNode.mediaStream)

    this.streamNode.disconnect()
    this.gainNode.disconnect()
    this.desination.disconnect()
    this.context.close()
  }

  override async stop() {
    const blob = await super.stop()
    blob.peaks = this.peaks.peaks

    this.dispose()
    return blob
  }

  switchStream(stream: MediaStream) {
    // Destroy old stream
    this.streamNode.disconnect()
    disposeStream(this.streamNode.mediaStream)

    // Attach new stream to destination
    this.streamNode = this.context.createMediaStreamSource(stream)
    this.streamNode.connect(this.desination)
  }

  async switchDevice(data: MediaDeviceInfo) {
    this.switchStream(
      await getStream(data)
    )
  }
}

class RecorderPeaks {
  interval = 100
  peaks: number[] = []
  timer!: NodeJS.Timer

  private analyser!: AnalyserNode
  private sourceNode!: MediaStreamAudioSourceNode

  constructor(private source: StreamRecorder) {
    const { context } = source

    const stream = source.stream.clone()
    const sourceNode = context.createMediaStreamSource(stream)

    const analyser = context.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.8

    sourceNode.connect(analyser)

    this.sourceNode = sourceNode
    this.analyser = analyser

    // Events
    source.addEventListener('start', () => this.start())
    source.addEventListener('stop', () => this.stop())
  }

  start() {
    const start = performance.now()
    this.timer = setInterval(() => {
      if (this.source.state === 'recording')
        this.peaks.push(this.getPeak())

      const d = ((performance.now() - start) / 1000).toFixed(2)
      console.log(`Peaks ${this.peaks.length} at ${d}s`)
    }, this.interval)
  }

  stop() {
    clearInterval(this.timer)

    // Dispose
    this.sourceNode.disconnect()
    this.analyser.disconnect()
    disposeStream(this.sourceNode.mediaStream)
  }

  getPeak() {
    const { analyser } = this
    const dataArray = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatTimeDomainData(dataArray)

    let max = 0

    for (let i = 0; i < dataArray.length; i++) {
      const sampleValue = Math.abs(dataArray[i])
      if (sampleValue > max)
        max = sampleValue
    }

    return Math.round(max * 100)
  }
}
