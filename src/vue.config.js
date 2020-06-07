// vue.config.js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  outputDir: '../dist',
  filenameHashing: false,
  pages: {
    popup: {
      entry: 'pages/popup.js',
      template: 'pages/popup.html',
      filename: 'popup.html',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    options: {
      entry: 'pages/options.js',
      template: 'pages/options.html',
      filename: 'options.html',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'manifest.json', to: '../dist' },
          { from: 'assets', to: '../dist/assets' },
          { from: '_locales', to: '../dist/_locales' }
        ],
      }),
    ]
  }
}
