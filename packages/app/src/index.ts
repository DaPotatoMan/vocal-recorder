import type { useAudioProcessor } from './processor'

export function createRecorder(config: Recorder.Config) {
  const { State } = Recorder

  let state = State.inactive
  let processor: Recorder.Processor | undefined

  async function init() {
    if (state === State.initialized || state === State.recording)
      return

    const { useAudioProcessor } = config.legacy
      ? await import('./processor/legacy')
      : await import('./processor')

    processor = await useAudioProcessor(config)
    state = State.initialized
  }

  function start() {
    if (state === State.recording) throw new Error('Recording is already running!')
    if (!processor) throw new Error('Recorder not initialized!')

    processor.start()
    state = State.recording
  }

  async function stop() {
    if (!processor) throw new Error('Recorder not initialized!')

    state = State.inactive
    return processor.stop().finally(dispose)
  }

  async function dispose() {
    if (state !== State.inactive)
      await processor?.dispose()

    state = State.inactive
    processor = undefined
  }

  return {
    init,
    start,
    stop,
    dispose,
    get state() { return state },
    get processor() { return processor }
  }
}

export class Recorder {
  static create(config: Recorder.Config) {
    return createRecorder(config)
  }
}

export namespace Recorder {
  export interface Config {
    /** When `true` the recorder will use native MediaRecorder and `will not encode to mp3` */
    legacy?: boolean

    stream?: MediaTrackConstraints
    wasmPath?: string
    workletPath: string
  }

  export enum State {
    /** Recorder is disposed or not initialized */
    inactive,
    initialized,
    recording
  }

  export type Processor = Awaited<ReturnType<typeof useAudioProcessor>>
  export type Instance = ReturnType<typeof Recorder.create>

  export interface Result {
    blob: Blob
    duration: number
  }
}
