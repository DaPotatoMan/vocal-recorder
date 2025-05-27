import OGGLargeAudioURL from '~/tests/assets/audio-sample-large.ogg?url'
import M4AAudioURL from '~/tests/assets/audio-sample.m4a?url'
import MP3AudioURL from '~/tests/assets/audio-sample.mp3?url'
import WAVAudioURL from '~/tests/assets/audio-sample.wav?url'
import WEBMAudioURL from '~/tests/assets/audio-sample.webm?url'

import { Transcoder } from '..'

describe('class: Transcoder', async () => {
  async function transcode(url: string) {
    const blob = await fetch(url).then(i => i.blob())

    const onProgressFn = vi.fn((value: number) => console.log(`Progress: ${(value * 100).toFixed(2)}%`))
    const result = await Transcoder.toMP3(blob, {
      onProgress: onProgressFn
    })

    expect(onProgressFn).toHaveBeenCalled()
    expect(result).toMatchSnapshot()
  }

  it('mp3 -> mp3', async () => transcode(MP3AudioURL))
  it('wav -> mp3', async () => transcode(WAVAudioURL))
  it('webm -> mp3', async () => transcode(WEBMAudioURL))
  it.skip('m4a -> mp3', async () => transcode(M4AAudioURL))
  it('ogg (large) -> mp3', async () => transcode(OGGLargeAudioURL), 25_000)
})
