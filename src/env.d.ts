interface Window {
  webkitAudioContext?: typeof AudioContext
}

declare module 'wasm-media-encoders/esnext' {
  export * from 'wasm-media-encoders'
}
