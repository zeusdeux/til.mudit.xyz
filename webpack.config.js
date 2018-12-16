const path = require('path')
const isProd = process.env.NODE_ENV === 'production'
const mode = isProd ? 'production' : 'development'
const devtool = isProd ? 'source-map' : 'eval'
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
    }
  }
]
