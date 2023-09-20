import { DeferredPromise, type EventBus } from '../shared'
import { useShineEncoder } from './encoder/shine'
import workletUrl from './worklet?worker&url'

interface WorkerData {
  event: 'result' | 'pcm-data'
  data: any
}

export interface ProcessedResult {
  peaks: number[]
  blob: Blob
}

export function useProcessor(emitter: EventBus, context: AudioContext, sourceNode: GainNode, desinationNode: MediaStreamAudioDestinationNode) {
  const result = new DeferredPromise<ProcessedResult>()

  async function register() {
    const encoder = await useShineEncoder(context)
    const worker = new AudioWorkletNode(context, 'vocal-recorder/worklet', {
      numberOfInputs: 1,
      numberOfOutputs: 1
    })

    sourceNode.connect(worker)
    worker.connect(desinationNode)

    // Listen worker events
    worker.port.onmessage = async (e: MessageEvent<WorkerData>) => {
      const { event, data } = e.data

      if (event === 'pcm-data')
        encoder.encode(data)

      if (event === 'result') {
        worker.disconnect()
        worker.port.close()

        result.resolve({
          peaks: data,
          blob: encoder.stop()
        })
      }
    }

    // ! Listen to events
    emitter.once('stop', () => worker.port.postMessage('stop'))
  }

  const isReady = context.audioWorklet
    .addModule(workletUrl)
    .then(register)

  return { isReady, result }
}
