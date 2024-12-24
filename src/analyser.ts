import type { AudioRecorder } from '.'
import { getAudioContext, useEvents } from './shared'

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
    const context = getAudioContext()
    const analyser = context.createAnalyser()

    const getVolume = useVolumeMeter(analyser)
    const detectSilence = useSilenceDetector(config)

    let audioSource: MediaStreamAudioSourceNode | null = null
    let processFrame: number

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

    function onRecorderStateChange(event: AudioRecorder.Events.Keys) {
      const isRecording = recorder.state.recording

      // Init audio source
      if (event === 'init') {
        audioSource = context.createMediaStreamSource(recorder.stream!)
        audioSource.connect(analyser)
      }

      else if (event === 'stop') {
        reset()
      }

      // Resume audio context when recording
      if (isRecording && context.state === 'suspended') {
        context.resume()
        processAudio()
      }

      // Pause audio context when not recording
      else if (!isRecording && context.state === 'running') {
        cancelAnimationFrame(processFrame)
        context.suspend()
      }
    }

    /** Resets audio nodes. But analyser is still usable */
    function reset() {
      cancelAnimationFrame(processFrame)

      if (audioSource) {
        audioSource.disconnect()
        audioSource = null
      }

      if (context.state === 'running')
        context.suspend()
    }

    /** Disposes current instance permanently */
    function dispose() {
      reset()
      analyser.disconnect()
      context.close()

      // Remove all events
      events.all.clear()
      recorder.events.off('*', onRecorderStateChange)
    }

    recorder.events.on('*', onRecorderStateChange)

    return {
      events,
      reset,
      dispose
    }
  }
}
