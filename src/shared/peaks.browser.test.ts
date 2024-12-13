import audioUrl from '~/tests/assets/audio-sample.mp3?url'
import { getAudioBuffer } from './media'
import { AudioPeaks, getAudioBufferPeaks, getAudioInfo } from './peaks'

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

  describe('class: AudioPeaks', async () => {
    const info = await getAudioInfo(audioBlob)

    it('can init from array samples', () => {
      expect(new AudioPeaks(info.peaks)).toHaveLength(100)
      expect(new AudioPeaks(info.peaks, 50)).toHaveLength(50)

      expect(new AudioPeaks([0], 64)).toHaveLength(64)
      expect(new AudioPeaks([], 128)).toHaveLength(128)
    })

    it('methods work correctly', () => {
      const peaks = new AudioPeaks(info.peaks)

      expect(peaks.clone().toFixed(6)).toEqual(peaks.toFixed(6))
      expect(peaks.getAverage(50)).toHaveLength(50)

      const ranged = peaks.getToRange(20, 60)
      expect(Math.max(...ranged)).toBe(60)
      expect(Math.min(...ranged)).toBe(20)
    })
  })
})
