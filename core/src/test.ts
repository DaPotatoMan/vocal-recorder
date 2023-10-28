import type { IMediaRecorderConstructor } from 'extendable-media-recorder'
import { MediaRecorder, register } from 'extendable-media-recorder'
import { connect } from 'extendable-media-recorder-wav-encoder'

import type { EventBus } from './shared'
import { DeferredPromise, StreamUtil, useEvents } from './shared'
// import { encodeToMP3, encodeWAV, getAudioBuffer, useEncoder } from './encoder'
import { useEncoder } from './webm'
import { downloadFile } from './encoder'

class Recorder extends MediaRecorder {
  #promise = new DeferredPromise<Blob>()
  #chunks: BlobPart[] = []

  encoder!: Awaited<ReturnType<typeof useEncoder>>

  #resolveBlob() {
    console.debug('[Recorder]', 'blob resolved')

    downloadFile(
      new Blob(this.#chunks, { type: 'audio/mp3' })
    )

    const blob = this.encoder.stop()
    this.#promise.resolve(blob)
  }

  async #encodeChunk(chunk: Blob) {
    console.debug('[Recorder]', `encoding chunk -> ${chunk.size}`)

    this.#chunks.push(
      // await encodeToMP3(chunk)
      chunk
    )

    // encodeWAV(chunk)
    await this.encoder.encode(chunk)

    if (this.state === 'inactive') this.#resolveBlob()
  }

  constructor(...args: ConstructorParameters<IMediaRecorderConstructor>) {
    super(...args)

    super.addEventListener('dataavailable', event => this.#encodeChunk(event.data));

    ['start', 'stop', 'pause'].forEach((event) => {
      super.addEventListener(event, () => console.debug('[Recorder]', event))
    })
  }

  stop() {
    super.stop()
    return this.#promise
  }
}

function useReusableRecorder(emitter: EventBus) {
  let isInstalled = false
  let recorder: Recorder

  async function init(stream?: MediaStream) {
    // await register(await connect())

    stream ??= await StreamUtil.get()
    console.log('stream sample rate ->', stream.getAudioTracks()[0].getSettings())

    recorder?.stop()
    recorder = new Recorder(stream, {
      // mimeType: 'audio/wav',
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000
    })

    recorder.encoder = await useEncoder()
    console.debug('init check')
  }

  async function install() {
    if (isInstalled) return
    isInstalled = true
  }

  return {
    install,
    init,

    // Proxy
    start: () => recorder.start(2000),
    stop: () => recorder.stop(),
    pause: () => recorder.pause(),
    resume: () => recorder.resume()
  }
}

export function useExRecorder() {
  const emitter = useEvents()
  return useReusableRecorder(emitter)
}
