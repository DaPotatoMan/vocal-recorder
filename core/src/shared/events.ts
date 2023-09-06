import mitt from 'mitt'
import type { Emitter, EventHandlerMap, EventType, Handler } from 'mitt'
import type { AudioBlob } from '../processor/factories'

export type Events = {} & {
  init: void
  start: void
  stop: void
  pause: void
  resume: void
  result: AudioBlob
}

export type ExtendedEmitter<T extends Record<EventType, unknown>> = Emitter<T> & {
  once<Key extends keyof T>(type: Key, handler: Handler<T[Key]>): void
}

export function useMitt<Events extends Record<EventType, unknown>>(all?: EventHandlerMap<Events>) {
  const inst = mitt(all)

  // @ts-expect-error un-typed issue
  inst.once = (type, fn) => {
    inst.on(type, fn)
    inst.on(type, inst.off.bind(inst, type, fn))
  }

  return inst as unknown as ExtendedEmitter<Events>
}

export type EventBus = ExtendedEmitter<Events>
export const useEvents = () => useMitt<Events>()
