<script setup lang="ts">
import { shallowRef } from 'vue'
import { Recorder } from 'vocal-recorder'

const devices = shallowRef<MediaDeviceInfo[]>([])
const peaks = shallowRef<number[]>([])
const src = shallowRef('')

const recorder = new Recorder()
const stopped = shallowRef(false)

navigator.mediaDevices.enumerateDevices().then((list) => {
  const inputs = list.reduce((map, entry) => {
    if (entry.groupId in map === false && !!entry.deviceId)
      map[entry.groupId] = entry

    return map
  }, {} as Record<string, MediaDeviceInfo>)

  devices.value = Object.values(inputs)
})

function drawPeak() {
  if (stopped.value) return
  const peak = recorder.instance.peaks.getPeak()
  const data = [...peaks.value, peak].slice(-264)

  peaks.value = data

  requestAnimationFrame(drawPeak)
}

async function start() {
  await recorder.start()

  stopped.value = false
  peaks.value = []
  drawPeak()
}

async function stop() {
  const blob = await recorder.stop()

  stopped.value = true
  peaks.value = recorder.instance.peaks.peaks
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

    <svg viewBox="0 0 300 100" class="chart" w-300px max-auto direction-rtl>
      <g v-for="(y, x) in peaks" :key="x" fill="blue" :transform="`translate(${x}, 0)`">
        <rect :height="(y || 1) * 2" :y="50 - (y || 1)" width="1" />
      </g>
    </svg>

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
