// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    rules: {
      'no-console': 'off',
      'no-alert': 'warn',
      'style/comma-dangle': ['error', 'never'],
      'ts/no-namespace': 'off'
    }
  }
)
