<script setup lang="ts">
import { Recorder, createRecorder } from 'vocal-recorder'
import wasmPath from 'vocal-recorder/wasm?url'
import workletPath from 'vocal-recorder/worklet?url'

import { shallowReactive, shallowRef } from 'vue'

import Timer from './Timer.vue'
import Visualizer from './Visualizer.vue'

const state = shallowRef(Recorder.State.inactive)
const isLegacy = shallowRef(true)

const audio = shallowReactive({
  loaded: false,
  url: '',
  duration: 0,
  actualDuration: 0,
  size: 0
})

const recorder = createRecorder({
  get legacy() {
    return isLegacy.value
  },

  wasmPath,
  workletPath,

  stream: {
    autoGainControl: false,
    echoCancellation: false,
    noiseSuppression: false,
    latency: 0
  }
})

const start = async () => {
  await recorder.init()
  recorder.start()

  audio.url = ''
  audio.loaded = false
  state.value = recorder.state
}

const stop = async () => {
  const result = await recorder.stop()

  audio.url = URL.createObjectURL(result.blob)
  audio.duration = +(result.duration / 1000).toFixed(1)
  audio.size = +(result.blob.size / (1024 * 1024)).toFixed(3)
  audio.loaded = true

  state.value = recorder.state
}

function onAudioLoad(event: Event) {
  const node = event.target as HTMLAudioElement
  audio.actualDuration = node.duration
}
</script>

<template>
  <div v-if="state === Recorder.State.inactive && audio.loaded">
    <audio :src="audio.url" controls @loadedmetadata="onAudioLoad" />

    <br>
    <br>
    <span>Audio actual duration: <b text="blue-500">{{ audio.actualDuration }}s</b></span>
    <br>
    <span>Audio estimated duration: <b text="blue-500">{{ audio.duration }}s</b></span>
    <br>
    <span>Audio size: <b text="blue-500">{{ audio.size }}mb</b></span>

    <br>
    <br>
    <a :href="audio.url" download="recording.mp3">Download file</a>
  </div>

  <div v-else-if="state === Recorder.State.inactive">
    <button @click="start">
      Start recording
    </button>

    <div>
      <input v-model="isLegacy" type="checkbox">
      Legacy
    </div>
  </div>

  <div v-else-if="state === Recorder.State.recording" class="flex flex-col items-center">
    <Timer />
    <Visualizer :processor="recorder.processor!" />

    <button @click="stop">
      Stop recording
    </button>
  </div>
</template>
