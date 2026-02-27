/**
 * @packageDocumentation
 * @module µcBlockly
 * @description Main entry point for µcBlockly application
 * @remarks
 * Bootstraps Blockly, registers blocks, and wires UI event handlers.
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

import * as Blockly from "blockly";
import { SeparatorAxis } from "blockly/core/flyout_separator";
import type * as Monaco from "monaco-editor";
import "@blockly/block-plus-minus";
import "@blockly/toolbox-search";
import { registerToolboxSearchI18n } from "./toolbox_search_i18n";
registerToolboxSearchI18n();

// Configuration de Monaco Editor pour utilisation locale (chemins relatifs)
// Force la définition de MonacoEnvironment pour s'assurer que les chemins sont corrects
const globalWindow = window as Window & {
  MonacoEnvironment?: {
    getWorkerUrl: (moduleId: string, label: string) => string;
  };
  Blockly?: typeof Blockly;
};

globalWindow.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: string, label: string) {
    if (label === 'json') {
      return './json.worker.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }
    return './editor.worker.js';
  }
};

// Exposer Blockly globalement IMMÉDIATEMENT après l'import
if (typeof window !== 'undefined') {
  // Exposer Blockly et toutes ses propriétés
  globalWindow.Blockly = Blockly;

  // Exposer également les propriétés principales individuellement
  globalWindow.Blockly = {
    ...Blockly,
    Blocks: Blockly.Blocks,
    VERSION: Blockly.VERSION,
    inject: Blockly.inject,
    Workspace: Blockly.Workspace,
    WorkspaceSvg: Blockly.WorkspaceSvg,
    svgResize: Blockly.svgResize,
    registry: Blockly.registry,
    ToolboxCategory: Blockly.ToolboxCategory,
    Names: Blockly.Names,
    Variables: Blockly.Variables,
    utils: Blockly.utils
  };

  debugLog('✅ Blockly et toutes ses propriétés exposés globalement immédiatement');
  debugLog('Propriétés disponibles:', Object.keys(globalWindow.Blockly));
}

/**
 * Defines typed variable blocks once Blockly is available.
 * @returns True when blocks were registered, false when Blockly is unavailable.
 */
function defineTypedVariableBlocks() {
  if (typeof Blockly !== 'undefined') {
    defineAllTypedVariableBlocks();
    return true;
  }
  return false;
}

import { arduinoGenerator } from "./generators/arduino";
import { defineAllTypedVariableBlocks } from "./categories/blockly";
import { applyBlockTypesFromRegistry } from "./generators/arduino/block_types_registry";
import { configureStandardBlocks } from "./generators/arduino/configure_standard_blocks";
import { debugLog } from "./generators/arduino/debug";
import {
  HTML_populateLanguages,
  changeLanguageToolbox,
  getLangParamFromUrl,
  HTML_changeLanguage,
} from "./language";
import { languagesMap } from "./languages/languageMap";
import { BOARD_PROFILES, DEFAULT_BOARD_ID } from "./boards";
import { themeMappings } from "./options";

// Exposer arduinoGenerator globalement IMMÉDIATEMENT après l'import
if (typeof window !== 'undefined') {
  // Exposer arduinoGenerator et ses propriétés principales
  const exposedArduinoGenerator = arduinoGenerator;
  (globalWindow as typeof globalWindow & {
    arduinoGenerator?: typeof arduinoGenerator;
  }).arduinoGenerator = exposedArduinoGenerator;

  debugLog('✅ arduinoGenerator et toutes ses propriétés exposés globalement immédiatement');
  debugLog('Propriétés arduinoGenerator disponibles:', Object.keys(exposedArduinoGenerator));
}
import { addReplaceParamToUrl, setPluginsInURL } from "./tools";
import { basic_toolbox } from "./toolbox";
import { BlocklyApplication } from "./blockly_application_type";
//plugins
import {
  ContinuousCategory,
  ContinuousFlyout,
  ContinuousMetrics,
  ContinuousToolbox,
  RecyclableBlockFlyoutInflater,
} from "@blockly/continuous-toolbox";
import { ContentHighlight } from "@blockly/workspace-content-highlight";
//import { KeyboardNavigation } from '@blockly/keyboard-navigation';
//KeyboardNavigation.registerKeyboardNavigationStyles();
import "./css/index.css";
import "./css/µcBlockly.css";

// Diagnostic switches for stepwise re-enable of typing overlay.
// Current step (requested): only configureStandardBlocks enabled.
const ENABLE_TYPED_VARIABLE_BLOCKS = true;
const ENABLE_BLOCK_TYPES_REGISTRY = true;
const ENABLE_CONFIGURE_STANDARD_BLOCKS = true;

// Cache DOM elements
const elements = {
  workspaceContentArea: document.getElementById("div_workspace_content_area")!,
  workspaceContentBlockly: document.getElementById(
    "div_workspace_content_blockly",
  )!,
  contentCode: document.getElementById("div_content_code")!,
  contentMonacoEditor: document.getElementById("div_content_monacoEditor")!,
  languageMenu: document.getElementById("languageMenu") as HTMLSelectElement,
  themeMenu: document.getElementById("themeMenu") as HTMLSelectElement,
  rendererMenu: document.getElementById("rendererMenu") as HTMLSelectElement,
  boardMenu: document.getElementById("boardMenu") as HTMLSelectElement,
  pluginMinimap: document.getElementById("pluginMinimap") as HTMLInputElement,
  pluginHighlight: document.getElementById(
    "pluginHighlight",
  ) as HTMLInputElement,
  saveButton: document.getElementById("saveButton") as HTMLElement,
  loadButton: document.getElementById("loadButton") as HTMLElement,
  loadFileInput: document.getElementById("loadFileInput") as HTMLInputElement,
  undoButton: document.getElementById("undoButton") as HTMLElement,
  redoButton: document.getElementById("redoButton") as HTMLElement,
  pluginContinuousToolbox: document.getElementById(
    "pluginContinuousToolbox",
  ) as HTMLInputElement,
  alwaysOpenedToolboxFlyout: document.getElementById(
    "alwaysOpenedToolboxFlyout",
  ) as HTMLInputElement,
  codeEditorSwitch: document.getElementById(
    "codeEditorSwitch",
  ) as HTMLInputElement,
  debugSwitch: document.getElementById("debugSwitch") as HTMLInputElement,
};

