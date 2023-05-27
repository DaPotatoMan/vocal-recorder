import { RecorderExportsMixin } from './exports'
import { PeaksProcessor } from './peaks-processor'
import { disposeStream, getStream } from './utils/media'

export class StreamRecorder extends RecorderExportsMixin {
  readonly context!: AudioContext
  readonly desination!: MediaStreamAudioDestinationNode
  readonly gainNode!: GainNode
  private streamNode!: MediaStreamAudioSourceNode
  readonly peaksAnalyser!: PeaksProcessor

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    const context = new AudioContext({ latencyHint: 'playback' })
    const desination = context.createMediaStreamDestination()
    const gainNode = context.createGain()
    const streamNode = context.createMediaStreamSource(stream)

    // Assing context nodes connections
    streamNode.connect(gainNode)
    gainNode.connect(desination)

    // Create base recorder
    super(desination.stream, options)

    // Assign vars
    this.context = context
    this.desination = desination
    this.gainNode = gainNode
    this.streamNode = streamNode
    this.peaksAnalyser = new PeaksProcessor(this, gainNode)
  }

  private dispose() {
    disposeStream(this.streamNode.mediaStream)

    this.streamNode.disconnect()
    this.gainNode.disconnect()
    this.desination.disconnect()
    this.context.close()
  }

  override async stop() {
    const blob = await super.stop()
    blob.peaks = await this.peaks

    this.dispose()
    return blob
  }

  switchStream(stream: MediaStream) {
    // Destroy old stream
    this.streamNode.disconnect()
    disposeStream(this.streamNode.mediaStream)

    // Attach new stream to destination
    this.streamNode = this.context.createMediaStreamSource(stream)
    this.streamNode.connect(this.gainNode)
  }

  async switchDevice(data: Partial<MediaDeviceInfo>) {
    this.switchStream(await getStream(data))
  }

  get peaks() {
    return this.peaksAnalyser.data
  }
}
