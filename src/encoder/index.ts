import { isWEBMSupported } from '../shared'
import type { Encoder } from './types'

export * from './types'

export async function useEncoder(config: Encoder.Config) {
  const isOPUS = config.sourceCodec.name === 'opus'

  if (isOPUS) {
    const instance = await import('./codecs/mp3').then(e => e.useMP3Encoder())
    await instance.init(config)

    return instance
  }

  return await import('./codecs/base').then(e => e.useBaseEncoder(config))
}

export async function prefetchEncoder() {
  try {
    const isMP3 = isWEBMSupported()
    const label = `Prefetched ${isMP3 ? 'mp3' : 'base'} codec`

    console.time(label)

    // eslint-disable-next-line ts/no-unused-expressions
    await isMP3
      ? import('../encoder/codecs/mp3')
      : import('../encoder/codecs/base')

    console.timeEnd(label)
    return true
  }
  catch (error) {
    console.error(error)
  }

  return false
}
