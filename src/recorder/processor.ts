import { Encoder } from '../encoder'
import { StreamUtil } from '../shared'

export function createAudioProcessor(context: AudioContext) {
  /** Provides PCM data in {@link Float32Array} format */
  class RawBufferNode extends GainNode {
    static hasWorkletLoaded = false

    #processorNode?: AudioNode
    #audioSourceNode?: MediaStreamAudioSourceNode

    constructor(readonly $context: AudioContext, readonly onGetData: (data: Float32Array) => void) {
      super($context)
    }

    async init(stream: MediaStream) {
      this.#processorNode ??= this.context.audioWorklet ? await this.#createWorklet() : this.#createLegacyNode()
      this.connect(this.#processorNode)

      // Connect audio source node
      this.#audioSourceNode = this.$context.createMediaStreamSource(stream)
      this.#audioSourceNode.connect(this)

      console.debug(`${this.constructor.name}: Using`, this.#processorNode.constructor.name)
    }

    flush() {
      const audioNode = this.#audioSourceNode

      if (audioNode) {
        StreamUtil.dispose(audioNode.mediaStream)
        audioNode.disconnect()
        this.#audioSourceNode = undefined
      }

      this.disconnect()
    }

    #createLegacyNode() {
      console.debug('Using legacy processor')

      const node = this.context.createScriptProcessor(4096, 1, 1)
      node.onaudioprocess = event => this.onGetData(event.inputBuffer.getChannelData(0))
      node.connect(this.context.destination)

      return node
    }

    async #createWorklet() {
      const { context } = this

      if (!RawBufferNode.hasWorkletLoaded) {
        const url = await new Promise<string>((resolve, reject) => {
          const worker = new Worker(new URL('./processor.worker.ts', import.meta.url), { name: 'vocal-recorder/worklet', type: 'module' })
          worker.onmessage = (event) => {
            if (event.data.url) {
              worker.terminate()
              resolve(event.data.url)
            }

            else {
              reject(event.data.error || 'Failed to get worklet url')
            }
          }
        })

        console.debug('Loading worklet from', url)
        await context.audioWorklet.addModule(url)
        RawBufferNode.hasWorkletLoaded = true
      }

      const node = new AudioWorkletNode(context, 'pcm-processor')
      node.port.onmessage = event => this.onGetData(event.data)

      // Flush remaining buffer when context is suspended
      context.addEventListener('statechange', () => {
        if (context.state === 'suspended')
          node.port.postMessage('flush')
      })

      return node
    }
  }

  class AudioProcessor extends RawBufferNode {
    encoder?: Encoder

    constructor(context: AudioContext) {
      super(context, data => this.encoder?.encode(data))
    }

    override async init(stream: MediaStream) {
      this.encoder = new Encoder(stream)
      await Promise.all([this.encoder.ready, super.init(stream)])
    }

    async stop() {
      const blob = await this.encoder!.stop()
      this.flush()
      return blob
    }
  }

  return new AudioProcessor(context)
}
