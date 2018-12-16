const path = require('path')
const webpack = require('webpack')
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
    entry: { server: './src/server.js' },
    output: {
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
    entry: { client: './src/client/Main.js' },
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'app.js'
    },
    devtool,
    module: {
      rules: [jsLoader]
    },
    plugins: [new webpack.EnvironmentPlugin(['TIL_PRELOAD_WINDOW'])]
  }
]
