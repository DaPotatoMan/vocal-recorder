<script lang="ts" setup>
import { useRecorder } from './shared'

const { start, stop, state, list, timer } = useRecorder()
</script>

<template>
  <Card class="!p-0 !grid grid-rows-[1fr_60px]">
    <!-- List -->
    <div class="p-6 gap-4 flex-(~ col) overflow-y-auto" :style="{ 'scrollbar-gutter': 'stable both-edges' }">
      <div v-if="list.length === 0" class="flex-(grow col-center) text-white/70">
        <span class="i-mdi-data size-12 mb-4" />
        No recordings yet
      </div>

      <audio v-for="url in list" :key="url" controls :src="url" class="w-full flex-shrink-0" />
    </div>

    <!-- Controls -->
    <footer class="p-6 gap-4 h-full flex items-center border-t-(1 solid white/5)">
      <Button v-if="state.inactive" icon="i-mdi-record text-red" class="bg-white/15 hover:bg-white/20" label="Record" @click="start" />

      <template v-else-if="state.recording">
        <Button icon="i-mdi-stop text-red animate-bounce" class="bg-white/15 hover:bg-white/20" label="Stop" @click="stop" />
        {{ timer.formatted }}
      </template>
    </footer>
  </Card>
</template>
