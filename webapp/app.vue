<script lang="ts" setup>
useHead({
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/eruda',
      async: true,
      defer: true,
      onload() {
        if (import.meta.env.DEV)
          return

        const appendConsole = confirm('Enable ui based console?')

        if (appendConsole)
          window.eruda.init()
      }
    }
  ]
})
</script>

<template>
  <div id="container">
    <img id="background" src="@/assets/background.svg" alt="" fetchpriority="high">
    <NuxtPage />
  </div>
</template>

<style scoped lang="sass">
:global(body)
  @apply bg-black text-white

#container
  @apply font-[Inter,Roboto] min-h-full

#background
  @apply absolute top-0 left-0 size-full opacity-60 -z-1 blur-100px

//;
</style>
