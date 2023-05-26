import { throttle } from '@antfu/utils'
import { AudioBlob, blobEncoder } from './media-blob'
import { Duration, disposeStream, getStream } from './utils'

import workletUrl from './worker?url'

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
      this.addEventListener('stop', async () => {
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

  peaks!: Promise<number[]>
  peakAnalyser!: RecorderPeaks

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    const context = new AudioContext({ latencyHint: 'playback' })
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

    // ! Analyser TODO: REMOVE
    console.log(workletUrl)
    context.audioWorklet.addModule(workletUrl)
      .then(() => {
        const worker = new AudioWorkletNode(context, 'peaks-analyser-processor')
        gainNode.connect(worker)

        // Events
        this.addEventListener('start', () => worker.port.postMessage('start'))
        this.addEventListener('stop', () => worker.port.postMessage('stop'))

        this.peaks = new Promise<number[]>((resolve, _reject) => {
          worker.port.onmessage = (e) => {
            if (e.data.event === 'result') resolve(e.data.data)
          }
        })
      })

    this.peakAnalyser = new RecorderPeaks(this)
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
    blob.peaks = await this.peaks

    this.dispose()
    return blob
  }

  switchStream(stream: MediaStream) {
    // Destroy old stream
    this.streamNode.disconnect()
    disposeStream(this.streamNode.mediaStream)

    // Attach new stream to destination
    this.streamNode = this.context.createMediaStreamSource(stream)
    this.streamNode.connect(this.gainNode)
  }

  async switchDevice(data: Partial<MediaDeviceInfo>) {
    this.switchStream(
      await getStream(data)
    )
  }
}

class RecorderPeaks {
  interval = 1000
  peaks: number[] = []
  timer!: NodeJS.Timer

  private analyser!: AnalyserNode
  private sourceNode!: MediaStreamAudioSourceNode

  constructor(private source: StreamRecorder) {
    const { context } = source

    const stream = source.stream.clone()
    const sourceNode = context.createMediaStreamSource(stream)

    const analyser = context.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.8

    sourceNode.connect(analyser)

    this.sourceNode = sourceNode
    this.analyser = analyser

    // Events
    // source.addEventListener('start', () => this.start())
    // source.addEventListener('stop', () => this.stop())
  }

  start() {
    const start = performance.now()

    const get = throttle(this.interval, () => {
      const tS = performance.now()

      if (this.source.state === 'recording')
        this.peaks.push(this.getPeak())

      const now = performance.now()
      const took = ((now - tS) / 1000).toFixed(2)
      const d = ((now - start) / 1000).toFixed(2)

      console.log(`Peaks ${this.peaks.length} at ${d}s - took: ${took}s, peak: ${this.peaks.at(-1)}`)

      requestAnimationFrame(get)
    })

    get()
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
