import type { AudioRecorder } from '.'
import mitt from 'mitt'
import { getAudioContext } from './shared'

export function useAudioRecorderAnalyser(recorder: AudioRecorder, {
  silenceThreshold = 0.01,
  silenceDuration = 2000
} = {}) {
  type Events = object & {
    volume: number
    silent: boolean
    change: Omit<Events, 'change'>
  }

  const events = mitt<Events>()

  const context = getAudioContext()
  const processor = context.createScriptProcessor(256, 1, 1)
  const analyser = context.createAnalyser()
  const analyserData = new Uint8Array(analyser.fftSize)

  let lastNonSilentTime = Date.now()
  let isSilent = false

  let audioSource: MediaStreamAudioSourceNode | null = null

  function measureVolume(): number {
    // Get PCM data
    analyser.getByteTimeDomainData(analyserData)

    let sum = 0

    for (let i = 0; i < analyserData.length; i++) {
      const value = analyserData[i] / 128 - 1
      sum += value * value
    }

    return Math.sqrt(sum / analyserData.length)
  }

  function detectSilence(volume: number) {
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

  function processAudio() {
    const volume = measureVolume()
    const silence = detectSilence(volume)

    // Trigger events
    events.emit('change', { silent: silence.silent, volume })
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
    if (isRecording && context.state === 'suspended')
      context.resume()

    // Pause audio context when not recording
    else if (!isRecording && context.state === 'running')
      context.suspend()
  }

  /** Resets audio nodes. But analyser is still usable */
  function reset() {
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
    processor.disconnect()
    analyser.disconnect()
    context.close()

    // Remove all events
    events.all.clear()
    recorder.events.off('*', onRecorderStateChange)
  }

  processor.onaudioprocess = processAudio
  analyser.connect(processor)
  processor.connect(context.destination)
  recorder.events.on('*', onRecorderStateChange)

  return {
    events,
    reset,
    dispose
  }
}
