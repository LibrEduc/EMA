/**
 * @packageDocumentation
 * @module µcBlockly
 * @description Main entry point for µcBlockly application
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {@link https://www.gnu.org/licenses/}.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import * as monaco from "monaco-editor";
import "@blockly/block-plus-minus";
import "@blockly/toolbox-search";

import { arduinoGenerator } from "./generators/arduino";
import {
  HTML_populateLanguages,
  changeLanguageToolbox,
  getLangParamFromUrl,
} from "./language";
import { setPluginsInURL } from "./tools";
import { basic_toolbox } from "./toolbox";
import { BlocklyApplication } from "./blockly_application_type";
//plugins
import { ContentHighlight } from "@blockly/workspace-content-highlight";
import {
  ContinuousCategory,
  ContinuousFlyout,
  ContinuousMetrics,
  ContinuousToolbox,
  RecyclableBlockFlyoutInflater,
} from "@blockly/continuous-toolbox";

import "./css/index.css";
import "./css/µcBlockly.css";

// Cache DOM elements
const elements = {
  workspaceContentArea: document.getElementById("div_workspace_content_area")!,
  workspaceContentBlockly: document.getElementById(
    "div_workspace_content_blockly",
  )!,
  contentCode: document.getElementById("div_content_code")!,
  contentMonacoEditor: document.getElementById("div_content_monacoEditor")!,
  languageMenu: document.getElementById("languageMenu") as HTMLSelectElement,
  themeMenu: document.getElementById("themeMenu") as HTMLSelectElement,
  rendererMenu: document.getElementById("rendererMenu") as HTMLSelectElement,
  pluginMinimap: document.getElementById("pluginMinimap") as HTMLInputElement,
  pluginKeyboardNav: document.getElementById(
    "pluginKeyboardNav",
  ) as HTMLInputElement,
  pluginHighlight: document.getElementById(
    "pluginHighlight",
  ) as HTMLInputElement,
  pluginContinuousToolbox: document.getElementById(
    "pluginContinuousToolbox",
  ) as HTMLInputElement,
  alwaysOpenedToolboxFlyout: document.getElementById(
    "alwaysOpenedToolboxFlyout",
  ) as HTMLInputElement,
  codeEditorSwitch: document.getElementById(
    "codeEditorSwitch",
  ) as HTMLInputElement,
};

// Verify all required elements exist
const requiredElements = [
  "div_workspace_content_area",
  "div_workspace_content_blockly",
  "div_content_code",
  "div_content_monacoEditor",
  "languageMenu",
  "themeMenu",
  "rendererMenu",
  "pluginMinimap",
  "pluginKeyboardNav",
  "pluginHighlight",
  "pluginContinuousToolbox",
  "codeEditorSwitch",
];

requiredElements.forEach((id) => {
  if (!document.getElementById(id)) {
    console.error(`Required element with id '${id}' not found in DOM`);
  }
});

// Initialize Monaco Editor
export const µcB_codeEditor = monaco.editor.create(
  elements.contentMonacoEditor,
  {
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    language: "cpp",
    lineNumbers: "on",
    readOnly: false,
    scrollBeyondLastLine: false,
  },
);
if (elements.contentMonacoEditor) {
  elements.contentMonacoEditor.style.display = "none";
}

// Initialize Blockly Application
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
    toolbox: changeLanguageToolbox(getLangParamFromUrl(), basic_toolbox),
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
  },
  elements.workspaceContentBlockly,
);

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
µcB.LANGUAGE_NAME = {
  ar: "العربية",
  en: "English",
  es: "Español",
  fr: "Français",
};

/**
 * List of RTL languages.
 */
µcB.LANGUAGE_RTL = ["ar", "fa", "he", "lki"];

/**
 * Handles the resizing of the workspace.
 * This function calculates the offset position of the workspace content area,
 * and assigns these values, along with its width and height, to the workspace content blockly.
 * It then triggers a resize event on the Blockly workspace.
 */
