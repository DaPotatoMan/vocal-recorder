import { AudioRecorder, useAudioRecorderAnalyser } from '../../../src'

export const useRecorderTimer = createSharedComposable(() => {
  const date = new Date(0)

  const timer = useInterval(1000, { controls: true, immediate: false })
  const formatted = computed(() => {
    date.setSeconds(timer.counter.value)
    return date.toISOString().substring(14, 19)
  })

  return toReactive({
    formatted,
    start: () => {
      timer.reset()
      timer.resume()
    },
    stop: () => timer.pause()
  })
})

export const useRecorder = createSharedComposable(() => {
  const recorder = new AudioRecorder()
  const analyser = useAudioRecorderAnalyser(recorder)

  const state = reactive(recorder.state)
  const timer = useRecorderTimer()

  /** List of recorded audio blob: url */
  const list = ref<string[]>([])

  recorder.events.on('*', () => {
    Object.assign(state, recorder.state)
  })

  async function start(config?: AudioRecorder.Config) {
    timer.start()
    await recorder.init(config)
    await recorder.start()
  }

  async function stop() {
    timer.stop()

    const result = await recorder.stop()
    const url = URL.createObjectURL(result)

    list.value = [...list.value, url]

    return { result, url }
  }

  onUnmounted(() => {
    recorder.dispose()
    analyser.dispose()
  })

  return { analyser, state, list, start, stop, timer }
})
