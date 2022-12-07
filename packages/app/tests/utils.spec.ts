import { getStream } from '../src/utils'
import mocks from './__mocks__/audio'

describe('util: getStream', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should get stream', async () => {
    const stream = await getStream()
    expect(stream).toHaveProperty('active')
  })

  it('should not get stream', async () => {
    mocks.navigator.mediaDevices.getUserMedia
      .mockImplementation(() => { throw new Error('test error') })

    expect(() => getStream())
      .toThrowError('test error')
  })
})
