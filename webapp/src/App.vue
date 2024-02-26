<script setup lang="ts">
import { reactive, ref } from 'vue'
import { AudioRecorder } from 'vocal-recorder'

const recorder = new AudioRecorder()
const audioList = ref<string[]>([])

const state = reactive(recorder.state)

recorder.events.on('*', () => Object.assign(state, recorder.state))

async function start() {
  await recorder.init()
  recorder.start()
}

async function stop() {
  const result = await recorder.stop()
  audioList.value.push(URL.createObjectURL(result))
}
</script>

<template>
  <div class="mb-20 px-4 py-2 w-max mx-auto bg-black text-white/70 text-xl rounded-xl">
    Status <b text="red-5">{{ state.current }}</b>
  </div>

  <section class="w-85vw max-w-screen-xl grid gap-12 md:grid-cols-2">
    <div class="h-min gap-3 flex flex-center flex-shrink-0 flex-0 justify-center">
      <button @click="start">
        start
      </button>
      <button @click="stop">
        stop
      </button>
    </div>

    <div class="grid gap-4 bg-black p-4 rounded-xl text-center">
      <p v-if="audioList.length === 0">
        No recordings made yet.
      </p>

      <div v-for="url in audioList" :key="url" class="gap-3 flex items-center">
        <audio :src="url" controls class="w-full" />
        <a :href="url" download="file.mp3">Download</a>
      </div>
    </div>
  </section>
</template>
