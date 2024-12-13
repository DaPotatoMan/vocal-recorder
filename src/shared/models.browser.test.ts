import audioUrl from '~/tests/assets/audio-sample.mp3?url'
import { AudioBlob, Duration } from './models'

function toFixedPeaks(peaks: number[], digits = 6) {
  return peaks.map(e => +e.toFixed(digits))
}

describe('class: Duration', () => {
  const duration = new Duration(3600 * 1000)

  it('has proper unit conversion', () => {
    expect(duration.seconds).toMatchInlineSnapshot(`3600`)
    expect(duration.minutes).toMatchInlineSnapshot(`60`)
    expect(duration.hours).toMatchInlineSnapshot(`1`)
  })

  it('serializes properly', () => {
    expect(duration.toJSON()).toMatchSnapshot()
  })
})

describe('class: AudioBlob', async () => {
  const audioBlob = await fetch(audioUrl).then(res => res.blob())

  it('can parse from source', async () => {
    const file = await AudioBlob.parse(audioBlob)

    expect(file).toBeInstanceOf(AudioBlob)
    expect(file).toMatchSnapshot()
  })

  it('can serialize/deserialize', async () => {
    const input = await AudioBlob.parse(audioBlob)
    const json = input.toJSON()

    expect(json).toMatchSnapshot()

    // Can parse back
    const parsed = AudioBlob.fromJSON(json)

    expect(parsed).toBeInstanceOf(AudioBlob)
    expect(parsed.duration).toEqual(input.duration)
    expect(parsed.blob.size).toEqual(input.blob.size)

    // Peaks are similar up to 6 decimal places
    expect(toFixedPeaks(parsed.peaks)).toEqual(toFixedPeaks(input.peaks))
  })
})
