import { Encoder } from './encoder'
import { Events, RecorderError, StreamUtil } from './shared'

export * from './shared'

export class AudioRecorder {
  events = Events.use()

  #recorder?: MediaRecorder
  #encoder?: Encoder

  get #instance() {
    if (this.#recorder)
      return this.#recorder

    throw new RecorderError('NOT_INIT')
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

  async init(streamConstraints?: Exclude<MediaTrackConstraints, 'sampleRate' | 'channelCount'>) {
    // Dispose active recorder
    this.dispose()

    const stream = await StreamUtil.get(streamConstraints)
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

  // Proxy
  start() { this.#instance.start(3500) }
  pause() { this.#instance.pause() }
  resume() { this.#instance.resume() }

  async stop() {
    const result = await this.#encoder?.stop()

    if (!result)
      throw new RecorderError('NO_RESULT')

    this.events.emit('result', result)
    return result
  }
}
