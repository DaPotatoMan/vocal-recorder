import type { StreamRecorder } from '../stream'
import { disposeStream } from '../utils/media'
import workletUrl from './worklet?url'

interface WorkerData {
  event: 'result'
  data: any
}

export class PeaksProcessor {
  data!: Promise<number[]>

  constructor(private recorder: StreamRecorder, private source: AudioNode) {
    recorder.context.audioWorklet
      .addModule(workletUrl)
      .then(() => this.register())
  }

  register() {
    const { recorder } = this

    const worker = new AudioWorkletNode(recorder.context, 'peaks-analyser-processor')
    this.source.connect(worker)

    // Events
    recorder.on('start', () => worker.port.postMessage('start'))
    recorder.on('stop', () => worker.port.postMessage('stop'))

    // Listen worker events
    this.data = new Promise<number[]>((resolve) => {
      worker.port.onmessage = (e: MessageEvent<WorkerData>) => {
        const { event, data } = e.data

        if (event === 'result') resolve(data)
      }
    })
  }
}

export class RealtimePeaksProcessor {
  interval = 1000
  peaks: number[] = []
  timer!: number

  private analyser!: AnalyserNode
  private sourceNode!: MediaStreamAudioSourceNode

  constructor(private source: StreamRecorder, private onPeakProcessed: (data: number) => void) {
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
    source.on('start', () => this.start())
    source.on('stop', () => this.stop())
  }

  start() {
    this.onPeakProcessed?.(this.getPeak())
    this.timer = requestAnimationFrame(this.start.bind(this))
  }

  stop() {
    cancelAnimationFrame(this.timer)

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

  static start(...args: ConstructorParameters<typeof RealtimePeaksProcessor>) {
    return new RealtimePeaksProcessor(...args)
  }
}
