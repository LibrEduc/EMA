/**
 * @packageDocumentation Webpack configuration file for local usage (file://).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import path from "path";
import { fileURLToPath } from 'url';
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import {
  monacoResolve,
  monacoWebpackPluginOptions,
} from "./monaco.webpack.config.mjs";
import CopyPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolvePublicAsset = (compilation, assetName) => {
  const normalized = assetName.replace(/^\/+/, "").replaceAll("\\", "/");
  const extension = path.extname(normalized);
  const baseName = normalized.slice(0, -extension.length);
  const match = compilation
    .getAssets()
    .find(
      (asset) =>
        asset.name.startsWith(`assets/${baseName}.`) &&
        asset.name.endsWith(extension)
    );

  if (!match) {
    return "";
  }

  const publicPath = compilation.outputOptions.publicPath;
  if (!publicPath || publicPath === "auto") {
    return match.name;
  }

  return `${publicPath}${match.name}`.replace(/\/{2,}/g, "/");
};

// Configuration pour utilisation locale (file://)
const config = {
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    assetModuleFilename: "assets/[name].[contenthash][ext][query]",
    path: path.resolve(__dirname, "dist/bundle"),
    publicPath: "./",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico|woff2?|eot|ttf|otf)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    ...monacoResolve,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
      templateParameters: (compilation, assets, assetTags, options) => ({
        compilation,
        webpackConfig: compilation.options,
        htmlWebpackPlugin: {
          tags: assetTags,
          files: assets,
          options,
        },
        publicAsset: (name) => resolvePublicAsset(compilation, name),
      }),
    }),
    // Configuration Monaco pour utilisation locale avec publicPath relatif
    new MonacoWebpackPlugin({
      ...monacoWebpackPluginOptions,
      filename: "[name].worker.js",
      publicPath: "./",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./node_modules/blockly/media"),
          to: "media",
        },
        {
          from: path.resolve(__dirname, "public/assets"),
          to: "assets/[name][ext]",
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(__dirname, "public"),
          to: ".",
          globOptions: {
            ignore: ["**/index.html", "**/assets/**"],
          },
        },
      ],
    }),
    // Exposer Blockly globalement
    new webpack.ProvidePlugin({
      Blockly: 'blockly',
    }),
  ],
  mode: "production",
  optimization: {
    minimize: false,
  },
};

export default config;

