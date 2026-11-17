import type { ChangeEvent } from "react";
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
import { basic_toolbox, getToolboxForCurrentBoard } from "../toolbox";
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

export interface DemoUiActions {
  save: () => void;
  openFilePicker: () => void;
  loadFile: (event: ChangeEvent<HTMLInputElement>) => void;
  undo: () => void;
  redo: () => void;
  changeLanguage: (event: ChangeEvent<HTMLSelectElement>) => void;
  changeTheme: (event: ChangeEvent<HTMLSelectElement>) => void;
  changeRenderer: (event: ChangeEvent<HTMLSelectElement>) => void;
  changeBoard: (event: ChangeEvent<HTMLSelectElement>) => void;
  toggleMinimap: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleHighlight: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleContinuousToolbox: (event: ChangeEvent<HTMLInputElement>) => void;
  togglePinnedFlyout: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleCodeEditor: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleDebug: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function createDemoUiActions({ µcB, elements }: DemoUiHandlersContext): DemoUiActions {
  const save = (): void => {
    µcB.workspaceSaveToFile(defaultUcBlocklyWorkspaceFilename());
    announceShellMessage(getA11yLabel("A11Y_SAVE_ANNOUNCED"));
  };

  const actions: DemoUiActions = {
    save,
    openFilePicker: () => elements.loadFileInput.click(),
    loadFile: (event) => {
      const target = event.currentTarget;
      const file = target.files?.[0];
      if (!file) return;
      const currentLang = getLangParamFromUrl();
      const mergeMessage = getShellMessage("LOAD_MERGE_CONFIRM", currentLang);
      const merge = µcB.workspaceHasAnyBlocks() ? confirm(mergeMessage) : false;
      µcB.workspaceLoadFromFile(file, merge);
      target.value = "";
    },
    undo: () => (µcB.workspace as Blockly.WorkspaceSvg).undo(false),
    redo: () => (µcB.workspace as Blockly.WorkspaceSvg).undo(true),
    changeLanguage: () => {
      const selectedBoard = elements.boardMenu.value;
      HTML_populateBoards(elements);
      if (selectedBoard && BOARD_PROFILES[selectedBoard] !== undefined) {
        elements.boardMenu.value = selectedBoard;
      }
      const rtl = µcB.changeLanguage(true);
      µcB.WORKSPACE_OPTIONS.rtl = rtl;
      applyA11yAttributes(elements);
      refreshAboutDialog();
      µcB.workspaceReboot();
    },
    changeTheme: (event) => {
      syncUiPaletteTheme();
      µcB.changeTheme(event.currentTarget.value);
    },
    changeRenderer: (event) => µcB.changeRenderer(event.currentTarget.value),
    changeBoard: (event) => {
      const boardValue = event.currentTarget.value;
      window.sessionStorage?.setItem("paramBoard", boardValue);
      pushStateReplaceSearchParam("board", boardValue);
      const toolboxForBoard = changeLanguageToolbox(
        getLangParamFromUrl(),
        getToolboxForCurrentBoard(basic_toolbox),
      );
      µcB.WORKSPACE_OPTIONS.toolbox = toolboxForBoard;
      (µcB.workspace as Blockly.WorkspaceSvg).updateToolbox(toolboxForBoard);
      refreshBoardPinDropdowns(µcB.workspace);
    },
    toggleMinimap: (event) => {
      const minimap = document.getElementsByClassName("blockly-minimap")[0] as HTMLElement | undefined;
      if (minimap) minimap.style.visibility = event.currentTarget.checked ? "visible" : "hidden";
      setPluginsInURL("pluginMinimap", "minimap");
    },
    toggleHighlight: (event) => {
      µcB.setContentHighlight(event.currentTarget.checked);
      setPluginsInURL("pluginHighlight", "highlight");
    },
    toggleContinuousToolbox: (event) => {
      if (event.currentTarget.checked) {
        registerContinuousToolboxComponents();
        µcB.WORKSPACE_OPTIONS.plugins = {
          flyoutsVerticalToolbox: "ContinuousFlyout",
          metricsManager: "ContinuousMetrics",
          toolbox: "ContinuousToolbox",
        };
      } else {
        unregisterContinuousToolboxComponents();
        delete µcB.WORKSPACE_OPTIONS.plugins;
      }
      setPluginsInURL("pluginContinuousToolbox", "ctoolbox");
      µcB.workspaceReboot();
    },
    togglePinnedFlyout: () => {
      µcB.applyAlwaysOpenedToolboxFlyout();
      setPluginsInURL("alwaysOpenedToolboxFlyout", "flyout");
    },
    toggleCodeEditor: (event) => {
      if (event.currentTarget.checked) {
        elements.contentCode.style.display = "none";
        elements.contentMonacoEditor.style.display = "block";
        elements.contentMonacoEditor.style.height = "100%";
        elements.contentMonacoEditor.style.width = "100%";
        void µcB_codeEditor.ensureInitialized(elements.contentMonacoEditor);
      } else {
        elements.contentCode.style.display = "block";
        elements.contentMonacoEditor.style.display = "none";
      }
      setPluginsInURL("codeEditorSwitch", "codeEditor");
    },
    toggleDebug: (event) => {
      const enabled = event.currentTarget.checked;
      (globalThis as { __UCB_DEBUG__?: boolean }).__UCB_DEBUG__ = enabled;
      try {
        if (enabled) window.localStorage?.setItem("ucbDebug", "1");
        else window.localStorage?.removeItem("ucbDebug");
      } catch {
        // Ignore storage errors.
      }
      setPluginsInURL("debugSwitch", "debug");
    },
  };

  registerShellFileShortcuts({ onSave: save, onLoad: actions.openFilePicker });
  (globalThis as { __UCB_DEBUG__?: boolean }).__UCB_DEBUG__ = elements.debugSwitch.checked;
  return actions;
}

export const wireDemoUiHandlers = (context: DemoUiHandlersContext): void => {
  const { elements } = context;
  const actions = createDemoUiActions(context);
  elements.languageMenu.onchange = (event) => actions.changeLanguage(event as unknown as ChangeEvent<HTMLSelectElement>);
  elements.themeMenu.onchange = (event) => actions.changeTheme(event as unknown as ChangeEvent<HTMLSelectElement>);
  elements.rendererMenu.onchange = (event) => actions.changeRenderer(event as unknown as ChangeEvent<HTMLSelectElement>);
  elements.boardMenu.onchange = (event) => actions.changeBoard(event as unknown as ChangeEvent<HTMLSelectElement>);
  elements.pluginMinimap.onchange = (event) => actions.toggleMinimap(event as unknown as ChangeEvent<HTMLInputElement>);
  elements.pluginHighlight.onchange = (event) => actions.toggleHighlight(event as unknown as ChangeEvent<HTMLInputElement>);
  elements.pluginContinuousToolbox.onchange = (event) => actions.toggleContinuousToolbox(event as unknown as ChangeEvent<HTMLInputElement>);
  elements.alwaysOpenedToolboxFlyout.onchange = (event) => actions.togglePinnedFlyout(event as unknown as ChangeEvent<HTMLInputElement>);
  elements.codeEditorSwitch.onchange = (event) => actions.toggleCodeEditor(event as unknown as ChangeEvent<HTMLInputElement>);
  elements.debugSwitch.onchange = (event) => actions.toggleDebug(event as unknown as ChangeEvent<HTMLInputElement>);
  elements.saveButton.onclick = actions.save;
  elements.loadButton.onclick = actions.openFilePicker;
  elements.loadFileInput.onchange = (event) => actions.loadFile(event as unknown as ChangeEvent<HTMLInputElement>);
  elements.undoButton.onclick = actions.undo;
  elements.redoButton.onclick = actions.redo;
};
