/**
 * @packageDocumentation
 * @module Demo.Dom
 * @description Single fail-soft resolution of demo-shell DOM hosts.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** Critical hosts required to inject Blockly and wire the demo toolbar. */
export const DEMO_SHELL_REQUIRED_IDS = [
  "div_workspace_content_area",
  "div_workspace_content_blockly",
  "div_content_code",
  "div_content_monacoEditor",
  "languageMenu",
  "themeMenu",
  "rendererMenu",
  "boardMenu",
  "pluginMinimap",
  "pluginHighlight",
  "saveButton",
  "loadButton",
  "loadFileInput",
  "undoButton",
  "redoButton",
  "pluginContinuousToolbox",
  "alwaysOpenedToolboxFlyout",
  "codeEditorSwitch",
  "debugSwitch",
] as const;

export type DemoShellRequiredId = (typeof DEMO_SHELL_REQUIRED_IDS)[number];

/** Typed demo shell hosts (only available when {@link resolveDemoShellDom} succeeds). */
export interface DemoShellDom {
  workspaceContentArea: HTMLElement;
  workspaceContentBlockly: HTMLElement;
  contentCode: HTMLElement;
  contentMonacoEditor: HTMLElement;
  languageMenu: HTMLSelectElement;
  themeMenu: HTMLSelectElement;
  rendererMenu: HTMLSelectElement;
  boardMenu: HTMLSelectElement;
  pluginMinimap: HTMLInputElement;
  pluginHighlight: HTMLInputElement;
  saveButton: HTMLElement;
  loadButton: HTMLElement;
  loadFileInput: HTMLInputElement;
  undoButton: HTMLElement;
  redoButton: HTMLElement;
  pluginContinuousToolbox: HTMLInputElement;
  alwaysOpenedToolboxFlyout: HTMLInputElement;
  codeEditorSwitch: HTMLInputElement;
  debugSwitch: HTMLInputElement;
}

export type ResolveDemoShellDomResult =
  | { ok: true; elements: DemoShellDom; missing: [] }
  | { ok: false; elements: null; missing: DemoShellRequiredId[] };

/**
 * Looks up a DOM element by id without non-null assertions.
 * @param id - Element id.
 * @param doc - Document to query (defaults to global `document`).
 */
export const getElementByIdOrNull = <T extends HTMLElement = HTMLElement>(
  id: string,
  doc: Document = document,
): T | null => doc.getElementById(id) as T | null;

/**
 * Resolves every demo-shell host once. Does not throw. Callers should abort boot when `ok` is false.
 * @param doc - The `doc` argument.
 * @returns Operation result.
 */
export const resolveDemoShellDom = (
  doc: Document = document,
): ResolveDemoShellDomResult => {
  const missing = DEMO_SHELL_REQUIRED_IDS.filter(
    (id) => !doc.getElementById(id),
  ) as DemoShellRequiredId[];

  if (missing.length > 0) {
    return { ok: false, elements: null, missing };
  }

  // Avoid repeated getElementById after missing[] check.
  const byId = <T extends HTMLElement>(id: DemoShellRequiredId): T =>
    doc.getElementById(id) as T;

  return {
    ok: true,
    missing: [],
    elements: {
      workspaceContentArea: byId("div_workspace_content_area"),
      workspaceContentBlockly: byId("div_workspace_content_blockly"),
      contentCode: byId("div_content_code"),
      contentMonacoEditor: byId("div_content_monacoEditor"),
      languageMenu: byId<HTMLSelectElement>("languageMenu"),
      themeMenu: byId<HTMLSelectElement>("themeMenu"),
      rendererMenu: byId<HTMLSelectElement>("rendererMenu"),
      boardMenu: byId<HTMLSelectElement>("boardMenu"),
      pluginMinimap: byId<HTMLInputElement>("pluginMinimap"),
      pluginHighlight: byId<HTMLInputElement>("pluginHighlight"),
      saveButton: byId("saveButton"),
      loadButton: byId("loadButton"),
      loadFileInput: byId<HTMLInputElement>("loadFileInput"),
      undoButton: byId("undoButton"),
      redoButton: byId("redoButton"),
      pluginContinuousToolbox: byId<HTMLInputElement>("pluginContinuousToolbox"),
      alwaysOpenedToolboxFlyout: byId<HTMLInputElement>(
        "alwaysOpenedToolboxFlyout",
      ),
      codeEditorSwitch: byId<HTMLInputElement>("codeEditorSwitch"),
      debugSwitch: byId<HTMLInputElement>("debugSwitch"),
    },
  };
};

/**
 * Surfaces a visible, non-throwing boot failure when the demo HTML is incomplete.
 * @param missing - Missing element ids.
 * @param doc - Document that hosts the UI.
 */
export const reportMissingDemoShellDom = (
  missing: readonly string[],
  doc: Document = document,
): void => {
  const message = `µcBlockly demo: missing required DOM element(s): ${missing.join(", ")}`;
  console.error(message);

  const banner = doc.createElement("div");
  banner.setAttribute("role", "alert");
  banner.style.cssText =
    "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;" +
    "padding:1.5rem;background:#1a1a1a;color:#f5f5f5;font:16px/1.4 system-ui,sans-serif;text-align:center;";
  banner.textContent = message;

  const root = doc.body ?? doc.documentElement;
  if (root) {
    root.prepend(banner);
  }
};
