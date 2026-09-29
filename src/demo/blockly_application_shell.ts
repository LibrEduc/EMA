/**
 * @packageDocumentation
 * @module Demo.BlocklyApplicationShell
 * @description Demo shell: DOM, URL params, Monaco — delegates workspace to {@link UcBlocklyWorkspaceManager}.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { µcB_codeEditor } from "../code_editor";
import { µcB_addFlexResizerEvents } from "../workspace_flex";
import {
  registerWorkspaceForSvgResize,
  µcB_workspaceOnResize,
} from "../workspace_resize";
import { refreshBlocklyA11yExtensions } from "../blockly_a11y_extensions";
import { registerStrictConnectionChecker } from "../generators/arduino/strict_connection_checker";
import {
  patchBlockChangeForProcedureCompat,
  patchBlocklyDefensive,
  patchConnectionCheckerForConstBlock,
} from "../blockly_patches";
import { themeMappings } from "../options";
import { pushStateReplaceSearchParam } from "../tools";
import {
  getLangParamFromDropdown,
  getLangParamFromUrl,
  HTML_changeLanguage,
} from "../language";
import type { ToolboxConfiguration } from "../toolbox";
import {
  DEFAULT_UCBLOCKLY_ENFORCERS,
  resolveEnforcerOptions,
} from "../core/default_options";
import type { UcBlocklyPluginOptions } from "../core/types";
import type { UcBlocklyWorkspaceManager } from "../core/ucblockly_workspace_manager";
import { applyDemoBlocklyLocale } from "./demo_locale";
import { getShellMessage } from "../shell_messages";

patchConnectionCheckerForConstBlock();
patchBlockChangeForProcedureCompat();
patchBlocklyDefensive();

/**
 * Sync lazy load — avoids TDZ when webpack evaluates the workspace manager
 * while the demo entry is still initializing (circular live bindings).
 * @returns Workspace manager constructor.
 */
function loadWorkspaceManager(): typeof import("../core/ucblockly_workspace_manager").UcBlocklyWorkspaceManager {
  // webpack replaces require() with a sync chunk require at call time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("../core/ucblockly_workspace_manager").UcBlocklyWorkspaceManager;
}

function readPluginOptionsFromDom(): UcBlocklyPluginOptions {
  const highlight = document.getElementById(
    "pluginHighlight",
  ) as HTMLInputElement | null;
  const minimap = document.getElementById(
    "pluginMinimap",
  ) as HTMLInputElement | null;
  return {
    contentHighlight: highlight?.checked ?? false,
    minimapVisible: minimap?.checked ?? true,
  };
}

function resolveInitialThemeKey(): keyof typeof themeMappings {
  const themeFromUrl = new URLSearchParams(window.location.search).get("theme");
  const themeFromMenu = (
    document.getElementById("themeMenu") as HTMLSelectElement | null
  )?.value;
  if (
    themeFromUrl &&
    Object.prototype.hasOwnProperty.call(themeMappings, themeFromUrl)
  ) {
    return themeFromUrl as keyof typeof themeMappings;
  }
  if (
    themeFromMenu &&
    Object.prototype.hasOwnProperty.call(themeMappings, themeFromMenu)
  ) {
    return themeFromMenu as keyof typeof themeMappings;
  }
  return "classic";
}

/** Demo application state (workspace handle + toolbox metadata). */
export interface BlocklyApplicationType {
  workspace: Blockly.Workspace;
  toolbox: ToolboxConfiguration;
  toolboxChoice: string;
  LANGUAGE_NAME: Record<string, string>;
  LANGUAGE_RTL: string[];
  PLUGINS: string[];
  WORKSPACE_OPTIONS: Record<string, unknown>;
}

/**
 * Full µcBlockly demo: menus, Monaco, session storage.
 * Workspace logic lives in {@link UcBlocklyWorkspaceManager}.
 */
export class BlocklyApplication implements BlocklyApplicationType {
  toolbox: ToolboxConfiguration;
  toolboxChoice: string;
  LANGUAGE_NAME: Record<string, string>;
  LANGUAGE_RTL: string[];
  PLUGINS: string[];
  private readonly ws: UcBlocklyWorkspaceManager;
  /** Generated-code host (plain text fallback when Monaco is off). */
  private readonly contentCodeEl: HTMLElement | null;

  get workspace(): Blockly.Workspace {
    return this.ws.workspace;
  }

  get WORKSPACE_OPTIONS(): Record<string, unknown> {
    return this.ws.WORKSPACE_OPTIONS;
  }

