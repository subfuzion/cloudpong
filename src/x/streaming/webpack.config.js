const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./client.js",
  plugins: [
    new NodePolyfillPlugin(),
  ]
};
