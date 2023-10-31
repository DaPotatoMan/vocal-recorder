const Errors = {
  NOT_INIT: 'Recorder has not been initialized. Call init() method first',

  NO_AUDIO_CONTEXT: 'AudioContext is not available in global context',
  NO_GETUSERMEDIA: 'getUserMedia is not available in global context'
}

export class RecorderError extends Error {
  constructor(key: keyof typeof Errors, error?: Error) {
    const message = Errors[key]

    super(key, {
      cause: { message, error }
    })
  }
}

export const Logger = {
  log: console.debug.bind(console, '🎤 @vocal/core:'),
  warn: console.warn.bind(console, '🎤 @vocal/core:')
}
