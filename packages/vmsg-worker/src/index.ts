import type { WorkerGetType } from './types'
import AudioWorker from './worker?worker'

export function useWorker(options: any) {
  let promise: {
    resolve: (blob: Blob) => void
    reject: (reason?: any) => void
  }

  const worker = new AudioWorker()
  const post = (type: WorkerGetType, data?: any) => worker.postMessage({ type, data })

  const methods = {
    start: (sampleRate: number) => post('start', sampleRate),
    encode: (data: Float32Array) => post('data', data),
    stop() {
      return new Promise<Blob>((resolve, reject) => {
        promise = { resolve, reject }
        post('stop')
      })
    },

    dispose: () => worker.terminate()
  }

  return new Promise<typeof methods>((resolve, reject) => {
    worker.onmessage = (e) => {
      const { data, type } = e.data
      const state: string = type

      if (state === 'init') return resolve(methods)
      if (state === 'stop') {
        methods.dispose()
        return promise.resolve(data)
      }

      if (state.endsWith('error')) {
        methods.dispose()

        console.error('Worker error:', data)
        const error = new Error(data)

        promise?.reject(error)
        reject(error)
      }
    }

    post('init', options)
  })
}