  constructor(
    toolbox: ToolboxConfiguration,
    workspaceOptions: Record<string, unknown>,
    injectionDiv: HTMLElement,
    contentCodeEl: HTMLElement | null = null,
  ) {
    this.toolbox = toolbox;
    this.toolboxChoice = "cat";
    this.LANGUAGE_NAME = {};
    this.LANGUAGE_RTL = [];
    this.PLUGINS = [];
    this.contentCodeEl = contentCodeEl;

    const themeKey = resolveInitialThemeKey();
    workspaceOptions.theme = themeMappings[themeKey] ?? themeMappings.classic;

    const WorkspaceManager = loadWorkspaceManager();
    this.ws = new WorkspaceManager({
      baseToolbox: toolbox,
      workspaceOptions,
      language: getLangParamFromUrl(),
      injectionDiv,
      enforcers: resolveEnforcerOptions(DEFAULT_UCBLOCKLY_ENFORCERS),
      plugins: readPluginOptionsFromDom(),
      onCodeChange: (code) => {
        µcB_codeEditor.setValue(code);
        if (this.contentCodeEl) {
          this.contentCodeEl.textContent = code;
        }
      },
    });
  }

  public setAutoSaveEnabled = (enabled: boolean): void => {
    this.ws.setAutoSaveEnabled(enabled);
  };

  /** Clears blocks and undo/redo stacks on the live workspace. */
  public clearWorkspaceFully = (): void => {
    this.ws.clearWorkspaceFully();
  };

  public workspaceHasAnyBlocks = (): boolean => this.ws.workspaceHasAnyBlocks();

  public removeDefaultItemVariable = (): void => this.ws.removeDefaultItemVariable();

  public workspaceInit = (): void => {
    window.addEventListener("resize", µcB_workspaceOnResize, false);
    µcB_addFlexResizerEvents();
    this.ws.attachWorkspaceListeners();
  };

  public registerCustomToolboxCallbacks = (): void => {
    this.ws.registerCustomToolboxCallbacks();
  };

  public stripCustomCategoriesForContinuousToolbox = (): ToolboxConfiguration | null =>
    this.ws.stripCustomCategoriesForContinuousToolbox();

  public restoreToolboxAfterInject = (
    originalToolbox: ToolboxConfiguration | null,
  ): void => {
    const pinned = (
      document.getElementById("alwaysOpenedToolboxFlyout") as HTMLInputElement | null
    )?.checked;
    this.ws.restoreToolboxAfterInject(originalToolbox, !pinned);
    if (!pinned) {
      µcB_workspaceOnResize();
      Blockly.svgResize(this.workspace as Blockly.WorkspaceSvg);
      (this.workspace as Blockly.WorkspaceSvg).resize();
    }
  };

  public restoreWorkspaceAfterInject = (): void => {
    if (DEFAULT_UCBLOCKLY_ENFORCERS.strictConnectionChecker) {
      registerStrictConnectionChecker(this.workspace);
    }
    this.ws.restoreWorkspaceAfterInject();
  };

  public changeTheme = (themeChoice?: string): string => {
    if (!themeChoice) {
      themeChoice =
        (document.getElementById("themeMenu") as HTMLSelectElement | null)
          ?.value ?? "classic";
    }
    this.WORKSPACE_OPTIONS.theme = themeMappings[themeChoice];
    if (
      themeMappings.hasOwnProperty(themeChoice) &&
      !this.ws.isContinuousToolboxEnabled()
    ) {
      (this.workspace as Blockly.WorkspaceSvg).setTheme(
        themeMappings[themeChoice],
      );
    } else {
      this.workspaceReboot();
    }
    return themeChoice;
  };

  public changeRenderer = (
    renderNew: string = (
      document.getElementById("rendererMenu") as HTMLSelectElement | null
    )?.value ?? "geras",
  ): string => {
    if (!Blockly.registry.hasItem(Blockly.registry.Type.RENDERER, renderNew)) {
      renderNew = "geras";
      const rendererMenu = document.getElementById(
        "rendererMenu",
      ) as HTMLSelectElement | null;
      if (rendererMenu) {
        rendererMenu.value = renderNew;
      }
    }
    this.WORKSPACE_OPTIONS.renderer = renderNew;
    this.workspaceReboot();
    pushStateReplaceSearchParam("renderer", renderNew);
    return renderNew;
  };

