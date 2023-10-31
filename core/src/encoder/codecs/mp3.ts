import type { SerializedAudioBlob } from '../../factories'
import { AudioBlob } from '../../factories'
import { DeferredPromise } from '../../shared'
import { type Encoder, Worker as Message } from '../types'
import EncoderWorker from './mp3.worker?worker'

export function useMP3Encoder() {
  const ready = new DeferredPromise<boolean>()
  const result = new DeferredPromise<AudioBlob>()

  const worker = new EncoderWorker()

  function send<T extends Message.Event>(type: T, data?: Message.Data[T]) {
    worker.postMessage({ type, data })
  }

  function dispose() {
    worker.terminate()
  }

  function init(config: Encoder.Config) {
    send(Message.Event.INIT, config)
    return ready
  }

  function encode(chunk: Blob) {
    send(Message.Event.ENCODE, chunk)
  }

  function stop() {
    send(Message.Event.STOP)
    return result
  }

  worker.onmessage = (event: MessageEvent<Message.EventMap>) => {
    const { type, data } = event.data

    if (type === Message.Event.READY) ready.resolve(true)

    if (type === Message.Event.RESULT) {
      dispose()

      const payload = data as SerializedAudioBlob

      result.resolve(
        AudioBlob.fromRaw(payload.blob, payload.duration, [payload.peaks], payload.codec)
      )
    }
  }

  return { init, stop, encode, dispose, result }
}
