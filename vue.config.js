const CopyPlugin = require("copy-webpack-plugin");
const terser = require('terser');

module.exports = {
  filenameHashing: false,
  productionSourceMap: false,
  pages: {
    popup: {
      entry: "src/popup/popup.js",
      template: "src/popup/popup.html",
      filename: "popup.html",
      chunks: ["chunk-vendors", "chunk-common", "popup"]
    }
  },
  chainWebpack: config => {
    // No automatic preload
    config.plugins.delete("preload");
    // No automatic prefetch
    config.plugins.delete("prefetch");
  },
  configureWebpack: {
    mode: 'production',
    devtool: "cheap-module-source-map",
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "src/manifest.json" },
          {
            from: "src/background.js",
            transform: content => terser.minify(content.toString()).code
          },
          {
            from: "src/inject.js",
            transform: content => terser.minify(content.toString()).code
          },
          { from: "src/assets/", to: "assets" },
          { from: "src/_locales/", to: "_locales" }
        ]
      })
    ]
  }
};
