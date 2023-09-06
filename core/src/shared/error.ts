const Errors = {
  NO_AUDIO_CONTEXT: 'AudioContext is not available in global context',
  NO_GETUSERMEDIA: 'getUserMedia is not available in global context',

  NOT_INIT: 'Recorder has not been initialized'
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
