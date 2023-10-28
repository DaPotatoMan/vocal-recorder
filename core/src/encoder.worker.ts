import { Shine, StereoMode } from '@toots/shine.js'
import { Logger } from './shared'

export namespace Message {
  export const enum Events { ENCODE = 'encode', RESULT = 'result' }

  export interface Data {
    [Events.ENCODE]: Float32Array
    [Events.RESULT]: Blob
  }

  export interface MessageEvent<T extends Events = Events> {
    type: T
    data: Data[T]
  }
}

export async function useShineEncoder() {
  await Shine.initialized
  Logger.log('shine-encoder: initialized')

  const shine = new Shine({
    samplerate: 44100,
    bitrate: 128,
    channels: 1,
    stereoMode: StereoMode.MONO
  })

  let chunks: Uint8Array[] = []
  let isDone = false

  function encode(data: Float32Array) {
    if (isDone) return

    chunks.push(
      shine.encode([data])
    )
  }

  function stop() {
    isDone = true
    chunks.push(shine.close())
    const blob = new Blob(chunks, { type: 'audio/mpeg' })

    // Flush
    chunks = []

    return blob
  }

  return Object.freeze({ encode, stop })
}

onmessage = async (event: MessageEvent<Message.MessageEvent<Message.Events>>) => {
  const { data, type } = event.data

  if (type === Message.Events.ENCODE) {
    if (!(data instanceof Float32Array))
      throw new Error('Provided data is not Float32Array')

    const encoder = await useShineEncoder()

    console.debug('encoding chunks ->', data.byteLength)
    encoder.encode(data)

    postMessage({
      type: Message.Events.RESULT,
      data: encoder.stop()
    })
  }
}
