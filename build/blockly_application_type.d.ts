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
import { ToolboxConfiguration } from "./toolbox";
export interface BlocklyApplicationType {
    workspace: Blockly.Workspace;
    toolbox: ToolboxConfiguration;
    toolboxChoice: string;
    LANGUAGE_NAME: Record<string, string>;
    LANGUAGE_RTL: string[];
    PLUGINS: string[];
    WORKSPACE_OPTIONS: Record<string, unknown>;
}
export declare class BlocklyApplication implements BlocklyApplicationType {
    workspace: Blockly.Workspace;
    toolbox: ToolboxConfiguration;
    toolboxChoice: string;
    LANGUAGE_NAME: Record<string, string>;
    LANGUAGE_RTL: string[];
    PLUGINS: string[];
    WORKSPACE_OPTIONS: Record<string, unknown>;
    constructor(toolbox: ToolboxConfiguration, WORKSPACE_OPTIONS: Record<string, unknown>, injection_div: HTMLElement);
    backpackOptions: {
        allowEmptyBackpackOpen: boolean;
        useFilledBackpackImage: boolean;
        skipSerializerRegistration: boolean;
        contextMenu: {
            emptyBackpack: boolean;
            removeFromBackpack: boolean;
            copyToBackpack: boolean;
            copyAllToBackpack: boolean;
            pasteAllToBackpack: boolean;
            disablePreconditionChecks: boolean;
        };
    };
    plugin_backpack: any;
    plugin_contentHighlight: any;
    plugin_minimap: any;
    plugin_modal: any;
    plugin_workspaceSearch: any;
    plugin_zoomToFit: any;
    /**
     * The function `workspaceListeners` adds event listeners to a Blockly workspace to save changes to
     * storage and run code whenever the workspace changes meaningfully.
     * @param workspace - The parameter "workspace" is of type Blockly.WorkspaceSvg. It represents the
     * Blockly workspace where the blocks are being used.
     */
    private readonly workspaceListeners;
    /**
     * Remove the default 'item' variable if it exists
     * This should be called after workspace initialization and after loading blocks
     */
    removeDefaultItemVariable(): void;
    /**
     * Initializes the workspace by setting up flexible views that can be adjusted in size and attaching necessary event listeners.
     * Initially, an event listener is attached to the window to manage resizing events, using the µcB_workspaceOnResize function.
     * Then, the µcB_addFlexResizerEvents function is invoked to attach event listeners to the flex resizer.
     * Finally, various listeners related to the Blockly workspace are attached by calling the workspaceListeners function.
     */
    workspaceInit: () => void;
    changeTheme: (themeChoice?: string) => string;
    /**
     * The function `changeRenderer` updates the renderer option in the `WORKSPACE_OPTIONS` object and
     * then reboots the workspace.
     * @param renderNew - The `renderNew` parameter is a string that represents the value of the
     * selected option in the `rendererMenu` HTML select element.
     */
    changeRenderer: (renderNew?: string) => string;
    /**
     * The `workspaceReboot` function saves the current workspace, sets up workspace plugins, disposes the
     * current workspace, changes the language based on the selected option in the dropdown menu, injects a
     * new workspace, logs the main workspace blocks from the session storage, sets up workspace plugins
     * again, and loads the saved blocks into the new workspace.
     */
    workspaceReboot: () => void;
    workspaceSetupPlugins: (disposePlugin?: boolean) => void;
    /**
     * The function `setParamsBlockly` sets parameters for a Blockly application based on URL query
     * parameters and updates the browser history.
     */
    setParamsBlockly: () => void;
    pluginsSetupWorkspace: () => void;
    /**
     * The function `workspaceSaveBlocks` saves the blocks in a Blockly workspace to the local storage.
     * @param workspace - The `workspace` parameter is an instance of the Blockly.Workspace class. It
     * represents the Blockly workspace that contains all the blocks and their connections.
     */
    workspaceSaveBlocks: (storageKeyWorkspaceBlocks: string) => void;
    /**
     * The function loads blocks into a Blockly workspace from session storage.
     * @param workspace - The `workspace` parameter is an instance of the `Blockly.Workspace` class. It
     * represents the Blockly workspace where blocks are loaded.
     * @returns If the `data` variable is falsy (null, undefined, empty string), then nothing is being
     * returned.
     */
    workspaceLoadBlocks: (storageKeyWorkspaceBlocks: string) => void;
    /**
     * Ensure variables with null/'null' types are normalized to empty string.
     * This prevents FieldVariable type mismatch warnings during validation.
     */
    private normalizeVariableTypes;
    private normalizeVariableTypeById;
    private normalizeVariableCreationTypes;
    private interceptFieldVariableValidation;
    /**
     * The function checks if the language of a Blockly object is right-to-left (RTL).
     * @param blocklyObject - The `blocklyObject` parameter is an object that
     * represents the Blockly application. It likely contains various properties and methods related to the
     * Blockly functionality.
     * @returns a boolean value.
     */
    private readonly isLangRtl;
    /**
     * The function `changeLanguageToolbox` changes the names of categories in a toolbox based on a
     * language map.
     * @param newLang - The `newLang` parameter is a string that represents the new language to
     * which the toolbox should be changed.
     */
    private readonly changeLanguageToolbox;
    /**
     * The function `changeLanguage` changes the language and direction of the HTML based on a menu
     * selection or URL parameter.
     * @param menuOrUrl - `menuOrUrl` is a boolean parameter that determines whether to get the
     * language parameter from a dropdown menu or from a URL.
     * @returns The function `changeLanguage` is returning a boolean value, which is the result of the
     * `isLangRtl(µcB)` function call.
     */
    changeLanguage: (menuOrUrl: boolean) => boolean;
}
//# sourceMappingURL=blockly_application_type.d.ts.map