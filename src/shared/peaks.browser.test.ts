import audioUrl from '~/tests/assets/audio-sample.mp3?url'
import { getAudioBuffer } from './media'
import { getAudioBufferPeaks, getAudioInfo } from './peaks'

describe('audio peaks utilities', async () => {
  const audioBlob = await fetch(audioUrl).then(res => res.blob())
  const audioBuffer = await getAudioBuffer(audioBlob)

  it('getAudioInfo: can parse properly', async () => {
    const info = await getAudioInfo(audioBlob)
    expect(info).toMatchSnapshot()
  })

  it('getAudioBufferPeaks: can parse properly', () => {
    const result = getAudioBufferPeaks(audioBuffer, 100)

    expect(result.length).toBe(100)
    expect(result).toMatchSnapshot()

    // can return hinted totalBars
    expect(getAudioBufferPeaks(audioBuffer, 47).length).toBe(47)
  })
})
