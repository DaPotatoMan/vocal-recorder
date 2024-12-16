// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'reka-ui/nuxt'
  ],

  css: ['@unocss/reset/tailwind.css'],

  eslint: {
    config: {
      standalone: false
    }
  }
})
