import * as path from "path";
import {fileURLToPath} from "url";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default env => {
  const mode = env.MODE === "development" ? "development" : "production";

  return {
    stats: "minimal",
    mode: mode,
    entry: "./src/client/app.ts",
    devtool: "inline-source-map",
    module: {
      rules: [
        {
          test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/,
        }
      ]
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx"]
    },
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist/server/public"),
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: "./src/client", globOptions: {
              ignore: ["**/*.js", "**/*.ts", "**/*.tsx"],
            }
          },
        ],
      }),
      // Defining mode: production | development (above) will automatically set
      // process.env.NODE_ENV (but let's set explicitly, so we don't need to
      // bring in nodejs support).
      new webpack.DefinePlugin({
        MODE: JSON.stringify(mode),
        PONGHOST: JSON.stringify(env.PONGHOST),
      }),
    ],
    experiments: {
      topLevelAwait: true,
    },
    devServer: {
      client: {
        reconnect: false,
        // webSocketURL: "ws://0.0.0.0:8081",
      },
    },
  };
}

