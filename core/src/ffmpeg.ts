import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()
// const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm'
const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm'

async function load() {
  console.log('loading ffmpeg')

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
  })

  console.log('ffmpeg loaded!')
}

const isLoaded = load()

export async function transcode(blob: Blob) {
  await isLoaded

  console.time('FFMpeg encoded')
  const input = 'input.webm'
  const output = 'out.mp3'

  await ffmpeg.writeFile(input, await fetchFile(blob))
  await ffmpeg.exec(['-i', input, output])

  const data = await ffmpeg.readFile(input)
  const result = new Blob([data], { type: 'audio/mp3' })
  console.timeEnd('FFMpeg encoded')

  return result
}
