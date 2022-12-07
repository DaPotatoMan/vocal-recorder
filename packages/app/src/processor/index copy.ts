import type { Recorder } from '../env-types'
import { disposeStream, getAudioContext, getStream } from '../utils'
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
      encoder.connect(ctx.destination)
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
      encoder.connect(ctx.destination)
    }

    return Object.assign(encoder, { start, dispose })
  }

  return legacy ? legacyNode() : workletNode()
}

export async function useAudioProcessor(config: Recorder.Config = {}) {
  const ctx = getAudioContext()
  const stream = await getStream(config.stream)
  const sourceNode = ctx.createMediaStreamSource(stream)

  const [streamSettings] = stream.getAudioTracks().map((track) => {
    return track.getSettings() as MediaTrackSettings & { channelCount?: number }
  })

  const worker = useWorker({
    numChannels: streamSettings.channelCount,
    sampleRate: streamSettings.sampleRate,
    bitRate: streamSettings.sampleSize
  })

  console.log(
    stream.getTracks().map((track) => {
      return {
        capabilities: track.getCapabilities(),
        constraints: track.getConstraints(),
        settings: track.getSettings()
      }
    })
  )

  // Gain node for loudness control
  const gainNode = ctx.createGain?.() || ctx.createGainNode?.()
  gainNode.gain.value = 1
  sourceNode.connect(gainNode)

  // Create MP3 Encoder Node
  // ! Legacy node causes audio glitches after a few seconds
  const encoder = await useEncoderNode(ctx, true)
  gainNode.connect(encoder)

  let startTime = 0

  function start() {
    encoder.start(worker.encode)
    startTime = performance.now()
  }

  async function stop() {
    encoder.dispose()
    disposeStream(stream)
    ctx.close()

    const blob = await worker.finish()
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
