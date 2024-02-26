import { AudioBlob } from '../../factories/models'
import { getAudioPeaks } from '../../factories/peaks'
import { useExpandedBuffer } from '../../shared'
import { Codecs, type Encoder, Worker as Message } from '../types'
// import { useLameEncoder } from './mp3.lame'
import { useShineEncoder } from './mp3.shine'
import { useOPUSDecoder } from './webm'

const log = console.debug.bind(null, '[Recorder/mp3-worker]')
const send = <T extends Message.Event>(type: T, data?: Message.Data[T]) => postMessage({ type, data })

export async function useEncoder(config: Encoder.Config) {
  const encoder = await useShineEncoder(config)
  const decoder = useOPUSDecoder(config.sampleRate)

  let audioData = useExpandedBuffer(Float32Array, 512 * 1024)
  let encodeTasks = Promise.resolve()

  async function encode(blob: Blob) {
    const frames = await decoder.decode(blob)
    const data = frames.channelData[0]

    audioData.append(data)
    encoder.encode(data)
  }

  async function stop() {
    await encodeTasks

    const blob = encoder.stop()

    const audioBuffer = audioData.getBuffer()
    const peaks = getAudioPeaks(audioBuffer, 100)
    const duration = (audioBuffer.length / config.sampleRate) * 1000

    const result = AudioBlob.fromRaw(blob, duration, [peaks, 100], Codecs.mp3)

    // @ts-expect-error flush
    audioData = undefined
    decoder.free()

    send(Message.Event.RESULT, result.toSerialized())
  }

  // ! Listen to worker events
  onmessage = async (event: MessageEvent<Message.EventMap<any>>) => {
    const { data, type } = event.data

    log('Recived event', type, 'with data', data)

    // Encode
    if (type === Message.Event.ENCODE) {
      if (data instanceof Blob)
        encodeTasks = encodeTasks.then(() => encode(data))

      else throw new Error('Provided data is not a Blob')
    }

    // Get result
    if (type === Message.Event.STOP) stop()
  }

  // Send Ready Event
  send(Message.Event.READY)
  log('ready')
}

// ! Spawn with only init events
onmessage = async (event: MessageEvent<Message.EventMap>) => {
  const { data, type } = event.data

  // Init
  if (type === Message.Event.INIT) {
    const config = data as Encoder.Config

    if (config.sourceCodec.name !== 'opus')
      throw new Error('Source code is not OPUS')

    useEncoder(config)
  }
}

// !TODO
// - remove useBaseEncoder from worker thread
// - worker should init encoder and send Ready event on start (remove manual init event)
