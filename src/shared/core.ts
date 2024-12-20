/** Custom error class for vocal-recorder module */
export class RuntimeError extends Error {
  // Global
  static MEDIA_RECORDER_UNSUPPORTED = 'MediaRecorder is not supported'
  static AUDIO_CONTEXT_UNSUPPORTED = 'AudioContext is not available'
  static GETUSERMEDIA_UNSUPPORTED = 'getUserMedia is not available'

  // Recorder related
  static RECORDER_NOT_INIT = 'Recorder has not been initialized. Call init() method first'
  static RECORDER_NO_RESULT = 'Recorder produced no blob result'

  // Encoder related
  static ENCODER_SHINE_NOT_INIT = 'Shine encoder has not been initialized'
  static ENCODER_INVALID_INPUT_DATA = 'Provided data is not a Float32Array'
  static ENCODER_INVALID_RESULT = 'Invalid encoder result. Output was not a blob'

  constructor(readonly key: RuntimeError.Key, error?: Error | unknown) {
    super(RuntimeError[key])
    this.name = `${this.constructor.name}(${key})`

    if (error instanceof Error) {
      this.message += `\n\n${error.message}`
      this.stack = error.stack
    }
  }

  is(key: RuntimeError.Key) {
    return this.key === key
  }
}

export namespace RuntimeError {
  export type Key = Exclude<keyof typeof RuntimeError, keyof typeof Error>
}
