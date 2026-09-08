/**
 * @packageDocumentation
 * @module UcBlocklyHost.WorkspaceToolbar
 * @description Shared toolbar helpers for host apps (Factory, embeds with several workspaces).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";
import { SoundToggleControl } from "../core/sound_toggle_control";
import { applyUcBlocklyLocale } from "../core/locale";
import { languagesMap } from "../languages/languageMap";
import { themeMappings } from "../options";
import { changeLanguageToolbox } from "../language";
import type { ToolboxConfiguration } from "../toolbox";

/** UI languages supported by µcBlockly. */
export const WORKSPACE_TOOLBAR_LANGUAGES = ["fr", "en", "es", "ar"] as const;

export type WorkspaceToolbarLanguage =
  (typeof WORKSPACE_TOOLBAR_LANGUAGES)[number];

/** Blockly renderer ids used across µcBlockly products. */
export const WORKSPACE_TOOLBAR_RENDERERS = [
  "geras",
  "thrasos",
  "zelos",
  "minimalist",
] as const;

export type WorkspaceToolbarRenderer =
  (typeof WORKSPACE_TOOLBAR_RENDERERS)[number];

/** Theme keys from {@link themeMappings}. */
export const WORKSPACE_TOOLBAR_THEMES = Object.keys(themeMappings);

export interface WorkspaceToolbarSettings {
  language: WorkspaceToolbarLanguage;
  theme: string;
  renderer: WorkspaceToolbarRenderer;
}

export const DEFAULT_WORKSPACE_TOOLBAR_SETTINGS: WorkspaceToolbarSettings = {
  language: "fr",
  theme: "classic",
  renderer: "geras",
};

function isWorkspaceToolbarLanguage(
  value: string,
): value is WorkspaceToolbarLanguage {
  return (WORKSPACE_TOOLBAR_LANGUAGES as readonly string[]).includes(value);
}

function isWorkspaceToolbarRenderer(
  value: string,
): value is WorkspaceToolbarRenderer {
  return (WORKSPACE_TOOLBAR_RENDERERS as readonly string[]).includes(value);
}

/**
 * Returns a normalized copy of toolbar settings.
 * @param partial - The `partial` argument.
 * @returns Operation result.
 */
export function normalizeWorkspaceToolbarSettings(
  partial: Partial<WorkspaceToolbarSettings> = {},
): WorkspaceToolbarSettings {
  const language = partial.language ?? DEFAULT_WORKSPACE_TOOLBAR_SETTINGS.language;
  const theme = partial.theme ?? DEFAULT_WORKSPACE_TOOLBAR_SETTINGS.theme;
  const renderer = partial.renderer ?? DEFAULT_WORKSPACE_TOOLBAR_SETTINGS.renderer;
  return {
    language: isWorkspaceToolbarLanguage(language)
      ? language
      : DEFAULT_WORKSPACE_TOOLBAR_SETTINGS.language,
    theme: theme in themeMappings ? theme : DEFAULT_WORKSPACE_TOOLBAR_SETTINGS.theme,
    renderer: isWorkspaceToolbarRenderer(renderer)
      ? renderer
      : DEFAULT_WORKSPACE_TOOLBAR_SETTINGS.renderer,
  };
}

/**
 * Localized label from µcBlockly message catalog.
 * @param language - Language code (e.g. `fr`, `en`).
 * @param key - Lookup key.
 */
export function getWorkspaceToolbarMessage(
  language: string,
  key: keyof (typeof languagesMap)["fr"],
): string {
  const lang = languagesMap[language] ?? languagesMap.fr;
  return lang[key] ?? languagesMap.fr[key] ?? String(key);
}

/**
 * Applies Blockly + µcBlockly locale globally.
 * @param language - Language code (e.g. `fr`, `en`).
 */
export function applyWorkspaceToolbarLocale(language: string): void {
  applyUcBlocklyLocale(language);
}

