// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu(
  {},
  {
    rules: {
      'no-console': 'off',
      'style/comma-dangle': ['error', 'never'],
      'ts/no-namespace': 'off'
    }
  }
)
