<script lang="ts" setup>
import { useRecorder } from '~/components/recorder/shared'

// @ts-expect-error missig type
const context = new (window.AudioContext || window.webkitAudioContext)()
const { list, state, start: startRecord, stop } = useRecorder()

const audioSrc = 'https://raw.githubusercontent.com/voxserv/audio_quality_testing_samples/refs/heads/master/orig/156550__acclivity__a-dream-within-a-dream.wav'
const audio = new Audio()
audio.crossOrigin = 'anonymous'
audio.src = audioSrc

async function record() {
  context.resume()

  const destination = context.createMediaStreamDestination()
  const source = context.createMediaElementSource(audio)
  source.connect(destination)
  const stream = destination.stream

  await audio.play()
  await startRecord({ stream })

  setTimeout(stop, 20_000)
}
</script>

<template>
  <main class="size-screen flex-center">
    <Card>
      <template v-if="list.length > 0">
        <audio v-for="url in list" :key="url" controls :src="url" class="w-full flex-shrink-0" />
      </template>

      <template v-else>
        <button
          class="m-auto p-4 after:(content-[''] i-mdi-microphone size-26) flex-center rounded-full text-red/80 bg-red/3 border-(1 solid red) transition-transform hover:scale-110 active:scale-100"
          title="Record" :disabled="!state.inactive" :class="{ blink: state.recording }" @click="record"
        />

        <p class="text-(center sm) opacity-60">
          This method records from a pre-defined audio file.
          <br>
          Recording will stop automatically after 20 seconds.
        </p>
      </template>
    </Card>
  </main>
</template>

<style lang="sass" scoped>
.blink
  animation: blink 1s ease infinite
  pointer-events: none

@keyframes blink
  50%
    opacity: 0.3
</style>
