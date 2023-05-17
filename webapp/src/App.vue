<script setup lang="ts">
import { shallowRef } from 'vue'
import { useRecorder } from './store'
import Visualizer from './components/Visualizer.vue'

const devices = shallowRef<MediaDeviceInfo[]>([])
const src = shallowRef('')
const started = shallowRef(false)

const { recorder } = useRecorder()
console.log(recorder)

navigator.mediaDevices.enumerateDevices().then((list) => {
  const inputs = list.reduce((map, entry) => {
    if (entry.groupId in map === false && !!entry.deviceId)
      map[entry.groupId] = entry

    return map
  }, {} as Record<string, MediaDeviceInfo>)

  devices.value = Object.values(inputs)
})

async function start() {
  await recorder.start()
  started.value = true
}

async function stop() {
  started.value = false

  const blob = await recorder.stop()
  src.value = URL.createObjectURL(blob)

  console.log(blob, src.value)
}
</script>

<template>
  <div flex flex-col items-center justify-center gap-5>
    <div class="flex flex-col gap-5 mb-20">
      <button v-for="(device, i) in devices" :key="i" @click="recorder.instance.switchDevice(device)">
        Change device to {{ device.label }} {{ device.deviceId }}
      </button>
    </div>

    <Visualizer v-if="started" />

    <audio :src="src" controls />
    <input type="range" max="10" min="1" value="1" @change="recorder.instance.gainNode.gain.value = $event.target.value">

    <button @click="start()">
      start
    </button>

    <button @click="stop()">
      stop
    </button>
  </div>
</template>