export const µcB_workspaceOnResize = (): void => {
  if (!elements.workspaceContentArea || !elements.workspaceContentBlockly) {
    console.warn("Workspace elements not found, skipping resize");
    return;
  }

  let { offsetLeft: x, offsetTop: y } = elements.workspaceContentArea;
  let element: HTMLElement = elements.workspaceContentArea;
  while (element.offsetParent) {
    element = element.offsetParent as HTMLElement;
    x += element.offsetLeft;
    y += element.offsetTop;
  }
  const { offsetWidth: width, offsetHeight: height } =
    elements.workspaceContentArea;
  Object.assign(elements.workspaceContentBlockly.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${x}px`,
    top: `${y}px`,
  });
  Blockly.svgResize(µcB.workspace as Blockly.WorkspaceSvg);
};

/**
 * The function `µcB_workspaceManageResize` adjusts the flex grow values of two elements based on mouse
 * movement for workspace management.
 * @param mouseDown - The `mouseDown` parameter in the `µcB_workspaceManageResize` function
 * represents the mouse down event that triggers the resizing action. It contains information about the
 * initial mouse position and other related data when the mouse button is pressed down.
 * @param sizeProp - The `sizeProp` parameter in the `µcB_workspaceManageResize` function
 * represents the property that holds the size value of the elements being resized. It is used to
 * access the size value of the elements dynamically during the resizing operation.
 * @param posProp - The `posProp` parameter in the `µcB_workspaceManageResize` function
 * represents the property that stores the position information used for resizing elements. It could be
 * either "pageX" or "pageY" depending on whether the resizing is horizontal or vertical.
 * @returns In the provided code snippet, the `µcB_workspaceManageResize` function does not explicitly
 * return any value. It is a function that handles mouse events for resizing elements on a workspace.
 * The function contains event listeners for mouse movement and mouse button release, but it does not
 * have a return statement that would return a specific value.
 */
const µcB_workspaceManageResize = (
  mouseDown: Event,
  sizeProp: string,
  posProp: string,
): void => {
  const recall: HTMLElement = mouseDown.target as HTMLElement;
  const prev = recall?.previousElementSibling as HTMLInputElement | null;
  const next = recall?.nextElementSibling as HTMLInputElement | null;
  if (!prev || !next) {
    return;
  }
  mouseDown.preventDefault();
  interface IElement {
    [key: string]: string;
  }
  let prevSize: number = Number((prev as unknown as IElement)[sizeProp]);
  let nextSize: number = Number((next as unknown as IElement)[sizeProp]);
  const sumSize: number = prevSize + nextSize;
  const prevGrow: number = Number(prev.style.flexGrow);
  const nextGrow: number = Number(next.style.flexGrow);
  const sumGrow: number = prevGrow + nextGrow;
  let lastPos: number = Number((mouseDown as unknown as IElement)[posProp]);

  /**
   * The function `onMouseMove` adjusts the flex grow values of two elements based on the mouse
   * movement.
   * @param mouseMove - The parameter "mouseMove" represents the mouse move event object. It contains
   * information about the mouse position and other related data.
   */
  const onMouseMove = (mouseMove: Event): void => {
    let pos: number = Number((mouseMove as unknown as IElement)[posProp]);
    const difference: number = pos - lastPos;
    prevSize += difference;
    nextSize -= difference;
    if (prevSize < 0) {
      nextSize += prevSize;
      pos -= prevSize;
      prevSize = 0;
    }
    if (nextSize < 0) {
      prevSize += nextSize;
      pos += nextSize;
      nextSize = 0;
    }
    const prevGrowNew: number = sumGrow * (prevSize / sumSize);
    const nextGrowNew: number = sumGrow * (nextSize / sumSize);
    prev.style.flexGrow = String(prevGrowNew);
    next.style.flexGrow = String(nextGrowNew);
    lastPos = pos;
    µcB_workspaceOnResize();
  };

  /**
   * The function `onMouseUp` sets the cursor style and removes event listeners when the mouse button
   * is released.
   */
  const onMouseUp = (): void => {
    const html = document.querySelector("html") as HTMLElement;
    html.style.cursor = "default";
    if (String(posProp) === "pageX") {
      recall.style.cursor = "ew-resize";
    } else {
      recall.style.cursor = "ns-resize";
    }
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

/**
 * The function `µcB_addFlexResizerEvents` adds event listeners for resizing elements horizontally or
 * vertically based on their parent's class.
 * @returns In the provided code snippet, the `µcB_addFlexResizerEvents` function is returning `void`,
 * which means it does not return any value. The function sets up event listeners for mouse events on
 * the document body, specifically for the "mousedown" event. When the mouse is clicked, it checks if
 * the target element is a "FLEX-RESIZER" element and then performs certain
 */
export const µcB_addFlexResizerEvents = (): void => {
  document.body.addEventListener("mousedown", function (mouseDown: Event) {
    const html = document.querySelector("html") as HTMLElement;
    const mouseTarget = mouseDown.target as HTMLElement;
    if (mouseTarget.nodeType !== 1 || mouseTarget.tagName !== "FLEX-RESIZER") {
      return;
    }
    const parentNode = mouseTarget.parentNode as HTMLElement;
    const resizeHorizontal: boolean =
      parentNode.classList.contains("wrapper_element");
    const resizeVertical: boolean =
      parentNode.classList.contains("wrapper_global");
    if (resizeHorizontal && resizeVertical) {
      return;
    } else if (resizeHorizontal) {
      mouseTarget.style.cursor = "col-resize";
      html.style.cursor = "col-resize"; // avoid cursor's flickering
      µcB_workspaceManageResize(mouseDown, "offsetWidth", "pageX");
    } else if (resizeVertical) {
      mouseTarget.style.cursor = "row-resize";
      html.style.cursor = "row-resize"; // avoid cursor's flickering
      µcB_workspaceManageResize(mouseDown, "offsetHeight", "pageY");
    }
    Blockly.svgResize(µcB.workspace as Blockly.WorkspaceSvg);
  });
};

export const registerContinuousToolboxComponents = (): void => {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    ContinuousCategory,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.METRICS_MANAGER,
    "ContinuousMetrics",
    ContinuousMetrics,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
    "ContinuousFlyout",
    ContinuousFlyout,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX,
    "ContinuousToolbox",
    ContinuousToolbox,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "block",
    RecyclableBlockFlyoutInflater,
    true,
  );

  // Ajouter les styles CSS pour surcharger l'apparence de la toolbox
  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 auto 0.125rem;
      border-radius: 100%;
      border: 1px solid;
      width: 1.25rem;
      height: 1.25rem;
    }
    .blocklyToolboxCategory {
      height: initial;
      padding: 3px 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: column;
    }
    .blocklyTreeLabel {
      margin: auto;
    }
    .blocklyToolboxCategoryLabel {
      text-align: center;
    }
  `;
  document.head.appendChild(style);
};

export const unregisterContinuousToolboxComponents = (): void => {
  // Supprimer les styles CSS personnalisés pour revenir au style normal de Blockly
  const customStyles = document.querySelectorAll("style");
  customStyles.forEach((style) => {
    if (style.textContent?.includes(".categoryBubble")) {
      style.remove();
    }
  });
  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 0.5rem 0 0;
      border-radius: 0%;
      width: 8px;
      height: -webkit-fill-available;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  `;
  document.head.appendChild(style);
};
/**
 * The function `HTML_onChange` sets up event listeners for the `onchange` event of HTML select
 * elements and calls corresponding functions based on the selected values.
 */
const HTML_onChange = (): void => {
  elements.languageMenu.onchange = () => {
    const rtl: boolean = µcB.changeLanguage(true);
    µcB.WORKSPACE_OPTIONS["rtl"] = rtl;
    µcB.workspaceReboot();
  };

  elements.themeMenu.onchange = () => {
    µcB.changeTheme(elements.themeMenu.value);
  };

  elements.rendererMenu.onchange = () => {
    µcB.changeRenderer(elements.rendererMenu.value);
  };

  elements.pluginMinimap.onchange = () => {
    const minimap = document.getElementsByClassName(
      "blockly-minimap",
    )[0] as HTMLElement;
    if (minimap) {
      minimap.style.visibility = elements.pluginMinimap.checked
        ? "visible"
        : "hidden";
    }
    setPluginsInURL("pluginMinimap", "minimap");
  };

  elements.pluginKeyboardNav.onchange = () => {
    setPluginsInURL("pluginKeyboardNav", "keybnav");
  };

  elements.pluginHighlight.onchange = () => {
    if (elements.pluginHighlight.checked) {
      µcB.plugin_contentHighlight = new ContentHighlight(µcB.workspace);
      µcB.plugin_contentHighlight.init();
    } else {
      µcB.plugin_contentHighlight.dispose();
    }
    setPluginsInURL("pluginHighlight", "highlight");
  };

  elements.pluginContinuousToolbox.onchange = () => {
    if (elements.pluginContinuousToolbox.checked) {
      registerContinuousToolboxComponents();
      µcB.WORKSPACE_OPTIONS["plugins"] = {
        flyoutsVerticalToolbox: "ContinuousFlyout",
        metricsManager: "ContinuousMetrics",
        toolbox: "ContinuousToolbox",
      };
    } else {
      unregisterContinuousToolboxComponents();
      delete µcB.WORKSPACE_OPTIONS["plugins"];
    }
    setPluginsInURL("pluginContinuousToolbox", "ctoolbox");
    µcB.workspaceReboot();
  };

  elements.alwaysOpenedToolboxFlyout.onchange = () => {
    const flyout = (µcB.workspace as Blockly.WorkspaceSvg)
      .getToolbox()!
      .getFlyout();
    (flyout as Blockly.Flyout).setAutoClose(
      !elements.alwaysOpenedToolboxFlyout.checked,
    );
    (flyout as Blockly.Flyout).autoHide(
      !elements.alwaysOpenedToolboxFlyout.checked,
    );
    if (elements.alwaysOpenedToolboxFlyout.checked)
      (flyout as Blockly.Flyout).setVisible(true);
  };

  elements.codeEditorSwitch.onchange = () => {
    if (elements.codeEditorSwitch.checked) {
      if (elements.contentCode) elements.contentCode.style.display = "none";
      if (elements.contentMonacoEditor) {
        elements.contentMonacoEditor.style.display = "block";
        elements.contentMonacoEditor.style.height = "100%";
        elements.contentMonacoEditor.style.width = "100%";
      }
    } else {
      if (elements.contentCode) elements.contentCode.style.display = "block";
      if (elements.contentMonacoEditor) {
        elements.contentMonacoEditor.style.display = "none";
      }
    }
    setPluginsInURL("codeEditorSwitch", "codeEditor");
  };
};

/**
 * Collection of functions ordered by priority: 1.DOM - 2.inside DOM - 3.inside window
 */

/**
 * The `DomIsLoaded` function waits for the DOM to be ready and then executes a callback function.
 * @param callback - The parameter "callback" is a callback function that will be executed when the DOM
 * is ready.
 */
const DomIsLoaded = (callback: () => void): void => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};
// The `DomIsLoaded` function prepares everything needed by structure of DOM.
DomIsLoaded((): void => {
  HTML_populateLanguages(µcB);
  µcB.changeLanguage(false);
  µcB.workspaceInit();
});

/* The `window.onload` event is triggered when the entire page has finished loading, including all
resources such as images and scripts. */
window.onload = (): void => {
  HTML_onChange();
  const code = arduinoGenerator.workspaceToCode(µcB.workspace);
  µcB_codeEditor.setValue(code);
  if (elements.contentCode) {
    elements.contentCode.textContent = code;
  }

  // Restore saved layout
  const layoutElements = {
    flexContainerUp: document.getElementById(
      "flex_container_up",
    ) as HTMLElement,
    flexContainerUpLeft: document.getElementById(
      "flex_container_up_left",
    ) as HTMLElement,
    flexContainerUpRight: document.getElementById(
      "flex_container_up_right",
    ) as HTMLElement,
    flexContainerBottom: document.getElementById(
      "flex_container_bottom",
    ) as HTMLElement,
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    const savedValue = window.sessionStorage.getItem(key);
    if (savedValue && element) {
      element.style.flex = savedValue;
    }
  });

  µcB.workspaceSetupPlugins(false);

  // Initialize minimap
  const minimap = document.getElementsByClassName(
    "blockly-minimap",
  )[0] as HTMLElement;
  if (minimap) {
    minimap.style.visibility = "hidden";
    elements.pluginMinimap.checked = false;
  }

  // Initialize toolbox categories
  const categories = Array.from(
    document.getElementsByClassName(
      "blocklyTreeRowContentContainer",
    ) as HTMLCollectionOf<HTMLElement>,
  );
  categories.forEach((category) => {
    category.style.flexDirection = "row";
  });

  const toolboxContents = document.getElementsByClassName(
    "blocklyToolboxContents",
  )[0] as HTMLElement;
  if (toolboxContents) {
    toolboxContents.style.alignItems = "start";
  }

  µcB_workspaceOnResize();
  µcB.setParamsBlockly();
  µcB.workspaceLoadBlocks("mainWorkspace_blocks");
  (µcB.workspace as Blockly.WorkspaceSvg).scrollCenter();
  µcB.pluginsSetupWorkspace();
};

/* The above code is a TypeScript code snippet that sets the `onbeforeunload` event handler for the
window object. This event is triggered when the user is about to leave the current page, and save windows position in UI. */
window.onbeforeunload = (): void => {
  const layoutElements = {
    flexContainerUp: document.getElementById(
      "flex_container_up",
    ) as HTMLElement,
    flexContainerUpLeft: document.getElementById(
      "flex_container_up_left",
    ) as HTMLElement,
    flexContainerUpRight: document.getElementById(
      "flex_container_up_right",
    ) as HTMLElement,
    flexContainerBottom: document.getElementById(
      "flex_container_bottom",
    ) as HTMLElement,
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    if (element && window.sessionStorage) {
      window.sessionStorage.setItem(key, element.style.flex);
    }
  });

  µcB.workspaceSaveBlocks("mainWorkspace_blocks");
  µcB.workspaceSetupPlugins(true);
};
