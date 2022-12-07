import type { Recorder } from '../env-types'
import { AudioCTX, disposeStream, getStream } from '../utils'
import { useWorker } from '../worker'
import workletPath from './encoder-worklet?url'

export function useEncoderNode(ctx: AudioContext, legacy = true) {
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
      // encoder.connect(ctx.destination)
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
      encoder.onaudioprocess = (e) => {
        console.log('Latency:', ctx.baseLatency, 'Output latency:', ctx.outputLatency)
        pipe(e.inputBuffer.getChannelData(0))
      }
      // encoder.connect(ctx.destination)
    }

    return Object.assign(encoder, { start, dispose })
  }

  return legacy ? legacyNode() : workletNode()
}

export async function useAudioProcessor(config: Recorder.Config = {}) {
  const worker = await useWorker({ shimURL: '' })

  const stream = await getStream(config.stream)
  const [streamSettings] = stream.getAudioTracks().map((track) => {
    return track.getSettings() as MediaTrackSettings & { channelCount?: number }
  })

  const ctx = new AudioCTX({
    latencyHint: 'interactive',
    sampleRate: streamSettings.sampleRate ?? 44100
  })

  const sourceNode = ctx.createMediaStreamSource(stream)

  // Gain node for loudness control
  const gainNode = ctx.createGain?.() || ctx.createGainNode?.()
  gainNode.gain.value = 1
  sourceNode.connect(gainNode)

  // Create MP3 Encoder Node
  const encoder = await useEncoderNode(ctx, false)
  // gainNode.connect(encoder)
  // encoder.connect(gainNode)
  // gainNode.connect(ctx.destination)

  sourceNode.connect(encoder)
  encoder.connect(gainNode)
  // gainNode.connect(ctx.destination)

  let startTime = 0

  function start() {
    console.log(ctx.sampleRate)
    worker.start(ctx.sampleRate)
    encoder.start(worker.pipe)
    startTime = performance.now()
  }

  async function stop() {
    encoder.dispose()
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
