export class DeferredPromise<T> extends Promise<T> {
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason: any) => void

  initialCallStack: Error['stack']
  resolved = false

  constructor(executor: ConstructorParameters<typeof Promise<T>>[0] = () => { }) {
    let resolver: (value: T | PromiseLike<T>) => void
    let rejector: (reason: T | Error) => void

    super((resolve, reject) => {
      resolver = resolve
      rejector = reject
      return executor(resolve, reject) // Promise magic: this line is unexplicably essential
    })

    this.resolve = (...args) => {
      this.resolved = true
      return resolver(...args)
    }

    this.reject = rejector!

    // store call stack for location where instance is created
    this.initialCallStack = new Error(' ').stack?.split('\n').slice(2).join('\n')
  }

  /** @throws error with amended call stack */
  rejectWithError(error: Error) {
    error.stack = [error.stack?.split('\n')[0], this.initialCallStack].join('\n')
    this.reject(error)
  }
}

export function getGlobalThis() {
  try {
    return globalThis
  }
  catch (error) {
    console.error(error)
    return window
  }
}

export function useExpandedBuffer<T extends Uint8ArrayConstructor | Float32ArrayConstructor>(Ref: T, initialSize = 1024 * 1024) {
  let outBuffer = new Ref(initialSize)
  let offset = 0

  function append(data: InstanceType<T>) {
    if (data.length + offset > outBuffer.length) {
      console.debug('(useExpandedBuffer) resizing buffer size')

      const newBuffer = new Ref(data.length + offset)
      newBuffer.set(outBuffer)
      outBuffer = newBuffer
    }

    outBuffer.set(data, offset)
    offset += data.length
  }

  function getBuffer() {
    return new Ref(outBuffer.buffer, 0, offset) as InstanceType<T>
  }

  return { append, getBuffer }
}