/**
 * Resolves a theme key to a Blockly theme instance.
 * @param themeKey - The `themeKey` argument.
 * @returns Operation result.
 */
export function resolveWorkspaceToolbarTheme(themeKey: string): Blockly.Theme {
  return themeMappings[themeKey] ?? themeMappings.classic;
}

/**
 * Standard Blockly inject options shared by Factory / embed workspaces.
 * @returns Operation result.
 */
export function getStandardWorkspaceChromeOptions(): Blockly.BlocklyOptions {
  return {
    scrollbars: true,
    trashcan: true,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1,
      maxScale: 6,
      minScale: 0.1,
      scaleSpeed: 1.2,
      pinch: true,
    },
    move: {
      scrollbars: true,
      drag: true,
      wheel: true,
    },
    grid: {
      spacing: 20,
      length: 3,
      colour: "#ccc",
      snap: true,
    },
  };
}

/**
 * Applies a theme to every workspace in the list.
 * @param workspaces - The `workspaces` argument.
 * @param themeKey - The `themeKey` argument.
 */
export function applyThemeToWorkspaces(
  workspaces: Blockly.WorkspaceSvg[],
  themeKey: string,
): void {
  const theme = resolveWorkspaceToolbarTheme(themeKey);
  for (const workspace of workspaces) {
    workspace.setTheme(theme);
    workspace.refreshTheme();
  }
}

/**
 * Updates toolbox on a workspace when language changes (optional µcBlockly toolbox).
 * @param workspace - Blockly workspace.
 * @param toolbox - Toolbox configuration.
 * @param language - Language code (e.g. `fr`, `en`).
 */
export function applyToolboxLanguageToWorkspace(
  workspace: Blockly.WorkspaceSvg,
  toolbox: ToolboxConfiguration,
  language: string,
): void {
  workspace.updateToolbox(changeLanguageToolbox(language, toolbox));
}

/**
 * Undo one step on each workspace (each keeps its own stack).
 * @param workspaces - The `workspaces` argument.
 */
export function undoWorkspaces(workspaces: Blockly.WorkspaceSvg[]): void {
  for (const workspace of workspaces) {
    workspace.undo(false);
  }
}

/**
 * Redo one step on each workspace.
 * @param workspaces - The `workspaces` argument.
 */
export function redoWorkspaces(workspaces: Blockly.WorkspaceSvg[]): void {
  for (const workspace of workspaces) {
    workspace.undo(true);
  }
}

const installedChrome = new WeakSet<Blockly.WorkspaceSvg>();

/**
 * Zoom-to-fit + sound toggle (contrôles manquants des workspaces Factory).
 * @param workspace - Blockly workspace.
 */
export function installWorkspaceChromePlugins(
  workspace: Blockly.WorkspaceSvg,
): void {
  if (installedChrome.has(workspace)) {
    return;
  }
  installedChrome.add(workspace);
  const zoom = new ZoomToFitControl(workspace);
  zoom.init();
  const sound = new SoundToggleControl(workspace);
  sound.init();
}
/**
 * Merge Workspace Toolbar Inject Options.
 * @param settings - Settings object.
 * @param options - Configuration options.
 * @returns Operation result.
 */
export function mergeWorkspaceToolbarInjectOptions(
  settings: WorkspaceToolbarSettings,
  options: Blockly.BlocklyOptions = {},
): Blockly.BlocklyOptions {
  const chrome = getStandardWorkspaceChromeOptions();
  const userTheme = resolveWorkspaceToolbarTheme(settings.theme);
  return {
    ...chrome,
    ...options,
    renderer: settings.renderer,
    theme: options.theme ?? userTheme,
    zoom: { ...chrome.zoom, ...(options.zoom ?? {}) },
    grid: Object.prototype.hasOwnProperty.call(options, "grid")
      ? options.grid
      : chrome.grid,
  };
}
