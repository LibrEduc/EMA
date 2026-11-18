import path from "node:path";
import { defineConfig } from "vitest/config";

const ucbRoot = path.resolve(__dirname, "vendor/ucBlockly");
/** GitHub Pages projet : https://<org>.github.io/EMA/ */
const base = process.env.GITHUB_PAGES === "true" ? "/EMA/" : "/";

/** Silence le warning Vite sur `import(url)` runtime des extensions µcBlockly. */
function viteIgnoreUcBlocklyDynamicImports() {
  return {
    name: "ema-vite-ignore-ucb-dynamic-import",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!id.replace(/\\/g, "/").includes("/vendor/ucBlockly/src/extensions/io_http.ts")) {
        return null;
      }
      if (code.includes("@vite-ignore")) {
        return null;
      }
      return {
        code: code.replace(
          "/* webpackIgnore: true */",
          "/* webpackIgnore: true */ /* @vite-ignore */",
        ),
        map: null,
      };
    },
  };
}

export default defineConfig({
  base,
  root: ".",
  publicDir: "public",
  plugins: [viteIgnoreUcBlocklyDynamicImports()],
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
    // Without it, Vite scans every HTML file, including the Electron build in dist-electron/.
    entries: ["index.html"],
    include: [
      "blockly",
      "@blockly/continuous-toolbox",
      "@blockly/toolbox-search",
      "@blockly/block-plus-minus",
    ],
  },
});
