import { useAudioProcessor } from './processor'

export namespace Recorder {
  export type Config = Partial<{
    stream: MediaTrackConstraints
  }>

  export enum State {
    /** Recorder is disposed or not initialized */
    inactive,
    initialized,
    recording
  }

  export type Processor = Awaited<ReturnType<typeof useAudioProcessor>>
}

export function createRecorder(config: Recorder.Config = {}) {
  const { State } = Recorder

  let state = State.inactive
  let processor: Recorder.Processor | undefined

  async function init() {
    if (state === State.initialized || state === State.recording)
      return

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
    return processor.stop()
  }

  function dispose() {
    if (state !== State.inactive)
      processor?.stop()

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