const syncUiPaletteTheme = (): void => {
  const clamp = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));
  const toHex = (r: number, g: number, b: number): string =>
    `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
  type Rgb = { r: number; g: number; b: number };
  const parseColor = (raw: string | undefined): Rgb | null => {
    if (!raw) return null;
    const value = raw.trim().toLowerCase();
    if (value.startsWith("#")) {
      const hex = value.slice(1);
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16),
        };
      }
      if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
        };
      }
      return null;
    }
    const rgb = value.match(/^rgba?\(([^)]+)\)$/);
    if (!rgb) return null;
    const parts = rgb[1].split(",").map((p) => Number(p.trim()));
    if (parts.length < 3 || parts.some((p) => !Number.isFinite(p))) return null;
    return { r: clamp(parts[0]), g: clamp(parts[1]), b: clamp(parts[2]) };
  };
  const mix = (a: Rgb, b: Rgb, ratio: number): Rgb => ({
    r: clamp(a.r + (b.r - a.r) * ratio),
    g: clamp(a.g + (b.g - a.g) * ratio),
    b: clamp(a.b + (b.b - a.b) * ratio),
  });
  const relativeLuminance = (c: Rgb): number => {
    const channel = (x: number): number => {
      const value = x / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
  };
  const contrastRatio = (a: Rgb, b: Rgb): number => {
    const l1 = relativeLuminance(a);
    const l2 = relativeLuminance(b);
    const light = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    return (light + 0.05) / (dark + 0.05);
  };
  const textOn = (bg: Rgb): Rgb => {
    const white = { r: 248, g: 250, b: 252 };
    const black = { r: 17, g: 24, b: 39 };
    return contrastRatio(white, bg) >= contrastRatio(black, bg) ? white : black;
  };
  const ensureContrast = (
    candidate: Rgb,
    against: Rgb,
    minRatio: number,
    preferLighten: boolean,
  ): Rgb => {
    let out = candidate;
    if (contrastRatio(out, against) >= minRatio) {
      return out;
    }
    const toward = preferLighten ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
    for (let i = 1; i <= 10; i += 1) {
      const mixed = mix(out, toward, i * 0.08);
      if (contrastRatio(mixed, against) >= minRatio) {
        out = mixed;
        break;
      }
      out = mixed;
    }
    return out;
  };

  const selectedThemeKey = (elements.themeMenu?.value || "classic") as keyof typeof themeMappings;
  const selectedTheme = themeMappings[selectedThemeKey] ?? themeMappings.classic;
  const styles = selectedTheme.componentStyles ?? {};
  const workspace = parseColor(styles.workspaceBackgroundColour) ?? { r: 248, g: 250, b: 252 };
  const toolbox = parseColor(styles.toolboxBackgroundColour) ?? mix(workspace, { r: 226, g: 232, b: 240 }, 0.45);
  const flyout = parseColor(styles.flyoutBackgroundColour) ?? mix(toolbox, workspace, 0.4);
  const accent = parseColor(styles.markerColour) ?? parseColor(styles.cursorColour) ?? { r: 11, g: 87, b: 208 };
  const scrollbar = parseColor(styles.scrollbarColour) ?? mix(toolbox, textOn(toolbox), 0.45);
  const isDark = relativeLuminance(workspace) < 0.35;

  const panelCodeBg = mix(workspace, flyout, isDark ? 0.35 : 0.15);
  const panelConsoleBg = mix(toolbox, flyout, isDark ? 0.5 : 0.35);
  const panelRightBg = mix(workspace, toolbox, isDark ? 0.45 : 0.3);
  const panelBottomBg = mix(flyout, toolbox, isDark ? 0.55 : 0.45);
  const resizerBg = mix(workspace, toolbox, isDark ? 0.6 : 0.5);
  // Derive button colors from each Blockly theme, then enforce readability.
  const toggleBase = mix(resizerBg, accent, isDark ? 0.22 : 0.14);
  const toggleBg = ensureContrast(toggleBase, resizerBg, 1.35, isDark);
  const toggleFg = textOn(toggleBg);
  const toggleHoverCandidate = mix(toggleBg, toggleFg, isDark ? 0.22 : 0.1);
  const toggleHover = ensureContrast(toggleHoverCandidate, resizerBg, 1.45, isDark);
  const toggleBorderCandidate = mix(toggleBg, accent, isDark ? 0.45 : 0.35);
  const toggleBorder = ensureContrast(toggleBorderCandidate, toggleBg, 1.3, !isDark);

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--panel-code-bg", toHex(panelCodeBg.r, panelCodeBg.g, panelCodeBg.b));
  {
    const fg = textOn(panelCodeBg);
    rootStyle.setProperty("--panel-code-fg", toHex(fg.r, fg.g, fg.b));
  }
  rootStyle.setProperty("--panel-console-bg", toHex(panelConsoleBg.r, panelConsoleBg.g, panelConsoleBg.b));
  {
    const fg = textOn(panelConsoleBg);
    rootStyle.setProperty("--panel-console-fg", toHex(fg.r, fg.g, fg.b));
  }
  rootStyle.setProperty("--panel-right-bg", toHex(panelRightBg.r, panelRightBg.g, panelRightBg.b));
  rootStyle.setProperty("--panel-bottom-bg", toHex(panelBottomBg.r, panelBottomBg.g, panelBottomBg.b));
  rootStyle.setProperty("--resizer-bg", toHex(resizerBg.r, resizerBg.g, resizerBg.b));
  rootStyle.setProperty("--resizer-color", toHex(scrollbar.r, scrollbar.g, scrollbar.b));
  rootStyle.setProperty("--resizer-focus", toHex(accent.r, accent.g, accent.b));
  rootStyle.setProperty("--focus-ring", toHex(accent.r, accent.g, accent.b));
  rootStyle.setProperty("--toggle-bg", toHex(toggleBg.r, toggleBg.g, toggleBg.b));
  rootStyle.setProperty("--toggle-bg-hover", toHex(toggleHover.r, toggleHover.g, toggleHover.b));
  rootStyle.setProperty("--toggle-border", toHex(toggleBorder.r, toggleBorder.g, toggleBorder.b));
  rootStyle.setProperty("--toggle-fg", toHex(toggleFg.r, toggleFg.g, toggleFg.b));
};

const FLEX_UP_RIGHT_LAST_OPEN_KEY = "flexContainerUpRightLastOpen";
const FLEX_BOTTOM_LAST_OPEN_KEY = "flexContainerBottomLastOpen";
const RIGHT_PANEL_TOGGLE_BUTTON_ID = "flex_up_right_toggle_button";
const BOTTOM_PANEL_TOGGLE_BUTTON_ID = "flex_bottom_toggle_button";
const FLEX_COLLAPSE_EPSILON = 0.01;

const parsePositiveFlex = (rawValue: string | null | undefined, fallback = 0): number => {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const snapNearZeroFlex = (previous: HTMLElement, next: HTMLElement): void => {
  const prevGrow = parsePositiveFlex(previous.style.flexGrow, 0);
  const nextGrow = parsePositiveFlex(next.style.flexGrow, 0);
  const total = prevGrow + nextGrow;
  if (total <= 0) {
    return;
  }
  if (prevGrow <= FLEX_COLLAPSE_EPSILON) {
    previous.style.flexGrow = "0";
    next.style.flexGrow = String(total);
    return;
  }
  if (nextGrow <= FLEX_COLLAPSE_EPSILON) {
    next.style.flexGrow = "0";
    previous.style.flexGrow = String(total);
  }
};

type SupportedLang = "fr" | "en" | "es" | "ar";
const getSupportedLang = (): SupportedLang => {
  const value = (elements.languageMenu?.value || getLangParamFromUrl() || "en").toLowerCase();
  if (value === "fr" || value === "es" || value === "ar") {
    return value;
  }
  return "en";
};

const getA11yLabel = (
  key:
    | "A11Y_GENERATED_CODE_REGION"
    | "A11Y_CONSOLE_REGION"
    | "A11Y_HORIZONTAL_RESIZER"
    | "A11Y_VERTICAL_RESIZER"
    | "A11Y_COLLAPSE_CODE_PANEL"
    | "A11Y_OPEN_CODE_PANEL"
    | "A11Y_COLLAPSE_CONSOLE_PANEL"
    | "A11Y_OPEN_CONSOLE_PANEL",
): string => {
  const lang = getSupportedLang();
  return languagesMap[lang]?.[key] ?? languagesMap.en[key] ?? key;
};

/**
 * Restores panel layout from session storage.
 * Falls back to sane defaults when nothing is stored yet.
 */
const restoreLayoutFromSessionStorage = (): void => {
  const layoutElements = {
    flexContainerUp: document.getElementById(
      "flex_container_up",
    ) as HTMLElement,
    flexContainerUpLeft: document.getElementById(
      "flex_container_up_left",
    ) as HTMLElement,
    flexContainerUpRight: document.getElementById(
      "flex_container_up_right",
    ) as HTMLElement,
    flexContainerBottom: document.getElementById(
      "flex_container_bottom",
    ) as HTMLElement,
  };

  const defaults: Record<string, string> = {
    flexContainerUp: "1",
    flexContainerUpLeft: "1",
    flexContainerUpRight: "0",
    flexContainerBottom: "0",
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    if (!element) return;
    const savedValue = window.sessionStorage.getItem(key);
    const parsed = savedValue !== null ? Number(savedValue) : NaN;
    const safeValue = Number.isFinite(parsed) && parsed >= 0
      ? String(parsed)
      : defaults[key];
    element.style.flexGrow = safeValue;
  });
};

/**
 * Ensures Blockly host div has valid dimensions before first inject.
 */
const primeWorkspaceContainerDimensions = (): void => {
  if (!elements.workspaceContentArea || !elements.workspaceContentBlockly) {
    return;
  }
  let x = Number(elements.workspaceContentArea.offsetLeft) || 0;
  let y = Number(elements.workspaceContentArea.offsetTop) || 0;
  let element: HTMLElement = elements.workspaceContentArea;
  while (element.offsetParent) {
    element = element.offsetParent as HTMLElement;
    x += Number(element.offsetLeft) || 0;
    y += Number(element.offsetTop) || 0;
  }
  const rawWidth = Number(elements.workspaceContentArea.offsetWidth);
  const rawHeight = Number(elements.workspaceContentArea.offsetHeight);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 1;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 1;
  Object.assign(elements.workspaceContentBlockly.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${Number.isFinite(x) ? x : 0}px`,
    top: `${Number.isFinite(y) ? y : 0}px`,
  });
};

