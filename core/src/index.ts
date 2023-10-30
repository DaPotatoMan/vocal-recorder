import type { TRecordingState } from 'extendable-media-recorder'
import { StreamUtil, useEvents } from './shared'
import { Encoder } from './processor/encoder/core'
import { Recorder } from './processor/factories/media-recorder'

function getRecordingState(state: TRecordingState = 'inactive') {
  return {
    current: state,

    paused: state === 'paused',
    inactive: state === 'inactive',
    recording: state === 'recording'
  }
}

export function useRecorder() {
  const emitter = useEvents()
  let recorder: Recorder

  const config = new Encoder.Config(48000, 128, 1)

  async function init(stream?: MediaStream) {
    stream ??= await StreamUtil.get()

    // ! Update sample rate
    config.sampleRate = StreamUtil.getSettings(stream).sampleRate || config.sampleRate

    recorder?.stop() // Dispose previous
    recorder = await Recorder.create(stream, config, emitter)
  }

  return {
    events: emitter,

    init,

    // Proxy
    start: () => recorder.start(5000),
    stop: () => recorder.stop(),
    pause: () => recorder.pause(),
    resume: () => recorder.resume(),

    get state() {
      return getRecordingState(recorder?.state)
    }
  }
}
