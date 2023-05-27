import type { AudioBlob } from './recorder-extends/utils/audio-blob'
import { StreamRecorder } from './recorder-extends/stream'
import { getStream } from './recorder-extends/utils/media'

export type { AudioBlob } from './recorder-extends/utils/audio-blob'
export * from './recorder-extends/peaks-processor/utils'
export { RealtimePeaksProcessor } from './recorder-extends/peaks-processor'

export class Recorder {
  instance!: StreamRecorder

  constructor(public config: Partial<Recorder.Config> = {}) {}

  async init(stream?: MediaStream) {
    this.instance = new StreamRecorder(stream || await getStream(this.config.constraints))
    this.instance.on('stop', () => this.dispose())
  }

  async restart() {
    if (this.instance)
      await this.stop()

    return this.start()
  }

  /** Start/Resume recorder */
  async start() {
    if (!this.instance)
      await this.init()

    if (this.instance.state === 'recording')
      throw new Error('Recording is already running!')

    // Resume if paused
    if (this.instance.state === 'paused')
      this.instance.resume()

    this.instance.start()
  }

  stop() {
    return this.instance.stop()
  }

  resume() {
    return this.instance.resume()
  }

  pause() {
    return this.instance.pause()
  }

  dispose() {
    this.instance = undefined as any
  }

  // Events
  on(...args: Parameters<StreamRecorder['on']>) {
    return this.instance.on(...args)
  }

  off(...args: Parameters<StreamRecorder['off']>) {
    return this.instance.off(...args)
  }

  emit(...args: Parameters<StreamRecorder['emit']>) {
    return this.instance.emit(...args)
  }
}

export namespace Recorder {
  export interface Config {
    constraints?: MediaTrackConstraints
  }

  export type Result = AudioBlob
}