// Verify all required elements exist
const requiredElements = [
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
  "codeEditorSwitch",
  "debugSwitch",
];

requiredElements.forEach((id) => {
  if (!document.getElementById(id)) {
    console.error(`Required element with id '${id}' not found in DOM`);
  }
});

/**
 * Lazily initializes Monaco Editor to avoid heavy startup cost.
 */
export class LazyMonacoEditor {
  private editor?: Monaco.editor.IStandaloneCodeEditor;
  private pendingValue: string | null = null;
  private initializing: Promise<void> | null = null;

  /**
   * Initializes the Monaco editor if it is not already created.
   * @param container - DOM element that hosts the editor.
   * @returns Resolves when the editor is ready.
   */
  async ensureInitialized(container: HTMLElement): Promise<void> {
    if (this.editor) {
      return;
    }
    if (this.initializing) {
      await this.initializing;
      return;
    }
    this.initializing = (async () => {
      const monaco = await import("monaco-editor");
      this.editor = monaco.editor.create(container, {
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        language: "cpp",
        lineNumbers: "on",
        readOnly: false,
        scrollBeyondLastLine: false,
      });
      if (this.pendingValue !== null) {
        this.editor.setValue(this.pendingValue);
        this.pendingValue = null;
      }
    })();
    await this.initializing;
  }

  /**
   * Sets the editor content, deferring until initialization if needed.
   * @param value - Full editor text content.
   */
  setValue(value: string): void {
    if (this.editor) {
      this.editor.setValue(value);
      return;
    }
    this.pendingValue = value;
  }
}

// Initialize Monaco Editor lazily
export const µcB_codeEditor = new LazyMonacoEditor();
if (elements.contentMonacoEditor) {
  elements.contentMonacoEditor.style.display = "none";
}

/**
 * Populates the board dropdown with all available board profiles.
 */
const HTML_populateBoards = (): void => {
  if (!elements.boardMenu) {
    return;
  }

  const getBoardFamily = (boardId: string): string => {
    if (boardId === "none") return "Other";
    if (boardId.startsWith("arduino_") || boardId === "lilypad" || boardId === "LilyPadUSB" || boardId === "attiny85") {
      return "Arduino / AVR";
    }
    if (boardId.startsWith("esp8266")) return "ESP8266";
    if (boardId.startsWith("esp32")) return "ESP32";
    if (boardId.startsWith("franzininho_")) return "Franzininho";
    if (boardId.startsWith("pi-pico")) return "Raspberry Pi Pico";
    if (boardId.startsWith("st-nucleo")) return "STM32 Nucleo";
    if (boardId.startsWith("teensy")) return "Teensy";
    if (boardId.startsWith("makeblock_")) return "Makeblock";
    if (boardId.startsWith("dfrobot_")) return "DFRobot";
    if (boardId.startsWith("dagu_")) return "Dagu";
    if (boardId.startsWith("peguino_")) return "Peguino";
    if (boardId.startsWith("kit_")) return "Kits";
    return "Other";
  };

  const currentLang =
    (elements.languageMenu?.value && elements.languageMenu.value.trim().length > 0
      ? elements.languageMenu.value
      : getLangParamFromUrl()) || "en";
  const noneLabel =
    languagesMap[currentLang]?.BOARD_NONE ??
    languagesMap.en?.BOARD_NONE ??
    "none";
  const previousValue = elements.boardMenu.value;

  elements.boardMenu.innerHTML = "";
  // Keep "none" as the first plain option (outside categories).
  if (BOARD_PROFILES.none) {
    const noneOption = document.createElement("option");
    noneOption.value = "none";
    noneOption.textContent = noneLabel;
    elements.boardMenu.appendChild(noneOption);
  }

  const groupedBoards = new Map<string, Array<{ boardId: string; label: string }>>();
  for (const [boardId, profile] of Object.entries(BOARD_PROFILES)) {
    if (boardId === "none") continue;
    const family = getBoardFamily(boardId);
    const description =
      typeof profile.description === "string" && profile.description.trim().length > 0
        ? profile.description
        : boardId;
    const list = groupedBoards.get(family) ?? [];
    list.push({ boardId, label: description });
    groupedBoards.set(family, list);
  }

  const sortedFamilies = [...groupedBoards.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  for (const family of sortedFamilies) {
    const familyBoards = groupedBoards.get(family);
    if (!familyBoards || familyBoards.length === 0) continue;

    familyBoards.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    const group = document.createElement("optgroup");
    group.label = family;
    for (const { boardId, label } of familyBoards) {
      const option = document.createElement("option");
      option.value = boardId;
      option.textContent = label;
      group.appendChild(option);
    }
    elements.boardMenu.appendChild(group);
  }
  if (elements.boardMenu.options.length > 0) {
    const fallbackValue =
      BOARD_PROFILES[DEFAULT_BOARD_ID] !== undefined
        ? DEFAULT_BOARD_ID
        : elements.boardMenu.options[0].value;
    const targetValue =
      (previousValue && BOARD_PROFILES[previousValue] !== undefined
        ? previousValue
        : fallbackValue);
    elements.boardMenu.value = targetValue;
  }
};

// Initialize Blockly Application
// Ensure custom blocks are registered before toolbox injection.
restoreLayoutFromSessionStorage();
defineTypedVariableBlocks();
primeWorkspaceContainerDimensions();
const µcB: BlocklyApplication = new BlocklyApplication(
  basic_toolbox,
  {
    grid: {
      spacing: 20,
      length: 3,
      colour: "#ccc",
      snap: true,
    },
    scrollbars: true,
    toolbox: changeLanguageToolbox(getLangParamFromUrl(), basic_toolbox),
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 6,
      minScale: 0.1,
      scaleSpeed: 1.2,
      pinch: true,
    },
    trashcan: true,
    /** Path to Blockly media (sounds, cursors, sprites). After build, public/media is copied to output as media/. */
    media: "./media/",
  },
  elements.workspaceContentBlockly,
);

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
µcB.LANGUAGE_NAME = {
  ar: "العربية",
  en: "English",
  es: "Español",
  fr: "Français",
};

