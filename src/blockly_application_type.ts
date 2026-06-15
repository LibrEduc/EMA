/**
 * @packageDocumentation
 * @module BlocklyApplication
 * @description Core application type definitions and implementations for µcBlockly
 * @remarks
 * Defines the core application class, workspace lifecycle,
 * and plugin initialization for µcBlockly.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
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

import "@blockly/field-date";
import "@blockly/field-colour";
import "@blockly/field-colour-hsv-sliders";
import "@blockly/field-multilineinput";
import "@blockly/field-slider";
import * as Blockly from "blockly";
import "./categories/blockly/field_colour_picker";
import {
  registerStrictConnectionChecker,
  registerStrictConnectionCheckerInRegistry,
  StrictConnectionChecker,
} from "./generators/arduino/strict_connection_checker";
import {
  installStrictTypeEnforcer,
  uninstallStrictTypeEnforcer,
} from "./generators/arduino/strict_type_enforcer";
import { registerTypedVariablesCategory } from "./generators/arduino/typed_variables_flyout";
import { debugLog } from "./generators/arduino/debug";
import { normalizeVariableType } from "./generators/arduino/variable_utils";
import {
  patchBlocklyDefensive,
  patchConnectionCheckerForConstBlock,
  patchFieldVariableValidation,
  patchVariableMapCreateVariable,
} from "./blockly_patches";

// Diagnostic switch (stepwise re-enable):
// 1) configureStandardBlocks only (in index.ts)
// 2) block types registry
// 3) typed variable blocks
// 4) strict connection checker (this file)
const ENABLE_STRICT_CONNECTION_CHECKER = false;
const ENABLE_STRICT_TYPE_ENFORCER = true;
const ENABLE_WORKSPACE_SEARCH_PLUGIN = true;

// Register our checker BEFORE any workspace is created so ConnectionDB gets it at init.
if (ENABLE_STRICT_CONNECTION_CHECKER) {
  registerStrictConnectionCheckerInRegistry();
}
patchConnectionCheckerForConstBlock();
patchBlocklyDefensive();

import { µcB_codeEditor } from "./code_editor";
import { µcB_addFlexResizerEvents } from "./workspace_flex";
import {
  registerWorkspaceForSvgResize,
  µcB_workspaceOnResize,
} from "./workspace_resize";
import { ToolboxConfiguration, getToolboxForCurrentBoard } from "./toolbox";
import { themeMappings } from "./options";
import { pushStateReplaceSearchParam } from "./tools";
import { arduinoGenerator } from "./generators/arduino";
import { languagesMap, languagesMapBlockly } from './languages/languageMap';
import {
  changeLanguageToolbox as translateToolbox,
  getLangParamFromDropdown,
  getLangParamFromUrl,
  HTML_changeLanguage,
} from './language';
import { mergeArrayMessages } from './languages/array_messages';
import { mergeBoardMessages } from './languages/board_messages';
import { refreshBoardPinDropdowns } from './categories/blockly';

/* import {blocks, unregisterProcedureBlocks} from '@blockly/block-shareable-procedures';
unregisterProcedureBlocks();
Blockly.common.defineBlocks(blocks);*/
import { Backpack } from "@blockly/workspace-backpack";
import { ContentHighlight } from "@blockly/workspace-content-highlight";
//import { KeyboardNavigation } from '@blockly/keyboard-navigation';
import { Modal } from "@blockly/plugin-modal";
import { PositionedMinimap } from "@blockly/workspace-minimap";
//import { shadowBlockConversionChangeListener } from "@blockly/shadow-block-converter";

import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";
// Don't use the official plugin - it's too strict for our use case
// import {pluginInfo as StrictConnectionsPluginInfo} from '@blockly/plugin-strict-connection-checker';
//import * as SuggestedBlocks from '@blockly/suggested-blocks';
//import { Multiselect } from '@mit-app-inventor/blockly-plugin-workspace-multiselect';
//import { LexicalVariablesPlugin } from '@mit-app-inventor/blockly-block-lexical-variables';

// Set up UI elements
const div_workspace_content_blockly: HTMLElement = document.getElementById("div_workspace_content_blockly")!;
const div_content_code: HTMLElement = document.getElementById('div_content_code')!;

/** Application state and configuration (workspace, toolbox, language, plugins). */
export interface BlocklyApplicationType {
  workspace: Blockly.Workspace;
  toolbox: ToolboxConfiguration;
  toolboxChoice: string;
  LANGUAGE_NAME: Record<string, string>;
  LANGUAGE_RTL: string[];
  PLUGINS: string[];
  WORKSPACE_OPTIONS: Record<string, unknown>;
}
export class BlocklyApplication implements BlocklyApplicationType {
  workspace: Blockly.Workspace;
  toolbox: ToolboxConfiguration;
  toolboxChoice: string;
  LANGUAGE_NAME: Record<string, string>;
  LANGUAGE_RTL: string[];
  PLUGINS: string[];
  WORKSPACE_OPTIONS: Record<string, unknown>;
  constructor(toolbox: ToolboxConfiguration, WORKSPACE_OPTIONS: Record<string, unknown>, injection_div: HTMLElement) {
    this.toolbox = toolbox;
    this.toolboxChoice = "cat";
    this.LANGUAGE_NAME = {};
    this.LANGUAGE_RTL = [];
    this.PLUGINS = [];
    this.WORKSPACE_OPTIONS = WORKSPACE_OPTIONS;

    // Apply locale and messages (lists/arrays) before first injection.
    const initialLang = getLangParamFromUrl();
    Blockly.setLocale(languagesMapBlockly[initialLang]);
    mergeArrayMessages(initialLang);
    mergeBoardMessages(initialLang);
    const initialCustom = languagesMap[initialLang];
    if (initialCustom) {
      const msg = Blockly.Msg as Record<string, string>;
      [
        "VARIABLES_GET_ITEM",
        "ARRAY_UNE_LISTE",
        "ARRAY_WITH_TOOLTIP",
        "ARRAY_WITH_HELPURL",
        "LIBRE_TOOLTIP",
        "LIBRE_LOOP_DO",
        "TOOLBOX_SEARCH_PLACEHOLDER",
        "TOOLBOX_SEARCH_HINT",
        "TOOLBOX_SEARCH_NO_MATCH",
      ].forEach((key) => {
        const value = initialCustom[key as keyof typeof initialCustom];
        if (value !== undefined) msg[key] = value;
      });
    }

    // Theme on first load (avoids "Style libre_category must exist" on inject).
    const themeFromUrl = new URLSearchParams(window.location.search).get("theme");
    const themeFromMenu = (document.getElementById("themeMenu") as HTMLSelectElement | null)?.value;
    const initialThemeKey =
      (themeFromUrl && Object.prototype.hasOwnProperty.call(themeMappings, themeFromUrl)
        ? themeFromUrl
        : themeFromMenu && Object.prototype.hasOwnProperty.call(themeMappings, themeFromMenu)
          ? themeFromMenu
          : "classic") as keyof typeof themeMappings;
    this.WORKSPACE_OPTIONS["theme"] = themeMappings[initialThemeKey] ?? themeMappings.classic;

    // Force checker via plugins only when strict typing overlay is enabled.
    const plugins = (WORKSPACE_OPTIONS.plugins as Record<string, unknown>) || {};
    if (ENABLE_STRICT_CONNECTION_CHECKER && !plugins.connectionChecker) {
      WORKSPACE_OPTIONS.plugins = {
        ...plugins,
        connectionChecker: StrictConnectionChecker,
      };
    }
    this.workspace = Blockly.inject(injection_div, WORKSPACE_OPTIONS);
    this.hasBlocks = this.workspace.getTopBlocks(false).length > 0;
    Blockly.ContextMenuItems.registerCommentOptions();
    patchFieldVariableValidation();

    this.normalizeVariableTypes();
    patchVariableMapCreateVariable(this.workspace);
    if (ENABLE_STRICT_TYPE_ENFORCER) {
      installStrictTypeEnforcer(this.workspace, {
        mode: "disconnect",
        scope: "variables-only",
      });
    }

    // Listen for variable creation events to normalize variable types
    this.workspace.addChangeListener((e: Blockly.Events.Abstract) => {
      if (e.type === Blockly.Events.VAR_CREATE) {
        const varEvent = e as Blockly.Events.VarCreate;
        if (varEvent.varId) {
          this.normalizeVariableTypeById(varEvent.varId);
        }
        if (varEvent.varName && varEvent.varId) {
          // De-duplicate variables created with the same name.
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
        }
      }
    });

    // Checker already set via registry before inject; no need to replace (ConnectionDB would keep old one).
    this.registerCustomToolboxCallbacks();
  }
  backpackOptions = {
    allowEmptyBackpackOpen: true,
    useFilledBackpackImage: true,
    skipSerializerRegistration: false,
    contextMenu: {
      emptyBackpack: true,
      removeFromBackpack: true,
      copyToBackpack: true,
      copyAllToBackpack: true,
      pasteAllToBackpack: true,
      disablePreconditionChecks: true,
    },
  };
  plugin_backpack = new Backpack();
  plugin_contentHighlight = new ContentHighlight();
  //plugin_keyboardNav = new KeyboardNavigation();
  plugin_minimap = new PositionedMinimap();
  plugin_modal = new Modal();
  plugin_workspaceSearch: { init: () => void; dispose: () => void } | null = null;
  plugin_zoomToFit = new ZoomToFitControl();
  private pluginsInitialized = false;
  private pluginsWorkspace: Blockly.Workspace | null = null;
  private saveBlocksTimer: number | null = null;
  private codegenTimer: number | null = null;
  private autoSaveEnabled = false;
  private isBulkLoading = false;
  private hasBlocks = false;
  private hasBlocksRefreshPending = false;

