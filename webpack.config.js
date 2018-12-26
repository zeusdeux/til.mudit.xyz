const path = require('path')
const mode = 'production'
const devtool = 'source-map'
const jsLoader = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/react']
    }
  }
}

module.exports = [
  {
    // server
    mode,
    entry: {
      root: './api/root.js',
      getTils: './api/getTils.js',
      error: './api/error.js',
      app: './api/app.js'
    },
    output: {
      libraryTarget: 'commonjs',
      path: path.resolve(__dirname, 'lambda'),
      filename: '[name]-bundle.js'
    },
    target: 'node',
    devtool,
    module: {
      rules: [jsLoader]
    }
  },
  {
    // client
    mode,
    entry: { client: './client/Main.js' },
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'app.js'
    },
    devtool,
    module: {
      rules: [jsLoader]
    }
  }
]
