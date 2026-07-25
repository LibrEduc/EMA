/**
 * @packageDocumentation
 * @module µcBlockly
 * @description Main entry point for µcBlockly application
 * @remarks
 * Bootstraps Blockly, registers blocks, and wires UI event handlers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/** Injected at build time by Webpack DefinePlugin (watermark for leak detection). */
declare const __UCB_BUILD_FINGERPRINT__: string | undefined;

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
import "./block_plus_minus_init";
import "@blockly/toolbox-search";
import { registerToolboxSearchI18n } from "./toolbox_search_i18n";
registerToolboxSearchI18n();

// Monaco Editor configuration for local use (relative paths)
// Force MonacoEnvironment definition so that paths are correct
const globalWindow = window as Window & {
  MonacoEnvironment?: {
    getWorkerUrl: (moduleId: string, label: string) => string;
  };
  Blockly?: typeof Blockly;
  /** Build fingerprint (version-gitHash-date); set at build time for tracing. */
  __ucbBuildFingerprint__?: string;
};

// Expose build fingerprint (watermark) for support / leak detection
if (typeof __UCB_BUILD_FINGERPRINT__ !== "undefined") {
  globalWindow.__ucbBuildFingerprint__ = __UCB_BUILD_FINGERPRINT__;
}

globalWindow.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: string, _label: string) {
    return "./editor.worker.js";
  },
};

// Expose Blockly globally (subset used by external scripts / debugging).
if (typeof window !== 'undefined') {
  globalWindow.Blockly = {
    ...Blockly,
    Blocks: Blockly.Blocks,
    VERSION: Blockly.VERSION,
    inject: Blockly.inject,
    Workspace: Blockly.Workspace,
    WorkspaceSvg: Blockly.WorkspaceSvg,
    svgResize: Blockly.svgResize,
    registry: Blockly.registry,
    ToolboxCategory: Blockly.ToolboxCategory,
    Names: Blockly.Names,
    Variables: Blockly.Variables,
    utils: Blockly.utils,
  };
  debugLog('✅ Blockly and all its properties exposed globally');
  debugLog('Available properties:', Object.keys(globalWindow.Blockly));
}

import { arduinoGenerator } from "./generators/arduino";
import { refreshBoardPinDropdowns } from "./categories/blockly";
import { registerUcBlocklyKernel } from "./core/register";
import {
  applyBlockDebugMetadata,
  installBlockDebugContextMenu,
} from "./block_debug_context_menu";
import { debugLog } from "./generators/arduino/debug";
import {
  HTML_populateLanguages,
  changeLanguageToolbox,
  getLangParamFromUrl,
  HTML_changeLanguage,
} from "./language";
import { languagesMap } from "./languages/languageMap";
import { getBoardFamilyMessageKey, getShellMessage } from "./shell_messages";
import { BOARD_PROFILES, DEFAULT_BOARD_ID } from "./boards";
import { syncUiPaletteTheme } from "./ui_palette_theme";

// Expose arduinoGenerator globally IMMEDIATELY after import
if (typeof window !== 'undefined') {
  // Expose arduinoGenerator and its main properties
  const exposedArduinoGenerator = arduinoGenerator;
  (globalWindow as typeof globalWindow & {
    arduinoGenerator?: typeof arduinoGenerator;
  }).arduinoGenerator = exposedArduinoGenerator;

  debugLog('✅ arduinoGenerator and all its properties exposed globally');
  debugLog('Available arduinoGenerator properties:', Object.keys(exposedArduinoGenerator));
}
import { pushStateReplaceSearchParam, setPluginsInURL } from "./tools";
import { basic_toolbox, getToolboxForCurrentBoard, getToolboxWithoutBoardCategory } from "./toolbox";
import { BlocklyApplication } from "./blockly_application_type";
//plugins
import {
  ContinuousCategory,
  ContinuousFlyout,
  ContinuousToolbox,
  RecyclableBlockFlyoutInflater,
} from "@blockly/continuous-toolbox";
import { ContinuousMetricsOverlayFlyout } from "./continuous_metrics_overlay_flyout";
import "./css/index.css";
import "./css/µcBlockly.css";

