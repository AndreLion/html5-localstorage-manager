const CopyPlugin = require("copy-webpack-plugin");
const terser = require('terser');
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  filenameHashing: false,
  productionSourceMap: !isProd,
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
    mode: process.env.NODE_ENV,
    devtool: "cheap-module-source-map",
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "src/manifest.json" },
          {
            from: "src/background.js",
            transform: isProd ? content => terser.minify(content.toString()).code : undefined
          },
          {
            from: "src/inject.js",
            transform: isProd ? content => terser.minify(content.toString()).code : undefined
          },
          { from: "src/assets/", to: "assets" }
        ]
      })
    ]
  }
};
