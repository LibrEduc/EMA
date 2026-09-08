/**
 * @packageDocumentation
 * @module µcBlockly
 * @description Main entry point for µcBlockly standalone demo (orchestration only).
 * @remarks
 * Demo boot lives in `src/demo/*`. Block definitions / generators are under
 * `categories/` and `generators/` — see docs/DEBUTER_CODE.md.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Load Blockly (incl. standard blocks) before plus-minus overrides mutators.
import "blockly";
import "./block_plus_minus_init";
import "@blockly/toolbox-search";
import { registerToolboxSearchI18n } from "./toolbox_search_i18n";
registerToolboxSearchI18n();

import { exposeDemoGlobals } from "./demo/demo_globals";
exposeDemoGlobals();

import { registerUcBlocklyKernel } from "./core/register";
import { changeLanguageToolbox, getLangParamFromUrl } from "./language";
import {
  basic_toolbox,
  getToolboxWithoutBoardCategory,
} from "./toolbox";
import { BlocklyApplication } from "./blockly_application_type";
import "./css/index.css";
import "./css/µcBlockly.css";
import { registerWorkspaceForSvgResize } from "./workspace_resize";
import {
  reportMissingDemoShellDom,
  resolveDemoShellDom,
} from "./demo/demo_dom";
import {
  primeWorkspaceContainerDimensions,
  restoreLayoutFromSessionStorage,
} from "./demo/demo_layout";
import { startDemoLifecycle } from "./demo/demo_lifecycle";

export {
  registerContinuousToolboxComponents,
  unregisterContinuousToolboxComponents,
} from "./demo/continuous_toolbox";

const demoDom = resolveDemoShellDom();
if (!demoDom.ok) {
  reportMissingDemoShellDom(demoDom.missing);
  throw new Error(
    `µcBlockly demo: missing required DOM element(s): ${demoDom.missing.join(", ")}`,
  );
}

const elements = demoDom.elements;
elements.contentMonacoEditor.style.display = "none";

restoreLayoutFromSessionStorage();
registerUcBlocklyKernel();
primeWorkspaceContainerDimensions(elements);

const initialToolbox = getToolboxWithoutBoardCategory(basic_toolbox);
const µcB: BlocklyApplication = new BlocklyApplication(
  basic_toolbox,
  {
    grid: {
      spacing: 20,
      length: 3,
      colour: "#ccc",
      snap: true,
    },
    scrollbars: true,
    toolbox: changeLanguageToolbox(getLangParamFromUrl(), initialToolbox),
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 6,
      minScale: 0.1,
      scaleSpeed: 1.2,
      pinch: true,
    },
    trashcan: true,
    media: "./media/",
  },
  elements.workspaceContentBlockly,
  elements.contentCode,
);

µcB.LANGUAGE_NAME = {
  ar: "العربية",
  en: "english",
  es: "español",
  fr: "français",
};

µcB.LANGUAGE_RTL = ["ar", "fa", "he", "lki"];

registerWorkspaceForSvgResize(µcB.workspace);
startDemoLifecycle({ µcB, elements });

/** Public API surface (same exports as before the workspace module split). */
export { LazyMonacoEditor, µcB_codeEditor, type MonacoThemeId } from "./code_editor";
export { µcB_workspaceOnResize } from "./workspace_resize";
export { µcB_addFlexResizerEvents } from "./workspace_flex";
