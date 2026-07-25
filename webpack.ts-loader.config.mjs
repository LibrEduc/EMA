/**
 * Shared ts-loader settings for webpack builds.
 * Type checking is done by `tsc` (build:lib); webpack only transpiles.
 * TypeScript version is pinned in package.json + overrides.
 */

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('ts-loader').Options} */
export const tsLoaderOptions = {
  configFile: path.resolve(__dirname, "tsconfig.webpack.json"),
  transpileOnly: true,
  compiler: "typescript",
};

export const tsLoaderUse = {
  loader: "ts-loader",
  options: tsLoaderOptions,
};
