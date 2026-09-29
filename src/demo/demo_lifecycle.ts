/**
 * @packageDocumentation
 * @module Demo.Lifecycle
 * @description DOM-ready / window load / unload boot for the standalone demo.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { refreshBoardPinDropdowns } from "../categories/blockly";
import type { BlocklyApplication } from "../blockly_application_type";
import { µcB_codeEditor } from "../code_editor";
import { arduinoGenerator } from "../generators/arduino";
import { debugLog } from "../generators/arduino/debug";
import {
  HTML_populateLanguages,
  changeLanguageToolbox,
  getLangParamFromUrl,
  HTML_changeLanguage,
} from "../language";
import { registerShellBlocklyWorkspace } from "../blockly_shell_focus";
import { registerBlocklyA11yExtensions } from "../blockly_a11y_extensions";
import { registerShellAreaNavigation } from "../shell_a11y";
import { registerShortcutsHelp } from "../shell_shortcuts_help";
import { registerAboutDialog } from "../shell_about";
import { registerKeyboardTutorial } from "../shell_keyboard_tutorial";
import {
  basic_toolbox,
  getToolboxForCurrentBoard,
} from "../toolbox";
import { syncUiPaletteTheme } from "../ui_palette_theme";
import {
  initializeBottomPanelToggleButton,
  initializeRightPanelToggleButton,
  saveLayoutToSessionStorage,
} from "../workspace_flex";
import { µcB_workspaceOnResize } from "../workspace_resize";
import { applyA11yAttributes } from "./demo_a11y_attrs";
import { HTML_populateBoards } from "./demo_boards_menu";
import type { DemoShellDom } from "./demo_dom";
import { restoreLayoutFromSessionStorage } from "./demo_layout";
import { wireDemoUiHandlers } from "./demo_ui_handlers";

export interface DemoLifecycleContext {
  µcB: BlocklyApplication;
  elements: DemoShellDom;
}

/**
 * Executes a callback when the DOM is ready.
 * @param callback - Function to execute after DOM is loaded.
 */
export const DomIsLoaded = (callback: () => void): void => {
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
export const scheduleNonCriticalDomInit = (callback: () => void): void => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }
  setTimeout(callback, 0);
};

/**
 * Clears workspace, storages and reloads the application to defaults.
 * @param µcB - Demo application instance.
 * @param setSkipUnloadSave - Marks beforeunload to skip persistence.
 */
export const resetAllParameters = (
  µcB: BlocklyApplication,
  setSkipUnloadSave: (value: boolean) => void,
): void => {
  setSkipUnloadSave(true);
  try {
    µcB.setAutoSaveEnabled(false);
  } catch {
    // Ignore if workspace is not ready.
  }
  try {
    µcB.clearWorkspaceFully();
  } catch {
    // Ignore if workspace is not ready.
  }

  try {
    window.sessionStorage?.clear();
  } catch {
    // Ignore storage errors.
  }
  try {
    window.localStorage?.clear();
  } catch {
    // Ignore storage errors.
  }

  const upRight = document.getElementById("flex_container_up_right");
  const bottom = document.getElementById("flex_container_bottom");
  const up = document.getElementById("flex_container_up");
  const upLeft = document.getElementById("flex_container_up_left");
  if (upRight) upRight.style.flexGrow = "0";
  if (bottom) bottom.style.flexGrow = "0";
  if (up) up.style.flexGrow = "1";
  if (upLeft) upLeft.style.flexGrow = "1";

  window.location.href = window.location.pathname || "/";
};

/**
 * Registers DomIsLoaded, window.onload and onbeforeunload for the demo.
 * @param ctx - Application + resolved demo DOM.
 */
export const startDemoLifecycle = (ctx: DemoLifecycleContext): void => {
  const { µcB, elements } = ctx;
  let skipUnloadWorkspaceSave = false;

  DomIsLoaded((): void => {
    HTML_populateLanguages(µcB);
    HTML_populateBoards(elements);
    syncUiPaletteTheme();
    initializeRightPanelToggleButton();
    initializeBottomPanelToggleButton();
    registerShellAreaNavigation();
    registerShortcutsHelp();
    registerAboutDialog();
    registerKeyboardTutorial();
    applyA11yAttributes(elements);
    µcB.changeLanguage(false);
    µcB.workspaceInit();
    registerShellBlocklyWorkspace(() => µcB.workspace as Blockly.WorkspaceSvg);
    registerBlocklyA11yExtensions(() => µcB.workspace as Blockly.WorkspaceSvg);
    {
      const lang = getLangParamFromUrl();
      const toolboxForBoard = changeLanguageToolbox(
        lang,
        getToolboxForCurrentBoard(basic_toolbox),
      );
      µcB.WORKSPACE_OPTIONS.toolbox = toolboxForBoard;
      (µcB.workspace as Blockly.WorkspaceSvg).updateToolbox(toolboxForBoard);
      if (elements.boardMenu.value && elements.boardMenu.value !== "none") {
        refreshBoardPinDropdowns(µcB.workspace);
      }
    }
  });

  window.onload = (): void => {
    debugLog("🔄 window.onload - Checking components...");

    wireDemoUiHandlers({ µcB, elements });
    const code = arduinoGenerator.workspaceToCode(µcB.workspace);
    µcB_codeEditor.setValue(code);
    if (elements.contentCode) {
      elements.contentCode.textContent = code;
    }

    restoreLayoutFromSessionStorage();

    requestAnimationFrame(() => {
      µcB_workspaceOnResize();
      µcB.setAutoSaveEnabled(false);
      µcB.setParamsBlockly();
      syncUiPaletteTheme();
      µcB.pluginsSetupWorkspace();
      µcB.workspaceSetupPlugins(false);
      µcB.workspaceLoadBlocks("mainWorkspace_blocks");
      (µcB.workspace as Blockly.WorkspaceSvg).scrollCenter();
      µcB.setAutoSaveEnabled(true);
      scheduleNonCriticalDomInit(() => {
        const minimap = document.getElementsByClassName(
          "blockly-minimap",
        )[0] as HTMLElement;
        const searchParams = new URLSearchParams(window.location.search);
        const paramsURL = searchParams.get("options")
          ? searchParams.get("options")!.split(",").filter(Boolean)
          : [];
        const minimapParam = searchParams.get("minimap");
        const minimapFromUrl =
          minimapParam !== null &&
          minimapParam !== "0" &&
          minimapParam !== "false";
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

        const titleElement = document.getElementById("title");
        if (titleElement) {
          titleElement.addEventListener("click", () =>
            resetAllParameters(µcB, (v) => {
              skipUnloadWorkspaceSave = v;
            }),
          );
          titleElement.style.cursor = "pointer";

          const titleSpan = document.createElement("span");
          titleSpan.className = "lang";
          titleSpan.setAttribute("key", "RESET_TITLE");
          titleSpan.textContent = "Click to reset all parameters";

          const currentLang = getLangParamFromUrl();
          HTML_changeLanguage(currentLang);

          titleElement.title = titleSpan.textContent;
        }
      });
    });
  };

  window.onbeforeunload = (): void => {
    if (skipUnloadWorkspaceSave) {
      return;
    }
    saveLayoutToSessionStorage();
    µcB.workspaceSaveBlocks("mainWorkspace_blocks");
  };
};
