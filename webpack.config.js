import * as path from "path";
import {fileURLToPath} from "url";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//webpack.compiler.hooks.beforeCompile;

export default env => {
  const mode = env.mode === "development" ? "development" : "production";

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
      // process.env.NODE_ENV
      new webpack.DefinePlugin({}),
    ],
    experiments: {
      topLevelAwait: true,
    },
    devServer: {
      client: {
        webSocketURL: "ws://0.0.0.0:8081",
      },
    },
  };
}