import { getA11yLabel } from "./a11y_labels";
import { registerShellBlocklyWorkspace } from "./blockly_shell_focus";
import { registerBlocklyA11yExtensions } from "./blockly_a11y_extensions";
import { applyShellLandmarks, applyToolbarA11y, announceShellMessage, registerShellAreaNavigation } from "./shell_a11y";
import { registerShortcutsHelp } from "./shell_shortcuts_help";
import { registerKeyboardTutorial } from "./shell_keyboard_tutorial";
import { registerShellFileShortcuts } from "./shell_shortcuts";
import { µcB_codeEditor } from "./code_editor";
import { registerWorkspaceForSvgResize, µcB_workspaceOnResize } from "./workspace_resize";
import {
  initializeBottomPanelToggleButton,
  initializeRightPanelToggleButton,
  saveLayoutToSessionStorage,
  updateBottomPanelToggleButton,
  updateResizerAriaValue,
  updateRightPanelToggleButton,
} from "./workspace_flex";

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
  boardMenu: document.getElementById("boardMenu") as HTMLSelectElement,
  pluginMinimap: document.getElementById("pluginMinimap") as HTMLInputElement,
  pluginHighlight: document.getElementById(
    "pluginHighlight",
  ) as HTMLInputElement,
  saveButton: document.getElementById("saveButton") as HTMLElement,
  loadButton: document.getElementById("loadButton") as HTMLElement,
  loadFileInput: document.getElementById("loadFileInput") as HTMLInputElement,
  undoButton: document.getElementById("undoButton") as HTMLElement,
  redoButton: document.getElementById("redoButton") as HTMLElement,
  pluginContinuousToolbox: document.getElementById(
    "pluginContinuousToolbox",
  ) as HTMLInputElement,
  alwaysOpenedToolboxFlyout: document.getElementById(
    "alwaysOpenedToolboxFlyout",
  ) as HTMLInputElement,
  codeEditorSwitch: document.getElementById(
    "codeEditorSwitch",
  ) as HTMLInputElement,
  debugSwitch: document.getElementById("debugSwitch") as HTMLInputElement,
};

let shellFileShortcutsRegistered = false;

const triggerWorkspaceSave = (): void => {
  const filename = `workspace_${new Date().toISOString().slice(0, 10)}.json`;
  µcB.workspaceSaveToFile(filename);
  announceShellMessage(getA11yLabel("A11Y_SAVE_ANNOUNCED"));
};

/**
 * Restores panel layout from session storage.
 * Falls back to sane defaults when nothing is stored yet.
 */
const restoreLayoutFromSessionStorage = (): void => {
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

  const defaults: Record<string, string> = {
    flexContainerUp: "1",
    flexContainerUpLeft: "1",
    flexContainerUpRight: "0",
    flexContainerBottom: "0",
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    if (!element) return;
    const savedValue = window.sessionStorage.getItem(key);
    const parsed = savedValue !== null ? Number(savedValue) : NaN;
    const safeValue = Number.isFinite(parsed) && parsed >= 0
      ? String(parsed)
      : defaults[key];
    element.style.flexGrow = safeValue;
  });
};

/**
 * Ensures Blockly host div has valid dimensions before first inject.
 */
