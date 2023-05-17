import { StreamRecorder } from './media-recorder'
import { getStream } from './utils'

export type { AudioBlob } from './media-blob'

export class Recorder {
  instance!: StreamRecorder

  constructor(public config: Partial<Recorder.Config> = {}) {
    console.log('recorder instantiated')
  }

  private get instanceState() {
    return this.instance.state
  }

  async init(stream?: MediaStream) {
    this.instance = new StreamRecorder(stream || await getStream(this.config.streamConfig))
    this.instance.addEventListener('stop', () => delete this.instance) // !TODO FIX TEST CODE
  }

  async start() {
    if (!this.instance)
      await this.init()

    if (this.instanceState === 'recording')
      throw new Error('Recording is already running!')

    this.instance.start()
  }

  async restart() {
    if (this.instance)
      await this.stop()

    return this.start()
  }

  pause = () => this.instance.pause()
  resume = () => this.instance.resume()

  stop() {
    return this.instance.stop()
  }
}

export namespace Recorder {
  export interface Config {
    streamConfig?: MediaTrackConstraints
  }

  export enum State {
    /** Recorder is disposed or not initialized */
    inactive,
    initialized,
    recording
  }

  export interface Result {
    blob: Blob
    duration: number
  }
}
