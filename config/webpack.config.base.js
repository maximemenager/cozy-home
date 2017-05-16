'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const PostCSSAssetsPlugin = require('postcss-assets-webpack-plugin')

const {extractor, production} = require('./webpack.vars')
const pkg = require(path.resolve(__dirname, '../package.json'))

module.exports = {
  entry: {
    app: './src',
    services: './src/services.jsx'
  },
  output: {
    filename: '[name].js'
  },
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['', '.js', '.json', '.css']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|cozy-(bar|client-js))/,
        loader: 'babel-loader'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.css$/,
        loader: extractor.extract('style', [
          'css-loader?importLoaders=1',
          'postcss-loader'
        ])
      }
    ],
    noParse: [
      /localforage\/dist/
    ]
  },
  postcss: () => {
    return [
      require('autoprefixer')(['last 2 versions'])
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.ejs'),
      title: pkg.name,
      inject: 'head',
      excludeChunks: ['services'],
      minify: {
        collapseWhitespace: true
      }
    }),
    new HtmlWebpackPlugin({
      template: 'src/services.ejs',
      title: `${pkg.name} services`,
      filename: 'services/index.html',
      inject: false,
      chunks: ['services'],
      minify: {
        collapseWhitespace: true
      }
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    }),
    extractor,
    new PostCSSAssetsPlugin({
      test: /\.css$/,
      plugins: [
        require('css-mqpacker'),
        require('postcss-discard-duplicates'),
        require('postcss-discard-empty')
      ].concat(
        production ? require('csswring')({preservehacks: true, removeallcomments: true}) : []
      )
    })
  ]
}
