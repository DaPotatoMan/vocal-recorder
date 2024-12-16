<script lang="ts" setup>
defineProps<{
  icon?: string
  label?: string
}>()
</script>

<template>
  <button class="flex-center gap-1 bg-black/5 h-36px px-4 rounded-md">
    <span v-if="icon" class="size-4" :class="icon" />
    <slot>{{ label }}</slot>
  </button>
</template>
