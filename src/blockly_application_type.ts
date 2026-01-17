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

import * as Blockly from "blockly";
import { inferAndUpdateVariableTypes } from "./generators/arduino/variable_type_inference";
import { registerStrictConnectionChecker } from "./generators/arduino/strict_connection_checker";
import { registerTypedVariablesCategory } from "./generators/arduino/typed_variables_flyout";

import { µcB_addFlexResizerEvents, µcB_workspaceOnResize, µcB_codeEditor } from "./index";
import { ToolboxConfiguration } from "./toolbox";
import { themeMappings } from "./options";
import { addReplaceParamToUrl } from "./tools";
import { arduinoGenerator } from "./generators/arduino";
import { languagesMap, languagesMapBlockly, LanguageItem } from './languages/languageMap';
import { getLangParamFromDropdown, getLangParamFromUrl, HTML_changeLanguage } from './language';

/* import {blocks, unregisterProcedureBlocks} from '@blockly/block-shareable-procedures';
unregisterProcedureBlocks();
Blockly.common.defineBlocks(blocks);*/
import { Backpack } from "@blockly/workspace-backpack";
import { ContentHighlight } from "@blockly/workspace-content-highlight";
//import { KeyboardNavigation } from '@blockly/keyboard-navigation';
import { Modal } from "@blockly/plugin-modal";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import { shadowBlockConversionChangeListener } from "@blockly/shadow-block-converter";
//import { TypedVariableModal } from "@blockly/plugin-typed-variable-modal";

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
    this.interceptFieldVariableValidation();
    
    // Remove the default 'item' variable if it exists
    this.removeDefaultItemVariable();
    this.normalizeVariableTypes();
    this.normalizeVariableCreationTypes();
    
    // Listen for variable creation events to prevent 'item' from being created
    // Use setTimeout to ensure the deletion happens after Blockly has finished processing
    this.workspace.addChangeListener((e: Blockly.Events.Abstract) => {
      if (e.type === Blockly.Events.VAR_CREATE) {
        const varEvent = e as Blockly.Events.VarCreate;
        if (varEvent.varId) {
          this.normalizeVariableTypeById(varEvent.varId);
        }
        if (varEvent.varName === 'item' && varEvent.varId) {
          // Delete the 'item' variable after a short delay to avoid interfering with Blockly's internal processing
          setTimeout(() => {
            try {
              const variable = this.workspace.getVariableMap().getVariableById(varEvent.varId!);
              if (variable && variable.getName() === 'item') {
                // Before deleting, update all blocks that reference this variable to use null
                const allBlocks = this.workspace.getAllBlocks(false);
                allBlocks.forEach(block => {
                  const varField = block.getField('VAR') as Blockly.FieldVariable | null;
                  if (varField && varField.getValue() === varEvent.varId) {
                    // Clear the variable field
                    varField.setValue(null);
                  }
                });
                
                // Now delete the variable
                this.workspace.getVariableMap().deleteVariable(variable);
                console.log('🗑️ Variable "item" supprimée automatiquement');
              }
            } catch (err) {
              console.debug('Error deleting item variable:', err);
            }
          }, 0);
        }
      }
    });
    
    // Register our custom strict connection checker
    // This checker allows typed blocks to connect to untyped inputs (for type inference)
    // but blocks untyped blocks (__NO_TYPE__) from connecting to typed inputs
    registerStrictConnectionChecker(this.workspace);
    registerTypedVariablesCategory(this.workspace as Blockly.WorkspaceSvg);
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
  /**
   * The function `workspaceListeners` adds event listeners to a Blockly workspace to save changes to
   * storage and run code whenever the workspace changes meaningfully.
   * @param workspace - The parameter "workspace" is of type Blockly.WorkspaceSvg. It represents the
   * Blockly workspace where the blocks are being used.
   */
  private readonly workspaceListeners = (): void => {
    // Every time the workspace changes state, save the changes to storage.
    this.workspace.addChangeListener((e: Blockly.Events.Abstract): void => {
      // UI events are things like scrolling, zooming, etc.
      // No need to save after one of these.
      if (e.isUiEvent || (this.workspace as Blockly.WorkspaceSvg).isDragging()) return;
      this.workspaceSaveBlocks("mainWorkspace_blocks");
    });

    // Whenever the workspace changes meaningfully, run the code again.
    this.workspace.addChangeListener((e: Blockly.Events.Abstract): void => {
      // Don't run the code when the workspace finishes loading; we're
      // already running it once when the application starts.
      // Don't run the code during drags; we might have invalid state.
      if (
        e.isUiEvent ||
        e.type == Blockly.Events.FINISHED_LOADING ||
        (this.workspace as Blockly.WorkspaceSvg).isDragging()
      ) {
        return;
      }
      
      // Infer and update variable types based on block connections
      // This is similar to BlocklyArduino's approach
      inferAndUpdateVariableTypes(this.workspace);
      
      µcB_codeEditor.setValue(arduinoGenerator.workspaceToCode(this.workspace));
      div_content_code.textContent = arduinoGenerator.workspaceToCode(this.workspace);
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
    if (themeMappings.hasOwnProperty(themeChoice)) {
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
    this.workspaceSaveBlocks("mainWorkspace_blocks");
    this.workspaceSetupPlugins(true);
    this.workspace.dispose();
    // S'assurer que la langue actuelle est appliquée à la toolbox ET à Blockly
    const currentLang = getLangParamFromUrl();
    this.changeLanguageToolbox(currentLang);
    Blockly.setLocale(languagesMapBlockly[currentLang]);
    this.workspace = Blockly.inject(
      div_workspace_content_blockly,
      this.WORKSPACE_OPTIONS,
    );
    registerTypedVariablesCategory(this.workspace as Blockly.WorkspaceSvg);
    this.interceptFieldVariableValidation();
    this.normalizeVariableCreationTypes();
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
    // Remove 'item' variable after reboot (it might be recreated)
    this.removeDefaultItemVariable();
    (this.workspace as Blockly.WorkspaceSvg).scrollCenter();
  };

  // The function `workspaceSetupPlugins` sets up all plugins added in workspace
  public workspaceSetupPlugins = (disposePlugin: boolean = false): void => {
    this.plugin_backpack = new Backpack(
      this.workspace as Blockly.WorkspaceSvg,
      this.backpackOptions,
    );
    this.plugin_modal = new Modal(this.workspace);
    this.plugin_workspaceSearch = new WorkspaceSearch(this.workspace);
    this.plugin_zoomToFit = new ZoomToFitControl(this.workspace);
    const pluginHighlightCheck: HTMLInputElement = document.getElementById("pluginHighlight") as HTMLInputElement;
    if (disposePlugin) {
      this.workspace.addChangeListener(shadowBlockConversionChangeListener);
      this.plugin_backpack.dispose();
      this.plugin_contentHighlight.dispose();
      this.plugin_minimap.dispose();
      this.plugin_modal.dispose();
      this.plugin_workspaceSearch.dispose();
      this.plugin_zoomToFit.dispose();
      //this.plugin_keyboardNav.navigationController.removeWorkspace(this.workspace);
      //this.plugin_keyboardNav.navigationController.disable(this.workspace);
    } else {
      this.workspace.removeChangeListener(shadowBlockConversionChangeListener);
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
   * The function `setParamsBlockly` sets parameters for a Blockly application based on URL query
   * parameters and updates the browser history.
   */

  public setParamsBlockly = (): void => {
    const searchParams = new URLSearchParams(window.location.search);
    let newParam: string | null;
    let dropdownMenu: HTMLSelectElement;
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
    else
      (document.getElementById('themeMenu')! as HTMLSelectElement).value = newParam;
    this.WORKSPACE_OPTIONS['theme'] = newParam;
    window.sessionStorage?.setItem('paramTheme', newParam);
    window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "theme", newParam));

    newParam = searchParams.get('renderer');
    dropdownMenu = document.getElementById('rendererMenu') as HTMLSelectElement;
    if (newParam == null || newParam == "null")
      newParam = dropdownMenu.options[dropdownMenu.selectedIndex].value;
    else
      (document.getElementById('rendererMenu')! as HTMLSelectElement).value = newParam;
    this.WORKSPACE_OPTIONS['renderer'] = newParam;
    window.sessionStorage?.setItem('paramRenderer', newParam);
    window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "renderer", newParam));
  };

  public pluginsSetupWorkspace = (): void => {
    const searchParams = new URLSearchParams(window.location.search);
    let paramsURL: string[] = [""];
    if (searchParams.get('options') !== null) {
      paramsURL = searchParams.get('options')!.split(',');
      //clean array from all null or undefined entry
      paramsURL = paramsURL.filter(Boolean);
    }
    if ((window.sessionStorage.getItem('pluginMinimap') == "true") || (paramsURL.includes('minimap'))) {
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
    if ((window.sessionStorage.getItem('codeEditorSwitch') == "true") || (paramsURL.includes('codeEditor'))) {
      const codeEditorSwitchCheck: HTMLInputElement = document.getElementById("codeEditorSwitch") as HTMLInputElement;
      codeEditorSwitchCheck.checked = true;
      codeEditorSwitchCheck.dispatchEvent(new Event('change'));
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
    // Remove 'item' variable after loading blocks (it might be recreated during load)
    this.removeDefaultItemVariable();
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
        const currentType = variable.getType();
        if (currentType === null || currentType === 'null') {
          if (typeof (variable as any).setType === 'function') {
            (variable as any).setType('');
          }
        }
      });
    } catch (e) {
      console.debug('Error normalizing variable types:', e);
    }
  }

  private normalizeVariableTypeById(variableId: string): void {
    try {
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) return;
      const currentType = variable.getType();
      if (currentType === null || currentType === 'null') {
        if (typeof (variable as any).setType === 'function') {
          (variable as any).setType('');
        }
      }
    } catch (e) {
      console.debug('Error normalizing variable type:', e);
    }
  }

  private normalizeVariableCreationTypes(): void {
    try {
      const variableMap = this.workspace.getVariableMap();
      const originalCreateVariable = variableMap.createVariable.bind(variableMap);
      (variableMap as any).createVariable = function(
        name: string,
        opt_type?: string | null,
        opt_id?: string | null,
      ) {
        const type = opt_type === null || opt_type === 'null' ? '' : opt_type;
        const id = opt_id === null ? undefined : opt_id;
        return originalCreateVariable(name, type, id);
      };
    } catch (e) {
      console.debug('Error normalizing variable creation types:', e);
    }
  }

  private interceptFieldVariableValidation(): void {
    try {
      if (!Blockly.FieldVariable) return;
      const proto = Blockly.FieldVariable.prototype as any;
      if (!proto.__ucbPatchedVariableValidation) {
        const originalValidation = proto.doClassValidation_;
        proto.doClassValidation_ = function(
        newValue: string | null,
        ) {
          if (!newValue) return newValue;
          const field = this as any;
          const workspace = field.getSourceBlock?.()?.workspace || field.workspace_;
          const variableMap = workspace?.getVariableMap?.();
          if (!variableMap) {
            return originalValidation.call(this, newValue);
          }
          const variable = variableMap.getVariableById(newValue);
          if (!variable) {
            // Prevent creation of phantom variables due to invalid IDs.
            return null;
          }
          // Accept existing variables regardless of type mismatch warnings.
          return newValue;
        };
        proto.__ucbPatchedVariableValidation = true;
      }

      if (!proto.__ucbPatchedVariableInitModel) {
        const originalInitModel = proto.initModel;
        proto.initModel = function() {
          const field = this as any;
          const block = field.getSourceBlock?.();
          const workspace = block?.workspace || field.workspace_;
          // Allow flyout blocks to initialize a local variable to avoid null IDs in serialization.
          if (workspace?.isFlyout) {
            return originalInitModel.call(this);
          }
          // Avoid auto-creating variables for insertion markers in the main workspace.
          if (block?.isInsertionMarker?.()) {
            field.value_ = null;
            return;
          }
          return originalInitModel.call(this);
        };
        proto.__ucbPatchedVariableInitModel = true;
      }
    } catch (e) {
      console.debug('Error intercepting field variable validation:', e);
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
    const basic_toolboxCopy = JSON.parse(JSON.stringify(this.toolbox.contents));
    const langMap: LanguageItem = languagesMap[newLang];
    interface Category {
      kind: string;
      name: string;
      categoryStyle: string;
      contents?: Category[];
    }
    /**
     * The function replaces the name of a category with its corresponding translation if available in
     * the language map.
     * @param category - The parameter `category` is of type `Category`, which is an object
     * that represents a category.
     */
    function replaceCategoryName(category: Category) {
      if (category.kind === 'category' && category.name && langMap[category.name as keyof LanguageItem]) {
        category.name = langMap[category.name as keyof LanguageItem];
      }
      if (category.contents) {
        category.contents.forEach((content: Category) => {
          replaceCategoryName(content);
        });
      }
    }
    basic_toolboxCopy.forEach((category: Category) => {
      replaceCategoryName(category);
    });
    const temp_toolboxCopy: ToolboxConfiguration = JSON.parse(JSON.stringify(this.toolbox));
    temp_toolboxCopy.contents = JSON.parse(JSON.stringify(basic_toolboxCopy));
    this.WORKSPACE_OPTIONS.toolbox = JSON.parse(JSON.stringify(temp_toolboxCopy));
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
    }
    this.changeLanguageToolbox(newLang);
    this.setParamsBlockly();
    return rtl;
  };
}