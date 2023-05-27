export class Duration extends Number {
  constructor(ms: number) {
    super(ms)
  }

  /** Duration in seconds */
  get seconds() {
    return this.valueOf() / 1000
  }

  /** Duration in minutes */
  get minutes() {
    return this.seconds / 60
  }

  /** Duration in hours */
  get hours() {
    return this.seconds / 3600
  }
}

export class DurationBuilder extends Duration {
  #marker = 0

  constructor() {
    super(0)
  }

  /** Start counting time */
  start() {
    this.#marker = performance.now()
  }

  /** Add time to duration and reset marker */
  flush() {
    const value = performance.now() - this.#marker
    const total = this.valueOf() + value

    this.#marker = 0
    this.valueOf = () => total
  }

  /** Return finalised `Duration` */
  get value() {
    return new Duration(this.valueOf())
  }
}
