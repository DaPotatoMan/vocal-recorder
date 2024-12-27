import type { AudioBlob } from '../shared'
import { EncoderWorker } from '../encoder'
import { getAudioContext, StreamUtil, useEvents } from '../shared'
import PCMWorkletUrl from './processor.worker?worker&url'

export * from './analyser'

/** Provides PCM data in {@link Float32Array} format */
export class RawBufferNode extends GainNode {
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
      const url = new URL(PCMWorkletUrl, import.meta.url)
      console.debug('Loading worklet from', url.href)

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

function useProcessor(context: AudioContext) {
  let encoder: EncoderWorker
  const bufferNode = new RawBufferNode(context, data => encoder.encode(data))

  async function init(stream: MediaStream) {
    encoder = new EncoderWorker(stream)

    await Promise.all([
      encoder.ready,
      bufferNode.init(stream)
    ])
  }

  async function stop() {
    const blob = await encoder.stop()
    dispose()
    return blob
  }

  function dispose() {
    bufferNode.flush()
  }

  return { init, stop, dispose, bufferNode }
}

export class AudioRecorder {
  events = AudioRecorder.Events.use()
  context = getAudioContext({ latencyHint: 'playback' })
  processor = useProcessor(this.context)

  #state = {
    current: AudioRecorder.State.Inactive,
    get inactive() { return this.current === AudioRecorder.State.Inactive },
    get recording() { return this.current === AudioRecorder.State.Recording },
    get paused() { return this.current === AudioRecorder.State.Paused }
  }

  get state() {
    return { ...this.#state }
  }

  constructor() {
    this.context.suspend()
  }

  async init(config: AudioRecorder.Config = {}) {
    // Get stream
    const stream = config.stream instanceof MediaStream
      ? config.stream
      : await StreamUtil.get(config.stream)

    await this.processor.init(stream)
    this.events.emit('init', { stream })
  }

  async start() {
    await this.context.resume()

    this.#state.current = AudioRecorder.State.Recording
    this.events.emit('start')
  }

  async pause() {
    await this.context.suspend()

    this.#state.current = AudioRecorder.State.Paused
    this.events.emit('pause')
  }

  async resume() {
    await this.context.resume()

    this.#state.current = AudioRecorder.State.Recording
    this.events.emit('resume')
  }

  async stop() {
    await this.context.suspend()

    this.#state.current = AudioRecorder.State.Inactive
    this.events.emit('stop')

    const result = await this.processor.stop()
    this.events.emit('result', result)

    return result
  }

  async dispose() {
    this.processor.dispose()
    await this.context.close()
  }
}

export namespace AudioRecorder {
  export enum State {
    Inactive = 'inactive',
    Recording = 'recording',
    Paused = 'paused'
  }

  export interface Config {
    stream?: MediaStream | MediaTrackConstraints
  }

  export namespace Events {
    export interface Map {
      /** Recorder is ready to be used */
      init: {
        stream: MediaStream
      }

      start: void
      stop: void
      pause: void
      resume: void

      result: AudioBlob
    }

    export type Keys = keyof Map
    export const use = useEvents<Map>
  }
}
