<script setup lang="ts">
import { ref } from 'vue'
import { useExRecorder } from 'vocal-recorder'

const recorder = useExRecorder()
const audioList = ref<string[]>([])

async function stop() {
  const result = await recorder.stop()
  audioList.value.push(URL.createObjectURL(result))
}

await recorder.install()
</script>

<template>
  <div class="flex">
    <button @click="recorder.init()">
      init
    </button>
    <button @click="recorder.start()">
      start
    </button>
    <button @click="stop">
      stop
    </button>

    <div class="grid gap-4 bg-black p-4 rounded-xl w-min m-auto">
      <audio v-for="url in audioList" :key="url" :src="url" controls />
    </div>
  </div>
</template>
