import audioUrl from '~/tests/assets/audio-sample.mp3?url'
import { AudioRecorder, getAudioBuffer, getAudioContext, useAudioRecorderAnalyser } from '.'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function prepareRecorder() {
  const recorder = new AudioRecorder()
  const analyser = useAudioRecorderAnalyser(recorder)

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

describe.concurrent('useAudioRecorderAnalyser', async () => {
  const { record, analyser, setVolume } = await prepareRecorder()

  const onVolumeEvent = vi.fn()
  const onSilentEvent = vi.fn()
  const onChangeEvent = vi.fn()

  analyser.events.on('volume', onVolumeEvent)
  analyser.events.on('silent', onSilentEvent)
  analyser.events.on('change', onChangeEvent)

  const recorded = record(9000)
  const options = { timeout: 11000, concurrent: true }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('emits silent event properly', async () => {
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
  }, options)

  it('emits events properly', async () => {
    await recorded

    expect(onVolumeEvent).toHaveBeenCalled()
    expect(onChangeEvent).toHaveBeenCalled()
  }, options)

  it('disposes properly', async () => {
    await recorded
    expect(analyser.dispose).not.toThrow()
  })
})
