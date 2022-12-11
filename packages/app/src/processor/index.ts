import { useWorker } from 'vmsg-worker'
import type { Recorder } from '../env-types'
import { disposeStream, getAudioCtx, getStream } from '../utils'
import workletPath from './encoder-worklet?url'

export function useEncoderNode(ctx: AudioContext, legacy = false) {
  const workletNode = async () => {
    await ctx.audioWorklet.addModule(workletPath)

    const encoder = new AudioWorkletNode(ctx, 'mp3-encoder')

    const dispose = () => {
      encoder.port.postMessage('stop')
      encoder.port.onmessage = null
      encoder.port.close()
      encoder.disconnect()
    }

    const start = (pipe: (data: Float32Array) => any) => {
      encoder.port.onmessage = e => pipe(e.data)
    }

    return Object.assign(encoder, { start, dispose })
  }

  const legacyNode = () => {
    const encoder = (ctx.createScriptProcessor || ctx.createJavaScriptNode).call(ctx, 0, 1, 1)

    const dispose = () => {
      encoder.onaudioprocess = null
      encoder.disconnect()
    }

    const start = (pipe: (data: Float32Array) => any) => {
      encoder.onaudioprocess = e => pipe(e.inputBuffer.getChannelData(0))
    }

    return Object.assign(encoder, { start, dispose })
  }

  return legacy ? legacyNode() : workletNode()
}

export async function useAudioProcessor(config: Recorder.Config = {}) {
  const worker = await useWorker({ shimURL: '' })

  const stream = await getStream(config.stream)
  const sampleRate = stream.getAudioTracks()[0]?.getSettings().sampleRate ?? 44100

  const ctx = getAudioCtx({ sampleRate, latencyHint: 'interactive' })
  const sourceNode = ctx.createMediaStreamSource(stream)
  const encoderNode = await useEncoderNode(ctx, false)
  const gainNode = (ctx.createGain || ctx.createGainNode)?.call(ctx)

  // Connect nodes
  gainNode.gain.value = 1
  sourceNode.connect(gainNode)
  gainNode.connect(encoderNode)

  let startTime = 0

  function start() {
    worker.start(ctx.sampleRate)
    encoderNode.start(worker.encode)
    startTime = performance.now()
  }

  async function stop() {
    encoderNode.dispose()
    disposeStream(stream)
    ctx.close()

    const blob = await worker.stop()
    const duration = performance.now() - startTime

    return { blob, duration }
  }

  return {
    start,
    stop,

    get ctx() { return ctx },
    get gainNode() { return gainNode }
  }
}
