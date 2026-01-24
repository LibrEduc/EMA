/**
 * @packageDocumentation
 * @module BlocklyApplication
 * @description Core application type definitions and implementations for µcBlockly
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

import "@blockly/field-date";
import "@blockly/field-colour";
import "@blockly/field-colour-hsv-sliders";
import "@blockly/field-multilineinput";
import "@blockly/field-slider";
import * as Blockly from "blockly";
import "./categories/blockly/field_colour_picker";
import { registerStrictConnectionChecker } from "./generators/arduino/strict_connection_checker";
import { registerTypedVariablesCategory } from "./generators/arduino/typed_variables_flyout";
import { normalizeVariableType } from "./generators/arduino/variable_utils";
import {
  patchFieldVariableValidation,
  patchVariableMapCreateVariable,
  patchWorkspaceRemoveTopBlock,
} from "./blockly_patches";

import { µcB_addFlexResizerEvents, µcB_workspaceOnResize, µcB_codeEditor } from "./index";
import { ToolboxConfiguration } from "./toolbox";
import { themeMappings } from "./options";
import { addReplaceParamToUrl } from "./tools";
import { arduinoGenerator } from "./generators/arduino";
import { languagesMap, languagesMapBlockly } from './languages/languageMap';
import {
  changeLanguageToolbox as translateToolbox,
  getLangParamFromDropdown,
  getLangParamFromUrl,
  HTML_changeLanguage,
} from './language';

/* import {blocks, unregisterProcedureBlocks} from '@blockly/block-shareable-procedures';
unregisterProcedureBlocks();
Blockly.common.defineBlocks(blocks);*/
import { Backpack } from "@blockly/workspace-backpack";
import { ContentHighlight } from "@blockly/workspace-content-highlight";
//import { KeyboardNavigation } from '@blockly/keyboard-navigation';
import { Modal } from "@blockly/plugin-modal";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import { shadowBlockConversionChangeListener } from "@blockly/shadow-block-converter";

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

/* The above code is creating instances of different plugins for a TypeScript application.*/


