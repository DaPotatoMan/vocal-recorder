import { getBlobCodec } from './types'

describe('getBlobCodec', () => {
  it('can return proper codec', () => {
    const types = ['audio/mpeg', 'audio/mp4', 'audio/mp4;codecs=opus', 'audio/webm;codecs=opus', 'audio/webm']
    const codecs = types.reduce<Record<string, any>>(
      (map, type) => {
        map[type] = getBlobCodec(new Blob([], { type }))
        return map
      },
      {}
    )

    expect(codecs).toMatchInlineSnapshot(`
      {
        "audio/mp4": {
          "extension": "m4a",
          "mimeType": "audio/mp4",
          "name": "mp4a",
        },
        "audio/mp4;codecs=opus": {
          "extension": "m4a",
          "mimeType": "audio/mp4",
          "name": "mp4a",
        },
        "audio/mpeg": {
          "extension": "mp3",
          "mimeType": "audio/mpeg",
          "name": "mp3",
        },
        "audio/webm": {
          "extension": "webm",
          "mimeType": "audio/webm",
          "name": "unknown-webm",
        },
        "audio/webm;codecs=opus": {
          "extension": "webm",
          "mimeType": "audio/webm;codecs=opus",
          "name": "opus",
        },
      }
    `)
  })
})
