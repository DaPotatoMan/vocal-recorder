import { blobToBuffer, getWindow, RuntimeError } from '../shared'
import { Encoder } from './index'
import { ShineEncoder } from './worker.shine'

const encoder = new ShineEncoder()
const worker = Encoder.createEmitter(getWindow())

// Init
worker.on(Encoder.Event.INIT, async (config) => {
  await encoder.init(config)
  worker.send(Encoder.Event.READY)
})

// Encode
worker.on(Encoder.Event.ENCODE, (data) => {
  if (data instanceof Float32Array === false)
    throw new RuntimeError('ENCODER_INVALID_INPUT_DATA')

  encoder.encode(data)
})

// Stop
worker.on(Encoder.Event.STOP, async () => {
  const blob = encoder.stop()

  if (blob instanceof Blob === false || blob.type !== 'audio/mpeg')
    throw new RuntimeError('ENCODER_INVALID_RESULT')

  const buffer = await blobToBuffer(blob)
  worker.send(Encoder.Event.RESULT, buffer, [buffer])
})
