import { AudioNode, AudioWorkletNode, AudioContext as Ctx } from 'standardized-audio-context-mock'

const MediaStream = vi.fn(() => ({
  active: true,
  id: 'random-id',
  getTracks: () => []
  // onactive: vi.fn(),
  // onaddtrack: vi.fn(),
  // oninactive: vi.fn(),
  // onremovetrack: vi.fn(),
}))

const navigator = {
  mediaDevices: {
    getUserMedia: vi.fn(() => Promise.resolve(MediaStream()))
  }
}

const AudioContext = vi.fn(() =>
  Object.assign(new Ctx(), {
    // @ts-expect-error ignore type issue
    createScriptProcessor: () => new AudioNode({})
  })
)

vi.stubGlobal('MediaStream', MediaStream)
vi.stubGlobal('AudioContext', AudioContext)
vi.stubGlobal('AudioWorkletNode', AudioWorkletNode)

vi.stubGlobal('navigator', navigator)
vi.stubGlobal('window', { AudioContext, AudioWorkletNode, navigator })

export default { navigator, AudioContext, MediaStream }
