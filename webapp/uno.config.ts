import { defineConfig, presetAttributify, presetIcons, presetTagify, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTagify(),
    presetIcons({
      warn: true,
      scale: 1.125,
      extraProperties: {
        'display': 'inline-block',
        'flex-shrink': '0'
      }
    })
  ],

  transformers: [
    transformerVariantGroup(),
    transformerDirectives()
  ],

  shortcuts: {
    'fixed-center': 'fixed top-2/4 left-2/4 -translate-2/4',
    'flex-center': 'flex flex-row items-center justify-center',
    'flex-col-center': 'flex flex-col items-center justify-center'
  }
})
