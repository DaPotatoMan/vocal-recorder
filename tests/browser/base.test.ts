import { sleep } from '@antfu/utils'
import { AudioRecorder } from '../../src'

describe('can record', () => {
  const recorder = new AudioRecorder()

  it('class inits properly', () => {
    expect(recorder.state).toMatchSnapshot()
  })

  it('can record', async () => {
    await recorder.init()
    expect(recorder.config).toMatchSnapshot()
    expect(recorder.state).toMatchSnapshot()

    await recorder.start()
    expect(recorder.state).toMatchSnapshot()

    await sleep(5000)

    const result = await recorder.stop()
    expect(recorder.state).toMatchSnapshot()

    // Validate result
    expect(result.codec).toMatchSnapshot()
    expect(result.peaks.length).not.toBe(0)
    expect(result.duration).greaterThanOrEqual(4500)
  }, 10_000)
})
