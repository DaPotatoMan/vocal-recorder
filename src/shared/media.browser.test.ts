import audioUrl from '~/tests/assets/audio-sample.mp3?url'
import { RuntimeError } from '..'
import { blobToBuffer, getAudioBuffer, getAudioContext, getOfflineAudioContext, StreamUtil } from './media'

describe('class: StreamUtil', () => {
  let stream: MediaStream

  it('can get media stream', async () => {
    stream = await StreamUtil.get()
    expect(stream).toBeInstanceOf(MediaStream)
  })

  it('can get settings from media stream', () => {
    const settings = StreamUtil.getSettings(stream)

    expect(settings.deviceId).not.toBeFalsy()
    expect(settings.groupId).not.toBeFalsy()
    expect(settings.sampleRate).toBeGreaterThan(44100)
  })

  it('can validate active media stream', () => {
    const isValid = StreamUtil.isValid(stream)
    expect(isValid).toBe(true)
  })

  it('can dispose stream', () => {
    const isActive = StreamUtil.dispose(stream)
    expect(isActive).toBe(false)
    expect(StreamUtil.isValid(stream)).toBe(false)
  })

  it('should throw error when getUserMedia is unavailable', async () => {
    const ref = navigator.mediaDevices.getUserMedia
    navigator.mediaDevices.getUserMedia = undefined as any

    await expect(StreamUtil.get).rejects.toThrowError(RuntimeError.GETUSERMEDIA_UNSUPPORTED)

    // Restore
    navigator.mediaDevices.getUserMedia = ref
  })
})

describe('dom audio context', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getOfflineAudioContext', () => {
    const getContext = () => getOfflineAudioContext({ length: 48000, sampleRate: 48000, numberOfChannels: 1 })

    it('should create OfflineAudioContext', () => {
      expect(getContext()).toBeInstanceOf(OfflineAudioContext)
    })

    it('should use fallback AudioContext when OfflineAudioContext is not defined', () => {
      vi.stubGlobal('OfflineAudioContext', undefined)

      const instance = getContext()

      vi.unstubAllGlobals()
      expect(instance).not.toBeInstanceOf(OfflineAudioContext)
      expect(instance).toBeInstanceOf(AudioContext)
    })
  })

  describe('getAudioContext', () => {
    it('should create AudioContext', () => {
      expect(getAudioContext()).toBeInstanceOf(AudioContext)
    })

    it('should throw error when AudioContext is unavailable', () => {
      vi.stubGlobal('AudioContext', undefined)
      expect(() => getAudioContext()).toThrowError(RuntimeError.AUDIO_CONTEXT_UNSUPPORTED)
    })
  })
})

describe('blobToBuffer', async () => {
  const blob = await fetch(audioUrl).then(res => res.blob())

  it('should convert Blob to ArrayBuffer', () =>
    expect(blobToBuffer(blob)).resolves.toBeInstanceOf(ArrayBuffer))

  it('shoulw use FileReader if blob.arrayBuffer() not supported', () => {
    blob.arrayBuffer = undefined as any
    return expect(blobToBuffer(blob)).resolves.toBeInstanceOf(ArrayBuffer)
  })

  it('should throw error for unknown type', () =>
    expect(() => blobToBuffer(null as any)).rejects.toThrow())
})

describe('getAudioBuffer', async () => {
  const audio = await fetch(audioUrl)
  const audioBuffer = await audio.arrayBuffer()
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })

  function assertBuffer(buffer: AudioBuffer) {
    expect(buffer).toBeInstanceOf(AudioBuffer)
    expect(buffer.duration).toBeGreaterThan(23)
    expect(buffer.sampleRate).toBe(48000)
  }

  it('can parse Blob', async () => {
    const buffer = await getAudioBuffer(audioBlob)
    assertBuffer(buffer)

    // Ensure original blob is not mutated
    expect(audioBlob.size).toBeGreaterThan(0)
  })

  it('can parse ArrayBuffer', async () => {
    const buffer = await getAudioBuffer(audioBuffer)
    assertBuffer(buffer)

    // Ensure original buffer is not mutated
    expect(audioBuffer.byteLength).toBeGreaterThan(0)
  })
})
