import AudioWorker from './lame-worker?worker'

interface Config {
  numChannels?: number
  sampleRate?: number
  bitRate?: number
}

export function useWorker(config: Config = {}) {
  let promise: {
    resolve: (blob: Blob) => void
    reject: (reason?: any) => void
  }

  const worker = new AudioWorker()

  const sendMessage = (command: string, data: Record<string, any> = {}) => worker.postMessage({ command, ...data })

  worker.onmessage = (e) => {
    const result = e.data

    const state: string = result.command
    const buffer: Int8Array[] = result.buffer

    if (state === 'end') {
      worker.terminate()

      const blob = new Blob(buffer, { type: 'mp3' })
      return promise.resolve(blob)
    }

    // if (state.endsWith('error')) {
    //   worker.terminate()

    //   console.error('Worker error:', data)
    //   const error = new Error(data)

    //   promise?.reject(error)
    //   reject(error)
    // }
  }

  // Init worker
  sendMessage('init', { config })

  return {
    encode: (buffer: Float32Array) => sendMessage('encode', { buffer }),

    finish() {
      return new Promise<Blob>((resolve, reject) => {
        promise = { resolve, reject }
        sendMessage('finish')
      })
    },

    dispose: () => worker.terminate()
  }
}
