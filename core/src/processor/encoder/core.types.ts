export namespace Worker {
  export const enum Event {
    ENCODE = 'encode',
    RESULT = 'result'
  }

  interface Data {
    [Event.ENCODE]: Float32Array
    [Event.RESULT]: Blob
  }

  export interface EventMap<T extends Event = Event> {
    type: T
    data: Data[T]
  }
}