const primeWorkspaceContainerDimensions = (): void => {
  if (!elements.workspaceContentArea || !elements.workspaceContentBlockly) {
    return;
  }
  let x = Number(elements.workspaceContentArea.offsetLeft) || 0;
  let y = Number(elements.workspaceContentArea.offsetTop) || 0;
  let element: HTMLElement = elements.workspaceContentArea;
  while (element.offsetParent) {
    element = element.offsetParent as HTMLElement;
    x += Number(element.offsetLeft) || 0;
    y += Number(element.offsetTop) || 0;
  }
  const rawWidth = Number(elements.workspaceContentArea.offsetWidth);
  const rawHeight = Number(elements.workspaceContentArea.offsetHeight);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 1;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 1;
  Object.assign(elements.workspaceContentBlockly.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${Number.isFinite(x) ? x : 0}px`,
    top: `${Number.isFinite(y) ? y : 0}px`,
  });
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
  "boardMenu",
  "pluginMinimap",
  "pluginHighlight",
  "saveButton",
  "loadButton",
  "loadFileInput",
  "undoButton",
  "redoButton",
  "pluginContinuousToolbox",
  "codeEditorSwitch",
  "debugSwitch",
];

requiredElements.forEach((id) => {
  if (!document.getElementById(id)) {
    console.error(`Required element with id '${id}' not found in DOM`);
  }
});

if (elements.contentMonacoEditor) {
  elements.contentMonacoEditor.style.display = "none";
}

/**
 * Populates the board dropdown with all available board profiles.
 */
const HTML_populateBoards = (): void => {
  if (!elements.boardMenu) {
    return;
  }

  const getBoardFamily = (boardId: string, lang: string): string =>
    getShellMessage(getBoardFamilyMessageKey(boardId), lang);

  const currentLang =
    (elements.languageMenu?.value && elements.languageMenu.value.trim().length > 0
      ? elements.languageMenu.value
      : getLangParamFromUrl()) || "en";
  const noneLabel =
    languagesMap[currentLang]?.BOARD_NONE ??
    languagesMap.en?.BOARD_NONE ??
    "none";
  const previousValue = elements.boardMenu.value;

  elements.boardMenu.innerHTML = "";
  // Keep "none" as the first plain option (outside categories).
  if (BOARD_PROFILES.none) {
    const noneOption = document.createElement("option");
    noneOption.value = "none";
    noneOption.textContent = noneLabel;
    elements.boardMenu.appendChild(noneOption);
  }

  const groupedBoards = new Map<string, Array<{ boardId: string; label: string }>>();
  for (const [boardId, profile] of Object.entries(BOARD_PROFILES)) {
    if (boardId === "none") continue;
    const family = getBoardFamily(boardId, currentLang);
    const description =
      typeof profile.description === "string" && profile.description.trim().length > 0
        ? profile.description
        : boardId;
    const list = groupedBoards.get(family) ?? [];
    list.push({ boardId, label: description });
    groupedBoards.set(family, list);
  }

  const sortedFamilies = [...groupedBoards.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  for (const family of sortedFamilies) {
    const familyBoards = groupedBoards.get(family);
    if (!familyBoards || familyBoards.length === 0) continue;

    familyBoards.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    const group = document.createElement("optgroup");
    group.label = family;
    for (const { boardId, label } of familyBoards) {
      const option = document.createElement("option");
      option.value = boardId;
      option.textContent = label;
      group.appendChild(option);
    }
    elements.boardMenu.appendChild(group);
  }
  if (elements.boardMenu.options.length > 0) {
    const fallbackValue =
      BOARD_PROFILES[DEFAULT_BOARD_ID] !== undefined
        ? DEFAULT_BOARD_ID
        : elements.boardMenu.options[0].value;
    const targetValue =
      (previousValue && BOARD_PROFILES[previousValue] !== undefined
        ? previousValue
        : fallbackValue);
    elements.boardMenu.value = targetValue;
  }
};

// Initialize Blockly Application — kernel registers blocks once before inject.
restoreLayoutFromSessionStorage();
registerUcBlocklyKernel();
installBlockDebugContextMenu();
applyBlockDebugMetadata();
primeWorkspaceContainerDimensions();
// No board selected at init: hide board category until user selects a board.
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
    /** Path to Blockly media (sounds, cursors, sprites). After build, public/media is copied to output as media/. */
    media: "./media/",
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

registerWorkspaceForSvgResize(µcB.workspace);

const applyA11yAttributes = (): void => {
  if (elements.contentCode) {
    elements.contentCode.setAttribute("role", "region");
    elements.contentCode.setAttribute("aria-label", getA11yLabel("A11Y_GENERATED_CODE_REGION"));
    elements.contentCode.setAttribute("tabindex", "0");
  }
  const consoleElement = document.getElementById("content_console") as HTMLElement | null;
  if (consoleElement) {
    consoleElement.setAttribute("role", "log");
    consoleElement.setAttribute("aria-live", "polite");
    consoleElement.setAttribute("aria-relevant", "additions text");
    consoleElement.setAttribute("aria-label", getA11yLabel("A11Y_CONSOLE_REGION"));
    consoleElement.setAttribute("tabindex", "0");
  }
  const horizontalResizer = document.querySelector("#flex_container_up > flex-resizer") as HTMLElement | null;
  const verticalResizer = document.querySelector("#container_page > flex-resizer") as HTMLElement | null;
  if (horizontalResizer) {
    horizontalResizer.setAttribute("role", "separator");
    horizontalResizer.setAttribute("aria-orientation", "vertical");
    horizontalResizer.setAttribute("aria-label", getA11yLabel("A11Y_HORIZONTAL_RESIZER"));
    horizontalResizer.setAttribute("tabindex", "0");
    updateResizerAriaValue(horizontalResizer);
  }
  if (verticalResizer) {
    verticalResizer.setAttribute("role", "separator");
    verticalResizer.setAttribute("aria-orientation", "horizontal");
    verticalResizer.setAttribute("aria-label", getA11yLabel("A11Y_VERTICAL_RESIZER"));
    verticalResizer.setAttribute("tabindex", "0");
    updateResizerAriaValue(verticalResizer);
  }
  updateRightPanelToggleButton();
  updateBottomPanelToggleButton();
  applyShellLandmarks();
  applyToolbarA11y();
};

/**
 * Custom flyout inflater for category placeholders.
 */
class CategoryFlyoutInflater implements Blockly.IFlyoutInflater {
  /**
   * Creates a flyout item for category separators.
   * @param _state - Unused state data.
   * @param flyout - The flyout instance requesting items.
   */
  load(_state: object, flyout: Blockly.IFlyout): Blockly.FlyoutItem {
    void _state;
    const axis = flyout.horizontalLayout
      ? ("x" as ConstructorParameters<typeof Blockly.FlyoutSeparator>[1])
      : ("y" as ConstructorParameters<typeof Blockly.FlyoutSeparator>[1]);
    const separator = new Blockly.FlyoutSeparator(0, axis);
    return new Blockly.FlyoutItem(separator, this.getType());
  }

  /**
   * Returns the gap after this item.
   * @param _state - Unused state data.
   * @param _defaultGap - Default gap size.
   */
  gapForItem(_state: object, _defaultGap: number): number {
    void _state;
    void _defaultGap;
    return 0;
  }

  /**
   * Disposes a flyout item.
   * @param _item - Item to dispose.
   */
  disposeItem(_item: Blockly.FlyoutItem): void {
    void _item;
    // No-op: empty placeholder item.
  }

  /**
   * Returns the registered type string.
   */
  getType(): string {
    return "category";
  }
}

/**
 * Registers components needed for the continuous toolbox.
 * @public
 * @remarks
 * Registers ContinuousCategory, ContinuousMetrics, ContinuousFlyout,
 * ContinuousToolbox, and custom flyout inflaters. Also injects CSS
 * for the continuous toolbox appearance.
 */
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
    ContinuousMetricsOverlayFlyout,
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
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "category",
    CategoryFlyoutInflater,
    true,
  );

  // Add CSS styles to override toolbox appearance
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

/**
 * Unregisters continuous toolbox components and restores defaults.
 * @public
 * @remarks
 * Removes custom CSS styles, restores standard Blockly categories
 * and flyout inflaters, and unregisters the continuous toolbox components.
 */
export const unregisterContinuousToolboxComponents = (): void => {
  // Remove custom CSS styles to restore Blockly default style
  const customStyles = document.querySelectorAll("style");
  customStyles.forEach((style) => {
    if (style.textContent?.includes(".categoryBubble")) {
      style.remove();
    }
  });
  // Restore Blockly default category
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    Blockly.ToolboxCategory,
    true,
  );
  // Restore default block inflater
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "block",
    Blockly.BlockFlyoutInflater,
    true,
  );
  // Remove the "category" inflater specific to the continuous toolbox
  try {
    Blockly.registry.unregister(Blockly.registry.Type.FLYOUT_INFLATER, "category");
  } catch {
    // Ignore if already unregistered
  }
  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 0.5rem 0 0;
      border-radius: 0%;
      width: 8px;
      height: 16px;
      min-height: 16px;
      flex-shrink: 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .blocklyToolboxCategoryLabel {
      vertical-align: middle;
    }
  `;
  document.head.appendChild(style);
};
/**
 * Wires UI controls (menus, toggles) to application behavior.
 */
const HTML_onChange = (): void => {
  elements.languageMenu.onchange = () => {
    const selectedBoardBeforeLanguageChange = elements.boardMenu.value;
    HTML_populateBoards();
    if (
      selectedBoardBeforeLanguageChange &&
      BOARD_PROFILES[selectedBoardBeforeLanguageChange] !== undefined
    ) {
      elements.boardMenu.value = selectedBoardBeforeLanguageChange;
    }
    const rtl: boolean = µcB.changeLanguage(true);
    µcB.WORKSPACE_OPTIONS["rtl"] = rtl;
    applyA11yAttributes();
    µcB.workspaceReboot();
  };

  elements.themeMenu.onchange = () => {
    syncUiPaletteTheme();
    µcB.changeTheme(elements.themeMenu.value);
  };

  elements.rendererMenu.onchange = () => {
    µcB.changeRenderer(elements.rendererMenu.value);
  };

  elements.boardMenu.onchange = () => {
    const boardValue = elements.boardMenu.value;
    window.sessionStorage?.setItem("paramBoard", boardValue);
    pushStateReplaceSearchParam("board", boardValue);
    const lang = getLangParamFromUrl();
    const toolboxForBoard = changeLanguageToolbox(lang, getToolboxForCurrentBoard(basic_toolbox));
    µcB.WORKSPACE_OPTIONS.toolbox = toolboxForBoard;
    (µcB.workspace as Blockly.WorkspaceSvg).updateToolbox(toolboxForBoard);
    refreshBoardPinDropdowns(µcB.workspace);
  };

  elements.pluginMinimap.onchange = () => {
    const minimap = document.getElementsByClassName(
      "blockly-minimap",
    )[0] as HTMLElement | undefined;
    if (minimap) {
      minimap.style.visibility = elements.pluginMinimap.checked
        ? "visible"
        : "hidden";
    }
    setPluginsInURL("pluginMinimap", "minimap");
  };

  elements.pluginHighlight.onchange = () => {
    µcB.setContentHighlight(elements.pluginHighlight.checked);
    setPluginsInURL("pluginHighlight", "highlight");
  };

  // Save/Load file handlers
  if (elements.saveButton) {
    elements.saveButton.onclick = () => {
      triggerWorkspaceSave();
    };
  }

  if (elements.loadButton && elements.loadFileInput) {
    elements.loadButton.onclick = () => {
      elements.loadFileInput.click();
    };

    elements.loadFileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const hasExistingBlocks = µcB.workspaceHasAnyBlocks();
        const currentLang = getLangParamFromUrl();
        const mergeMessage = getShellMessage("LOAD_MERGE_CONFIRM", currentLang);
        const merge = hasExistingBlocks ? confirm(mergeMessage) : false;
        µcB.workspaceLoadFromFile(file, merge);
        // Reset input value to allow reloading the same file
        target.value = '';
      }
    };
  }

  elements.undoButton.onclick = () => {
    const workspace = µcB.workspace as Blockly.WorkspaceSvg | undefined;
    if (workspace) {
      workspace.undo(false);
    }
  };

  elements.redoButton.onclick = () => {
    const workspace = µcB.workspace as Blockly.WorkspaceSvg | undefined;
    if (workspace) {
      workspace.undo(true);
    }
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
    µcB.applyAlwaysOpenedToolboxFlyout();
    setPluginsInURL("alwaysOpenedToolboxFlyout", "flyout");
  };

  elements.codeEditorSwitch.onchange = () => {
    if (elements.codeEditorSwitch.checked) {
      if (elements.contentCode) elements.contentCode.style.display = "none";
      if (elements.contentMonacoEditor) {
        elements.contentMonacoEditor.style.display = "block";
        elements.contentMonacoEditor.style.height = "100%";
        elements.contentMonacoEditor.style.width = "100%";
        void µcB_codeEditor.ensureInitialized(elements.contentMonacoEditor);
      }
    } else {
      if (elements.contentCode) elements.contentCode.style.display = "block";
      if (elements.contentMonacoEditor) {
        elements.contentMonacoEditor.style.display = "none";
      }
    }
    setPluginsInURL("codeEditorSwitch", "codeEditor");
  };

  elements.debugSwitch.onchange = () => {
    const enabled = elements.debugSwitch.checked;
    (globalThis as { __UCB_DEBUG__?: boolean }).__UCB_DEBUG__ = enabled;
    try {
      if (enabled) {
        window.localStorage?.setItem("ucbDebug", "1");
      } else {
        window.localStorage?.removeItem("ucbDebug");
      }
    } catch {
      // Ignore storage errors
    }
    setPluginsInURL("debugSwitch", "debug");
  };
  (globalThis as { __UCB_DEBUG__?: boolean }).__UCB_DEBUG__ =
    elements.debugSwitch.checked;

  if (!shellFileShortcutsRegistered) {
    shellFileShortcutsRegistered = true;
    registerShellFileShortcuts({
      onSave: triggerWorkspaceSave,
      onLoad: () => {
        elements.loadButton?.click();
      },
    });
  }
};

