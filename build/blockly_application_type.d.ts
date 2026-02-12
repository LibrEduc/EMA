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
    plugin_workspaceSearch: {
        init: () => void;
        dispose: () => void;
    } | null;
    plugin_zoomToFit: any;
    private pluginsInitialized;
    private pluginsWorkspace;
    private saveBlocksTimer;
    private codegenTimer;
    private autoSaveEnabled;
    /**
     * Enables or disables automatic workspace persistence from change listeners.
     * @param enabled - True to enable auto-save, false to suspend it.
     */
    setAutoSaveEnabled: (enabled: boolean) => void;
    /**
     * Registers workspace change listeners and debounces persistence/codegen.
     * @remarks
     * Saves workspace state to session storage and regenerates code after
     * meaningful changes, skipping UI-only and drag events.
     */
    private readonly workspaceListeners;
    /**
     * Removes the default "item" variable created by Blockly.
     * @remarks
     * Call this after workspace initialization and after loading blocks
     * to avoid unwanted default variables in user workspaces.
     */
    removeDefaultItemVariable(): void;
    /**
     * Initializes workspace resize behavior and listeners.
     * @remarks
     * Attaches window resize handlers, flex resizer events, and workspace
     * change listeners for code generation and persistence.
     */
    workspaceInit: () => void;
    /**
     * Applies a Blockly theme and reboots the workspace.
     * @param themeChoice - Optional theme key; defaults to the theme menu selection.
     * @returns The applied theme key.
     * @remarks
     * Updates workspace options, refreshes the workspace, and syncs the URL.
     */
    changeTheme: (themeChoice?: string) => string;
    /**
     * Applies a Blockly renderer and reboots the workspace.
     * @param renderNew - Optional renderer key; defaults to the renderer menu selection.
     * @returns The applied renderer key.
     * @remarks
     * Falls back to "geras" if the renderer is not registered and syncs the URL.
     */
    changeRenderer: (renderNew?: string) => string;
    /**
     * Recreates the workspace while preserving user state.
     * @remarks
     * Saves blocks, disposes the current workspace, re-injects with updated
     * options (theme/renderer/toolbox), restores plugins, and reloads blocks.
     */
    workspaceReboot: () => void;
    /**
     * Initializes or disposes workspace plugins.
     * @param disposePlugin - When true, disposes plugins; otherwise initializes them.
     * @remarks
     * Prevents double initialization and wires change listeners as needed.
     */
    workspaceSetupPlugins: (disposePlugin?: boolean) => void;
    /**
     * Registers callbacks for custom toolbox categories.
     * @remarks
     * Required after workspace re-injection to restore dynamic category content.
     */
    registerCustomToolboxCallbacks(): void;
    /**
     * Restores hooks and patches after workspace injection.
     * @remarks
     * Reattaches strict checker, variable validation patches, and listeners.
     */
    restoreWorkspaceAfterInject(): void;
    /**
     * Temporarily strips custom categories for the continuous toolbox.
     * @returns The original toolbox configuration, or null if not applicable.
     */
    stripCustomCategoriesForContinuousToolbox(): ToolboxConfiguration | null;
    /**
     * Restores the original toolbox after workspace injection.
     * @param originalToolbox - The toolbox configuration saved before injection.
     */
    restoreToolboxAfterInject(originalToolbox: ToolboxConfiguration | null): void;
    /**
     * Applies the "always opened flyout" setting to the toolbox flyout.
     */
    applyAlwaysOpenedToolboxFlyout(): void;
    /**
     * Closes the toolbox flyout before workspace reboot.
     */
    private closeFlyoutForReboot;
    /**
     * Checks whether the continuous toolbox plugin is enabled.
     */
    private isContinuousToolboxEnabled;
    /**
     * Returns a toolbox configuration with custom categories removed.
     * @param toolbox - Source toolbox configuration.
     * @returns A deep-cloned toolbox without custom category callbacks.
     */
    private getToolboxWithoutCustomCategories;
    /**
     * Applies language, theme, and renderer based on URL/query or UI.
     * @remarks
     * Reads URL params, updates UI dropdowns, updates workspace options,
     * and syncs values back into session storage and history.
     */
    setParamsBlockly: () => void;
    /**
     * Enables plugins based on URL options and stored preferences.
     * @remarks
     * Applies toggles for minimap, highlight, continuous toolbox, flyout,
     * and code editor based on session storage and URL parameters.
     */
    pluginsSetupWorkspace: () => void;
    /**
     * Saves workspace blocks to session storage.
     * @param storageKeyWorkspaceBlocks - Storage key used to persist blocks.
     */
    workspaceSaveBlocks: (storageKeyWorkspaceBlocks: string) => void;
    /**
     * Loads workspace blocks from session storage.
     * @param storageKeyWorkspaceBlocks - Storage key used to load blocks.
     * @returns Returns early if no saved data exists or if loading fails.
     * @remarks
     * Includes error handling for corrupted data and validates the structure
     * before attempting to load into the workspace.
     */
    workspaceLoadBlocks: (storageKeyWorkspaceBlocks: string) => void;
    /**
     * Saves workspace blocks to a downloadable file.
     * @param filename - Optional filename for the saved file (default: 'workspace.json').
     * @remarks
     * Serializes the workspace state to JSON and triggers a browser download.
     * Uses Blockly's recommended serialization API.
     */
    workspaceSaveToFile: (filename?: string) => void;
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
    workspaceLoadFromFile: (file: File, merge?: boolean) => void;
    /**
     * Merges blocks from a serialized state into the current workspace.
     * @param state - Serialized workspace state containing blocks to merge.
     * @remarks
     * Extracts blocks directly from the state and appends them using
     * Blockly.serialization.blocks.append(). This avoids creating a temporary
     * workspace and prevents plugin conflicts. Only top-level blocks are appended
     * (children are included automatically).
     */
    private mergeBlocksFromState;
    /**
     * Normalizes null/'null' variable types to empty string.
     * @remarks
     * Prevents FieldVariable type mismatch warnings during validation.
     */
    private normalizeVariableTypes;
    /**
     * Normalizes the variable type for a single variable ID.
     * @param variableId - Target variable ID.
     */
    private normalizeVariableTypeById;
    /**
     * Sanitizes serialized workspace coordinates to avoid NaN transforms at render time.
     * @param state - Serialized workspace state object to sanitize in-place.
     */
    private sanitizeSerializedWorkspaceState;
    /**
     * Determines whether the current language is RTL.
     * @returns True when the active language is configured as RTL.
     */
    private readonly isLangRtl;
    /**
     * Updates toolbox categories for the specified language.
     * @param newLang - Language code used to localize toolbox categories.
     */
    private readonly changeLanguageToolbox;
    /**
     * Applies language and RTL direction based on UI or URL.
     * @param menuOrUrl - When true, reads language from the dropdown; otherwise uses URL.
     * @returns True when the current language is RTL.
     */
    changeLanguage: (menuOrUrl: boolean) => boolean;
}
//# sourceMappingURL=blockly_application_type.d.ts.map