/* The above code is defining an interface called `BlocklyApplicationType` in TypeScript. This
interface has the following properties: */
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

    // Don't use the official plugin - it's too strict and blocks typed blocks from connecting to untyped inputs
    // We use our own StrictConnectionChecker which allows typed blocks to connect to untyped inputs
    // (needed for type inference: a 'true' block (Boolean) should be able to connect to variables_set_dynamic (null) 
    // to infer the variable type)

    this.workspace = Blockly.inject(injection_div, WORKSPACE_OPTIONS);
    Blockly.ContextMenuItems.registerCommentOptions();
    patchWorkspaceRemoveTopBlock();
    patchFieldVariableValidation();

    this.normalizeVariableTypes();
    patchVariableMapCreateVariable(this.workspace);

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

    // Register our custom strict connection checker
    // This checker allows typed blocks to connect to untyped inputs (for type inference)
    // but blocks untyped blocks (__NO_TYPE__) from connecting to typed inputs
    registerStrictConnectionChecker(this.workspace);
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
  plugin_workspaceSearch = new WorkspaceSearch();
  plugin_zoomToFit = new ZoomToFitControl();
  private pluginsInitialized = false;
  private saveBlocksTimer: number | null = null;
  private codegenTimer: number | null = null;
  /**
   * The function `workspaceListeners` adds event listeners to a Blockly workspace to save changes to
   * storage and run code whenever the workspace changes meaningfully.
   * @param workspace - The parameter "workspace" is of type Blockly.WorkspaceSvg. It represents the
   * Blockly workspace where the blocks are being used.
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
      if (e.type === Blockly.Events.FINISHED_LOADING) {
        return;
      }
      scheduleSave();
      scheduleCodegen();
    });
  };

  /**
   * Remove the default 'item' variable if it exists
   * This should be called after workspace initialization and after loading blocks
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
          console.log('🗑️ Variable "item" supprimée');
          break;
        }
      }
    } catch (e) {
      console.debug('Error removing default item variable:', e);
    }
  }

  /**
   * Initializes the workspace by setting up flexible views that can be adjusted in size and attaching necessary event listeners.
   * Initially, an event listener is attached to the window to manage resizing events, using the µcB_workspaceOnResize function. 
   * Then, the µcB_addFlexResizerEvents function is invoked to attach event listeners to the flex resizer.
   * Finally, various listeners related to the Blockly workspace are attached by calling the workspaceListeners function.
   */
  public workspaceInit = (): void => {
    window.addEventListener("resize", µcB_workspaceOnResize, false);
    µcB_addFlexResizerEvents();
    this.workspaceListeners();
  };

  /* The above TypeScript code defines a function `changeTheme` that takes an optional parameter
  `themeChoice` which represents the selected theme. If `themeChoice` is not provided, it retrieves
  the selected theme from an HTML select element with the id 'themeMenu'. It then updates the theme
  in the `WORKSPACE_OPTIONS` object using a mapping from `themeMappings`. If the selected theme
  exists in the `themeMappings`, it sets the theme for a Blockly workspace and performs a workspace
  reboot. Finally, it updates the URL with the selected theme parameter and returns the chosen
  theme. */
  public changeTheme = (themeChoice?: string): string => {
    if (!themeChoice)
      themeChoice = (document.getElementById('themeMenu') as HTMLSelectElement).value;
    this.WORKSPACE_OPTIONS['theme'] = themeMappings[themeChoice];
    if (themeMappings.hasOwnProperty(themeChoice) && !this.isContinuousToolboxEnabled()) {
      (this.workspace as Blockly.WorkspaceSvg).setTheme(themeMappings[themeChoice]);
    }
    this.workspaceReboot();
    window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "theme", themeChoice));
    return themeChoice;
  }

  /**
   * The function `changeRenderer` updates the renderer option in the `WORKSPACE_OPTIONS` object and
   * then reboots the workspace.
   * @param renderNew - The `renderNew` parameter is a string that represents the value of the
   * selected option in the `rendererMenu` HTML select element.
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
    window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "renderer", renderNew));
    return renderNew;
  }

  /**
   * The `workspaceReboot` function saves the current workspace, sets up workspace plugins, disposes the
   * current workspace, changes the language based on the selected option in the dropdown menu, injects a
   * new workspace, logs the main workspace blocks from the session storage, sets up workspace plugins
   * again, and loads the saved blocks into the new workspace.
   */
  public workspaceReboot = (): void => {
    this.closeFlyoutForReboot();
    this.workspaceSaveBlocks("mainWorkspace_blocks");
    this.workspaceSetupPlugins(true);
    this.workspace.dispose();
    // S'assurer que la langue actuelle est appliquée à la toolbox ET à Blockly
    const currentLang = getLangParamFromUrl();
    this.changeLanguageToolbox(currentLang);
    Blockly.setLocale(languagesMapBlockly[currentLang]);
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
    // Reconnecter les mécanismes requis après réinjection
    registerStrictConnectionChecker(this.workspace);
    this.registerCustomToolboxCallbacks();
    if (shouldStripCustom && originalToolbox) {
      (this.workspace as Blockly.WorkspaceSvg).updateToolbox(originalToolbox);
      this.WORKSPACE_OPTIONS.toolbox = originalToolbox;
      this.registerCustomToolboxCallbacks();
      const toolbox = (this.workspace as Blockly.WorkspaceSvg).getToolbox?.();
      if (toolbox && typeof toolbox.refreshSelection === "function") {
        toolbox.refreshSelection();
      }
    }
    patchFieldVariableValidation();
    patchVariableMapCreateVariable(this.workspace);
    this.workspaceListeners();
    this.workspaceSetupPlugins(false);
    //specific to this plugin
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
  };

  // The function `workspaceSetupPlugins` sets up all plugins added in workspace
  public workspaceSetupPlugins = (disposePlugin: boolean = false): void => {
    if (!disposePlugin && this.pluginsInitialized) {
      return;
    }
    this.plugin_backpack = new Backpack(
      this.workspace as Blockly.WorkspaceSvg,
      this.backpackOptions,
    );
    this.plugin_modal = new Modal(this.workspace);
    this.plugin_workspaceSearch = new WorkspaceSearch(this.workspace);
    this.plugin_zoomToFit = new ZoomToFitControl(this.workspace);
    const pluginHighlightCheck: HTMLInputElement = document.getElementById("pluginHighlight") as HTMLInputElement;
    if (disposePlugin) {
      this.workspace.removeChangeListener(shadowBlockConversionChangeListener);
      this.plugin_backpack.dispose();
      this.plugin_contentHighlight.dispose();
      this.plugin_minimap.dispose();
      this.plugin_modal.dispose();
      this.plugin_workspaceSearch.dispose();
      this.plugin_zoomToFit.dispose();
      this.pluginsInitialized = false;
      //this.plugin_keyboardNav.navigationController.removeWorkspace(this.workspace);
      //this.plugin_keyboardNav.navigationController.disable(this.workspace);
    } else {
      this.workspace.addChangeListener(shadowBlockConversionChangeListener);
      this.plugin_backpack.init();
      if (pluginHighlightCheck.checked) {
        this.plugin_contentHighlight = new ContentHighlight(this.workspace as Blockly.WorkspaceSvg);
        this.plugin_contentHighlight.init();
      }
      //particular to this plugin
      this.plugin_minimap = new PositionedMinimap(this.workspace);
      this.plugin_minimap.init();
      this.plugin_modal.init();
      this.plugin_workspaceSearch.init();
      this.plugin_zoomToFit.init();
      this.pluginsInitialized = true;
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
   * Register callbacks for custom toolbox categories.
   * This is required after any workspace re-injection.
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
   * Reconnect hooks after workspace injection.
   */
  public restoreWorkspaceAfterInject(): void {
    registerStrictConnectionChecker(this.workspace);
    this.registerCustomToolboxCallbacks();
    patchFieldVariableValidation();
    patchVariableMapCreateVariable(this.workspace);
    this.workspaceListeners();
  }

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
    if (shouldStayOpen && typeof (flyout as Blockly.Flyout).setVisible === "function") {
      (flyout as Blockly.Flyout).setVisible(true);
    }
  }

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

  private isContinuousToolboxEnabled(): boolean {
    const plugins = this.WORKSPACE_OPTIONS["plugins"] as
      | Record<string, unknown>
      | undefined;
    return plugins?.["toolbox"] === "ContinuousToolbox";
  }

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
   * The function `setParamsBlockly` sets parameters for a Blockly application based on URL query
   * parameters and updates the browser history.
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
    window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "lang", newParam));

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
    window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "theme", newParam));

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
    window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "renderer", newParam));
    if (rendererFromUrl && this.workspace) {
      this.changeRenderer(newParam);
    }
  };

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
   * The function `workspaceSaveBlocks` saves the blocks in a Blockly workspace to the local storage.
   * @param workspace - The `workspace` parameter is an instance of the Blockly.Workspace class. It
   * represents the Blockly workspace that contains all the blocks and their connections.
   */
  public workspaceSaveBlocks = (storageKeyWorkspaceBlocks: string): void => {
    const data = Blockly.serialization.workspaces.save(this.workspace);
    window.sessionStorage?.setItem(storageKeyWorkspaceBlocks, JSON.stringify(data));
  };

  /**
   * The function loads blocks into a Blockly workspace from session storage.
   * @param workspace - The `workspace` parameter is an instance of the `Blockly.Workspace` class. It
   * represents the Blockly workspace where blocks are loaded.
   * @returns If the `data` variable is falsy (null, undefined, empty string), then nothing is being
   * returned.
   */
  public workspaceLoadBlocks = (storageKeyWorkspaceBlocks: string): void => {
    const data = window.sessionStorage?.getItem(storageKeyWorkspaceBlocks);
    if (!data) return;
    Blockly.serialization.workspaces.load(JSON.parse(data), this.workspace);
    this.normalizeVariableTypes();
  };
  /**
   * Ensure variables with null/'null' types are normalized to empty string.
   * This prevents FieldVariable type mismatch warnings during validation.
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
   * The function checks if the language of a Blockly object is right-to-left (RTL).
   * @param blocklyObject - The `blocklyObject` parameter is an object that
   * represents the Blockly application. It likely contains various properties and methods related to the
   * Blockly functionality.
   * @returns a boolean value.
   */
  private readonly isLangRtl = (): boolean => {
    return this.LANGUAGE_RTL.indexOf(getLangParamFromUrl()) !== -1;
  };

  /**
   * The function `changeLanguageToolbox` changes the names of categories in a toolbox based on a
   * language map.
   * @param newLang - The `newLang` parameter is a string that represents the new language to
   * which the toolbox should be changed.
   */
  private readonly changeLanguageToolbox = (newLang: string): void => {
    this.WORKSPACE_OPTIONS.toolbox = translateToolbox(newLang, this.toolbox);
  }

  /**
   * The function `changeLanguage` changes the language and direction of the HTML based on a menu
   * selection or URL parameter.
   * @param menuOrUrl - `menuOrUrl` is a boolean parameter that determines whether to get the
   * language parameter from a dropdown menu or from a URL.
   * @returns The function `changeLanguage` is returning a boolean value, which is the result of the
   * `isLangRtl(µcB)` function call.
   */
  public changeLanguage = (menuOrUrl: boolean): boolean => {
    const newLang: string = menuOrUrl ? getLangParamFromDropdown() : getLangParamFromUrl();
    // Set the HTML's language and direction.
    const rtl: boolean = this.isLangRtl();
    HTML_changeLanguage(newLang);
    Blockly.setLocale(languagesMapBlockly[newLang]);
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
        "VAR_TYPE_INT",
        "VAR_TYPE_FLOAT",
        "VAR_TYPE_BOOL",
        "VAR_TYPE_STRING",
        "VAR_TYPE_CHAR",
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
    }
    this.changeLanguageToolbox(newLang);
    this.setParamsBlockly();
    return rtl;
  };
}