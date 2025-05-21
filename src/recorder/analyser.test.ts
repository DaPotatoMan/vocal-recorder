import audioUrl from '~/tests/assets/audio-sample.mp3?url'
import { AudioRecorder, AudioRecorderAnalyser } from '.'
import { getAudioBuffer, getAudioContext } from '../shared'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function prepareRecorder() {
  const recorder = new AudioRecorder()
  const analyser = AudioRecorderAnalyser.create(recorder)

  const context = getAudioContext()
  const destination = context.createMediaStreamDestination()
  const gainNode = context.createGain()

  const audioBuffer = await getAudioBuffer(
    await fetch(audioUrl).then(res => res.blob())
  )

  const bufferSource = context.createBufferSource()
  bufferSource.buffer = audioBuffer

  bufferSource.connect(gainNode)
  gainNode.connect(destination)

  async function record(timeout?: number) {
    await recorder.init({ stream: destination.stream })

    context.resume()
    await bufferSource.start()
    await recorder.start()

    await sleep(timeout ?? audioBuffer.duration * 1000)
    return recorder.stop()
  }

  function setVolume(volume: number) {
    gainNode.gain.value = volume
  }

  return { analyser, record, setVolume }
}

describe.concurrent('class: AudioRecorderAnalyser', async () => {
  const { record, analyser, setVolume } = await prepareRecorder()

  const onVolumeEvent = vi.fn()
  const onSilentEvent = vi.fn()

  analyser.events.on('volume', onVolumeEvent)
  analyser.events.on('silent', onSilentEvent)

  const recorded = record(9000)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('emits silent event properly', { timeout: 11000, concurrent: true }, async () => {
    await sleep(2500)
    expect(onSilentEvent).not.toHaveBeenCalled()

    setVolume(0)
    await sleep(2500)
    expect(onSilentEvent).toBeCalledWith(true)

    setVolume(1)
    await sleep(2500)
    expect(onSilentEvent).toBeCalledWith(false)

    onSilentEvent.mockClear()

    await recorded
    expect(onSilentEvent).not.toHaveBeenCalled()
  })

  it('emits volume properly', async () => {
    await recorded
    expect(onVolumeEvent).toHaveBeenCalled()
  })

  it('disposes properly', async () => {
    await recorded
    expect(analyser.dispose).not.toThrow()
  })
})
