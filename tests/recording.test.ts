import { sleep } from '@antfu/utils'
import { AudioRecorder } from '../src'

describe('class: AudioRecorder', () => {
  const recorder = new AudioRecorder()

  it('can record', async () => {
    await recorder.init()
    expect(recorder.state).toMatchSnapshot()

    await recorder.start()
    expect(recorder.state).toMatchSnapshot()

    await sleep(2000)

    await recorder.pause()
    expect(recorder.state).toMatchSnapshot()

    await sleep(2000)

    await recorder.resume()
    expect(recorder.state).toMatchSnapshot()

    await sleep(5000)

    const result = await recorder.stop()
    expect(recorder.state).toMatchSnapshot()

    // Validate result
    expect(result.peaks.length).not.toBe(0)
    expect(result.duration).greaterThanOrEqual(4500)
  }, 10_000)

  it('disposes properly', async () => {
    expect(recorder.context.state).toBe<AudioContext['state']>('suspended')

    await recorder.dispose()
    expect(recorder.context.state).toBe<AudioContext['state']>('closed')
    expect(recorder.state.inactive).toBe(true)
  })
})
