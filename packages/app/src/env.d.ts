// ? Type Polyfills
interface Window {
  webkitAudioContext: typeof window.AudioContext
}

interface AudioContext {
  createGainNode: BaseAudioContext['createGain']
  createJavaScriptNode: BaseAudioContext['createScriptProcessor']
}