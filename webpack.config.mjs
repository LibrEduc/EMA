/**
 * @packageDocumentation Webpack configuration file.
 * @author Blockly Team (https://github.com/google/blockly-samples/tree/master/examples/sample-app-ts)
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from "child_process";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import {
  monacoResolve,
  monacoWebpackPluginOptions,
} from "./monaco.webpack.config.mjs";
import { tsLoaderUse } from "./webpack.ts-loader.config.mjs";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import WebpackObfuscator from "webpack-obfuscator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readPackageVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
    );
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/**
 * Build fingerprint (watermark) for this build: version + git short hash + ISO date.
 * Injected at compile time; exposed in app for tracing / leak detection.
 */
function getBuildFingerprint() {
  const version = readPackageVersion();
  let gitHash = "";
  try {
    gitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch (_) {
    // not a git repo or git unavailable
  }
  const iso = new Date().toISOString();
  return [version, gitHash, iso].filter(Boolean).join("-");
}

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
  entry: {
    main: "./src/index.ts",
    embed: "./src/demo/embed_example.ts",
  },
  output: {
    // Compile the source files into a bundle.
    filename: (pathData) =>
      pathData.chunk?.name === "main"
        ? "bundle.[contenthash].js"
        : "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
    assetModuleFilename: "assets/[name].[contenthash][ext][query]",
    path: path.resolve(__dirname, "dist/bundle"),
    clean: true,
  },
  // Enable webpack-dev-server to get hot refresh of the app.
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, "build"),
      },
      {
        directory: path.resolve(__dirname, "public/assets"),
        publicPath: "/assets",
      },
    ],
    compress: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: tsLoaderUse,
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
    alias: {
      // package.json "module" points to missing ./src/index.js — force dist.
      "@blockly/field-bitmap$": path.resolve(
        __dirname,
        "node_modules/@blockly/field-bitmap/dist/index.js",
      ),
    },
    ...monacoResolve,
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
  performance: {
    hints: "warning",
    // Monaco workers are intentionally large; keep hints only for abnormal growth.
    maxEntrypointSize: 2 * 1024 * 1024,
    maxAssetSize: 13 * 1024 * 1024,
    assetFilter: (assetFilename) =>
      !/(^monaco\.|\.worker\.js$)/.test(
        assetFilename.replace(/^.*[\\/]/, ""),
      ),
  },
  plugins: [
    new webpack.DefinePlugin({
      __UCB_BUILD_FINGERPRINT__: JSON.stringify(getBuildFingerprint()),
      __UCB_APP_VERSION__: JSON.stringify(readPackageVersion()),
    }),
    new webpack.BannerPlugin({
      banner: () => {
        const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
        const v = pkg.version || "";
        return [
          "/*!",
          " * µcBlockly – " + (pkg.description || ""),
          " *",
          " * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany).",
          " * License: GPL-3.0-or-later. See https://www.gnu.org/licenses/gpl-3.0.html",
          " *",
          " * This program is free software; you may redistribute and/or modify it under the terms of the GPLv3.",
          " * Copying, reverse-engineering, or redistribution of this bundle outside the license terms is prohibited.",
          " *",
          " * " + (v ? "Version " + v + ". " : "") + "https://github.com/A-S-T-U-C-E/ucBlockly",
          " */",
        ].join("\n");
      },
      raw: true,
      entryOnly: true,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: "public/index.html",
      chunks: ["main"],
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
    new HtmlWebpackPlugin({
      template: "public/embed-example.html",
      filename: "embed-example.html",
      chunks: ["embed"],
      inject: "body",
    }),
    new MonacoWebpackPlugin(monacoWebpackPluginOptions),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./node_modules/blockly/media"),
          to: "media",
          globOptions: {
            ignore: ["**/Thumbs.db"],
          },
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
            ignore: ["**/index.html", "**/embed-example.html", "**/assets/**"],
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
  const isDevelopment = argv.mode === "development";
  const isProduction = argv.mode === "production";
  const isHardenedRelease = isProduction && process.env.UCB_HARDENED === "1";

  if (isDevelopment) {
    config.output.path = path.resolve(__dirname, "build");
    config.devtool = "eval-cheap-module-source-map";

    // Blockly + plugins exceed 2 MiB unminified; hints are kept for production only.
    config.performance = { hints: false };

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

  if (isProduction) {
    // Release bundles must not expose source maps.
    config.devtool = false;

    if (isHardenedRelease) {
      // Hardened production build:
      // 1) Terser avec options agressives (sans sourcemaps).
      // 2) Obfuscateur appliqué uniquement aux chunks applicatifs (pas aux vendors/monaco/workers).

      config.optimization.minimizer = [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            },
            compress: {
              passes: 3,
              dead_code: true,
              drop_console: true,
              drop_debugger: true,
              keep_fargs: false,
              unsafe: true,
              unsafe_arrows: true,
              unsafe_comps: true,
              unsafe_Function: true,
              unsafe_math: true,
              unsafe_methods: true,
              unsafe_proto: true,
              unsafe_regexp: true,
              unsafe_undefined: true,
            },
            mangle: {
              toplevel: true,
              properties: {
                regex: /^_\w+$/,
              },
            },
            keep_classnames: false,
            keep_fnames: false,
          },
        }),
      ];

      config.plugins.push(
        new WebpackObfuscator(
          {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: true,
            disableConsoleOutput: true,
            identifierNamesGenerator: "hexadecimal",
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            sourceMap: false,
            splitStrings: true,
            splitStringsChunkLength: 5,
            stringArray: true,
            stringArrayEncoding: ["rc4"],
            stringArrayThreshold: 1.0,
            transformObjectKeys: false,
            unicodeEscapeSequence: false,
            // Ne jamais toucher à certains identifiants critiques.
            reservedNames: [
              "^MonacoEnvironment$",
              "^getWorkerUrl$",
              "^Blockly$",
            ],
          },
          [
            // Ne PAS obfusquer les chunks critiques des dépendances.
            "blockly.*.js",
            "monaco.*.js",
            "vendors.*.js",
            "*.worker.js",
            "editor.worker.js",
            "ts.worker.js",
            "css.worker.js",
            "html.worker.js",
            "json.worker.js",
          ],
        ),
      );
    }
  }

  return config;
};
