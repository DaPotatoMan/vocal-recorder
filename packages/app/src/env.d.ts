// ? Type Polyfills
interface Window {
  webkitAudioContext: typeof window.AudioContext
}

interface AudioContext {
  createGainNode: BaseAudioContext['createGain']
  createJavaScriptNode: BaseAudioContext['createScriptProcessor']
}

declare module 'fix-webm-duration' {
  export default (blob: Blob, duration: number, callback: (blob: Blob) => void) => void
}