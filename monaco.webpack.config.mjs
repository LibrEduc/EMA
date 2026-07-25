/**
 * Shared Monaco Editor settings for webpack builds.
 * µcBlockly only needs C++ syntax highlighting in the generated code panel.
 *
 * Monaco 0.56+ package exports remap `./*.js` → `./esm/vs/*.js`, so an alias like
 * `monaco-editor/esm/vs/editor/editor.api.js` resolves to a doubled path and fails.
 * Point the alias at the absolute file instead.
 */

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to the lightweight Monaco editor API entry. */
const monacoEditorApi = path.resolve(
  __dirname,
  "node_modules/monaco-editor/esm/vs/editor/editor.api.js",
);

/** @type {import('monaco-editor-webpack-plugin').IOptions} */
export const monacoWebpackPluginOptions = {
  languages: ["cpp"],
  features: [
    "!codelens",
    "!colorPicker",
    "!diffEditor",
    "!diffEditorBreadcrumbs",
    "!gotoSymbol",
    "!inlineCompletions",
    "!inlayHints",
    "!linkedEditing",
    "!parameterHints",
    "!quickCommand",
    "!quickOutline",
    "!referenceSearch",
    "!rename",
    "!semanticTokens",
    "!snippet",
    "!stickyScroll",
    "!suggest",
    "!toggleHighContrast",
    "!toggleTabFocusMode",
    "!unicodeHighlighter",
  ],
};

/** @type {import('webpack').Configuration['resolve']} */
export const monacoResolve = {
  alias: {
    "monaco-editor": monacoEditorApi,
  },
};
