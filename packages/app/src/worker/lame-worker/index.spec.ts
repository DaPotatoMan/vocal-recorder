import './index'

declare const self: any

describe('web worker messages', () => {
  beforeEach(() => {
    self.onmessage = vi.fn(self.onmessage)
    self.postMessage = vi.fn()
  })

  it('handles init message', () => {
    const event = new MessageEvent('message', {
      data: {
        command: 'init'
      }
    })
    self.dispatchEvent(event)
    expect(self.onmessage).toBeCalledTimes(1)
  })

  it('handles encode message', () => {
    const event = new MessageEvent('message', {
      data: {
        command: 'encode',
        buffer: new ArrayBuffer(0)
      }
    })
    self.dispatchEvent(event)
    expect(self.onmessage).toBeCalledTimes(1)
  })

  it('handles finish message', () => {
    const event = new MessageEvent('message', {
      data: {
        command: 'finish'
      }
    })
    self.dispatchEvent(event)
    expect(self.onmessage).toBeCalledTimes(1)
    expect(self.postMessage).toBeCalledTimes(1)
  })
})
