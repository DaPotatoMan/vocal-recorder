export namespace Recorder {
  export type Config = Partial<{
    stream: MediaTrackConstraints
  }>

  export enum State {
    /** Recorder is disposed or not initialized */
    inactive,
    initialized,
    recording
  }
}