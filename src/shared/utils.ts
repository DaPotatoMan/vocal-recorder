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

export function useAsyncQueue() {
  let promise: Promise<unknown> = Promise.resolve()

  return {
    get promise() { return promise },

    run<T>(task: () => T | Promise<T>) {
      return promise = promise.then(task)
    }
  }
}
