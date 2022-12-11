/* eslint-disable import/order */
import mocks from './__mocks__/audio'
import { getStream } from '../src/utils'

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
