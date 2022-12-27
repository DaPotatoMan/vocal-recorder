import type { Recorder } from '..'
import { disposeStream, getAudioCtx, getStream } from '../utils'

async function BlobBuilder() {
  const fixer = MediaRecorder?.isTypeSupported('audio/webm')
    ? await import('fix-webm-duration').then(i => i.default)
    : undefined

  return (chunks: BlobPart[], duration: number, type: string) => {
    const rawBlob = new Blob(chunks, { type })

    if (chunks.length <= 0)
      throw new Error('There are no chunk data available')

    if (!type.endsWith('webm')) return rawBlob

    // Fix webm duration metadata
    return new Promise<Blob>(resolve => fixer?.(rawBlob, duration, resolve) || rawBlob)
  }
}

/** Legacy processor for Safari browsers */
export async function useAudioProcessor(config: Recorder.Config) {
  const toBlob = await BlobBuilder()
  const stream = await getStream(config.stream)
  const sampleRate = stream.getAudioTracks()[0]?.getSettings().sampleRate ?? 44100

  const ctx = getAudioCtx({ sampleRate, latencyHint: 'interactive' })
  const sourceNode = ctx.createMediaStreamSource(stream)
  const gainNode = (ctx.createGain || ctx.createGainNode)?.call(ctx)

  let startTime = 0
  let chunks: Blob[] = []
  let recorder: MediaRecorder

  function start() {
    // Connect nodes
    gainNode.gain.value = 1
    sourceNode.connect(gainNode)

    recorder = new MediaRecorder(stream)
    recorder.ondataavailable = (e) => {
      chunks.push(e.data)
    }

    startTime = performance.now()
    recorder.start(1000)
  }

  async function dispose() {
    gainNode.disconnect()
    sourceNode.disconnect()

    disposeStream(stream)

    // @ts-expect-error force release
    recorder = undefined
    chunks = []

    if (ctx.state !== 'closed')
      await ctx.close()
  }

  async function stop() {
    recorder.stop()

    // ? Wait for final blob
    await new Promise(resolve => setTimeout(resolve, 500))

    const [type] = recorder.mimeType.split(';')
    const duration = performance.now() - startTime
    const blob = await toBlob(chunks, duration, type)

    if (blob.size <= 0)
      throw new Error('Recorder produced an empty blob')

    await dispose()
    return { blob, duration }
  }

  return {
    start,
    stop,
    dispose,

    get ctx() { return ctx },
    get gainNode() { return gainNode }
  }
}
