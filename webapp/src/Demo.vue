<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRecorder } from 'vocal-recorder'

const recorder = useRecorder()
const audioList = ref<string[]>([])

// const state = reactive(recorder.state)

// recorder.events.on('*', () => Object.assign(state, recorder.state))

async function stop() {
  const result = await recorder.stop()
  audioList.value.push(URL.createObjectURL(result))
}
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
