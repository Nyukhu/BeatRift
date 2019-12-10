'use strict';

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

function resolve (dir) {
  return path.join(__dirname, '', dir)
}

module.exports = {
  mode: 'development',
  entry: './src/index.js',

  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },

  devServer: {
    hot: true,
    watchOptions: {
      poll: true
    }
  },

  module: {},

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([{
      from: resolve('./src/assets'),
      to: resolve('./dist/assets'),
      toType: 'dir'
    }])
  ]
}
