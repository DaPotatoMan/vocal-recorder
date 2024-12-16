<template>
  <div id="container">
    <img id="background" src="@/assets/background.svg" alt="" fetchpriority="high">
    <NuxtPage />
  </div>
</template>

<style scoped lang="sass">
#container
  @apply font-[Inter,Roboto] min-h-full

#background
  @apply absolute top-0 left-0 size-full -z-1 blur-100px

//;
</style>
