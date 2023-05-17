declare module 'fix-webm-duration' {
  function fixBlob(blob: Blob, duration: number, callback: (blob: Blob) => void): void
  export default fixBlob
}
