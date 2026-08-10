/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Workspace lifecycle without demo shell (Blockly inject, plugins, persistence).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  registerStrictConnectionChecker,
  StrictConnectionChecker,
} from "../generators/arduino/strict_connection_checker";
import { registerProceduresCategory } from "../generators/arduino/procedures_flyout";
import { registerTypedVariablesCategory } from "../generators/arduino/typed_variables_flyout";
import { normalizeVariableType } from "../generators/arduino/variable_utils";
import { arduinoGenerator } from "../generators/arduino";
import { refreshBoardPinDropdowns } from "../categories/blockly";
import { changeLanguageToolbox } from "../language";
import { getToolboxForCurrentBoard, type ToolboxConfiguration } from "../toolbox";
import { createUcBlockly } from "./create_ucblockly";
import { resolveEnforcerOptions } from "./default_options";
import { sanitizeSerializedWorkspaceState } from "./workspace_state";
import {
  installProgramStructureEnforcer,
  syncProgramStructureAfterLoad,
  uninstallProgramStructureEnforcer,
} from "../program_structure_enforcer";
import { getShellMessage } from "../shell_messages";
import { UcBlocklyPluginHost } from "./ucblockly_plugins";
import type {
  UcBlocklyInstance,
  UcBlocklyPluginOptions,
  UcBlocklyWorkspaceManagerOptions,
} from "./types";

/**
 * Owns Blockly workspace injection, plugins, variables, and serialization.
 * Demo UI (menus, Monaco, URL) stays in {@link BlocklyApplication} (`src/demo/`).
 */
export class UcBlocklyWorkspaceManager {
  workspace!: Blockly.Workspace;
  readonly baseToolbox: ToolboxConfiguration;
  WORKSPACE_OPTIONS: Record<string, unknown>;

  private core: UcBlocklyInstance | null = null;
  private readonly pluginHost = new UcBlocklyPluginHost();
  private variableCreateListener: ((e: Blockly.Events.Abstract) => void) | null = null;
  private saveBlocksTimer: number | null = null;
  private autoSaveEnabled = false;
  private autoSaveKey = "mainWorkspace_blocks";
  private isBulkLoading = false;
  private hasBlocks = false;
  private hasBlocksRefreshPending = false;
  private readonly onCodeChange?: (code: string) => void;
  private readonly enforcers: ReturnType<typeof resolveEnforcerOptions>;
  private injectionDiv: HTMLElement;
  private language: string;

  constructor(options: UcBlocklyWorkspaceManagerOptions) {
    this.baseToolbox = options.baseToolbox;
    this.WORKSPACE_OPTIONS = options.workspaceOptions;
    this.injectionDiv = options.injectionDiv;
    this.language = options.language;
    this.onCodeChange = options.onCodeChange;
    this.enforcers = resolveEnforcerOptions(options.enforcers);
    if (options.plugins) {
      this.pluginHost.setOptions(options.plugins);
    }
    this.applyConnectionCheckerToWorkspaceOptions();
    this.mount();
  }

  /** Current generated Arduino code. */
  getCode(): string {
    return this.core?.getCode() ?? arduinoGenerator.workspaceToCode(this.workspace);
  }

  setLanguage(language: string): void {
    this.language = language;
  }

  setPluginOptions(options: UcBlocklyPluginOptions): void {
    this.pluginHost.setOptions(options);
  }

  setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
    if (!enabled && this.saveBlocksTimer !== null) {
      window.clearTimeout(this.saveBlocksTimer);
      this.saveBlocksTimer = null;
    }
  }

  /**
   * Clears all blocks and the undo/redo stacks (in-memory reset).
   */
  clearWorkspaceFully(): void {
    this.workspace.clear();
    this.workspace.clearUndo();
    this.hasBlocks = false;
  }

  setAutoSaveKey(key: string): void {
    this.autoSaveKey = key;
  }

  workspaceHasAnyBlocks(): boolean {
    return this.hasBlocks;
  }

  registerCustomToolboxCallbacks(): void {
    const svgWorkspace = this.workspace as Blockly.WorkspaceSvg;
    registerTypedVariablesCategory(svgWorkspace);
    registerProceduresCategory(svgWorkspace);
  }

  updateToolboxForLanguage(language: string): void {
    this.language = language;
    this.WORKSPACE_OPTIONS.toolbox = changeLanguageToolbox(
      language,
      getToolboxForCurrentBoard(this.baseToolbox),
    );
  }

  syncToolboxAndPins(): void {
    if (!this.workspace) {
      return;
    }
    const toolbox = changeLanguageToolbox(
      this.language,
      getToolboxForCurrentBoard(this.baseToolbox),
    );
    (this.workspace as Blockly.WorkspaceSvg).updateToolbox(toolbox);
    refreshBoardPinDropdowns(this.workspace);
  }

  setupPlugins(
    dispose = false,
    onReady?: () => void,
    deferMinimap = false,
  ): void {
    this.pluginHost.setup(this.workspace, dispose, onReady, deferMinimap);
  }

  setContentHighlight(enabled: boolean): void {
    this.pluginHost.setContentHighlight(this.workspace, enabled);
  }

  setMinimapVisible(visible: boolean): void {
    this.pluginHost.setMinimapVisible(visible);
  }

  /**
   * Active/désactive l’enforceur setup/loop sans réinjecter le workspace
   * (préserve scroll et zoom).
   */
  setProgramStructureEnabled(enabled: boolean): void {
    this.enforcers.programStructure = enabled;
    if (!this.workspace) {
      return;
    }
    if (enabled) {
      installProgramStructureEnforcer(this.workspace);
    } else {
      uninstallProgramStructureEnforcer(this.workspace);
    }
  }

  attachWorkspaceListeners(): void {
    const scheduleSave = (): void => {
      if (this.saveBlocksTimer !== null) {
        window.clearTimeout(this.saveBlocksTimer);
      }
      this.saveBlocksTimer = window.setTimeout(() => {
        this.workspaceSaveBlocks(this.autoSaveKey);
        this.saveBlocksTimer = null;
      }, 250);
    };

    this.workspace.addChangeListener((e: Blockly.Events.Abstract): void => {
      if (e.isUiEvent || (this.workspace as Blockly.WorkspaceSvg).isDragging()) {
        return;
      }
      if (e.type === Blockly.Events.BLOCK_CREATE) {
        this.hasBlocks = true;
      } else if (
        e.type === Blockly.Events.BLOCK_DELETE ||
        e.type === Blockly.Events.FINISHED_LOADING
      ) {
        this.scheduleHasBlocksRefresh();
      }
      if (this.isBulkLoading) {
        return;
      }
      if (e.type === Blockly.Events.FINISHED_LOADING) {
        return;
      }
      if (this.autoSaveEnabled) {
        scheduleSave();
      }
    });
  }

  /**
   * Recreates the workspace while preserving configuration.
   * @param beforeMount - Hook to refresh toolbox/locale before inject (demo shell).
   */
  reboot(beforeMount?: () => void): void {
    this.closeFlyout();
    if (this.autoSaveEnabled) {
      this.workspaceSaveBlocks(this.autoSaveKey);
    }
    this.setupPlugins(true);
    this.disposeCore();
    beforeMount?.();

    const originalToolbox = this.WORKSPACE_OPTIONS.toolbox as
      | ToolboxConfiguration
      | undefined;
    const shouldStripCustom =
      this.isContinuousToolboxEnabled() && originalToolbox;
    if (shouldStripCustom && originalToolbox) {
      this.WORKSPACE_OPTIONS.toolbox =
        this.getToolboxWithoutCustomCategories(originalToolbox);
    }

    this.mount();

    if (shouldStripCustom && originalToolbox) {
      this.restoreToolboxAfterInject(originalToolbox, false);
    }
    this.attachWorkspaceListeners();
  }

  restoreWorkspaceAfterInject(): void {
    if (this.enforcers.strictConnectionChecker) {
      registerStrictConnectionChecker(this.workspace);
    }
    this.registerCustomToolboxCallbacks();
    this.attachWorkspaceListeners();
  }

  stripCustomCategoriesForContinuousToolbox(): ToolboxConfiguration | null {
    const originalToolbox = this.WORKSPACE_OPTIONS.toolbox as
      | ToolboxConfiguration
      | undefined;
    if (!this.isContinuousToolboxEnabled() || !originalToolbox) {
      return null;
    }
    this.WORKSPACE_OPTIONS.toolbox =
      this.getToolboxWithoutCustomCategories(originalToolbox);
    return originalToolbox;
  }

  restoreToolboxAfterInject(
    originalToolbox: ToolboxConfiguration | null,
    closeFlyoutWhenNotPinned = true,
  ): void {
    if (!originalToolbox) {
      return;
    }
    (this.workspace as Blockly.WorkspaceSvg).updateToolbox(originalToolbox);
    this.WORKSPACE_OPTIONS.toolbox = originalToolbox;
    this.registerCustomToolboxCallbacks();
    const toolbox = (this.workspace as Blockly.WorkspaceSvg).getToolbox?.();
    if (toolbox && typeof toolbox.refreshSelection === "function") {
      toolbox.refreshSelection();
    }
    if (closeFlyoutWhenNotPinned) {
      this.closeFlyoutIfNotPinnedOpen(false);
    }
  }

  applyFlyoutPinnedOpen(pinnedOpen: boolean): void {
    const flyout = (this.workspace as Blockly.WorkspaceSvg)
      .getToolbox()
      ?.getFlyout();
    if (!flyout) {
      return;
    }
    if (typeof (flyout as Blockly.Flyout).setAutoClose === "function") {
      (flyout as Blockly.Flyout).setAutoClose(!pinnedOpen);
    }
    if (typeof (flyout as Blockly.Flyout).autoHide === "function") {
      (flyout as Blockly.Flyout).autoHide(!pinnedOpen);
    }
    if (pinnedOpen && typeof (flyout as Blockly.Flyout).setVisible === "function") {
      (flyout as Blockly.Flyout).setVisible(true);
      return;
    }
    this.closeFlyoutIfNotPinnedOpen(pinnedOpen);
  }

  closeFlyout(): void {
    const flyout = (this.workspace as Blockly.WorkspaceSvg)
      .getToolbox()
      ?.getFlyout();
    if (!flyout) {
      return;
    }
    if (typeof flyout.hide === "function") {
      flyout.hide();
    }
    if (typeof flyout.setVisible === "function") {
      flyout.setVisible(false);
    }
  }

  isContinuousToolboxEnabled(): boolean {
    const plugins = this.WORKSPACE_OPTIONS.plugins as
      | Record<string, unknown>
      | undefined;
    return plugins?.toolbox === "ContinuousToolbox";
  }

  workspaceSaveBlocks(storageKey: string): void {
    const data = Blockly.serialization.workspaces.save(this.workspace);
    sanitizeSerializedWorkspaceState(data);
    window.sessionStorage?.setItem(storageKey, JSON.stringify(data));
  }

  workspaceLoadBlocks(storageKey: string): void {
    const data = window.sessionStorage?.getItem(storageKey);
    if (!data) {
      return;
    }
    try {
      const parsed = JSON.parse(data) as object;
      if (typeof parsed !== "object" || parsed === null) {
        console.warn("Invalid workspace data format, skipping load");
        return;
      }
      sanitizeSerializedWorkspaceState(parsed);
      this.isBulkLoading = true;
      try {
        this.workspace.clear();
        this.hasBlocks = false;
        Blockly.serialization.workspaces.load(parsed, this.workspace);
        this.hasBlocks = this.workspace.getTopBlocks(false).length > 0;
      } finally {
        this.isBulkLoading = false;
      }
      this.normalizeVariableTypes();
      refreshBoardPinDropdowns(this.workspace);
      syncProgramStructureAfterLoad(
        this.workspace,
        this.enforcers.programStructure,
      );
    } catch (error) {
      console.error("Failed to load workspace blocks:", error);
      window.sessionStorage?.removeItem(storageKey);
    }
  }

  workspaceSaveToFile(filename = "workspace.json"): void {
    const data = Blockly.serialization.workspaces.save(this.workspace);
    sanitizeSerializedWorkspaceState(data);
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public workspaceLoadFromFile(
    file: File,
    merge: boolean,
    onLoaded?: (code: string) => void,
  ): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          console.warn("Empty file content");
          return;
        }
        const parsed = JSON.parse(text) as Record<string, unknown>;
        if (typeof parsed !== "object" || parsed === null) {
          alert(getShellMessage("FILE_INVALID_FORMAT", this.language));
          return;
        }
        sanitizeSerializedWorkspaceState(parsed);
        this.isBulkLoading = true;
        try {
          if (merge && this.workspace.getTopBlocks(false).length > 0) {
            this.mergeBlocksFromState(parsed);
          } else {
            this.workspace.clear();
            this.hasBlocks = false;
            Blockly.serialization.workspaces.load(parsed, this.workspace);
            this.hasBlocks = this.workspace.getTopBlocks(false).length > 0;
          }
        } finally {
          this.isBulkLoading = false;
        }
        this.normalizeVariableTypes();
        refreshBoardPinDropdowns(this.workspace);
        syncProgramStructureAfterLoad(
          this.workspace,
          this.enforcers.programStructure,
        );
        this.workspaceSaveBlocks(this.autoSaveKey);
        const code = this.getCode();
        onLoaded?.(code);
        this.onCodeChange?.(code);
      } catch (error) {
        console.error("Failed to load workspace from file:", error);
        alert(getShellMessage("FILE_LOAD_ERROR", this.language));
      }
    };
    reader.onerror = (): void => {
      console.error("File reading error");
      alert(getShellMessage("FILE_READ_ERROR", this.language));
    };
    reader.readAsText(file);
  }

  removeDefaultItemVariable(): void {
    try {
      const variableMap = this.workspace.getVariableMap();
      for (const variable of variableMap.getAllVariables()) {
        if (variable?.getName() === "item") {
          variableMap.deleteVariable(variable);
          break;
        }
      }
    } catch (e) {
      console.debug("Error removing default item variable:", e);
    }
  }

  dispose(): void {
    this.setupPlugins(true);
    this.disposeCore();
  }

  private mount(): void {
    this.disposeCore();
    const wsOptions = this.WORKSPACE_OPTIONS as Blockly.BlocklyOptions;
    const { toolbox, theme, media, ...restWorkspace } = wsOptions;

    const originalToolbox = toolbox as ToolboxConfiguration | undefined;
    const shouldStripCustom =
      this.isContinuousToolboxEnabled() && originalToolbox;
    if (shouldStripCustom && originalToolbox) {
      wsOptions.toolbox = this.getToolboxWithoutCustomCategories(originalToolbox);
    }

    this.core = createUcBlockly(this.injectionDiv, {
      toolbox: (wsOptions.toolbox ?? toolbox) as ToolboxConfiguration,
      language: this.language,
      localizeToolbox: false,
      theme: theme as Blockly.Theme | string | undefined,
      media: typeof media === "string" ? media : "./media/",
      injectionTarget: this.injectionDiv,
      workspaceOptions: restWorkspace,
      enforcers: this.enforcers,
      plugins: this.pluginHost.getOptions(),
      onCodeChange: this.onCodeChange,
    });

    this.workspace = this.core.workspace;
    this.hasBlocks = this.workspace.getTopBlocks(false).length > 0;
    if (this.onCodeChange) {
      this.onCodeChange(this.core.getCode());
    }
    this.normalizeVariableTypes();
    this.attachVariableCreateListener();
    this.registerCustomToolboxCallbacks();

    if (shouldStripCustom && originalToolbox) {
      this.restoreToolboxAfterInject(originalToolbox, false);
    }
  }

  private disposeCore(): void {
    if (this.variableCreateListener) {
      this.workspace?.removeChangeListener(this.variableCreateListener);
      this.variableCreateListener = null;
    }
    if (this.core) {
      this.core.dispose();
      this.core = null;
    }
  }

  private applyConnectionCheckerToWorkspaceOptions(): void {
    if (!this.enforcers.strictConnectionChecker) {
      return;
    }
    const plugins =
      (this.WORKSPACE_OPTIONS.plugins as Record<string, unknown>) || {};
    if (!plugins.connectionChecker) {
      this.WORKSPACE_OPTIONS.plugins = {
        ...plugins,
        connectionChecker: StrictConnectionChecker,
      };
    }
  }

  private attachVariableCreateListener(): void {
    if (this.variableCreateListener) {
      this.workspace.removeChangeListener(this.variableCreateListener);
    }
    this.variableCreateListener = (e: Blockly.Events.Abstract) => {
      if (e.type !== Blockly.Events.VAR_CREATE) {
        return;
      }
      const varEvent = e as Blockly.Events.VarCreate;
      if (varEvent.varId) {
        this.normalizeVariableTypeById(varEvent.varId);
      }
      if (!varEvent.varName || !varEvent.varId) {
        return;
      }
      setTimeout(() => {
        try {
          const variableMap = this.workspace.getVariableMap();
          const existing = variableMap
            .getAllVariables()
            .find(
              (variable) =>
                variable &&
                variable.getName() === varEvent.varName &&
                variable.getId() !== varEvent.varId,
            );
          if (!existing) {
            return;
          }
          const existingId = existing.getId();
          const createdId = varEvent.varId;
          if (!existingId || !createdId) {
            return;
          }
          const uses = Blockly.Variables.getVariableUsesById(
            this.workspace,
            createdId,
          );
          uses.forEach((block: Blockly.Block) => {
            const varField = block.getField("VAR") as Blockly.FieldVariable | null;
            if (varField && varField.getValue() === createdId) {
              varField.setValue(existingId);
            }
          });
          const created = variableMap.getVariableById(createdId);
          if (created) {
            variableMap.deleteVariable(created);
          }
        } catch (err) {
          console.debug("Error deduplicating variable:", err);
        }
      }, 0);
    };
    this.workspace.addChangeListener(this.variableCreateListener);
  }

  private scheduleHasBlocksRefresh(): void {
    if (this.hasBlocksRefreshPending) {
      return;
    }
    this.hasBlocksRefreshPending = true;
    requestAnimationFrame(() => {
      this.hasBlocksRefreshPending = false;
      this.hasBlocks = this.workspace.getTopBlocks(false).length > 0;
    });
  }

  private normalizeVariableTypes(): void {
    const variableMap = this.workspace.getVariableMap();
    variableMap.getAllVariables().forEach((variable) => {
      const id = variable.getId();
      if (id) {
        this.normalizeVariableTypeById(id);
      }
    });
  }

  private normalizeVariableTypeById(variableId: string): void {
    try {
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) {
        return;
      }
      normalizeVariableType(variable);
    } catch (e) {
      console.debug("Error normalizing variable type:", e);
    }
  }

  private getToolboxWithoutCustomCategories(
    toolbox: ToolboxConfiguration,
  ): ToolboxConfiguration {
    const clone = JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
    const stripCustom = (items: Array<Record<string, unknown>>) =>
      items.map((item) => {
        if ("custom" in item) {
          const rest = { ...item };
          delete rest.custom;
          return { ...rest, contents: [] };
        }
        if (Array.isArray(item.contents)) {
          item.contents = stripCustom(item.contents);
        }
        return item;
      });
    if (Array.isArray(clone.contents)) {
      clone.contents = stripCustom(
        clone.contents as Array<Record<string, unknown>>,
      ) as unknown as ToolboxConfiguration["contents"];
    }
    return clone;
  }

  private closeFlyoutIfNotPinnedOpen(pinnedOpen: boolean): void {
    if (pinnedOpen) {
      return;
    }
    const close = (): void => {
      const flyout = (this.workspace as Blockly.WorkspaceSvg)
        .getToolbox()
        ?.getFlyout();
      if (!flyout) {
        return;
      }
      if (typeof flyout.hide === "function") {
        flyout.hide();
      }
      if (typeof flyout.setVisible === "function") {
        flyout.setVisible(false);
      }
    };
    close();
    if (this.isContinuousToolboxEnabled()) {
      requestAnimationFrame(() => {
        close();
        requestAnimationFrame(close);
      });
      window.setTimeout(close, 0);
    }
  }

  private mergeBlocksFromState(state: Record<string, unknown>): void {
    const blocksState = state.blocks as { blocks?: unknown[] } | undefined;
    if (!blocksState?.blocks?.length) {
      return;
    }
    const blockStates = blocksState.blocks as Array<Record<string, unknown>>;
    blockStates.forEach((blockState) => {
      if (blockState.type && !blockState.x && !blockState.y) {
        blockState.x = 50;
        blockState.y = 50;
      }
    });
    Blockly.serialization.workspaces.load(state, this.workspace, {
      recordUndo: true,
    });
    this.hasBlocks = this.workspace.getTopBlocks(false).length > 0;
  }
}
