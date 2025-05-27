<script lang="ts" setup>
import { Transcoder } from '../../src'

const state = shallowReactive({
  processing: false,
  progress: 0,

  url: null as string | null
})

async function process(input: File) {
  state.processing = true

  const { blob } = await Transcoder.toMP3(input, {
    onProgress: value => state.progress = value * 100
  })

  state.url = URL.createObjectURL(blob)
  state.processing = false
}
</script>

<template>
  <main class="size-screen flex-center">
    <Card>
      <div v-if="state.processing" class="flex-(grow col-center)">
        <section class="my-auto text-center">
          <h2 class="mb-2 text-20 font-bold relative">
            {{ Math.round(state.progress) }}<sup class="text-xs">%</sup>
          </h2>

          <ProgressRoot class="rounded-full relative h-2 w-250px overflow-hidden bg-white/5" :model-value="state.progress">
            <ProgressIndicator
              class="rounded-full block relative size-full bg-white transition-transform overflow-hidden duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
              :style="`transform: translateX(-${100 - state.progress}%)`"
            />
          </ProgressRoot>
        </section>

        <h5 class="text-base">
          Encoding File
        </h5>

        <p class="text-sm opacity-60">
          This may take a while
        </p>
      </div>

      <audio v-else-if="state.url" controls :src="state.url" class="w-full flex-shrink-0" />

      <ConverterFileChooser v-else @file-select="process" />
    </Card>
  </main>
</template>
