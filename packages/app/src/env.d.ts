declare module 'fix-webm-duration' {
  function fixBlob(blob: Blob, duration: number, callback: (blob: Blob) => void): void
  export default fixBlob
}

// ? Type Polyfills
interface Window {
  webkitAudioContext: typeof window.AudioContext
}

interface AudioContext {
  createGainNode: BaseAudioContext['createGain']
  createJavaScriptNode: BaseAudioContext['createScriptProcessor']
}

