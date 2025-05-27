import type { Transcoder } from '.'
import { ShineEncoder } from '../encoder/worker.shine'
import { blobToBuffer } from '../shared'

const encoder = new ShineEncoder()

onmessage = async (event) => {
  console.time('Encoding')
  const input = event.data as Transcoder.EncodeInput
  await encoder.init(input)

  encoder.encode(input.data)
  const result = await blobToBuffer(encoder.stop())

  postMessage(result, { transfer: [result] })
  console.timeEnd('Encoding')
}
