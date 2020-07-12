const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  filenameHashing: false,
  pages: {
    popup: {
      entry: "src/popup/popup.js",
      template: "src/popup/popup.html",
      filename: "popup.html",
      chunks: ["chunk-vendors", "chunk-common", "popup"]
    },
    options: {
      entry: "src/options/options.js",
      template: "src/options/options.html",
      filename: "options.html",
      chunks: ["chunk-vendors", "chunk-common", "options"]
    }
  },
  chainWebpack: config => {
    // No automatic preload
    config.plugins.delete("preload");
    // No automatic prefetch
    config.plugins.delete("prefetch");
  },
  configureWebpack: {
    devtool: "cheap-module-source-map",
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "src/manifest.json" },
          { from: "src/background.js" },
          { from: "src/inject.js" },
          { from: "src/assets/", to: "assets" },
          { from: "src/_locales/", to: "_locales" }
        ]
      })
    ]
  }
};