  public workspaceReboot = (): void => {
    µcB_workspaceOnResize();
    Blockly.svgResize(this.workspace as Blockly.WorkspaceSvg);

    this.ws.reboot(() => {
      const currentLang = getLangParamFromUrl();
      this.ws.updateToolboxForLanguage(currentLang);
      applyDemoBlocklyLocale(currentLang);
    });

    registerWorkspaceForSvgResize(this.workspace);
    if (DEFAULT_UCBLOCKLY_ENFORCERS.strictConnectionChecker) {
      registerStrictConnectionChecker(this.workspace);
    }
    refreshBlocklyA11yExtensions();

    µcB_workspaceOnResize();
    Blockly.svgResize(this.workspace as Blockly.WorkspaceSvg);
    (this.workspace as Blockly.WorkspaceSvg).resize();

    const deferMinimap = this.ws.isContinuousToolboxEnabled();
    this.workspaceSetupPlugins(false, () => {
      this.ws.setMinimapVisible(
        (document.getElementById("pluginMinimap") as HTMLInputElement | null)
          ?.checked ?? true,
      );
      this.ws.workspaceLoadBlocks("mainWorkspace_blocks");
      (this.workspace as Blockly.WorkspaceSvg).scrollCenter();
      this.applyAlwaysOpenedToolboxFlyout();
    }, deferMinimap);
  };

  public workspaceSetupPlugins = (
    disposePlugin = false,
    onPluginsReady?: () => void,
    deferMinimap = false,
  ): void => {
    if (!disposePlugin) {
      this.ws.setPluginOptions(readPluginOptionsFromDom());
    }
    this.ws.setupPlugins(disposePlugin, onPluginsReady, deferMinimap);
  };

  public setContentHighlight = (enabled: boolean): void => {
    this.ws.setContentHighlight(enabled);
  };

  public applyAlwaysOpenedToolboxFlyout = (): void => {
    const pinned = (
      document.getElementById("alwaysOpenedToolboxFlyout") as HTMLInputElement | null
    )?.checked ?? false;
    this.ws.applyFlyoutPinnedOpen(pinned);
    if (!pinned) {
      µcB_workspaceOnResize();
      const ws = this.workspace as Blockly.WorkspaceSvg;
      Blockly.svgResize(ws);
      ws.resize();
    }
  };

  public syncToolboxAndPinsToCurrentBoard = (): void => {
    this.ws.syncToolboxAndPins();
  };

  public workspaceSaveBlocks = (storageKey: string): void => {
    this.ws.workspaceSaveBlocks(storageKey);
  };

  public workspaceLoadBlocks = (storageKey: string): void => {
    this.ws.workspaceLoadBlocks(storageKey);
  };

  public workspaceSaveToFile = (filename?: string): void => {
    try {
      this.ws.workspaceSaveToFile(filename);
    } catch (error) {
      console.error("Failed to save workspace to file:", error);
      alert(getShellMessage("FILE_SAVE_ERROR", getLangParamFromUrl()));
    }
  };

  public workspaceLoadFromFile = (file: File, merge = false): void => {
    this.ws.workspaceLoadFromFile(file, merge, (code) => {
      µcB_codeEditor.setValue(code);
      if (this.contentCodeEl) {
        this.contentCodeEl.textContent = code;
      }
    });
  };

  public setParamsBlockly = (): void => {
    const searchParams = new URLSearchParams(window.location.search);
    let newParam: string | null;
    let rendererFromUrl = false;
    const previousRenderer = String(this.WORKSPACE_OPTIONS.renderer ?? "");

    const languageMenu = document.getElementById(
      "languageMenu",
    ) as HTMLSelectElement | null;
    newParam = searchParams.get("lang");
    if (languageMenu) {
      if (newParam == null || newParam === "null") {
        newParam = languageMenu.options[languageMenu.selectedIndex]?.value ?? "en";
      } else {
        languageMenu.value = newParam;
      }
      window.sessionStorage?.setItem("paramLang", newParam);
      pushStateReplaceSearchParam("lang", newParam);
    }

    const themeMenu = document.getElementById(
      "themeMenu",
    ) as HTMLSelectElement | null;
    newParam = searchParams.get("theme");
    if (themeMenu) {
      if (newParam == null || newParam === "null") {
        newParam =
          themeMenu.options[themeMenu.selectedIndex]?.value ?? "classic";
      } else {
        themeMenu.value = newParam;
      }
      const mappedTheme = themeMappings[newParam] ?? themeMappings.classic;
      this.WORKSPACE_OPTIONS.theme = mappedTheme;
      if (this.workspace && themeMappings.hasOwnProperty(newParam)) {
        (this.workspace as Blockly.WorkspaceSvg).setTheme(mappedTheme);
      }
      window.sessionStorage?.setItem("paramTheme", newParam);
      pushStateReplaceSearchParam("theme", newParam);
    }

    const rendererMenu = document.getElementById(
      "rendererMenu",
    ) as HTMLSelectElement | null;
    newParam = searchParams.get("renderer");
    if (rendererMenu) {
      if (newParam == null || newParam === "null") {
        newParam =
          rendererMenu.options[rendererMenu.selectedIndex]?.value ?? "geras";
      } else {
        rendererMenu.value = newParam;
        rendererFromUrl = true;
      }
      this.WORKSPACE_OPTIONS.renderer = newParam;
      window.sessionStorage?.setItem("paramRenderer", newParam);
      pushStateReplaceSearchParam("renderer", newParam);
      if (rendererFromUrl && this.workspace && previousRenderer !== newParam) {
        this.changeRenderer(newParam);
      }
    }

    newParam = searchParams.get("board");
    const boardMenu = document.getElementById("boardMenu") as HTMLSelectElement | null;
    if (boardMenu && boardMenu.options.length > 0) {
      const fallbackBoard =
        boardMenu.options[boardMenu.selectedIndex]?.value ??
        boardMenu.options[0].value;
      if (newParam == null || newParam === "null") {
        newParam = fallbackBoard;
      } else if (
        Array.from(boardMenu.options).some((option) => option.value === newParam)
      ) {
        boardMenu.value = newParam;
      } else {
        newParam = fallbackBoard;
      }
      window.sessionStorage?.setItem("paramBoard", newParam);
      pushStateReplaceSearchParam("board", newParam);
    }
    if (this.workspace) {
      this.syncToolboxAndPinsToCurrentBoard();
    }
  };

