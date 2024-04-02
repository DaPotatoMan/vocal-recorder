import { RecorderError, StreamUtil, useEvents } from './shared'
import { Recorder } from './factories/media-recorder'
import { Encoder } from './encoder'

export * from './factories'
export { prefetchEncoder } from './encoder'
export type { RecorderEvent } from './shared'

export class AudioRecorder {
  events = useEvents()
  config = new Encoder.Config(48000, 128, 1)

  #recorder?: Recorder

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
    const { config } = this

    // Dispose active recorder
    this.dispose()

    const stream = await StreamUtil.get({
      ...streamConstraints,
      sampleRate: config.sampleRate,
      channelCount: config.channels
    })

    config.update(stream)

    this.#recorder = await Recorder.create(stream, config, this.events)
  }

  dispose() {
    const ref = this.#recorder

    if (!ref)
      return
    ref.stop()
    ref.encoder.dispose()
  }

  // Proxy
  start() { this.#instance.start() }
  pause() { this.#instance.pause() }
  resume() { this.#instance.resume() }
  stop() { return this.#instance.stop() }
}
