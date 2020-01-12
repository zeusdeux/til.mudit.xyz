module.exports = {
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true
  },
  parser: 'babel-eslint',
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier/react', 'prettier'],
  rules: {
    'no-unused-vars': [
      'error',
      { vars: 'all', varsIgnorePattern: '^_', args: 'all', argsIgnorePattern: '^_' }
    ]
  }
}
