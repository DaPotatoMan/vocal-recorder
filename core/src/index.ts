import { useProcessor } from './processor'
import { AudioBlob } from './processor/factories'
import { type EventBus, Logger, StreamUtil, getAudioContext, useEvents } from './shared'

function getContextNodes(emitter: EventBus) {
  function build() {
    const context = getAudioContext({ latencyHint: 'playback' })
    const desination = context.createMediaStreamDestination()
    const gainNode = context.createGain()
    const processor = useProcessor(emitter, context, gainNode, desination)

    context.suspend()
    gainNode.connect(desination)

    async function dispose() {
      if (context.state !== 'closed') await context.close()
      desination.disconnect()
      gainNode.disconnect()
    }

    return {
      context, desination, gainNode, processor, dispose
    }
  }

  const nodes = build()

  function rebuildNodes(whenClosed = true) {
    if (whenClosed && nodes.context.state !== 'closed')
      return

    Logger.log('getContextNodes() -> rebuilding nodes')
    nodes.dispose() // ! Dispose current nodes
    return Object.assign(nodes, build())
  }

  return { nodes, rebuildNodes }
}

function useStreamSwitcher(nodes: ReturnType<typeof getContextNodes>['nodes']) {
  let node: MediaStreamAudioSourceNode | null = null

  function dispose() {
    if (!node) return

    node.disconnect()
    StreamUtil.dispose(node.mediaStream)
    node = null
  }

  function use(stream: MediaStream) {
    dispose()

    node = nodes.context.createMediaStreamSource(stream)
    node.connect(nodes.gainNode)
  }

  return {
    use,
    dispose,

    get isValid() {
      return !!node && StreamUtil.isValid(node.mediaStream)
    }
  }
}

function getContextState(context: AudioContext) {
  const state = context.state.toString() as AudioContextState & {}

  return {
    current: state,
    isRecording: state === 'running',
    isPaused: state === 'suspended' && context.currentTime > 0,
    isStopped: state === 'closed'
  }
}

export function useRecorder() {
  const emitter = useEvents()
  const { nodes, rebuildNodes: verify } = getContextNodes(emitter)
  const streamNode = useStreamSwitcher(nodes)

  emitter.on('*', key => Logger.log('state changed ->', key))

  async function init(stream?: MediaStream) {
    verify()

    await nodes.processor.isReady

    stream ||= await StreamUtil.get()
    switchStream(stream)
    emitter.emit('init')
  }

  async function start() {
    verify()
    if (!streamNode.isValid) await init()

    await nodes.context.resume()
    emitter.emit('start')
  }

  async function resume() {
    verify()

    await nodes.context.resume()
    emitter.emit('resume')
  }

  async function pause() {
    await nodes.context.suspend()
    emitter.emit('pause')
  }

  async function dispose() {
    await nodes.dispose()
    streamNode.dispose()
  }

  async function stop() {
    await dispose()
    emitter.emit('stop')

    const payload = await nodes.processor.result
    const result = AudioBlob.fromRaw(
      payload.blob,
      nodes.context.currentTime * 1000,
      [payload.peaks, 100, 0, 100]
    )

    emitter.emit('result', result)
    return result
  }

  async function restart() {
    await dispose()
    await start()
  }

  function switchStream(stream: MediaStream) {
    streamNode.use(stream)
  }

  async function switchDevice(data: Partial<MediaDeviceInfo>) {
    switchStream(await StreamUtil.get(data))
  }

  return Object.freeze({
    init,
    start,
    resume,
    pause,
    stop,
    dispose,
    restart,
    switchStream,
    switchDevice,
    events: emitter,

    get nodes() {
      return nodes
    },

    get state() {
      return getContextState(nodes.context)
    }
  })
}

export * from './processor/factories'
