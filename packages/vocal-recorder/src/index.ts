import { StreamRecorder } from './media-recorder'
import { getStream } from './utils'

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
