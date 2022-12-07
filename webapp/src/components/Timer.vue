<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from 'vue'

const time = shallowRef(0)
let timerFn: NodeJS.Timer

onMounted(() => timerFn = setInterval(() => time.value++, 1000))
onUnmounted(() => clearTimeout(timerFn))
</script>

<template>
  <h3 class="timer">
    {{ time.toString().padStart(2, '0') }}
  </h3>
</template>

<style scoped lang="postcss">
.timer {
  @apply font-bold text-7em;
}
</style>
