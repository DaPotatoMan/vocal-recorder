export class AudioBlob extends Blob {
  constructor(blobParts?: BlobPart[], private readonly options?: BlobPropertyBag & { duration: number }) {
    super(blobParts, options)
  }

  get duration() {
    return this.options?.duration || 0
  }
}

export async function blobBuilder() {
  const fixer = MediaRecorder.isTypeSupported?.('audio/webm')
    ? await import('fix-webm-duration').then(i => i.default)
    : undefined

  return (chunks: BlobPart[], duration: number, type: string) => {
    const rawBlob = new Blob(chunks, { type })

    if (chunks.length <= 0)
      throw new Error('There are no chunk data available')

    if (!type.endsWith('webm')) return rawBlob

    // Fix webm duration metadata
    return new Promise<Blob>(resolve => fixer?.(rawBlob, duration, resolve) || rawBlob)
  }
}
