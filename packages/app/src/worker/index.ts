import AudioWorker from './vmsg-worker/vmsg-worker?worker'

export function useWorker(options: any) {
  let promise: {
    resolve: (blob: Blob) => void
    reject: (reason?: any) => void
  }

  const worker = new AudioWorker()
  const methods = {
    start: (sampleRate: number) => worker.postMessage({ type: 'start', data: sampleRate }),
    pipe: (data: Float32Array) => worker.postMessage({ type: 'data', data }),
    stop() {
      return new Promise<Blob>((resolve, reject) => {
        promise = { resolve, reject }
        worker.postMessage({ type: 'stop', data: null })
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
        worker.terminate()
        return promise.resolve(data)
      }

      if (state.endsWith('error')) {
        worker.terminate()

        console.error('Worker error:', data)
        const error = new Error(data)

        promise?.reject(error)
        reject(error)
      }
    }

    worker.postMessage({ type: 'init', data: options })
  })
}
