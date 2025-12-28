/**
 * @packageDocumentation Webpack configuration file for local usage (file://).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import path from "path";
import { fileURLToPath } from 'url';
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration pour utilisation locale (file://)
const config = {
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
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
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    // Configuration Monaco pour utilisation locale avec publicPath relatif
    new MonacoWebpackPlugin({
      filename: "[name].worker.js",
      publicPath: "./",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./node_modules/blockly/media"),
          to: path.resolve(__dirname, "docs/media"),
        },
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "docs"),
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

