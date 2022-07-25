import * as path from "path";
import {fileURLToPath} from "url";
import CopyPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "development", entry: "./src/client/pong.ts", devtool: "inline-source-map", module: {
    rules: [{
      test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/,
    }]
  }, resolve: {
    extensions: [".js", ".ts", ".tsx"]
  }, output: {
    filename: "bundle.js", path: path.resolve(__dirname, "dist/server/public"),
  }, plugins: [new CopyPlugin({
    patterns: [
      {
        from: "./src/client",
        globOptions: {
          ignore: ["**/*.js", "**/*.ts", "**/*.tsx"],
        }
      },
    ],
  }),]
};
