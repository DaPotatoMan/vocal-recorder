import { AudioNode, GainNode } from 'standardized-audio-context-mock'

const MediaStream = vi.fn(() => ({
  active: true,
  id: 'random-id',
  getTracks: () => [],
  getAudioTracks: () => []
}))

const navigator = {
  mediaDevices: {
    getUserMedia: vi.fn(() => Promise.resolve(MediaStream()))
  }
}

const AudioContext = vi.fn(() => ({
  createGain: () => new GainNode({} as any),
  createGainNode: () => new GainNode({} as any),
  createScriptProcessor: () => new AudioNode({} as any),
  createMediaStreamSource: () => new AudioNode({} as any),

  close: () => { },

  audioWorklet: {
    addModule: () => { }
  },

  sampleRate: 48000
}))

class AudioWorkletNode {
  constructor() { }
  disconnect() { }

  port = {
    onmessage: null,
    close() { },
    postMessage() { }
  }
}

vi.stubGlobal('MediaStream', MediaStream)
vi.stubGlobal('AudioContext', AudioContext)
vi.stubGlobal('AudioWorkletNode', AudioWorkletNode)

vi.stubGlobal('navigator', navigator)
vi.stubGlobal('window', { AudioContext, navigator })

export default { navigator, AudioContext, MediaStream }
