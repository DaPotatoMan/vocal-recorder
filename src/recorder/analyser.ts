import type { AudioRecorder } from '.'
import { useEvents } from '../shared'

function useVolumeMeter(analyser: AnalyserNode) {
  const analyserData = new Uint8Array(analyser.fftSize)
  let maxPeak = 0

  return () => {
    // Get PCM data
    analyser.getByteTimeDomainData(analyserData)

    let sum = 0

    for (let i = 0; i < analyserData.length; i++) {
      const value = analyserData[i] / 128 - 1
      sum += value * value
    }

    const value = Math.sqrt(sum / analyserData.length)

    maxPeak = Math.max(maxPeak, value)
    const percentage = Math.min(1, value / maxPeak)

    return { value, percentage }
  }
}

function useSilenceDetector({
  silenceThreshold = 0.01,
  silenceDuration = 2000
} = {}) {
  let lastNonSilentTime = Date.now()
  let isSilent = false

  return (volume: number) => {
    const currentTime = Date.now()
    let silent = isSilent

    if (volume > silenceThreshold) {
      lastNonSilentTime = currentTime
      silent = false
    }

    // Not silent if passed silence duration
    else if ((currentTime - lastNonSilentTime) > silenceDuration) {
      silent = true
    }

    const hasChanged = isSilent !== silent
    isSilent = silent

    return { silent, hasChanged }
  }
}

export namespace AudioRecorderAnalyser {
  type SilenceDetectorConfig = Parameters<typeof useSilenceDetector>[0]
  export type Config = SilenceDetectorConfig

  export interface Events {
    silent: boolean
    volume: {
      value: number

      /** normalized based on max value from micorphone volume */
      percentage: number
    }
  }

  /** Creates analyser for {@link AudioRecorder} */
  export function create(recorder: AudioRecorder, config?: Config) {
    const events = useEvents<Events>()

    const { context, processor } = recorder
    const analyser = context.createAnalyser()

    const getVolume = useVolumeMeter(analyser)
    const detectSilence = useSilenceDetector(config)

    let processFrame: number
    let initialized = false

    function processAudio() {
      // Request next frame
      processFrame = requestAnimationFrame(processAudio)

      const volume = getVolume()
      const silence = detectSilence(volume.value)

      // Trigger events
      events.emit('volume', volume)

      if (silence.hasChanged)
        events.emit('silent', silence.silent)
    }

    context.addEventListener('statechange', () => {
      context.state === 'running' ? init() : reset()
    })

    function init() {
      processor.connect(analyser)
      processAudio()
      initialized = true
    }

    /** Resets audio nodes. But analyser is still usable */
    function reset() {
      cancelAnimationFrame(processFrame)

      if (initialized)
        processor.disconnect(analyser)

      initialized = false
    }

    /** Disposes current instance permanently */
    function dispose() {
      reset()
      analyser.disconnect()

      // Remove all events
      events.all.clear()
    }

    return {
      events,
      reset,
      dispose
    }
  }
}
