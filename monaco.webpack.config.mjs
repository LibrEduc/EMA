/**
 * Shared Monaco Editor settings for webpack builds.
 * µcBlockly only needs C++ syntax highlighting in the generated code panel.
 */

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
    "monaco-editor": "monaco-editor/esm/vs/editor/editor.api.js",
  },
};
