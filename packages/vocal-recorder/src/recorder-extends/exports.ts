import { DurationBuilder } from './utils/duration'
import { blobEncoder } from './utils/webm-encoder'
import { AudioBlob } from './utils/audio-blob'

/**
 * Extend recorder mixin with features such as:
 * - Has internal variable `duration`
 * - Returns `Promise<blob>` when `stop()` is called
 */
export class RecorderExportsMixin extends MediaRecorder {
  #timer = new DurationBuilder()
  #chunks: BlobPart[] = []
  #encode = blobEncoder()

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    super(stream, options)

    this.addEventListener('dataavailable', ev => this.#chunks.push(ev.data))
  }

  override start() {
    this.#timer.start()
    super.start()
  }

  override resume() {
    this.#timer.start()
    super.resume()
  }

  override pause() {
    this.#timer.flush()
    super.pause()
  }

  override stop() {
    return new Promise<AudioBlob>((resolve, reject) => {
      // Listen for final data
      this.addEventListener('stop', async () => {
        const duration = this.#timer.value

        const blob = await this.#encode(this.#chunks, duration.valueOf(), this.mimeType)
        const result = new AudioBlob([blob], {
          type: this.mimeType,
          duration
        })

        resolve(result)
      })

      this.addEventListener('error', reject)

      // Stop base recorder
      this.#timer.flush()
      super.stop()
    })
  }

  // Rename event listeners
  on = this.addEventListener.bind(this)
  off = this.removeEventListener.bind(this)
  emit = this.dispatchEvent.bind(this)
}
