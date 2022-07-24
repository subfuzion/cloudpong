import * as path from "path";
//import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "development",
  entry: "./src/client/pong.js",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist/public"),
  },
  // plugins: [
  //   new NodePolyfillPlugin(),
  // ]
};
