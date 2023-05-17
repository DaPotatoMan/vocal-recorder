<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'vue'
import { useRecorder } from '../store'

const peaks = shallowRef<number[]>([])
const { recorder } = useRecorder()

let frame: number

function drawPeak() {
  const peak = recorder.instance.peaks.getPeak()
  const data = [...peaks.value, peak].slice(-264)

  peaks.value = data

  frame = requestAnimationFrame(drawPeak)
}

drawPeak()
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <svg viewBox="0 0 300 100" class="chart" w-300px max-auto direction-rtl>
    <g v-for="(y, x) in peaks" :key="x" fill="blue" :transform="`translate(${x}, 0)`">
      <rect :height="(y || 1) * 2" :y="50 - (y || 1)" width="1" />
    </g>
  </svg>
</template>
