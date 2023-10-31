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
