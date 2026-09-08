/**
 * @packageDocumentation
 * @module Demo.UiHandlers
 * @description Wire demo toolbar menus and buttons to BlocklyApplication.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { refreshBoardPinDropdowns } from "../categories/blockly";
import type { BlocklyApplication } from "../blockly_application_type";
import { µcB_codeEditor } from "../code_editor";
import { BOARD_PROFILES } from "../boards";
import { getLangParamFromUrl, changeLanguageToolbox } from "../language";
import { getShellMessage } from "../shell_messages";
import { getA11yLabel } from "../a11y_labels";
import { announceShellMessage } from "../shell_a11y";
import { refreshAboutDialog } from "../shell_about";
import { registerShellFileShortcuts } from "../shell_shortcuts";
import { pushStateReplaceSearchParam, setPluginsInURL } from "../tools";
import {
  basic_toolbox,
  getToolboxForCurrentBoard,
} from "../toolbox";
import { syncUiPaletteTheme } from "../ui_palette_theme";
import { defaultUcBlocklyWorkspaceFilename } from "../workspace_file";
import { applyA11yAttributes } from "./demo_a11y_attrs";
import { HTML_populateBoards } from "./demo_boards_menu";
import type { DemoShellDom } from "./demo_dom";
import {
  registerContinuousToolboxComponents,
  unregisterContinuousToolboxComponents,
} from "./continuous_toolbox";

export interface DemoUiHandlersContext {
  µcB: BlocklyApplication;
  elements: DemoShellDom;
}

/**
 * Wires UI controls (menus, toggles) to application behavior.
 * @param ctx - Application + resolved demo DOM.
 */
export const wireDemoUiHandlers = (ctx: DemoUiHandlersContext): void => {
  const { µcB, elements } = ctx;
  let shellFileShortcutsRegistered = false;

  const triggerWorkspaceSave = (): void => {
    µcB.workspaceSaveToFile(defaultUcBlocklyWorkspaceFilename());
    announceShellMessage(getA11yLabel("A11Y_SAVE_ANNOUNCED"));
  };

  elements.languageMenu.onchange = () => {
    const selectedBoardBeforeLanguageChange = elements.boardMenu.value;
    HTML_populateBoards(elements);
    if (
      selectedBoardBeforeLanguageChange &&
      BOARD_PROFILES[selectedBoardBeforeLanguageChange] !== undefined
    ) {
      elements.boardMenu.value = selectedBoardBeforeLanguageChange;
    }
    const rtl: boolean = µcB.changeLanguage(true);
    µcB.WORKSPACE_OPTIONS["rtl"] = rtl;
    applyA11yAttributes(elements);
    refreshAboutDialog();
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
    const toolboxForBoard = changeLanguageToolbox(
      lang,
      getToolboxForCurrentBoard(basic_toolbox),
    );
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
        target.value = "";
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
