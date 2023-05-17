vi.stubGlobal('Worker', class {
  onmessage?: (e: any) => null

  constructor(public url: string) {}

  terminate() {}

  postMessage(data: any) {
    this.onmessage?.({ data })
  }
})
