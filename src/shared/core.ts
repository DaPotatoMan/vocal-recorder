export class RecorderError extends Error {
  // Recorder related
  static NOT_INIT = 'Recorder has not been initialized. Call init() method first'
  static NO_RESULT = 'Recorder produced no blob result'

  // Encoder related
  static ENCODER_INVALID_INPUT_DATA = 'Provided data is not a Float32Array'
  static ENCODER_INVALID_RESULT = 'Invalid encoder result. Output was not a blob'

  static MEDIA_RECORDER_UNSUPPORTED = 'MediaRecorder is not supported'
  static NO_AUDIO_CONTEXT = 'AudioContext is not available'
  static NO_GETUSERMEDIA = 'getUserMedia is not available'

  constructor(readonly key: RecorderErrorKey, error?: Error | unknown) {
    super(RecorderError[key])
    this.name = `${this.constructor.name}(${key})`

    if (error instanceof Error) {
      this.message += `\n\n${error.message}`
      this.stack = error.stack
    }
  }

  is(key: RecorderErrorKey) {
    return this.key === key
  }
}

export type RecorderErrorKey = Exclude<keyof typeof RecorderError, keyof typeof Error>

export const Logger = {
  log: console.debug.bind(console, '🎤 @vocal/core:'),
  warn: console.warn.bind(console, '🎤 @vocal/core:')
}
