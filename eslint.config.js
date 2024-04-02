import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  isInEditor: false,

  stylistic: {
    indent: 2,
    quotes: 'single'
  },

  rules: {
    'no-console': 'off',
    'style/comma-dangle': ['error', 'never'],
    'ts/no-namespace': 'off'
  }
})
