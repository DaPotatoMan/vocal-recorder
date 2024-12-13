import audioUrl from '~/tests/assets/audio-sample.mp3?url'
import { RecorderError } from '..'
import { blobToBuffer, getAudioBuffer, getOfflineAudioContext, StreamUtil } from './media'

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
})

describe('getOfflineAudioContext', () => {
  const octx = globalThis.OfflineAudioContext
  const ctx = globalThis.AudioContext
  const getContext = () => getOfflineAudioContext({ length: 44100, sampleRate: 44100, numberOfChannels: 1 })

  afterEach(() => {
    globalThis.OfflineAudioContext = octx
    globalThis.AudioContext = ctx
  })

  it('should create OfflineAudioContext', () => {
    expect(getContext()).toBeInstanceOf(OfflineAudioContext)
  })

  it('should use fallback AudioContext when OfflineAudioContext is not defined', () => {
    // @ts-expect-error - Testing fallback
    globalThis.OfflineAudioContext = undefined

    expect(getContext()).toBeInstanceOf(AudioContext)
  })

  it('should throw error when AudioContext is unavailable', () => {
    // @ts-expect-error - Testing fallback
    globalThis.OfflineAudioContext = undefined
    // @ts-expect-error - Testing fallback
    globalThis.AudioContext = undefined

    expect(getContext).toThrowError(RecorderError.NO_AUDIO_CONTEXT)
  })
})

describe('blobToBuffer', () => {
  it('should convert Blob to ArrayBuffer', async () => {
    const blob = await fetch(audioUrl).then(res => res.blob())
    const buffer = await blobToBuffer(blob)
    expect(buffer).toBeInstanceOf(ArrayBuffer)
  })
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
