<script lang="ts" setup>
import { useRecorder } from './shared'

const { analyser } = useRecorder()

const state = reactive({
  volume: 0,
  silent: false
})

onMounted(() => {
  analyser.on('change', data => Object.assign(state, data))
})
</script>

<template>
  <div class="relative flex-center size-10 overflow-hidden text-xl rounded-md bg-white/5 after:(content-[''] absolute inset-0 bg-white/30 translate-y-$volume-y)" :style="{ '--volume-y': `${(1 - state.volume) * 100}%` }">
    <span :class="state.silent ? 'i-mdi-microphone-off text-red' : 'i-mdi-microphone'" />
  </div>
</template>
