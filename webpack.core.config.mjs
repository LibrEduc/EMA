/**
 * Webpack config for the µcBlockly **kernel embed bundle** (no Monaco, no demo shell).
 * Output: `dist/core/` — static embed page + JS + Blockly media.
 */

import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { tsLoaderUse } from "./webpack.ts-loader.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shareableProceduresSrc = path.resolve(
  __dirname,
  "node_modules/@blockly/block-shareable-procedures/src",
);

/** @param {unknown} _env @param {{ mode?: string }} argv */
export default (_env, argv) => {
  const isDevelopment = argv.mode === "development";

  return {
    entry: {
      embed: "./src/demo/embed_example.ts",
    },
    output: {
      filename: "[name].[contenthash].js",
      chunkFilename: "[name].[contenthash].js",
      path: path.resolve(__dirname, "dist/core"),
      clean: true,
    },
    devtool: isDevelopment ? "eval-cheap-module-source-map" : false,
    devServer: {
      static: [
        { directory: path.resolve(__dirname, "build") },
        { directory: path.resolve(__dirname, "dist/core") },
      ],
      compress: true,
      port: 8081,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: tsLoaderUse,
          include: shareableProceduresSrc,
        },
        {
          test: /\.tsx?$/,
          use: tsLoaderUse,
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "@blockly/block-shareable-procedures$": path.join(
          shareableProceduresSrc,
          "index.ts",
        ),
        // package.json "module" points to missing ./src/index.js — force dist.
        "@blockly/field-bitmap$": path.resolve(
          __dirname,
          "node_modules/@blockly/field-bitmap/dist/index.js",
        ),
      },
    },
    optimization: {
      runtimeChunk: "single",
      moduleIds: "deterministic",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          blockly: {
            test: /[\\/]node_modules[\\/](blockly|@blockly)[\\/]/,
            name: "blockly",
            priority: 20,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    },
    performance: {
      hints: isDevelopment ? false : "warning",
      maxEntrypointSize: 2 * 1024 * 1024,
      maxAssetSize: 2 * 1024 * 1024,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "public/embed-example.html",
        filename: "index.html",
        chunks: ["embed"],
        inject: "body",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "./node_modules/blockly/media"),
            to: "media",
            globOptions: { ignore: ["**/Thumbs.db"] },
          },
        ],
      }),
      new webpack.ProvidePlugin({
        Blockly: "blockly",
      }),
    ],
  };
};
