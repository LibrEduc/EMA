/**
 * @packageDocumentation
 * @module µcBlockly
 * @description Main entry point for the React-based µcBlockly standalone demo.
 * @remarks
 * React shell components live in `src/react-app/`; demo services remain under
 * `src/demo/`. Block definitions and generators are under `categories/` and
 * `generators/` — see docs/DEBUTER_CODE.md.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import "blockly";
import "./block_plus_minus_init";
import "@blockly/toolbox-search";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { registerToolboxSearchI18n } from "./toolbox_search_i18n";
import { exposeDemoGlobals } from "./demo/demo_globals";
import { ReactDemoApplication } from "./react-app/ReactDemoApplication";

registerToolboxSearchI18n();
exposeDemoGlobals();

export {
  registerContinuousToolboxComponents,
  unregisterContinuousToolboxComponents,
} from "./demo/continuous_toolbox";

const rootElement = document.getElementById("react-app-root");
if (!rootElement) {
  throw new Error("µcBlockly demo: missing React root element #react-app-root");
}
const reactRoot = createRoot(rootElement);
flushSync(() => reactRoot.render(createElement(ReactDemoApplication)));

/** Public API surface (same exports as before the workspace module split). */
export { LazyMonacoEditor, µcB_codeEditor, type MonacoThemeId } from "./code_editor";
export { µcB_workspaceOnResize } from "./workspace_resize";
export { µcB_addFlexResizerEvents } from "./workspace_flex";