  public pluginsSetupWorkspace = (): void => {
    const searchParams = new URLSearchParams(window.location.search);
    let paramsURL: string[] = [""];
    const optionsParam = searchParams.get("options");
    if (optionsParam !== null) {
      paramsURL = optionsParam.split(",").filter(Boolean);
    }
    const minimapFromUrl =
      searchParams.get("minimap") !== null &&
      searchParams.get("minimap") !== "0" &&
      searchParams.get("minimap") !== "false";

    const toggle = (id: string, sessionKey: string, urlFlag: string): void => {
      if (
        window.sessionStorage.getItem(sessionKey) === "true" ||
        paramsURL.includes(urlFlag)
      ) {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (!el) {
          return;
        }
        el.checked = true;
        el.dispatchEvent(new Event("change"));
      }
    };

    if (
      window.sessionStorage.getItem("pluginMinimap") === "true" ||
      paramsURL.includes("minimap") ||
      minimapFromUrl
    ) {
      toggle("pluginMinimap", "pluginMinimap", "minimap");
    }
    toggle("pluginHighlight", "pluginHighlight", "highlight");
    toggle("pluginContinuousToolbox", "pluginContinuousToolbox", "ctoolbox");

    if (
      window.sessionStorage.getItem("alwaysOpenedToolboxFlyout") === "true" ||
      paramsURL.includes("flyout")
    ) {
      const cb = document.getElementById(
        "alwaysOpenedToolboxFlyout",
      ) as HTMLInputElement | null;
      if (cb) {
        cb.checked = true;
        this.applyAlwaysOpenedToolboxFlyout();
      }
    }
    if (
      window.sessionStorage.getItem("codeEditorSwitch") === "true" ||
      paramsURL.includes("codeEditor")
    ) {
      toggle("codeEditorSwitch", "codeEditorSwitch", "codeEditor");
      const monacoContainer = document.getElementById(
        "div_content_monacoEditor",
      ) as HTMLElement | null;
      if (monacoContainer) {
        void µcB_codeEditor.ensureInitialized(monacoContainer);
      }
    }
    if (
      window.sessionStorage.getItem("debugSwitch") === "true" ||
      paramsURL.includes("debug") ||
      window.localStorage?.getItem("ucbDebug") === "1"
    ) {
      toggle("debugSwitch", "debugSwitch", "debug");
    }
  };

  public changeLanguage = (menuOrUrl: boolean): boolean => {
    const newLang = menuOrUrl ? getLangParamFromDropdown() : getLangParamFromUrl();
    const rtl = this.LANGUAGE_RTL.indexOf(newLang) !== -1;
    HTML_changeLanguage(newLang, rtl);
    applyDemoBlocklyLocale(newLang);
    this.ws.updateToolboxForLanguage(newLang);
    this.updatePluginOptionsDirection(rtl);
    return rtl;
  };

  private updatePluginOptionsDirection(rtl: boolean): void {
    const container = document.getElementById("pluginOptions");
    if (!container) {
      return;
    }
    container.querySelectorAll("label.plugin-option").forEach((label) => {
      const input = label.querySelector("input");
      const span = label.querySelector("span.lang");
      if (!input || !span) {
        return;
      }
      if (rtl) {
        if (input.nextSibling !== span) {
          label.insertBefore(input, span);
        }
      } else if (span.nextSibling !== input) {
        label.insertBefore(span, input);
      }
    });
  }
}
