import { createEncoder } from 'wasm-media-encoders'
import wasm from 'wasm-media-encoders/wasm/mp3?url'

import type { StreamRecorder } from '../stream'
import { disposeStream } from '../utils/media'
import workletUrl from './worklet-mp3?worker&url'

interface WorkerData {
  event: 'result' | 'pcm-data'
  data: any
}

async function startEncode() {
  const encoder = await createEncoder('audio/mpeg', wasm)
  encoder.configure({ sampleRate: 48000, channels: 1, vbrQuality: 2 })

  let outBuffer = new Uint8Array(1024 * 1024)
  let offset = 0

  function appendData(mp3Data: Uint8Array) {
    if (mp3Data.length + offset > outBuffer.length) {
      console.log('RESIZING')
      const newBuffer = new Uint8Array(mp3Data.length + offset)
      newBuffer.set(outBuffer)
      outBuffer = newBuffer
    }

    outBuffer.set(mp3Data, offset)
    offset += mp3Data.length
  }

  const encode = (data: Float32Array) => {
    // console.log('got data:', data)
    appendData(
      encoder.encode([data])
    )
  }

  const stop = () => {
    appendData(encoder.finalize())
    const finalBuffer = new Uint8Array(outBuffer.buffer, 0, offset)

    const blob = new Blob([finalBuffer], { type: 'audio/mpeg' })

    console.timeEnd('Encoding audio data')

    const audio = document.body.appendChild(document.createElement('audio'))
    audio.src = URL.createObjectURL(blob)
    audio.controls = true
  }

  return { encode, stop }
}

export class PeaksProcessor {
  data!: Promise<number[]>

  constructor(private recorder: StreamRecorder, private source: AudioNode) {
    recorder.context.audioWorklet
      .addModule(workletUrl)
      .then(() => this.register())
  }

  async register() {
    const { recorder } = this

    const encoder = await startEncode()
    const worker = new AudioWorkletNode(recorder.context, 'peaks-analyser-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1
    })

    this.source.connect(worker)
    worker.connect(recorder.desination)

    // Events
    recorder.on('start', () => {
      worker.port.postMessage('start')
    })

    recorder.on('stop', () => worker.port.postMessage('stop'))

    // Listen worker events
    this.data = new Promise<number[]>((resolve) => {
      worker.port.onmessage = (e: MessageEvent<WorkerData>) => {
        const { event, data } = e.data

        if (event === 'pcm-data')
          encoder.encode(data)

        if (event === 'result') {
          worker.disconnect()
          encoder.stop()
          resolve(data)
        }
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