/**
 * Clears saved state and reloads the application to defaults.
 */
const resetAllParameters = (): void => {
  µcB.workspaceSetupPlugins(true);

  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }
  if (window.localStorage) {
    window.localStorage.clear();
  }

  document.getElementById("flex_container_up_right")!.style.flexGrow = "0";
  document.getElementById("flex_container_bottom")!.style.flexGrow = "0";
  document.getElementById("flex_container_up")!.style.flexGrow = "1";
  document.getElementById("flex_container_up_left")!.style.flexGrow = "1";

  window.location.href = "/";
};

/**
 * Executes a callback when the DOM is ready.
 * @param callback - Function to execute after DOM is loaded.
 */
const DomIsLoaded = (callback: () => void): void => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};

/**
 * Defers non-critical DOM initialization work.
 * @param callback - Work to schedule when idle or after a short timeout.
 */
const scheduleNonCriticalDomInit = (callback: () => void): void => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }
  setTimeout(callback, 0);
};
// The `DomIsLoaded` function prepares everything needed by structure of DOM.
DomIsLoaded((): void => {
  HTML_populateLanguages(µcB);
  HTML_populateBoards();
  syncUiPaletteTheme();
  initializeRightPanelToggleButton();
  initializeBottomPanelToggleButton();
  registerShellAreaNavigation();
  registerShortcutsHelp();
  registerKeyboardTutorial();
  applyA11yAttributes();
  µcB.changeLanguage(false);
  µcB.workspaceInit();
  registerShellBlocklyWorkspace(() => µcB.workspace as Blockly.WorkspaceSvg);
  registerBlocklyA11yExtensions(() => µcB.workspace as Blockly.WorkspaceSvg);
  // If a board is already selected (e.g. from URL), show board category and refresh pin dropdowns.
  if (elements.boardMenu.value && elements.boardMenu.value !== "none") {
    const lang = getLangParamFromUrl();
    const toolboxForBoard = changeLanguageToolbox(lang, getToolboxForCurrentBoard(basic_toolbox));
    µcB.WORKSPACE_OPTIONS.toolbox = toolboxForBoard;
    (µcB.workspace as Blockly.WorkspaceSvg).updateToolbox(toolboxForBoard);
    refreshBoardPinDropdowns(µcB.workspace);
  }
});

