/**
 * @packageDocumentation Webpack configuration file.
 * @author Blockly Team (https://github.com/google/blockly-samples/tree/master/examples/sample-app-ts)
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

// Base config that applies to either development or production mode.
let config = {
  entry: "./src/index.ts",
  output: {
    // Compile the source files into a bundle.
    filename: "bundle.[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
    assetModuleFilename: "assets/[name].[contenthash][ext][query]",
    path: path.resolve(__dirname, "dist/bundle"),
    clean: true,
  },
  // Enable webpack-dev-server to get hot refresh of the app.
  devServer: {
    static: "./build",
    compress: true,
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
        monaco: {
          test: /[\\/]node_modules[\\/]monaco-editor[\\/]/,
          name: "monaco",
          priority: 15,
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
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
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
    new MonacoWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./node_modules/blockly/media"),
          to: "media",
        },
        {
          from: path.resolve(__dirname, "public/assets"),
          to: "assets/[path][name].[contenthash][ext]",
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
};

export default (_env, argv) => {
  if (argv.mode === "development") {
    config.output.path = path.resolve(__dirname, "build");
    config.devtool = "eval-cheap-module-source-map";

    // Include the source maps for Blockly for easier debugging Blockly code.
    config.module.rules.push({
      test: /(blockly\/.*\.js)$/,
      use: [import.meta.resolve("source-map-loader")],
      enforce: "pre",
    });

    // Ignore spurious warnings from source-map-loader
    // It can't find source maps for some Closure modules and that is expected
    config.ignoreWarnings = [/Failed to parse source map/];
  }
  return config;
};
