import audioUrl from '~/tests/assets/audio-sample.mp3?url'
import { RuntimeError } from '..'
import { blobToBuffer, getAudioBuffer, getAudioContext, getAudioMetadata, getOfflineAudioContext, playBeep, StreamUtil } from './media'

describe('class: StreamUtil', () => {
  let stream: MediaStream

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('can get media stream', async () => {
    stream = await StreamUtil.get()
    expect(stream).toBeInstanceOf(MediaStream)
  })

  it('can get settings from media stream', () => {
    const settings = StreamUtil.getSettings(stream)
    const capabilites = StreamUtil.getCapabilities(stream)

    expect(settings.deviceId).not.toBeFalsy()
    expect(settings.groupId).not.toBeFalsy()
    expect(settings.sampleRate).toBeGreaterThan(44100)

    expect(Object.keys(settings)).toMatchSnapshot()
    expect(Object.keys(capabilites)).toMatchSnapshot()
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

  it('can listen to dispose event', () => {
    const callback = vi.fn()
    StreamUtil.onDispose(stream, callback)

    StreamUtil.dispose(stream)
    expect(callback).toHaveBeenCalled()
  })

  it('should throw error when getUserMedia is unavailable', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: undefined
      }
    })

    await expect(StreamUtil.get).rejects.toThrowError(RuntimeError.GETUSERMEDIA_UNSUPPORTED)
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

describe('getAudioMetadata', async () => {
  it('can parse blob', async () => {
    const result = await getAudioMetadata(
      await fetch(audioUrl).then(i => i.blob())
    )

    expect(result).toMatchInlineSnapshot(`
      {
        "bitRate": 128,
        "duration": 23.902,
      }
    `)
  })

  it('should throw error for invalid input', () => {
    expect(
      getAudioMetadata(new Blob())
    )
      .rejects
      .toThrow(MediaError)
  })
})

describe('playBeep', () => {
  it('can play beep', { timeout: 3000 }, () => {
    expect(playBeep()).resolves.not.toThrow()
  })
})
