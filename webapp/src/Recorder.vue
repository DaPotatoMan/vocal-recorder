<script lang="ts" setup>
import { StreamUtil, getBlobAudioBuffer } from '../../src/shared'
import { useShineEncoder } from '../../src/encoder/codecs/mp3.shine'
import { Encoder } from '../../src/encoder/types'

let recorder: MediaRecorder
let encoder: Awaited<ReturnType<typeof useShineEncoder>>

async function record() {
  const config = new Encoder.Config(44100, 128, 1)

  const stream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      sampleRate: config.sampleRate,
      channelCount: config.channels,
      voiceIsolation: true
    }
  })

  const [audioTrack] = stream.getAudioTracks()

  console.log('stream settings', {
    settings: audioTrack.getSettings(),
    capabilities: audioTrack.getCapabilities(),
    constraints: audioTrack.getConstraints()
  })

  encoder = await useShineEncoder(config)

  recorder = new MediaRecorder(stream, {
    mimeType: config.sourceCodec.mimeType,

    bitsPerSecond: config.audioBitsPerSecond,
    audioBitsPerSecond: config.audioBitsPerSecond
  })

  console.log('Starting recording with config', { config, stream, encoder })

  const chunks: Blob[] = []
  const buffers: Float32Array[] = []

  let hasStopped = false

  recorder.ondataavailable = async (e) => {
    const blob = e.data

    if (blob.size === 0) {
      return
    }

    const [headerBlob] = chunks
    const bufferStart = buffers[0] ? buffers[0].length : 0

    const data = await getBlobAudioBuffer(
      headerBlob ? new Blob([headerBlob, blob]) : blob
    )

    const buffer = data.getChannelData(0).slice(bufferStart)

    buffers.push(buffer)
    chunks.push(blob)

    encoder.encode(buffer)

    console.log('decoded data', data)

    if (hasStopped) {
      // Destroy the stream
      StreamUtil.dispose(stream)
      save()
    }
  }

  recorder.onstop = () => {
    hasStopped = true
  }

  recorder.start(1000)
}

function stop() {
  recorder.stop()
}

function save() {
  const blob = encoder.stop()
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'recording.mp3'
  a.click()
}
</script>

<template>
  <div class="bg-red">
    <button @click="record">
      Record
    </button>

    <button @click="stop">
      Stop
    </button>
  </div>
</template>