/* The `window.onload` event is triggered when the entire page has finished loading, including all
resources such as images and scripts. */
window.onload = (): void => {
  debugLog('🔄 window.onload - Checking components...');

  HTML_onChange();
  const code = arduinoGenerator.workspaceToCode(µcB.workspace);
  µcB_codeEditor.setValue(code);
  if (elements.contentCode) {
    elements.contentCode.textContent = code;
  }

  // Ensure layout is restored before startup sizing/reflow.
  restoreLayoutFromSessionStorage();

  // Wait for the DOM to be fully stable before calling workspaceOnResize
  // Use requestAnimationFrame so that layout is computed
  requestAnimationFrame(() => {
    µcB_workspaceOnResize();
    // Prevent startup events/reboots from overwriting saved blocks with an empty workspace.
    µcB.setAutoSaveEnabled(false);
    µcB.setParamsBlockly();
    syncUiPaletteTheme();
    µcB.pluginsSetupWorkspace();
    // Initialize plugins first so minimap observes restore events, like historical behavior.
    µcB.workspaceSetupPlugins(false);
    // Restore only after startup params/plugins are applied (they may reboot workspace).
    µcB.workspaceLoadBlocks("mainWorkspace_blocks");
    (µcB.workspace as Blockly.WorkspaceSvg).scrollCenter();
    µcB.setAutoSaveEnabled(true);
    scheduleNonCriticalDomInit(() => {
      // Initialize minimap
      const minimap = document.getElementsByClassName(
        "blockly-minimap",
      )[0] as HTMLElement;
      const searchParams = new URLSearchParams(window.location.search);
      const paramsURL = searchParams.get("options")
        ? searchParams.get("options")!.split(",").filter(Boolean)
        : [];
      const minimapParam = searchParams.get("minimap");
      const minimapFromUrl = minimapParam !== null
        && minimapParam !== "0"
        && minimapParam !== "false";
      const minimapEnabled =
        window.sessionStorage.getItem("pluginMinimap") === "true" ||
        paramsURL.includes("minimap") ||
        minimapFromUrl;
      if (minimap) {
        minimap.style.visibility = minimapEnabled ? "visible" : "hidden";
        elements.pluginMinimap.checked = minimapEnabled;
      }

      const continuousEnabled =
        window.sessionStorage.getItem("pluginContinuousToolbox") === "true" ||
        new URLSearchParams(window.location.search)
          .get("options")
          ?.split(",")
          .includes("ctoolbox");
      if (!continuousEnabled) {
        // Initialize toolbox categories for standard toolbox
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
      }

      // Attach click event on title to reset all parameters
      const titleElement = document.getElementById("title");
      if (titleElement) {
        titleElement.addEventListener("click", resetAllParameters);
        // Add style to indicate it is clickable
        titleElement.style.cursor = "pointer";

        // Create a span with class lang for automatic translation
        const titleSpan = document.createElement("span");
        titleSpan.className = "lang";
        titleSpan.setAttribute("key", "RESET_TITLE");
        titleSpan.textContent = "Click to reset all parameters";

        // Apply translation for the current language
        const currentLang = getLangParamFromUrl();
        HTML_changeLanguage(currentLang);

        // Set tooltip with translated text
        titleElement.title = titleSpan.textContent;
      }
    });
  });

};

// Persist layout when the user leaves the page (save window positions to sessionStorage).
window.onbeforeunload = (): void => {
  saveLayoutToSessionStorage();
  µcB.workspaceSaveBlocks("mainWorkspace_blocks");
};

/** Public API surface (same exports as before the workspace module split). */
export { LazyMonacoEditor, µcB_codeEditor } from "./code_editor";
export { µcB_workspaceOnResize } from "./workspace_resize";
export { µcB_addFlexResizerEvents } from "./workspace_flex";
