import mitt from 'mitt'
import { AudioBlob, DeferredPromise, StreamUtil, useAsyncQueue } from '../shared'

export class Encoder {
  result = new DeferredPromise<AudioBlob>()
  ready = new DeferredPromise<void>()
  #queue = useAsyncQueue()

  constructor(
    readonly stream: MediaStream,
    readonly config = new Encoder.Config(stream),
    readonly worker = Encoder.createEmitter(
      new Worker(new URL('./worker.ts', import.meta.url), { name: 'vocal-recorder/encoder', type: 'module' })
    )
  ) {
    // Init
    worker.send(Encoder.Event.INIT, config)

    // Worker is ready for encoding
    worker.on(Encoder.Event.READY, this.ready.resolve)

    // Resolve audio result from worker
    worker.on(Encoder.Event.RESULT, (buffer) => {
      this.result.resolve(AudioBlob.parse(buffer))
    })
  }

  encode(data: Float32Array) {
    this.#queue.run(
      () => this.worker.send(Encoder.Event.ENCODE, data, [data.buffer])
    )
  }

  #dispose() {
    this.worker.terminate()
  }

  async stop() {
    await this.#queue.promise
    this.worker.send(Encoder.Event.STOP)
    return this.result.finally(() => this.#dispose())
  }
}

export namespace Encoder {
  export class Config {
    constructor(
      stream: MediaStream,
      settings = StreamUtil.getSettings(stream),
      readonly sampleRate = settings.sampleRate || 48_000,
      readonly channels: 1 | 2 = 1,
      readonly bitRate = 128
    ) { }
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

  export function createEmitter<T extends Worker | DedicatedWorkerGlobalScope>(scope: T) {
    const { emit, on } = mitt<EventData>()

    scope.onmessage = ({ data }) => emit(data.type, data.data)

    function send<Key extends Event>(type: Key, data?: EventData[Key], transfer?: Transferable[]) {
      const args: Parameters<Worker['postMessage']> = [{ type, data }]

      if (transfer)
        args.push(transfer)

      if (import.meta.env.MODE !== 'test')
        console.debug('Sending encoder event', type, { args })

      scope.postMessage(...args)
    }

    return Object.assign(scope, { send, on })
  }
}
