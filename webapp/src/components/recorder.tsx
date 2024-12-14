import { createSignal, For, onCleanup, Show } from 'solid-js'
import { useRecorder } from './recorder.context'

function RecordingList(props: {
  list: string[]
}) {
  const list = () => Array.from(props.list).reverse()

  return (
    <div class="p-6 gap-4 flex-(~ col) overflow-y-auto" style={{ 'scrollbar-gutter': 'stable both-edges' }}>
      <For each={list()} fallback={<h5 class="m-auto text-xl font-medium">No recordings</h5>}>
        {url => <audio controls src={url} class="w-full flex-shrink-0"></audio>}
      </For>
    </div>
  )
}

function Button(props: {
  icon?: string
  onClick?: () => void
  children: any
}) {
  return (
    <button class="flex-center gap-1 bg-black/5 h-36px px-4 rounded-md" onClick={props.onClick}>
      {props.icon && <span class={`i-mdi-record size-4 text-red ${props.icon}`} />}
      {props.children}
    </button>
  )
}

function Timer() {
  const date = new Date(0)
  const [time, setTime] = createSignal(0)
  const id = setInterval(() => setTime(time => time + 1), 1000)

  const formatted = () => {
    date.setSeconds(time())
    return date.toISOString().substring(11, 19)
  }

  onCleanup(() => {
    clearInterval(id)
  })

  return (
    <span>{formatted()}</span>
  )
}

export function Recorder() {
  const { state, list, start, stop } = useRecorder()

  return (
    <div class="bg-white m-6 w-full max-w-500px h-full max-h-500px rounded-md shadow-sm grid grid-rows-[1fr_60px]">
      <RecordingList list={list()} />

      <footer class="p-6 gap-4 h-full flex items-center border-t-(1 solid black/5)">
        {state().inactive && <Button icon="i-mdi-record" onClick={start}>Record</Button>}
        {state().recording && <>
          <Timer />
          <Button icon="i-mdi-stop" onClick={stop}>Stop</Button>
        </>}
      </footer>
    </div>
  )
}
