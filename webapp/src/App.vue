<script setup lang="ts">
import { useRecorder } from 'vocal-recorder'
import { ref } from 'vue'
import Demo from './Demo.vue'

const recorder = useRecorder()
const audioList = ref<string[]>([])

async function stop() {
  const result = await recorder.stop()
  audioList.value.push(URL.createObjectURL(result.blob))
}

const init = () => recorder.init()
const start = () => recorder.start()
</script>

<template>
  <div>
    <button @click="init">
      init
    </button>
    <button @click="recorder.start">
      Start / Resume
    </button>
    <button @click="recorder.pause">
      Pause
    </button>
    <button @click="stop">
      Stop
    </button>
  </div>

  <div class="grid gap-4 bg-black p-4 rounded-xl w-min m-auto">
    <audio v-for="url in audioList" :key="url" :src="url" controls />
  </div>

  <br>
  <br>

  <Suspense>
    <Demo />
  </Suspense>
</template>
