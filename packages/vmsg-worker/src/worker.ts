import wasmURL from './vmsg.wasm?url'
import { fetchWASM, send, testSafariWebAssemblyBug } from './worker-utils'
import type { VmsgFFI, WorkerMessage } from './types'

// TODO(Kagami): Cache compiled module in IndexedDB? It works in FF
// and Edge, see: https://github.com/mdn/webassembly-examples/issues/4
// Though gzipped WASM module currently weights ~70kb so it should be
// perfectly cached by the browser itself.

// Must be in sync with emcc settings!
const TOTAL_STACK = 5 * 1024 * 1024
const TOTAL_MEMORY = 16 * 1024 * 1024
const WASM_PAGE_SIZE = 64 * 1024

let memory: WebAssembly.Memory
let dynamicTop = TOTAL_STACK

// TODO(Kagami): Grow memory?
function sbrk(increment: number) {
  const oldDynamicTop = dynamicTop
  dynamicTop += increment
  return oldDynamicTop
}

let pcm_l: Float32Array
let FFI: VmsgFFI
let ref: number

const vmsg = {
  init(rate: number) {
    ref = FFI.vmsg_init(rate)

    if (!ref)
      return send('error', 'vmsg.init returned null')

    const pcm_l_ref = new Uint32Array(memory.buffer, ref, 1)[0]
    pcm_l = new Float32Array(memory.buffer, pcm_l_ref)
  },

  encode(data: ArrayLike<number>) {
    pcm_l.set(data)
    const value = FFI.vmsg_encode(ref, data.length)

    if (value < 0)
      return send('error', 'vmsg.encode returned nil value')
  },

  finish() {
    if (FFI.vmsg_flush(ref) < 0)
      return send('error', 'vmsg.flush returned nil data')

    const mp3_ref = new Uint32Array(memory.buffer, ref + 4, 1)[0]
    const size = new Uint32Array(memory.buffer, ref + 8, 1)[0]
    const mp3 = new Uint8Array(memory.buffer, mp3_ref, size)
    const blob = new Blob([mp3], { type: 'audio/mpeg' })

    FFI.vmsg_free(ref)
    this.flush()

    if (!blob)
      return send('error', 'vmsg.flush returned no blob')

    send('stop', blob)
  },

  flush() {
    ref = undefined as any
    pcm_l = undefined as any
  }
}

async function init(data = {}) {
  if (self.WebAssembly && !testSafariWebAssemblyBug())
    // @ts-expect-error ignore
    delete self.WebAssembly

  if (!self.WebAssembly) {
    // @ts-expect-error ignore
    importScripts(data.shimURL)

    throw new Error('WebAssembly is not supported!')
  }

  memory = new WebAssembly.Memory({
    initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
    maximum: TOTAL_MEMORY / WASM_PAGE_SIZE
  })

  const env = {
    exit: (i: any) => send('internal-error', i),
    memory,
    sbrk,
    pow: Math.pow,
    powf: Math.pow,
    exp: Math.exp,
    sqrtf: Math.sqrt,
    cos: Math.cos,
    log: Math.log,
    sin: Math.sin
  }

  try {
    const wasm = await fetchWASM(wasmURL, { env })
    FFI = wasm.instance.exports as any

    if (!FFI)
      throw new Error('Failed to init. wasm.instance.exports returned null')

    send('init')
  }

  catch (error: any) {
    send('init-error', error.toString())
  }
}

onmessage = (e) => {
  const { type, data } = e.data as WorkerMessage

  if (type === 'init') init(data)
  if (type === 'start') vmsg.init(data)
  if (type === 'data') vmsg.encode(data)
  if (type === 'stop') vmsg.finish()
}
