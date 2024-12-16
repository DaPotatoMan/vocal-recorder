import { AudioRecorder } from '../../../src'

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
  const state = reactive(recorder.state)
  const timer = useRecorderTimer()

  /** List of recorded audio blob: url */
  const list = ref<string[]>([])

  recorder.events.on('*', () => {
    Object.assign(state, recorder.state)
  })

  async function start() {
    timer.start()
    await recorder.init()
    await recorder.start()
  }

  async function stop() {
    timer.stop()

    const result = await recorder.stop()
    const url = URL.createObjectURL(result)

    list.value = [...list.value, url]
  }

  return { state, list, start, stop, timer }
})
