<script lang="ts" setup>
import { useRecorder } from './shared'

const { start, stop, state, list, timer } = useRecorder()
</script>

<template>
  <div class="bg-white m-6 w-full max-w-500px h-full max-h-500px rounded-md shadow-sm grid grid-rows-[1fr_60px]">
    <!-- List -->
    <div class="p-6 gap-4 flex-(~ col) overflow-y-auto" :style="{ 'scrollbar-gutter': 'stable both-edges' }">
      <h5 v-if="list.length === 0">
        No recordings
      </h5>

      <audio v-for="url in list" :key="url" controls :src="url" class="w-full flex-shrink-0" />
    </div>

    <!-- Controls -->
    <footer class="p-6 gap-4 h-full flex items-center border-t-(1 solid black/5)">
      <Button v-if="state.inactive" icon="i-mdi-record text-red" label="Record" @click="start" />

      <template v-else-if="state.recording">
        <Button icon="i-mdi-stop text-red animate-bounce" label="Stop" @click="stop" />
        {{ timer.formatted }}
      </template>
    </footer>
  </div>
</template>