  /**
   * Enables or disables automatic workspace persistence from change listeners.
   * @param enabled - True to enable auto-save, false to suspend it.
   */
  public setAutoSaveEnabled = (enabled: boolean): void => {
    this.autoSaveEnabled = enabled;
  };
  /**
   * Registers workspace change listeners and debounces persistence/codegen.
   * @remarks
   * Saves workspace state to session storage and regenerates code after
   * meaningful changes, skipping UI-only and drag events.
   */
  private readonly workspaceListeners = (): void => {
    const scheduleSave = (): void => {
      if (this.saveBlocksTimer !== null) {
        window.clearTimeout(this.saveBlocksTimer);
      }
      this.saveBlocksTimer = window.setTimeout(() => {
        this.workspaceSaveBlocks("mainWorkspace_blocks");
        this.saveBlocksTimer = null;
      }, 250);
    };

    const scheduleCodegen = (): void => {
      if (this.codegenTimer !== null) {
        window.clearTimeout(this.codegenTimer);
      }
      this.codegenTimer = window.setTimeout(() => {
        const code = arduinoGenerator.workspaceToCode(this.workspace);
        µcB_codeEditor.setValue(code);
        div_content_code.textContent = code;
        this.codegenTimer = null;
      }, 150);
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
      scheduleCodegen();
    });
  };

  /**
   * Returns whether workspace currently contains top-level blocks.
   */
  public workspaceHasAnyBlocks = (): boolean => {
    return this.hasBlocks;
  };

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

  /**
   * Removes the default "item" variable created by Blockly.
   * @remarks
   * Call this after workspace initialization and after loading blocks
   * to avoid unwanted default variables in user workspaces.
   */
  public removeDefaultItemVariable(): void {
    try {
      const variableMap = this.workspace.getVariableMap();
      const allVariables = variableMap.getAllVariables();

      // Find and delete the 'item' variable
      for (const variable of allVariables) {
        if (!variable) {
          continue;
        }
        if (variable.getName() === 'item') {
          variableMap.deleteVariable(variable);
          debugLog('🗑️ Variable "item" removed');
          break;
        }
      }
    } catch (e) {
      console.debug('Error removing default item variable:', e);
    }
  }

  /**
   * Initializes workspace resize behavior and listeners.
   * @remarks
   * Attaches window resize handlers, flex resizer events, and workspace
   * change listeners for code generation and persistence.
   */
  public workspaceInit = (): void => {
    window.addEventListener("resize", µcB_workspaceOnResize, false);
    µcB_addFlexResizerEvents();
    this.workspaceListeners();
  };

  /**
   * Applies a Blockly theme and reboots the workspace.
   * @param themeChoice - Optional theme key; defaults to the theme menu selection.
   * @returns The applied theme key.
   * @remarks
   * Updates workspace options, refreshes the workspace, and syncs the URL.
   */
  public changeTheme = (themeChoice?: string): string => {
    if (!themeChoice)
      themeChoice = (document.getElementById('themeMenu') as HTMLSelectElement).value;
    this.WORKSPACE_OPTIONS['theme'] = themeMappings[themeChoice];
    if (themeMappings.hasOwnProperty(themeChoice) && !this.isContinuousToolboxEnabled()) {
      (this.workspace as Blockly.WorkspaceSvg).setTheme(themeMappings[themeChoice]);
    }
    this.workspaceReboot();
    pushStateReplaceSearchParam("theme", themeChoice);
    return themeChoice;
  }

  /**
   * Applies a Blockly renderer and reboots the workspace.
   * @param renderNew - Optional renderer key; defaults to the renderer menu selection.
   * @returns The applied renderer key.
   * @remarks
   * Falls back to "geras" if the renderer is not registered and syncs the URL.
   */
  public changeRenderer = (renderNew: string = (document.getElementById('rendererMenu') as HTMLSelectElement).value): string => {
    if (!Blockly.registry.hasItem(Blockly.registry.Type.RENDERER, renderNew)) {
      renderNew = "geras";
      const rendererMenu = document.getElementById("rendererMenu") as HTMLSelectElement | null;
      if (rendererMenu) {
        rendererMenu.value = renderNew;
      }
    }
    this.WORKSPACE_OPTIONS['renderer'] = renderNew;
    this.workspaceReboot();
    pushStateReplaceSearchParam("renderer", renderNew);
    return renderNew;
  }

  /**
   * Recreates the workspace while preserving user state.
   * @remarks
   * Saves blocks, disposes the current workspace, re-injects with updated
   * options (theme/renderer/toolbox), restores plugins, and reloads blocks.
   */
  public workspaceReboot = (): void => {
    this.closeFlyoutForReboot();
    if (this.autoSaveEnabled) {
      this.workspaceSaveBlocks("mainWorkspace_blocks");
    }
    // Sync host div + SVG metrics before tearing down plugins (minimap uses them on dispose).
    µcB_workspaceOnResize();
    Blockly.svgResize(this.workspace as Blockly.WorkspaceSvg);
    this.workspaceSetupPlugins(true);
    if (ENABLE_STRICT_TYPE_ENFORCER) {
      uninstallStrictTypeEnforcer(this.workspace);
    }
    this.workspace.dispose();
    // Ensure current language is applied to toolbox AND Blockly
    const currentLang = getLangParamFromUrl();
    this.changeLanguageToolbox(currentLang);
    Blockly.setLocale(languagesMapBlockly[currentLang]);
    mergeArrayMessages(currentLang);
    mergeBoardMessages(currentLang);
    const originalToolbox = this.WORKSPACE_OPTIONS.toolbox as
      | ToolboxConfiguration
      | undefined;
    const shouldStripCustom =
      this.isContinuousToolboxEnabled() && originalToolbox;
    if (shouldStripCustom) {
      this.WORKSPACE_OPTIONS.toolbox =
        this.getToolboxWithoutCustomCategories(originalToolbox);
    }
    this.workspace = Blockly.inject(
      div_workspace_content_blockly,
      this.WORKSPACE_OPTIONS,
    );
    registerWorkspaceForSvgResize(this.workspace);
    // Reconnect required mechanisms after reinjection
    if (ENABLE_STRICT_CONNECTION_CHECKER) {
      registerStrictConnectionChecker(this.workspace);
    }
    this.registerCustomToolboxCallbacks();
    if (shouldStripCustom && originalToolbox) {
      (this.workspace as Blockly.WorkspaceSvg).updateToolbox(originalToolbox);
      this.WORKSPACE_OPTIONS.toolbox = originalToolbox;
      this.registerCustomToolboxCallbacks();
      const toolbox = (this.workspace as Blockly.WorkspaceSvg).getToolbox?.();
      if (toolbox && typeof toolbox.refreshSelection === "function") {
        toolbox.refreshSelection();
      }
      // refreshSelection() selects a category and opens the flyout; if the user did not
      // enable "always opened flyout", close it so metrics match the real workspace area.
      const alwaysOpenedFlyoutCb = document.getElementById(
        "alwaysOpenedToolboxFlyout",
      ) as HTMLInputElement | null;
      if (alwaysOpenedFlyoutCb && !alwaysOpenedFlyoutCb.checked && toolbox) {
        const flyoutAfterRefresh = toolbox.getFlyout?.();
        if (flyoutAfterRefresh) {
          if (typeof flyoutAfterRefresh.hide === "function") {
            flyoutAfterRefresh.hide();
          }
          if (typeof flyoutAfterRefresh.setVisible === "function") {
            flyoutAfterRefresh.setVisible(false);
          }
        }
        µcB_workspaceOnResize();
        Blockly.svgResize(this.workspace as Blockly.WorkspaceSvg);
        (this.workspace as Blockly.WorkspaceSvg).resize();
      }
    }
    patchFieldVariableValidation();
    patchVariableMapCreateVariable(this.workspace);
    if (ENABLE_STRICT_TYPE_ENFORCER) {
      installStrictTypeEnforcer(this.workspace, {
        mode: "disconnect",
        scope: "variables-only",
      });
    }
    this.workspaceListeners();
    // Ensure toolbox / continuous layout has reported size before plugins (minimap) read metrics.
    µcB_workspaceOnResize();
    Blockly.svgResize(this.workspace as Blockly.WorkspaceSvg);
    (this.workspace as Blockly.WorkspaceSvg).resize();
    // Initialize plugins; with continuous toolbox, minimap init is deferred so load runs after metrics exist.
    this.workspaceSetupPlugins(false, () => {
      const isThereMinimap: HTMLElement = document.getElementsByClassName(
        "blockly-minimap",
      )[0] as HTMLElement;
      if (isThereMinimap) {
        const pluginMinimapCheck = <HTMLInputElement>(
          document.getElementById("pluginMinimap")
        );
        isThereMinimap.style.visibility = pluginMinimapCheck.checked
          ? "visible"
          : "hidden";
      }
      this.workspaceLoadBlocks("mainWorkspace_blocks");
      (this.workspace as Blockly.WorkspaceSvg).scrollCenter();
      this.applyAlwaysOpenedToolboxFlyout();
    });
  };

  /**
   * Initializes or disposes workspace plugins.
   * @param disposePlugin - When true, disposes plugins; otherwise initializes them.
   * @remarks
   * Prevents double initialization and wires change listeners as needed.
   */
  public workspaceSetupPlugins = (
    disposePlugin: boolean = false,
    onPluginsReady?: () => void,
  ): void => {
    const pluginHighlightCheck: HTMLInputElement = document.getElementById("pluginHighlight") as HTMLInputElement;
    if (disposePlugin) {
      if (!this.pluginsInitialized) {
        this.pluginsWorkspace = null;
        return;
      }
      // shadow-block-converter disabled: causes array blocks to disappear / not stay clipped
      // this.workspace.removeChangeListener(shadowBlockConversionChangeListener);
      // Dispose minimap first: it listens to workspace metrics; other plugins' dispose may fire
      // events that update the minimap SVG with NaN if minimap is still attached.
      try {
        this.plugin_minimap.dispose();
      } catch {
        // no-op if already disposed
      }
      try {
        this.plugin_contentHighlight.dispose();
      } catch {
        // no-op if never initialized
      }
      try {
        this.plugin_backpack.dispose();
      } catch {
        // no-op if already disposed
      }
      try {
        this.plugin_modal.dispose();
      } catch {
        // no-op if already disposed
      }
      try {
        this.plugin_workspaceSearch?.dispose();
      } catch {
        // no-op if already disposed
      }
      try {
        this.plugin_zoomToFit.dispose();
      } catch {
        // no-op if already disposed
      }
      this.pluginsInitialized = false;
      this.pluginsWorkspace = null;
      //this.plugin_keyboardNav.navigationController.removeWorkspace(this.workspace);
      //this.plugin_keyboardNav.navigationController.disable(this.workspace);
    } else {
      // Idempotent init: avoid duplicate component registration on same workspace.
      if (this.pluginsInitialized && this.pluginsWorkspace === this.workspace) {
        return;
      }
      // Workspace changed without explicit dispose; clean previous plugin instances first.
      if (this.pluginsInitialized && this.pluginsWorkspace !== this.workspace) {
        this.workspaceSetupPlugins(true);
      }
      this.plugin_backpack = new Backpack(
        this.workspace as Blockly.WorkspaceSvg,
        this.backpackOptions,
      );
      this.plugin_modal = new Modal(this.workspace);
      this.plugin_workspaceSearch = new WorkspaceSearch(
        this.workspace as Blockly.WorkspaceSvg,
      );
      this.plugin_zoomToFit = new ZoomToFitControl(this.workspace);
      // shadow-block-converter disabled: causes array blocks to disappear / not stay clipped
      // this.workspace.addChangeListener(shadowBlockConversionChangeListener);
      this.plugin_backpack.init();
      if (pluginHighlightCheck.checked) {
        this.plugin_contentHighlight = new ContentHighlight(this.workspace as Blockly.WorkspaceSvg);
        this.plugin_contentHighlight.init();
      }
      this.plugin_modal.init();
      if (ENABLE_WORKSPACE_SEARCH_PLUGIN) {
        this.plugin_workspaceSearch?.init();
      }
      this.plugin_zoomToFit.init();
      // Mark sync plugins ready immediately so a second workspaceSetupPlugins (e.g. window.onload
      // after pluginsSetupWorkspace → workspaceReboot) does not register Backpack twice. Minimap may
      // still be created in finishMinimapAndPlugins (sync or deferred for continuous toolbox).
      this.pluginsInitialized = true;
      this.pluginsWorkspace = this.workspace;
      const svgWs = this.workspace as Blockly.WorkspaceSvg;
      const finishMinimapAndPlugins = (): void => {
        Blockly.svgResize(svgWs);
        this.plugin_minimap = new PositionedMinimap(this.workspace);
        Blockly.svgResize(svgWs);
        this.plugin_minimap.init();
        const pluginMinimapCheck: HTMLInputElement | null =
          document.getElementById("pluginMinimap") as HTMLInputElement | null;
        const minimapEl = document.getElementsByClassName(
          "blockly-minimap",
        )[0] as HTMLElement | undefined;
        if (minimapEl) {
          minimapEl.style.visibility = pluginMinimapCheck?.checked
            ? "visible"
            : "hidden";
        }
        onPluginsReady?.();
      };
      // Defer minimap only during reboot (callback provided): continuous toolbox layout can be
      // 0/NaN until after paint. Startup calls workspaceSetupPlugins(false) without callback — keep sync.
      const deferMinimap =
        this.isContinuousToolboxEnabled() && typeof onPluginsReady === "function";
      if (deferMinimap) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            finishMinimapAndPlugins();
          });
        });
      } else {
        finishMinimapAndPlugins();
      }
      //this.plugin_keyboardNav.navigationController.addWorkspace(this.workspace);
      //this.plugin_keyboardNav.navigationController.enable(this.workspace);
    }
    /* it seems there's conflict with nav keyboard copy function
    const options = {
      contextMenu: true,
      shortcut: true
    } 
    const crossTabCopyPastePlugin = new CrossTabCopyPaste();
    crossTabCopyPastePlugin.init(options);*/
  };

  /**
   * Registers callbacks for custom toolbox categories.
   * @remarks
   * Required after workspace re-injection to restore dynamic category content.
   */
  public registerCustomToolboxCallbacks(): void {
    const svgWorkspace = this.workspace as Blockly.WorkspaceSvg;
    registerTypedVariablesCategory(svgWorkspace);
    if (Blockly.Procedures && typeof Blockly.Procedures.flyoutCategory === "function") {
      svgWorkspace.registerToolboxCategoryCallback(
        Blockly.Procedures.CATEGORY_NAME ?? "PROCEDURE",
        (workspace) => Blockly.Procedures.flyoutCategory(workspace, false),
      );
    }
  }

  /**
   * Restores hooks and patches after workspace injection.
   * @remarks
   * Reattaches strict checker, variable validation patches, and listeners.
   */
  public restoreWorkspaceAfterInject(): void {
    if (ENABLE_STRICT_CONNECTION_CHECKER) {
      registerStrictConnectionChecker(this.workspace);
    }
    this.registerCustomToolboxCallbacks();
    patchFieldVariableValidation();
    patchVariableMapCreateVariable(this.workspace);
    if (ENABLE_STRICT_TYPE_ENFORCER) {
      installStrictTypeEnforcer(this.workspace, {
        mode: "disconnect",
        scope: "variables-only",
      });
    }
    this.workspaceListeners();
  }

  /**
   * Temporarily strips custom categories for the continuous toolbox.
   * @returns The original toolbox configuration, or null if not applicable.
   */
  public stripCustomCategoriesForContinuousToolbox(): ToolboxConfiguration | null {
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

  /**
   * Restores the original toolbox after workspace injection.
   * @param originalToolbox - The toolbox configuration saved before injection.
   */
  public restoreToolboxAfterInject(
    originalToolbox: ToolboxConfiguration | null,
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
  }

  /**
   * Applies the "always opened flyout" setting to the toolbox flyout.
   */
  public applyAlwaysOpenedToolboxFlyout(): void {
    const checkbox = document.getElementById(
      "alwaysOpenedToolboxFlyout",
    ) as HTMLInputElement | null;
    if (!checkbox) {
      return;
    }
    const flyout = (this.workspace as Blockly.WorkspaceSvg)
      .getToolbox()
      ?.getFlyout();
    if (!flyout) {
      return;
    }
    const shouldStayOpen = checkbox.checked;
    if (typeof (flyout as Blockly.Flyout).setAutoClose === "function") {
      (flyout as Blockly.Flyout).setAutoClose(!shouldStayOpen);
    }
    if (typeof (flyout as Blockly.Flyout).autoHide === "function") {
      (flyout as Blockly.Flyout).autoHide(!shouldStayOpen);
    }

    const snapLayout = (): void => {
      µcB_workspaceOnResize();
      const ws = this.workspace as Blockly.WorkspaceSvg;
      Blockly.svgResize(ws);
      // Reposition toolbox/flyout and refresh scrollbars after container/svg size changes.
      if (typeof ws.resize === "function") {
        ws.resize();
      }
    };

    const closeFlyoutIfPresent = (): void => {
      const f = (this.workspace as Blockly.WorkspaceSvg)
        .getToolbox()
        ?.getFlyout();
      if (!f) {
        return;
      }
      if (typeof f.hide === "function") {
        f.hide();
      }
      if (typeof f.setVisible === "function") {
        f.setVisible(false);
      }
      snapLayout();
    };

    if (shouldStayOpen && typeof (flyout as Blockly.Flyout).setVisible === "function") {
      (flyout as Blockly.Flyout).setVisible(true);
      snapLayout();
      return;
    }

    // Case "flyout not pinned open": ensure it is closed. The continuous toolbox may
    // auto-open the first category during init; closing + snap fixes workspace size.
    closeFlyoutIfPresent();
    if (this.isContinuousToolboxEnabled()) {
      const resyncIfStillClosed = (): void => {
        const cb = document.getElementById(
          "alwaysOpenedToolboxFlyout",
        ) as HTMLInputElement | null;
        if (cb?.checked) {
          return;
        }
        closeFlyoutIfPresent();
      };
      window.requestAnimationFrame(() => {
        resyncIfStillClosed();
        window.requestAnimationFrame(resyncIfStillClosed);
      });
      window.setTimeout(resyncIfStillClosed, 0);
    }
  }

  /**
   * Closes the toolbox flyout before workspace reboot.
   */
  private closeFlyoutForReboot(): void {
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

  /**
   * Checks whether the continuous toolbox plugin is enabled.
   */
  private isContinuousToolboxEnabled(): boolean {
    const plugins = this.WORKSPACE_OPTIONS["plugins"] as
      | Record<string, unknown>
      | undefined;
    return plugins?.["toolbox"] === "ContinuousToolbox";
  }

  /**
   * Returns a toolbox configuration with custom categories removed.
   * @param toolbox - Source toolbox configuration.
   * @returns A deep-cloned toolbox without custom category callbacks.
   */
  private getToolboxWithoutCustomCategories(
    toolbox: ToolboxConfiguration,
  ): ToolboxConfiguration {
    const clone = JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
    const stripCustom = (items: Array<Record<string, unknown>>) => {
      return items.map((item) => {
        if ("custom" in item) {
          const rest = { ...item };
          delete rest.custom;
          return {
            ...rest,
            contents: [],
          };
        }
        if (Array.isArray(item.contents)) {
          item.contents = stripCustom(item.contents);
        }
        return item;
      });
    };
    if (Array.isArray(clone.contents)) {
      clone.contents = stripCustom(
        clone.contents as Array<Record<string, unknown>>,
      ) as unknown as ToolboxConfiguration["contents"];
    }
    return clone;
  }


  /**
   * Applies language, theme, and renderer based on URL/query or UI.
   * @remarks
   * Reads URL params, updates UI dropdowns, updates workspace options,
   * and syncs values back into session storage and history.
   */
  public setParamsBlockly = (): void => {
    const searchParams = new URLSearchParams(window.location.search);
    let newParam: string | null;
    let dropdownMenu: HTMLSelectElement;
    let rendererFromUrl = false;
    newParam = searchParams.get('lang');
    dropdownMenu = document.getElementById('languageMenu') as HTMLSelectElement;
    if (newParam == null || newParam == "null")
      newParam = dropdownMenu.options[dropdownMenu.selectedIndex].value;
    else
      (document.getElementById('languageMenu')! as HTMLSelectElement).value = newParam;
    window.sessionStorage?.setItem('paramLang', newParam);
    pushStateReplaceSearchParam("lang", newParam);

    newParam = searchParams.get('theme');
    dropdownMenu = document.getElementById('themeMenu') as HTMLSelectElement;
    if (newParam == null || newParam == "null")
      newParam = dropdownMenu.options[dropdownMenu.selectedIndex].value;
    else {
      (document.getElementById('themeMenu')! as HTMLSelectElement).value = newParam;
    }
    const mappedTheme = themeMappings[newParam] ?? themeMappings.classic;
    this.WORKSPACE_OPTIONS['theme'] = mappedTheme;
    if (this.workspace && themeMappings.hasOwnProperty(newParam)) {
      (this.workspace as Blockly.WorkspaceSvg).setTheme(mappedTheme);
    }
    window.sessionStorage?.setItem('paramTheme', newParam);
    pushStateReplaceSearchParam("theme", newParam);

    const previousRenderer = String(this.WORKSPACE_OPTIONS['renderer'] ?? "");
    newParam = searchParams.get('renderer');
    dropdownMenu = document.getElementById('rendererMenu') as HTMLSelectElement;
    if (newParam == null || newParam == "null")
      newParam = dropdownMenu.options[dropdownMenu.selectedIndex].value;
    else {
      (document.getElementById('rendererMenu')! as HTMLSelectElement).value = newParam;
      rendererFromUrl = true;
    }
    this.WORKSPACE_OPTIONS['renderer'] = newParam;
    window.sessionStorage?.setItem('paramRenderer', newParam);
    pushStateReplaceSearchParam("renderer", newParam);
    // Reboot only when URL requests a different renderer than current state.
    if (rendererFromUrl && this.workspace && previousRenderer !== newParam) {
      this.changeRenderer(newParam);
    }

    newParam = searchParams.get('board');
    const boardMenu = document.getElementById('boardMenu') as HTMLSelectElement | null;
    if (boardMenu && boardMenu.options.length > 0) {
      const fallbackBoard = boardMenu.options[boardMenu.selectedIndex]?.value
        ?? boardMenu.options[0].value;
      if (newParam == null || newParam == "null") {
        newParam = fallbackBoard;
      } else if (Array.from(boardMenu.options).some((option) => option.value === newParam)) {
        boardMenu.value = newParam;
      } else {
        newParam = fallbackBoard;
      }
      window.sessionStorage?.setItem('paramBoard', newParam);
      pushStateReplaceSearchParam("board", newParam);
    }
    // Sync toolbox (and pin dropdowns) with current board when board came from URL or default.
    if (this.workspace) {
      this.syncToolboxAndPinsToCurrentBoard();
    }
  };

  /**
   * Updates the workspace toolbox to include or remove the board category
   * according to the current board selection, and refreshes pin dropdowns.
   */
  public syncToolboxAndPinsToCurrentBoard = (): void => {
    if (!this.workspace) return;
    const lang = getLangParamFromUrl();
    const toolbox = translateToolbox(lang, getToolboxForCurrentBoard(this.toolbox));
    (this.workspace as Blockly.WorkspaceSvg).updateToolbox(toolbox);
    refreshBoardPinDropdowns(this.workspace);
  };

  /**
   * Enables plugins based on URL options and stored preferences.
   * @remarks
   * Applies toggles for minimap, highlight, continuous toolbox, flyout,
   * and code editor based on session storage and URL parameters.
   */
  public pluginsSetupWorkspace = (): void => {
    const searchParams = new URLSearchParams(window.location.search);
    let paramsURL: string[] = [""];
    if (searchParams.get('options') !== null) {
      paramsURL = searchParams.get('options')!.split(',');
      //clean array from all null or undefined entry
      paramsURL = paramsURL.filter(Boolean);
    }
    const minimapParam = searchParams.get('minimap');
    const minimapFromUrl = minimapParam !== null
      && minimapParam !== "0"
      && minimapParam !== "false";
    if (
      (window.sessionStorage.getItem('pluginMinimap') == "true")
      || (paramsURL.includes('minimap'))
      || minimapFromUrl
    ) {
      const pluginMinimapCheck: HTMLInputElement = document.getElementById("pluginMinimap") as HTMLInputElement;
      pluginMinimapCheck.checked = true;
      pluginMinimapCheck.dispatchEvent(new Event('change'));
    }
    if ((window.sessionStorage.getItem('pluginHighlight') == "true") || (paramsURL.includes('highlight'))) {
      const pluginHighlightCheck: HTMLInputElement = document.getElementById("pluginHighlight") as HTMLInputElement;
      pluginHighlightCheck.checked = true;
      pluginHighlightCheck.dispatchEvent(new Event('change'));
    }
    if ((window.sessionStorage.getItem('pluginContinuousToolbox') == "true") || (paramsURL.includes('ctoolbox'))) {
      const pluginContinuousToolboxCheck: HTMLInputElement = document.getElementById("pluginContinuousToolbox") as HTMLInputElement;
      pluginContinuousToolboxCheck.checked = true;
      pluginContinuousToolboxCheck.dispatchEvent(new Event('change'));
    }
    if ((window.sessionStorage.getItem('alwaysOpenedToolboxFlyout') == "true") || (paramsURL.includes('flyout'))) {
      const alwaysOpenedToolboxFlyoutCheck: HTMLInputElement = document.getElementById("alwaysOpenedToolboxFlyout") as HTMLInputElement;
      alwaysOpenedToolboxFlyoutCheck.checked = true;
      this.applyAlwaysOpenedToolboxFlyout();
    }
    if ((window.sessionStorage.getItem('codeEditorSwitch') == "true") || (paramsURL.includes('codeEditor'))) {
      const codeEditorSwitchCheck: HTMLInputElement = document.getElementById("codeEditorSwitch") as HTMLInputElement;
      codeEditorSwitchCheck.checked = true;
      codeEditorSwitchCheck.dispatchEvent(new Event('change'));
      const monacoContainer = document.getElementById("div_content_monacoEditor") as HTMLElement | null;
      if (monacoContainer) {
        void µcB_codeEditor.ensureInitialized(monacoContainer);
      }
    }
    if (
      (window.sessionStorage.getItem('debugSwitch') == "true") ||
      (paramsURL.includes('debug')) ||
      (window.localStorage?.getItem('ucbDebug') === '1')
    ) {
      const debugSwitchCheck: HTMLInputElement = document.getElementById("debugSwitch") as HTMLInputElement;
      debugSwitchCheck.checked = true;
      debugSwitchCheck.dispatchEvent(new Event('change'));
    }
  };
  /**
   * Saves workspace blocks to session storage.
   * @param storageKeyWorkspaceBlocks - Storage key used to persist blocks.
   */
  public workspaceSaveBlocks = (storageKeyWorkspaceBlocks: string): void => {
    const data = Blockly.serialization.workspaces.save(this.workspace);
    this.sanitizeSerializedWorkspaceState(data);
    window.sessionStorage?.setItem(storageKeyWorkspaceBlocks, JSON.stringify(data));
  };

  /**
   * Loads workspace blocks from session storage.
   * @param storageKeyWorkspaceBlocks - Storage key used to load blocks.
   * @returns Returns early if no saved data exists or if loading fails.
   * @remarks
   * Includes error handling for corrupted data and validates the structure
   * before attempting to load into the workspace.
   */
  public workspaceLoadBlocks = (storageKeyWorkspaceBlocks: string): void => {
    const data = window.sessionStorage?.getItem(storageKeyWorkspaceBlocks);
    if (!data) return;
    
    try {
      const parsed = JSON.parse(data);
      // Basic validation: ensure it's an object
      if (typeof parsed !== 'object' || parsed === null) {
        console.warn('Invalid workspace data format, skipping load');
        return;
      }
      this.sanitizeSerializedWorkspaceState(parsed);
      // Keep Blockly events active so plugins (minimap) stay synchronized on restore.
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
    } catch (error) {
      console.error('Failed to load workspace blocks:', error);
      // Remove corrupted data to prevent repeated failures
      window.sessionStorage?.removeItem(storageKeyWorkspaceBlocks);
    }
  };

  /**
   * Saves workspace blocks to a downloadable file.
   * @param filename - Optional filename for the saved file (default: 'workspace.json').
   * @remarks
   * Serializes the workspace state to JSON and triggers a browser download.
   * Uses Blockly's recommended serialization API.
   */
  public workspaceSaveToFile = (filename: string = 'workspace.json'): void => {
    try {
      const data = Blockly.serialization.workspaces.save(this.workspace);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save workspace to file:', error);
      alert('Erreur lors de la sauvegarde du fichier');
    }
  };

  /**
   * Loads workspace blocks from a file.
   * @param file - File object to load from.
   * @param merge - If true, merges with existing blocks; if false, replaces them.
   * @remarks
   * Reads the file content, parses JSON, and loads it into the workspace.
   * Includes error handling for corrupted or invalid files.
   * If merge is true and workspace has existing blocks, appends top-level blocks.
   * If merge is false or workspace is empty, replaces all blocks.
   * Uses Blockly.Events.disable() during load to avoid change listeners firing
   * on every block add (see Blockly load performance issue #7395). Saves and
   * regenerates code once after load.
   */
  public workspaceLoadFromFile = (file: File, merge: boolean = false): void => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          console.warn('Empty file content');
          return;
        }
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null) {
          console.warn('Invalid workspace data format');
          alert('Format de fichier invalide');
          return;
        }
        this.sanitizeSerializedWorkspaceState(parsed);

        this.isBulkLoading = true;
        try {
          if (merge) {
            const hasExistingBlocks = this.workspace.getTopBlocks(false).length > 0;
            if (hasExistingBlocks) {
              this.mergeBlocksFromState(parsed);
            } else {
              this.workspace.clear();
              this.hasBlocks = false;
              Blockly.serialization.workspaces.load(parsed, this.workspace);
              this.hasBlocks = this.workspace.getTopBlocks(false).length > 0;
            }
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
        this.hasBlocks = this.workspace.getTopBlocks(false).length > 0;
        refreshBoardPinDropdowns(this.workspace);
        this.workspaceSaveBlocks("mainWorkspace_blocks");
        const code = arduinoGenerator.workspaceToCode(this.workspace);
        µcB_codeEditor.setValue(code);
        if (div_content_code) div_content_code.textContent = code;
      } catch (error) {
        console.error('Failed to load workspace from file:', error);
        alert('Erreur lors du chargement du fichier');
      }
    };
    reader.onerror = (): void => {
      console.error('File reading error');
      alert('Erreur lors de la lecture du fichier');
    };
    reader.readAsText(file);
  };

  /**
   * Merges blocks from a serialized state into the current workspace.
   * @param state - Serialized workspace state containing blocks to merge.
   * @remarks
   * Extracts blocks directly from the state and appends them using
   * Blockly.serialization.blocks.append(). This avoids creating a temporary
   * workspace and prevents plugin conflicts. Only top-level blocks are appended
   * (children are included automatically).
   */
  private mergeBlocksFromState = (state: Record<string, unknown>): void => {
    try {
      this.sanitizeSerializedWorkspaceState(state);
      // Extract blocks array from state
      // Blockly workspace state structure: { blocks: { blocks: [...] }, variables: [...] }
      // or sometimes: { blocks: [...] } (direct array)
      let blocksArray: Array<Record<string, unknown>> | undefined;
      
      if (Array.isArray(state.blocks)) {
        // Direct array format: { blocks: [...] }
        blocksArray = state.blocks as Array<Record<string, unknown>>;
      } else if (state.blocks && typeof state.blocks === 'object') {
        // Nested format: { blocks: { blocks: [...] } }
        const blocksObj = state.blocks as Record<string, unknown>;
        if (Array.isArray(blocksObj.blocks)) {
          blocksArray = blocksObj.blocks as Array<Record<string, unknown>>;
        }
      }
      
      if (!blocksArray) {
        console.warn('[Merge] No blocks found in state to merge');
        return;
      }
      if (blocksArray.length === 0) {
        return;
      }

      // Filter top-level blocks (those without a parent or with parent === null)
      const topLevelBlocks = blocksArray.filter((block) => {
        // Top-level blocks have no 'parent' field or parent is null/undefined
        return !block.parent || block.parent === null;
      });

      if (topLevelBlocks.length === 0) {
        console.warn('[Merge] No top-level blocks to merge');
        return;
      }

      // Calculate the bounding box of blocks to merge (using their original positions)
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      
      topLevelBlocks.forEach((block) => {
        const xRaw = typeof block.x === 'number' ? block.x : Number(block.x);
        const yRaw = typeof block.y === 'number' ? block.y : Number(block.y);
        const x = Number.isFinite(xRaw) ? xRaw : 0;
        const y = Number.isFinite(yRaw) ? yRaw : 0;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });

      // Check for existing blocks BEFORE calculating offset
      // Optimize: only check top-level blocks (much faster than getAllBlocks)
      const existingTopBlocks = this.workspace.getTopBlocks(false);
      const hasExistingBlocks = existingTopBlocks.length > 0;
      
      let offsetX = 0;
      let offsetY = 0;
      
      if (hasExistingBlocks) {
        // Bounding box of existing top-level blocks
        let existingMinX = Infinity;
        let existingMinY = Infinity;
        for (let i = 0; i < existingTopBlocks.length; i++) {
          const block = existingTopBlocks[i] as Blockly.BlockSvg;
          if (block.getRelativeToSurfaceXY) {
            const xy = block.getRelativeToSurfaceXY();
            const x = Number.isFinite(xy.x) ? xy.x : 0;
            const y = Number.isFinite(xy.y) ? xy.y : 0;
            existingMinX = Math.min(existingMinX, x);
            existingMinY = Math.min(existingMinY, y);
          }
        }
        if (!Number.isFinite(existingMinX) || !Number.isFinite(existingMinY)) {
          existingMinX = 0;
          existingMinY = 0;
        }
        
        // Superimpose with a few pixels offset: same zone as existing blocks
        const pixelOffset = 6;
        const targetX = existingMinX + pixelOffset;
        const targetY = existingMinY + pixelOffset;
        
        // Offset so leftmost/topmost new block lands at (targetX, targetY)
        offsetX = targetX - minX;
        offsetY = targetY - minY;
      } else {
        // No existing blocks: center the new blocks at origin
        const newBlocksCenterX = (minX + maxX) / 2;
        const newBlocksCenterY = (minY + maxY) / 2;
        offsetX = 0 - newBlocksCenterX;
        offsetY = 0 - newBlocksCenterY;
      }

      // Append each top-level block with the calculated offset
      topLevelBlocks.forEach((blockState) => {
        try {
          // Create a copy to avoid modifying the original
          const blockToAppend: Record<string, unknown> = { ...blockState };
          
          // Remove the ID to force Blockly to generate a new one (avoid conflicts)
          delete blockToAppend.id;
          
          // Apply offset to original position
          const originalXRaw = typeof blockToAppend.x === 'number' ? blockToAppend.x : Number(blockToAppend.x);
          const originalYRaw = typeof blockToAppend.y === 'number' ? blockToAppend.y : Number(blockToAppend.y);
          const originalX = Number.isFinite(originalXRaw) ? originalXRaw : 0;
          const originalY = Number.isFinite(originalYRaw) ? originalYRaw : 0;
          
          // Apply the calculated offset (calculated once, prevents accumulation)
          blockToAppend.x = originalX + offsetX;
          blockToAppend.y = originalY + offsetY;
          
          // Append the block (children will be included automatically)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Blockly.serialization.blocks.append(blockToAppend as any, this.workspace);
        } catch (error) {
          console.error('[Merge] Failed to append block:', error);
        }
      });

      // Only center workspace if there were no existing blocks (first load)
      if (!hasExistingBlocks) {
        const workspaceSvg = this.workspace as Blockly.WorkspaceSvg;
        if (workspaceSvg.scrollCenter) {
          workspaceSvg.scrollCenter();
        }
      }
    } catch (error) {
      console.error('[Merge] Failed to merge blocks:', error);
    }
  };

  /**
   * Normalizes null/'null' variable types to empty string.
   * @remarks
   * Prevents FieldVariable type mismatch warnings during validation.
   */
  private normalizeVariableTypes(): void {
    try {
      const variableMap = this.workspace.getVariableMap();
      const allVariables = variableMap.getAllVariables();
      allVariables.forEach((variable) => {
        if (!variable) {
          return;
        }
        normalizeVariableType(variable);
      });
    } catch (e) {
      console.debug('Error normalizing variable types:', e);
    }
  }

  /**
   * Normalizes the variable type for a single variable ID.
   * @param variableId - Target variable ID.
   */
  private normalizeVariableTypeById(variableId: string): void {
    try {
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) return;
      normalizeVariableType(variable);
    } catch (e) {
      console.debug('Error normalizing variable type:', e);
    }
  }

  /**
   * Sanitizes serialized workspace coordinates to avoid NaN transforms at render time.
   * @param state - Serialized workspace state object to sanitize in-place.
   */
  private sanitizeSerializedWorkspaceState(state: unknown): void {
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) {
        for (const item of node) {
          walk(item);
        }
        return;
      }
      if (!node || typeof node !== "object") {
        return;
      }
      const rec = node as Record<string, unknown>;
      if ("x" in rec) {
        const x = Number(rec.x);
        rec.x = Number.isFinite(x) ? x : 0;
      }
      if ("y" in rec) {
        const y = Number(rec.y);
        rec.y = Number.isFinite(y) ? y : 0;
      }
      for (const value of Object.values(rec)) {
        walk(value);
      }
    };
    walk(state);
  }

  /**
   * Determines whether the current language is RTL.
   * @returns True when the active language is configured as RTL.
   */
  private readonly isLangRtl = (): boolean => {
    return this.LANGUAGE_RTL.indexOf(getLangParamFromUrl()) !== -1;
  };

  /**
   * Updates toolbox categories for the specified language.
   * @param newLang - Language code used to localize toolbox categories.
   */
  private readonly changeLanguageToolbox = (newLang: string): void => {
    this.WORKSPACE_OPTIONS.toolbox = translateToolbox(newLang, getToolboxForCurrentBoard(this.toolbox));
  }

  /**
   * Applies language and RTL direction based on UI or URL.
   * @param menuOrUrl - When true, reads language from the dropdown; otherwise uses URL.
   * @returns True when the current language is RTL.
   */
  public changeLanguage = (menuOrUrl: boolean): boolean => {
    const newLang: string = menuOrUrl ? getLangParamFromDropdown() : getLangParamFromUrl();
    // Set the HTML's language and direction for the *new* language.
    const rtl: boolean = this.LANGUAGE_RTL.indexOf(newLang) !== -1;
    HTML_changeLanguage(newLang);
    Blockly.setLocale(languagesMapBlockly[newLang]);
    mergeArrayMessages(newLang);
    mergeBoardMessages(newLang);
    const customMessages = languagesMap[newLang];
    if (customMessages) {
      const msg = Blockly.Msg as Record<string, string>;
      if (customMessages.TYPED_VAR_UNTYPED_WARNING) {
        msg["TYPED_VAR_UNTYPED_WARNING"] = customMessages.TYPED_VAR_UNTYPED_WARNING;
      }
      if (customMessages.TYPED_VAR_TYPE_MISMATCH) {
        msg["TYPED_VAR_TYPE_MISMATCH"] = customMessages.TYPED_VAR_TYPE_MISMATCH;
      }
      if (customMessages.TYPED_VAR_SET_LABEL) {
        msg["TYPED_VAR_SET_LABEL"] = customMessages.TYPED_VAR_SET_LABEL;
      }
      if (customMessages.TYPED_VAR_TO_LABEL) {
        msg["TYPED_VAR_TO_LABEL"] = customMessages.TYPED_VAR_TO_LABEL;
      }
      if (customMessages.TYPED_VAR_TYPE_SET_LABEL) {
        msg["TYPED_VAR_TYPE_SET_LABEL"] = customMessages.TYPED_VAR_TYPE_SET_LABEL;
      }
      if (customMessages.TYPED_VAR_TYPE_TO_LABEL) {
        msg["TYPED_VAR_TYPE_TO_LABEL"] = customMessages.TYPED_VAR_TYPE_TO_LABEL;
      }
      if (customMessages.TYPED_VAR_ARG_TYPE_LABEL) {
        msg["TYPED_VAR_ARG_TYPE_LABEL"] = customMessages.TYPED_VAR_ARG_TYPE_LABEL;
      }
      const switchKeys = [
        "CONTROLS_SWITCH_HELPURL",
        "CONTROLS_SWITCH_VAR_TITLE",
        "CONTROLS_SWITCH_VAR_TAIL",
        "CONTROLS_SWITCH_MSG_CASEBREAK",
        "CONTROLS_SWITCH_MSG_DO",
        "CONTROLS_SWITCH_MSG_DEFAULT",
        "CONTROLS_SWITCH_MSG_SWITCHVAR",
        "CONTROLS_SWITCH_VAR_TOOLTIP",
        "CONTROLS_SWITCH_CASEBREAK_TOOLTIP",
        "CONTROLS_SWITCH_DEFAULT_TOOLTIP",
        "CONTROLS_SWITCH_TOOLTIP_1",
        "CONTROLS_SWITCH_TOOLTIP_2",
        "CONTROLS_SWITCH_TOOLTIP_3",
        "CONTROLS_SWITCH_TOOLTIP_4",
      ] as const;
      switchKeys.forEach((key) => {
        const value = customMessages[key];
        if (value) {
          msg[key] = value;
        }
      });
      const variableKeys = [
        "EMPTY_BACKPACK",
        "REMOVE_FROM_BACKPACK",
        "COPY_TO_BACKPACK",
        "COPY_ALL_TO_BACKPACK",
        "PASTE_ALL_FROM_BACKPACK",
        "VARIABLES_SET_CONST",
        "VARIABLES_SET_CONST_AT",
        "VARIABLES_SET_CONST_TOOLTIP",
        "VARIABLES_SET_CONST_HELPURL",
        "VARIABLES_SET_INIT",
        "VARIABLES_AS",
        "VARIABLES_SET_INIT_TOOLTIP",
        "VARIABLES_SET_INIT_HELPURL",
        "_AT",
        "VARIABLES_CONST_WARNING",
        "VARIABLES_LOCAL",
        "VARIABLES_LOCAL_TOOLTIP",
        "VARIABLES_CAST_AS_TYPE",
        "VARIABLES_CAST_TOOLTIP",
        "VAR_CAST_TYPE_CHAR",
        "VAR_CAST_TYPE_STRING",
        "VAR_CAST_TYPE_BOOL",
        "VAR_CAST_TYPE_BYTE",
        "VAR_CAST_TYPE_INT",
        "VAR_CAST_TYPE_UINT",
        "VAR_CAST_TYPE_VINT",
        "VAR_CAST_TYPE_LONG",
        "VAR_CAST_TYPE_ULONG",
        "VAR_CAST_TYPE_FLOAT",
        "VAR_CAST_TYPE_CHAR_ARRAY",
        "COLOUR_HSV_HUE_LABEL",
        "COLOUR_HSV_SATURATION_LABEL",
        "COLOUR_HSV_BRIGHTNESS_LABEL",
        "COLOUR_HSV_EYEDROPPER_LABEL",
      ] as const;
      variableKeys.forEach((key) => {
        const value = customMessages[key];
        if (value) {
          msg[key] = value;
        }
      });
      // Keys used by the Lists category (array/list blocks)
      const arrayAndListKeys = [
        "VARIABLES_GET_ITEM",
        "ARRAY_UNE_LISTE",
        "ARRAY_WITH_TOOLTIP",
        "ARRAY_WITH_HELPURL",
        "LIBRE_TOOLTIP",
        "LIBRE_LOOP_DO",
        "TOOLBOX_SEARCH_PLACEHOLDER",
        "TOOLBOX_SEARCH_HINT",
        "TOOLBOX_SEARCH_NO_MATCH",
      ] as const;
      arrayAndListKeys.forEach((key) => {
        const value = customMessages[key];
        if (value !== undefined) {
          msg[key] = value;
        }
      });
    }
    this.changeLanguageToolbox(newLang);
    this.updatePluginOptionsDirection(rtl);
    return rtl;
  };

  /**
   * Updates the DOM order of plugin options (label text vs checkbox)
   * depending on text direction.
   * @param rtl - True when current language is RTL.
   */
  private updatePluginOptionsDirection(rtl: boolean): void {
    const container = document.getElementById("pluginOptions");
    if (!container) {
      return;
    }
    const labels = container.querySelectorAll("label.plugin-option");
    labels.forEach((label) => {
      const input = label.querySelector("input");
      const span = label.querySelector("span.lang");
      if (!input || !span) {
        return;
      }
      if (rtl) {
        // LTR: input (checkbox) before span (text)
        if (input.nextSibling !== span) {
          label.insertBefore(input, span);
        }
      } else {
        // RTL: span (text) before input (checkbox)
        if (span.nextSibling !== input) {
          label.insertBefore(span, input);
        }
      }
    });
  }
}