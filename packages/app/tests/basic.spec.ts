import { Recorder, createRecorder } from '../src'

import './__mocks__/worker'
import './__mocks__/audio'

describe('recorder', () => {
  let recorder: ReturnType<typeof createRecorder>

  beforeEach(() => {
    recorder = createRecorder()
  })

  afterEach(() => {
    // @ts-expect-error ignore null check
    recorder = undefined
  })

  it('should have methods', () => {
    expectTypeOf(createRecorder).toBeFunction()
    expectTypeOf(recorder).toBeObject()

    expect(recorder).property('state', Recorder.State.inactive)
  })

  it('should initialize', async () => {
    await recorder.init()
    expect(recorder).property('state', Recorder.State.initialized)
  })

  it('should throw error on re-start', async () => {
    await recorder.init()
    await recorder.start()

    expect(() => recorder.start())
      .toThrowError('Recording is already running')
  })

  it('should stop', async () => {
    await recorder.init()
    await recorder.stop()
    expect(recorder).property('state', Recorder.State.inactive)
  })
})
