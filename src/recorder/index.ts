import type { AudioBlob } from '../shared'
import { getAudioContext, playBeep, StreamUtil, useEvents } from '../shared'
import { createAudioProcessor } from './processor'

export * from './analyser'

export class AudioRecorder {
  events = AudioRecorder.Events.use()
  context = getAudioContext({ latencyHint: 'playback', sampleRate: 48000 })
  processor = createAudioProcessor(this.context)

  #state = {
    current: AudioRecorder.State.Inactive,
    get inactive() { return this.current === AudioRecorder.State.Inactive },
    get recording() { return this.current === AudioRecorder.State.Recording },
    get paused() { return this.current === AudioRecorder.State.Paused }
  }

  get state() {
    return { ...this.#state }
  }

  constructor(private config: AudioRecorder.Config = {}) {
    this.context.suspend()

    // Play a beep when recorder starts/stops
    this.events.on('*', async (key) => {
      const started = ['start', 'resume'].includes(key)
      const stopped = ['stop', 'pause'].includes(key)

      if (this.config.beep && (started || stopped))
        playBeep({ frequency: started ? 440 : 700 })
    })
  }

  async init(config: AudioRecorder.InitConfig = {}) {
    // Update config
    Object.assign(this.config, config)

    // Get stream
    const stream = config.stream instanceof MediaStream
      ? config.stream
      : await StreamUtil.get(config.stream)

    await this.processor.init(stream)
    this.events.emit('init', { stream })
  }

  async start() {
    await this.context.resume()

    this.#state.current = AudioRecorder.State.Recording
    this.events.emit('start')
  }

  async pause() {
    await this.context.suspend()

    this.#state.current = AudioRecorder.State.Paused
    this.events.emit('pause')
  }

  async resume() {
    await this.context.resume()

    this.#state.current = AudioRecorder.State.Recording
    this.events.emit('resume')
  }

  async stop() {
    await this.context.suspend()

    this.#state.current = AudioRecorder.State.Inactive
    this.events.emit('stop')

    const result = await this.processor.stop()
    this.events.emit('result', result)

    return result
  }

  async dispose() {
    this.processor.flush()
    await this.context.close()
  }
}

export namespace AudioRecorder {
  export enum State {
    Inactive = 'inactive',
    Recording = 'recording',
    Paused = 'paused'
  }

  /** Global config for AudioRecorder */
  export interface Config {
    /** Play a beep when recorder starts/stops */
    beep?: boolean
  }

  /** Config for init process */
  export interface InitConfig extends Config {
    stream?: MediaStream | MediaTrackConstraints
  }

  export namespace Events {
    export interface Map {
      /** Recorder is ready to be used */
      init: {
        stream: MediaStream
      }

      start: void
      stop: void
      pause: void
      resume: void

      result: AudioBlob
    }

    export type Keys = keyof Map
    export const use = useEvents<Map>
  }
}
