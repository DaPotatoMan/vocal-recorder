import type { AudioBlob } from './shared'
import mitt from 'mitt'
import { Encoder } from './encoder'
import { RuntimeError, StreamUtil } from './shared'

export * from './shared'

export class AudioRecorder {
  events = AudioRecorder.Events.use()

  #recorder?: MediaRecorder
  #encoder?: Encoder

  get #instance() {
    if (this.#recorder)
      return this.#recorder

    throw new RuntimeError('RECORDER_NOT_INIT')
  }

  get state() {
    const state = this.#recorder?.state ?? 'inactive'

    return {
      current: state,
      paused: state === 'paused',
      inactive: state === 'inactive',
      recording: state === 'recording'
    }
  }

  get stream() {
    return this.#recorder?.stream
  }

  async init(config: AudioRecorder.Config = {}) {
    // Dispose active recorder
    this.dispose()

    // Get stream
    const stream = config.stream instanceof MediaStream
      ? config.stream
      : await StreamUtil.get(config.stream)

    this.#recorder = this.#createRecorder(stream)
    this.#encoder = new Encoder(this.#recorder)

    await this.#encoder.ready
    this.events.emit('init')
  }

  #createRecorder(stream: MediaStream) {
    const recorder = new MediaRecorder(stream)
    const eventKeys = ['start', 'stop', 'pause', 'resume', 'error'] as const

    // Delegate recorder events
    eventKeys.forEach(key =>
      recorder.addEventListener(key, (event) => {
        // Dispose stream when recorder stops
        if (key === 'stop') {
          StreamUtil.dispose(stream)
        }

        this.events.emit(key, event instanceof ErrorEvent ? event.error : event)
      })
    )

    return recorder
  }

  dispose() {
    if (this.#recorder) {
      if (this.#recorder.state !== 'inactive')
        this.#recorder.stop()

      this.#recorder = undefined
    }

    if (this.#encoder) {
      this.#encoder.dispose()
      this.#encoder = undefined
    }
  }

  start() {
    this.#encoder?.start()
  }

  pause() { this.#instance.pause() }
  resume() { this.#instance.resume() }

  async stop() {
    const result = await this.#encoder?.stop()

    if (!result)
      throw new RuntimeError('RECORDER_NO_RESULT')

    this.events.emit('result', result)
    return result
  }
}

export namespace AudioRecorder {
  export interface Config {
    stream?: MediaStream | MediaTrackConstraints
  }

  export namespace Events {
    export type Map = object & {
      /** Recorder is ready to be used */
      init: void

      start: Event
      stop: Event
      pause: Event
      resume: Event

      error: Error | RuntimeError
      result: AudioBlob
    }

    export type Keys = keyof Map
    export const use = mitt<Map>
  }
}
