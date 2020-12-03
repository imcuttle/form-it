const nps = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { packagePrefix } = require('../package.json')

const resolveApp = (...arg) => nps.join(__dirname, '..', ...arg)
const resolveExample = (...arg) => resolveApp('example', ...arg)

module.exports = {
  context: resolveApp(),
  entry: {
    example: resolveExample('src/index')
  },
  mode: 'development',
  resolve: {
    alias: {
      [packagePrefix.slice(0, -1)]: resolveApp('packages')
    },
    extensions: ['.json', '.js', '.jsx', '.ts', '.tsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader', options: { lessOptions: { javascriptEnabled: true } } }
        ]
      },
      {
        test: /\.(scss|sass)$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }]
      }
    ]
  }
}
