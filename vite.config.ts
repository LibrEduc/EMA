import path from "node:path";
import { defineConfig } from "vitest/config";

const ucbRoot = path.resolve(__dirname, "vendor/ucBlockly");

export default defineConfig({
  root: ".",
  publicDir: "public",
  resolve: {
    alias: {
      "µcBlockly/core": path.join(ucbRoot, "src/core/index.ts"),
      "µcBlockly/host": path.join(ucbRoot, "src/host/index.ts"),
      // Évite Monaco / shell démo si un import transitif pointe sur host trop large.
      "µcBlockly": path.join(ucbRoot, "src/core/index.ts"),
    },
    dedupe: ["blockly"],
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  test: {
    // Skip the submodule's own tests.
    include: ["src/**/*.test.ts"],
  },
  optimizeDeps: {
    include: [
      "blockly",
      "@blockly/continuous-toolbox",
      "@blockly/toolbox-search",
      "@blockly/block-plus-minus",
    ],
  },
});
