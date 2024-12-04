import mitt from 'mitt'
import { AudioBlob, DeferredPromise, StreamUtil, getAudioBuffer, useAsyncQueue } from '../shared'

export class Encoder {
  result = new DeferredPromise<AudioBlob>()
  ready = new DeferredPromise<void>()

  constructor(
    readonly recorder: MediaRecorder,
    readonly timeslice = 1500,
    readonly worker = Encoder.createEmitter(
      new Worker(new URL('./worker.ts', import.meta.url), { name: 'Vocal Encoder', type: 'module' })
    )
  ) {
    const queue = useAsyncQueue()

    // Init
    worker.send(
      Encoder.Event.INIT,
      new Encoder.Config(recorder.stream)
    )

    // Worker is ready for encoding
    worker.on(Encoder.Event.READY, this.ready.resolve)

    // Resolve audio result from worker
    worker.on(Encoder.Event.RESULT, (buffer) => {
      this.result.resolve(AudioBlob.parse(buffer))
    })

    // Encode on data
    recorder.addEventListener('dataavailable', (event) => {
      const data = event.data

      if (data.size > 0)
        queue.run(() => this.#encode(data))
    })

    recorder.addEventListener('stop', async () => {
      // Wait for all encoding tasks to finish
      await queue.promise
      this.worker.send(Encoder.Event.STOP)
    })
  }

  #headerBlob?: Blob
  #headerBufferStart = 0

  async #encode(blob: Blob) {
    const inputBlob = this.#headerBlob ? new Blob([this.#headerBlob, blob]) : blob

    const audioBuffer = await getAudioBuffer(inputBlob)
    const data = audioBuffer.getChannelData(0).slice(this.#headerBufferStart)

    if (!this.#headerBlob) {
      this.#headerBlob = blob
      this.#headerBufferStart = data.length
    }

    this.worker.send(Encoder.Event.ENCODE, data, [data.buffer])
  }

  dispose() {
    this.worker.terminate()
    this.#headerBlob = undefined
    this.#headerBufferStart = 0
  }

  stop() {
    this.recorder.stop()
    return this.result.finally(() => this.dispose())
  }
}

export namespace Encoder {
  export class Config {
    constructor(
      stream: MediaStream,
      settings = StreamUtil.getSettings(stream),
      readonly sampleRate = settings.sampleRate || 48_000,
      readonly channels = settings.channelCount || 1,
      readonly bitRate = 128,
      readonly audioBitsPerSecond = bitRate * 1000
    ) {}
  }

  export enum Event {
    INIT = 'init',
    STOP = 'stop',

    /** When worker is ready */
    READY = 'ready',

    /** Passed from main thread to worker.` */
    ENCODE = 'encode',

    /** Sent from worker to main thread */
    RESULT = 'result'
  }

  // Keep as Record type
  // eslint-disable-next-line ts/consistent-type-definitions
  export type EventData = {
    [Event.INIT]: Encoder.Config
    [Event.ENCODE]: Float32Array
    [Event.STOP]: void

    [Event.READY]: void
    [Event.RESULT]: ArrayBuffer
  }

  export interface EventMap<T extends Event = Event> {
    type: T
    data: EventData[T]
  }

  interface WorkerLike {
    postMessage: Worker['postMessage'] | Window['postMessage']
    addEventListener: Worker['addEventListener']
  }

  export function createEmitter<T extends WorkerLike>(scope: T) {
    const { emit, on } = mitt<EventData>()

    scope.addEventListener('message', ({ data }) => emit(data.type, data.data))

    function send<Key extends Event>(type: Key, data?: EventData[Key], transfer?: Transferable[]) {
      console.debug('Sending encoder event', type)
      scope.postMessage({ type, data }, { transfer })
    }

    return Object.assign(scope, { send, on })
  }
}
