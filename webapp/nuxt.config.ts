// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  sourcemap: true,

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'reka-ui/nuxt',
    'nuxt-vite-legacy'
  ],

  css: ['@unocss/reset/tailwind.css'],

  eslint: {
    config: {
      standalone: false
    }
  },

  legacy: {
    targets: ['chrome >= 49', 'edge >= 79', 'safari >= 11.1', 'firefox >= 67'],
    modernPolyfills: true
  }
})
