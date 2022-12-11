import type { WorkerPostType } from './types'

/** Wrapper for worker postMessage */
export const send = (type: WorkerPostType, data?: any) => postMessage({ type, data })

export async function fetchWASM(url: string, imports: WebAssembly.Imports) {
  const fallback = () => {
    return new Promise<WebAssembly.WebAssemblyInstantiatedSource>((resolve, reject) => {
      const req = new XMLHttpRequest()
      req.open('GET', url)
      req.responseType = 'arraybuffer'
      req.onload = () => resolve(WebAssembly.instantiate(req.response, imports))
      req.onerror = reject
      req.send()
    })
  }

  if (!WebAssembly.instantiateStreaming) {
    console.warn('WebAssembly.instantiateStreaming is not supported. Using WebAssembly.instantiate')
    return fallback()
  }

  try {
    const req = fetch(url, { credentials: 'same-origin' })
    return WebAssembly.instantiateStreaming(req, imports)
  }
  catch (error: any) {
    // https://github.com/Kagami/vmsg/issues/11
    if (error.message && error.message.indexOf('Argument 0 must be provided and must be a Response') > 0)
      return fallback()

    else throw error
  }
}

// https://github.com/brion/min-wasm-fail
export function testSafariWebAssemblyBug() {
  const bin = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 127, 1, 127, 3, 2, 1, 0, 5, 3, 1, 0, 1, 7, 8, 1, 4, 116, 101, 115, 116, 0, 0, 10, 16, 1, 14, 0, 32, 0, 65, 1, 54, 2, 0, 32, 0, 40, 2, 0, 11])
  const mod = new WebAssembly.Module(bin)
  const inst: any = new WebAssembly.Instance(mod, {})
  // test storing to and loading from a non-zero location via a parameter.
  // Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations
  return (inst.exports.test(4) !== 0)
}