/**
 * List of RTL languages.
 */
µcB.LANGUAGE_RTL = ["ar", "fa", "he", "lki"];

/**
 * Updates workspace SVG size and position to match layout.
 * @remarks
 * Computes offset and dimensions from the layout container and calls
 * Blockly.svgResize to update rendering.
 */
export const µcB_workspaceOnResize = (): void => {
  if (!elements.workspaceContentArea || !elements.workspaceContentBlockly) {
    console.warn("Workspace elements not found, skipping resize");
    return;
  }

  let x = Number(elements.workspaceContentArea.offsetLeft) || 0;
  let y = Number(elements.workspaceContentArea.offsetTop) || 0;
  let element: HTMLElement = elements.workspaceContentArea;
  while (element.offsetParent) {
    element = element.offsetParent as HTMLElement;
    x += Number(element.offsetLeft) || 0;
    y += Number(element.offsetTop) || 0;
  }
  const rawWidth = Number(elements.workspaceContentArea.offsetWidth);
  const rawHeight = Number(elements.workspaceContentArea.offsetHeight);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 1;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 1;
  Object.assign(elements.workspaceContentBlockly.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${Number.isFinite(x) ? x : 0}px`,
    top: `${Number.isFinite(y) ? y : 0}px`,
  });
  Blockly.svgResize(µcB.workspace as Blockly.WorkspaceSvg);
};

/**
 * Persists layout flex grow values to session storage.
 */
const saveLayoutToSessionStorage = (): void => {
  const layoutElements = {
    flexContainerUp: document.getElementById(
      "flex_container_up",
    ) as HTMLElement,
    flexContainerUpLeft: document.getElementById(
      "flex_container_up_left",
    ) as HTMLElement,
    flexContainerUpRight: document.getElementById(
      "flex_container_up_right",
    ) as HTMLElement,
    flexContainerBottom: document.getElementById(
      "flex_container_bottom",
    ) as HTMLElement,
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    if (element && window.sessionStorage) {
      const flexGrowValue = element.style.flexGrow || "1";
      window.sessionStorage.setItem(key, flexGrowValue);
    }
  });

  const rightOpenFlex = parsePositiveFlex(
    layoutElements.flexContainerUpRight?.style.flexGrow,
  );
  if (rightOpenFlex > 0 && window.sessionStorage) {
    window.sessionStorage.setItem(FLEX_UP_RIGHT_LAST_OPEN_KEY, String(rightOpenFlex));
  }
  const bottomOpenFlex = parsePositiveFlex(
    layoutElements.flexContainerBottom?.style.flexGrow,
  );
  if (bottomOpenFlex > 0 && window.sessionStorage) {
    window.sessionStorage.setItem(FLEX_BOTTOM_LAST_OPEN_KEY, String(bottomOpenFlex));
  }
};

const updateRightPanelToggleButton = (): void => {
  const button = document.getElementById(RIGHT_PANEL_TOGGLE_BUTTON_ID) as HTMLButtonElement | null;
  const rightPanel = document.getElementById("flex_container_up_right") as HTMLElement | null;
  if (!button || !rightPanel) {
    return;
  }
  const isOpen = parsePositiveFlex(rightPanel.style.flexGrow) > 0;
  button.textContent = isOpen ? ">" : "<";
  button.title = isOpen
    ? getA11yLabel("A11Y_COLLAPSE_CODE_PANEL")
    : getA11yLabel("A11Y_OPEN_CODE_PANEL");
  button.setAttribute(
    "aria-label",
    isOpen ? getA11yLabel("A11Y_COLLAPSE_CODE_PANEL") : getA11yLabel("A11Y_OPEN_CODE_PANEL"),
  );
  button.setAttribute("aria-expanded", isOpen ? "true" : "false");
};

const updateBottomPanelToggleButton = (): void => {
  const button = document.getElementById(BOTTOM_PANEL_TOGGLE_BUTTON_ID) as HTMLButtonElement | null;
  const bottomPanel = document.getElementById("flex_container_bottom") as HTMLElement | null;
  if (!button || !bottomPanel) {
    return;
  }
  const isOpen = parsePositiveFlex(bottomPanel.style.flexGrow) > 0;
  button.textContent = isOpen ? "v" : "^";
  button.title = isOpen
    ? getA11yLabel("A11Y_COLLAPSE_CONSOLE_PANEL")
    : getA11yLabel("A11Y_OPEN_CONSOLE_PANEL");
  button.setAttribute(
    "aria-label",
    isOpen ? getA11yLabel("A11Y_COLLAPSE_CONSOLE_PANEL") : getA11yLabel("A11Y_OPEN_CONSOLE_PANEL"),
  );
  button.setAttribute("aria-expanded", isOpen ? "true" : "false");
};

const toggleRightPanel = (): void => {
  const leftPanel = document.getElementById("flex_container_up_left") as HTMLElement | null;
  const rightPanel = document.getElementById("flex_container_up_right") as HTMLElement | null;
  if (!leftPanel || !rightPanel) {
    return;
  }

  const leftGrow = parsePositiveFlex(leftPanel.style.flexGrow, 1);
  const rightGrow = parsePositiveFlex(rightPanel.style.flexGrow, 0);

  if (rightGrow > 0) {
    window.sessionStorage?.setItem(FLEX_UP_RIGHT_LAST_OPEN_KEY, String(rightGrow));
    leftPanel.style.flexGrow = String(leftGrow + rightGrow);
    rightPanel.style.flexGrow = "0";
  } else {
    const reopenGrow = parsePositiveFlex(
      window.sessionStorage?.getItem(FLEX_UP_RIGHT_LAST_OPEN_KEY),
      1,
    );
    const total = leftGrow + rightGrow;
    const nextRightGrow = reopenGrow;
    const nextLeftGrow = total > nextRightGrow ? total - nextRightGrow : 1;
    leftPanel.style.flexGrow = String(nextLeftGrow);
    rightPanel.style.flexGrow = String(nextRightGrow);
  }

  saveLayoutToSessionStorage();
  updateRightPanelToggleButton();
  µcB_workspaceOnResize();
};

const toggleBottomPanel = (): void => {
  const upPanel = document.getElementById("flex_container_up") as HTMLElement | null;
  const bottomPanel = document.getElementById("flex_container_bottom") as HTMLElement | null;
  if (!upPanel || !bottomPanel) {
    return;
  }

  const upGrow = parsePositiveFlex(upPanel.style.flexGrow, 1);
  const bottomGrow = parsePositiveFlex(bottomPanel.style.flexGrow, 0);

  if (bottomGrow > 0) {
    window.sessionStorage?.setItem(FLEX_BOTTOM_LAST_OPEN_KEY, String(bottomGrow));
    upPanel.style.flexGrow = String(upGrow + bottomGrow);
    bottomPanel.style.flexGrow = "0";
  } else {
    const reopenGrow = parsePositiveFlex(
      window.sessionStorage?.getItem(FLEX_BOTTOM_LAST_OPEN_KEY),
      1,
    );
    const total = upGrow + bottomGrow;
    const nextBottomGrow = reopenGrow;
    const nextUpGrow = total > nextBottomGrow ? total - nextBottomGrow : 1;
    upPanel.style.flexGrow = String(nextUpGrow);
    bottomPanel.style.flexGrow = String(nextBottomGrow);
  }

  saveLayoutToSessionStorage();
  updateBottomPanelToggleButton();
  µcB_workspaceOnResize();
};

const initializeRightPanelToggleButton = (): void => {
  const horizontalResizer = document.querySelector(
    "#flex_container_up > flex-resizer",
  ) as HTMLElement | null;
  if (!horizontalResizer) {
    return;
  }
  if (document.getElementById(RIGHT_PANEL_TOGGLE_BUTTON_ID)) {
    updateRightPanelToggleButton();
    return;
  }

  const button = document.createElement("button");
  button.id = RIGHT_PANEL_TOGGLE_BUTTON_ID;
  button.type = "button";
  button.className = "flex-panel-toggle-button";
  button.textContent = ">";
  button.setAttribute("aria-controls", "flex_container_up_right");
  button.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    toggleRightPanel();
  });
  horizontalResizer.appendChild(button);
  updateRightPanelToggleButton();
};

const initializeBottomPanelToggleButton = (): void => {
  const verticalResizer = document.querySelector(
    "#container_page > flex-resizer",
  ) as HTMLElement | null;
  if (!verticalResizer) {
    return;
  }
  if (document.getElementById(BOTTOM_PANEL_TOGGLE_BUTTON_ID)) {
    updateBottomPanelToggleButton();
    return;
  }

  const button = document.createElement("button");
  button.id = BOTTOM_PANEL_TOGGLE_BUTTON_ID;
  button.type = "button";
  button.className = "flex-panel-toggle-button flex-panel-toggle-button--horizontal";
  button.textContent = "v";
  button.setAttribute("aria-controls", "flex_container_bottom");
  button.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    toggleBottomPanel();
  });
  verticalResizer.appendChild(button);
  updateBottomPanelToggleButton();
};

const updateResizerAriaValue = (resizer: HTMLElement): void => {
  const previous = resizer.previousElementSibling as HTMLElement | null;
  const next = resizer.nextElementSibling as HTMLElement | null;
  if (!previous || !next) return;
  const prevGrow = parsePositiveFlex(previous.style.flexGrow, 1);
  const nextGrow = parsePositiveFlex(next.style.flexGrow, 1);
  const total = prevGrow + nextGrow;
  const percentage = total > 0 ? Math.round((prevGrow / total) * 100) : 50;
  resizer.setAttribute("aria-valuemin", "0");
  resizer.setAttribute("aria-valuemax", "100");
  resizer.setAttribute("aria-valuenow", String(percentage));
};

const applyA11yAttributes = (): void => {
  if (elements.contentCode) {
    elements.contentCode.setAttribute("role", "region");
    elements.contentCode.setAttribute("aria-label", getA11yLabel("A11Y_GENERATED_CODE_REGION"));
    elements.contentCode.setAttribute("tabindex", "0");
  }
  const consoleElement = document.getElementById("content_console") as HTMLElement | null;
  if (consoleElement) {
    consoleElement.setAttribute("role", "log");
    consoleElement.setAttribute("aria-live", "polite");
    consoleElement.setAttribute("aria-relevant", "additions text");
    consoleElement.setAttribute("aria-label", getA11yLabel("A11Y_CONSOLE_REGION"));
    consoleElement.setAttribute("tabindex", "0");
  }
  const horizontalResizer = document.querySelector("#flex_container_up > flex-resizer") as HTMLElement | null;
  const verticalResizer = document.querySelector("#container_page > flex-resizer") as HTMLElement | null;
  if (horizontalResizer) {
    horizontalResizer.setAttribute("role", "separator");
    horizontalResizer.setAttribute("aria-orientation", "vertical");
    horizontalResizer.setAttribute("aria-label", getA11yLabel("A11Y_HORIZONTAL_RESIZER"));
    horizontalResizer.setAttribute("tabindex", "0");
    updateResizerAriaValue(horizontalResizer);
  }
  if (verticalResizer) {
    verticalResizer.setAttribute("role", "separator");
    verticalResizer.setAttribute("aria-orientation", "horizontal");
    verticalResizer.setAttribute("aria-label", getA11yLabel("A11Y_VERTICAL_RESIZER"));
    verticalResizer.setAttribute("tabindex", "0");
    updateResizerAriaValue(verticalResizer);
  }
  updateRightPanelToggleButton();
  updateBottomPanelToggleButton();
};

/**
 * Handles flex resizing via mouse drag.
 * @param mouseDown - Initial mouse down event on the resizer.
 * @param sizeProp - Size property to adjust ("offsetWidth" or "offsetHeight").
 * @param posProp - Mouse position property ("pageX" or "pageY").
 */
const µcB_workspaceManageResize = (
  mouseDown: Event,
  sizeProp: string,
  posProp: string,
): void => {
  const recall: HTMLElement = mouseDown.target as HTMLElement;
  const prev = recall?.previousElementSibling as HTMLInputElement | null;
  const next = recall?.nextElementSibling as HTMLInputElement | null;
  if (!prev || !next) {
    return;
  }
  mouseDown.preventDefault();
  interface IElement {
    [key: string]: string;
  }
  let prevSize: number = Number((prev as unknown as IElement)[sizeProp]);
  let nextSize: number = Number((next as unknown as IElement)[sizeProp]);
  const sumSize: number = prevSize + nextSize;
  const prevGrowParsed: number = Number(prev.style.flexGrow);
  const nextGrowParsed: number = Number(next.style.flexGrow);
  const prevGrow: number = Number.isFinite(prevGrowParsed) && prevGrowParsed > 0
    ? prevGrowParsed
    : 1;
  const nextGrow: number = Number.isFinite(nextGrowParsed) && nextGrowParsed > 0
    ? nextGrowParsed
    : 1;
  const sumGrow: number = prevGrow + nextGrow;
  if (!Number.isFinite(sumSize) || sumSize <= 0) {
    return;
  }
  let lastPos: number = Number((mouseDown as unknown as IElement)[posProp]);

  /**
   * Adjusts flex grow while dragging.
   * @param mouseMove - Mouse move event during resize.
   */
  const onMouseMove = (mouseMove: Event): void => {
    let pos: number = Number((mouseMove as unknown as IElement)[posProp]);
    const difference: number = pos - lastPos;
    prevSize += difference;
    nextSize -= difference;
    if (prevSize < 0) {
      nextSize += prevSize;
      pos -= prevSize;
      prevSize = 0;
    }
    if (nextSize < 0) {
      prevSize += nextSize;
      pos += nextSize;
      nextSize = 0;
    }
    const prevGrowNew: number = sumGrow * (prevSize / sumSize);
    const nextGrowNew: number = sumGrow * (nextSize / sumSize);
    if (!Number.isFinite(prevGrowNew) || !Number.isFinite(nextGrowNew)) {
      return;
    }
    prev.style.flexGrow = String(prevGrowNew);
    next.style.flexGrow = String(nextGrowNew);
    lastPos = pos;
    µcB_workspaceOnResize();
  };

  /**
   * Cleans up listeners and persists layout after resize.
   */
  const onMouseUp = (): void => {
    const html = document.querySelector("html") as HTMLElement;
    html.style.cursor = "default";
    if (String(posProp) === "pageX") {
      recall.style.cursor = "ew-resize";
    } else {
      recall.style.cursor = "ns-resize";
    }
    snapNearZeroFlex(prev, next);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    saveLayoutToSessionStorage();
    updateRightPanelToggleButton();
    updateBottomPanelToggleButton();
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

/**
 * Attaches mouse handlers to flex resizer elements.
 * @remarks
 * Detects resizer orientation from parent classes and delegates to the
 * resize handler.
 */
export const µcB_addFlexResizerEvents = (): void => {
  document.body.addEventListener("mousedown", function (mouseDown: Event) {
    const html = document.querySelector("html") as HTMLElement;
    const mouseTarget = mouseDown.target as HTMLElement;
    if (mouseTarget.nodeType !== 1 || mouseTarget.tagName !== "FLEX-RESIZER") {
      return;
    }
    const parentNode = mouseTarget.parentNode as HTMLElement;
    const resizeHorizontal: boolean =
      parentNode.classList.contains("wrapper_element");
    const resizeVertical: boolean =
      parentNode.classList.contains("wrapper_global");
    if (resizeHorizontal && resizeVertical) {
      return;
    } else if (resizeHorizontal) {
      mouseTarget.style.cursor = "col-resize";
      html.style.cursor = "col-resize"; // avoid cursor's flickering
      µcB_workspaceManageResize(mouseDown, "offsetWidth", "pageX");
    } else if (resizeVertical) {
      mouseTarget.style.cursor = "row-resize";
      html.style.cursor = "row-resize"; // avoid cursor's flickering
      µcB_workspaceManageResize(mouseDown, "offsetHeight", "pageY");
    }
    Blockly.svgResize(µcB.workspace as Blockly.WorkspaceSvg);
  });
  document.body.addEventListener("mouseup", () => {
    updateRightPanelToggleButton();
    updateBottomPanelToggleButton();
    const resizers = document.querySelectorAll("flex-resizer");
    resizers.forEach((resizer) => updateResizerAriaValue(resizer as HTMLElement));
  });
  document.body.addEventListener("keydown", (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target || target.tagName !== "FLEX-RESIZER") return;
    const previous = target.previousElementSibling as HTMLElement | null;
    const next = target.nextElementSibling as HTMLElement | null;
    if (!previous || !next) return;

    const parentNode = target.parentNode as HTMLElement;
    const isHorizontal = parentNode.classList.contains("wrapper_element");
    const isVertical = parentNode.classList.contains("wrapper_global");
    const step = event.shiftKey ? 0.2 : 0.1;

    let delta = 0;
    if (isHorizontal) {
      if (event.key === "ArrowLeft") delta = -step;
      else if (event.key === "ArrowRight") delta = step;
      else if (event.key === "Home") delta = -999;
      else if (event.key === "End") delta = 999;
    } else if (isVertical) {
      if (event.key === "ArrowUp") delta = -step;
      else if (event.key === "ArrowDown") delta = step;
      else if (event.key === "Home") delta = -999;
      else if (event.key === "End") delta = 999;
    }
    if (delta === 0) return;

    event.preventDefault();
    const prevGrow = parsePositiveFlex(previous.style.flexGrow, 1);
    const nextGrow = parsePositiveFlex(next.style.flexGrow, 1);
    const total = prevGrow + nextGrow;
    if (total <= 0) return;

    let nextPrevGrow = prevGrow + delta;
    if (delta <= -999) nextPrevGrow = 0;
    if (delta >= 999) nextPrevGrow = total;
    nextPrevGrow = Math.max(0, Math.min(total, nextPrevGrow));
    const nextNextGrow = Math.max(0, total - nextPrevGrow);
    previous.style.flexGrow = String(nextPrevGrow);
    next.style.flexGrow = String(nextNextGrow);
    saveLayoutToSessionStorage();
    updateRightPanelToggleButton();
    updateBottomPanelToggleButton();
    updateResizerAriaValue(target);
    µcB_workspaceOnResize();
  });
};

/**
 * Custom flyout inflater for category placeholders.
 */
class CategoryFlyoutInflater implements Blockly.IFlyoutInflater {
  /**
   * Creates a flyout item for category separators.
   * @param _state - Unused state data.
   * @param flyout - The flyout instance requesting items.
   */
  load(_state: object, flyout: Blockly.IFlyout): Blockly.FlyoutItem {
    void _state;
    const axis = flyout.horizontalLayout ? SeparatorAxis.X : SeparatorAxis.Y;
    const separator = new Blockly.FlyoutSeparator(0, axis);
    return new Blockly.FlyoutItem(separator, this.getType());
  }

  /**
   * Returns the gap after this item.
   * @param _state - Unused state data.
   * @param _defaultGap - Default gap size.
   */
  gapForItem(_state: object, _defaultGap: number): number {
    void _state;
    void _defaultGap;
    return 0;
  }

  /**
   * Disposes a flyout item.
   * @param _item - Item to dispose.
   */
  disposeItem(_item: Blockly.FlyoutItem): void {
    void _item;
    // No-op: empty placeholder item.
  }

  /**
   * Returns the registered type string.
   */
  getType(): string {
    return "category";
  }
}

/**
 * Registers components needed for the continuous toolbox.
 * @public
 * @remarks
 * Registers ContinuousCategory, ContinuousMetrics, ContinuousFlyout,
 * ContinuousToolbox, and custom flyout inflaters. Also injects CSS
 * for the continuous toolbox appearance.
 */
export const registerContinuousToolboxComponents = (): void => {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    ContinuousCategory,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.METRICS_MANAGER,
    "ContinuousMetrics",
    ContinuousMetrics,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
    "ContinuousFlyout",
    ContinuousFlyout,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX,
    "ContinuousToolbox",
    ContinuousToolbox,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "block",
    RecyclableBlockFlyoutInflater,
    true,
  );
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "category",
    CategoryFlyoutInflater,
    true,
  );

  // Ajouter les styles CSS pour surcharger l'apparence de la toolbox
  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 auto 0.125rem;
      border-radius: 100%;
      border: 1px solid;
      width: 1.25rem;
      height: 1.25rem;
    }
    .blocklyToolboxCategory {
      height: initial;
      padding: 3px 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: column;
    }
    .blocklyTreeLabel {
      margin: auto;
    }
    .blocklyToolboxCategoryLabel {
      text-align: center;
    }
  `;
  document.head.appendChild(style);
};

/**
 * Unregisters continuous toolbox components and restores defaults.
 * @public
 * @remarks
 * Removes custom CSS styles, restores standard Blockly categories
 * and flyout inflaters, and unregisters the continuous toolbox components.
 */
export const unregisterContinuousToolboxComponents = (): void => {
  // Supprimer les styles CSS personnalisés pour revenir au style normal de Blockly
  const customStyles = document.querySelectorAll("style");
  customStyles.forEach((style) => {
    if (style.textContent?.includes(".categoryBubble")) {
      style.remove();
    }
  });
  // Restaurer la catégorie standard de Blockly
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    Blockly.ToolboxCategory,
    true,
  );
  // Restaurer l'inflater de bloc par défaut
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "block",
    Blockly.BlockFlyoutInflater,
    true,
  );
  // Supprimer l'inflater "category" spécifique à la toolbox continue
  try {
    Blockly.registry.unregister(Blockly.registry.Type.FLYOUT_INFLATER, "category");
  } catch {
    // Ignore if already unregistered
  }
  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 0.5rem 0 0;
      border-radius: 0%;
      width: 8px;
      height: 16px;
      min-height: 16px;
      flex-shrink: 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .blocklyToolboxCategoryLabel {
      vertical-align: middle;
    }
  `;
  document.head.appendChild(style);
};
/**
 * Wires UI controls (menus, toggles) to application behavior.
 */
const HTML_onChange = (): void => {
  elements.languageMenu.onchange = () => {
    const selectedBoardBeforeLanguageChange = elements.boardMenu.value;
    HTML_populateBoards();
    if (
      selectedBoardBeforeLanguageChange &&
      BOARD_PROFILES[selectedBoardBeforeLanguageChange] !== undefined
    ) {
      elements.boardMenu.value = selectedBoardBeforeLanguageChange;
    }
    const rtl: boolean = µcB.changeLanguage(true);
    µcB.WORKSPACE_OPTIONS["rtl"] = rtl;
    applyA11yAttributes();
    µcB.workspaceReboot();
  };

  elements.themeMenu.onchange = () => {
    syncUiPaletteTheme();
    µcB.changeTheme(elements.themeMenu.value);
  };

  elements.rendererMenu.onchange = () => {
    µcB.changeRenderer(elements.rendererMenu.value);
  };

  elements.boardMenu.onchange = () => {
    const boardValue = elements.boardMenu.value;
    window.sessionStorage?.setItem("paramBoard", boardValue);
    window.history.pushState(
      {},
      "µcB",
      addReplaceParamToUrl(window.location.search, "board", boardValue),
    );
  };

  elements.pluginMinimap.onchange = () => {
    const minimap = document.getElementsByClassName(
      "blockly-minimap",
    )[0] as HTMLElement | undefined;
    if (minimap) {
      minimap.style.visibility = elements.pluginMinimap.checked
        ? "visible"
        : "hidden";
    }
    setPluginsInURL("pluginMinimap", "minimap");
  };

  elements.pluginHighlight.onchange = () => {
    if (elements.pluginHighlight.checked) {
      µcB.plugin_contentHighlight = new ContentHighlight(µcB.workspace);
      µcB.plugin_contentHighlight.init();
    } else {
      µcB.plugin_contentHighlight.dispose();
    }
    setPluginsInURL("pluginHighlight", "highlight");
  };

  // Save/Load file handlers
  if (elements.saveButton) {
    elements.saveButton.onclick = () => {
      const filename = `workspace_${new Date().toISOString().slice(0, 10)}.json`;
      µcB.workspaceSaveToFile(filename);
    };
  }

  if (elements.loadButton && elements.loadFileInput) {
    elements.loadButton.onclick = () => {
      elements.loadFileInput.click();
    };

    elements.loadFileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const hasExistingBlocks = µcB.workspaceHasAnyBlocks();
        const currentLang = getLangParamFromUrl();
        const mergeMessage = currentLang === 'fr'
          ? 'Le workspace contient déjà des blocs.\n\nCliquez sur "OK" pour fusionner avec les blocs existants.\nCliquez sur "Annuler" pour remplacer tous les blocs.'
          : currentLang === 'es'
          ? 'El workspace ya contiene bloques.\n\nHaga clic en "OK" para fusionar con los bloques existentes.\nHaga clic en "Cancelar" para reemplazar todos los bloques.'
          : currentLang === 'ar'
          ? 'يحتوي مساحة العمل بالفعل على كتل.\n\nانقر فوق "موافق" للدمج مع الكتل الموجودة.\nانقر فوق "إلغاء" لاستبدال جميع الكتل.'
          : 'The workspace already contains blocks.\n\nClick "OK" to merge with existing blocks.\nClick "Cancel" to replace all blocks.';
        const merge = hasExistingBlocks ? confirm(mergeMessage) : false;
        µcB.workspaceLoadFromFile(file, merge);
        // Reset input value to allow reloading the same file
        target.value = '';
      }
    };
  }

  elements.undoButton.onclick = () => {
    const workspace = µcB.workspace as Blockly.WorkspaceSvg | undefined;
    if (workspace) {
      workspace.undo(false);
    }
  };

  elements.redoButton.onclick = () => {
    const workspace = µcB.workspace as Blockly.WorkspaceSvg | undefined;
    if (workspace) {
      workspace.undo(true);
    }
  };

  elements.pluginContinuousToolbox.onchange = () => {
    if (elements.pluginContinuousToolbox.checked) {
      registerContinuousToolboxComponents();
      µcB.WORKSPACE_OPTIONS["plugins"] = {
        flyoutsVerticalToolbox: "ContinuousFlyout",
        metricsManager: "ContinuousMetrics",
        toolbox: "ContinuousToolbox",
      };
    } else {
      unregisterContinuousToolboxComponents();
      delete µcB.WORKSPACE_OPTIONS["plugins"];
    }
    setPluginsInURL("pluginContinuousToolbox", "ctoolbox");
    µcB.workspaceReboot();
  };

  elements.alwaysOpenedToolboxFlyout.onchange = () => {
    µcB.applyAlwaysOpenedToolboxFlyout();
    setPluginsInURL("alwaysOpenedToolboxFlyout", "flyout");
  };

  elements.codeEditorSwitch.onchange = () => {
    if (elements.codeEditorSwitch.checked) {
      if (elements.contentCode) elements.contentCode.style.display = "none";
      if (elements.contentMonacoEditor) {
        elements.contentMonacoEditor.style.display = "block";
        elements.contentMonacoEditor.style.height = "100%";
        elements.contentMonacoEditor.style.width = "100%";
        void µcB_codeEditor.ensureInitialized(elements.contentMonacoEditor);
      }
    } else {
      if (elements.contentCode) elements.contentCode.style.display = "block";
      if (elements.contentMonacoEditor) {
        elements.contentMonacoEditor.style.display = "none";
      }
    }
    setPluginsInURL("codeEditorSwitch", "codeEditor");
  };

  elements.debugSwitch.onchange = () => {
    const enabled = elements.debugSwitch.checked;
    (globalThis as { __UCB_DEBUG__?: boolean }).__UCB_DEBUG__ = enabled;
    try {
      if (enabled) {
        window.localStorage?.setItem("ucbDebug", "1");
      } else {
        window.localStorage?.removeItem("ucbDebug");
      }
    } catch {
      // Ignore storage errors
    }
    setPluginsInURL("debugSwitch", "debug");
  };
};

/**
 * Clears saved state and reloads the application to defaults.
 */
const resetAllParameters = (): void => {
  µcB.workspaceSetupPlugins(true);
  µcB.workspace.dispose();

  // Effacer toutes les données du sessionStorage
  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }
  // Effacer toutes les données du localStorage (si utilisé)
  if (window.localStorage) {
    window.localStorage.clear();
  }

  // Réinitialiser les tailles des divs aux valeurs par défaut
  document.getElementById("flex_container_up_right")!.style.flexGrow = "0";
  document.getElementById("flex_container_bottom")!.style.flexGrow = "0";
  document.getElementById("flex_container_up")!.style.flexGrow = "1";
  document.getElementById("flex_container_up_left")!.style.flexGrow = "1";

  const originalToolbox = µcB.stripCustomCategoriesForContinuousToolbox();
  µcB.workspace = Blockly.inject(
    document.getElementById("div_workspace_content_blockly")!,
    µcB.WORKSPACE_OPTIONS,
  );
  µcB.restoreWorkspaceAfterInject();
  µcB.workspaceSetupPlugins(false);
  µcB.restoreToolboxAfterInject(originalToolbox);

  // Recharger la page sur la racine
  window.location.href = "/";
};

/**
 * Executes a callback when the DOM is ready.
 * @param callback - Function to execute after DOM is loaded.
 */
const DomIsLoaded = (callback: () => void): void => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};

/**
 * Defers non-critical DOM initialization work.
 * @param callback - Work to schedule when idle or after a short timeout.
 */
const scheduleNonCriticalDomInit = (callback: () => void): void => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }
  setTimeout(callback, 0);
};
// The `DomIsLoaded` function prepares everything needed by structure of DOM.
DomIsLoaded((): void => {
  // Définir les blocs de variables typées après que Blockly soit chargé
  if (ENABLE_TYPED_VARIABLE_BLOCKS) {
    if (defineTypedVariableBlocks()) {
      debugLog('✅ Blocs de variables typées définis au bon moment');
    } else {
      debugLog('⚠️ Blockly pas encore disponible, retry dans 100ms...');
      // Retry après un délai
      setTimeout(() => {
        if (defineTypedVariableBlocks()) {
          debugLog('✅ Blocs de variables typées définis après retry');
        } else {
          console.error('❌ Impossible de définir les blocs de variables typées');
        }
      }, 100);
    }
  }

  // Appliquer les types de blocs depuis le registre
  if (typeof Blockly !== 'undefined') {
    if (ENABLE_BLOCK_TYPES_REGISTRY) {
      applyBlockTypesFromRegistry();
    }
    if (ENABLE_CONFIGURE_STANDARD_BLOCKS) {
      // Configurer les blocs standards (controls_if, procédures, etc.)
      configureStandardBlocks();
    }
  }

  HTML_populateLanguages(µcB);
  HTML_populateBoards();
  syncUiPaletteTheme();
  initializeRightPanelToggleButton();
  initializeBottomPanelToggleButton();
  applyA11yAttributes();
  µcB.changeLanguage(false);
  µcB.workspaceInit();
});

/* The `window.onload` event is triggered when the entire page has finished loading, including all
resources such as images and scripts. */
window.onload = (): void => {
  // Blockly et arduinoGenerator sont déjà exposés globalement
  debugLog('🔄 window.onload - Vérification des composants...');

  // S'assurer que les blocs de variables typées sont définis
  if (
    ENABLE_TYPED_VARIABLE_BLOCKS &&
    (!Blockly.Blocks['variables_get_dynamic'] || !Blockly.Blocks['variables_set_dynamic'])
  ) {
    debugLog('🔄 Redéfinition des blocs de variables typées dans window.onload...');
    defineTypedVariableBlocks();
  }

  HTML_onChange();
  const code = arduinoGenerator.workspaceToCode(µcB.workspace);
  µcB_codeEditor.setValue(code);
  if (elements.contentCode) {
    elements.contentCode.textContent = code;
  }

  // Ensure layout is restored before startup sizing/reflow.
  restoreLayoutFromSessionStorage();

  // Attendre que le DOM soit complètement stabilisé avant d'appeler workspaceOnResize
  // Utiliser requestAnimationFrame pour s'assurer que le layout est calculé
  requestAnimationFrame(() => {
    µcB_workspaceOnResize();
    // Prevent startup events/reboots from overwriting saved blocks with an empty workspace.
    µcB.setAutoSaveEnabled(false);
    µcB.setParamsBlockly();
    syncUiPaletteTheme();
    µcB.pluginsSetupWorkspace();
    // Initialize plugins first so minimap observes restore events, like historical behavior.
    µcB.workspaceSetupPlugins(false);
    // Restore only after startup params/plugins are applied (they may reboot workspace).
    µcB.workspaceLoadBlocks("mainWorkspace_blocks");
    (µcB.workspace as Blockly.WorkspaceSvg).scrollCenter();
    µcB.setAutoSaveEnabled(true);
    scheduleNonCriticalDomInit(() => {
      // Initialize minimap
      const minimap = document.getElementsByClassName(
        "blockly-minimap",
      )[0] as HTMLElement;
      const searchParams = new URLSearchParams(window.location.search);
      const paramsURL = searchParams.get("options")
        ? searchParams.get("options")!.split(",").filter(Boolean)
        : [];
      const minimapParam = searchParams.get("minimap");
      const minimapFromUrl = minimapParam !== null
        && minimapParam !== "0"
        && minimapParam !== "false";
      const minimapEnabled =
        window.sessionStorage.getItem("pluginMinimap") === "true" ||
        paramsURL.includes("minimap") ||
        minimapFromUrl;
      if (minimap) {
        minimap.style.visibility = minimapEnabled ? "visible" : "hidden";
        elements.pluginMinimap.checked = minimapEnabled;
      }

      const continuousEnabled =
        window.sessionStorage.getItem("pluginContinuousToolbox") === "true" ||
        new URLSearchParams(window.location.search)
          .get("options")
          ?.split(",")
          .includes("ctoolbox");
      if (!continuousEnabled) {
        // Initialize toolbox categories for standard toolbox
        const categories = Array.from(
          document.getElementsByClassName(
            "blocklyTreeRowContentContainer",
          ) as HTMLCollectionOf<HTMLElement>,
        );
        categories.forEach((category) => {
          category.style.flexDirection = "row";
        });

        const toolboxContents = document.getElementsByClassName(
          "blocklyToolboxContents",
        )[0] as HTMLElement;
        if (toolboxContents) {
          toolboxContents.style.alignItems = "start";
        }
      }

      // Attacher l'événement de clic sur le titre pour réinitialiser tous les paramètres
      const titleElement = document.getElementById("title");
      if (titleElement) {
        titleElement.addEventListener("click", resetAllParameters);
        // Ajouter un style pour indiquer que c'est cliquable
        titleElement.style.cursor = "pointer";

        // Créer un span avec la classe lang pour la traduction automatique
        const titleSpan = document.createElement("span");
        titleSpan.className = "lang";
        titleSpan.setAttribute("key", "RESET_TITLE");
        titleSpan.textContent = "Click to reset all parameters";

        // Appliquer la traduction selon la langue actuelle
        const currentLang = getLangParamFromUrl();
        HTML_changeLanguage(currentLang);

        // Définir le tooltip avec le texte traduit
        titleElement.title = titleSpan.textContent;
      }
    });
  });

};

/* The above code is a TypeScript code snippet that sets the `onbeforeunload` event handler for the
window object. This event is triggered when the user is about to leave the current page, and save windows position in UI. */
window.onbeforeunload = (): void => {
  saveLayoutToSessionStorage();
  µcB.workspaceSaveBlocks("mainWorkspace_blocks");
};
