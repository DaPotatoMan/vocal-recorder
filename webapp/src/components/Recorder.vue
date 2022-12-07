<script setup lang="ts">
import { Recorder, createRecorder } from 'vocal-recorder'
import { shallowRef } from 'vue'
import Timer from './Timer.vue'
import Visualizer from './Visualizer.vue'

const state = shallowRef(Recorder.State.inactive)
const audioResult = shallowRef<{ url: string; duration: number; size: number } | null>(null)

const recorder = createRecorder({
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

  audioResult.value = null
  state.value = recorder.state
}

const stop = async () => {
  const result = await recorder.stop()

  audioResult.value = {
    url: URL.createObjectURL(result.blob),
    duration: +(result.duration / 1000).toFixed(1),
    size: +(result.blob.size / (1024 * 1024)).toFixed(2)
  }

  state.value = recorder.state
}
</script>

<template>
  <div v-if="state === Recorder.State.inactive && !!audioResult">
    <audio :src="audioResult.url" controls />

    <h4>Recording duration: {{ audioResult.duration }}s</h4>
    <h4>Recording size: {{ audioResult.size }}mb</h4>
  </div>

  <div v-else-if="state === Recorder.State.inactive">
    <button @click="start">
      Start recording
    </button>
  </div>

  <div v-else-if="state === Recorder.State.recording">
    <Timer />
    <Visualizer :processor="recorder.processor!" />

    <button @click="stop">
      Stop recording
    </button>
  </div>
</template>
