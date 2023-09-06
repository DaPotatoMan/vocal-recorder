/// <reference types="vite/client" />

declare module globalThis {
  var webkitAudioContext: typeof AudioContext
}

declare module 'wasm-media-encoders/esnext' {
  export * from 'wasm-media-encoders'
}