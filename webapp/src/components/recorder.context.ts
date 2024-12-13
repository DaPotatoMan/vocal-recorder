import { createContext, createSignal } from 'solid-js'
import { AudioRecorder } from '../../../src'

export function useRecorder() {
  const recorder = new AudioRecorder()
  const [state, setState] = createSignal({
    current: 'inactive',
    inactive: true,
    paused: false,
    recording: false
  })

  const [list, setList] = createSignal<string[]>([])

  // Listen to recorder events
  recorder.events.on('*', () => setState(recorder.state))

  async function start() {
    await recorder.init()
    await recorder.start()
  }

  async function stop() {
    const result = await recorder.stop()
    const url = URL.createObjectURL(result)
    setList(list => [...list, url])
  }

  return { state, list, start, stop }
}
