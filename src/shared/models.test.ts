import { AudioBlob, Duration } from './models'
import { AudioPeaks } from './peaks'

describe('class: AudioBlob', () => {
  const result = new AudioBlob(
    new Blob(),
    new Duration(0),
    new AudioPeaks([])
  )

  const serialized = result.toSerialized()
  serialized.id = 'test-id'

  it('serializes properly', () => {
    expect(serialized).toMatchSnapshot()
  })
})
