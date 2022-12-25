export type WorkerPostType = 'init' | 'init-error' | 'internal-error' | 'error' | 'stop'
export type WorkerGetType = 'init' | 'start' | 'stop' | 'data'

export interface WorkerMessage {
  type: WorkerGetType
  data: any
}

export interface VmsgFFI {
  vmsg_init(sampleRate: number): number
  vmsg_encode(byteOffset: number, length: number): number
  vmsg_flush(byteOffset: number): number
  vmsg_free(byteOffset: number): void
}

export type VmsgInitOptions = Partial<{
  wasmURL: string
}>