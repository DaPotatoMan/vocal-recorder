<script lang="ts" setup>
const props = defineProps<{
  onFileSelect: (file: File) => void
}>()

const wrapper = ref()
const { isOverDropZone } = useDropZone(wrapper, {
  onDrop: onGetFiles,
  multiple: false
})

const selector = useFileDialog({ accept: 'audio/*' })

function onGetFiles(files?: FileList | File[] | null) {
  const input = files?.[0]

  if (input)
    props.onFileSelect(input)
}

watchEffect(() => {
  onGetFiles(selector.files.value)
  selector.reset()
})
</script>

<template>
  <div ref="wrapper" class="m-6 p-6 gap-4 flex-(grow col-center) text-center cursor-pointer rounded-xl text-white/80 border-(2 dashed white/5) hover:border-white/40" :class="{ 'border-bluegray/40': isOverDropZone }" @click="selector.open()">
    <span class="i-mdi-upload size-16 text-white/45" />
    Select or drag and drop an audio file
  </div>
</template>
