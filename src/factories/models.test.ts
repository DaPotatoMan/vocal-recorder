import { AudioBlob, Duration } from './models'
import { AudioPeaks } from './peaks'

describe('class: AudioBlob', () => {
  const result = new AudioBlob(
    new Blob(),
    new Duration(0),
    new AudioPeaks([]),
    {
      name: 'mp3',
      extension: 'mp3',
      mimeType: 'audio/mpeg'
    }
  )

  const serialized = result.toSerialized()
  serialized.id = 'test-id'

  it('serializes properly', () => {
    expect(serialized).toMatchSnapshot()
  })
})
