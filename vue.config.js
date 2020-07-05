const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  filenameHashing: false,
  pages: {
    popup: {
      // entry for the page
      entry: 'src/popup/popup.js',
      // the source template
      template: 'src/popup/popup.html',
      // output as dist/index.html
      filename: 'popup.html',
      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      // title: 'Index Page',
      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'popup']
    },
    options: {
      entry: 'src/options/options.js',
      template: 'src/options/options.html',
      filename: 'options.html',
      chunks: ['chunk-vendors', 'chunk-common', 'options']
    }
  },
  configureWebpack: {
    devtool: 'cheap-module-source-map',
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'src/manifest.json' },
          { from: 'src/background.js' },
          { from: 'src/assets/', to: 'assets' },
          { from: 'src/_locales/', to: '_locales' }
        ]
      })
    ]
  }
}
