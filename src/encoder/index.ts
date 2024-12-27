import mitt from 'mitt'
import { AudioBlob, DeferredPromise, getAudioBuffer, StreamUtil, useAsyncQueue } from '../shared'

export class EncoderWorker {
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

export class Encoder {
  result = new DeferredPromise<AudioBlob>()
  ready = new DeferredPromise<void>()

  constructor(
    readonly recorder: MediaRecorder,
    readonly timeslice = 2000,
    readonly config = new Encoder.Config(recorder.stream),
    readonly worker = Encoder.createEmitter(
      new Worker(new URL('./worker.ts', import.meta.url), { name: 'Vocal Encoder', type: 'module' })
    )
  ) {
    const queue = useAsyncQueue()

    // Init
    worker.send(Encoder.Event.INIT, config)

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
  #lastChunk?: Blob
  #headerBufferLength = 0
  #lastChunkLength = 0

  async start() {
    this.recorder.start(this.timeslice)
  }

  async #encode(blob: Blob) {
    const inputBlob = new Blob([this.#lastChunk ?? this.#headerBlob, blob].filter(e => !!e), { type: blob.type })

    /**
     * Decoding must use correct sampleRate.
     * Otherwise it will produce a bad pitch/tone since Shine encoder uses sampleRate from config
     */
    const { sampleRate } = this.config
    const audioBuffer = await getAudioBuffer(inputBlob, {
      sampleRate,
      length: sampleRate * this.timeslice / 1000,
      numberOfChannels: this.config.channels
    })

    const data = audioBuffer.getChannelData(0).slice(this.#headerBufferLength + this.#lastChunkLength)

    if (!this.#headerBlob) {
      this.#headerBlob = blob
      this.#headerBufferLength = data.length
    }

    /** From 2nd chunk onwards header + last chunk is used to avoid tick sounds between timeslice */
    else {
      this.#lastChunk = new Blob([this.#headerBlob, blob], { type: blob.type })
      this.#lastChunkLength = data.length
    }

    this.worker.send(Encoder.Event.ENCODE, data, [data.buffer])
  }

  dispose() {
    this.worker.terminate()

    this.#headerBlob = undefined
    this.#lastChunk = undefined
    this.#headerBufferLength = 0
    this.#lastChunkLength = 0
  }

  stop() {
    this.recorder.requestData()
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
      readonly channels = 1,
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
