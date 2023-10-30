import { Worker } from './core.types'
import { useShineEncoder } from './shine'

onmessage = async (event: MessageEvent<Worker.EventMap>) => {
  const { data, type } = event.data

  if (type === Worker.Event.ENCODE) {
    if (!(data instanceof Float32Array))
      throw new Error('Provided data is not Float32Array')

    const encoder = await useShineEncoder()

    console.debug('encoding chunks ->', data.byteLength)
    encoder.encode(data)

    postMessage({
      type: Worker.Event.RESULT,
      data: encoder.stop()
    })
  }
}
